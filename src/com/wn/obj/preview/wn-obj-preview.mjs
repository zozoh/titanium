export default {
  inheritAttrs : false,
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
      type : Object,
      default : ()=>({})
    },
    "actionBar" : {
      type : Array,
      default : ()=>["@fullscreen", "@download", "@info"]
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
        "is-fullscreen" : this.status.fullscreen
      }
    },
    //--------------------------------------
    previewComType() {
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
    theAction() {
      if(this.actions) {
        return _.merge({
          "enterFullscreen" : {
            icon : "zmdi-fullscreen",
            text : "i18n:wop-fullscreen-enter",
            action : "commit:main/enterFullscreen"
          },
          "exitFullscreen" : {
            icon : "zmdi-fullscreen-exit",
            text : "i18n:wop-fullscreen-quit",
            action : "commit:main/exitFullscreen"
          },
          "download" : {
            icon : "zmdi-download",
            text : "i18n:download-to-local",
            action : "dispatch:main/download"
          },
          "info" : {
            icon : "fas-info-circle",
            text : "i18n:info",
            action : "main:showObjInfo"
          }
    
        }, this.actions)
      }
    },
    //--------------------------------------
    theActionBar() {
      let list = []
      if(this.hasMeta) {
        _.forEach(this.actionBar, (it)=>{
          //..........................
          // full screen
          if("@fullscreen" == it) {
            if(!this.status.fullscreen) {
              list.push(this.theAction["enterFullscreen"])
            }
            // Exit FullScreen
            else {
              list.push(this.theAction["exitFullscreen"])
            }
            return
          }
          //..........................
          // quick Name
          let m = /^@(.+)$/.exec(it)
          if(m) {
            let quickName = m[1]
            let aIt = this.theAction[quickName]
            if(aIt) {
              list.push(aIt)
            }
            return
          }
          //..........................
          if(_.isPlainObject(it) && it.action) {
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
    onAction(actionName) {
      Ti.App(this).exec(actionName)
    },
    //--------------------------------------
    showObjInfo() {
      console.log("showObjInfo", this.meta)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "status.fullscreen" : function(isInFullScreen) {
      if(isInFullScreen && this.theAction) {
        Ti.Shortcut.addWatch(this, {
          shortcut : "ESCAPE",
          action   : _.get(this.theAction, "exitFullscreen.action")
        })
      }
      // Quit watch
      else {
        Ti.Shortcut.removeWatch(this)
      }
    }
  }
  //////////////////////////////////////////
}