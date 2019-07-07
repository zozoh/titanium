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
        "as-fullscreen" : this.status.fullscreen
      }
    },
    //--------------------------------------
    previewComType() {
      if(this.meta) {
        let mime = this.meta.mime
        // Video
        if(mime.startsWith("video/")){
          return "ti-obj-video"
        }
        // Image
        else if(mime.startsWith("image/")){
          return "ti-obj-image"
        }
        // Binary
        else {
          return "ti-obj-binary"
        }
      }
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
    exitFullscreen(){
      let $app = Ti.App(this)
      $app.commit("main/exitFullscreen")
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}