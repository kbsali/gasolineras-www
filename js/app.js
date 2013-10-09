var gasLayer = null,
    map, _coords = [40.383, -3.717]; // Madrid

if (!_.isUndefined(Storage)) {
    if (localStorage._coords) {
        _coords = _.toArray(localStorage._coords.split(","));
    }
}

MyGitSpatial = lvector.GitSpatial.extend({
    setUser: function(user) {
        this.options.user = user;
    },

    setRepo: function(repo) {
        this.options.repo = repo;
    },

    setFeatureSet: function(featureSet) {
        this.options.featureSet = featureSet;
    },

    setSymbology: function(symbology) {
        this.options.symbology = symbology;
    }
});

getRange = function(type, idx) {
    var _ranges = {
        "BIO": [
            [0, 1.385],
            [1.386, 1.450],
            [1.451, 3]
        ],
        "GOA": [
            [0, 1.390],
            [1.391, 1.422],
            [1.423, 3]
        ],
        "NGO": [
            [0, 1.390],
            [1.391, 1.422],
            [1.423, 3]
        ],
        "G98": [
            [0, 1.585],
            [1.586, 1.604],
            [1.605, 3]
        ],
        "GPR": [
            [0, 1.469],
            [1.470, 1.489],
            [1.490, 3]
        ]
    };
    return _ranges[type][idx];
};

getSymbology = function(type) {
    var customMarker = L.Icon.extend({
        options: {
            shadowUrl: null,
            iconSize: new L.Point(32, 37),
            iconAnchor: new L.Point(16, 37),
            popupAnchor: new L.Point(0, -35)
        }
    });
    return {
        type: "range",
        property: "price",
        ranges: [{
            range: getRange(type, 0),
            vectorOptions: {
                icon: new customMarker({
                    iconUrl: "/img/green.png"
                }),
                title: "{price} mph &eur;"
            }
        }, {
            range: getRange(type, 1),
            vectorOptions: {
                icon: new customMarker({
                    iconUrl: "/img/white-orange.png"
                }),
                title: "{price} &eur;"
            }
        }, {
            range: getRange(type, 2),
            vectorOptions: {
                icon: new customMarker({
                    iconUrl: "/img/white-red.png"
                }),
                title: "{price} &eur;"
            }
        }]
    };
};

handleGetCurrentPosition = function(location) {
    _coords = [location.coords.latitude, location.coords.longitude];
    if (!_.isUndefined(Storage)) {
        localStorage._coords = _coords;
    }
    map.setView(_coords, 13);
    placeMarker(_coords);
};

placeMarker = function(coords) {
    var circle = L.circle(coords, 50, {
        color: "red",
        fillColor: "#f03",
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
                attribution: 'Tiles: <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> | ' + 'Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA | ' + 'Pretol station data <a href="https://github.com/kbsali/gasolineras-espana-data" target="_blank">on Github</a> ' + 'loaded through <a href="http://GitSpatial.com" target="_blank">GitSpatial</a>'
            })
        ]
    });
    placeMarker(_coords);
};

$(document).ready(function() {
    getMap();

    var layer = {
        user: "kbsali",
        repo: "gasolineras-espana-data",
        featureSet: "geojson/latest/BIO.geojson",
        map: map,
        singlePopup: true,
        popupTemplate: function(data) {
            return '<div class="iw-content">' +
                "<h3>" + data.name + "</h3>" +
                "<h4>" + data.price + " &euro;</h4>" +
                "</div>";
        },
        symbology: getSymbology("BIO")
    };

    $("#buttons a").on("click", function() {
        if ("geolocate" === $(this).attr("id")) {
            getLocation();
        } else {
            $("#buttons a.btn-success")
                .addClass("btn-default")
                .removeClass("btn-success");
            $(this)
                .addClass("btn-success")
                .removeClass("btn-default");

            if (_.isNull(gasLayer)) {
                gasLayer = new MyGitSpatial(layer);
            } else {
                gasLayer.setMap(null);
                gasLayer.setFeatureSet("geojson/latest/" + $(this).attr("id") + ".geojson");
                gasLayer.setSymbology(getSymbology($(this).attr("id")));
            }
            gasLayer.setMap(map);
        }
    });
});