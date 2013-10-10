var minPrice = 10,
    maxPrice = 0,
    gasLayer = null,
    map, _coords = [40.383, -3.717]; // Madrid
var range = [
    [0, 1],
    [1.001, 2],
    [2.001, 10]
];

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

getSymbology = function(type) {
    var customMarker = L.Icon.extend({
        options: {
            shadowUrl: null,
            iconSize: new L.Point(32, 37),
            iconAnchor: new L.Point(16, 37),
            popupAnchor: new L.Point(0, -35)
        }
    });
    var ret = {
        type: "range",
        property: "price",
        ranges: [{
            // range: range[0],
            range: getRange(type, 0),
            vectorOptions: {
                icon: new customMarker({
                    iconUrl: "/img/green.png"
                }),
                title: "{price} mph &eur;"
            }
        }, {
            // range: range[1],
            range: getRange(type, 1),
            vectorOptions: {
                icon: new customMarker({
                    iconUrl: "/img/white-orange.png"
                }),
                title: "{price} &eur;"
            }
        }, {
            // range: range[2],
            range: getRange(type, 2),
            vectorOptions: {
                icon: new customMarker({
                    iconUrl: "/img/white-red.png"
                }),
                title: "{price} &eur;"
            }
        }]
    };
    return ret;
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
        navigator.geolocation.getCurrentPosition(function(location) {
            _coords = [location.coords.latitude, location.coords.longitude];
            if (!_.isUndefined(Storage)) {
                localStorage._coords = _coords;
            }
            map.setView(_coords, 13);
            placeMarker(_coords);
        }, function(error) {
            alert('Error while getting your location');
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
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

getRoute = function(toCoords) {
    dir = MQ.routing.directions();
    dir.route({
        locations: [{
            latLng: {
                lat: _coords[0],
                lng: _coords[1]
            }
        }, {
            latLng: {
                lat: toCoords[1],
                lng: toCoords[0]
            }
        }]
    });
    map.addLayer(MQ.routing.routeLayer({
        directions: dir,
        fitBounds: true
    }));
};

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

updateRangeFullData = function(data) {
    var price = 0;
    for (var i = data.features.length - 1; i >= 0; i--) {
        price = data.features[i].properties.price;
        if (minPrice > price) {
            minPrice = price;
        }
        if (maxPrice < price) {
            maxPrice = price;
        }
    }
    range = [
        [0, minPrice],
        [minPrice + 0.001, maxPrice],
        [maxPrice + 0.001, 10]
    ];
};

updateRange = function(data) {
    if (minPrice > data.price) {
        minPrice = data.price;
    }
    if (maxPrice < data.price) {
        maxPrice = data.price;
    }
    range = [
        [0, minPrice],
        [minPrice + 0.001, maxPrice],
        [maxPrice + 0.001, 10]
    ];
};

$(document).ready(function() {
    getMap();
    getLocation();

    var layer = {
        user: "kbsali",
        repo: "gasolineras-espana-data",
        featureSet: "-",
        map: map,
        singlePopup: true,
        popupTemplate: function(data) {
            return '<div class="iw-content">' +
                "<h3>" + data.name + "</h3>" +
                "<h4>" + data.price + " &euro;</h4>" +
                "</div>";
        },
        clickEvent: function(feature) {
            getRoute(feature.geometry.coordinates);
        },
        symbology: getSymbology("BIO")
        // , onload: function(data) {
        //     updateRangeFullData(data);
        // }
    };

    $("#buttons a").on("click", function() {
        ga("send", "event", "button", "click");
        if ("geolocate" === $(this).attr("id")) {
            getLocation();
        } else {
            $("#buttons a.btn-success")
                .addClass("btn-default")
                .removeClass("btn-success");
            $(this)
                .addClass("btn-success")
                .removeClass("btn-default");

            var fs = "geojson/latest/" + $(this).attr("id") + ".geojson";
            if (_.isNull(gasLayer)) {
                layer.featureSet = fs;
                gasLayer = new MyGitSpatial(layer);
            } else {
                gasLayer.setMap(null);
            }
            gasLayer.setFeatureSet(fs);
            gasLayer.setSymbology(getSymbology($(this).attr("id")));
            gasLayer.setMap(map);
        }
    });
});