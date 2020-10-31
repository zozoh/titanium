export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    myHomeDir : undefined
  }),
  ////////////////////////////////////////////////////
  props : {
    // relative path to "meta"
    "dirHome" : {
      type : String,
      default : undefined
    },
    "mainConf" : {
      type : Object,
      default : ()=>({})
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    FilesetListConf() {
      return {
        meta : "=meta",
        ... this.mainConf
      }
    }    
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async reload() {
      if(this.meta && this.meta.id) {
        console.log("reload", this.meta.ph, this.viewReady)
        if(this.dirHome) {
          let ph = `id:${this.meta.id}/${this.dirHome}`
          this.myHomeDir = await Wn.Io.loadMeta(ph)
        }
        // Meta is dirHome
        else {
          this.myHomeDir = this.meta
        }
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}