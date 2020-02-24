export default {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    fullScreen : false
  }),
  /////////////////////////////////////////
  props : {
    "by" : {
      type : String,
      default : "tencent"
    },
    // @see https://lbs.qq.com/javascript_v2/doc/maptypeid.html
    // @see http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a5b0
    // ROADMAP | SATELLITE | HYBRID
    "mapType" : {
      type : String,
      default : "ROADMAP"
    },
    // Map center : {"lat":39.9042, "lng":116.4074}
    // If null, it will auto sync with the value
    "center" : {
      type : Object,
      // default : ()=>({
      //   {"lat":39.9042, "lng":116.4074}
      // })
      default : null
    },
    // Sometime, the lat/lng valued by integer
    // this prop defined how to translate them to float
    "autoFloat" : {
      type : Number,
      default : 10000000
    },
    // Map width
    "width" : {
      type : [String, Number],
      default : 400
    },
    // Map height
    "height" : {
      type : [String, Number],
      default : 400
    },
    "zoom" : {
      type : Number,
      default : 8
    },
    // The Coordinate System for input LatLng (center/value...)
    //  - WGS84 : Standard GPS 
    //  - BD09  : for Baidu Map
    //  - GCJ02 : (Mars) QQ/GaoDe/AliYun ...
    "coordinate" : {
      type : String,
      default : "WGS84"
    },
    // A LatLng Point in map, which react the changing
    "value" : {
      type : Object,
      default : null
    },
    // The layout which cover to the map
    // TODO think about it
    "layers" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    topClass() {
      let klass = []
      if(this.fullScreen) {
        klass.push("is-fullscreen")
      }
      if(this.className) {
        klass.push(this.className)
      }
      return klass
    },
    //-------------------------------------
    topStyle() {
      if(!this.fullScreen) {
        return Ti.Css.toStyle({
          width  : this.width,
          height : this.height
        })
      }
    },
    //-------------------------------------
    toggleIcon() {
      return this.fullScreen
        ? "zmdi-fullscreen-exit"
        : "zmdi-fullscreen"
    },
    //-------------------------------------
    mapComType() {
      return `ti-lbs-map-${this.by}`
    },
    //-------------------------------------
    mapComConf() {
      return {
        "mapType" : this.mapType,
        "center"  : this.lalnCenter,
        "zoom"    : this.zoom,
        "value"   : this.lalnValue,
        "valueOptions" : this.valueOptions
      }
    },
    //-------------------------------------
    targetCoordinate() {
      return ({
        "tencent" : "GCJ02",
        "baidu"   : "BD09",
        "ali"     : "GCJ02"
      })[this.by] || "WGS84"
    },
    //-------------------------------------
    arenaStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //-------------------------------------
    lalnValue() {
      if(!_.isEmpty(this.center)) {
        return this.genLatLng(this.center)
      }
      if(!_.isEmpty(this.value)) {
        return this.genLatLng(this.value)
      }
      // Default center to beijing
      return new qq.maps.LatLng({lat:39.9042, lng:116.4074})
    },
    //-------------------------------------
    lalnCenter() {
      if(!_.isEmpty(this.center)) {
        return this.genLatLng(this.center)
      }
      if(!_.isEmpty(this.value)) {
        return this.genLatLng(this.value)
      }
      // Default center to beijing
      return new qq.maps.LatLng({lat:39.9042, lng:116.4074})
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    autoLatLng(val) {
      if(val > 360) {
        return val / this.autoFloat
      }
      return val
    },
    //-------------------------------------
    genLatLng({lat, lng}={}) {
      lat = this.autoLatLng(lat)
      lng = this.autoLatLng(lng)

      // Transform coordinate
      let from = this.coordinate
      let to   = this.targetCoordinate

      if(from == to) {
        return {lat, lng}
      }

      // find the trans-methods
      let methodName = `${from}_TO_${to}`

      // like `WGS84_TO_BD09` or `WGS84_TO_GCJ02`
      let fn = Ti.GPS[methodName]

      return fn(lat, lng)
    }
  }
  //////////////////////////////////////////
}