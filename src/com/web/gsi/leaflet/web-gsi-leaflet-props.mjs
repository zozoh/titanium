export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : {
    type : [Array, Object]
  },
  // - obj       : {lat, lng} 
  // - obj-list  : [{lat, lng}..]
  // - latlng      : [lat, lng]
  // - latlng-list : [[lat, lng]..]
  // - geojson   : {type:"Point"...}
  "valueType" : {
    type : String,
    default : "obj",
    validator: v => /^(geojson|(obj|latlng)(-list)?)$/.test(v)
  },
  "valueCoord" : {
    type : String,
    default : "WGS84",
    validator: v => /^(WGS84|WGS84|BD09)$/.test(v)
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
    default : 12
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "geoDisplayPrecise" : {
    type : Number,
    default : 5
  },
  "baseTileLayer" : {
    type : String,
    default: "GAODE_SATElITE"
  },
  "noteTileLayer" : {
    type : String,
    default: null
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