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
    pickRect : {},
    myEnterAt : -1,    // AMS mouse enter for cooling
    myEnterNotifed : false
  }),
  /////////////////////////////////////////
  props : {
    //-------------------------------------
    // Data
    //-------------------------------------
    "src" : {
      type : [String, Object]
    },
    "preview": {
      type: Object
    },
    "hoverPreview": {
      type: Object
    },
    //-------------------------------------
    // Behavior
    //-------------------------------------
    "href": {
      type: String
    },
    "navTo": {
      type: Object
    },
    "newtab": {
      type: [String, Boolean]
    },
    /*
    Show zoom lens and dock aside to the image
    - pickWidth : (0-1) percent | >1 for pixcle
    - scale : 2 zoome leave base on pick zoomLens
    - dockMode  : "V|H"
    - dockSpace : 10,
    - dockPosListX : ["left", "center", "right"],
    - dockPosListY : ["top", "center", "bottom"]
    - followPicker : false,  // dock to picker each time mouse move
    - pickStyle : {...}  // ex style for picker
    - dockStyle : {...}  // ex style for docker
    */
    "zoomLens" : {
      type : Object,
      default : undefined
    },
    "enterNotify" : {
      type : [String, Boolean]
      /*default: "media:enter"*/
    },
    "notifyPayload" : {
      type : [Object, String, Number]
    },
    "enterCooling" : {
      type : Number,
      default : 500
    },
    "leaveNotify" : {
      type : [String, Boolean]
      /*default: "media:leave"*/
    },
    //-------------------------------------
    // Aspect
    //-------------------------------------
    "imageStyle": {
      type: Object
    },
    "tags": {
      type: [String, Array, Object]
    },
    "tagsStyle": {
      type: Object
    },
    "text": {
      type: String
    },
    "textStyle": {
      type: Object
    },
    "brief": {
      type: String
    },
    "briefStyle": {
      type: Object
    },
    "i18n": {
      type: Boolean,
      default: true
    },
    //-------------------------------------
    // Measure
    //-------------------------------------
    // ...
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "has-href" : this.TheHref ? true : false,
        "no-href"  : this.TheHref ? false : true,
        "show-zoomlen" : this.showZoomPick,
        "no-zoomlen"   : this.TheZoomLens ? false : true,
        "has-zoomlen"  : this.TheZoomLens ? true  : false,
      })
    },
    //--------------------------------------
    TagsStyle() {
      return Ti.Css.toStyle(this.tagsStyle)
    },
    //--------------------------------------
    ImageStyle() {
      return Ti.Css.toStyle(this.imageStyle)
    },
    //--------------------------------------
    TextStyle() {
      return Ti.Css.toStyle(this.textStyle)
    },
    //--------------------------------------
    BriefStyle() {
      return Ti.Css.toStyle(this.briefStyle)
    },
    //--------------------------------------
    TheZoomLens() {
      if(!this.zoomLens || this.clientWidth<=0 || this.clientHeight<=0)
        return
      
      let pickW = _.get(this.zoomLens, "pickWidth", .618)
      let pickH = _.get(this.zoomLens, "pickHeight", -1)
      let followPicker = _.get(this.zoomLens, "followPicker", false)
      let dockStyle = _.get(this.zoomLens, "dockStyle", {})
      let pickStyle = _.get(this.zoomLens, "pickStyle", {})

      let zl = {
        followPicker, dockStyle, pickStyle
      }
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
          height : this.TheZoomLens.pickHeight,
          ... this.TheZoomLens.pickStyle
        })
      }
    },
    //--------------------------------------
    ZoomLenDockStyle() {
      if(this.zoomLens){
        if(_.isEmpty(this.pickRect)) {
          return {
            visibility : this.showZoomDock ? "visible" : "hidden",
            backgroundImage: `url("${this.TheSrc}")`
          }
        } else {
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
            backgroundPosition: `${pLeft*scale*-1}px ${pTop*scale*-1}px`,
            ... this.TheZoomLens.dockStyle
          })
        }
      }
    },
    //--------------------------------------
    EnterNotifyName() {
      return Ti.Util.trueGet(this.enterNotify, "media:enter")
    },
    //--------------------------------------
    LeaveNotifyName() {
      return Ti.Util.trueGet(this.leaveNotify, "media:leave")
    },
    //--------------------------------------
    TheSrc() {
      return Ti.WWW.evalObjPreviewSrc(this.src, this.preview)
    },
    //--------------------------------------
    TheHoverSrc() {
      return Ti.WWW.evalObjPreviewSrc(this.src, this.hoverPreview)
    },
    //--------------------------------------
    TheTags() {
      if(this.tags) {
        let tags = _.concat(this.tags)
        let list = []
        for(let tag of tags) {
          if(_.isString(tag)) {
            list.push({
              className : undefined,
              text : tag
            })
          } else {
            let {text,color,className} = tag
            if(!text) {
              continue
            }
            let style;
            if(color) {
              style = {"background-color" : color}
            }
            list.push({text, style, className})
          }
        }
        return list
      }
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
    TheBrief() {
      if(this.brief) {
        let str = this.brief
        if(_.isPlainObject(this.src)) {
          str = Ti.Util.explainObj(this.src, this.brief)
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
    },
    //--------------------------------------
    isWaitEnterCooling() {
      return this.myEnterAt > 0 && !this.myEnterNotifed
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
      if(this.navTo && !this.newtab) {
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

      if(this.TheZoomLens && this.TheZoomLens.followPicker) {
        Ti.Dom.dockTo(this.$refs.dock, this.$refs.pick, {
          mode  : this.TheZoomLens.dockMode,
          space : this.TheZoomLens.dockSpace,
          posListX : this.TheZoomLens.dockPosListX,
          posListY : this.TheZoomLens.dockPosListY
        })
      }

      this.pickRect = rect
      this.showZoomPick = true
    },
    //--------------------------------------
    OnMouseLeave() {
      this.showZoomPick = false
      this.showZoomDock = false
    },
    //--------------------------------------
    OnImageMouseEnter() {
      if(this.EnterNotifyName && this.enterCooling >= 0) {
        let $img = this.$refs.img
        this.myEnterAt = Date.now()
        if(this.TheHoverSrc) {
          $img.src = this.TheHoverSrc
        }
        // Check layter, it can prevent the event fire too many!
        _.delay(()=>{
          this.doCheckEnterEvent()
        }, this.enterCooling)
      }
    },
    //--------------------------------------
    doCheckEnterEvent() {
      // Guard
      if(this.myEnterNotifed || this.myEnterAt<0) {
        return
      }
      let du = Date.now()  - this.myEnterAt
      if(du >= this.enterCooling) {
        //console.log("du cooling", du, this.enterCooling)
        this.myEnterNotifed = true
        let payload = _.assign({
          $el : this.$el,
          $img : this.$refs.img
        }, this.notifyPayload)
        this.$notify(this.EnterNotifyName, payload)
      }
    },
    //--------------------------------------
    OnImageMouseLeave() {
      let $img = this.$refs.img
      if(this.TheHoverSrc) {
        $img.src = this.TheSrc
      }
      if(this.myEnterNotifed && this.LeaveNotifyName) {
        let payload = _.assign({
          $el : this.$el,
          $img : this.$refs.img
        }, this.notifyPayload)
        this.$notify(this.LeaveNotifyName, payload)
      }
      this.myEnterNotifed = false
      this.myEnterAt = -1
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "showZoomPick" : function(newVal) {
      if(newVal && this.zoomLens) {
        this.$nextTick(()=>{
          if(this.TheZoomLens && this.TheZoomLens.followPicker) {
            Ti.Dom.dockTo(this.$refs.dock, this.$refs.img, {
              mode  : this.TheZoomLens.dockMode,
              space : this.TheZoomLens.dockSpace,
              posListX : this.TheZoomLens.dockPosListX,
              posListY : this.TheZoomLens.dockPosListY
            })
            _.delay(()=>{
              this.showZoomDock = true
            }, 100)
          } else {
            this.showZoomDock = true
          }
        })
      }
    }
  }
  //////////////////////////////////////////
}