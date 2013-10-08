var gasLayer = null, map, _coords = [40.383, -3.717]; // Madrid

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

handleGetCurrentPosition = function (location) {
    _coords = [location.coords.latitude, location.coords.longitude];
    map.setView(_coords, 13);
    var circle = L.circle(_coords, 50, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5
    }).addTo(map);

};

getLocation = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handleGetCurrentPosition);
    }
};

getMap = function() {
    map = L.map("map", {
        center: _coords, // Madrid
        zoom: 12,
        layers: [
            new L.TileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
                maxZoom: 18,
                subdomains: ["otile1", "otile2", "otile3", "otile4"],
                attribution: 'Tiles: <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> | ' +
                    'Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA | ' +
                    'Pretol station data <a href="https://github.com/kbsali/gasolineras-espana-data" target="_blank">on Github</a> ' +
                    'loaded through <a href="http://GitSpatial.com" target="_blank">GitSpatial</a>'
            })
        ]
    });
};

$(document).ready(function() {
    getMap();

    var customMarker = L.Icon.extend({
        options: {
            iconUrl: "/img/white-red.png",
            shadowUrl: null,
            iconSize: new L.Point(32, 37),
            iconAnchor: new L.Point(16, 37),
            popupAnchor: new L.Point(0, -35)
        }
    });

    var _singleRed = {
        type: "single",
        vectorOptions: {
            icon: new customMarker()
        }
    };
    var _singleGreen = {
        type: "single",
        vectorOptions: {
            icon: new customMarker({
                iconUrl: "/img/green.png"
            })
        }
    };

    var layer = {
        user: 'kbsali',
        repo: 'gasolineras-espana-data',
        featureSet: 'geojson/latest/BIO.geojson',
        map: map,
        singlePopup: true,
        popupTemplate: function(data) {
            return '<div class="iw-content">' +
                '<h3>' + data.name + '</h3>' +
                '<h4>' + data.price + ' &euro;</h4>' +
                '</div>';
        },
        symbology: _singleRed
    };
    $("#buttons a").on("click", function() {
        if("geolocate" === $(this).attr("id")) {
            getLocation();
        } else {
            $("#buttons a.btn-success")
                .addClass("btn-default")
                .removeClass("btn-success");
            $(this)
                .addClass("btn-success")
                .removeClass("btn-default");

            layer.featureSet = 'geojson/latest/'+ $(this).attr("id") +'.geojson';
            if(_.isNull(gasLayer)) {
                gasLayer = new lvector.GitSpatial(layer);
            } else {
                gasLayer.setMap(null);
                gasLayer.setFeatureSet('geojson/latest/'+ $(this).attr("id") +'.geojson');
            }
            gasLayer.setMap(map);
        }
    });
});