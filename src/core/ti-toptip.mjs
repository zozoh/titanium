class TiToptipBox {
  //------------------------------------------
  constructor({ $el, content, type } = {}) {
    this.$el = $el;
    this.content = content;
    this.type = type;
  }
  //------------------------------------------
  // Open toalog
  async open() {
    //........................................
    // Setup content
    let html = `<WebTextArticle
    :value="content"
    :type="type"
    theme="tipbox"
    />`
    //........................................
    // Prepare the app info
    let appInfo = {
      template: html,
      data: _.pick(this, "content", "type"),
      store: {
        modules: {
          "viewport": "@mod:ti/viewport"
        }
      },
      computed: {
      },
      methods: {
      },
      components: [
        "@com:web/text/article"
      ]
    }
    //........................................
    // create TiApp
    // console.log(appInfo)
    let app = await Ti.App(appInfo)
    this.app = app
    await app.init()
    //........................................
    // Mount to body
    app.mountTo(this.$el)
    //........................................
    return this
  }
  //------------------------------------------
}
//////////////////////////////////////////////
const TiToptip = {
  tipBox: null,
  $target: null,   // the ele which trigger the tip
  $wrapper: null,  // tip wrapper
  targetRect: null,
  tipRect: null,
  //------------------------------------------
  closeCheckerIsSet: false,
  checkDelay: 200,
  //------------------------------------------
  /** 
  @param $target{Element} target Element
  @param options{Object}  tip box options
  ```json5
  {
    type:"info|error|warn",
    content : "tip message",
    contentType: "text|html",
    size : "auto|small|normal|big|45x98",
    mode: "H"
  }
  ```
  dynamic content example:

  [H:info!html:4rem,3rem]@tip:${lang}/test/abc.html
  - `@tip` defined in _ti/config.json
  */
  async createTip($target, options = {}) {
    if (this.$target === $target) {
      return
    }
    this.$target = $target
    //console.log("createTip")
    let tip = this.getTipData($target)
    let {
      type = "paper",
      size = "auto",
      content,
      contentType = "text",
      mode = "H"
    } = _.assign(tip, options);
    //Quick attrigbute
    let m = /^\[(([HV]):)?(([^!]+)!)?(html|text|md)?(:([^\]]+))?\]\s*(.+)/.exec(content)
    if (m) {
      mode = m[2] || mode
      type = m[4] || type
      contentType = m[6] || contentType
      size = m[7] || _.trim(size)
      content = _.trim(m[8])
    }
    //
    // Get/Create wrapper
    //
    let { $wrapper, $foot, $stub, $arrow } = this.getTipWarpper(true)
    // Update tip style
    Ti.Dom.setAttrs($wrapper, {
      "tip-size": size,
      "tip-type": type,
      "tip-ready": "no"
    })
    //
    // Update Wrapper Measure
    //
    let css = this.getTipMeasureStyle(size)
    Ti.Dom.setStyle($wrapper, css)
    //
    // Format content
    //
    if (/^i18n:/.test(content)) {
      content = Ti.I18n.translate(content.substring(5).trim())
    }
    // Dynamic Loading
    if (/^@tip:/.test(content)) {
      let path = Ti.S.renderBy(content, {
        lang: _.snakeCase(Ti.Env("LANG") || "zh-cn")
      })
      let ftp = Ti.Util.getSuffixName(content)
      contentType = ({
        "txt": "text",
        "html": "html",
        "md": "text"
      })[ftp] || "text"
      content = await Ti.Load(path)
    }
    //
    // Open box
    //
    let tipBox = new TiToptipBox({
      $el: $stub,
      content,
      type: contentType
    })
    await tipBox.open()

    //
    // Dock tip to target
    // Give a little time for dom rendering
    //
    let dock = Ti.Dom.dockTo($wrapper, $target, {
      mode,
      space: ({
        "H": { x: 0, y: 12 },
        "V": { x: 12, y: 0 }
      })[mode] || 0,
      posListX: ({
        "H": ["center"],
        "V": ["right", "left"]
      })[mode],
      posListY: ({
        "H": ["bottom", "top"],
        "V": ["center"]
      })[mode]
    })
    Ti.Dom.setAttrs($wrapper, {
      "tip-at": dock.axis["H" == mode ? 'y' : 'x'],
    })

    //
    // Move Arrow to Target by footer margin
    //
    let arw = Ti.Rects.createBy($arrow)
    let style = ({
      H: ({ left }, { x }) => {
        return {
          "margin-left": `${Math.round(x - left - arw.width / 2)}px`
        }
      },
      V: ({ top }, { y }) => {
        return {
          "margin-top": `${Math.round(y - top - arw.height / 2)}px`
        }
      }
    })[mode](dock.srcRect, dock.targetRect)
    Ti.Dom.setStyle($foot, style)

    // Mark ready
    _.delay(() => {
      Ti.Dom.setAttrs($wrapper, { "tip-ready": "yes" })
    }, 10)

    // Mark Open 
    this.$target = $target
    this.tipBox = tipBox
    this.targetRect = this.genRectScope(dock.targetRect)
    this.tipRect = dock.srcRect

  },
  //------------------------------------------
  genRectScope(rect, space = 20) {
    rect.width += space
    rect.height += space
    return rect.updateBy("xywh")
  },
  //------------------------------------------
  getTipMeasureStyle(size) {
    let css = {}
    const setTipStyle = (key, val) => {
      if (/^[0-9]$/.test(val)) {
        css[key] = `${val}px`
      } else {
        css[key] = val
      }
    }
    let m = /^(([.0-9]*)(r?em|px)?)[Xx:,-](([.0-9]*)(r?em|px)?)$/.exec(size)
    if (m) {
      setTipStyle("width", m[1])
      setTipStyle("height", m[4])
    }
    return css
  },
  //------------------------------------------
  getTipData($target, options) {
    return Ti.Dom.getData($target, (key, value) => {
      //console.log(key, value)
      let m = /^(tiTip)(.*)?$/.exec(key)
      if (m) {
        let name = _.camelCase(m[2] || "content")
        return { name, value }
      }
    })
  },
  //------------------------------------------
  isInTargetRect(point) {
    return this.isInRect('targetRect', point)
  },
  //------------------------------------------
  isInTipRect(point) {
    return this.isInRect('tipRect', point)
  },
  //------------------------------------------
  // point: {x,y} window client coordinates
  isInRect(rectKey, point = {}) {
    let rect = this[rectKey]
    return rect && rect.hasPoint(point)
  },
  //------------------------------------------
  async OnHoverInTarget($el) {
    if (this.$target === $el) {
      return
    }
    //console.log("Hover")
    // Clone prev tip box
    await this.destroy(true)

    // Create new one
    this.createTip($el)
  },
  //------------------------------------------
  OnHoverInBody() {
    if (this.closeCheckerIsSet || !this.tipBox) {
      return
    }
    let point = this.point
    if (this.isInTipRect(point) || this.isInTargetRect(point)) {
      return
    }


    _.delay(() => {
      this.closeCheckerIsSet = false
      let point = this.point
      if (this.isInTipRect(point) || this.isInTargetRect(point)) {
        return
      }
      // console.log("delay OUTSIDE", point,
      //   "\nTip:", this.isInTipRect(point),
      //   `X:[${this.tipRect.left}, ${this.tipRect.right}]`,
      //   `Y:[${this.tipRect.top}, ${this.tipRect.bottom}]`,
      //   "\nTarget:", this.isInTargetRect(point),
      //   `X:[${this.targetRect.left}, ${this.targetRect.right}]`,
      //   `Y:[${this.targetRect.top}, ${this.targetRect.bottom}]`)

      this.destroy()
      this.tipBox = null

    }, this.checkDelay + 1)
    this.closeCheckerIsSet = true
  },
  //------------------------------------------
  destroy(nodelay = false) {
    if (!this.tipBox || !this.tipBox.app) {
      return
    }
    let { $wrapper, $main, $foot } = this.getTipWarpper(false)
    const do_destroy = () => {
      // Destroy app
      this.$target = null
      this.targetRect = null
      this.tipRect = null

      if (this.tipBox && this.tipBox.app) {
        this.tipBox.app.destroy()
        this.tipBox = null
      }

      // Clean DOM
      $main.innerHTML = "<div></div>"
      $wrapper.style = null
      $foot.style = null
    }

    if ($wrapper) {
      // Removem DOM mark
      Ti.Dom.setAttrs($wrapper, {
        "tip-ready": "no"
      })
      // destroy by move in
      if (nodelay) {
        do_destroy()
      }
      // destroy by move out
      else {
        return new Promise((resolve) => {
          _.delay(() => {
            do_destroy();
            resolve(true)
          }, 100)
        })
      }
    }
  },
  //------------------------------------------
  getTipWarpper(autoCreate = false) {
    let $wrapper = this.$wrapper
    if (!$wrapper) {
      if (!autoCreate) {
        return {}
      }
      $wrapper = Ti.Dom.find("#ti-tip-wrapper")
      if (!$wrapper) {
        $wrapper = Ti.Dom.createElement({ tagName: "div", attrs: { id: 'ti-tip-wrapper' } })
        Ti.Dom.appendToBody($wrapper)
        this.$wrapper = $wrapper
      }
    }
    let $tip = Ti.Dom.find(":scope > div.ti-tip-box", $wrapper)
    if (!$tip) {
      if (!autoCreate) {
        return { $wrapper }
      }
      $wrapper.innerHTML = `<div class="ti-tip-box">
        <main><div></div></main>
        <footer><span class="tip-arrow"></span></footer>
      </div>`
      $tip = Ti.Dom.find(":scope > div.ti-tip-box", $wrapper)
    }
    let $main = Ti.Dom.find(":scope > main", $tip)
    let $foot = Ti.Dom.find(":scope > footer", $tip)
    let $arrow = Ti.Dom.find(":scope > footer > .tip-arrow", $tip)
    let $stub = Ti.Dom.find(":scope > div", $main)
    return {
      $wrapper,
      $tip,
      $main,
      $foot,
      $arrow,
      $stub
    }
  },
  //------------------------------------------
  drawHelper(name, rect) {

    let id = `ti-tip-box-helper-${name}`
    let $el = Ti.Dom.find(`#${id}`)
    if (rect) {
      //console.log("helper", name, rect + "")
      if (!$el) {
        $el = Ti.Dom.createElement({
          attrs: { id },
          style: {
            position: "fixed",
            background: "rgba(255,255,0,0.3)",
            zIndex: 99999999999
          }
        })
        Ti.Dom.appendToBody($el)
      }
      let style = rect.toCss()
      Ti.Dom.updateStyle($el, style)
    }
    // Remove helper
    else if ($el) {
      Ti.Dom.remove($el)
    }
  },
  //------------------------------------------
  drawAllHelpers() {
    this.drawHelper("tip", this.tipRect)
    this.drawHelper("tag", this.targetRect)
  },
  //------------------------------------------
  watch() {
    document.addEventListener("mousemove", evt => {
      let point = {
        x: evt.clientX,
        y: evt.clientY
      }
      TiToptip.point = point
      let $el = Ti.Dom.closest(evt.target, "[data-ti-tip]", { includeSelf: true })
      if (!$el) {
        TiToptip.OnHoverInBody()
      }
      // Find tip element
      else {
        // Get tip Element and tip data
        let decKey = _.lowerCase($el.getAttribute("data-ti-keyboard"))
        if (/^(ctrl|alt|shift|meta)$/.test(decKey)) {
          if (!evt[`${decKey}Key`]) {
            return
          }
        }
        // Then show the tip
        TiToptip.OnHoverInTarget($el)
      }
      //this.drawAllHelpers()
    })
  }
  //------------------------------------------
}
//////////////////////////////////////////////
export const Toptip = TiToptip;