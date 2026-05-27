// turfPractice.js — Turf.js exercises (Lesson 6)
 
function turfFunctions(map) {
 
  // Point 
  // Jakob Hurt statue in front of Vanemuise 46
  const pointCoords = [26.71552, 58.37393]
  const myPoint = turf.point(pointCoords)
  const geoJSON_point = L.geoJSON(myPoint)
  geoJSON_point.addTo(map)
 
  // LineString 
  // Walkways in the park
  const lineCoords = [
    [26.71379, 58.37476],
    [26.71554, 58.37349],
    [26.71553, 58.37434],
    [26.71630, 58.37378],
    [26.71473, 58.37407]
  ]
  const myLine = turf.lineString(lineCoords)
  L.geoJSON(myLine).addTo(map)
 
  // Polygon 
  // Park boundary 
  const polygonCoords = [[
    [26.71355, 58.37468],
    [26.71404, 58.37430],
    [26.71433, 58.37429],
    [26.71550, 58.37345],
    [26.71660, 58.37388],
    [26.71615, 58.37420],
    [26.71589, 58.37431],
    [26.71552, 58.37461],
    [26.71521, 58.37496],
    [26.71480, 58.37481],
    [26.71449, 58.37502],
    [26.71355, 58.37468]
  ]]
  const myPolygon = turf.polygon(polygonCoords)
  L.geoJSON(myPolygon).addTo(map)
 
  // Distance 
  // Second point: near the pond
  const pondCoords = [26.71489, 58.37439]
  const myPoint2 = turf.point(pondCoords)
  L.geoJSON(L.geoJSON(myPoint2)).addTo(map)
 
  const options = { units: 'meters' }
  const distance = turf.distance(myPoint, myPoint2, options)
  const distanceRounded = Math.round(distance * 100) / 100
  console.log(`Distance between statue and pond point: ${distanceRounded} meters`)
 
  // Area 
  const areaMeasurement = turf.area(myPolygon)
  const areaRounded = Math.round(areaMeasurement)
  console.log(`Park polygon area: ${areaRounded} square meters`)
 
  // Buffer 
  const statueBuffer = turf.buffer(myPoint, 20, { units: 'meters' })
  L.geoJSON(statueBuffer).addTo(map)
 
  const lineBuffer = turf.buffer(myLine, 5, { units: 'meters' })
   L.geoJSON(lineBuffer).addTo(map)   
 
  const parkBuffer = turf.buffer(myPolygon, 10, { units: 'meters' })
  L.geoJSON(parkBuffer).addTo(map)   
 
  const parkBufferNegative = turf.buffer(myPolygon, -10, { units: 'meters' })
   L.geoJSON(parkBufferNegative).addTo(map)   
 
  //  Envelope 
  const outerPoint = turf.point([26.71216, 58.37428])
  L.geoJSON(outerPoint).addTo(map)
 
  const features = turf.featureCollection([myPoint, outerPoint, myLine, myPolygon])
  const enveloped = turf.envelope(features)
  L.geoJSON(enveloped).addTo(map)
 
  //  NEW FUNCTION: turf.centroid 
  // turf.centroid computes the geometric centre of any GeoJSON feature or
  // feature collection. Here, I find the centroid of the park polygon and
  // add it to the map as a distinct orange marker so it is easy to spot.
  //
  // Documentation: https://turfjs.org/docs/api/centroid
  const parkCentroid = turf.centroid(myPolygon)

  // force centroid visibility on top
  if (!map.getPane('centroidPane')) {
    map.createPane('centroidPane')
    map.getPane('centroidPane').style.zIndex = 650
  }
 
  // Style the centroid point as an orange circle marker to stand out
  L.geoJSON(parkCentroid, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: '#ff8c00',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).bindPopup('Park centroid (turf.centroid)')
    }
  }).addTo(map)
 
  const centroidCoords = parkCentroid.geometry.coordinates
  console.log(`Park centroid: lng=${centroidCoords[0].toFixed(5)}, lat=${centroidCoords[1].toFixed(5)}`)
  
}
 
export { turfFunctions }