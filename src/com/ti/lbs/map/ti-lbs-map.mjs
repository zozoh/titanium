const _M = {
  /////////////////////////////////////////
  data : ()=>({
    fullScreen : false,
    myZoom: undefined,
    myMapType: undefined
  }),
  /////////////////////////////////////////
  props : {
    "by" : {
      type : String,
      default : "tencent"
    },
    // @see https://lbs.qq.com/javascript_v2/doc/maptypeid.html
    // @see http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a5b0
    // ROADMAP | SATELLITE | HYBRID | TERRAIN(google only)
    "mapType" : {
      type : String,
      default : "ROADMAP"
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
    // A LatLng Point Object or Polygon Array in map
    // Point - Map center will be it
    // Polygon - Auto count the map center
    "value" : {
      type : [Object, Array],
      default : null
    },
    // Display mode
    //  - auto  : base on the value
    //  - point : show marker on map by value
    //  - path  : show path on map by value
    //  - area  : show polygon on map by value
    "mode" : {
      type: String,
      default: "auto",
      validator: v=>/^(auto|point|path|area)$/.test(v)
    },
    "keepStateBy": {
      type: String,
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    TopClass() {
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
    TopStyle() {
      if(!this.fullScreen) {
        return Ti.Css.toStyle({
          width  : this.width,
          height : this.height
        })
      }
    },
    //-------------------------------------
    ToggleIcon() {
      return this.fullScreen
        ? "zmdi-fullscreen-exit"
        : "zmdi-fullscreen"
    },
    //-------------------------------------
    MapComType() {
      return `ti-lbs-map-${this.by}`
    },
    //-------------------------------------
    MapComConf() {
      return {
        "center"  : this.MapCenter,
        "mapType" : Ti.Util.fallback(this.myMapType, this.mapType),
        "zoom"    : Ti.Util.fallback(this.myZoom, this.zoom),
        ...this.MapComConfByMode
      }
    },
    //-------------------------------------
    MapComConfByMode() {
      // Prepare mode functions
      let fns = {
        //.........................
        auto(val) {
          if(_.isArray(val)) {
            return fns.path(val)
          }
          return fns.point(val)
        },
        //.........................
        point(val) {
          return {
            pinCenter: true
          }
        },
        //.........................
        path(val) {
          if(!this.LalValue)
            return {}
          return {
            pinCenter: false,
            layers: [{
              type: "path",
              items: _.concat(val)
            }]
          }
        },
        //.........................
        area(val) {
          if(!this.LalValue)
            return {}
          return {
            pinCenter: false,
            layers: [{
              type: "area",
              items: _.concat(val)
            }]
          }
        }
        //.........................
      }
      return fns[this.mode](this.LalValue)
    },
    //-------------------------------------
    TargetCoordinate() {
      return ({
        "tencent" : "GCJ02",
        "baidu"   : "BD09",
        "ali"     : "GCJ02"
      })[this.by] || "WGS84"
    },
    //-------------------------------------
    LalValue() {
      // Guard
      if(!this.value) {
        return {lat:39.908765655793395, lng:116.39748860418158}
      }
      // Polygon
      if(_.isArray(this.value)) {
        let list = []
        for(let it of this.value) {
          let lal = this.genLngLat(it)
          list.push(_.assign({}, it, lal))
        }
        return list
      }
      // Point
      let lal = this.genLngLat(this.value)
      return _.assign({}, this.value, lal)
    },
    //-------------------------------------
    MapCenter() {
      // Guard
      if(!this.LalValue) {
        return
      }
      // Polygon
      if(_.isArray(this.LalValue)) {
        let lng_max = 0;
        let lng_min = 0;
        let lat_max = 0;
        let lat_min = 0;
        for(let lal of this.LalValue) {
          lng_max = Math.max(lng_max, lal.lng)
          lng_min = Math.min(lng_min, lal.lng)
          lat_max = Math.max(lat_max, lal.lat)
          lat_min = Math.min(lat_min, lal.lat)
        }
        let lng = (lng_max-lng_min)/2
        let lat = (lat_max-lat_min)/2
        return {lng, lat}
      }
      // Point
      return _.pick(this.LalValue, "lng", "lat")
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    OnCenterChange(lal) {
      this.$notify("change", lal)
    },
    //-------------------------------------
    OnZoomChange(zoom) {
      this.saveState({zoom})
    },
    //-------------------------------------
    autoLatLng(val) {
      if(val > 360) {
        return val / this.autoFloat
      }
      return val
    },
    //-------------------------------------
    genLngLat({lat, lng}={}) {
      lat = this.autoLatLng(lat)
      lng = this.autoLatLng(lng)

      // Transform coordinate
      let from = this.coordinate
      let to   = this.TargetCoordinate

      if(from == to) {
        return {lat, lng}
      }

      // find the trans-methods
      let methodName = `${from}_TO_${to}`

      // like `WGS84_TO_BD09` or `WGS84_TO_GCJ02`
      let fn = Ti.GPS[methodName]

      return fn(lat, lng)
    },
    //-------------------------------------
    saveState(st) {
      if(this.keepStateBy) {
        let state = Ti.Storage.session.getObject(this.keepStateBy)
        _.assign(state, st)
        Ti.Storage.session.setObject(this.keepStateBy, state)
      }
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    // "value": function(newVal, oldVal) {
    //   console.log("value is changed")
    // }
  },
  //////////////////////////////////////////
  created: function() {
    if(this.keepStateBy) {
      let state = Ti.Storage.session.getObject(this.keepStateBy)
      this.myMapType = state.mapType
      this.myZoom = state.zoom
    }
  }
  //////////////////////////////////////////
}
export default _M;