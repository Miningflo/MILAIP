function deg2rad(d) {
    return d * Math.PI / 180;
}

function rad2deg(r) {
    return r * 180 / Math.PI;
}

const R = 6371000; // meters


function destinationPoint([lat, lon], distanceMeters, bearingDeg) {
    const R = 6371000; // Earth radius in meters
    const φ1 = lat * Math.PI / 180;
    const λ1 = lon * Math.PI / 180;
    const θ = bearingDeg * Math.PI / 180;
    const δ = distanceMeters / R; // angular distance

    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
    const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
        Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

    return [φ2 * 180 / Math.PI, λ2 * 180 / Math.PI];
}

function angle(a) {
    while (a < 0) {
        a += 360
    }
    return a % 360
}


function haversine(A, B) { // distance between 2 points
    const φ1 = deg2rad(A[0]), φ2 = deg2rad(B[0]);
    const dφ = deg2rad(B[0] - A[0]), dλ = deg2rad(B[1] - A[1]);
    const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(a, b) { // degrees from true north
    const φ1 = deg2rad(a[0]), φ2 = deg2rad(b[0]);
    const Δλ = deg2rad(b[1] - a[1]);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (rad2deg(Math.atan2(y, x)) + 360) % 360;
}


export function racetrack2([A, B], course, direction) {

    const d = haversine(A, B);          // diagonal distance in meters
    const θab = bearing(A, B);          // direction from A→B
    const diffRad = deg2rad(((θab - course + 540) % 360) - 180); // [-180,180]

    const longSide = Math.abs(d * Math.cos(diffRad));   // along the course
    const shortSide = Math.abs(d * Math.sin(diffRad));  // perpendicular to course


    const longNM = longSide / 1852;
    const shortNM = shortSide / 1852;

    return racetrack(A, course, longNM, shortNM, direction);
}

export function racetrack(anchor, course, length, separation, direction) {
    function halfCircle(anchor, radius, course, direction, steps = 40) {
        let bearingcenter = angle(course + (direction === "R" ? 90 : -90))
        let center = destinationPoint(anchor, radius, bearingcenter);
        let startBearing = angle(bearingcenter + 180);

        const angleIncrement = 180 / steps * (direction === 'R' ? 1 : -1);

        const points = [];
        for (let i = 0; i <= steps; i++) {
            const b = startBearing + i * angleIncrement;
            points.push(destinationPoint(center, radius, b));
        }

        return points;
    }

    let points = [];
    let radius = separation / 2 * 1852


    points.push(...halfCircle(anchor, radius, course, direction))
    course = angle(course + 180)
    anchor = destinationPoint(points.slice(-1)[0], length * 1852, course)
    points.push(...halfCircle(anchor, radius, course, direction))


    return points;
}

export function racetrack3([center1, center2], radius) {
    let distance = haversine(center1, center2) / 1852
    let course = bearing(center1, center2)
    let anchor = destinationPoint(center2, radius * 1852, angle(course + 90))

    return racetrack(anchor, course, distance, 2 * radius, "L")
}


