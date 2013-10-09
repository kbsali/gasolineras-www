Spain's petrol stations prices map
==================================

Simply shows a full screen map with a few buttons :
* 1 to geolocate your position
* 4 to display the petrol stations available in the area your map is centered on.
 * When clicking on any of the icons an information popup shows the name of the petrol station and the price of the selected petrol

This is to show case how to use the data generated by https://github.com/kbsali/gasolineras-espana and publicly stored in this repository : https://github.com/kbsali/gasolineras-espana-data.

There are numbers of pages and apps doing this already, but my idea was :
* there is no need for having to install an app for doing this : it should work for any device having an internet connection and a web browser,
* as explained [here](https://github.com/kbsali/gasolineras-espana) the original data provided by the ministery is, to me, not usable :
 * Zipped CSV files without any logical naming strategy is not helpful,
 * GeoJson seemed to be a raising standard!
* to learn :
 * python https://github.com/kbsali/gasolineras-espana
 * more about JS in general and Leaflet in particular! :)

Third parties
=============

The page uses :
* [leaflet-vector-layers](https://github.com/JasonSanford/leaflet-vector-layers) for loading and plotting the data (and therefore [Leaflet](http://leafletjs.com/) too),
* [Bootstrap](http://getbootstrap.com/) for the css (it is reponsive and should be seen correctly on mobile devices),
* [MapQuest](http://www.mapquest.com/) for the map tiles and routes,
* and because the amount of data that needs to be downloaded can be pretty big, I use [GitSpatial](http://gitspatial.com/) to only retrieve the data of the area shown on the screen.

Demo
====

See it in action : http://gasolineras.saliou.name/

Todo
====

* add a link to the popups to show the route from your current location to the selected station
 * right now opening a popup directly loads the route
* dynamically group the stations in 3 price groups (cheap, normal, expensive)
 * see servicios.elpais.com/gasolineras/index.html