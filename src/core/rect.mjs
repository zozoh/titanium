//--------------------------------------
class QuickKeyMap {
  constructor() {
    _.assign(this, {
      t : "top",
      l : "left",
      w : "width",
      h : "height",
      r : "right",
      b : "bottom",
      x : "x",
      y : "y"
    })
  }
  explainToArray(keys, sorted=true) {
    let re = []
    let ks = NormalizeQuickKeys(keys, sorted)
    for(let k of ks) {
      let key = this[k];
      if(key)
        re.push(key)
    }
    return re;
  }
  getKey(qk) {
    return this[qk]
  }
}
const QKM = new QuickKeyMap()
//--------------------------------------
function AutoModeBy(rect={}) {
  let keys = ["bottom", "height", "left", "right", "top", "width", "x", "y"]
  let ms = []
  for(let key of keys) {
    if(!_.isUndefined(rect[key])) {
      let k = key.substring(0,1)
      ms.push(k)
    }
  }
  return ms.join("")
}
//--------------------------------------
function NormalizeQuickKeys(keys, sorted=true) {
  if(!keys)
    return []
  if(_.isArray(keys))
    return keys
  let list =  keys.toLowerCase().split("")
  if(sorted)
    return list.sort()
  return list
}
//--------------------------------------
function PickKeys(rect, keys, dft) {
  let re = {};
  let ks = QKM.explainToArray(keys, false)
  for(let key of ks) {
    let val = Ti.Util.fallback(rect[key], dft)
    if(!_.isUndefined(val)) {
      re[key] = val
    }
  }
  return re;
}
//--------------------------------------
export class Rect {
  constructor(rect, mode){
    this.__ti_rect__ = true;
    this.set(rect, mode)
  }
  //--------------------------------------
  set(rect={top:0,left:0,width:0,height:0}, mode) {
    const keys = ["bottom", "height", "left", "right", "top", "width", "x", "y"]

    // Pick keys and auto-mode
    if(_.isUndefined(mode)) {
      let ms = []
      for(let key of keys) {
        let val = rect[key]
        if(_.isNumber(val)) {
          // copy value
          this[key] = val
          // quick key
          let k = key.substring(0,1)
          ms.push(k)
        }
      }
      // Gen the quick mode
      mode = ms.join("")
    }
    // Just pick the keys
    else {
      for(let key of keys) {
        let val = rect[key]
        if(_.isNumber(val)) {
          this[key] = val
        }
      }
    }
    
    // Ignore 
    if("bhlrtwxy" == mode)
      return this
    
    // update
    return this.updateBy(mode)
  }
  //--------------------------------------
  toString(keys="tlwh"){
    let re = PickKeys(this, keys, "NaN")
    let ss = []
    _.forEach(re, (val)=>ss.push(val))
    return ss.join(",")
  }
  valueOf(){
    return this.toString()
  }
  //--------------------------------------
  updateBy(mode="tlwh") {
    let ary = QKM.explainToArray(mode)
    let alg = ary.join("/");
    ({
      "height/left/top/width" : ()=>{
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
        this.x = this.left + this.width / 2;
        this.y = this.top + this.height / 2;
      },
      "height/right/top/width" : ()=>{
        this.left = this.right - this.width;
        this.bottom = this.top + this.height;
        this.x = this.left + this.width / 2;
        this.y = this.top + this.height / 2;
      },
      "bottom/height/left/width" : ()=>{
        this.top = this.bottom - this.height;
        this.right = this.left + this.width;
        this.x = this.left + this.width / 2;
        this.y = this.top + this.height / 2;
      },
      "bottom/height/right/width" : ()=>{
        this.top = this.bottom - this.height;
        this.left = this.right - this.width;
        this.x = this.left + this.width / 2;
        this.y = this.top + this.height / 2;
      },
      "bottom/left/right/top" : ()=>{
        this.width = this.right - this.left;
        this.height = this.bottom - this.top;
        this.x = this.left + this.width / 2;
        this.y = this.top + this.height / 2;
      },
      "height/width/x/y" : ()=>{
        let W2 = this.width / 2;
        let H2 = this.height / 2;
        this.top = this.y - H2;
        this.bottom = this.y + H2;
        this.left = this.x - W2;
        this.right = this.x + W2;
      },
      "height/left/width/y" : ()=>{
        let W2 = this.width / 2;
        let H2 = this.height / 2;
        this.top = this.y - H2;
        this.bottom = this.y + H2;
        this.x = this.left + W2;
        this.right = this.left + this.width;
      },
      "height/right/width/y" : ()=>{
        let W2 = this.width / 2;
        let H2 = this.height / 2;
        this.top = this.y - H2;
        this.bottom = this.y + H2;
        this.x = this.right - W2;
        this.left = this.right - this.width;
      },
      "height/top/width/x" : ()=>{
        let W2 = this.width / 2;
        let H2 = this.height / 2;
        this.y = this.top + H2;
        this.bottom = this.top + this.height;
        this.left = this.x - W2;
        this.right = this.x + W2;
      },
      "bottom/height/width/x" : ()=>{
        let W2 = this.width / 2;
        let H2 = this.height / 2;
        this.y = this.bottom - H2;
        this.top = this.bottom - this.height;
        this.left = this.x - W2;
        this.right = this.x + W2;
      }
    })[alg]()
    
    return this
  }
  //--------------------------------------
  /***
   * Pick keys and create another raw object
   */
  raw(keys="tlwh", dft) {
    return PickKeys(this, keys, dft)
  }
  //--------------------------------------
  // 将一个矩形转换为得到一个 CSS 的矩形描述
  // 即 right,bottom 是相对于视口的右边和底边的
  // keys 可选，比如 "top,left,width,height" 表示只输出这几个CSS的值
  // 如果不指定 keys，则返回的是 "top,left,width,height,right,bottom"
  // keys 也支持快捷定义:
  //   - "tlwh" : "top,left,width,height"
  //   - "tlbr" : "top,left,bottom,right"
  toCss(viewport={
    width  : window.innerWidth,
    height : window.innerHeight
  }, keys="tlwh", dft) {
    // 计算
    var css = {
        top    : this.top,
        left   : this.left,
        width  : this.width,
        height : this.height,
        right  : viewport.width  - this.right,
        bottom : viewport.height - this.bottom
    };
    if(Ti.IsDebug()) {
      console.log("CSS:", css)
    }
    return PickKeys(css, keys, dft)
  }
  //--------------------------------------
  // 得到一个新 Rect，左上顶点坐标系相对于 base (Rect)
  // 如果给定 forCss=true，则将坐标系统换成 CSS 描述
  // baseScroll 是描述 base 的滚动，可以是 Element/jQuery
  // 也可以是 {x,y} 格式的对象
  // 默认为 {x:0,y:0} 
  relative(rect, scroll={x:0,y:0}) {
    // 计算相对位置
    this.top  = this.top  - (rect.top  - scroll.y)
    this.left = this.left - (rect.left - scroll.x)

    return this.updateBy("tlwh");
  }
  //--------------------------------------
  // 缩放矩形
  // - x : X 轴缩放
  // - y : Y 轴缩放，默认与 zoomX 相等
  // - centre : 相对的顶点 {x,y}，默认取自己的中心点
  // 返回矩形自身
  zoom({x=1, y=x, centre=this}={}) {
    this.top  = (this.top  - centre.y) * y + centre.y
    this.left = (this.left - centre.x) * x + centre.x
    this.width  = this.width * x
    this.height = this.height * y

    return this.updateBy("tlwh");
  }
  //--------------------------------------
  // 将给定矩形等比缩放到适合宽高
  //  - width  : 最大宽度
  //  - height : 最大高度
  //  - mode   : 缩放模式
  //      - contain : 确保包含在内
  //      - cover   : 最大限度撑满视口
  // 返回矩形自身
  zoomTo({width,height,mode="contain"}={}) {
    // zoom scale when necessary
    if("contain" == mode){
      let viewport = new Rect({top:0,left:0,width,height})
      if(viewport.contains(this)) {
        return this;
      }
    }
    // 获得尺寸
    let w  = width;
    let h  = height;
    let oW = this.width;
    let oH = this.height;
    let oR = oW / oH;
    let nR = w  / h;

    let nW, nH;

    // Too wide
    if (oR > nR) {
      // Cover
      if("cover" == mode) {
        nH = h;
        nW = h * oR;
      }
      // Contain
      else {
        nW = w;
        nH = (w) / oR;
      }
    }
    // Too hight
    else if (oR < nR) {
      // Cover
      if("cover" == mode) {
        nW = w;
        nH = (w) / oR;
      }
      // Contain
      else {
        nH = h;
        nW = h * oR;
      }
    }
    // Then same
    else {
        nW = w;
        nH = h;
        x = 0;
        y = 0;
    }

    this.width  = nW;
    this.height = nH;
    
    return this.updateBy("tlwh")
  }
  //--------------------------------------
  // 移动自己到指定视口的中间
  centreTo({width,height,top=0,left=0}={}, {xAxis=true,yAxis=true}={}) {
    // Translate xAxis
    if(xAxis) {
      if(width > 0) {
        let w = width - this.width
        this.left = left + (w/2)
      }
    }
    // Translate yAxis
    if(yAxis) {
      if(height > 0) {
        let h = height - this.height
        this.top = top + (h/2)
      }
    }

    return this.updateBy("tlwh")
  }
  //--------------------------------------
  // 移动矩形
  // - x   : X 轴位移
  // - y   : Y 周位移
  // 返回矩形自身
  translate({x=0,y=0}={}) {
    this.y  -= y;
    this.x -= x;
    return this.updateBy("xywh");
  }
  /***
   * Move to position by one of four corners
   * 
   * @params pos : The targt position
   * @params offset : the orignal position 
   * @params mode : "tl|br|tr|bl"
   */
  moveTo(pos={}, offset={}, mode="tl") {
    _.defaults(pos, {x:0, y:0})
    _.defaults(offset, {x:0, y:0})

    let ary = QKM.explainToArray(mode)
    let alg = ary.join("/");
    ({
      "left/top" : ()=>{
        this.left = pos.x - offset.x
        this.top  = pos.y - offset.y
        this.updateBy("tlwh")
      },
      "right/top" : ()=>{
        this.right = pos.x + offset.x
        this.top   = pos.y - offset.y
        this.updateBy("trwh")
      },
      "bottom/left" : ()=>{
        this.left   = pos.x - offset.x
        this.bottom = pos.y + offset.y
        this.updateBy("blwh")
      },
      "bottom/right" : ()=>{
        this.right  = pos.x + offset.x
        this.bottom = pos.y + offset.y
        this.updateBy("brwh")
      },
    })[alg]()

    return this
  }
  /***
   * Dock self to target rectangle, with special 
   * docking mode, which specified by `@param axis`.
   * 
   * ```
   *                 H:center/top
   *          H:left/top          H:right:top
   *    V:left/top +----------------+ V:right/top
   *               |                |
   * V:left:center |                | V:right:center
   *               |                |
   * V:left/bottom +----------------+ V:right:bottom
   *       H:left/bottom          H:right:bottom
   *                H:center/bottom
   * ```
   * 
   * @param rect{Rect}`R` - Target rectangle
   * @param axis.x{String} - axisX dock mode:
   *  - `left`   : Dock to left side
   *  - `right`  : Dock to right side
   *  - `center` : Dock to center
   * @param axis.y{String} - axisY dock mode
   *  - `top`    : Dock to top side
   *  - `bottom` : Dock to bottom side
   *  - `center` : Dock to center
   * @param space.x{int} - spacing for vertical-side
   * @param space.y{int} - spacing for horizontal-side
   * @param viewportBorder{int}
   * @param wrapCut{Boolean}
   * 
   * @return {Self} If need to be cut
   */
  dockTo(rect, mode="H", {
    axis={}, 
    space={}, 
    viewport={}, 
    viewportBorder=4,
    wrapCut=false
  }={}) {
    if(_.isNumber(space)) {
      space = {x:space, y:space}
    }
    _.defaults(axis,  {x:"center", y:"bottom"})
    _.defaults(space, {x:0, y:0})

    let alg = mode + ":" + axis.x + "/" + axis.y;

    ({
      "V:left/top" : ()=>{
        this.right = rect.left - space.x
        this.top = rect.top + space.y
        this.updateBy("rtwh")
      },
      "V:left/center" : ()=>{
        this.right = rect.left - space.x
        this.y = rect.y + space.y
        this.updateBy("rywh")
      },
      "V:left/bottom" : ()=>{
        this.right = rect.left - space.x
        this.bottom = rect.bottom - space.y
        this.updateBy("rbwh")
      },
      "V:right/top" : ()=>{
        this.left = rect.right + space.x
        this.top = rect.top + space.y
        this.updateBy("ltwh")
      },
      "V:right/center" : ()=>{
        this.left = rect.right + space.x
        this.y = rect.y + space.y
        this.updateBy("lywh")
      },
      "V:right/bottom" : ()=>{
        this.left = rect.right + space.x
        this.bottom = rect.bottom - space.y
        this.updateBy("lbwh")
      },
      "H:left/top" : ()=>{
        this.left = rect.left + space.x
        this.bottom = rect.top - space.y
        this.updateBy("lbwh")
      },
      "H:left/bottom" : ()=>{
        this.left = rect.left + space.x
        this.top = rect.bottom + space.y
        this.updateBy("ltwh")
      },
      "H:center/top" : ()=>{
        this.x = rect.x + space.x
        this.bottom = rect.top - space.y
        this.updateBy("xbwh")
      },
      "H:center/bottom" : ()=>{
        this.x = rect.x + space.x
        this.top = rect.bottom + space.y
        this.updateBy("xtwh")
      },
      "H:right/top" : ()=>{
        this.right = rect.right - space.x
        this.bottom = rect.top - space.y
        this.updateBy("rbwh")
      },
      "H:right/bottom" : ()=>{
        this.right = rect.right - space.x
        this.top = rect.bottom + space.y
        this.updateBy("rtwh")
      }
    })[alg]()

    // Wrap cut
    let dockMode = "tl"
    if(wrapCut && TiRects.isRect(viewport)) {
      let viewport2 = viewport.clone(viewportBorder)
      // Wrap at first
      viewport2.wrap(this)
      // If still can not contains, overlay it
      if(!viewport2.contains(this)) {
        this.overlap(viewport2)
        dockMode = "tlwh"
      }
    }
    // return
    return dockMode
  }
  /***
   * Like `dockTo` but dock to target inside
   * 
   *
   *         +------top-------+
   *         |       |        |
   *       left----center----right
   *         |       |        |
   *         +-----bottom-----+
   *
   * 
   * @see #dockTo
   */
  dockIn(rect, axis={}, space={}) {
    _.defaults(axis,  {x:"center", y:"center"})
    _.defaults(space, {x:0, y:0})
    
    let alg = axis.x + "/" + axis.y;

    ({
      "left/top" : ()=>{
        this.left = rect.left + space.x
        this.top = rect.top + space.y
        this.updateBy("ltwh")
      },
      "left/center" : ()=>{
        this.left = rect.left + space.x
        this.y = rect.y + space.y
        this.updateBy("lywh")
      },
      "left/bottom" : ()=>{
        this.left = rect.left + space.x
        this.bottom = rect.bottom - space.y
        this.updateBy("lbwh")
      },
      "right/top" : ()=>{
        this.right = rect.right - space.x
        this.top = rect.top + space.y
        this.updateBy("rtwh")
      },
      "right/center" : ()=>{
        this.right = rect.right - space.x
        this.y = rect.y + space.y
        this.updateBy("rywh")
      },
      "right/bottom" : ()=>{
        this.right = rect.right - space.x
        this.bottom = rect.bottom - space.y
        this.updateBy("brwh")
      },
      "center/center" : ()=>{
        this.x = rect.x + space.x
        this.x = rect.y + space.y
        this.updateBy("xywh")
      }
    })[alg]()

    return this

  }
  //--------------------------------------
  /***
   * Make given rect contained by self rect(as viewport).
   * It will auto move the given rect to suited position.
   * If still can not fail to contains it, let it be.
   * 
   * @param rect{Rect} : target rect
   * 
   * @return target rect
   * 
   */ 
  wrap(rect) {
    let ms = ["w","h"]
    //....................................
    // Try X
    if(!this.containsX(rect)) {
      // [viewport]{given} or [viewport {gi]ven}
      if(rect.left>this.left && rect.right>this.right) {
        rect.right = this.right
        ms.push("r")
      }
      // {given}[viewport] or { gi[ven }viewport ]
      // {giv-[viewport]-en}
      else {
        rect.left = this.left
        ms.push("l")
      }
    }
    //....................................
    // Try Y
    if(!this.containsY(rect)) {
      // top:=> [viewport]{given} or [viewport {gi]ven}
      if(rect.top>this.top && rect.bottom>this.bottom) {
        rect.bottom = this.bottom
        ms.push("b")
      }
      // top:=> {given}[viewport] or { gi[ven }viewport ]
      // top:=> {giv-[viewport]-en}
      else {
        rect.top = this.top
        ms.push("t")
      }
    }
    // Has already X
    else if(ms.length == 3) {
      ms.push("t")
    }
    //....................................
    // Lack X
    if(3 == ms.length) {
      ms.push("l")
    }
    //....................................
    // Update it
    if(4 == ms.length) {
      return rect.updateBy(ms.join(""))
    }
    //....................................
    // Done
    return rect
  }
  //--------------------------------------
  /***
   * Make given rect contained by self rect(as viewport).
   * It will auto move the given rect to suited position.
   * If still can not fail to contains it, do the overlap
   * 
   * @param rect{Rect} : target rect
   * 
   * @return target rect
   * 
   */ 
  wrapCut(rect) {
    // Wrap at first
    this.wrap(rect)
    // If still can not contains, overlay it
    if(!this.contains(rect)) {
      rect.overlap(this)
    }
    return rect
  }
  //--------------------------------------
  /***
   * Union current rectangles with another
   */
  union(...rects) {
    for(let rect of rects) {
      this.top    = Math.min(this.top,    rect.top);
      this.left   = Math.min(this.left,   rect.left);
      this.right  = Math.max(this.right,  rect.right);
      this.bottom = Math.max(this.bottom, rect.bottom);
    }
    return this.updateBy("tlbr")
  }
  //--------------------------------------
  overlap(...rects) {
    for(let rect of rects) {
      this.top    = Math.max(this.top,    rect.top);
      this.left   = Math.max(this.left,   rect.left);
      this.right  = Math.min(this.right,  rect.right);
      this.bottom = Math.min(this.bottom, rect.bottom);
    }
    return this.updateBy("tlbr")
  }
  //--------------------------------------
  contains(rect, border=0) {
    return this.containsX(rect, border)
        && this.containsY(rect, border)
  }
  //--------------------------------------
  containsX(rect, border=0) {
    return (this.left   + border) <= rect.left
        && (this.right  - border) >= rect.right;
  }
  //--------------------------------------
  containsY(rect, border=0) {
    return (this.top    + border) <= rect.top
        && (this.bottom - border) >= rect.bottom
  }
  //--------------------------------------
  isOverlap(rect) {
    return this.overlap(rect).area() > 0
  }
  //--------------------------------------
  /***
   * @return Current rectangle area
   */
  area() {
    return this.width * this.height;
  }
  //--------------------------------------
  /***
   * Create new rect without the border
   */
  clone(border=0) {
    return new Rect({
      left   : this.left   + border,
      right  : this.right  - border,
      top    : this.top    + border,
      bottom : this.bottom - border
    }, "tlbr")
  }
}
//--------------------------------------
export const TiRects = {
  create(rect, mode) {
    return new Rect(rect, mode)
  },
  //--------------------------------------
  createBy($el) {
    // Whole window
    if(!$el.ownerDocument) {
      let $win = Ti.Dom.ownerWindow($el)
      return new Rect({
        top : 0, left: 0,
        width  : $win.innerWidth,
        height : $win.innerHeight
      })
    }
    // Element
    let rect = $el.getBoundingClientRect()
    return new Rect(rect, "tlwh")
  },
  //--------------------------------------
  union(...rects) {
    // empty
    if (rects.length == 0)
      return new Rect();
    
    let r0 = new Rect(rects[0])
    r0.union(...rects.slice(1))

    return r0
  },
  //--------------------------------------
  overlap(...rects) {
    // empty
    if (rects.length == 0)
      return new Rect();
    
    let r0 = new Rect(rects[0])
    r0.overlap(...rects.slice(1))

    return r0
  },
  //--------------------------------------
  isRect(rect) {
    return rect 
      && rect.__ti_rect__
      && (rect instanceof Rect)
  }
  //--------------------------------------
}
//////////////////////////////////////////
export const Rects = TiRects