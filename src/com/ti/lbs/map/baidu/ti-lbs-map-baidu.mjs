//
// The coordinate base on BD09
//
export default {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    valueMarker : null
  }),
  /////////////////////////////////////////
  props : {
    // @see http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a5b0
    // ROADMAP    : BMAP_NORMAL_MAP
    // SATELLITE  : BMAP_SATELLITE_MAP
    // HYBRID     : BMAP_HYBRID_MAP
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
    "zoom" : {
      type : Number,
      default : 8
    },
    // A LatLng Point in map, which react the changing
    "value" : {
      type : Object,
      default : null
    },
    "valueOptions" : {
      type : Object,
      default : ()=>({
        icon : null,
        title : "UserMarker",
        // DOWN|BOUNCE|DROP|UP
        animation : "DOWN"
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    mapCenterLatLng() {
      if(!_.isEmpty(this.center)) {
        return this.genLatLng(this.center)
      }
      if(!_.isEmpty(this.value)) {
        return this.genLatLng(this.value)
      }
      // Default center to beijing
      return this.genLatLng({lat:39.9042, lng:116.4074})
    },
    //-------------------------------------
    mapTypeId() {
      return ({
        "ROADMAP"   : BMAP_NORMAL_MAP,
        "SATELLITE" : BMAP_SATELLITE_MAP,
        "HYBRID"    : BMAP_HYBRID_MAP
      })[this.mapType] || BMAP_NORMAL_MAP
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    genLatLng({lat, lng}={}) {
      return new BMap.Point(lng, lat)
    },
    //-------------------------------------
    drawValue() {
      let $map = this.__map
      let opt  = this.valueOptions

      // Guard the value
      if(!this.value)
        return

      let point = this.genLatLng(this.value);
      var marker = new BMap.Marker(point)
      $map.addOverlay(marker);

      this.valueMarker = marker
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(){this.drawValue()}
  },
  //////////////////////////////////////////
  mounted : async function() {
    // Init Map
    let $map = new BMap.Map(this.$refs.arena, {
      mapType : this.mapTypeId
    })
    $map.centerAndZoom(this.mapCenterLatLng, this.zoom);
    $map.addControl(new BMap.MapTypeControl({
      mapTypes:[
              BMAP_NORMAL_MAP,
              BMAP_SATELLITE_MAP,
              BMAP_HYBRID_MAP
          ]}));	
    $map.enableScrollWheelZoom(true);
    // Store
    this.__map = $map
    // Draw Value
    this.drawValue()
  }
  //////////////////////////////////////////
}