export default {
  ///////////////////////////////////
  data: ()=>({
    $map : null,
    mouse : {/*lat:0, lng:0*/},
    geo: {
      center: {},
      SW: {},
      SE: {},
      NE: {},
      NW: {},
      W: 0,
      E: 0,
      S: 0,
      N: 0,
      zoom : 0
    },
  }),
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
      })
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toSizeRem100({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    TileCoord() {
      return this.getTileCoord(this.baseTileLayer)
    },
    //--------------------------------------
    // value -> trans to fit the -> base tile
    CoordTransMode() {
      if(this.valueCoord != this.TileCoord) {
        return `${this.valueCoord}_TO_${this.TileCoord}`
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnMapMove(evt) {
      //console.log("map move", evt)
      let bou = this.$map.getBounds()
      this.geo = {
        zoom   : this.$map.getZoom(),
        center : bou.getCenter(),
        SW: bou.getSouthWest(),
        SE: bou.getSouthEast(),
        NE: bou.getNorthEast(),
        NW: bou.getNorthWest(),
        W: bou.getWest(),
        E: bou.getEast(),
        S: bou.getSouth(),
        N: bou.getNorth()
      }
    },
    //--------------------------------------
    OnMouseMove(evt) {
      this.mouse = evt.latlng
    },
    //--------------------------------------
    GeoValue(v, precise=this.geoDisplayPrecise) {
      if(_.isUndefined(v))
        return ""
      return Ti.Num.precise(v, precise)
    },
    //--------------------------------------
    TransLatlng(latlng) {
      if(this.CoordTransMode) {
        return Ti.GIS.transLatlng(latlng, this.CoordTransMode)
      }
      return latlng
    },
    //--------------------------------------
    TransLnglat(lnglat) {
      if(this.CoordTransMode) {
        return Ti.GIS.transLnglat(lnglat, this.CoordTransMode)
      }
      return lnglat
    },
    //--------------------------------------
    initMap() {
      // Create Map
      this.$map = L.map(this.$refs.main, {
        minZoom : this.minZoom,
        maxZoom : this.maxZoom
      });

      L.control.scale({
        metric : true,
        imperial : false,
        updateWhenIdle : true
      }).addTo(this.$map);

      // Create the main bg-layer
      if(this.baseTileLayer) {
        this.createTileLayer(this.baseTileLayer).addTo(this.$map)
      }
      if(this.noteTileLayer) {
        this.createTileLayer(this.noteTileLayer).addTo(this.$map)
      }
      
      // Events
      this.$map.on("move", (evt) => {this.OnMapMove(evt)})
      this.$map.on("mousemove", (evt) => {this.OnMouseMove(evt)})

      // Mock data
      _.delay(()=>{
        this.showMock()
      }, 500)

      // Init map view
      let c_latlng = this.TransLatlng([39.90667, 116.39126])
      this.$map.setView(c_latlng, 16)
      
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    
  },
  //////////////////////////////////////////
  mounted : function() {
    this.initMap()
  }
  //////////////////////////////////////////
}