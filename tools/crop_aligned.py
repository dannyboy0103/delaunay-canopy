#!/usr/bin/env python3
"""Crop a set of renders that share one camera, without breaking their alignment.

Renders that come out of the same viewpoint can be layered or flipped between
only while they stay registered to each other. Cropping each one to its own
content would shift them apart, because a sparse sampling covers less of the
canvas than the full point cloud does. So the crop box is the union of every
image's content, applied identically to all of them.

Transparent pixels count as empty. RGB inputs fall back to a white background
test, which matches the figures exported from the paper.

Usage
  python3 tools/crop_aligned.py --out-dir static/images --prefix samp_6341 \
      pcd=6341_pcd00.png cs500=6341_cs_50000.png cs150=6341_cs_15000.png

Each argument is KEY=PATH and produces <prefix>_<key>.png.
"""

import argparse
import os

from PIL import Image, ImageChops


def content_box(im):
    if 'A' in im.getbands():
        return im.getchannel('A').getbbox()
    rgb = im.convert('RGB')
    white = Image.new('RGB', rgb.size, (255, 255, 255))
    return ImageChops.difference(rgb, white).getbbox()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pairs', nargs='+', metavar='KEY=PATH')
    ap.add_argument('--out-dir', required=True)
    ap.add_argument('--prefix', required=True)
    ap.add_argument('--margin', type=int, default=12, help='pixels kept around the content')
    ap.add_argument('--max-width', type=int, default=1400, help='downscale beyond this width')
    args = ap.parse_args()

    items = []
    for p in args.pairs:
        if '=' not in p:
            ap.error('expected KEY=PATH, got ' + p)
        key, path = p.split('=', 1)
        items.append((key, path))

    images = [(k, Image.open(p)) for k, p in items]
    sizes = set(im.size for _, im in images)
    if len(sizes) != 1:
        ap.error('inputs must share one canvas size, found ' + str(sizes))
    w, h = images[0][1].size

    boxes = [content_box(im) for _, im in images if content_box(im)]
    box = (
        max(0, min(b[0] for b in boxes) - args.margin),
        max(0, min(b[1] for b in boxes) - args.margin),
        min(w, max(b[2] for b in boxes) + args.margin),
        min(h, max(b[3] for b in boxes) + args.margin)
    )

    os.makedirs(args.out_dir, exist_ok=True)
    scale = min(1.0, args.max_width / float(box[2] - box[0]))
    print('shared crop %s -> %dx%d, scale %.2f' % (box, box[2] - box[0], box[3] - box[1], scale))
    for key, im in images:
        out = im.crop(box)
        if scale < 1.0:
            out = out.resize((int(out.width * scale), int(out.height * scale)), Image.LANCZOS)
        path = os.path.join(args.out_dir, args.prefix + '_' + key + '.png')
        out.save(path, optimize=True)
        print('  %-7s -> %s  %dx%d  %.0f KB' % (
            key, path, out.width, out.height, os.path.getsize(path) / 1024))


if __name__ == '__main__':
    main()
