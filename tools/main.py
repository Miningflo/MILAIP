import re
import json
import pyperclip

def parse_dms_token(tok):
    tok = re.sub(r'[^0-9NSEWnsew]', '', tok).upper()
    m = re.match(r'^(\d+)([NSEW])$', tok)
    if not m:
        raise ValueError(f"Invalid coordinate token: {tok}")

    num, hemi = m.groups()
    if len(num) < 4:
        raise ValueError(f"Invalid numeric part in token: {tok}")

    deg_digits = len(num) - 4
    deg = int(num[:deg_digits])
    minutes = int(num[deg_digits:deg_digits+2])
    seconds = int(num[deg_digits+2:deg_digits+4])

    if not (0 <= minutes < 60 and 0 <= seconds < 60):
        raise ValueError(f"Invalid minutes/seconds in token: {tok}")

    dd = deg + minutes / 60.0 + seconds / 3600.0
    if hemi in ('S', 'W'):
        dd = -dd

    return round(dd, 6)

def parse_text_to_coords(text):
    tokens = re.findall(r'\d+[NSEWnsew]', text)
    tokens = [t.upper() for t in tokens]

    if len(tokens) % 2 != 0:
        raise ValueError("Odd number of coordinate tokens — expected pairs.")

    coords = []
    for i in range(0, len(tokens), 2):
        lat_tok, lon_tok = tokens[i], tokens[i+1]
        if lat_tok[-1] not in 'NS' or lon_tok[-1] not in 'EW':
            if lat_tok[-1] in 'EW' and lon_tok[-1] in 'NS':
                lat_tok, lon_tok = lon_tok, lat_tok
            else:
                raise ValueError(f"Unexpected token order: {lat_tok} {lon_tok}")
        lat = parse_dms_token(lat_tok)
        lon = parse_dms_token(lon_tok)
        coords.append([lat, lon])
    return coords

def main():
    print("Paste your coordinate list below, then press Ctrl+D:")
    text = ""
    while True:
        try:
            line = input()
            text += line + "\n"
        except EOFError:
            break

    coords = parse_text_to_coords(text)
    pyperclip.copy(json.dumps(coords))
    print("owo it's on the clipboard")

if __name__ == "__main__":
    main()
