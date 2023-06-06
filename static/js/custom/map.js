let dashboard_map_tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
});

let dashboard_map = L.map('dashboard-map', {
    zoomControl: false,
    layers: [dashboard_map_tile]
}).setView([51.505, -0.09], 2);

let navigation_map_tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
});

let navigation_map = L.map('navigation-map', {
    zoomControl: false,
    layers: [navigation_map_tile]
}).setView([51.505, -0.09], 2);

const maps = [dashboard_map, navigation_map];

function drawWeatherMap() {
    let clouds = L.OWM.clouds({ showLegend: false, opacity: 0.5, appId: '147854dd340d7e59b431b3543b073636' });
    let precipitation = L.OWM.precipitation({ showLegend: false, opacity: 0.5, appId: '147854dd340d7e59b431b3543b073636' });
    let rain = L.OWM.rain({ showLegend: false, opacity: 0.5, appId: '147854dd340d7e59b431b3543b073636' });
    let snow = L.OWM.snow({ showLegend: false, opacity: 0.5, appId: '147854dd340d7e59b431b3543b073636' });
    let pressure = L.OWM.pressure({ showLegend: false, opacity: 0.5, appId: '147854dd340d7e59b431b3543b073636' });
    let temp = L.OWM.temperature({ showLegend: false, opacity: 0.5, appId: '147854dd340d7e59b431b3543b073636' });
    let wind = L.OWM.wind({ showLegend: false, opacity: 0.5, appId: '147854dd340d7e59b431b3543b073636' });
    let baseMaps = {"OSM Standard": navigation_map_tile};
    let overlayMaps = {
        "Clouds": clouds,
        "Precipitation": precipitation,
        "Rain": rain,
        "Snow": snow,
        "Pressure": pressure,
        "Temperature": temp,
        "Wind": wind
    };
    L.control.layers(baseMaps, overlayMaps).addTo(navigation_map);
    L.terminator().addTo(navigation_map);
    L.control.betterscale().addTo(navigation_map);
}


function drawRouteMap(response) {
    let latlngs = [];
    response.MAP_LAT.forEach((pos_lat, i) => {
        latlngs.push([pos_lat, response.MAP_LONG[i]])
    })

    maps.forEach((map, i) => {

        let polyline = L.polyline(latlngs, { color: '#2da8e6' }).addTo(map);
        map.fitBounds(polyline.getBounds());

        let icon_vor = L.icon({
            iconUrl: 'static/img/icons/map/vor.png',
            iconSize: [22, 20],
            iconAnchor: [11, 10],
            popupAnchor: [0, 0]
        })

        let icon_ndb = L.icon({
            iconUrl: 'static/img/icons/map/ndb.png',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, 0]
        })

        let icon_wpt = L.icon({
            iconUrl: 'static/img/icons/map/wpt.png',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, 0]
        })

        let icon_toc = L.icon({
            iconUrl: 'static/img/icons/map/toc.png',
            iconSize: [10, 10],
            iconAnchor: [5, 5],
            popupAnchor: [0, 0]
        })

        let icon_apt = L.icon({
            iconUrl: 'static/img/icons/map/apt.png',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, 0]
        })

        let sicon;
        latlngs.forEach((latlng, i) => {
            if (response.MAP_TYPE[i] == 'vor') {
                sicon = icon_vor;
            }
            if (response.MAP_TYPE[i] == 'ndb') {
                sicon = icon_ndb;
            }
            if (response.MAP_TYPE[i] == 'wpt') {
                sicon = icon_wpt;
            }
            if (response.MAP_TYPE[i] == 'ltlg') {
                sicon = icon_toc;
            }
            if (response.MAP_TYPE[i] == 'apt') {
                sicon = icon_apt;
            }
            let marker = L.marker(latlng, {
                icon: sicon,
                opacity: 0.8
            }).addTo(map);
            marker.bindPopup(
                '<strong>Ident:</strong> ' + response.MAP_IDENT[i] + '<br><strong>Via:</strong> ' + response.MAP_AIRWAY[i] + '<br><strong>Alt:</strong> ' + response.MAP_FL[i] + ' ft'
            ).openPopup();
        })

        let btn_fitbound = document.querySelectorAll('.dashboard-map-fitbound');
        btn_fitbound[i].addEventListener('click', () => {
            map.fitBounds(polyline.getBounds());
        })

    })
}

let map_plane

function drawAirplaneOnMap(resp) {
    let sicon = L.icon({
        iconUrl: 'static/img/icons/map/plane.png',
        iconSize: [22, 26],
        iconAnchor: [11, 13],
        popupAnchor: [0, 0]
    });

    if (Object.keys(resp).length > 0) {
        if (map_plane == null) {
            map_plane = L.marker([resp.PLANE_LATITUDE, resp.PLANE_LONGITUDE], {
                icon: sicon,
                rotationAngle: resp.MAGNETIC_COMPASS
            }).addTo(map);
        } else {
            map_plane.setLatLng([resp.PLANE_LATITUDE, resp.PLANE_LONGITUDE]);
            map_plane.setRotationAngle(resp.MAGNETIC_COMPASS);
        }
    } else {
        if (map_plane == !null) {
            map.removeLayer(map_plane);
        }
    }
}