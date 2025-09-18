import {racetrack} from './utils/racetrack.js';

export default function createLayer(map, layer, layerlist) {
    fetch("./layers/" + layer + ".json").then((res) => res.json()).then((data) => {
        let features = []

        data.forEach(item => {
            if (item.type === "racetrack") {
                let rtpoints = racetrack(item.anchor, item.course, item.length, item.separation, item.direction)
                const olCoords = rtpoints.map(c => ol.proj.fromLonLat([c[1], c[0]]));
                let rotation = (item.course + (item.course < 180 ? -90 : 90)) / 180 * Math.PI

                // Create a feature and vector layer
                const polygonFeature = new ol.Feature({
                    geometry: new ol.geom.Polygon([olCoords]),
                    "color": item.color,
                    "name": "FL" + item.altitude[1] + "\n" + item.name + "\nFL" + item.altitude[0],
                    "type": item.type,
                    "rotation": rotation,
                });

                features.push(polygonFeature);

                const arrowFeature = new ol.Feature({
                    geometry: new ol.geom.Point(olCoords[0]),
                    "color": item.color,
                    "name": '➤',
                    "type": 'racetrack',
                    "rotation": (item.course-90)/180 * Math.PI
                })

                features.push(arrowFeature);
            }else if(item.type === "other") {

            }
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
                        font: 'bold 15px Arial, sans-serif',
                        stroke: new ol.style.Stroke({
                            color: "white",
                            width: 0.9
                        }),
                        fill: new ol.style.Fill({
                            color: feature.get("color")
                        }),
                        text: map.getView().getZoom() >= 7 ? feature.get('name') : "",
                        textAlign: 'center',
                        placement: feature.get("type") === 'racetrack' ? 'point' : 'line',
                        rotation: feature.get("type") === 'racetrack' ? feature.get("rotation") : 'line',
                        textBaseline: feature.get("type") === 'racetrack' ? 'center' : 'top',
                        keepUpright: true

                    }),
                });
            },
            declutter: false
        });

    })

}