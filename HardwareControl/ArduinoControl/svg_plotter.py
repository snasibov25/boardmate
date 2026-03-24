import math
import re
import xml.etree.ElementTree as ET


def strip_ns(tag):
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def parse_number_list(s):
    if not s:
        return []
    nums = re.findall(r'[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?', s)
    return [float(n) for n in nums]


def parse_points_attr(points_str):
    vals = parse_number_list(points_str)
    pts = []
    for i in range(0, len(vals) - 1, 2):
        pts.append((vals[i], vals[i + 1]))
    return pts


def cubic_bezier(p0, p1, p2, p3, t):
    mt = 1.0 - t
    x = (mt**3) * p0[0] + 3 * (mt**2) * t * p1[0] + 3 * mt * (t**2) * p2[0] + (t**3) * p3[0]
    y = (mt**3) * p0[1] + 3 * (mt**2) * t * p1[1] + 3 * mt * (t**2) * p2[1] + (t**3) * p3[1]
    return (x, y)


def quadratic_bezier(p0, p1, p2, t):
    mt = 1.0 - t
    x = (mt**2) * p0[0] + 2 * mt * t * p1[0] + (t**2) * p2[0]
    y = (mt**2) * p0[1] + 2 * mt * t * p1[1] + (t**2) * p2[1]
    return (x, y)


def sample_line(p0, p1):
    return [p0, p1]


def sample_quadratic(p0, p1, p2, segments=20):
    pts = []
    for i in range(segments + 1):
        t = i / segments
        pts.append(quadratic_bezier(p0, p1, p2, t))
    return pts


def sample_cubic(p0, p1, p2, p3, segments=30):
    pts = []
    for i in range(segments + 1):
        t = i / segments
        pts.append(cubic_bezier(p0, p1, p2, p3, t))
    return pts


def tokenize_path(d):
    token_re = re.compile(r'[MmLlHhVvCcQqZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?')
    return token_re.findall(d)


def parse_path_data(d):
    """
    Returns a list of polylines.
    Each polyline is a list of (x, y) points.
    """
    tokens = tokenize_path(d)
    i = 0
    polylines = []

    current = (0.0, 0.0)
    start_point = (0.0, 0.0)
    current_polyline = []

    cmd = None

    def read_float():
        nonlocal i
        val = float(tokens[i])
        i += 1
        return val

    while i < len(tokens):
        tok = tokens[i]
        if re.fullmatch(r'[MmLlHhVvCcQqZz]', tok):
            cmd = tok
            i += 1
        elif cmd is None:
            raise ValueError("Path data starts with numbers but no command")

        if cmd in ('M', 'm'):
            x = read_float()
            y = read_float()
            if cmd == 'm':
                current = (current[0] + x, current[1] + y)
            else:
                current = (x, y)

            start_point = current
            if current_polyline:
                polylines.append(current_polyline)
            current_polyline = [current]

            # Additional coordinate pairs after M/m are implicit L/l
            while i < len(tokens) and not re.fullmatch(r'[MmLlHhVvCcQqZz]', tokens[i]):
                x = read_float()
                y = read_float()
                if cmd == 'm':
                    current = (current[0] + x, current[1] + y)
                else:
                    current = (x, y)
                current_polyline.append(current)

            cmd = 'L' if cmd == 'M' else 'l'

        elif cmd in ('L', 'l'):
            while i < len(tokens) and not re.fullmatch(r'[MmLlHhVvCcQqZz]', tokens[i]):
                x = read_float()
                y = read_float()
                if cmd == 'l':
                    current = (current[0] + x, current[1] + y)
                else:
                    current = (x, y)
                if not current_polyline:
                    current_polyline = [current]
                else:
                    current_polyline.append(current)

        elif cmd in ('H', 'h'):
            while i < len(tokens) and not re.fullmatch(r'[MmLlHhVvCcQqZz]', tokens[i]):
                x = read_float()
                if cmd == 'h':
                    current = (current[0] + x, current[1])
                else:
                    current = (x, current[1])
                if not current_polyline:
                    current_polyline = [current]
                else:
                    current_polyline.append(current)

        elif cmd in ('V', 'v'):
            while i < len(tokens) and not re.fullmatch(r'[MmLlHhVvCcQqZz]', tokens[i]):
                y = read_float()
                if cmd == 'v':
                    current = (current[0], current[1] + y)
                else:
                    current = (current[0], y)
                if not current_polyline:
                    current_polyline = [current]
                else:
                    current_polyline.append(current)

        elif cmd in ('Q', 'q'):
            while i < len(tokens) and not re.fullmatch(r'[MmLlHhVvCcQqZz]', tokens[i]):
                x1 = read_float()
                y1 = read_float()
                x = read_float()
                y = read_float()

                if cmd == 'q':
                    p1 = (current[0] + x1, current[1] + y1)
                    p2 = (current[0] + x, current[1] + y)
                else:
                    p1 = (x1, y1)
                    p2 = (x, y)

                seg = sample_quadratic(current, p1, p2, segments=20)
                if not current_polyline:
                    current_polyline = [seg[0]]
                current_polyline.extend(seg[1:])
                current = p2

        elif cmd in ('C', 'c'):
            while i < len(tokens) and not re.fullmatch(r'[MmLlHhVvCcQqZz]', tokens[i]):
                x1 = read_float()
                y1 = read_float()
                x2 = read_float()
                y2 = read_float()
                x = read_float()
                y = read_float()

                if cmd == 'c':
                    p1 = (current[0] + x1, current[1] + y1)
                    p2 = (current[0] + x2, current[1] + y2)
                    p3 = (current[0] + x, current[1] + y)
                else:
                    p1 = (x1, y1)
                    p2 = (x2, y2)
                    p3 = (x, y)

                seg = sample_cubic(current, p1, p2, p3, segments=30)
                if not current_polyline:
                    current_polyline = [seg[0]]
                current_polyline.extend(seg[1:])
                current = p3

        elif cmd in ('Z', 'z'):
            if current_polyline and current_polyline[-1] != start_point:
                current_polyline.append(start_point)
            if current_polyline:
                polylines.append(current_polyline)
                current_polyline = []
            current = start_point

        else:
            raise ValueError(f"Unsupported path command: {cmd}")

    if current_polyline:
        polylines.append(current_polyline)

    return polylines


def parse_svg_shapes(svg_path):
    """
    Returns a list of polylines in SVG coordinate space.
    """
    tree = ET.parse(svg_path)
    root = tree.getroot()

    polylines = []

    for elem in root.iter():
        tag = strip_ns(elem.tag)

        if tag == "path":
            d = elem.attrib.get("d", "")
            if d.strip():
                polylines.extend(parse_path_data(d))

        elif tag == "line":
            x1 = float(elem.attrib.get("x1", "0"))
            y1 = float(elem.attrib.get("y1", "0"))
            x2 = float(elem.attrib.get("x2", "0"))
            y2 = float(elem.attrib.get("y2", "0"))
            polylines.append([(x1, y1), (x2, y2)])

        elif tag == "polyline":
            pts = parse_points_attr(elem.attrib.get("points", ""))
            if len(pts) >= 2:
                polylines.append(pts)

        elif tag == "polygon":
            pts = parse_points_attr(elem.attrib.get("points", ""))
            if len(pts) >= 2:
                if pts[0] != pts[-1]:
                    pts.append(pts[0])
                polylines.append(pts)

        elif tag == "rect":
            x = float(elem.attrib.get("x", "0"))
            y = float(elem.attrib.get("y", "0"))
            w = float(elem.attrib.get("width", "0"))
            h = float(elem.attrib.get("height", "0"))
            pts = [
                (x, y),
                (x + w, y),
                (x + w, y + h),
                (x, y + h),
                (x, y),
            ]
            polylines.append(pts)

    return polylines, root


def get_svg_bounds(polylines, root):
    """
    Tries viewBox first, otherwise computes geometry bounds.
    """
    viewbox = root.attrib.get("viewBox")
    if viewbox:
        vals = parse_number_list(viewbox)
        if len(vals) == 4:
            min_x, min_y, w, h = vals
            return min_x, min_y, min_x + w, min_y + h

    xs = []
    ys = []
    for poly in polylines:
        for x, y in poly:
            xs.append(x)
            ys.append(y)

    if not xs or not ys:
        return 0.0, 0.0, 1.0, 1.0

    return min(xs), min(ys), max(xs), max(ys)


def simplify_polyline(points, min_dist=1.0):
    if not points:
        return []
    out = [points[0]]
    for p in points[1:]:
        dx = p[0] - out[-1][0]
        dy = p[1] - out[-1][1]
        if math.hypot(dx, dy) >= min_dist:
            out.append(p)
    if out[-1] != points[-1]:
        out.append(points[-1])
    return out


def svg_to_machine_polylines(
    svg_path,
    max_x_steps=1600,
    max_y_steps=2000,
    keep_aspect=True,
    invert_y=False,
    min_segment_svg=0.5,
):
    polylines, root = parse_svg_shapes(svg_path)
    min_x, min_y, max_x, max_y = get_svg_bounds(polylines, root)

    width = max(max_x - min_x, 1e-9)
    height = max(max_y - min_y, 1e-9)

    sx = max_x_steps / width
    sy = max_y_steps / height

    if keep_aspect:
        scale = min(sx, sy)
        sx = scale
        sy = scale

    machine_polys = []

    for poly in polylines:
        poly = simplify_polyline(poly, min_dist=min_segment_svg)
        mapped = []
        for x, y in poly:
            mx = int(round((x - min_x) * sx))
            my = int(round((y - min_y) * sy))
            if invert_y:
                my = max_y_steps - my
            mapped.append((mx, my))

        # remove consecutive duplicates
        dedup = []
        for p in mapped:
            if not dedup or p != dedup[-1]:
                dedup.append(p)

        if len(dedup) >= 2:
            machine_polys.append(dedup)

    return machine_polys


def polylines_to_commands(polylines, use_set_coords=True, final_pen_up=True):
    commands = []

    if use_set_coords:
        commands.append("SC 0 0")

    commands.append("EN")
    commands.append("PUP")

    for poly in polylines:
        if len(poly) < 2:
            continue

        start = poly[0]
        commands.append(f"MVC {start[0]} {start[1]}")
        commands.append("PDN")

        for pt in poly[1:]:
            commands.append(f"MVC {pt[0]} {pt[1]}")

        commands.append("PUP")

    if final_pen_up:
        commands.append("PUP")

    commands.append("MVC 0 0")
    commands.append("DS")

    return commands


def svg_file_to_commands(
    svg_path,
    max_x_steps=1600,
    max_y_steps=2000,
    keep_aspect=True,
    invert_y=False,
):
    polylines = svg_to_machine_polylines(
        svg_path,
        max_x_steps=max_x_steps,
        max_y_steps=max_y_steps,
        keep_aspect=keep_aspect,
        invert_y=invert_y,
    )
    return polylines_to_commands(polylines)