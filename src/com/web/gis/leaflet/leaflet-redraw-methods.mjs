export default {
  //--------------------------------------
  __set_marker_icon($marker, obj={}) {
    if(this.markerIcon) {
      let icon = Ti.Util.explainObj(obj, this.markerIcon)
      if(icon)
        $marker.setIcon(this.Icon(icon, this.markerIconOptions))
    }
  },
  //--------------------------------------
  //
  // Single Point
  //
  //--------------------------------------
  draw_obj_as_point(latlng, convert=_.identity) {
    let $marker = L.marker(latlng, {
      autoPan : true
    }).addTo(this.$live)

    // Save old data
    $marker.rawData = latlng

    // Can edit by drag
    if("drag" == this.editPoint) {
      $marker.dragging.enable()
      $marker.on("dragend", ({target})=>{
        let newLatlng = target.getLatLng()
        newLatlng = this.trans_obj_from_tiles_to_value(newLatlng)
        newLatlng = convert(newLatlng)
        this.$notify("change", {
          ... target.rawData,
          ... newLatlng
        })
      })
    }
    // Can edit by move map
    else if("pin" == this.editPoint) {
      this.$map.on("move", ()=>{
        let newLatlng = this.$map.getCenter();
        newLatlng = this.trans_obj_from_value_to_tiles(newLatlng)
        $marker.setLatLng(newLatlng)
      })
      this.$map.on("moveend", ()=>{
        let newLatlng = this.$map.getCenter();
        newLatlng = convert(newLatlng)
        this.$notify("change", newLatlng)
      })
    }

    // Customized Icon
    this.__set_marker_icon($marker, latlng)

    return $marker
  },
  //--------------------------------------
  draw_pair_as_point(latlng) {
    return this.draw_obj_as_point(latlng, ({lat, lng})=>[lat, lng])
  },
  //--------------------------------------
  //
  // Multi Points
  //
  //--------------------------------------
  draw_obj_list_as_point(list, convert=_.identity) {
    _.forEach(list, (latlng, index)=>{
      let $marker = L.marker(latlng, {
        autoPan : true
      }).addTo(this.$live)

      // Add customized value
      $marker.index = index
      $marker.rawData = latlng
  
      // Can edit by drag
      if("drag" == this.editPoint) {
        $marker.dragging.enable()
        $marker.on("dragend", ({target})=>{
          let newLatlng = target.getLatLng()
          newLatlng = this.trans_obj_from_tiles_to_value(newLatlng)
          newLatlng = convert(newLatlng)
          
          let list = _.cloneDeep(this.value)
          list[target.index] = {
            ... target.rawData,
            ... newLatlng
          }
          this.$notify("change", list)
        })
      }
  
      // Customized Icon
      this.__set_marker_icon($marker, latlng)
    })
  },
  //--------------------------------------
  draw_pair_list_as_point(list) {
    this.draw_obj_list_as_point(list, ({lat, lng})=>[lat, lng])
  },
  //--------------------------------------
  //
  // Polyline
  //
  //--------------------------------------
  draw_obj_list_as_polyline(latlngs, showMarker=this.showMarker) {
    let $polyline = this.draw_pair_list_as_polyline(latlngs, false)

    if(showMarker) {
      this.draw_obj_list_as_point(latlngs)
    }

    return $polyline
  },
  //--------------------------------------
  draw_pair_list_as_polyline(latlngs, showMarker=this.showMarker) {
    let $polyline = L.polyline(latlngs, {
      color: '#08F',
      ... this.aspect
    }).addTo(this.$live);

    if(showMarker) {
      this.draw_pair_list_as_point(latlngs)
    }

    if(this.autoFitBounds) {
      this.fitBounds($polyline.getBounds());
    }

    return $polyline
  },
  //--------------------------------------
  //
  // Polygon
  //
  //--------------------------------------
  draw_obj_list_as_polygon(latlngs, showMarker=this.showMarker) {
    let $polygon = this.draw_pair_list_as_polygon(latlngs, false)

    if(showMarker) {
      this.draw_obj_list_as_point(latlngs)
    }

    return $polygon
  },
  //--------------------------------------
  draw_pair_list_as_polygon(latlngs, showMarker=this.showMarker) {
    let $polygon = L.polygon(latlngs, {
      color: '#08F',
      ... this.aspect
    }).addTo(this.$live);

    if(showMarker) {
      this.draw_pair_list_as_point(latlngs)
    }

    if(this.autoFitBounds) {
      this.fitBounds($polygon.getBounds());
    }

    return $polygon
  },
  //--------------------------------------
  //
  // Rectangle
  //
  //--------------------------------------
  draw_obj_list_as_rectangle(latlngs, showMarker=this.showMarker) {
    let [SW, NE] = latlngs
    let $rect = L.rectangle([SW, NE], {
      color: '#08F',
      ... this.aspect
    }).addTo(this.$live);

    if(showMarker) {
      this.draw_obj_list_as_point([SW, NE])
    }

    if(this.autoFitBounds) {
      this.fitBounds($rect.getBounds());
    }

    return $rect
  },
  //--------------------------------------
  draw_pair_list_as_rectangle(latlngs, showMarker=this.showMarker) {
    let $rect = this.draw_obj_list_as_rectangle(latlngs, false)

    if(showMarker) {
      let bounds = $rect.getBounds()
      let SW = bounds.getSouthWest()
      let NE = bounds.getNorthEast()
      this.draw_pair_list_as_point([SW, NE])
    }

    return $rect
  },
  //--------------------------------------
  //
  // Circle
  //
  //--------------------------------------
  draw_obj_as_circle(latlng, showMarker=this.showMarker) {
    let $circle = L.circle(latlng, {
      radius : this.circleRadius,
      color: '#08F',
      ... this.aspect
    }).addTo(this.$live);

    if(showMarker) {
      this.draw_obj_as_point(latlng)
    }

    if(this.autoFitBounds) {
      this.fitBounds($circle.getBounds());
    }

    return $circle
  },
  //--------------------------------------
  draw_pair_as_circle(latlng, showMarker=this.showMarker) {
    let $circle = this.draw_obj_as_circle(latlng, false)

    if(showMarker) {
      this.draw_pair_as_point(latlng)
    }

    return $circle
  },
  //--------------------------------------
  //
  // Cluster
  //
  //--------------------------------------
  draw_obj_list_as_cluster(latlngs) {
    var $cluster = L.markerClusterGroup();

    _.forEach(latlngs, (latlng, index)=>{
      let $marker = L.marker(latlng, {
        autoPan : true
      }).addTo($cluster)

      // Add customized value
      $marker.index = index
      $marker.rawData = latlng
    
      // Customized Icon
      this.__set_marker_icon($marker, latlng)
    })

    this.$live.addLayer($cluster)

    return $cluster
  },
  //--------------------------------------
  draw_pair_list_as_cluster(latlngs) {
    return this.draw_obj_list_as_cluster(latlngs)
  },
  //--------------------------------------
}