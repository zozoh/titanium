const _M = {
  /////////////////////////////////////////
  data : ()=>({
    mySyncTime : undefined,
    myUpTime: undefined,
    myCenterMarker: undefined,
    myLayers: {}
  }),
  /////////////////////////////////////////
  props : {
    // @see https://developers.google.com/maps/documentation/javascript/maptypes?hl=zh_CN
    // ROADMAP | SATELLITE | HYBRID | TERRAIN
    "mapType" : {
      type : String,
      default : "ROADMAP"
    },
    // Map center : {"lat":39.9042, "lng":116.4074}
    // If null, it will auto sync with the value
    // If Array, mean bounds
    // [sw, ne]
    //  sw: LatLng, ne: LatLng
    "center" : {
      type : [Object, Array],
      default : undefined
    },
    "zoom" : {
      type : Number,
      default : undefined
    },
    "bounds": {
      type: Array,
      default: undefined
    },
    /*
    [{
      name:"xxx",
      type:"point|path|area"
      items: [{lat,lng,title,icon}]
    }]
    */
    "layers": {
      type: Array,
      default: ()=>[]
    },
    "pinCenter": {
      type: Boolean,
      default: false
    },
    "cooling": {
      type: Number,
      default: 1000
    },
    "maxZoom": {
      type: Number,
      default: 22
    },
    "minZoom": {
      type: Number,
      default: 1
    },
    "boundPadding": {
      type: [Object, Number],
      default: 10
    },
    "stroke": {
      type: Object,
      default: ()=>({
        color: "#08F",
        opacity: 0.8,
        weight: 8
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    MapTypeId() {
      return this.getMapTypeId(this.mapType)
    },
    //-------------------------------------
    MapCenter() {
      // Bound
      if(_.isArray(this.center)) {
        let [sw, ne] = this.center
        return {
          lat: (sw.lat - ne.lat)/2 + ne.lat,
          lng: (sw.lng - ne.lng)/2 + ne.lng
        }
      }
      // Point
      return this.center
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    isCoolDown() {
      if(!this.myUpTime) {
        return true
      }
      let du = Date.now() - this.myUpTime
      return du > this.cooling
    },
    //-------------------------------------
    isInSync() {
      if(!this.mySyncTime) {
        return false
      }
      let du = Date.now() - this.mySyncTime
      return du < this.cooling
    },
    //-------------------------------------
    getMapTypeId(mapType="ROADMAP") {
      return (google.maps.MapTypeId[mapType]) 
             || google.maps.MapTypeId.ROADMAP
    },
    //-------------------------------------
    draw_center_marker(lalCenter) {
      if(!lalCenter)
        lalCenter = this.$map.getCenter()
      // Update
      if(this.myCenterMarker) {
        this.myCenterMarker.setPosition(lalCenter)
      }
      // Drop one
      else {
        this.myCenterMarker = new google.maps.Marker({
          position: lalCenter,
          map: this.$map
        })
      }
      return lalCenter
    },
    //-------------------------------------
    draw_as_point({name, items=[], iconSize, clickable}={}) {
      if(!name) {
        throw "draw_as_point without layer name!"
      }
      // Draw in loop
      let list = []
      for(let it of items) {
        if(it && _.isNumber(it.lat) && _.isNumber(it.lng)) {
          // Label
          let label = it.label;
          if(_.isString(label)) {
            label = {
              color: "#FFF",
              text: label
            }
          }
          // Icon
          let icon;
          if(it.src) {
            icon = {url:it.src, scaledSize:iconSize}
          }
          // Draw to map
          let marker = new google.maps.Marker({
            position: it,
            map: this.$map,
            title: it.title,
            label, icon,
            clickable
          })
          list.push(marker)
          // Event
          if(clickable) {
            marker.addListener("click", ()=>{
              this.$notify("point:click", it)
            });
          }
        }
      }
      this.myLayers[name] = list
    },
    //-------------------------------------
    draw_as_path({name, items=[], iconSize, clickable}={}) {
      if(!name) {
        throw "draw_as_path without layer name!"
      }
      // Draw points
      this.draw_as_point({
        name, 
        items, 
        iconSize,
        clickable
      })

      // Draw Path
      if(_.isArray(items) && items.length>1) {
        let it = _.first(items)
        if(it && _.isNumber(it.lat) && _.isNumber(it.lng)) {
          this.myLayers[`${name}-path`] = new google.maps.Polyline({
            map: this.$map,
            path: items,
            strokeColor   : this.stroke.color,
            strokeOpacity : this.stroke.opacity,
            strokeWeight  : this.stroke.weight
          })
        }
      }
    },
    //-------------------------------------
    drawLayers() {
      //console.log("drawLayers")
      //...................................
      // Pin Center
      if(this.pinCenter) {
        this.draw_center_marker()
      }
      //...................................
      // Guard
      if(_.isEmpty(this.layers)){
        return
      }
      //...................................
      // Loop layer
      let i = 0;
      for(let lay of this.layers) {
        //console.log(lay)
        i++
        if(!lay.name)
          lay.name = `Layer-${i}`
        this[`draw_as_${lay.type}`](lay)
      }
      //...................................
    },
    //-------------------------------------
    clearLayer(lay) {
      // Guard
      if(!lay) {
        return
      }
      // Only one map items
      if(_.isFunction(lay.setMap)) {
        lay.setMap(null)
      }
      // A group of map items
      else {
        _.forEach(lay, li=>{
          li.setMap(null)
        })
      }
    },
    //-------------------------------------
    cleanLayers(name) {
      //console.log("cleanLayers")
      // Clean center
      if(this.myCenterMarker) {
        this.myCenterMarker.setMap(null)
        this.myCenterMarker = undefined
      }
      // Clean layers
      if(name) {
        let lay = this.myLayers[name]
        this.clearLayer(lay)
        this.myLayers[name] = undefined
      }
      // Clean all
      else {
        _.forEach(this.myLayers, lay => {
          this.clearLayer(lay)
        })
        // Reset
        this.myLayers = {}
      }
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "mapType": function(newVal) {
      let mapType = this.getMapTypeId(newVal)
      this.$map.setMapTypeId(mapType)
    },
    //"value" : function(){this.drawValue()}
    "layers": function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.cleanLayers()
        this.drawLayers()
      }
    },
    "center": function(newVal, oldVal) {
      if(this.isCoolDown() && newVal) {
        this.mySyncTime = Date.now()
        // Bounds
        if(_.isArray(newVal)) {
          //console.log("google bounds changed", {newVal, oldVal})
          let sw = new google.maps.LatLng(newVal[0])
          let ne = new google.maps.LatLng(newVal[1])
          let bounds = new google.maps.LatLngBounds(sw, ne)
          this.$map.fitBounds(bounds, this.boundPadding)
        }
        // Pointer
        else if(_.isNumber(newVal.lat) && _.isNumber(newVal.lng)) {
          //console.log("google center changed", {newVal, oldVal})
          this.$map.panTo(newVal)
        }
        
      }
    },
    "zoom": function(newVal) {
      if(this.isCoolDown() && _.isNumber(newVal) && newVal>0) {
        this.$map.setZoom(newVal)
      }
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    // Init Map
    //console.log("mounted", this.zoom, this.center)
    //......................................
    this.$map = new google.maps.Map(this.$refs.arena, {
      zoom: this.zoom,
      center: this.MapCenter,
      mapTypeId: this.MapTypeId,
      //...................................
      maxZoom : this.maxZoom,
      minZoom : this.minZoom,
      //...................................
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: false,
      //...................................
      center_changed: ()=>{
        let lal = this.$map.getCenter()
        if(this.pinCenter) {
          this.draw_center_marker(lal)
        }
        if(!this.isInSync()) {
          this.myUpTime = Date.now()
          this.$emit("center:change", lal.toJSON())
        }
      },
      //...................................
      zoom_changed: ()=> {
        this.myUpTime = Date.now()
        this.$emit("zoom:change", this.$map.getZoom())
      }
      //...................................
    })
    //......................................
    // Draw Value
    this.drawLayers()
  }
  //////////////////////////////////////////
}
export default _M;