const TILES = {
  // 高德路网：
  "GAODE_ROADMAP" : {
    tmpl : "https://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang={lang}&size=1&scl=2&style={style}&ltype={type}",
    vars : {subdomains: "1234", style: "8", type: "11", lang: "zh_cn"},
    coord : "GCJ02"
  },
  // 高德影像：
  "GAODE_SATElITE" : {
    tmpl : "https://webst0{s}.is.autonavi.com/appmaptile?style={style}&x={x}&y={y}&z={z}",
    vars : {subdomains: "1234", style: "6"},
    coord : "GCJ02"
  },
  // 高德矢量：
  "GAODE_VECTOR" : {
    tmpl : "http://wprd0{s}.is.autonavi.com/appmaptile?lang={lang}&size=1&style={style}&x={x}&y={y}&z={z}",
    vars : {subdomains: "1234", style: "7", lang: "zh_cn"},
    coord : "GCJ02"
  },
  // 谷歌矢量：
  "GOOGLE_VECTOR" : {
    tmpl : "http://mt{s}.google.cn/vt/lyrs=m&scale=2&hl={lang}&gl=cn&x={x}&y={y}&z={z}",
    vars : {subdomains: "0123", lang: "zh-CN"},
    coord : "WGS84"
  },
  // 谷歌路网：
  "GOOGLE_ROADMAP" : {
    tmpl : "https://mt{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
    vars : {subdomains: "0123"},
    coord : "WGS84"
  },
  // 谷歌影像：
  "GOOGLE_SATElITE" : {
    tmpl : "http://www.google.cn/maps/vt?lyrs=s@189&gl=${lang}&x={x}&y={y}&z={z}",
    vars : {subdomains: "0123", lang: "cn"},
    coord : "WGS84"
  },
  // 谷歌影像带注记：
  "GOOGLE_SATElITE_NOTE" : {
    tmpl : "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    vars : {subdomains: "0123"},
    coord : "WGS84"
  },
  // 谷歌地形：
  "GOOGLE_TERRAIN" : {
    tmpl : "https://mt{s}.google.com/vt/lyrs=t&x={x}&y={y}&z={z}",
    vars : {subdomains: "0123"},
    coord : "WGS84"
  },
  // 谷歌地图矢量带地形渲染：
  "GOOGLE_VECTOR_TERRAIN" : {
    tmpl : "https://mt{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
    vars : {subdomains: "0123"},
    coord : "WGS84"
  },
  // 街景地图：
  "OPENSTREAT" : {
    tmpl : "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    vars : {},
    coord : "WGS84"
  },
  // CartoDB
  "CARTO" : {
    tmpl : "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
    vars : {},
    coord : "WGS84"
  },
  "CARTO_ALL" : {
    tmpl : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    vars : {},
    coord : "WGS84"
  },
  "CARTO_LABEL" : {
    tmpl : "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
    vars : {},
    coord : "WGS84"
  },
  // 天地图影像：
  "TIANDITU_SATElITE" : {
    tmpl : "http://t7.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=e3b434f191257368fc43c5b011ab5911",
    vars : {},
    coord : "GCJ02"
  },
  // 天地图影像注记：
  "TIANDITU_SATElITE_NOTE" : {
    tmpl : "http://t7.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=e3b434f191257368fc43c5b011ab5911",
    vars : {},
    coord : "GCJ02"
  },
  // 天地矢量：
  "TIANDITU_VECTOR" : {
    tmpl : "http://t7.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=e3b434f191257368fc43c5b011ab5911",
    vars : {},
    coord : "GCJ02"
  },
  // 天地矢量注记：
  "TIANDITU_VECTOR_NOTE" : {
    tmpl : "http://t7.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=e3b434f191257368fc43c5b011ab5911",
    vars : {},
    coord : "GCJ02"
  },
  // 天地图地形：
  "TIANDITU_TERRAIN" : {
    tmpl : "http://t7.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=e3b434f191257368fc43c5b011ab5911",
    vars : {},
    coord : "GCJ02"
  },
  // 天地图地形注记：
  "TIANDITU_TERRAIN_NOTE" : {
    tmpl : "http://t7.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=e3b434f191257368fc43c5b011ab5911",
    vars : {},
    coord : "GCJ02"
  },
  // 腾讯地图矢量：
  "QQ_VECTOR_NOTE" : {
    tmpl : "http://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type={type}&style={style}",
    vars : {subdomains: "0123", style: "0", type: "vector"},
    coord : "GCJ02"
  }
}
////////////////////////////////////////////
export default {
  getTileCoord(type) {
    return _.get(TILES[type], "coord")
  },
  createTileLayer(type, vars) {
    let it = TILES[type]
    if(!it) {
      throw `Unknown tile layer type '${type}'`
    }
    let options = _.assign({}, it.vars, vars)
    return L.tileLayer(it.tmpl, options)
  }
}
////////////////////////////////////////////