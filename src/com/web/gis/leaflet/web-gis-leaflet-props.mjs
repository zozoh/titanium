export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : {
    type : [Array, Object]
  },
  // - obj         : {lat, lng} 
  // - obj-list    : [{lat, lng}..]
  // - pair        : [lat, lng]
  // - pair-list   : [[lat, lng]..]
  // - geojson     : {type:"Point"...}
  "valueType" : {
    type : String,
    default : "obj",
    validator: v => /^(geojson|(obj|pair)(-list)?)$/.test(v)
  },
  // - WGS84
  // - GCJ02
  // - BD09
  "valueCoords" : {
    type : String,
    default : "WGS84",
    validator: v => /^(WGS84|GCJ02|BD09)$/.test(v)
  },
  "latlngPrecise" : {
    type : Number,
    default : 5
  },
  "displayType" : {
    type : String,
    default : "Point",
    validator: v => /^(Point|Cluster|Polyline|Polygon|Rectangle|Circle|GeoJson)$/.test(v)
  },
  "circleRadius" : {
    type : Number,
    default : 100   // In meters
  },
  "defaultLocation" : {
    type : Object,
    default : ()=>({
      lat: 39.97773512677837,
      lng: 116.3385673945887
    })
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "minZoom" : {
    type : Number,
    default : 1
  },
  "maxZoom" : {
    type : Number,
    default : 18
  },
  "zoom" : {
    type : Number,
    default : 14
  },
  "keepZoomBy" : {
    type : String,
    default : undefined
  },
  "mapOptions" : {
    type : Object,
    default : ()=>({})
  },
  "showMarker" : {
    type : Boolean,
    default : false
  },
  "editPoint" : {
    type : String,
    default : "none",
    validator : v=>/^(none|drag|pin)$/.test(v)
  },
  "autoFitBounds" : {
    type : Boolean,
    default : true
  },
  "fitBoundsBy" : {
    type : Object,
    default : ()=>({
      padding: [50, 50]
    })
  },
  "showInfo" : {
    type : [Boolean, Object],
    default : ()=>({
      
    })
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "markerIcon" : {
    type : [String, Object],
    //default : "png/map-pin-1.png"
    default : undefined
  },
  "markerIconOptions" : {
    type : Object,
    default: ()=>({})
  },
  // String : html template
  // Array  : list
  // Object : pair table
  // Function : customized HTML
  "markerPopup" : undefined,
  "markerPopupOptions" : {
    type : Object,
    default: ()=>({
      offset : [0, -40]
    })
  },
  "imageIconBase" : {
    type : String,
    default : "/gu/rs/ti/icons/"
  },
  "baseTileLayer" : {
    type : String,
    default: "QQ_VECTOR_NOTE"
  },
  "noteTileLayer" : {
    type : String,
    default: null
  },
  "aspect" : {
    type : Object,
    default: ()=>({})
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : undefined
  },
  "height" : {
    type : [Number, String],
    default : undefined
  }
}