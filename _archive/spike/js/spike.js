/* ==========================================================================
   M0 SPIKE — proves the core technique before anything is built on it:
     1. live DOM (CSS3DRenderer) shown through a transparent "hole" in the WebGL canvas
     2. EffectComposer + UnrealBloom must not break the hole's transparency
     3. "dock" camera pose maps 1 DOM px -> 1 CSS px (pixel-crisp text)
     4. pointer events reach the DOM only when docked
     5. GSAP Draggable / Flip keep correct maths under the 3D transform
   Throw-away harness: the pieces that survive become scene/stage.js, css3d.js,
   camera-rig.js, post.js in later milestones.
   ========================================================================== */
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const gsap = window.gsap;
const { Draggable, Flip, CustomEase } = window;
gsap.registerPlugin(Draggable, Flip, CustomEase);

/* ---------- constants (world units = metres) ---------- */
const params = new URLSearchParams(location.search);
const DOM_W = parseInt(params.get('dom') ?? '1024', 10);   // ?dom=512 -> smaller virtual screen, handy for 1:1 checks in a small pane
const DOM_H = Math.round(DOM_W * 3 / 4);
const SCREEN_W = 0.28;
const SCREEN_H = SCREEN_W * DOM_H / DOM_W;      // 0.21 — 4:3 CRT glass
const BEZEL = 0.045, FRAME_D = 0.06;
const CENTER = new THREE.Vector3(0, 0.17, 0);   // monitor group origin == screen centre
const HOLE_Z = 0.015;                            // glass sits 1.5 cm behind the lip front (front = +0.03)

const $ = (s) => document.querySelector(s);
const readout = $('#readout');
const screenEl = $('#screen');
const canvas = $('#gl');
screenEl.style.width = DOM_W + 'px';
screenEl.style.height = DOM_H + 'px';
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) { readout.textContent = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 1); }

try {
    boot();
} catch (err) {
    log('BOOT ERROR: ' + (err && err.stack || err));
    throw err;
}

function boot() {
    /* ---------- renderers ---------- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(DPR);
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = parseFloat(params.get('exp') ?? '0.7');

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(innerWidth, innerHeight);
    Object.assign(cssRenderer.domElement.style, { position: 'absolute', inset: '0' });
    $('#css3d').appendChild(cssRenderer.domElement);

    /* ---------- scenes ---------- */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0c0b);                       // opaque room => alpha 1 everywhere except the hole
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.3;

    const cssScene = new THREE.Scene();
    const cssObj = new CSS3DObject(screenEl);
    cssObj.position.set(CENTER.x, CENTER.y, CENTER.z + HOLE_Z);
    cssObj.scale.setScalar(SCREEN_W / DOM_W);                           // 1024 px -> 0.28 m
    cssScene.add(cssObj);
    screenEl.style.pointerEvents = 'none';
    screenEl.style.visibility = 'visible';

    /* ---------- the monitor (spike-grade geometry) ---------- */
    const plastic = new THREE.MeshPhysicalMaterial({ color: 0xd9d1bd, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.45 });
    const monitor = new THREE.Group();
    monitor.position.copy(CENTER);
    scene.add(monitor);

    const addBeam = (w, h, x, y) => {
        const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, FRAME_D, 5, 0.009), plastic);
        m.position.set(x, y, 0);
        monitor.add(m);
        return m;
    };
    const ow = SCREEN_W + BEZEL * 2, oh = SCREEN_H + BEZEL * 2;
    addBeam(ow, BEZEL, 0, SCREEN_H / 2 + BEZEL / 2);
    addBeam(ow, BEZEL, 0, -SCREEN_H / 2 - BEZEL / 2);
    addBeam(BEZEL, SCREEN_H, -SCREEN_W / 2 - BEZEL / 2, 0);
    addBeam(BEZEL, SCREEN_H, SCREEN_W / 2 + BEZEL / 2, 0);
    const back = new THREE.Mesh(new RoundedBoxGeometry(ow - 0.05, oh - 0.05, 0.26, 5, 0.035), plastic);
    back.position.set(0, 0, -FRAME_D / 2 - 0.12);
    monitor.add(back);

    /* THE HOLE: writes rgba(0,0,0,0) so the CSS3D layer underneath shows through */
    const hole = new THREE.Mesh(
        new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
        new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, blending: THREE.NoBlending, side: THREE.DoubleSide, toneMapped: false })
    );
    hole.position.set(0, 0, HOLE_Z);
    monitor.add(hole);

    /* the CRT glass: alpha-over the DOM (scanlines w/ anti-moire, vignette, diagonal glare) */
    const glassMat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, toneMapped: false,
        uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(DOM_W, DOM_H) } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: [
            'varying vec2 vUv; uniform float uTime; uniform vec2 uRes;',
            'void main(){',
            '  float line = vUv.y * uRes.y;',
            '  float aa = fwidth(line);',
            '  float scan = (1.0 - (0.5 + 0.5 * sin(line * 6.2831853))) * 0.14 * (1.0 - smoothstep(0.45, 0.95, aa));',
            '  vec2 c = vUv - 0.5;',
            '  float vig = smoothstep(0.30, 0.78, length(c * vec2(1.0, 1.18))) * 0.42;',
            '  float glare = smoothstep(0.30, 0.0, abs(vUv.x * 0.9 + vUv.y * 0.55 - 0.95)) * 0.09;',
            '  float flick = 0.012 * sin(uTime * 55.0);',
            '  float dark = clamp(scan + vig + flick, 0.0, 0.9);',
            '  float alpha = clamp(dark + glare, 0.0, 0.92);',
            '  vec3 col = vec3(glare / max(alpha, 1e-4));',
            '  gl_FragColor = vec4(col, alpha);',
            '}'
        ].join('\n')
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), glassMat);
    glass.position.set(0, 0, HOLE_Z + 0.0008);
    glass.renderOrder = 2;
    monitor.add(glass);

    /* optional HDR strip on the inner lip — bloom must spill onto the DOM, not punch holes */
    const glow = new THREE.Group();
    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 1.4, 1.8), toneMapped: false });
    const gl = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.004), glowMat); m.position.set(x, y, HOLE_Z + 0.004); glow.add(m); };
    gl(SCREEN_W + 0.004, 0.004, 0, SCREEN_H / 2 + 0.002);
    gl(SCREEN_W + 0.004, 0.004, 0, -SCREEN_H / 2 - 0.002);
    gl(0.004, SCREEN_H, -SCREEN_W / 2 - 0.002, 0);
    gl(0.004, SCREEN_H, SCREEN_W / 2 + 0.002, 0);
    glow.visible = false;
    monitor.add(glow);

    /* context: base, keyboard, desk, a warm bulb (bloom target) */
    const baseMesh = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.03, 0.2, 4, 0.01), plastic);
    baseMesh.position.set(0, -CENTER.y + 0.015, -0.03);
    monitor.add(baseMesh);
    const kbd = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.022, 0.15, 4, 0.008), plastic);
    kbd.position.set(0, 0.011, 0.32);
    scene.add(kbd);
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshStandardMaterial({ color: 0x2b211a, roughness: 0.72 }));
    desk.rotation.x = -Math.PI / 2;
    scene.add(desk);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.4, 1.2), toneMapped: false }));
    bulb.position.set(0.52, 0.45, 0.1);
    scene.add(bulb);

    const key = new THREE.DirectionalLight(0xffe0b5, 1.0);
    key.position.set(0.8, 1.2, 1.0);
    scene.add(key);
    const warm = new THREE.PointLight(0xff9a50, 4, 4, 2);
    warm.position.copy(bulb.position);
    scene.add(warm);

    /* ---------- camera + poses ---------- */
    const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.02, 30);
    const POSES = {
        overview: { pos: [0.85, 0.62, 1.15], look: [0, 0.12, 0.05], fov: 34 },
        desk: { pos: [0, 0.22, 0.95], look: [0, 0.16, 0], fov: 30 },
        oblique: { pos: [0.42, 0.25, 0.52], look: [0, 0.17, 0.015], fov: 30 }
    };

    /** camera so that the DOM screen is front-parallel and 1 DOM px == 1 CSS px (or fitted into the viewport) */
    function computeDock() {
        const margin = 24;
        const fit = Math.min(1, (innerWidth - margin * 2) / DOM_W, (innerHeight - margin * 2) / DOM_H);
        const fov = 30;
        const t = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
        const d = (innerHeight / 2) * SCREEN_W / (DOM_W * fit * t);       // px per world unit at distance d = (H/2)/(d*t)
        const z = CENTER.z + HOLE_Z;
        return { pos: [CENTER.x, CENTER.y, z + d], look: [CENTER.x, CENTER.y, z], fov, fit };
    }

    const P = { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0, fov: 30, para: 1 };
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    let poseName = 'desk';
    let docked = false;
    const opt = {
        bloom: params.get('bloom') !== '0',
        glass: params.get('glass') !== '0',
        glow: params.get('glow') === '1',
        parallax: params.get('parallax') !== '0'
    };

    function applyPose() {
        const para = opt.parallax ? P.para : 0;
        camera.fov = P.fov;
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        camera.position.set(P.px + mouse.sx * 0.06 * para, P.py + mouse.sy * 0.035 * para, P.pz);
        camera.lookAt(P.lx, P.ly, P.lz);
    }

    function setDocked(on) {
        docked = on;
        screenEl.style.pointerEvents = on ? 'auto' : 'none';
        document.body.classList.toggle('docked', on);
        document.body.style.cursor = '';
    }

    function setPose(name, instant = false) {
        const tgt = name === 'dock' ? computeDock() : POSES[name];
        if (!tgt) return;
        poseName = name;
        if (name !== 'dock') setDocked(false);
        gsap.killTweensOf(P);
        const to = { px: tgt.pos[0], py: tgt.pos[1], pz: tgt.pos[2], lx: tgt.look[0], ly: tgt.look[1], lz: tgt.look[2], fov: tgt.fov, para: name === 'dock' ? 0 : 1 };
        const done = () => { if (name === 'dock') setDocked(true); };
        if (instant) { gsap.set(P, to); done(); } else { gsap.to(P, { ...to, duration: 1.6, ease: 'power3.inOut', onComplete: done }); }
    }

    /* ---------- post: RenderPass -> (bloom) -> OutputPass on an RGBA half-float MSAA target ---------- */
    const rt = new THREE.WebGLRenderTarget(innerWidth * DPR, innerHeight * DPR, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(DPR);
    composer.setSize(innerWidth, innerHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(innerWidth, innerHeight),
        parseFloat(params.get('bs') ?? '0.4'),     // strength
        parseFloat(params.get('br') ?? '0.5'),     // radius
        parseFloat(params.get('bt') ?? '1.3')      // threshold (linear HDR): diffuse plastic must stay below it
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    function syncOptions() {
        bloomPass.enabled = opt.bloom;
        glass.visible = opt.glass;
        glow.visible = opt.glow;
    }

    function resize() {
        renderer.setSize(innerWidth, innerHeight, false);
        cssRenderer.setSize(innerWidth, innerHeight);
        composer.setPixelRatio(DPR);
        composer.setSize(innerWidth, innerHeight);
        if (poseName === 'dock') setPose('dock', true);
    }
    addEventListener('resize', resize);

    /* ---------- loop ---------- */
    const dts = [];
    let last = performance.now();
    function renderOnce() {
        glassMat.uniforms.uTime.value = performance.now() / 1000;
        applyPose();
        cssRenderer.render(cssScene, camera);
        composer.render();
    }
    function frame(now) {
        requestAnimationFrame(frame);
        mouse.sx += (mouse.x - mouse.sx) * 0.06;
        mouse.sy += (mouse.y - mouse.sy) * 0.06;
        dts.push(now - last); last = now;
        if (dts.length > 180) dts.shift();
        renderOnce();
    }

    /* ---------- pointer: desk mode raycasts the monitor, dock mode lets the DOM take over ---------- */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hover = false;
    addEventListener('pointermove', (e) => {
        mouse.x = (e.clientX / innerWidth) * 2 - 1;
        mouse.y = -((e.clientY / innerHeight) * 2 - 1);
        if (docked) return;
        ndc.set(mouse.x, mouse.y);
        ray.setFromCamera(ndc, camera);
        hover = ray.intersectObject(monitor, true).length > 0 && !e.target.closest('#hud');
        document.body.style.cursor = hover ? 'pointer' : '';
    });
    addEventListener('pointerdown', (e) => {
        if (!docked && hover && !e.target.closest('#hud')) setPose('dock');
    });
    addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && docked) setPose('desk');
    });

    /* ---------- in-screen interactions ---------- */
    let clicks = 0;
    $('#btnClick').addEventListener('click', () => { $('#clickCount').textContent = ++clicks; });
    setInterval(() => {
        const d = new Date();
        $('#clock').textContent = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }, 1000);

    // window 1: GSAP Draggable (transform based) — does its maths survive the 3D parent?
    Draggable.create('#win1', { type: 'x,y', trigger: '#win1 .tb', bounds: '#screen .desk' });

    // window 2: custom drag — pointer delta / measured scale (the plan's fallback path)
    (function customDrag(win, handle) {
        let sx = 0, sy = 0, ox = 0, oy = 0, scale = 1;
        handle.addEventListener('pointerdown', (e) => {
            scale = screenEl.getBoundingClientRect().width / DOM_W;
            sx = e.clientX; sy = e.clientY; ox = win.offsetLeft; oy = win.offsetTop;
            try { handle.setPointerCapture(e.pointerId); } catch (_) { /* synthetic events have no active pointer */ }
            const move = (ev) => {
                win.style.left = ox + (ev.clientX - sx) / scale + 'px';
                win.style.top = oy + (ev.clientY - sy) / scale + 'px';
            };
            const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
            handle.addEventListener('pointermove', move);
            handle.addEventListener('pointerup', up);
        });
    })($('#win2'), $('#win2 .tb'));

    $('#btnFlipLayout').addEventListener('click', flipTest);

    /* ---------- measurements ---------- */
    function state() {
        const r = screenEl.getBoundingClientRect();
        const dock = computeDock();
        return {
            pose: poseName, docked,
            viewport: [innerWidth, innerHeight], dpr: DPR,
            screenRect: [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100],
            measuredScale: Math.round((r.width / DOM_W) * 10000) / 10000,
            expectedDockScale: Math.round(dock.fit * 10000) / 10000,
            cam: camera.position.toArray().map((v) => Math.round(v * 1000) / 1000),
            fov: Math.round(camera.fov * 10) / 10
        };
    }

    function projectPx(v3world) {
        const p = v3world.clone().project(camera);
        return { x: Math.round((p.x * 0.5 + 0.5) * canvas.width), y: Math.round((1 - (p.y * 0.5 + 0.5)) * canvas.height) };
    }

    /** reads the WebGL canvas alpha right after a render (same task, drawing buffer still valid) */
    function probe(overrides = {}) {
        const keep = { ...opt };
        Object.assign(opt, overrides);
        syncOptions();
        renderOnce();
        const w = canvas.width, h = canvas.height;
        const c2 = document.createElement('canvas');
        c2.width = w; c2.height = h;
        const ctx = c2.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(canvas, 0, 0);
        const at = (local) => {
            const p = projectPx(monitor.localToWorld(local.clone()));
            if (p.x < 0 || p.y < 0 || p.x >= w || p.y >= h) return 'offscreen';
            return Array.from(ctx.getImageData(p.x, p.y, 1, 1).data);
        };
        // bloom spill: rgba along the horizontal midline, N CSS px inside the hole's left edge
        const edge = projectPx(monitor.localToWorld(new THREE.Vector3(-SCREEN_W / 2, 0, HOLE_Z)));
        const spillLeft = [2, 8, 24, 64, 128].map((d) => {
            const x = Math.round(edge.x + d * DPR * (state().measuredScale || 1));
            return [d, Array.from(ctx.getImageData(x, edge.y, 1, 1).data)];
        });
        const out = {
            spillLeft,
            holeCenter: at(new THREE.Vector3(0, 0, HOLE_Z)),
            holeInsideTopEdge: at(new THREE.Vector3(0, SCREEN_H / 2 - 0.006, HOLE_Z)),
            holeInsideCorner: at(new THREE.Vector3(SCREEN_W / 2 - 0.006, SCREEN_H / 2 - 0.006, HOLE_Z)),
            lipFront: at(new THREE.Vector3(0, SCREEN_H / 2 + BEZEL / 2, FRAME_D / 2)),
            canvasCorner: Array.from(ctx.getImageData(4, 4, 1, 1).data)
        };
        Object.assign(opt, keep);
        syncOptions();
        return out;
    }

    function flipTest() {
        const boxes = Array.from(document.querySelectorAll('#boxes .box'));
        const before = boxes.map((b) => b.getBoundingClientRect());
        const st = Flip.getState(boxes);
        $('#boxes').classList.toggle('list');
        Flip.from(st, { duration: 0.8, ease: 'power2.inOut' });
        const after0 = boxes.map((b) => b.getBoundingClientRect());      // t=0: must still look like "before"
        const dev = before.map((r, i) => Math.max(
            Math.abs(r.left - after0[i].left), Math.abs(r.top - after0[i].top),
            Math.abs(r.width - after0[i].width), Math.abs(r.height - after0[i].height)));
        return { maxDeviationPx: Math.round(Math.max(...dev) * 100) / 100, boxes: boxes.length, scale: state().measuredScale };
    }

    function dragTest(sel) {
        const win = $(sel), tb = win.querySelector('.tb');
        const r0 = win.getBoundingClientRect();
        const t = tb.getBoundingClientRect();
        const x0 = t.left + t.width / 2, y0 = t.top + t.height / 2, dx = 80, dy = 40;
        const ev = (type, x, y) => new PointerEvent(type, {
            bubbles: true, cancelable: true, composed: true, pointerId: 1, pointerType: 'mouse', isPrimary: true,
            clientX: x, clientY: y, button: 0, buttons: type === 'pointerup' ? 0 : 1
        });
        tb.dispatchEvent(ev('pointerdown', x0, y0));
        tb.dispatchEvent(ev('pointermove', x0 + dx / 2, y0 + dy / 2));
        tb.dispatchEvent(ev('pointermove', x0 + dx, y0 + dy));
        tb.dispatchEvent(ev('pointerup', x0 + dx, y0 + dy));
        const r1 = win.getBoundingClientRect();
        return {
            pointerDeltaPx: [dx, dy],
            windowDeltaPx: [Math.round((r1.left - r0.left) * 100) / 100, Math.round((r1.top - r0.top) * 100) / 100],
            scale: state().measuredScale
        };
    }

    function fps() {
        const arr = dts.slice().sort((a, b) => a - b);
        const avg = dts.reduce((a, b) => a + b, 0) / Math.max(dts.length, 1);
        return { fps: Math.round(1000 / avg), avgMs: Math.round(avg * 10) / 10, p95Ms: Math.round((arr[Math.floor(arr.length * 0.95)] || 0) * 10) / 10, samples: dts.length };
    }

    async function selfTest() {
        const out = {};
        await document.fonts.ready;
        setPose('dock', true);
        await sleep(300);
        out.state = state();
        out.alpha = {
            bloomOff_glassOff: probe({ bloom: false, glass: false, glow: false }),
            bloomOn_glassOff: probe({ bloom: true, glass: false, glow: false }),
            bloomOn_glassOff_edgeGlow: probe({ bloom: true, glass: false, glow: true }),
            bloomOn_glassOn_edgeGlow: probe({ bloom: true, glass: true, glow: true })
        };
        out.flip = flipTest();
        await sleep(900);
        out.dragGsapWin1 = dragTest('#win1');
        out.dragCustomWin2 = dragTest('#win2');
        dts.length = 0;
        await sleep(2000);
        out.fps = fps();
        return out;
    }

    /* ---------- HUD wiring ---------- */
    document.querySelectorAll('#hud [data-pose]').forEach((b) => b.addEventListener('click', () => setPose(b.dataset.pose)));
    const bind = (id, key) => { const el = $(id); el.checked = opt[key]; el.addEventListener('change', () => { opt[key] = el.checked; syncOptions(); }); };
    bind('#optBloom', 'bloom'); bind('#optGlass', 'glass'); bind('#optGlow', 'glow'); bind('#optParallax', 'parallax');
    $('#btnMin').addEventListener('click', () => $('#hud').classList.toggle('min'));
    $('#btnSelf').addEventListener('click', async () => { log('running…'); log(await selfTest()); });
    $('#btnProbe').addEventListener('click', () => log(probe()));
    $('#btnFlip').addEventListener('click', () => log(flipTest()));
    $('#btnDrag').addEventListener('click', () => log({ gsapWin1: dragTest('#win1'), customWin2: dragTest('#win2') }));

    window.__spike = { setPose, state, probe, flipTest, dragTest, fps, selfTest, opt, syncOptions, renderer, camera, scene, composer, bloomPass, THREE };

    /* ---------- go ---------- */
    syncOptions();
    const startPose = params.get('pose') || 'desk';
    setPose(startPose, true);
    requestAnimationFrame(frame);
    document.fonts.ready.then(() => log(state()));
}
