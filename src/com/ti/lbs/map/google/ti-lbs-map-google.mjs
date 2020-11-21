const _M = {
  /////////////////////////////////////////
  data : ()=>({
    // + Move cooling
    myLastMove : undefined,
    // => Input cooling
    mySyncTime : undefined,
    myUpTime: undefined,
    myCenterMarker: undefined,
    /*
    {
      [layerName] : Polyline,
      [layerName] : [Marker...]
    }
    */
    myLayers: {},
    myGrid: {
      x: [],
      y: [],
      x_step: undefined,
      y_step: undefined
    }
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
    },
    // Refer by goole map api: gestureHandling
    // https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
    "gestureHandling": {
      type: String,
      default: "auto",
      validator: v=>/^(cooperative|greedy|none|auto)$/.test(v)
    },
    /*
    {
      x: 10, y: 10, label: "=n", src: "/img/abc.png"
    }
    */
    "clustering": {
      type: Object,
      default: undefined
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
    draw_as_point({
      name, items=[], 
      iconSize, iconSizeHoverScale,
      clickable
    }={}) {
      //..................................
      if(!name) {
        throw "draw_as_point without layer name!"
      }
      //console.log("draw_as_point", name)
      //..................................
      let doClustering = !_.isUndefined(this.myGrid.x_step)
                      && !_.isUndefined(this.myGrid.y_step)
      //..................................
      // Get map bound for clustering
      let bound = this.$map.getBounds()
      if(!bound)
        return
      bound = bound.toJSON()
      //..................................
      // Prepare the layer marker list
      let markerList = []
      let matrix = []     // matrix for clustering
      //..................................
      // Define the marker drawing function
      let draw_marker = it => {
        let icon, size, size2;
        let label = it.label;
        if(_.isString(label)) {
          label = {
            color: "#FFF",
            text: label
          }
        }
        // Item icon
        if(it.src) {
          size = iconSize || {width:100, height:100}
          icon = {url:it.src, scaledSize:size}
          if(iconSizeHoverScale) {
            size2 = {
              width : size.width  * iconSizeHoverScale,
              height: size.height * iconSizeHoverScale
            }
          }
        }
        // Create marker
        let marker = new google.maps.Marker({
          position: it,
          title: it.title,
          label, icon,
          //label: `x:${box.x}: y:${box.y}`,
          clickable
        })
        markerList.push(marker)
        // Event
        if(clickable) {
          marker.addListener("click", ()=>{
            this.$notify("point:click", it)
          });
          // Hover to change the size
          if(size2) {
            marker.addListener("mouseover", function(){
              //marker.setAnimation(google.maps.Animation.BOUNCE)
              marker.setIcon({url: it.src, scaledSize: size2})
            });
            marker.addListener("mouseout", function(){
              //marker.setAnimation(null)
              marker.setIcon({url:it.src, scaledSize:size})
            });
          }
        }
      }
      //..................................
      // Define the multi-marker drawing function
      let draw_multi_markers = its=>{
        let icon, icon2, size, size2, label;
        let ctx = {
          n : its.length,
          title0 : its[0].title,
          title1 : its[1].title
        }
        // title
        let title = Ti.Util.explainObj(ctx, this.clustering.title || "->${n} places")
        // label
        if(this.clustering.label) {
          label = Ti.Util.explainObj(ctx, this.clustering.label)
        }
        // Icon
        if(this.clustering.src) {
          size = iconSize || {width:100, height:100}
          icon = {url:this.clustering.src, scaledSize:size}
          if(iconSizeHoverScale) {
            size2 = {
              width : size.width  * iconSizeHoverScale,
              height: size.height * iconSizeHoverScale
            }
            icon2 = {url:this.clustering.src, scaledSize:size2}
          }
        }
        // Get center
        let lalList = []
        _.forEach(its, ({it})=>lalList.push(it))
        let lalCenter = Ti.GPS.getCenter(lalList)
        // Create marker
        let marker = new google.maps.Marker({
          position: lalCenter,
          title, label, icon,
          //label: `x:${box.x}: y:${box.y}`,
          clickable : true
        })
        // Click to zoom
        marker.addListener("click", ()=>{
          this.$map.panTo(lalCenter)
          this.$map.setZoom(this.$map.getZoom()+1)
        });
        // Hover to change the size
        if(icon2) {
          marker.addListener("mouseover", function(){
            //marker.setAnimation(google.maps.Animation.BOUNCE)
            marker.setIcon(icon2)
          });
          marker.addListener("mouseout", function(){
            //marker.setAnimation(null)
            marker.setIcon(icon)
          });
        }
        // Add to markers
        markerList.push(marker)
      }
      //..................................
      // Define the items drawing function
      let draw_item = it => {
        // Clustering items
        if(_.isArray(it)) {
          // Multi-marker
          if(it.length > 1) {
            draw_multi_markers(it)
          }
          // Single marker
          else if(it.length > 0) {
            draw_marker(it[0].it)
          }
        }
        // Single item
        else {
          draw_marker(it)
        }
      }
      //..................................
      if(doClustering) {
        for(let it of items) {
          if(!it || !_.isNumber(it.lat) || !_.isNumber(it.lng)) 
            continue
          // Count box base clustering
          let box = {}
          //console.log("haha", it.title)
          box.x = Math.round(Ti.GPS.getLngToWest(it.lng,  bound.west) /this.myGrid.x_step)
          box.y = Math.round(Ti.GPS.getLatToSouth(it.lat, bound.south)/this.myGrid.y_step)
          let rows = matrix[box.y]
          if(!_.isArray(rows)){
            rows = []
            matrix[box.y] = rows
          }
          let cell = rows[box.x]
          if(!_.isArray(cell)) {
            cell = []
            rows[box.x] = cell
          }
          cell.push({...box, title: it.title, it})
        }
        //console.log(this.__dump_matrix(matrix))
        let cluList = this.clusteringMatrix(matrix)
        //console.log(cluList)
        _.forEach(cluList, draw_item)
      }
      // Add marker to map
      else {
        _.forEach(items, draw_marker)
      }
      //..................................
      // Add to global layer list for clean later
      this.myLayers[name] = markerList
      //..................................
      // Append to map
      _.forEach(markerList, marker => marker.setMap(this.$map))
    },
    //-------------------------------------
    clusteringMatrix(matrix) {
      let list = []
      for(let y=0; y<matrix.length; y++) {
        let rows = matrix[y]
        if(rows) {
          for(let x=0; x<rows.length; x++) {
            let cell = rows[x]
            // find my adjacent cell
            if(cell && cell.length>0) {
              // Right
              let next = rows[x+1]
              if(next && next.length>0) {
                rows[x+1] = undefined
                cell.push(...next)
              }
              // Down
              let adjRow = matrix[y+1]
              if(adjRow && adjRow.length > 0) {
                // Down
                next = adjRow[x]
                if(next && next.length>0) {
                  adjRow[x] = undefined
                  cell.push(...next)
                }
                // Down right
                next = adjRow[x+1]
                if(next && next.length>0) {
                  adjRow[x+1] = undefined
                  cell.push(...next)
                }
              }
              // Join to list
              list.push(cell)
            }
          }
        }
      }
      // Done
      return list
    },
    //-------------------------------------
    __dump_matrix(matrix) {
      let sb = ""
      for(let y=0; y<matrix.length; y++) {
        let rows = matrix[y]
        sb += `${y}: `
        if(rows) {
          for(let x=0; x<rows.length; x++) {
            let cell = rows[x]
            sb += `[${cell ? cell.length : 0}]`
          }
        }
        sb += "\n"
      }
      //console.log(sb)
    },
    //-------------------------------------
    tidyGridAxisLine(list, n) {
      if(list.length > n) {
        let more = list.slice(n)
        for(let pol of more) {
          pol.setMap(null)
        }
        return list.slice(0, n)
      }
      for(let i=list.length;i<n;i++) {
        list.push(new google.maps.Polyline({
          map: this.$map,
          geodesic: false,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 1,     
        }))
      }
      return list
    },
    //-------------------------------------
    eval_grid(x=10, y=10) {
      let bound = this.$map.getBounds()
      if(!bound)
        return
      bound = bound.toJSON()
      let ew = bound.east  - bound.west
      let ns = bound.north - bound.south
      if(ew < 0) {
        ew += 360
      }
      let lngStep = ew / x
      let latStep = ns / y
      //console.log({ew, ns, ew_u: lngStep, ns_u: latStep})

      // Build enouth grid
      let xN = x - 1;
      let yN = y - 1;
      this.myGrid.x = this.tidyGridAxisLine(this.myGrid.x, xN)
      this.myGrid.y = this.tidyGridAxisLine(this.myGrid.y, yN)
      this.myGrid.x_step = lngStep
      this.myGrid.y_step = latStep

      // // Draw line : X
      if(this.showGrid) {
        for(let i=1; i<x; i++) {
          let off = lngStep*i
          let lng = Ti.GPS.normlizedLng(bound.west + off)
          //console.log(i, {off, lng})
          let path = [
            {lat:bound.north, lng},
            {lat:bound.south, lng}
          ]
          this.myGrid.x[i-1].setPath(path)
        }

        // Draw line : Y
        for(let i=1; i<y; i++) {
          let off = latStep*i
          let lat = Ti.GPS.normlizedLat(bound.south + off)
          //console.log(i, {off, lat})
          let path = [
            {lat, lng:bound.west},
            {lat, lng:bound.east}
          ]
          this.myGrid.y[i-1].setPath(path)
        }
      }
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
      // console.log("drawLayers")
      if(this.clustering) {
        let {x, y} = this.clustering
        this.eval_grid(x, y);
      }
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
    },
    //-------------------------------------
    redrawLayers(){
      this.cleanLayers()
      this.drawLayers()
    },
    //-------------------------------------
    redrawWhenMoveCoolDown() {
      let du = Date.now() - this.myLastMove;
      if(isNaN(du))
        return
      if(du > 500) {
        this.redrawLayers()
        this.myLastMove = undefined
        return
      }
      _.delay(()=>{
        this.redrawWhenMoveCoolDown()
      }, du)
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
        this.redrawLayers()
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
    },
    "gestureHandling": function(newVal) {
      this.$map.setOptions({
        gestureHandling: newVal
      })
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
      gestureHandling : this.gestureHandling,
      //...................................
      center_changed: ()=>{
        //console.log(this.$map.getBounds().toJSON(), this.$map.getCenter().toJSON())
        let lal = this.$map.getCenter()
        if(this.clustering) {
          // May need to redraw when move cool down
          if(_.isUndefined(this.myLastMove)) {
            _.delay(()=>{
              this.redrawWhenMoveCoolDown()
            }, 500)
          }
        }
        this.myLastMove = Date.now()
        if(this.pinCenter) {
          this.draw_center_marker(lal)
        }
        if(!this.isInSync()) {
          this.myUpTime = Date.now()
          let lan = lal.toJSON()
          lan.lng = Ti.GPS.normlizedLng(lan.lng)
          this.$emit("center:change", lan)
        }
      },
      //...................................
      zoom_changed: ()=> {
        if(this.clustering) {
          this.redrawLayers()
        }
        this.myUpTime = Date.now()
        this.$emit("zoom:change", this.$map.getZoom())
      }
      //...................................
    })
    //......................................
    // Draw Value
    _.delay(()=>{
      this.redrawLayers()
    }, 1000)
  }
  //////////////////////////////////////////
}
export default _M;