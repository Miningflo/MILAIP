export function racetrack(anchor, course, length, separation, direction) {
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
    points.push(points[0])


    return points;
}


