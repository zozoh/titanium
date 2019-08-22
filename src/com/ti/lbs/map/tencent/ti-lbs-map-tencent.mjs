export default {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    valueMarker : null
  }),
  /////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
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
    "valueMarkerOptions" : {
      type : Object,
      default : ()=>({
        icon : null,
        title : "UserMarker",
        // DOWN|BOUNCE|DROP|UP
        animation : "DOWN"
      })
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
      return this.className
    },
    //-------------------------------------
    arenaStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //-------------------------------------
    qqMapCenterLatLng() {
      console.log("haha")
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
    qqMapTypeId() {
      return (qq.maps.MapTypeId[this.mapType]) 
             || qq.maps.MapTypeId.ROADMAP
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    genLatLng({lat, lng}={}) {
      let pos = {lat, lng}
      // WGS84
      if("WGS84" == this.coordinate) {
        pos = Ti.GPS.gps84_To_Gcj02(lat, lng)
      }
      // BD09
      else if("BD09" == this.coordinate) {
        pos = Ti.GPS.bd09_To_Gcj02(lat, lng)
      }

      return new qq.maps.LatLng(pos.lat, pos.lng)
    },
    //-------------------------------------
    drawValue() {
      let $map = this.__map
      let opt  = this.valueMarkerOptions

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
    },
    //-------------------------------------
    abc() {
      if(this.valueMarker) {
        this.valueMarker.setMap(null)
        this.valueMarker = null
      }
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(){this.drawValue()}
  },
  //////////////////////////////////////////
  mounted : async function() {
    // Init QQ Map
    let $map = new qq.maps.Map(this.$refs.arena, {
      zoom: this.zoom,
      center: this.qqMapCenterLatLng,
      mapTypeId: this.qqMapTypeId
    })
    // Store
    this.__map = $map
    // Draw Value
    this.drawValue()
  }
  //////////////////////////////////////////
}