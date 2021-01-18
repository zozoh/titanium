export default {
  //--------------------------------------
  __customize_marker_behaviors($marker, obj={}, {
    markerIcon,
    markerIconOptions,
    markerPopup,
    markerPopupOptions
  }={}) {
    // Customized Icon
    if(markerIcon) {
      let icon = Ti.Util.explainObj(obj, markerIcon)
      if(icon) {
        $marker.setIcon(this.Icon(icon, markerIconOptions))
      }
    }
    // Customized popup
    if(this.markerPopup) {
      let popup = Ti.Util.explainObj(obj, markerPopup, {
        evalFunc : true
      })
      // Eval the html
      let html;
      // For Array
      if(_.isArray(popup)) {
        let list = _.map(popup, li=>`<li>${li}</li>`)
        html = `<ul>${list.join("")}</ul>`
      }
      // For Object pair
      else if(_.isPlainObject(popup)) {
        let rows = _.map(popup, (v,k)=>{
          let text = Ti.I18n.text(k)
          return `<tr><td>${text}</td><td>${v}</td></tr>`
        })
        html = `<table>${rows.join("")}</table>`
      }
      // For HTML
      else {
        html = popup
      }

      // HTML
      $marker.bindPopup(html, markerPopupOptions).openPopup();
    }
  },
  //--------------------------------------
  //
  // Single Point
  //
  //--------------------------------------
  draw_obj_as_point(latlng, setup) {
    let convert = _.get(setup, "convert") || _.identity
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
    this.__customize_marker_behaviors($marker, latlng, setup)

    return $marker
  },
  //--------------------------------------
  draw_pair_as_point(latlng, setup={}) {
    setup.convert = ({lat, lng})=>[lat, lng]
    return this.draw_obj_as_point(latlng, setup)
  },
  //--------------------------------------
  //
  // Multi Points
  //
  //--------------------------------------
  draw_obj_list_as_point(list, setup) {
    let convert = _.get(setup, "convert") || _.identity
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
      this.__customize_marker_behaviors($marker, latlng, setup)
    })
  },
  //--------------------------------------
  draw_pair_list_as_point(list, setup={}) {
    setup.convert = ({lat, lng})=>[lat, lng]
    this.draw_obj_list_as_point(list, setup)
  },
  //--------------------------------------
  //
  // Polyline
  //
  //--------------------------------------
  draw_obj_list_as_polyline(latlngs, setup={}) {
    let $polyline = this.draw_pair_list_as_polyline(latlngs, false)

    if(setup.showMarker) {
      this.draw_obj_list_as_point(latlngs)
    }

    return $polyline
  },
  //--------------------------------------
  draw_pair_list_as_polyline(latlngs, setup={}) {
    let $polyline = L.polyline(latlngs, {
      color: '#08F',
      ... this.aspect
    }).addTo(this.$live);

    if(setup.showMarker) {
      this.draw_pair_list_as_point(latlngs)
    }

    if(setup.autoFitBounds) {
      this.fitBounds($polyline.getBounds());
    }

    return $polyline
  },
  //--------------------------------------
  //
  // Polygon
  //
  //--------------------------------------
  draw_obj_list_as_polygon(latlngs, setup={}) {
    let $polygon = this.draw_pair_list_as_polygon(latlngs, setup)

    if(setup.showMarker) {
      this.draw_obj_list_as_point(latlngs, setup)
    }

    return $polygon
  },
  //--------------------------------------
  draw_pair_list_as_polygon(latlngs, setup={}) {
    let $polygon = L.polygon(latlngs, {
      color: '#08F',
      ... this.aspect
    }).addTo(this.$live);

    if(setup.showMarker) {
      this.draw_pair_list_as_point(latlngs, setup)
    }

    if(setup.autoFitBounds) {
      this.fitBounds($polygon.getBounds());
    }

    return $polygon
  },
  //--------------------------------------
  //
  // Rectangle
  //
  //--------------------------------------
  draw_obj_list_as_rectangle(latlngs, setup={}) {
    let [SW, NE] = latlngs
    let $rect = L.rectangle([SW, NE], {
      color: '#08F',
      ... this.aspect
    }).addTo(this.$live);

    if(setup.showMarker) {
      this.draw_obj_list_as_point([SW, NE], setup)
    }

    if(setup.autoFitBounds) {
      this.fitBounds($rect.getBounds());
    }

    return $rect
  },
  //--------------------------------------
  draw_pair_list_as_rectangle(latlngs, setup={}) {
    let $rect = this.draw_obj_list_as_rectangle(latlngs, false)

    if(setup.showMarker) {
      let bounds = $rect.getBounds()
      let SW = bounds.getSouthWest()
      let NE = bounds.getNorthEast()
      this.draw_pair_list_as_point([SW, NE], setup)
    }

    return $rect
  },
  //--------------------------------------
  //
  // Circle
  //
  //--------------------------------------
  draw_obj_as_circle(latlng, setup={}) {
    let $circle = L.circle(latlng, {
      radius : this.circleRadius,
      color: '#08F',
      ... this.aspect
    }).addTo(this.$live);

    if(setup.showMarker) {
      this.draw_obj_as_point(latlng)
    }

    if(setup.autoFitBounds) {
      this.fitBounds($circle.getBounds());
    }

    return $circle
  },
  //--------------------------------------
  draw_pair_as_circle(latlng, setup={}) {
    let $circle = this.draw_obj_as_circle(latlng, setup)

    if(setup.showMarker) {
      this.draw_pair_as_point(latlng, setup)
    }

    return $circle
  },
  //--------------------------------------
  //
  // Cluster
  //
  //--------------------------------------
  draw_obj_list_as_cluster(latlngs, setup) {
    var $cluster = L.markerClusterGroup();

    _.forEach(latlngs, (latlng, index)=>{
      let $marker = L.marker(latlng, {
        autoPan : true
      }).addTo($cluster)

      // Add customized value
      $marker.index = index
      $marker.rawData = latlng
    
      // Customized Icon
      this.__customize_marker_behaviors($marker, latlng, setup)
    })

    this.$live.addLayer($cluster)

    return $cluster
  },
  //--------------------------------------
  draw_pair_list_as_cluster(latlngs, setup) {
    return this.draw_obj_list_as_cluster(latlngs, setup)
  },
  //--------------------------------------
}