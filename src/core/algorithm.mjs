///////////////////////////////////////////
class GridLayout {
  //......................................
  constructor({
    flow = "row",   // Fill by row, row|column
    dense = false,  // Debse arrange, try to reuse the space
    cols = 3,     // Grid columns count
    rows = 3,     // Grid rows count
    cellMeasure = cell => ({
      colStart: _.get(cell, colStart),
      colSpan: Ti.Util.fallback(_.get(cell, colSpan), 1),
      rowStart: _.get(cell, colStart),
      rowSpan: Ti.Util.fallback(_.get(cell, colSpan), 1)
    })
  } = {}) {
    this.flow = "row"
    this.dense = dense ? true : false
    this._x = 1
    this._y = 1
    this.maxX = cols
    this.maxY = rows
    /*
      [y][x] 2D-Array:
      [[C0][C0][C1]]  
      [[C2][C2][C1]]
      [ ... ]
       */
    this.matrix = []
  }
  //......................................
  isCanPutCell({
    colStart, rowStart,
    colSpan = 1, rowSpan = 1
  } = {}) {
    let maxX = Math.min(this.maxX, colStart + colSpan)
    let maxY = Math.min(this.maxY, rowStart + rowSpan)

    // Try to mark
    for (let y = rowStart; y < maxY; y++) {
      // Get row cell array
      let cells = this.matrix[y]
      if (!_.isArray(cells)) {
        cells = []
        this.matrixta[y] = cells;
      }
      for (x = minX; x < maxX; x++) {
        cells[x] = cellKey
      }
    }
  }
//......................................
  markCell({
    colStart, rowStart,
    colSpan = 1, rowSpan = 1
  } = {}) {
    let maxX = Math.min(this.maxX, colStart + colSpan)
    let maxY = Math.min(this.maxY, rowStart + rowSpan)

    // Try to mark
    for (let y = rowStart; y < maxY; y++) {
      // Get row cell array
      let cells = this.matrix[y]
      if (!_.isArray(cells)) {
        cells = []
        this.matrixta[y] = cells;
      }
      for (x = minX; x < maxX; x++) {
        cells[x] = cellKey
      }
    }
  }
}
// rquired crypto-js
///////////////////////////////////////////
const TiAlg = {
  //---------------------------------------
  fillGrid(cells = [], {
    flow = "row",   // Fill by row, row|column
    dense = false,  // Debse arrange, try to reuse the space
    cols = 3,     // Grid columns count
    rows = 3,     // Grid rows count
    cellMeasure = cell => ({
      colStart: _.get(cell, colStart),
      colSpan: Ti.Util.fallback(_.get(cell, colSpan), 1),
      rowStart: _.get(cell, colStart),
      rowSpan: Ti.Util.fallback(_.get(cell, colSpan), 1)
    })
  } = {}) {
    // 准备一个标记矩阵
    let matrix = {
      _x: 0,      // Index of rows
      _y: 0,      // Index of cols
      /*
      [y][x] 2D-Array:
      [[C0][C0][C1]]  
      [[C2][C2][C1]]
      [ ... ]
       */
      _data: [],
      mark: function ({
        cellKey,  // Like `c0`
        x, y,     // 1 base default as _x, _y
        spanX = 1,
        spanY = 1
      } = {}) {
        if (!cellKey) {
          return
        }
        x = Ti.Util.fallback(x, this._x)
        y = Ti.Util.fallback(y, this._y)
        let minX = x
        let minY = y
        let maxX = x + spanX
        let maxY = y + spanY

        // Try to mark
        for (y = minY; y < maxY; y++) {
          // Get row cell array
          let cells = this._data[y]
          if (!_.isArray(cells)) {
            cells = []
            this._data[y] = cells;
          }
          for (x = minX; x < maxX; x++) {
            cells[x] = cellKey
          }
        }
      }


    }
    //

  },
  //---------------------------------------
  sha1(str) {
    if (!_.isString(str)) {
      str = JSON.stringify(str)
    }
    return CryptoJS.SHA1(str).toString();
  },
  //---------------------------------------
  // 获取两个数的最大公约数
  // greatest common divisor(gcd)
  gcd(a, b) {
    a = Math.round(a);
    b = Math.round(b);
    if (b) {
      return this.gcd(b, a % b);
    }
    return a;
  },
  //---------------------------------------
  gcds() {
    var args = Array.from(arguments);
    var list = _.flatten(args);
    // 没数
    if (list.length == 0)
      return NaN;
    // 一个是自己
    if (list.length == 1) {
      return list[0];
    }
    // 两个以上
    var gcd = this.gcd(list[0], list[1]);
    for (var i = 2; i < list.length; i++) {
      gcd = this.gcd(gcd, list[i]);
    }
    // 返回
    return gcd;
  },
  //---------------------------------------
  // 获取两个数的最小公倍数 
  // lowest common multiple (LCM)
  lcm(a, b) {
    a = Math.round(a);
    b = Math.round(b);
    return a * b / this.gcd(a, b);
  },
  //---------------------------------------
  lcms() {
    var args = Array.from(arguments);
    var list = _.flatten(args);
    // 没数
    if (list.length == 0)
      return NaN;
    // 一个是自己
    if (list.length == 1) {
      return list[0];
    }
    // 两个以上
    var lcm = this.lcm(list[0], list[1]);
    for (var i = 2; i < list.length; i++) {
      lcm = this.lcm(lcm, list[i]);
    }
    // 返回
    return lcm;
  }
  //---------------------------------------
}
///////////////////////////////////////////
export const Alg = TiAlg;
