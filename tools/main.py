import json
import re

import pyperclip


def parse_coord(line):
    line = line.strip().replace("°", "").replace("′", "").replace("’", "").replace("“", "").replace("”", "")

    # Try spaced format first: "57 14 28N 009 00 00E"
    spaced = re.match(
        r"(\d{1,2})\s+(\d{1,2})\s+(\d{0,2}(?:\.\d+)?)?([NS])\s+(\d{1,3})\s+(\d{1,2})\s+(\d{0,2}(?:\.\d+)?)?([EW])",
        line
    )

    # If not spaced, try compact format: "573858N 0102855E"
    compact = re.match(
        r"(\d{2})(\d{2})(\d{0,2}(?:\.\d+)?)([NS])\s+(\d{3})(\d{2})(\d{0,2}(?:\.\d+)?)([EW])",
        line
    )

    match = spaced or compact
    if not match:
        raise ValueError(f"Invalid coordinate format: {line}")

    lat_deg, lat_min, lat_sec, lat_dir, lon_deg, lon_min, lon_sec, lon_dir = match.groups()

    lat_sec = float(lat_sec) if lat_sec else 0
    lon_sec = float(lon_sec) if lon_sec else 0

    lat = float(lat_deg) + float(lat_min)/60 + lat_sec/3600
    lon = float(lon_deg) + float(lon_min)/60 + lon_sec/3600

    if lat_dir == "S":
        lat = -lat
    if lon_dir == "W":
        lon = -lon

    return [round(lat, 6), round(lon, 6)]

def main():
    print("Paste coordinates (any format), then press Ctrl+D (Linux/macOS) or Ctrl+Z (Windows):")
    lines = []
    try:
        while True:
            line = input().strip()
            if line:
                # Allow multiple coords per line separated by '-'
                for part in re.split(r"\s*-\s*", line):
                    if part:
                        lines.append(part)
    except EOFError:
        pass

    coords = [parse_coord(line) for line in lines]
    pyperclip.copy(json.dumps(coords))
    print(json.dumps(coords))

if __name__ == "__main__":
    main()
