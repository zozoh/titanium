export default {
  props : {
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "dataIsChanged" : {
      type : Boolean,
      default : false
    }
  },
  computed : {
    topClass() {
      return {
        "as-fullscreen" : this.status.fullscreen
      }
    },
    previewComType() {
      if(this.data.meta) {
        let mime = this.data.meta.mime
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
    dataSource() {
      if(!this.data.meta)
        return ""
      let link = Wn.Util.getDownloadLink(this.data.meta, {mode:"raw"})
      return link.toString();
    }
  },
  methods : {
    exitFullscreen(){
      let $app = Ti.App(this)
      $app.commit("main/exitFullscreen")
    }
  }
}