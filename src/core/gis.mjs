//const BAIDU_LBS_TYPE = "bd09ll";
const pi = 3.1415926535897932384626;
const a  = 6378245.0;
const ee = 0.00669342162296594323;
////////////////////////////////////////////////////
const TiGis = {
  //------------------------------------------------
  isInBounds(lat, lng, bound) {
    let {N,S,E,W} = bound
    if(lat > N || lat < S)
      return false
    if(lng > E || lng < W)
      return false
    
    return true
  },
  //------------------------------------------------
  isLatLngObjInBounds({lat, lng}, bound) {
    return TiGis.isInBounds(lat, lng, bound)
  },
  //------------------------------------------------
  isLatLngPairInBounds([lat, lng], bound) {
    return TiGis.isInBounds(lat, lng, bound)
  },
  //------------------------------------------------
  __build_bounds({N,S,E,W}={}) {
    return {
      N,S,E,W,
      // Corner
      NE : {lat: N, lng: E},
      NW : {lat: N, lng: W},
      SE : {lat: S, lng: E},
      SW : {lat: S, lng: W},
      // Center
      lat : (N + S) / 2,
      lng : (W + E) / 2
    }
  },
  //------------------------------------------------
  getLatlngPairBounds(latlngPairs=[]) {
    let bo = {
      N: -90,  S:90,
      W: 180,  E:-180
    }
    _.forEach(latlngPairs, ([lat,lng])=>{
      if(!_.isNumber(lng) || !_.isNumber(lat))
        return
      bo.N = Math.max(lat, bo.N)
      bo.S = Math.min(lat, bo.S)
      bo.E = Math.max(lng, bo.E)
      bo.W = Math.min(lng, bo.W)
    })
    return TiGis.__build_bounds(bo)
  },
  //------------------------------------------------
  getLnglatPairBounds(latlngPairs=[]) {
    let bo = {
      N: -90,  S:90,
      W: 180,  E:-180
    }
    _.forEach(latlngPairs, ([lng, lat])=>{
      if(!_.isNumber(lng) || !_.isNumber(lat))
        return
      bo.N = Math.max(lat, bo.N)
      bo.S = Math.min(lat, bo.S)
      bo.E = Math.max(lng, bo.E)
      bo.W = Math.min(lng, bo.W)
    })
    return TiGis.__build_bounds(bo)
  },
  //------------------------------------------------
  getLatlngObjBounds(latlngObjs=[]) {
    let bo = {
      N: -90,  S:90,
      W: 180,  E:-180
    }
    _.forEach(latlngObjs, ({lat,lng})=>{
      if(!_.isNumber(lng) || !_.isNumber(lat))
        return
      bo.N = Math.max(lat, bo.N)
      bo.S = Math.min(lat, bo.S)
      bo.E = Math.max(lng, bo.E)
      bo.W = Math.min(lng, bo.W)
    })
    return TiGis.__build_bounds(bo)
  },
  //------------------------------------------------
  latlngPairToObj([lat, lng]=[]){
    return {lat, lng}
  },
  //------------------------------------------------
  lnglatPairToObj([lng, lat]=[]){
    return {lat, lng}
  },
  //------------------------------------------------
  objToLatlngPair({lat, lng}={}){
    return [lat, lng]
  },
  //------------------------------------------------
  objToLnglatPair({lat, lng}={}){
    return [lng, lat]
  },
  //------------------------------------------------
  /**
   * 
   * @param pair
   * @param mode{String}, transform mode, it could be:
   *   - WGS84_TO_GCJ02
   *   - WGS84_TO_BD09
   *   - GCJ02_TO_WGS84
   *   - GCJ02_TO_BD09
   *   - BD09_TO_GCJ02
   *   - BD09_TO_WGS84
   * @return [lat, lng]
   */
  transLatlngPair(latlng, mode="WGS84_TO_GCJ02") {
    let {lat, lng} = TiGis[mode](...latlng)
    return [lat, lng]
  },
  //------------------------------------------------
  transLnglatPair(latlng, mode="WGS84_TO_GCJ02") {
    let [lng0, lat0] = latlng
    let {lat, lng} = TiGis[mode](lat0, lng0)
    return [lng, lat]
  },
  //------------------------------------------------
  // @return {lat, lng}
  transLatlngObj(latlng, mode="WGS84_TO_GCJ02", keep=false) {
    let {lat, lng} = latlng
    let obj2 = TiGis[mode](lat, lng)
    if(keep) {
      return {...latlng,  ...obj2}
    }
    return obj2
  },
  //------------------------------------------------
  /**
   * 84 to 火星坐标系 (GCJ-02) World Geodetic System ==> Mars Geodetic System
   * @param lat
   * @param lon
   * @return Object({lat,lng})
   */
  WGS84_TO_GCJ02(lat, lon) {
    if (TiGis.outOfChina(lat, lon)) {
      return {lat:lat, lng:lon};
    }
    let dLat = TiGis.transformLat(lon - 105.0, lat - 35.0);
    let dLon = TiGis.transformLng(lon - 105.0, lat - 35.0);
    let radLat = lat / 180.0 * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    let sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    let mgLat = lat + dLat;
    let mgLon = lon + dLon;
    return {lat:mgLat, lng:mgLon};
  },
  //------------------------------------------------
  /**
   * (BD-09)-->84
   * @param bd_lat
   * @param bd_lon
   * @return Object({lat,lng})
   */
  WGS84_TO_BD09(lat, lon) {
    let gcj02 = TiGis.WGS84_TO_GCJ02(lat, lon);
    let bd09  = TiGis.GCJ02_TO_BD09(gcj02.lat, gcj02.lng);
    return bd09;
  },
  //------------------------------------------------
  /**
   * 火星坐标系 (GCJ-02) to 84 * 
   * @param lon 
   * @param lat
   * @return Object({lat,lng})
   */
  GCJ02_TO_WGS84(lat, lon) {
      let gps = TiGis.transform(lat, lon);
      let longitude = lon * 2 - gps.lng;
      let latitude  = lat * 2 - gps.lat;
      return {lat:latitude, lng:longitude};
  },
  //------------------------------------------------
  /**
   * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换算法 将 GCJ-02 坐标转换成 BD-09 坐标
   *
   * @param gg_lat
   * @param gg_lon
   * @return Object({lat,lng})
   */
  GCJ02_TO_BD09(gg_lat, gg_lon) {
      let x = gg_lon, y = gg_lat;
      let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * pi);
      let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * pi);
      let bd_lon = z * Math.cos(theta) + 0.0065;
      let bd_lat = z * Math.sin(theta) + 0.006;
      return {lat:bd_lat, lng:bd_lon};
  },
  //------------------------------------------------
  /**
   * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换算法 * 
   * 将 BD-09 坐标转换成GCJ-02 坐标 
   * @param bd_lat 
   * @param bd_lon
   * @return Object({lat,lng})
   */
  BD09_TO_GCJ02(bd_lat, bd_lon) {
      let x = bd_lon - 0.0065, y = bd_lat - 0.006;
      let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
      let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
      let gg_lon = z * Math.cos(theta);
      let gg_lat = z * Math.sin(theta);
      return {lat:gg_lat, lng:gg_lon};
  },
  //------------------------------------------------
  /**
   * (BD-09)-->84
   * @param bd_lat
   * @param bd_lon
   * @return Object({lat,lng})
   */
  BD09_TO_WGS84(bd_lat, bd_lon) {
      let gcj02 = TiGis.BD09_TO_GCJ02(bd_lat, bd_lon);
      let map84 = TiGis.GCJ02_TO_WGS84(gcj02.lat, gcj02.lng);
      return map84;
  },
  //------------------------------------------------
  /**
   * is or not outOfChina
   * @param lat
   * @param lon
   * @return Boolean
   */
  outOfChina(lat, lon) {
      if (lon < 72.004 || lon > 137.8347)
          return true;
      if (lat < 0.8293 || lat > 55.8271)
          return true;
      return false;
  },
  //------------------------------------------------
  transform(lat, lon) {
    if (TiGis.outOfChina(lat, lon)) {
      return {lat:lat, lng:lon};
    }
    let dLat = TiGis.transformLat(lon - 105.0, lat - 35.0);
    let dLon = TiGis.transformLng(lon - 105.0, lat - 35.0);
    let radLat = lat / 180.0 * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    let sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    let mgLat = lat + dLat;
    let mgLon = lon + dLon;
    return {lat:mgLat, lng:mgLon};
  },
  //------------------------------------------------
  transformLat(x, y) {
      let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
              + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
      return ret;
  },
  //------------------------------------------------
  transformLng(x, y) {
      let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
              * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
              * pi)) * 2.0 / 3.0;
      return ret;
  }
  //------------------------------------------------
}
////////////////////////////////////////////////////
export const GIS = TiGis

