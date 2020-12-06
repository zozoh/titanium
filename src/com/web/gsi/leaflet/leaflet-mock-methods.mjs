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
  }
  //--------------------------------------
}