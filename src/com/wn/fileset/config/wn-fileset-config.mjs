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
    OnTabsInit($tabs) {
      this.$tabs = $tabs
    },
    //------------------------------------------------
    doCreate(payload) {
      let $mcom = this.$tabs.$MainCom()
      if($mcom) {
        $mcom.doCreate(payload)
      }
    },
    //------------------------------------------------
    doDelete(payload) {
      let $mcom = this.$tabs.$MainCom()
      if($mcom) {
        $mcom.doDelete(payload)
      }
    },
    //------------------------------------------------
    async openCurrentMeta() {
      let $mcom = this.$tabs.$MainCom()
      if($mcom && $mcom.hasCurrent) {
        return await $mcom.openCurrentMeta()
      }
      await Ti.App(this).dispatch("current/openMetaEditor")
    },
    //------------------------------------------------
    async reloadAll() {
      Ti.App(this).commit("current/setStatus", {reloading:true})
      // Reload self
      await this.reload()

      // Reload tabs
      await this.$tabs.reload()

      // Reload main
      let $mcom = this.$tabs.$MainCom()
      if($mcom) {
        await $mcom.reload()
      }
      Ti.App(this).commit("current/setStatus", {reloading:false})
    },
    //------------------------------------------------
    async reload() {
      if(this.meta && this.meta.id) {
        //console.log("reload", this.meta.ph, this.viewReady)
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