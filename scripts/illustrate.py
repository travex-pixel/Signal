#!/usr/bin/env python3
"""
Procedural watercolour illustrations for SIGNAL.

Every plate is generated from simple silhouettes (pellets, ships, crackers,
coastlines) rendered with a watercolour model: deformed edges, layered
translucent washes, wet-edge darkening, pigment granulation and paper
grain. Colours are the Primaplas-derived region hues.

Run:  python3 scripts/illustrate.py
Writes PNG (alpha) files to public/illustrations/, plus a provenance JSON
beside each image describing how it was produced.

Requires: opencv-python-headless, numpy.
"""
from __future__ import annotations

import json
import math
import os
import sys

import cv2
import numpy as np

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "illustrations")
SIZE = (720, 540)  # width, height at 2x of the ~360x270 display size

HUES = {
    "sea": (0x40, 0xC2, 0xD5),
    "china": (0xEE, 0x5F, 0x5B),
    "usa": (0x20, 0x62, 0xAF),
    "middle-east": (0xFA, 0xBB, 0x14),
    "australia": (0x23, 0x1E, 0x4B),
    "global": (0x81, 0x87, 0xA3),
    "navy": (0x23, 0x1E, 0x4B),
    "coral": (0xEE, 0x5F, 0x5B),
    "cyan": (0x40, 0xC2, 0xD5),
    "yellow": (0xFA, 0xBB, 0x14),
    "blue": (0x20, 0x62, 0xAF),
    "slate": (0x81, 0x87, 0xA3),
}


# --------------------------------------------------------------------------
# Noise helpers
# --------------------------------------------------------------------------
def fractal_noise(rng: np.random.Generator, w: int, h: int, octaves: int = 5, base: int = 8) -> np.ndarray:
    """Value noise summed over octaves, normalised to 0..1."""
    acc = np.zeros((h, w), np.float32)
    amp = 1.0
    total = 0.0
    for o in range(octaves):
        n = base * (2**o)
        small = rng.random((n + 1, n + 1), dtype=np.float32)
        up = cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)
        acc += up * amp
        total += amp
        amp *= 0.5
    acc /= total
    acc -= acc.min()
    acc /= max(acc.max(), 1e-6)
    return acc


def deform(mask: np.ndarray, rng: np.random.Generator, strength: float = 10.0, scale: int = 6) -> np.ndarray:
    """Displace a mask with low-frequency noise so edges wander like a wet wash."""
    h, w = mask.shape
    dx = (fractal_noise(rng, w, h, 3, scale) - 0.5) * 2 * strength
    dy = (fractal_noise(rng, w, h, 3, scale) - 0.5) * 2 * strength
    xs, ys = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(mask, xs + dx, ys + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


# --------------------------------------------------------------------------
# Watercolour renderer
# --------------------------------------------------------------------------
def wash(canvas: np.ndarray, mask: np.ndarray, rgb: tuple[int, int, int], rng: np.random.Generator,
         layers: int = 4, opacity: float = 0.55, bleed: float = 12.0, granulation: float = 0.35) -> None:
    """Paint a watercolour wash of `rgb` through `mask` onto an RGBA float canvas.

    The model: a first broad, pale wash with wandering edges; later layers
    that pool as smaller blooms; pigment that collects at every wet edge
    (a darker rim), granulates into the paper's tooth, and darkens where
    layers overlap. Edges stay crisp: the softness of watercolour comes from
    the pigment distribution, not from blur.
    """
    h, w = mask.shape
    colour = np.array(rgb, np.float32) / 255.0
    paper = fractal_noise(rng, w, h, 5, 96)          # fine tooth
    grain = fractal_noise(rng, w, h, 3, 160)         # granulation speckle
    speckle = np.clip((grain - 0.55) * 4.0, 0, 1)    # sparse dark pigment grains
    flow = fractal_noise(rng, w, h, 4, 10)           # broad pooling

    for i in range(layers):
        first = i == 0
        m = deform(mask, rng, strength=bleed * (0.8 if first else 0.5 + 0.5 * rng.random()), scale=4 + i)
        if first:
            m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
        else:
            # Later layers pool into part of the shape: carve the mask with a pooling field.
            pool = (flow > (0.42 + 0.1 * rng.random())).astype(np.uint8) * 255
            pool = cv2.GaussianBlur(pool, (0, 0), 6)
            m = cv2.bitwise_and(m, pool)
            k = int(rng.integers(3, 9))
            m = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
        m = cv2.GaussianBlur(m, (0, 0), 0.9)
        mf = np.clip(m.astype(np.float32) / 255.0, 0, 1)
        if mf.max() <= 0:
            continue

        # Wet edge: pigment collects in a narrow rim just inside the boundary.
        inside = (mf > 0.5).astype(np.uint8)
        dist = cv2.distanceTransform(inside, cv2.DIST_L2, 5)
        rim = np.exp(-dist / (3.5 + rng.random() * 2.5))
        halo = np.exp(-dist / (14.0 + rng.random() * 8.0))
        body = 0.42 + 0.18 * flow
        density = body + 0.55 * rim + 0.2 * halo
        density *= 0.86 + 0.28 * paper                      # paper tooth
        density += granulation * 0.9 * speckle              # granulation grains
        density = np.clip(density, 0, 1.6)
        alpha = np.clip(mf * density * (opacity / layers) * 1.9, 0, 1)

        # Rim pigment is a little deeper and more saturated than the body.
        deep = np.clip(colour * 0.72, 0, 1)
        layer_rgb = colour[None, None, :] * (1 - 0.6 * rim[..., None]) + deep[None, None, :] * (0.6 * rim[..., None])
        drift = (rng.random(3) - 0.5) * 0.05
        layer_rgb = np.clip(layer_rgb + drift, 0, 1)

        a_dst = canvas[..., 3]
        a_out = alpha + a_dst * (1 - alpha)
        for c in range(3):
            src = layer_rgb[..., c]
            dst = canvas[..., c]
            # Pigment multiplies: overlaps darken, as glazes do.
            blended = np.where(a_dst > 0, dst * (1 - alpha) + (src * dst) * alpha * 0.7 + src * alpha * 0.3, src)
            canvas[..., c] = np.where(a_out > 0, (blended * a_out) / np.maximum(a_out, 1e-6), src)
        canvas[..., 3] = a_out


def new_canvas() -> np.ndarray:
    w, h = SIZE
    c = np.zeros((h, w, 4), np.float32)
    c[..., :3] = 1.0
    return c


def save(canvas: np.ndarray, name: str, prompt: str) -> None:
    os.makedirs(OUT, exist_ok=True)
    rgba = np.clip(canvas * 255, 0, 255).astype(np.uint8)
    bgra = cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA)
    path = os.path.join(OUT, f"{name}.png")
    cv2.imwrite(path, bgra, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    with open(f"{path}.json", "w", encoding="utf-8") as f:
        json.dump({"generator": "scripts/illustrate.py", "method": "procedural watercolour (OpenCV/numpy)",
                   "prompt": prompt, "size": SIZE}, f, indent=2)
    print(f"wrote {os.path.relpath(path)}")


# --------------------------------------------------------------------------
# Silhouettes
# --------------------------------------------------------------------------
def blank_mask() -> np.ndarray:
    w, h = SIZE
    return np.zeros((h, w), np.uint8)


def ellipse(mask: np.ndarray, cx: float, cy: float, rx: float, ry: float, angle: float = 0) -> None:
    cv2.ellipse(mask, (int(cx), int(cy)), (int(rx), int(ry)), angle, 0, 360, 255, -1)


def poly(mask: np.ndarray, pts: list[tuple[float, float]]) -> None:
    cv2.fillPoly(mask, [np.array(pts, np.int32)], 255)


def pellets(rng: np.random.Generator, n: int = 26, cx: float = 360, cy: float = 290, spread: float = 150) -> list[np.ndarray]:
    """A loose pile of polymer pellets: each pellet its own wash so colours vary."""
    masks = []
    for _ in range(n):
        ang = rng.random() * math.tau
        r = spread * math.sqrt(rng.random())
        x = cx + math.cos(ang) * r * 1.35
        y = cy + math.sin(ang) * r * 0.75 + (r / spread) * 25
        m = blank_mask()
        rr = 22 + rng.random() * 16
        ellipse(m, x, y, rr, rr * (0.7 + rng.random() * 0.3), rng.random() * 180)
        masks.append(m)
    return masks


def container_ship() -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Hull, superstructure and container stacks as three masks."""
    hull = blank_mask()
    poly(hull, [(60, 330), (660, 330), (620, 400), (110, 400)])
    bridge = blank_mask()
    poly(bridge, [(560, 330), (560, 240), (600, 240), (600, 330)])
    poly(bridge, [(555, 240), (605, 240), (605, 228), (555, 228)])
    boxes = blank_mask()
    x = 120
    for col in range(9):
        height = 2 + ((col * 7) % 3)
        for row in range(height):
            poly(boxes, [(x, 328 - row * 26), (x + 42, 328 - row * 26), (x + 42, 306 - row * 26), (x, 306 - row * 26)])
        x += 48
    return hull, bridge, boxes


def cracker_plant() -> tuple[np.ndarray, np.ndarray]:
    """Petrochemical plant: columns, spheres and a flare stack."""
    towers = blank_mask()
    for i, (x, hgt, wdt) in enumerate([(170, 250, 34), (230, 300, 26), (300, 200, 40), (420, 330, 22), (480, 230, 30)]):
        poly(towers, [(x, 420), (x + wdt, 420), (x + wdt, 420 - hgt), (x, 420 - hgt)])
        if i % 2 == 0:
            ellipse(towers, x + wdt / 2, 420 - hgt, wdt / 2, wdt / 2)
    poly(towers, [(120, 420), (620, 420), (620, 445), (120, 445)])
    spheres = blank_mask()
    ellipse(spheres, 560, 380, 48, 48)
    ellipse(spheres, 360, 395, 36, 36)
    ellipse(spheres, 90, 400, 30, 30)
    return towers, spheres


def strait() -> tuple[np.ndarray, np.ndarray]:
    """Two landmasses with a narrow channel between them: the chokepoint."""
    land = blank_mask()
    # Two landmasses held inside the frame with a margin, so the plate sits on the page as an object.
    poly(land, [(90, 90), (380, 70), (330, 150), (300, 220), (330, 300), (400, 380), (360, 470), (120, 480), (70, 300)])
    poly(land, [(640, 80), (470, 60), (430, 140), (380, 220), (420, 320), (470, 400), (520, 470), (650, 460), (680, 280)])
    water = blank_mask()
    poly(water, [(380, 70), (470, 60), (430, 140), (380, 220), (420, 320), (470, 400), (520, 470), (360, 470), (400, 380), (330, 300), (300, 220), (330, 150)])
    return land, water


def archipelago(rng: np.random.Generator) -> list[np.ndarray]:
    masks = []
    for (x, y, rx, ry, a) in [(170, 180, 90, 50, 20), (330, 260, 70, 40, -15), (470, 170, 60, 35, 35), (560, 330, 95, 55, 10), (250, 380, 55, 30, 0), (400, 420, 40, 24, 25)]:
        m = blank_mask()
        ellipse(m, x, y, rx, ry, a)
        # Small satellite islets
        for _ in range(3):
            ellipse(m, x + (rng.random() - 0.5) * rx * 2.6, y + (rng.random() - 0.5) * ry * 2.6, 12 + rng.random() * 10, 8 + rng.random() * 8, rng.random() * 90)
        masks.append(m)
    return masks


def globe() -> tuple[np.ndarray, np.ndarray]:
    disc = blank_mask()
    ellipse(disc, 360, 270, 200, 200)
    lines = blank_mask()
    for k in (-0.75, -0.4, 0, 0.4, 0.75):
        cv2.ellipse(lines, (360, 270), (int(200 * abs(k)) if k else 4, 200), 0, 0, 360, 255, 7)
    for k in (-0.6, -0.3, 0, 0.3, 0.6):
        cv2.ellipse(lines, (360, int(270 + 200 * k)), (int(200 * math.sqrt(1 - k * k)), 6), 0, 0, 360, 255, 7)
    lines = cv2.bitwise_and(lines, disc)
    return disc, lines


def coins() -> list[np.ndarray]:
    masks = []
    for i in range(7):
        m = blank_mask()
        y = 400 - i * 26
        cv2.ellipse(m, (330, y), (120, 36), 0, 0, 360, 255, -1)
        cv2.rectangle(m, (210, y), (450, y + 20), 255, -1)
        masks.append(m)
    return masks


def banknote_wave() -> list[np.ndarray]:
    """Two currencies as crossing ribbons: the exchange rate."""
    masks = []
    for (phase, y0) in [(0.0, 240), (math.pi, 310)]:
        m = blank_mask()
        pts = [(x, y0 + math.sin(x / 110 + phase) * 60) for x in range(60, 661, 10)]
        pts += [(x, y0 + 46 + math.sin(x / 110 + phase) * 60) for x in range(660, 59, -10)]
        poly(m, pts)
        masks.append(m)
    return masks


def hourglass_pellets(rng: np.random.Generator) -> tuple[np.ndarray, list[np.ndarray]]:
    frame = blank_mask()
    poly(frame, [(220, 90), (500, 90), (500, 110), (380, 265), (380, 275), (500, 430), (500, 450), (220, 450), (220, 430), (340, 275), (340, 265), (220, 110)])
    pel = []
    for _ in range(22):
        m = blank_mask()
        x = 360 + (rng.random() - 0.5) * 200
        y = 420 - abs(rng.random() - 0.5) * 120 - abs(x - 360) * 0.4
        ellipse(m, x, y, 14 + rng.random() * 8, 11 + rng.random() * 6, rng.random() * 180)
        pel.append(m)
    return frame, pel


def scales() -> tuple[np.ndarray, np.ndarray]:
    beam = blank_mask()
    poly(beam, [(350, 120), (370, 120), (370, 440), (350, 440)])
    poly(beam, [(120, 150), (600, 170), (600, 190), (120, 170)])
    poly(beam, [(260, 440), (460, 440), (480, 470), (240, 470)])
    pans = blank_mask()
    for (x, y) in [(140, 330), (590, 350)]:
        cv2.ellipse(pans, (x, y), (90, 22), 0, 0, 180, 255, -1)
        cv2.line(pans, (x, 160 + (y - 330)), (x - 70, y), 255, 4)
        cv2.line(pans, (x, 160 + (y - 330)), (x + 70, y), 255, 4)
    return beam, pans


def ledger() -> tuple[np.ndarray, list[np.ndarray]]:
    """A profit-and-loss waterfall: bars stepping down from revenue to profit."""
    base = blank_mask()
    poly(base, [(80, 440), (640, 440), (640, 448), (80, 448)])
    bars = []
    heights = [300, 120, 70, 50, 40, 90]
    x = 100
    top = 440 - heights[0]
    for i, h in enumerate(heights):
        m = blank_mask()
        if i == 0 or i == len(heights) - 1:
            poly(m, [(x, 440), (x + 70, 440), (x + 70, 440 - h), (x, 440 - h)])
        else:
            poly(m, [(x, top), (x + 70, top), (x + 70, top + h), (x, top + h)])
            top += h
        bars.append(m)
        x += 90
    return base, bars


# --------------------------------------------------------------------------
# Plates
# --------------------------------------------------------------------------
def plate_pellets(name: str, hue: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    base = HUES[hue]
    for m in pellets(rng):
        drift = tuple(int(np.clip(v + (rng.random() - 0.5) * 40, 0, 255)) for v in base)
        wash(c, m, drift, rng, layers=3, opacity=0.7, bleed=5, granulation=0.5)
    save(c, name, f"a loose pile of polymer pellets in {hue}, watercolour")


def plate_ship(name: str, hue: str, accent: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    hull, bridge, boxes = container_ship()
    wash(c, hull, HUES[hue], rng, layers=4, opacity=0.8, bleed=10)
    wash(c, bridge, HUES[hue], rng, layers=3, opacity=0.6, bleed=5)
    wash(c, boxes, HUES[accent], rng, layers=3, opacity=0.7, bleed=4, granulation=0.5)
    sea = blank_mask()
    ellipse(sea, 360, 420, 330, 40)
    wash(c, sea, HUES["cyan"], rng, layers=2, opacity=0.35, bleed=16)
    save(c, name, f"a laden container ship in {hue} with {accent} containers on a cyan sea, watercolour")


def plate_cracker(name: str, hue: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    towers, spheres = cracker_plant()
    wash(c, towers, HUES[hue], rng, layers=4, opacity=0.75, bleed=8)
    wash(c, spheres, HUES["slate"], rng, layers=3, opacity=0.6, bleed=8)
    smoke = blank_mask()
    ellipse(smoke, 440, 60, 60, 30, 10)
    ellipse(smoke, 500, 40, 45, 24, -10)
    wash(c, smoke, HUES["slate"], rng, layers=2, opacity=0.25, bleed=20)
    save(c, name, f"a petrochemical cracker with columns and spheres in {hue}, watercolour")


def plate_strait(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    land, water = strait()
    wash(c, land, HUES["yellow"], rng, layers=4, opacity=0.7, bleed=14, granulation=0.6)
    wash(c, water, HUES["cyan"], rng, layers=3, opacity=0.55, bleed=10)
    ship = blank_mask()
    poly(ship, [(390, 250), (440, 250), (436, 268), (394, 268)])
    wash(c, ship, HUES["navy"], rng, layers=2, opacity=0.85, bleed=2)
    save(c, name, "a narrow strait between two yellow landmasses with a single tanker, watercolour")


def plate_archipelago(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    sea = blank_mask()
    ellipse(sea, 360, 270, 330, 230)
    wash(c, sea, HUES["cyan"], rng, layers=2, opacity=0.28, bleed=24)
    for m in archipelago(rng):
        wash(c, m, HUES["cyan"], rng, layers=4, opacity=0.8, bleed=8, granulation=0.5)
    save(c, name, "an archipelago of cyan islands on a pale sea, watercolour")


def plate_globe(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    disc, lines = globe()
    wash(c, disc, HUES["slate"], rng, layers=3, opacity=0.45, bleed=12)
    wash(c, lines, HUES["navy"], rng, layers=2, opacity=0.7, bleed=3)
    save(c, name, "a globe drawn as meridians and parallels in slate and navy, watercolour")


def plate_coast(name: str, seed: int) -> None:
    """Australia as the home market: a navy continent-like mass with a coral harbour mark."""
    rng = np.random.default_rng(seed)
    c = new_canvas()
    land = blank_mask()
    poly(land, [(120, 200), (200, 120), (330, 100), (430, 130), (520, 110), (600, 180), (620, 280), (560, 380), (470, 430), (380, 410), (300, 440), (200, 400), (130, 320)])
    wash(c, land, HUES["navy"], rng, layers=3, opacity=0.42, bleed=14, granulation=0.6)
    mark = blank_mask()
    ellipse(mark, 540, 330, 16, 16)
    wash(c, mark, HUES["coral"], rng, layers=2, opacity=0.9, bleed=2)
    # Inbound pellets arriving from the north-west: the import lens.
    for i, hue in enumerate(["coral", "cyan", "yellow", "cyan", "coral"]):
        m = blank_mask()
        ellipse(m, 60 + i * 38, 80 + i * 22, 14, 12, rng.random() * 90)
        wash(c, m, HUES[hue], rng, layers=2, opacity=0.85, bleed=3)
    save(c, name, "a pale navy landmass with a coral harbour mark and inbound pellets, watercolour")


def plate_coins(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    for i, m in enumerate(coins()):
        hue = "yellow" if i % 3 else "coral"
        wash(c, m, HUES[hue], rng, layers=3, opacity=0.75, bleed=5, granulation=0.5)
    save(c, name, "a stack of yellow and coral coins, watercolour")


def plate_fx(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    a, b = banknote_wave()
    wash(c, a, HUES["blue"], rng, layers=3, opacity=0.7, bleed=10)
    wash(c, b, HUES["yellow"], rng, layers=3, opacity=0.7, bleed=10)
    save(c, name, "two crossing ribbons in blue and yellow, an exchange rate, watercolour")


def plate_inventory(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    frame, pel = hourglass_pellets(rng)
    wash(c, frame, HUES["navy"], rng, layers=3, opacity=0.6, bleed=6)
    for m in pel:
        wash(c, m, HUES["coral"], rng, layers=1, opacity=0.6, bleed=3)
    save(c, name, "an hourglass filling with coral pellets, watercolour")


def plate_scales(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    beam, pans = scales()
    wash(c, beam, HUES["navy"], rng, layers=3, opacity=0.7, bleed=6)
    wash(c, pans, HUES["cyan"], rng, layers=3, opacity=0.7, bleed=5)
    save(c, name, "a balance scale, navy beam and cyan pans, watercolour")


def plate_ledger(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    base, bars = ledger()
    wash(c, base, HUES["navy"], rng, layers=2, opacity=0.6, bleed=3)
    hues = ["navy", "coral", "coral", "coral", "coral", "cyan"]
    for h, m in zip(hues, bars):
        wash(c, m, HUES[h], rng, layers=3, opacity=0.75, bleed=5)
    save(c, name, "a waterfall chart from revenue down to profit, navy coral and cyan, watercolour")


def plate_freight(name: str, seed: int) -> None:
    rng = np.random.default_rng(seed)
    c = new_canvas()
    for i, (x, y, h) in enumerate([(150, 420, 3), (300, 420, 4), (450, 420, 2)]):
        for row in range(h):
            m = blank_mask()
            poly(m, [(x, y - row * 60), (x + 130, y - row * 60), (x + 130, y - 52 - row * 60), (x, y - 52 - row * 60)])
            wash(c, m, HUES[["coral", "blue", "yellow", "cyan"][(i + row) % 4]], rng, layers=3, opacity=0.75, bleed=5)
    save(c, name, "stacked shipping containers in coral blue yellow and cyan, watercolour")


def plate_cycle(name: str, seed: int) -> None:
    """The cash conversion cycle: a ring of beads, navy and cyan, with one coral bead for the day cash returns."""
    rng = np.random.default_rng(seed)
    c = new_canvas()
    ring = blank_mask()
    cv2.ellipse(ring, (360, 270), (190, 150), 0, 0, 360, 255, 10)
    wash(c, ring, HUES["slate"], rng, layers=2, opacity=0.45, bleed=4)
    n = 12
    for i in range(n):
        a = i / n * math.tau
        x = 360 + math.cos(a) * 190
        y = 270 + math.sin(a) * 150
        m = blank_mask()
        ellipse(m, x, y, 24, 20, rng.random() * 90)
        hue = "coral" if i == 0 else ("cyan" if i % 3 else "navy")
        wash(c, m, HUES[hue], rng, layers=3, opacity=0.8, bleed=4, granulation=0.5)
    save(c, name, "a ring of twelve beads, navy and cyan with one coral, the cash conversion cycle, watercolour")


def plate_price_steps(name: str, seed: int) -> None:
    """A supplier price increase: rising coral steps with a cyan selling-price line that must catch up."""
    rng = np.random.default_rng(seed)
    c = new_canvas()
    heights = [120, 150, 190, 240, 300]
    x = 110
    for i, hgt in enumerate(heights):
        m = blank_mask()
        poly(m, [(x, 440), (x + 80, 440), (x + 80, 440 - hgt), (x, 440 - hgt)])
        wash(c, m, HUES["coral"], rng, layers=3, opacity=0.6 + i * 0.06, bleed=6, granulation=0.45)
        x += 100
    line = blank_mask()
    pts = [(100, 330), (230, 320), (330, 300), (440, 260), (560, 190), (620, 150)]
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        cv2.line(line, (x0, y0), (x1, y1), 255, 14)
    wash(c, line, HUES["cyan"], rng, layers=3, opacity=0.85, bleed=3)
    base = blank_mask()
    poly(base, [(90, 440), (630, 440), (630, 448), (90, 448)])
    wash(c, base, HUES["navy"], rng, layers=2, opacity=0.6, bleed=2)
    save(c, name, "rising coral steps with a cyan line climbing to meet them, a supplier price increase, watercolour")


def plate_masthead(name: str, seed: int) -> None:
    """A long horizontal pellet chain in the brand hues: the signal line."""
    rng = np.random.default_rng(seed)
    w, h = SIZE
    c = np.zeros((h, w, 4), np.float32)
    c[..., :3] = 1.0
    hues = ["coral", "cyan", "coral", "cyan", "yellow", "blue", "coral", "cyan"]
    for i, hue in enumerate(hues):
        m = blank_mask()
        x = 80 + i * 80
        ellipse(m, x, 270 + math.sin(i * 0.9) * 40, 30, 26, rng.random() * 60)
        wash(c, m, HUES[hue], rng, layers=3, opacity=0.8, bleed=4, granulation=0.5)
    save(c, name, "a chain of pellets in coral cyan yellow and blue, watercolour")


def main() -> None:
    plate_archipelago("region-sea", 11)
    plate_cracker("region-china", "coral", 12)
    plate_ship("region-usa", "blue", "coral", 13)
    plate_strait("region-middle-east", 14)
    plate_coast("region-australia", 15)
    plate_globe("region-global", 16)
    plate_pellets("pellets-coral", "coral", 21)
    plate_pellets("pellets-cyan", "cyan", 22)
    plate_coins("lesson-margin", 31)
    plate_ledger("lesson-pnl", 32)
    plate_inventory("lesson-inventory", 33)
    plate_fx("lesson-fx", 34)
    plate_freight("lesson-freight", 35)
    plate_scales("lesson-tradeoffs", 36)
    plate_cycle("lesson-cycle", 37)
    plate_price_steps("lesson-price-steps", 38)
    plate_masthead("chain", 41)


if __name__ == "__main__":
    sys.exit(main())
