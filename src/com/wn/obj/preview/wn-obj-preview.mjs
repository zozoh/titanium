export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    isInFullScreen : false,
    isShowInfo     : false,
    isFloatInfo    : false
  }),
  //////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "actions" : {
      type : Array,
      default : ()=>["fullscreen", "newtab", "download", "info"]
    },
    "showInfo" : {
      type : Boolean,
      default : false
    },
    "floatInfo" : {
      type : Boolean,
      default : false
    },
    "editInfoBy" : {
      type : [Function, String],
      default : null
    },
    "infoPosition" : {
      type : String,
      default : "bottom",
      validator: (val)=>/^(bottom|left)$/.test(val)
    },
    "infoNameWidth" : {
      type : [String, Number],
      default : 50
    },
    "infoValueWidth" : {
      type : [String, Number],
      default : 200
    },
    "infoFields" : {
      type : Array,
      default : ()=>["id", "race", "nm", "tp", "mime"]
    },
    // Store the status in Local
    "stateLocalKey" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    hasMeta() {
      return _.isEmpty(this.meta) ? false : true
    },
    //--------------------------------------
    topClass() {
      return {
        "is-fullscreen" : this.isInFullScreen,
        "is-show-info"  : this.isShowInfo,
        "is-float-info" : this.isFloatInfo,
        [`is-info-at-${this.infoPosition}`] : true        
      }
    },
    //--------------------------------------
    thePreviewComType() {
      if(this.meta) {
        let mime = this.meta.mime
        // Video
        if(mime.startsWith("video/")){
          return "ti-media-video"
        }
        // Image
        else if(mime.startsWith("image/")){
          return "ti-media-image"
        }
        // Binary
        else {
          return "ti-media-binary"
        }
      }
    },
    //--------------------------------------
    thePreviewInfoPinIcon() {
      return this.isFloatInfo 
        ? 'fas-thumbtack'
        : 'zmdi-layers'
    },
    //--------------------------------------
    thePrevewInfoFields() {
      return Wn.Obj.evalFields(this.infoFields, (fld)=>{
        return _.defaults(fld, {
          nameWidth  : this.infoNameWidth,
          valueWidth : this.infoValueWidth
        })
      })
    },
    //--------------------------------------
    theActions() {
      let list = []
      if(this.hasMeta) {
        _.forEach(this.actions, (it)=>{
          //..........................
          // full screen
          if("fullscreen" == it) {
            if(!this.isInFullScreen) {
              list.push({
                icon : "zmdi-fullscreen",
                text : "i18n:wop-fullscreen-enter",
                action : ()=>this.enterFullscreen()
              })
            }
            // Exit FullScreen
            else {
              list.push({
                icon : "zmdi-fullscreen-exit",
                text : "i18n:wop-fullscreen-quit",
                action : ()=>this.exitFullscreen()
              })
            }
          }
          //..........................
          // Open
          else if("newtab" == it) {
            list.push({
              icon : "zmdi-open-in-new",
              text : "i18n:open-newtab",
              action : ()=>this.openInNewTab()
            })
          }
          //..........................
          // Download
          else if("download" == it) {
            list.push({
              icon : "zmdi-download",
              text : "i18n:download-to-local",
              action : ()=>this.download()
            })
          }
          //..........................
          // Toggle Info
          else if("info" == it) {
            if(!this.isShowInfo) {
              list.push({
                icon : "zmdi-info",
                text : "i18n:info",
                action : ()=>this.doShowInfo()
              })
            }
            // Show Info
            else {
              list.push({
                icon : "zmdi-info-outline",
                text : "i18n:info",
                action : ()=>this.doHideInfo()
              })
            }
          }
          //..........................
          else if(_.isPlainObject(it) && it.action) {
            list.push(it)
          }
          //..........................
        })
      }
      //................................
      return list
    },
    //--------------------------------------
    dataSource() {
      if(!this.meta)
        return ""
      let link = Wn.Util.getDownloadLink(this.meta, {mode:"auto"})
      return link.toString();
    },
    //--------------------------------------
    dataIcon() {
      return Wn.Util.getIconObj(this.meta)
    },
    //--------------------------------------
    dataTitle() {
      return Wn.Util.getObjDisplayName(this.meta)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onAction(action) {
      // Exec command
      if(_.isString(action)) {
        Ti.App(this).exec(actionName)
      }
      // Call function
      else if(_.isFunction(action)) {
        action()
      }
    },
    //--------------------------------------
    enterFullscreen() {
      this.isInFullScreen = true
      this.resizeMediaViewport()
    },
    //--------------------------------------
    exitFullscreen() {
      this.isInFullScreen = false
      this.resizeMediaViewport()
    },
    //--------------------------------------
    doShowInfo() {
      this.isShowInfo = true
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    doHideInfo() {
      this.isShowInfo = false
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    toggleInfoFloat() {
      this.isFloatInfo = !this.isFloatInfo
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    resizeMediaViewport() {
      for(let $child of this.$children) {
        if(_.isFunction($child.onResizeViewport)) {
          this.$nextTick(()=>{
            $child.onResizeViewport()
          })
        }
      }
    },
    //--------------------------------------
    openInNewTab() {
      let link = Wn.Util.getAppLink(this.meta)
      Ti.Be.OpenLink(link)
    },
    //--------------------------------------
    download() {
      let link = Wn.Util.getDownloadLink(this.meta)
      Ti.Be.OpenLink(link)
    },
    //--------------------------------------
    doEditInfo() {
      if(this.meta) {
        // Command
        if(_.isString(this.editInfoBy)) {
          Ti.App(this).exec(this.editInfoBy, this.meta)
        }
        // Function Invoking
        else if(_.isFunction(this.editInfoBy)) {
          this.editInfoBy(this.meta)
        }
        // Default to open the dialog
        else {
          Wn.EditObjMeta(this.meta)
        }
      }
    },
    //--------------------------------------
    saveStateToLocal() {
      if(this.stateLocalKey) {
        Ti.Storage.session.mergeObject(this.stateLocalKey, {
          isShowInfo     : this.isShowInfo,
          isFloatInfo    : this.isFloatInfo
        })
        // let state = Ti.Storage.session.getObject(this.stateLocalKey)
        // console.log("-> saveStateToLocal", state)
      }
    },
    //--------------------------------------
    loadStateFromLocal() {
      if(this.stateLocalKey) {
        let state = Ti.Storage.session.getObject(this.stateLocalKey)
        //console.log("<- loadStateFromLocal", state)
        _.defaults(state, {
          isShowInfo     : this.isShowInfo,
          isFloatInfo    : this.isFloatInfo
        })
        this.isShowInfo  = state.isShowInfo
        this.isFloatInfo = state.isFloatInfo
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "showInfo" : function(val) {
      console.log("showInfo watched")
      this.isShowInfo = val
    },
    "floatInfo" : function(val) {
      console.log("floatInfo watched")
      this.isFloatInfo = val
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.isShowInfo  = this.showInfo
    this.isFloatInfo = this.floatInfo
    this.$nextTick(()=>{
      this.loadStateFromLocal()
    })
  }
  //////////////////////////////////////////
}