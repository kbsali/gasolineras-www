var gasLayer = null, map, _coords = [40.383, -3.717]; // Madrid

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

handleGetCurrentPosition = function (location) {
    _coords = [location.coords.latitude, location.coords.longitude];
    // getMap();
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
        zoom: 10,
        layers: [
            new L.TileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
                maxZoom: 18,
                subdomains: ["otile1", "otile2", "otile3", "otile4"],
                attribution: 'Tiles: <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
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

    var tpl = {
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
        $(this)
            .addClass("btn-success")
            .removeClass("btn-default");
        if("geolocate" === $(this).attr("id")) {
            getLocation();
        } else {
            tpl.featureSet = 'geojson/latest/'+ $(this).attr("id") +'.geojson';
            console.log(gasLayer);
            if(!_.isNull(gasLayer)) {
                gasLayer.setMap(null);
                gasLayer = null;
            }
            gasLayer = new lvector.GitSpatial(tpl);
            gasLayer.setMap(map);
        }
    });
});