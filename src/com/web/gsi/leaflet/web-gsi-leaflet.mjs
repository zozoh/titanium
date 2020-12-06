export default {
  ///////////////////////////////////
  data: ()=>({
    $map  : null,
    $live : null,
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
    TileCoords() {
      return this.getTileCoords(this.baseTileLayer)
    },
    //--------------------------------------
    // value -> trans to fit the -> base tile
    coords_value_to_tiles() {
      if(this.valueCoords != this.TileCoords) {
        return `${this.valueCoords}_TO_${this.TileCoords}`
      }
    },
    //--------------------------------------
    // base tile -> trans to fit the -> value
    coords_tiles_to_value() {
      if(this.valueCoords != this.TileCoords) {
        return `${this.TileCoords}_TO_${this.valueCoords}`
      }
    },
    //--------------------------------------
    RedrawFuncName(){
      return _.snakeCase("draw_" + this.valueType + "_as_" + this.displayType)
    },
    //--------------------------------------
    MapData() {
      // Guard
      if(!this.value && !this.defaultLocation) {
        return null
      }

      // Format the value
      return ({
        //..................................
        "obj" : (latlng)=>{
          latlng = latlng || this.defaultLocation
          if(this.coords_value_to_tiles) {
            return Ti.GIS.transLatlngObj(latlng, this.coords_value_to_tiles, true)
          }
          return latlng
        },
        //..................................
        "obj-list" : (list=[])=>{
          if(!list)
            return []
          if(this.coords_value_to_tiles) {
            return _.map(list, (latlng)=>{
              return Ti.GIS.transLatlngObj(latlng, this.coords_value_to_tiles, true)
            })
          }
          return list
        },
        //..................................
        "pair" : (latlng)=>{
          latlng = latlng || Ti.GIS.objToLatlngPair(this.defaultLocation)
          if(this.coords_value_to_tiles) {
            return Ti.GIS.transLatlngPair(latlng, this.coords_value_to_tiles)
          }
          return latlng
        },
        //..................................
        "pair-list" : (list=[]) => {
          if(!list)
            return []
          if(this.coords_value_to_tiles) {
            return _.map(list, (latlng)=>{
              return Ti.GIS.transLatlngPair(latlng, this.coords_value_to_tiles)
            })
          }
          return list
        },
        //..................................
        "geojson" : (geojson) => {
          if(!geojson) {
            return {
              type : "Point",
              coordinates : Ti.GIS.objToLnglatPair(this.defaultLocation)
            }
          }

          // TODO here to translate coords for geojson
          return geojson
        }
        //..................................
      })[this.valueType](this.value)
    },
    //--------------------------------------
    hasMapData() {
      return !_.isEmpty(this.MapData)
    },
    //--------------------------------------
    isShowInfo() {
      return this.showInfo ? true : false
    },
    //--------------------------------------
    ShowInfo() {
      if(!this.showInfo)
        return {}
      
      let si = true === this.showInfo ? {} : this.showInfo
        
      return {
        zoom     : true,
        center   : false,
        latRange : false,
        lngRange : false,
        pointer  : false,
        ... si
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //
    // Events
    //
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
    //
    // Drawing methods
    //
    //--------------------------------------
    redraw() {
      // Prepare the function name

      // Clear live layer
      this.$live.clearLayers()
      
      // Draw data
      if(this.hasMapData) {
        let func = this[this.RedrawFuncName]
        if(_.isFunction(func)) {
          func(this.MapData)
        } else {
          throw `Invalid RedrawFuncName="${this.RedrawFuncName}"`
        }
      }
    },
    //--------------------------------------
    //
    // Utility
    //
    //--------------------------------------
    GeoStr(v, precise=this.latlngPrecise) {
      if(_.isUndefined(v))
        return ""
      let s = '' + Ti.Num.precise(v, precise)
      let ss = s.split('.')
      ss[1] = _.padEnd(ss[1], precise, '0')
      return ss.join('.')
    },
    //--------------------------------------
    LatlngForDi(latlng) {
      if(this.coords_value_to_tiles) {
        return Ti.GIS.transLatlng(latlng, this.coords_value_to_tiles)
      }
      return latlng
    },
    //--------------------------------------
    Icon(urlOrIcon, {
      size = 32,
      color = "primary",
      iconSize = [24, 41],
      iconAnchor = [12, 41],
      shadow = true,
      shadowSize = [41, 41],
      shadowAnchor = [12, 41]
    }={}) {
      if(!urlOrIcon)
        return new L.Icon.Default()

      // Eval the icon
      let {type, value} = Ti.Icons.evalIconObj(urlOrIcon)

      // Font icon
      if("font" == type) {
        let html = Ti.Icons.fontIconHtml(value)
        let ansz = size / 2
        return L.divIcon({
          className: `ti-gsi-mark-icon 
                      is-size-${size} 
                      is-color-${color}
                      ${shadow?'has-shadow':''}`,
          html,
          iconSize : [size, size],
          iconAnchor: [ansz, ansz]
        })
      }

      // Image Icon
      if("image" == type) {
        let shadowUrl;
        if(shadow) {
          shadowUrl = shadow
          if(_.isBoolean(shadow)) {
            let [_, nmPath, suffix] = /^([^.]+)\.(\w+)$/.exec(value)
            shadowUrl = `${nmPath}-shadow.${suffix}`
          }
          shadowUrl = `${this.imageIconBase}${shadowUrl}`
        }
        return L.icon({
          iconUrl : `${this.imageIconBase}${value}`,
          iconSize, iconAnchor,
          shadowUrl, shadowSize, shadowAnchor
        })
      }

      // Keep original input
      return L.icon(urlOrIcon)
    },
    //--------------------------------------
    trans_obj_from_value_to_tiles(obj) {
      if(this.coords_value_to_tiles) {
        return Ti.GIS.transLatlngObj(obj, this.coords_value_to_tiles, true)
      }
      return obj
    },
    //--------------------------------------
    trans_pair_from_value_to_tiles(pair) {
      if(this.coords_value_to_tiles) {
        return Ti.GIS.transLatlngPair(pair, this.coords_value_to_tiles)
      }
      return pair
    },
    //--------------------------------------
    trans_obj_from_tiles_to_value(obj) {
      if(this.coords_tiles_to_value) {
        return Ti.GIS.transLatlngObj(obj, this.coords_tiles_to_value, true)
      }
      return obj
    },
    //--------------------------------------
    trans_pair_from_tiles_to_value(pair) {
      if(this.coords_tiles_to_value) {
        return Ti.GIS.transLatlngPair(pair, this.coords_tiles_to_value)
      }
      return pair
    },
    //--------------------------------------
    fitBounds(bounds) {
      this.$map.fitBounds(bounds, this.fitBoundsBy)
    },
    //--------------------------------------
    initMapControls() {
      let vm = this
      let MockButton = L.Control.extend({
        options: {
            position: 'topright'
     
        },
        initialize: function (options) {
          L.Util.extend(this.options, options);
  
        },
        onAdd: function(map) {
          let $con = Ti.Dom.createElement({})
          $con.innerHTML = `<b>hahaha</b>`
          $($con).on("click", function(evt){
            let list = vm.mockPairList(1000)
            vm.$notify("change", list)
          })
          return $con
        }
      })

      let mm = new MockButton()
      mm.addTo(this.$map)
    },
    //--------------------------------------
    initMapView(data=this.MapData) {
      // Get current zoom, keep the last user zoom state
      let zoom = this.geo.zoom || this.zoom

      // Default view
      if(!this.hasMapData) {
        let dftCenter = Ti.GIS.transLatlngObj(this.defaultLocation || {
          lat: 39.97773512677837,
          lng: 116.3385673945887
        })
        this.$map.setView(dftCenter, zoom)
        return
      }

      // Auto fit the data
      ({
        //..................................
        "obj" : (latlng)=>{
          this.$map.setView(latlng, zoom)
        },
        //..................................
        "obj-list" : (list=[])=>{
          let {SW,NE} = Ti.GIS.getLatlngObjBounds(list)
          this.fitBounds([SW, NE])
        },
        //..................................
        "pair" : (latlng)=>{
          this.$map.setView(latlng, zoom)
        },
        //..................................
        "pair-list" : (list=[]) => {
          let {SW,NE} = Ti.GIS.getLatlngPairBounds(list)
          this.fitBounds([SW, NE])
        },
        //..................................
        "geojson" : (geojson) => {
          throw "Not implement geojson get center"
        }
        //..................................
      })[this.valueType](data)
    },
    //--------------------------------------
    initMap() {
      // Create Map
      this.$map = L.map(this.$refs.main, {
        ... this.mapOptions,
        attributionControl : false,
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

      // Prepare live layer for the presentation of value data 
      this.$live = L.layerGroup().addTo(this.$map)

      // Customized control
      //this.initMapControls()

      // Init map view
      this.initMapView()

      // Then Render the data
      this.redraw()
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "MapData": function() {
      if(this.autoFitBounds) {
        this.initMapView()
      }
      this.redraw()
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    if("Cluster" == this.displayType) {
      await Ti.Load([
        "@deps:leaflet/leaflet.markercluster-src.js",
        "@deps:leaflet/marker-cluster.css",
        "@deps:leaflet/marker-cluster.default.css"
      ])
    }
    
    this.initMap()
  }
  //////////////////////////////////////////
}