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
    // Map center : {lat:-34.397, lng:150.644}
    "center" : {
      type : Object,
      default : ()=>({
        lat:39.9042, lng:116.4074
      })
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
      return new qq.maps.LatLng(this.center.lat, this.center.lng);
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
    drawValue() {
      let $map = this.__map
      let opt  = this.valueMarkerOptions

      // Guard the value
      if(!this.value)
        return

      let llpos = new qq.maps.LatLng(this.value.lat, this.value.lng);

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