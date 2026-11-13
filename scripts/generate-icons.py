#!/usr/bin/env python3
"""
Pure-Python monochrome PNG, SVG, and Windows ICO icon generator for S2RFilm Studio Desktop.
Requires only Python standard library (zlib, struct, os).
"""
import os
import struct
import zlib

def write_png(filepath: str, width: int, height: int, pixels_rgba: bytes):
    def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        chunk = chunk_type + data
        return struct.pack('!I', len(data)) + chunk + struct.pack('!I', zlib.crc32(chunk) & 0xffffffff)

    raw_rows = bytearray()
    stride = width * 4
    for y in range(height):
        raw_rows.append(0)  # filter type 0
        raw_rows.extend(pixels_rgba[y * stride : (y + 1) * stride])

    ihdr = struct.pack('!IIBBBBB', width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw_rows), level=9)

    png_bytes = (
        b'\x89PNG\r\n\x1a\n' +
        png_chunk(b'IHDR', ihdr) +
        png_chunk(b'IDAT', idat) +
        png_chunk(b'IEND', b'')
    )
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'wb') as f:
        f.write(png_bytes)

def write_ico(filepath: str, png_bytes_256: bytes):
    # Single-image PNG-compressed 256x256 ICO (supported by Windows Vista+ and electron-builder)
    header = struct.pack('<HHH', 0, 1, 1)  # reserved=0, type=1 (ICO), count=1
    # width=0 (means 256), height=0 (means 256), colors=0, reserved=0, planes=1, bpp=32, size, offset=22
    entry = struct.pack('<BBBBHHII', 0, 0, 0, 0, 1, 32, len(png_bytes_256), 22)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'wb') as f:
        f.write(header + entry + png_bytes_256)

def render_monochrome_film_icon(size: int) -> bytes:
    """Renders an architectural monochrome rounded square with sleek film-frame & slate cut."""
    buf = bytearray(size * size * 4)
    radius = size * 0.20
    pad = size * 0.04

    for y in range(size):
        for x in range(size):
            # Rounded rectangle SDF for outer dark obsidian frame (#09090b)
            cx = max(pad + radius, min(x, size - pad - radius))
            cy = max(pad + radius, min(y, size - pad - radius))
            dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            alpha = 0
            if dist <= radius:
                alpha = 255
            elif dist <= radius + 1.2:
                alpha = int(255 * max(0.0, 1.0 - (dist - radius) / 1.2))

            if alpha == 0:
                continue

            # Base obsidian background (#09090b) with subtle inner border (#3f3f46)
            r, g, b = 9, 9, 11
            if radius - 3.5 * (size / 512.0) <= dist <= radius:
                r, g, b = 82, 82, 91

            # Normalized coordinates in [0, 1]
            nx = x / size
            ny = y / size

            # Crisp white film frame aperture in center (#ffffff)
            # Outer white rectangle: x in [0.22, 0.78], y in [0.25, 0.75]
            in_outer = (0.22 <= nx <= 0.78) and (0.25 <= ny <= 0.75)
            in_inner = (0.31 <= nx <= 0.69) and (0.31 <= ny <= 0.69)

            # Film sprocket holes on left and right rails
            sprocket_left = (0.245 <= nx <= 0.285) and (
                (0.28 <= ny <= 0.34) or
                (0.41 <= ny <= 0.47) or
                (0.53 <= ny <= 0.59) or
                (0.66 <= ny <= 0.72)
            )
            sprocket_right = (0.715 <= nx <= 0.755) and (
                (0.28 <= ny <= 0.34) or
                (0.41 <= ny <= 0.47) or
                (0.53 <= ny <= 0.59) or
                (0.66 <= ny <= 0.72)
            )

            # Center architectural play/aperture triangle pointing right inside inner frame
            # Triangle vertices: (0.44, 0.40), (0.44, 0.60), (0.60, 0.50)
            in_triangle = False
            if 0.44 <= nx <= 0.60:
                t = (nx - 0.44) / 0.16
                half_h = 0.10 * (1.0 - t)
                if (0.50 - half_h) <= ny <= (0.50 + half_h):
                    in_triangle = True

            if in_outer and not in_inner and not sprocket_left and not sprocket_right:
                r, g, b = 244, 244, 245  # zinc-100
            elif in_triangle:
                r, g, b = 255, 255, 255  # pure white
            elif in_inner:
                r, g, b = 24, 24, 27  # zinc-900 aperture matte

            idx = (y * size + x) * 4
            buf[idx] = r
            buf[idx + 1] = g
            buf[idx + 2] = b
            buf[idx + 3] = alpha

    return bytes(buf)

def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    public_dir = os.path.join(root, 'public')
    os.makedirs(public_dir, exist_ok=True)

    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect x="20" y="20" width="472" height="472" rx="100" fill="#09090b" stroke="#52525b" stroke-width="8"/>
  <rect x="112" y="128" width="288" height="256" rx="12" fill="#f4f4f5"/>
  <rect x="158" y="158" width="196" height="196" rx="4" fill="#18181b"/>
  <!-- Sprocket holes left -->
  <rect x="125" y="144" width="20" height="30" rx="3" fill="#09090b"/>
  <rect x="125" y="210" width="20" height="30" rx="3" fill="#09090b"/>
  <rect x="125" y="272" width="20" height="30" rx="3" fill="#09090b"/>
  <rect x="125" y="338" width="20" height="30" rx="3" fill="#09090b"/>
  <!-- Sprocket holes right -->
  <rect x="367" y="144" width="20" height="30" rx="3" fill="#09090b"/>
  <rect x="367" y="210" width="20" height="30" rx="3" fill="#09090b"/>
  <rect x="367" y="272" width="20" height="30" rx="3" fill="#09090b"/>
  <rect x="367" y="338" width="20" height="30" rx="3" fill="#09090b"/>
  <!-- Aperture play mark -->
  <polygon points="224,204 224,308 308,256" fill="#ffffff"/>
</svg>
"""
    with open(os.path.join(public_dir, 'icon.svg'), 'w') as f:
        f.write(svg_content)

    # Render 512x512 and 256x256 PNGs
    px512 = render_monochrome_film_icon(512)
    write_png(os.path.join(public_dir, 'pwa-512x512.png'), 512, 512, px512)

    px180 = render_monochrome_film_icon(180)
    write_png(os.path.join(public_dir, 'apple-touch-icon.png'), 180, 180, px180)

    px256 = render_monochrome_film_icon(256)
    tmp256 = os.path.join(public_dir, 'icon-256.png')
    write_png(tmp256, 256, 256, px256)
    with open(tmp256, 'rb') as f:
        png256_bytes = f.read()
    write_ico(os.path.join(public_dir, 'icon.ico'), png256_bytes)

    print("Generated monochrome SVG, PNG (512/256/180), and ICO icons in public/")

if __name__ == '__main__':
    main()
