const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const letters = [];

// Keep the heading's complete accessible name while animating its visible letters.
for (const line of document.querySelectorAll('.claim-line')) {
    const rest = Number(line.dataset.weightRest);
    const near = Number(line.dataset.weightNear);
    const words = line.textContent.trim().split(/\s+/);
    line.replaceChildren();

    words.forEach((word, index) => {
        if (index) line.append(' ');
        const wrapper = document.createElement('span');
        wrapper.className = 'weight-word';
        for (const character of word) {
            const element = document.createElement('span');
            element.className = 'weight-letter';
            element.textContent = character;
            wrapper.append(element);
            letters.push({ element, rest, near, value: rest, x: 0, y: 0 });
        }
        line.append(wrapper);
    });
}

let pointerX = Infinity;
let pointerY = Infinity;
let frame = 0;
let previousTime = 0;

function render(time) {
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
    const smoothing = 1 - Math.exp(-elapsed / 85);
    previousTime = time;
    frame = 0;
    let moving = false;

    for (const letter of letters) {
        const distance = Math.hypot(pointerX - letter.x, pointerY - letter.y);
        const proximity = Math.max(0, 1 - distance / 400);
        const target = letter.rest + (letter.near - letter.rest) * proximity;
        const difference = target - letter.value;
        letter.value = Math.abs(difference) < .15 ? target : letter.value + difference * smoothing;
        letter.element.style.setProperty('--letter-weight', letter.value.toFixed(2));
        moving ||= Math.abs(difference) >= .15;
    }

    if (moving) frame = requestAnimationFrame(render);
    else previousTime = 0;
}

function schedule() {
    if (motion.matches && !frame) frame = requestAnimationFrame(render);
}

function measure() {
    // Measure the resting layout so changes in glyph width do not feed back into the effect.
    for (const letter of letters) {
        letter.value = letter.rest;
        letter.element.style.removeProperty('--letter-weight');
    }
    for (const letter of letters) {
        const box = letter.element.getBoundingClientRect();
        letter.x = box.left + box.width / 2 + scrollX;
        letter.y = box.top + box.height / 2 + scrollY;
    }
    schedule();
}

function releasePointer() {
    pointerX = Infinity;
    pointerY = Infinity;
    schedule();
}

window.addEventListener('pointermove', event => {
    if (!motion.matches || event.pointerType === 'touch') return;
    pointerX = event.pageX;
    pointerY = event.pageY;
    schedule();
}, { passive: true });
document.documentElement.addEventListener('pointerleave', releasePointer);
window.addEventListener('blur', releasePointer);
window.addEventListener('scroll', releasePointer, { passive: true });
document.addEventListener('visibilitychange', releasePointer);
motion.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    pointerX = Infinity;
    pointerY = Infinity;
    measure();
});
window.addEventListener('resize', measure, { passive: true });
document.fonts.ready.then(measure);
measure();

// Each visit draws a different pen stroke. On exit, its tail follows the same path.
const strokes = [
    'M3 13 Q38 4 64 10 T117 7',
    'M3 14 C32 4 93 2 87 12 C83 20 53 18 67 10 Q88 1 117 9',
    'M3 12 Q15 3 27 11 T51 10 T75 9 T99 8 Q109 6 117 8',
    'M3 16 L57 12 Q71 11 48 7 T117 7'
];
let strokeIndex = 0;

for (const link of document.querySelectorAll('.profiles a')) {
    const path = link.querySelector('path');
    let animation;
    let active = false;
    let hovered = false;
    let focused = false;

    function animateStroke(from, to) {
        animation?.cancel();
        animation = path.animate([
            { strokeDashoffset: String(from) },
            { strokeDashoffset: String(to) }
        ], { duration: 500, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
        animation.finished.then(() => {
            if (to === 0 && !active) animateStroke(0, -1);
        }, () => {});
    }

    function update() {
        const next = hovered || focused;
        if (next === active) return;
        active = next;
        if (!motion.matches) {
            animation?.cancel();
            path.style.strokeDashoffset = active ? '0' : '1';
            return;
        }
        if (active) {
            path.setAttribute('d', strokes[strokeIndex++ % strokes.length]);
            animateStroke(1, 0);
        } else if (animation?.playState !== 'running') {
            animateStroke(0, -1);
        }
    }

    link.addEventListener('pointerenter', event => { hovered = event.pointerType !== 'touch'; update(); });
    link.addEventListener('pointerleave', () => { hovered = false; update(); });
    link.addEventListener('focus', () => { focused = link.matches(':focus-visible'); update(); });
    link.addEventListener('blur', () => { focused = false; update(); });
    motion.addEventListener('change', () => {
        animation?.cancel();
        path.style.strokeDashoffset = active ? '0' : '1';
    });
}

const contact = document.querySelector('.contact');
function sizeContact() {
    contact.style.setProperty('--contact-scale-x', (contact.offsetWidth + 12) / contact.offsetWidth);
    contact.style.setProperty('--contact-scale-y', (contact.offsetHeight + 6) / contact.offsetHeight);
}
new ResizeObserver(sizeContact).observe(contact);
sizeContact();
