#!/usr/bin/env python3
"""
Builds the Slevomat project token: a tilted card with the logo on it, as ONE self-contained SVG
(the logo's paths are inlined, because an SVG shown through <img> can't load other files).
It stands next to the other tokens (generali.webp, tas-project-showcase.webp, ...) in the repo root.

    python3 _tools/slevomat-token.py            # white card, logo in its own blue
    python3 _tools/slevomat-token.py blue       # blue card, white logo

Reads  slevomat-logo.svg  (repo root), writes  slevomat-project-showcase.svg  (repo root).
The card is a flat rounded rectangle put in perspective with plain maths (tilt, turn, thickness,
two shadows, a sheen), so it can be redrawn in any colour without a 3D tool.
"""
import math
import pathlib
import re
import sys

variant = sys.argv[1] if len(sys.argv) > 1 else 'white'
root = pathlib.Path(__file__).resolve().parents[1]
logo = (root / 'slevomat-logo.svg').read_text()
paths = re.findall(r'<path d="([^"]+)"', logo)
vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', logo)
LW, LH = float(vb.group(1)), float(vb.group(2))
BRAND = re.search(r'fill="(#[0-9A-Fa-f]{6})"', logo).group(1)

# ---- the card in its own plane, and how it stands in the picture
W, H, R = 740.0, 500.0, 54.0          # size and corner radius of the card
TURN = math.radians(-24)              # turned on the table: the right side is higher
TILT = math.radians(34)               # the top edge leans away
DIST = 1500.0                         # camera distance: the smaller, the stronger the perspective
CX, CY = 508.0, 462.0                 # where the card's centre lands in the 1024 picture
THICK = 18                            # the visible thickness, in screen pixels


def project(x, y):
    xr = x * math.cos(TURN) - y * math.sin(TURN)
    yr = x * math.sin(TURN) + y * math.cos(TURN)
    z = -yr * math.sin(TILT)
    s = DIST / (DIST + z)
    return CX + xr * s, CY + yr * math.cos(TILT) * s


def outline(n=14):
    hw, hh = W / 2, H / 2
    pts = []
    for cx, cy, a0 in [(hw - R, -hh + R, -90), (hw - R, hh - R, 0), (-hw + R, hh - R, 90), (-hw + R, -hh + R, 180)]:
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append(project(cx + R * math.cos(a), cy + R * math.sin(a)))
    return pts


def path(pts):
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ' Z'


def mix(a, b, t):
    pa = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    pb = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(pa[i] + (pb[i] - pa[i]) * t):02x}' for i in range(3))


pts = outline()
face = path(pts)
xs = [p[0] for p in pts]
ys = [p[1] for p in pts]
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)

if variant == 'blue':
    light, dark, mark = '#2b95e0', '#005c9f', '#ffffff'
    rim_hi, rim_lo = '#8cd0ff', '#003f70'
    edge_top, edge_deep = '#0a5d9c', '#033b66'
else:
    light, dark, mark = '#fcfbf8', '#dcd9d1', BRAND
    rim_hi, rim_lo = '#ffffff', '#a39f96'
    edge_top, edge_deep = '#d6d3cb', '#a8a49b'

# ---- the logo, laid on the card: the plane's local stretch at the card's centre
ox, oy = project(0, 0)
ax, ay = project(1, 0)
bx, by = project(0, 1)
a, b = ax - ox, ay - oy
c, d = bx - ox, by - oy
k = 0.60 * H / LH                     # the mark is a little over half as tall as the card
tx = ox - k * (a * LW / 2 + c * LH / 2)
ty = oy - k * (b * LW / 2 + d * LH / 2)
matrix = f'matrix({a * k:.5f} {b * k:.5f} {c * k:.5f} {d * k:.5f} {tx:.2f} {ty:.2f})'

layers = []
steps = THICK
for i in range(steps, 0, -1):
    t = i / steps
    layers.append(f'<path d="{face}" transform="translate({0.22 * i:.2f} {1.0 * i:.2f})" fill="{mix(edge_top, edge_deep, t)}"/>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
<filter id="far" x="-40%" y="-40%" width="180%" height="190%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="near" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="8"/></filter>
<linearGradient id="face" gradientUnits="userSpaceOnUse" x1="{x0:.0f}" y1="{y0:.0f}" x2="{x1:.0f}" y2="{y1:.0f}"><stop offset="0" stop-color="{light}"/><stop offset="1" stop-color="{dark}"/></linearGradient>
<linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="{x0:.0f}" y1="{y0:.0f}" x2="{x1:.0f}" y2="{y1:.0f}"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".38" stop-color="#fff" stop-opacity=".14"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="rim" gradientUnits="userSpaceOnUse" x1="{x0:.0f}" y1="{y0:.0f}" x2="{x1:.0f}" y2="{y1:.0f}"><stop offset="0" stop-color="{rim_hi}"/><stop offset=".55" stop-color="{rim_hi}" stop-opacity=".25"/><stop offset="1" stop-color="{rim_lo}" stop-opacity=".6"/></linearGradient>
<clipPath id="card"><path d="{face}"/></clipPath>
</defs>
<path d="{face}" transform="translate(30 62)" fill="#0b1b2a" opacity=".26" filter="url(#far)"/>
<path d="{face}" transform="translate(8 {THICK + 10})" fill="#0b1b2a" opacity=".42" filter="url(#near)"/>
{chr(10).join(layers)}
<path d="{face}" fill="url(#face)"/>
<g clip-path="url(#card)"><rect x="{x0:.0f}" y="{y0:.0f}" width="{x1 - x0:.0f}" height="{y1 - y0:.0f}" fill="url(#sheen)"/></g>
<path d="{face}" fill="none" stroke="url(#rim)" stroke-width="3"/>
<g transform="{matrix}" fill="{mark}">
{chr(10).join(f'<path d="{p}"/>' for p in paths)}
</g>
</svg>
'''
out = root / 'slevomat-project-showcase.svg'
out.write_text(svg)
print(f'{out.name}: {len(svg) / 1024:.1f} KB, variant={variant}, brand={BRAND}')
