export default {
  ///////////////////////////////////
  data: ()=>({
    myMouseIn : false,   
    naturalWidth  : -1,
    naturalHeight : -1,
    clientWidth  : -1,
    clientHeight : -1,
    imgLoading : true,
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
    "tags": {
      type: [String, Array, Object]
    },
    "text": {
      type: String
    },
    "brief": {
      type: String
    },
    //-------------------------------------
    // Behavior
    //-------------------------------------
    "hasLink" : {
      type: [String, Boolean, Object],
      default: undefined
    },
    "link": {
      type: String
    },
    "href": {
      type: String
    },
    "navTo": {
      type: Object
    },
    "newtab": {
      type: [String, Boolean]
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
    "effects": {
      type: Object,
      default: ()=>({})
    },
    "leftPartStyle": {
      type: Object
    },
    "rightPartStyle": {
      type: Object
    },
    "tagsStyle": {
      type: Object
    },
    "textStyle": {
      type: Object
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
        "no-href"  : this.TheHref ? false : true
      }, this.effects)
    },
    //--------------------------------------
    LeftPartStyle() {
      return Ti.Css.toStyle(this.leftPartStyle)
    },
    //--------------------------------------
    RightPartStyle() {
      return Ti.Css.toStyle(this.rightPartStyle)
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
    isHasLink() {
      if(this.link) {
        return true
      }
      // Auto
      if(_.isUndefined(this.hasLink)) {
        return this.href || _.get(this.navTo, "value") ? true : false
      }
      return this.hasLink ? true : false
    },
    //--------------------------------------
    TheHref() {
      if(this.link) {
        return this.link
      }
      if(this.isHasLink) {
        let href = this.href
        if(_.isPlainObject(this.src)) {
          href = Ti.Util.explainObj(this.src, this.href)
        }
        return href
      }
    },
    //--------------------------------------
    LinkTarget() {
      return this.isNewTab ? '_blank' : '_self'
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
    OnClickLink(evt) {
      if(!this.isHasLink) {
        return
      }
      if(this.navTo && !this.newtab && !this.link) {
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
    OnMouseEnter() {
      //console.log("> image")
      this.myMouseIn = true
      this.myEnterAt = Date.now()

      _.delay(()=>{
        this.delayCheckEnter()
      }, 10)

      if(this.EnterNotifyName && this.enterCooling >= 0) {
        _.delay(()=>{
          this.delayNotifyEnter()
        }, this.enterCooling)  
      } else {
        this.myEnterNotifed = true
      }
    },
    //--------------------------------------
    OnMouseLeave() {
      //console.log("< image")
      this.myMouseIn = false
      _.delay(()=>{
        this.delayCheckLeave()
      }, 10)
    },
    //--------------------------------------
    delayNotifyEnter() {
      // Guard
      if(!this.myMouseIn || this.myEnterNotifed || this.myEnterAt<0) {
        this.myEnterNotifed = true
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
    delayCheckEnter() {
      if(!this.myMouseIn) {
        return
      }
      //console.log("enter image")
      //
      // Full text
      //
      if(this.effects.textHoverFull) {
        let $text = this.$refs.text
        // Remember the old rect for restore size when mouse leave
        if($text && !$text.__primary_rect) {
          let rect = Ti.Rects.createBy(this.$refs.text)
          $text.__primary_rect = rect
          $text.__reset_primary = false
          // Set start size for transition
          Ti.Dom.updateStyle($text, {
            width: rect.width, height: rect.height
          })
        }
        // set full text
        let view = Ti.Rects.createBy(this.$el)
        _.delay(()=>{
          Ti.Dom.updateStyle($text, {
            width: view.width, height: view.height
          })
        }, 10)
      }
      //
      // Switch Hover src
      //
      let $img = this.$refs.img
      if($img && this.TheHoverSrc) {
        $img.src = this.TheHoverSrc
      }
    },
    //--------------------------------------
    delayCheckLeave() {
      if(this.myMouseIn) {
        return
      }
      this.showZoomPick = false
      this.showZoomDock = false
      //console.log("leave image")
      //
      // Full text
      //
      if(this.effects.textHoverFull) {
        let $text = this.$refs.text
        // trans event handler
        const OnTextTransitionend = ()=>{
          //console.log("$text transitionend")
          Ti.Dom.updateStyle($text, {
            width: "", height: ""
          })
          $text.__primary_rect = undefined
          $text.__reset_primary = true
        }
        // Remember the old rect for restore size when mouse leave
        if($text && $text.__primary_rect) {
          let rect = $text.__primary_rect
          // Set callback when transitionend
          $text.addEventListener("transitionend", OnTextTransitionend, {once: true})
          // Restore the old size
          _.delay(()=>{
            //console.log("restore to ", rect.toString())
            Ti.Dom.updateStyle($text, {
              width: rect.width, height: rect.height
            })
          }, 10)
          // Make sure restore to old size
          _.delay(()=>{
            if(!$text.__reset_primary && !this.myMouseIn) {
              //console.log("clean!!!")
              Ti.Dom.updateStyle($text, {
                width: "", height: ""
              })
              $text.removeEventListener("transitionend", OnTextTransitionend);
              $text.__primary_rect = undefined
              $text.__reset_primary = true
            }
          }, 1000)
        }
      }
      //
      // Switch Hover src
      //
      let $img = this.$refs.img
      if($img && this.TheHoverSrc) {
        $img.src = this.TheSrc
      }
      //
      // Notify Evento
      //
      if(this.myEnterNotifed && this.LeaveNotifyName) {
        let payload = _.assign({
          $el : this.$el,
          $img : this.$refs.img
        }, this.notifyPayload)
        this.$notify(this.LeaveNotifyName, payload)
      }
      this.myEnterNotifed = false
      this.myEnterAt = -1
    },
    //--------------------------------------
    OnTextTransitionend() {
      if(!this.myMouseIn) {
        Ti.Dom.updateStyle(this.$refs.text, {
          width: "", height: ""
        })
        this.$refs.text.__primary_rect = undefined
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}