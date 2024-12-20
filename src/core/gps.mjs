//const BAIDU_LBS_TYPE = "bd09ll";
const pi = 3.1415926535897932384626;
const a  = 6378245.0;
const ee = 0.00669342162296594323;
//-----------------------------------
const TiGPS = {
  /**
   * 84 to 火星坐标系 (GCJ-02) World Geodetic System ==> Mars Geodetic System
   * @param lat
   * @param lon
   * @return Object({lat,lng})
   */
  WGS84_TO_GCJ02(lat, lon) {
    if (TiGPS.outOfChina(lat, lon)) {
      return {lat:lat, lng:lon};
    }
    let dLat = TiGPS.transformLat(lon - 105.0, lat - 35.0);
    let dLon = TiGPS.transformLng(lon - 105.0, lat - 35.0);
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

  /**
   * (BD-09)-->84
   * @param bd_lat
   * @param bd_lon
   * @return Object({lat,lng})
   */
  WGS84_TO_BD09(lat, lon) {
    let gcj02 = TiGPS.WGS84_TO_GCJ02(lat, lon);
    let bd09  = TiGPS.GCJ02_TO_BD09(gcj02.lat, gcj02.lng);
    return bd09;
  },

  /**
   * 火星坐标系 (GCJ-02) to 84 * 
   * @param lon 
   * @param lat
   * @return Object({lat,lng})
   */
  GCJ02_TO_WGS84(lat, lon) {
      let gps = TiGPS.transform(lat, lon);
      let longitude = lon * 2 - gps.lng;
      let latitude  = lat * 2 - gps.lat;
      return {lat:latitude, lng:longitude};
  },

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

  /**
   * (BD-09)-->84
   * @param bd_lat
   * @param bd_lon
   * @return Object({lat,lng})
   */
  BD09_TO_WGS84(bd_lat, bd_lon) {
      let gcj02 = TiGPS.BD09_TO_GCJ02(bd_lat, bd_lon);
      let map84 = TiGPS.GCJ02_TO_WGS84(gcj02.lat, gcj02.lng);
      return map84;
  },

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

  transform(lat, lon) {
    if (TiGPS.outOfChina(lat, lon)) {
      return {lat:lat, lng:lon};
    }
    let dLat = TiGPS.transformLat(lon - 105.0, lat - 35.0);
    let dLon = TiGPS.transformLng(lon - 105.0, lat - 35.0);
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

  transformLat(x, y) {
      let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
              + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
      return ret;
  },

  transformLng(x, y) {
      let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
              * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
              * pi)) * 2.0 / 3.0;
      return ret;
  },

  getLngToWest(lng, west){
    let re = lng - west;
    if(west<0 && lng>0){
      return 360 - re
    }
    return re
  },

  getLatToSouth(lat, south) {
    return lat - south
  },

  normlizedLat(lat) {
    return lat
  },

  normlizedLng(lng) {
    if(lng > 360) {
      lng = lng % 360
    }
    if(lng > 180) {
      return lng - 360
    }
    if(lng < -360) {
      lng = lng % 360
    }
    if(lng < -180) {
      return lng + 360
    }
    return lng
  },

  //-------------------------------------
    /*
    CROSS MODE:
          lng:180        360:0                 180
          +----------------+------------------NE  lat:90
          |                |           lng_min|lat_max
          |                |                  |
          +----------------+------------------+-- lat:0
          |                |                  |
   lat_min|lng_max         |                  |
          SW---------------+------------------+   lat:-90
    
    SIDE MODE:
          lng:0           180                360
          +----------------+------------------NE  lat:90
          |                |           lng_max|lat_max
          |                |                  |
          +----------------+------------------+-- lat:0
          |                |                  |
   lat_min|lng_min         |                  |
          SW---------------+------------------+   lat:-90
    
    @return [SW, NE]
    */
   getBounds(lalList=[]) {
    let lng_max = undefined;
    let lng_min = undefined;
    let lat_max = undefined;
    let lat_min = undefined;
    for(let lal of lalList) {
      lng_max = _.isUndefined(lng_max)
                  ? lal.lng : Math.max(lng_max, lal.lng)
      lng_min = _.isUndefined(lng_min)
                  ? lal.lng : Math.min(lng_min, lal.lng)
      lat_max = _.isUndefined(lat_max)
                  ? lal.lat : Math.max(lat_max, lal.lat)
      lat_min = _.isUndefined(lat_min)
                  ? lal.lat : Math.min(lat_min, lal.lat)
    }
    // Cross mode
    if((lng_max-lng_min) > 180) {
      return [
        {lat: lat_min, lng:lng_max},
        {lat: lat_max, lng:lng_min}]
    }
    // Side mode
    return [
      {lat: lat_min, lng:lng_min},
      {lat: lat_max, lng:lng_max}]      
  },

  getCenter(lalList=[]) {
    let [sw, ne] = TiGPS.getBounds(lalList)
    return {
      lat: (ne.lat + sw.lat)/2,
      lng: (ne.lng + sw.lng)/2
    }
  }
}
//---------------------------------------
export const GPS = TiGPS

