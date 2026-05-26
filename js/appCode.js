import * as turfPractice from "./turfPractice.js"
import * as layers from "./layers.js"

// Initialize — centered on full Tartu extent for Lesson 7
let map = L.map('map', {
  center: [58.3780, 26.7290],
  zoom: 13,
  zoomControl: true
})

map.zoomControl.setPosition('topright')

map.createPane('customDistrictsPane')
map.getPane('customDistrictsPane').style.zIndex = 390


// Default view function 
export function defaultMapSettings() {
  map.setView([58.3780, 26.7290], 13)
}

// Base layers
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors'
})

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS community',
  maxZoom: 19
})

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
})

const baseLayers = {
  "OpenStreetMap": osmLayer,
  "Satellite": satelliteLayer,
  "Topographic": topoLayer
}


// Overlay layer variables
let districtsLayer
let choroplethLayer
let heatMapLayer
let markersLayer

// Track active WMS layers
let activeWmsLayers = {}


// District color by OBJECTID
function getDistrictColor(id) {
  switch (id) {
    case 1:  return '#ff0000'
    case 13: return '#009933'
    case 6:  return '#0000ff'
    case 7:  return '#ff0066'
    default: return '#ffffff'
  }
}


// Districts with styles
async function loadDistrictsLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson')
    const data = await response.json()

    districtsLayer = L.geoJson(data, {
      style: function(feature) {
        return {
          fillColor: getDistrictColor(feature.properties.OBJECTID),
          fillOpacity: 0.5,
          weight: 1,
          opacity: 1,
          color: 'grey'
        }
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.NIMI || 'District ' + feature.properties.OBJECTID)
      },
      pane: 'customDistrictsPane'
    })
  } catch (error) {
    console.error("Error loading districts data:", error)
  }
}

// Choropleth
async function loadChoroplethLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson')
    const data = await response.json()

    choroplethLayer = L.choropleth(data, {
      valueProperty: 'OBJECTID',
      scale: ['#e6ffe6', '#004d00'],
      steps: 11,
      mode: 'q',
      style: {
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup('Value: ' + feature.properties.OBJECTID)
      },
      pane: 'customDistrictsPane'
    })
  } catch (error) {
    console.error("Error loading choropleth data:", error)
  }
}

// Heat map
async function loadHeatMapLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()

    const heatData = data.features.map(function(feature) {
      return [
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        feature.properties.area || 1
      ]
    })

    heatMapLayer = L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17
    })
  } catch (error) {
    console.error("Error loading heatmap data:", error)
  }
}

// Clustered markers
async function loadMarkersLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()

    const geoJsonLayer = L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: 'red',
          fillOpacity: 0.5,
          color: 'red',
          weight: 1,
          opacity: 1
        })
      },
      onEachFeature: function(feature, layer) {
        if (feature.properties) {
          layer.bindPopup('Cell Tower<br>Area: ' + (feature.properties.area || 'Unknown'))
        }
      }
    })

    markersLayer = L.markerClusterGroup()
    markersLayer.addLayer(geoJsonLayer)
  } catch (error) {
    console.error("Error loading markers data:", error)
  }
}


// Load WMS layers and register them in overlayLayers and activeWmsLayers
function loadWmsLayers(layersList, overlayLayers, activeWmsLayersObj) {
  layersList.forEach(layer => {
    // Create a dedicated pane for proper z-index ordering
    let paneName = `${layer.layers}-pane`
    map.createPane(paneName)
    map.getPane(paneName).style.zIndex = layer.zIndex

    let newLayer = L.tileLayer.wms(layer.url, {
      version: layer.version,
      layers: layer.layers,
      format: layer.format,
      transparent: layer.transparent,
      zIndex: layer.zIndex,
      pane: paneName,
    })

    // Register in layer control
    overlayLayers[layer.title.en] = newLayer

    // Track active state (false = inactive by default)
    activeWmsLayersObj[layer.layers] = false
  })
}


// Toggle the active state of a WMS layer
function toggleActiveState(layerId, boolean) {
  if (typeof(activeWmsLayers[layerId]) == "boolean") {
    activeWmsLayers[layerId] = boolean
  }
}


// Build a GetFeatureInfo request URL
function buildRequestUrl(e, baseUrl, layerName) {
  const bounds = map.getBounds()
  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ].join(',')

  const size = map.getSize()
  const sizeX = size.x
  const sizeY = size.y

  const xPoint = Math.floor(e.containerPoint.x)
  const yPoint = Math.floor(e.containerPoint.y)

  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    query_layers: layerName,
    layers: layerName,
    info_format: 'application/json',
    x: xPoint,
    y: yPoint,
    srs: 'EPSG:4326',
    width: sizeX,
    height: sizeY,
    bbox: `${bbox}`
  })

  return baseUrl + params
}


// Get human-readable layer title from layers list
function getLayerName(layersData, layerName) {
  const found = layersData.filter(entry => entry.layers == layerName)
  return found[0].title.en
}


// Fetch WMS feature info and display in the info box
function fetchWmsData(fullUrl, layerName) {
  fetch(fullUrl)
    .then(response => response.json())
    .then(data => {
      const content = document.getElementById('info-content')

      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const props = feature.properties
        const title = getLayerName(layers.wmsLayers, layerName)
        let html = `<h4>${title}</h4><ul>`
        for (const key in props) {
          html += `<li><strong>${key}:</strong> ${props[key]}</li>`
        }
        html += '</ul>'
        content.innerHTML += html
      } else {
        const title = getLayerName(layers.wmsLayers, layerName)
        content.innerHTML += `<em>No features found for ${title}</em><br>`
      }
    })
    .catch(error => {
      console.error('Request failed:', error)
    })
}


// Initialize layers / controls
async function initializeLayers() {

  await Promise.all([
    loadDistrictsLayer(),
    loadChoroplethLayer(),
    loadHeatMapLayer(),
    loadMarkersLayer()
  ])

  const overlayLayers = {
    "Tartu districts": districtsLayer,
    "Choropleth layer": choroplethLayer,
    "Heatmap": heatMapLayer,
    "Markers": markersLayer
  }

  // Load WMS layers into overlay list and active-state tracker
  loadWmsLayers(layers.wmsLayers, overlayLayers, activeWmsLayers)

  const layerControlOptions = {
    collapsed: false,
    position: 'topleft'
  }

  const layerControl = L.control.layers(baseLayers, overlayLayers, layerControlOptions)
  layerControl.addTo(map)

  // Only the base map is shown on load; overlay layers are toggled via the control
  osmLayer.addTo(map)

  // WMS overlay add/remove event handlers 
  map.on('overlayadd', (event) => {
    const layerId = event.layer.options.layers
    toggleActiveState(layerId, true)
  })

  map.on('overlayremove', (event) => {
    const layerId = event.layer.options.layers
    toggleActiveState(layerId, false)
  })

  //  Map click: query all active WMS layers 
  map.on('click', function(event) {
    // Reset info window content on each new click
    const infoWindowContent = document.getElementById('info-content')
    infoWindowContent.innerHTML = ""

    let anyActive = false
    Object.entries(activeWmsLayers).forEach(([key, value]) => {
      if (value == true) {
        anyActive = true
        const fullUrl = buildRequestUrl(event, 'https://landscape-geoinformatics.ut.ee/geoserver/pa2023/wms?', key)
        fetchWmsData(fullUrl, key)
      }
    })

    if (anyActive) {
      document.getElementById('info-box').style.display = 'block'
    }
  })

  // Close button for info box 
  document.getElementById('info-close').addEventListener('click', () => {
    document.getElementById('info-box').style.display = 'none'
  })

  // Run Turf.js exercises, passing the map so features can be added to it
  turfPractice.turfFunctions(map)
}

// Run initialization
initializeLayers()
