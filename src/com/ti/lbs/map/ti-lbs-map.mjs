const _M = {
  /////////////////////////////////////////
  data : ()=>({
    myUpTime: undefined,  
    myWaitCooling: false,  
    myFullscreen : false,
    myMapCenter: undefined,
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
    },
    "cooling": {
      type: Number,
      default: 1200
    },
    "maxZoom": {
      type: Number,
      default: 22
    },
    "minZoom": {
      type: Number,
      default: 1
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-fullscreen": this.myFullscreen
      })
    },
    //-------------------------------------
    TopStyle() {
      if(!this.myFullscreen) {
        return Ti.Css.toStyle({
          width  : this.width,
          height : this.height
        })
      }
    },
    //-------------------------------------
    ToggleIcon() {
      return this.myFullscreen
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
        "mapType" : this.myMapType,
        "zoom"    : this.myZoom,
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
          if(!val)
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
          if(!val)
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
      if(_.isEmpty(this.value)) {
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
      if(this.myMapCenter) {
        return this.myMapCenter
      }
      // Guard
      if(!this.LalValue) {
        return
      }
      // Polygon
      if(_.isArray(this.LalValue)) {
        return this.getBounds(this.LalValue)
      }
      // Point
      return _.pick(this.LalValue, "lng", "lat")
    },
    //-------------------------------------
    MapActionBar() {
      return {
        items: [{
            className: "big-icon",
            icon: this.myFullscreen
              ? "im-minimize"
              : "im-maximize",
            action: ()=>this.myFullscreen = !this.myFullscreen
          }, {
            icon: "far-map",
            text: "i18n:map-type",
            altDisplay: [{
                icon: "fas-road",
                text: "i18n:map-roadmap",
                match: {myMapType:"ROADMAP"}
              }, {
                icon: "fas-satellite",
                text: "i18n:map-satellite",
                match: {myMapType:"SATELLITE"}
              }, {
                icon: "fas-globe-asia",
                text: "i18n:map-hybrid",
                match: {myMapType:"HYBRID"}
              }, {
                icon: "fas-drafting-compass",
                text: "i18n:map-terrain",
                match: {myMapType:"TERRAIN"}
              }],
            items: [{
                icon: "fas-road",
                text: "i18n:map-roadmap",
                highlight: {myMapType:"ROADMAP"},
                action: ()=>this.myMapType = "ROADMAP"
              }, {
                icon: "fas-globe-asia",
                text: "i18n:map-hybrid",
                highlight: {myMapType:"HYBRID"},
                action: ()=>this.myMapType = "HYBRID"
              }, {
                icon: "fas-satellite",
                text: "i18n:map-satellite",
                highlight: {myMapType:"SATELLITE"},
                action: ()=>this.myMapType = "SATELLITE"
              }, {
                icon: "fas-drafting-compass",
                text: "i18n:map-terrain",
                highlight: {myMapType:"TERRAIN"},
                action: ()=>this.myMapType = "TERRAIN"
              }]
          }, {
            className: "big-icon",
            icon: "im-plus",
            wait: 1200,
            action: ()=>this.zoomMap(1)
          }, {
            className: "big-icon",
            icon: "im-minus",
            wait: 1200,
            action: ()=>this.zoomMap(-1)
          }],
        status: this
      }
    },
    //-------------------------------------
    CoolingIcon() {
      if(this.myUpTime > 0) {
        if(this.myWaitCooling){
          return "fas-spinner fa-spin"
        }
        return "zmdi-check-circle"
      }
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    OnCenterChange(lal) {
      this.myMapCenter = lal
      if(this.MapComConfByMode.pinCenter) {
        this.myUpTime = Date.now()
        if(!this.myWaitCooling) {
          this.checkUpdate()
        }
      }
    },
    //-------------------------------------
    OnZoomChange(zoom) {
      this.myZoom = zoom
      this.saveState({zoom})
    },
    //-------------------------------------
    zoomMap(offset) {
      let zoom = this.myZoom + offset
      if(_.inRange(zoom, this.minZoom, this.maxZoom+1)) {
        this.myZoom = zoom
        this.saveState({zoom})
      }
    },
    //-------------------------------------
    isCoolDown() {
      if(!this.myUpTime) {
        return true
      }
      let du = Date.now() - this.myUpTime
      return du > this.cooling
    },
    //-------------------------------------
    checkUpdate() {
      if(this.isCoolDown()) {
        let lal = _.pick(this.myMapCenter, "lng", "lat")
        //console.log("notify change", lal)
        this.$notify("change", lal)
        this.myWaitCooling = false
        _.delay(()=>{
          this.myUpTime = undefined
        }, 1000)
      }
      // Wait
      else {
        this.myWaitCooling = true
        let du = Date.now() - this.myUpTime
        //console.log("wait cooling", this.cooling, du)
        _.delay(()=>{
          this.checkUpdate()
        }, this.cooling)
      }
    },
    //-------------------------------------
    /*
    CROSS MODE:
          lng:180        360:0                 180
          +----------------+------------------NE  lat:90
          |                |           lng_min|lat_max
          |                |                  |
          +----------------+------------------+-- lat:0
          |                |                  |
   lat_min|lng_max         |                  |
          SW---------------+------------------+   lat:-90
    
    SIDE MODE:
          lng:0           180                360
          +----------------+------------------NE  lat:90
          |                |           lng_max|lat_max
          |                |                  |
          +----------------+------------------+-- lat:0
          |                |                  |
   lat_min|lng_min         |                  |
          SW---------------+------------------+   lat:-90
    
    @return [SW, NE]
    */
    getBounds(lalList=[]) {
      let lng_max = undefined;
      let lng_min = undefined;
      let lat_max = undefined;
      let lat_min = undefined;
      for(let lal of this.LalValue) {
        lng_max = _.isUndefined(lng_max)
                    ? lal.lng : Math.max(lng_max, lal.lng)
        lng_min = _.isUndefined(lng_min)
                    ? lal.lng : Math.min(lng_min, lal.lng)
        lat_max = _.isUndefined(lat_max)
                    ? lal.lat : Math.max(lat_max, lal.lat)
        lat_min = _.isUndefined(lat_min)
                    ? lal.lat : Math.min(lat_min, lal.lat)
      }
      // Cross mode
      if((lng_max-lng_min) > 180) {
        return [
          {lat: lat_min, lng:lng_max},
          {lat: lat_max, lng:lng_min}]
      }
      // Side mode
      return [
        {lat: lat_min, lng:lng_min},
        {lat: lat_max, lng:lng_max}]      
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
    "value": function() {
      if(_.isUndefined(this.myUpTime)) {
        this.myMapCenter = undefined
      }
    },
    "myFullscreen": function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.$notify("change:fullscreen", newVal)
      }
    }
  },
  //////////////////////////////////////////
  created: function() {
    this.myMapType = this.mapType
    this.myZoom = this.zoom
    if(this.keepStateBy) {
      let state = Ti.Storage.session.getObject(this.keepStateBy)
      this.myMapType = state.mapType || this.mapType
      this.myZoom = state.zoom || this.zoom
    }
  }
  //////////////////////////////////////////
}
export default _M;