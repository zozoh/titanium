//
// The coordinate base on GCJ02
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
    // @see https://lbs.qq.com/javascript_v2/doc/maptypeid.html
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
      return (qq.maps.MapTypeId[this.mapType]) 
             || qq.maps.MapTypeId.ROADMAP
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    genLatLng({lat, lng}={}) {
      return new qq.maps.LatLng(lat, lng)
    },
    //-------------------------------------
    drawValue() {
      let $map = this.__map
      let opt  = this.valueOptions

      // Guard the value
      if(!this.value)
        return

      let llpos = this.genLatLng(this.value);

      var marker = new qq.maps.Marker({
        position: llpos,
        animation: qq.maps.MarkerAnimation[opt.animation],
        //设置显示Marker的地图
        map: $map,
        //设置Marker可拖动
        draggable: true,
        // //自定义Marker图标为大头针样式
        // icon: new qq.maps.MarkerImage(
        //     "https://open.map.qq.com/doc/img/nilt.png"),
        // //自定义Marker图标的阴影
        // shadow: new qq.maps.MarkerImage(
        //     "https://open.map.qq.com/doc/img/nilb.png"),
        //设置Marker标题，鼠标划过Marker时显示
        title: opt.title,
        //设置Marker的可见性，为true时可见,false时不可见
        visible: true,
      });

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
    let $map = new qq.maps.Map(this.$refs.arena, {
      zoom: this.zoom,
      center: this.mapCenterLatLng,
      mapTypeId: this.mapTypeId
    })
    // Store
    this.__map = $map
    // Draw Value
    this.drawValue()
  }
  //////////////////////////////////////////
}