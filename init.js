export default function init() {
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([5.4, 51.1]), // Longitude, Latitude
            zoom: 11
        }),
        controls: ol.control.defaults.defaults().extend([
            new ol.control.ScaleLine({
                units: 'nautical' // 'metric', 'imperial', or 'nautical'
            })
        ])
    });

    return map;


}