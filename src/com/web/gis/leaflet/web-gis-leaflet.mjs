export default {
  ///////////////////////////////////
  data: ()=>({
    $map  : null,
    $live : null,
    pointerClick : {/*lat:0, lng:0*/},
    pointerHover : {/*lat:0, lng:0*/},
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
    lastMove : undefined
  }),
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({})
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
      let val = this.value
      if(_.isEmpty(val)) {
        val = undefined
      }
      // Guard
      if(val && !this.defaultLocation) {
        return null
      }

      return this.evalMapData({
        val, 
        valType : this.valueType, 
        dftLo   : this.defaultLocation
      })
    },
    //--------------------------------------
    hasMapData() {
      return !_.isEmpty(this.MapData)
    },
    //--------------------------------------
    RedrawObjName(){
      return _.snakeCase("draw_" + this.objType + "_as_" + this.objDisplay)
    },
    //--------------------------------------
    ObjData() {
      if(this.objValue) {
        return this.evalMapData({
          val     : this.objValue, 
          valType : this.objType, 
          dftLo   : undefined
        })
      }
    },
    //--------------------------------------
    hasObjData() {
      return !_.isEmpty(this.ObjData) 
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
        pointerHover  : false,
        pointerClick  : false,
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
      let now = Date.now()
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
      // Keep zoom in local
      if(this.keepZoomBy) {
        Ti.Storage.local.set(this.keepZoomBy, this.geo.zoom)
      }
      // If cooling, notify
      if(!this.__check_cooling && this.cooling > 0) {
        this.__check_cooling = true
        window.setTimeout(()=>{
          this.checkMoveCooling()
        }, this.cooling + 10)
      }
      // lastMove for cooling
      this.lastMove = now
    },
    //--------------------------------------
    OnMapPointerMove(evt) {
      this.pointerHover = evt.latlng
    },
    //--------------------------------------
    OnMapPointerClick(evt) {
      this.pointerClick = evt.latlng
    },
    //--------------------------------------
    checkMoveCooling() {
      let now = Date.now()
      let isCooling = (now - this.lastMove) > this.cooling
      if(isCooling || !this.lastMove) {
        this.__check_cooling = false
        //console.log("notify map move", this.geo)
        this.$notify("map:move", this.geo)
      } else {
        window.setTimeout(()=>{
          this.checkMoveCooling()
        }, this.cooling / 2)
      }
    },
    //--------------------------------------
    //
    // Drawing methods
    //
    //--------------------------------------
    redraw() {
      this.$map.invalidateSize()
      // Prepare the function name

      // Clear live layer
      this.$live.clearLayers()
      
      // Draw data
      if(this.hasMapData) {
        let func = this[this.RedrawFuncName]
        if(_.isFunction(func)) {
          func(this.MapData, {
            autoFitBounds      : this.autoFitBounds,
            showMarker         : this.showMarker,
            markerIcon         : this.markerIcon,
            markerIconOptions  : this.markerIconOptions,
            markerPopup        : this.markerPopup,
            markerPopupOptions : this.markerPopupOptions
          })
        } else {
          throw `Invalid RedrawFuncName="${this.RedrawFuncName}"`
        }
      }

      // Draw obj
      if(this.hasObjData) {
        let func = this[this.RedrawObjName]
        if(_.isFunction(func)) {
          func(this.ObjData, {
            showMarker         : this.objShowMarker,
            markerIcon         : this.objMarkerIcon,
            markerIconOptions  : this.objMarkerIconOptions,
            markerPopup        : this.objMarkerPopup,
            markerPopupOptions : this.objMarkerPopupOptions
          })
        }
      }
    },
    //--------------------------------------
    //
    // GEO Function
    //
    //--------------------------------------
    evalMapData({val, valType="obj", dftLo}={}) {
      // Format the value
      return ({
        //..................................
        "obj" : (latlng)=>{
          latlng = latlng || dftLo
          if(Ti.Util.isNil(latlng.lat) || Ti.Util.isNil(latlng.lng)) {
            return {}
          }
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
          latlng = latlng || Ti.GIS.objToLatlngPair(dftLo)
          if(this.coords_value_to_tiles) {
            console.log(this.coords_value_to_tiles)
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
              coordinates : Ti.GIS.objToLnglatPair(dftLo)
            }
          }

          // TODO here to translate coords for geojson
          return geojson
        }
        //..................................
      })[valType](val)
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
    GetIconSrc(src) {
      if(/^(https?:\/\/|\/)/.test(src)) {
        return src
      }
      return `${this.imageIconBase}${src}`
    },
    //--------------------------------------
    Icon(urlOrIcon, {
      size = 32,
      className,
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
          shadowUrl = this.GetIconSrc(shadowUrl)
        }
        return L.icon({
          iconUrl : this.GetIconSrc(value),
          className,
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
    //
    // Map Methods
    //
    //--------------------------------------
    fitBounds(bounds) {
      //console.log("fitBounts", bounds)
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
      //console.log("initMapView")
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
          if(list.length > 1) {
            let gr = Ti.GIS.getLatlngObjBounds(list)
            let {SW,NE} = gr
            this.fitBounds([SW, NE])
          } else if(list.length == 1) {
            let latlng = list[0]
            this.$map.setView(latlng, zoom)
          }
        },
        //..................................
        "pair" : (latlng)=>{
          this.$map.setView(latlng, zoom)
        },
        //..................................
        "pair-list" : (list=[]) => {
          if(list.length > 1) {
            let {SW,NE} = Ti.GIS.getLatlngObjBounds(list)
            this.fitBounds([SW, NE])
          } else if(list.length == 1) {
            let latlng = list[0]
            this.$map.setView(latlng, zoom)
          }
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
      this.$map.on("click", (evt) => {this.OnMapPointerClick(evt)})
      this.$map.on("mousemove", (evt) => {this.OnMapPointerMove(evt)})

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
  created : function() {
    // Restore the Kept zoom in local
    if(this.keepZoomBy) {
      let zoom = Ti.Storage.local.getInt(this.keepZoomBy, this.zoom)
      this.geo.zoom = zoom
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