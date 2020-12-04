export default {
  //--------------------------------------
  // @return [lat, lng]
  mockPair(lat_lng=true) {
    let lat = this.geo.S + (this.geo.N - this.geo.S) * Math.random()
    let lng = this.geo.W + (this.geo.E - this.geo.W) * Math.random()
    return lat_lng 
      ? [lat, lng]
      : [lng, lat]
  },
  //--------------------------------------
  mockPairList(n = 100, lat_lng=true) {
    let list = []
    for(let i=0; i<n; i++){
      list.push(this.mockPair(lat_lng))
    }
    return list
  },
  //--------------------------------------
  mockGeoJsonPoint() {
    return {
      type : "Point",
      coordinates : this.TransLnglat([116.39126, 39.90667])
    }
  },
  //--------------------------------------
  showMock() {
    let poi = this.mockGeoJsonPoint()
    let ged = {
      "type": "Feature",
      "properties": {
          "name": "Coors Field",
          "amenity": "Baseball Stadium",
          "popupContent": "This is where the Rockies play!"
      },
      "geometry": this.mockGeoJsonPoint()
    }
    console.log(ged)
    L.geoJSON(ged).addTo(this.$map);
  }
  //--------------------------------------
}