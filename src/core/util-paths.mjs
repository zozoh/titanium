const TiPaths = {
  /***
   * Get the name of a Ti linked path, such as:
   * 
   * - `@com:xxxx`
   * - `@mod:xxxx`
   * - `./mod/xxxx`
   * - `./com/xxxx`
   * 
   * @param `path{String}` The path
   * @return The major name of entity
   */
  getLinkName(path) {
    let p_a = path.lastIndexOf('/')
    let p_b = path.lastIndexOf(':')
    let pos = Math.max(p_a, p_b)
    let str = pos >= 0 
                ? path.substring(pos+1)
                : path
    return TiPaths.getMajorName(str)
  },
  /***
   * Get the file name of a path
   * 
   * @param `path{String}` The path
   * @return The file name of entity (like file ordir) of a path
   */
  getFileName(path, dft="") {
    if(!path)
      return dft

    while(path.endsWith("/")) {
      path = path.substring(0, path.length-1)
    }
    
    let pos = path.lastIndexOf("/")
    if(pos>=0) {
      return path.substring(pos+1)
    }
    return path
  },
  /***
   * Get the major name of a path
   * 
   * @param `path{String}` The path
   * @return The major name of entity (like file ordir) of a path
   */
  getMajorName(path, dft="") {
      if (!path)
          return dft;

      while(path.endsWith("/")) {
        path = path.substring(0, path.length-1)
      }

      var len = path.length;
      var l = 0;
      var r = len;
      for (var i = r - 1; i > 0; i--) {
          if (r == len)
              if (path[i] == '.') {
                  r = i;
              }
          if (path[i] == '/' || path[i] == '\\') {
              l = i + 1;
              break;
          }
      }
      return path.substring(l, r);
  },
  /**
   * 获取文件后缀名，不包括 '.'，如 'abc.gif','，则返回 'gif'
   *
   * @param path
   *            文件路径
   * @return 文件后缀名
   */
  getSuffixName(path, forceLower) {
      if (!path)
          return "";
      var p0 = path.lastIndexOf('.');
      var p1 = path.lastIndexOf('/');
      if (-1 == p0 || p0 < p1)
          return "";
      var sfnm = path.substring(p0 + 1);
      return forceLower ? sfnm.toLowerCase() : sfnm;
  },
  /**
   * 获取文件后缀名，包括 '.'，如 'abc.gif','，则返回 '.gif'
   *
   * @param path
   *            文件路径
   * @return 文件后缀
   */
  getSuffix(path, forceLower) {
      if (!path)
          return "";
      var p0 = path.lastIndexOf('.');
      var p1 = path.lastIndexOf('/');
      if (-1 == p0 || p0 < p1)
          return "";
      var sfnm = path.substring(p0);
      return forceLower ? sfnm.toLowerCase() : sfnm;
  },
  splitPathToFullAncestorList(ph) {
    if(!ph) {
      return []
    }
    let re = []
    let last = 0;
    let pos = 0
    while((pos = ph.indexOf('/', pos))>1) {
      re.push(ph.substring(0, pos))
      pos ++
      last = pos
    }
    if(last < ph.length) {
      re.push(ph)
    }
    return re
  },
  /***
   * Merge a group of string to a path.
   * 
   * @param args{...<String>} : The paths to join
   * 
   * @return Path string
   */
  appendPath(...args) {
    let re = []
    for(let ph of args) {
      if(_.isEmpty(ph)){
        continue
      }
      // remove the last '/'
      let m = /\/*$/.exec(ph)
      if(m) {
        ph = ph.substring(0, m.index)
      }
      // add the middle '/'
      if(re.length > 0 && !(/^\//.test(ph))) {
        re.push("/")
      }
      re.push(ph)
    }
    return re.join("")
  },
  /***
   * Get the parent path
   */
  getParentPath(path="") {
    if(!path)
      return path
    while(path.endsWith("/")) {
      path = path.substring(0, path.length-1)
    }
    let pos = path.lastIndexOf("/")
    if(pos<0)
      return ""
    return path.substring(0, pos+1)
  },
  /***
   * 将两个路径比较，得出相对路径。
   * 所谓相对路径，就是从基础路径出发，经过相对路径，即可得到目标路径
   * 
   * @param base
   *            基础路径，以 '/' 结束，表示目录
   * @param path
   *            目标路径，以 '/' 结束，表示目录
   * @param equalPath
   *            如果两个路径相等，返回什么，通常为 "./"。 
   *            你也可以用 "" 或者 "." 或者随便什么字符串来表示
   * 
   * @return 相对于基础路径对象的相对路径
   */
  getRelativePath(base="", path="", equalPath=".") {
    // Guard
    if(_.isEqual(base, path)) {
      return equalPath
    }
    //............................................
    let baseIsDir = base.endsWith("/")
    let pathIsDir = path.endsWith("/")
    let aryBase = _.without(base.split("/"), "")
    let aryPath = _.without(path.split("/"), "")
    //............................................
    // Compare too paths
    let len = Math.min(aryBase.length, aryPath.length)
    let pos = 0;
    for(; pos<len; pos++) {
      let ba = aryBase[pos]
      let ph = aryPath[pos]
      if(ba != ph) {
        break
      }
    }
    //............................................
    let rph = []
    // Back
    let baseLen = aryBase.length
    if(!baseIsDir) {
      baseLen --
    }
    for(let i=pos; i<baseLen; i++) {
      rph.push("..")
    }
    // Go into
    for(let i=pos; i<aryPath.length; i++) {
      rph.push(aryPath[i])
    }
    //............................................
    if(pathIsDir) {
      rph.push("")
    }
    //............................................
    return rph.join("/")
  },
  /***
   * 'arena>item:change' -> {block:"arena", event:"item:change"} 
   */
  explainEventName(name) {
    let re = {}
    let m = /^(([^>]+)>)?(.+)$/.exec(name)
    if(m) {
      re.block = _.trim(m[2])
      re.event = _.trim(m[3])
    }
    return re
  },
  /***
   * 'arena>item:change' -> {block:"arena", event:"item:change"} 
   */
  parseHref(href="") {
    let m = /^((https?):)?((\/\/([^/:]+))(:(\d+))?)?([^?#]*)(\?([^#]*))?(#(.*))?$/
              .exec(href)
    if(m) {
      let link = {
        href,
        protocol: m[2],
        host    : m[5],
        port    : (m[7]||80)*1,
        path    : m[8],
        search  : m[9],
        query   : m[10],
        hash    : m[11],
        anchor  : m[12],
        toUrlPath() {
          let ss = []
          if(this.protocol) {
            ss.push(`:${this.protocol}`)
          }
          if(this.host) {
            ss.push(`//${this.host}`)
          }
          if(this.port>80) {
            ss.push(`:${this.port}`)
          }
          if(this.path) {
            ss.push(this.path)
          }
          return ss.join("")
        },
        toString() {
          let s = this.toUrlPath()
          if(!_.isEmpty(this.params)) {
            let pp = []
            _.forEach(this.params, (v, k)=>{
              pp.push(`${k}=${v}`)
            })
            s += '?'+pp.join("&")
          }
          if(this.hash) {
            s += this.hash
          }
          return s
        }
      }
      if(link.query) {
        let params = {}
        let ss = link.query.split('&')
        for(let s of ss) {
          let pos = s.indexOf('=')
          if(pos > 0) {
            let k = s.substring(0, pos)
            let v = s.substring(pos+1)
            params[k] = decodeURIComponent(v)
          } else {
            params[s] = true
          }
        }
        link.params = params
      }
      return link
    }
    return {path:href}
  },
  //---------------------------------
  parseAnchorFilter(input) {
    if(!input) {
      return null
    }
    return Ti.Util.AnchorFilter(input)
  }
}
//-----------------------------------
export default TiPaths
