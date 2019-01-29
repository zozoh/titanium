export const TiPaths = {
  /***
   * Get the major name of a path
   * 
   * @param `path{String}` The path
   * @return The major name of entity (like file ordir) in a path
   */
  getMajorName: function (path) {
      if (!path)
          return "";
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
  getSuffixName: function (path, forceLower) {
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
  getSuffix: function (path, forceLower) {
      if (!path)
          return "";
      var p0 = path.lastIndexOf('.');
      var p1 = path.lastIndexOf('/');
      if (-1 == p0 || p0 < p1)
          return "";
      var sfnm = path.substring(p0 + 1);
      return forceLower ? sfnm.toLowerCase() : sfnm;
  }
}
//-----------------------------------
export default TiPaths
