export default {
  ///////////////////////////////////
  data: ()=>({
    showZoomPick  : false,
    showZoomDock  : false,
    naturalWidth  : -1,
    naturalHeight : -1,
    clientWidth  : -1,
    clientHeight : -1,
    imgLoading : true,
    pickRect : {}
  }),
  /////////////////////////////////////////
  props : {
    "src" : {
      type : [String, Object],
      default : undefined
    },
    "preview": {
      type: Object,
      default: undefined
    },
    "text": {
      type: String,
      default: undefined
    },
    "href": {
      type: String,
      default: undefined
    },
    "navTo": {
      type: Object,
      default: undefined
    },
    "newtab": {
      type: [String, Boolean],
      default: undefined
    },
    "i18n": {
      type: Boolean,
      default: true
    },
    "width": {
      type: [String, Number],
      default: undefined
    },
    "height": {
      type: [String, Number],
      default: undefined
    },
    /*
    Show zoom lens and dock aside to the image
    - pickWidth : (0-1) percent | >1 for pixcle
    - scale : 2 zoome leave base on pick zoomLens
    - dockMode  : "V"
    - dockSpace : 10
    */
    "zoomLens" : {
      type : Object,
      default : undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "has-href" : this.TheHref ? true : false,
        "no-href"  : this.TheHref ? false : true
      })
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    TheZoomLens() {
      if(!this.zoomLens || this.clientWidth<=0 || this.clientHeight<=0)
        return
      
      let pickW = _.get(this.zoomLens, "pickWidth", .618)
      let pickH = _.get(this.zoomLens, "pickHeight", -1)

      let zl = {}
      zl.pickWidth = pickW < 1 
            ? this.clientWidth * pickW
            : pickW;
      zl.pickHeight = pickH <= 0
            ? zl.pickWidth
            : (pickH < 1 ? this.clientHeight*pickH : pickH)
      
      let scale = _.get(this.zoomLens, "scale", 2)
      zl.dockWidth  = zl.pickWidth  * scale
      zl.dockHeight = zl.pickHeight * scale

      _.defaults(zl, {
        dockMode  : "V",
        dockSpace : {x: 10, y:0},
        dockPosListY: ["top", "bottom"]
      })

      return zl
    },
    //--------------------------------------
    ZoomLenPickStyle() {
      if(this.zoomLens && !_.isEmpty(this.pickRect)){
        return Ti.Css.toStyle({
          visibility : this.showZoomPick ? "visible" : "hidden",
          top    : this.pickRect.top,
          left   : this.pickRect.left,
          width  : this.TheZoomLens.pickWidth,
          height : this.TheZoomLens.pickHeight
        })
      }
    },
    //--------------------------------------
    ZoomLenDockStyle() {
      if(this.zoomLens && !_.isEmpty(this.pickRect)) {
        let scale = _.get(this.zoomLens, "scale", 2)
        let cW = this.clientWidth
        let cH = this.clientHeight
        let pLeft = this.pickRect.left
        let pTop  = this.pickRect.top
        return Ti.Css.toStyle({
          visibility : this.showZoomDock ? "visible" : "hidden",
          width  : this.TheZoomLens.dockWidth,
          height : this.TheZoomLens.dockHeight,
          backgroundImage: `url("${this.TheSrc}")`,
          backgroundSize : `${cW*scale}px ${cH*scale}px`,
          backgroundPosition: `${pLeft*scale*-1}px ${pTop*scale*-1}px`
        })
      }
    },
    //--------------------------------------
    TheSrc() {
      return Ti.WWW.evalObjPreviewSrc(this.src, this.preview)
    },
    //--------------------------------------
    TheText() {
      if(this.text) {
        let str = this.text
        if(_.isPlainObject(this.src)) {
          str = Ti.Util.explainObj(this.src, this.text)
        }
        if(this.i18n) {
          str = Ti.I18n.text(str)
        }
        return str
      }
    },
    //--------------------------------------
    TheHref() {
      if(this.href) {
        let href = this.href
        if(_.isPlainObject(this.src)) {
          href = Ti.Util.explainObj(this.src, this.href)
        }
        return href
      }
    },
    //--------------------------------------
    isNewTab() {
      let newtab = this.newtab
      if(_.isString(newtab)) {
        if(_.isPlainObject(this.src)) {
          newtab = Ti.Util.explainObj(this.src, this.newtab)
        }
      }
      return newtab ? true : false
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnImageLoaded() {
      let $img = this.$refs.img
      if($img) {
        this.naturalWidth  = $img.naturalWidth
        this.naturalHeight = $img.naturalHeight
        this.clientWidth  = $img.clientWidth
        this.clientHeight = $img.clientHeight
        this.imgLoading = false
      }
    },
    //--------------------------------------
    OnClickTop(evt) {
      if(this.navTo) {
        evt.preventDefault()
        this.$notify("nav:to", this.navTo)
      }
    },
    //--------------------------------------
    OnMouseMove($event) {
      if(!_.isElement(this.$refs.img) || !_.isElement(this.$refs.pick)) {
        return
      }
      let imRect = Ti.Rects.createBy(this.$refs.img)
      let pkRect = Ti.Rects.createBy(this.$refs.pick)
      let {clientX, clientY} = $event

      let rect = Ti.Rects.create({
        x: clientX, y: clientY,
        width  : pkRect.width, 
        height : pkRect.height
      })
      imRect.wrap(rect)
      rect.relative(imRect)

      this.pickRect = rect
      this.showZoomPick = true
    },
    //--------------------------------------
    OnMouseLeave() {
      this.showZoomPick = false
      this.showZoomDock = false
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "showZoomPick" : function(newVal) {
      if(newVal && this.zoomLens) {
        this.$nextTick(()=>{
          Ti.Dom.dockTo(this.$refs.dock, this.$refs.img, {
            mode  : this.TheZoomLens.dockMode,
            space : this.TheZoomLens.dockSpace,
            posListX : this.TheZoomLens.dockPosListX,
            posListY : this.TheZoomLens.dockPosListY
          })
          _.delay(()=>{
            this.showZoomDock = true
          }, 100)
        })
      }
    }
  }
  //////////////////////////////////////////
}