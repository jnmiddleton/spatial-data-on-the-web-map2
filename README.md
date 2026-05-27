# Spatial Data on the Web: Map 2 (Phase 2)

This project is my phase two rendering of an interactive web mapping application focused on Tartu, Estonia, created for the University of Tartu's Spring 2026 course Spatial Data on the Web. It extends the first project with a unified multi-layer interface, geospatial analysis via Turf.js, and live WMS layer querying.


## Core Features
- Unified Layer Control: All visualizations from Map 1 are combined into a single interactive application with a base layer switcher (OpenStreetMap, Satellite, Topographic) and toggleable overlay layers.
- Overlay Layers: Tartu city districts with custom styling, a choropleth map, a clustered cell tower marker layer, and a heatmap, all ordered using custom Leaflet map panes.
- Turf.js Geospatial Analysis: Points, lines, and polygons drawn near Vanemuise 46. Includes spatial operations covered in the lesson (distance, area, buffer, envelope, pointsWithinPolygon) plus an additional Turf function (see below).
- WMS Layers: Three Estonian Rescue Board layers loaded dynamically - rescue command points, 5-minute coverage polygons, and 10-minute coverage polygons - with correct z-index ordering via custom map panes.
- WMS Query Panel: Clicking an active WMS layer opens a results panel displaying the queried feature's properties.


## Additional Turf Function
For the bonus Turf function, I used **`turf.centroid()`**, which computes the geometric center of any GeoJSON feature. I used it to find the centroid of the park polygon near Vanemuise 46. The result is added to the map as an orange circle marker with a popup labelled "Park centroid (turf.centroid)", and the coordinates are also logged to the browser console. To see it, zoom into the Vanemuise 46 area after the map loads. The orange dot marks the center of the park polygon.


## Data and Libraries
- GeoJSON: District boundaries and cell tower locations for Tartu, Estonia were provided by the course instructor.
- WMS: Estonian Rescue Board layers served via the University of Tartu's GeoServer (landscape-geoinformatics.ut.ee).
- Libraries: Leaflet.js, Leaflet.markercluster, Leaflet-choropleth, Leaflet.heat, Turf.js.


## Repository Structure
```
spatial-data-on-the-web-map2/
    ├── README.md
    ├── index.html
    ├── css/
        └── appStyle.css
    ├── js/
        ├── appCode.js
        ├── turfPractice.js
        ├── layers.js
        └── points.js
    └── geojson/
        ├── tartu_city_districts_edu.geojson
        └── tartu_city_celltowers_edu.geojson
```


## Further Reading
The interactive web rendering is available on my [ePortfolio](https://sites.google.com/view/jessicamiddleton-eportfolio/selected-geospatial-visualizations/interactive-web-mapping) or at [jnmiddleton.github.io/spatial-data-on-the-web-map2](jnmiddleton.github.io/spatial-data-on-the-web-map2).
