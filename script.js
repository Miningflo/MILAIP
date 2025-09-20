import {racetrack, racetrack2, racetrack3} from './utils/racetrack.js';

function altitudename(limit) {
    if (limit === -1) return ""
    if (limit === 0) return "GND"
    if (limit === 66000) return "UNL"
    if (limit <= 4500) return limit + "FT"
    return "FL" + (Math.floor(limit / 500)) * 5
}

function getname(name, altitude, join="\n"){
    let n = altitudename(altitude[1] ?? -1) + join + name + join + altitudename(altitude[0] ?? -1)
    return n.trim()
}

export default function createLayer(map, layer, layerlist) {
    fetch("./layers/" + layer + ".json").then((res) => res.json()).then((data) => {
        let features = []

        data.forEach(item => {
            let geometry
            let rotation = 0
            let name = ""
            let icon = ""



            if (item.type.includes("racetrack")) {
                let rtpoints = []
                if (item.type === "racetrack") {
                    rtpoints = racetrack(item.anchor, item.course, item.length, item.separation, item.direction)
                }else if (item.type === "racetrack2") {
                    rtpoints = racetrack2(item.anchors, item.course, item.direction)
                }else{
                    rtpoints = racetrack3(item.centers, item.radius)
                }

                const olCoords = rtpoints.map(c => ol.proj.fromLonLat(c.reverse()));
                geometry = new ol.geom.Polygon([olCoords])
                rotation = (item.course + (item.course < 180 ? -90 : 90)) / 180 * Math.PI
                name = getname(item.name, item.altitude, "\n")


                if(layer === "AAR"){
                    const arrowFeature = new ol.Feature({
                        geometry: new ol.geom.Point(olCoords[0]),
                        "color": item.color,
                        "name": '➤',
                        "type": 'racetrack',
                        "rotation": (item.course-90)/180 * Math.PI,
                        "icon": ""
                    })

                    features.push(arrowFeature);
                }


            }else if(item.type === "airspace") {
                const olCoords = item.points.map(c => ol.proj.fromLonLat(c.reverse()));
                geometry = new ol.geom.Polygon([olCoords])
                name = getname(item.name, item.altitude ?? [-1, -1])
            }else {
                geometry = new ol.geom.Point(ol.proj.fromLonLat(item.location.reverse()))
                name = item.name
                icon = item.type + ".png"
            }

            const itemfeature = new ol.Feature({
                geometry: geometry,
                "color": item.color,
                "name": name,
                "type": item.type,
                "rotation": rotation,
                "icon": icon,
            });

            features.push(itemfeature);


        })


        layerlist[layer] = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: features
            }),
            style: function (feature) {
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: feature.get("color"),
                        width: 2
                    }),
                    text: new ol.style.Text({
                        font: 'bold ' + (feature.get("icon").length > 0 ? 10 : 15) + 'px Arial, sans-serif',
                        stroke: new ol.style.Stroke({
                            color: "white",
                            width: 0.9
                        }),
                        fill: new ol.style.Fill({
                            color: feature.get("color")
                        }),
                        text: map.getView().getZoom() >= 7 ? feature.get('name') : "",
                        textAlign: 'center',
                        placement: feature.get("type").includes('racetrack3') ? 'line' : 'point',
                        rotation: feature.get("rotation"),
                        textBaseline: feature.get("type").includes('racetrack3') ? 'top' : 'middle',
                        keepUpright: true,
                        offsetY: feature.get("icon").length > 0 ? 15 : 0

                    }),
                    image: feature.get("icon").length > 0 ? new ol.style.Icon({
                        anchor: [0.5, 0.5], // center-bottom of the icon
                        src: './icons/' + feature.get("icon"), // any image URL
                        scale: map.getView().getZoom() >= 7 ? 0.04 : 0.02, // resize the icon,
                        rotation: 0
                    }) : undefined
                });
            },
            declutter: false
        });

    })

}