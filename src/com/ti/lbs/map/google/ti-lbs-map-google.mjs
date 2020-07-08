const _M = {
  /////////////////////////////////////////
  data : ()=>({
    myCenter: undefined,
    myZoom : undefined,
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
    "center" : {
      type : Object,
      default : undefined
    },
    "zoom" : {
      type : Number,
      default : undefined
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
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    MapTypeId() {
      return (google.maps.MapTypeId[this.mapType]) 
             || google.maps.MapTypeId.ROADMAP
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    draw_center_marker() {
      let lalCenter = this.$map.getCenter()
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
    draw_as_point(name, items=[]) {
      if(!name) {
        throw "draw_as_point without layer name!"
      }
      // Draw in loop
      let list = []
      for(let it of items) {
        let marker = new google.maps.Marker({
          position: it,
          map: this.$map,
          title: it.title
        })
        list.push(marker)
      }
      this.myLayers[name] = list
    },
    //-------------------------------------
    drawLayers() {
      console.log("drawLayers")
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
        console.log(lay)
        let name = lay.name || `Layer-${i}`
        i++
        this[`draw_as_${lay.type}`](name, lay.items)
      }
      //...................................
    },
    //-------------------------------------
    cleanLayers(name) {
      console.log("cleanLayers")
      if(name) {
        let list = this.myLayers[name]
        _.forEach(list, li=>{
          li.setMap(null)
        })
        this.myLayers[name] = undefined
      }
      // Clean all
      else {
        _.forEach(this.myLayers, (list)=>{
          for(let it of list) {
            it.setMap(null)
          }
        })
        // Reset
        this.myLayers = {}
      }
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    //"value" : function(){this.drawValue()}
    "layers": function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.cleanLayers()
        this.drawLayers()
      }
    },
    "center": function(newVal, oldVal) {
      if(_.isUndefined(this.myCenter)) {
        console.log("google center changed", {newVal, oldVal})
        this.myCenter = newVal
        this.$map.panTo(newVal)
      }
    },
    "zoom": function(newVal) {
      if(_.isUndefined(this.myZoom)) {
        this.myZoom = newVal
        this.$map.setZoom(newVal)
      }
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    // Init Map
    console.log("mounted", this.zoom, this.center)
    this.$map = new google.maps.Map(this.$refs.arena, {
      zoom: this.zoom,
      center: this.center,
      mapTypeId: this.MapTypeId,
      //...................................
      center_changed: ()=>{
        if(this.pinCenter) {
          let lal = this.draw_center_marker()
          //console.log(lal.toJSON())
          this.$emit("center:change", lal.toJSON())
        }
      },
      //...................................
      zoom_changed: ()=> {
        this.$emit("zoom:change", this.$map.getZoom())
      }
      //...................................
    })
    // Save 
    this.myZoom = this.zoom
    this.myCenter = this.center
    // Draw Value
    this.drawLayers()
  }
  //////////////////////////////////////////
}
export default _M;