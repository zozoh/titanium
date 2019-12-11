const DF_STOREAGE_KEY_OF_EXPOSE_HIDDEN = "wn-list-adaptview-expose-hidden"
//----------------------------------------------
export default {
  //////////////////////////////////////////////
  watch : {
    "mainComType" : function(newType){
      Ti.Shortcut.removeWatch(this)
      Ti.Shortcut.addWatch(this, this.mainActions)
    }
  },
  //////////////////////////////////////////////
  computed : {
    //-----------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //-----------------------------------------
    ...Vuex.mapState([
      "loading", "mainCom", "actions", "sidebar"]),
    //-----------------------------------------
    ...Vuex.mapGetters([
      "mainActions",
      "mainComIcon", "mainComType", "mainComConf",
      "mainStatus", "mainStatusText", "mainLog"]),
    //-----------------------------------------
    theMetaId(){
      if(this.$store.state.main && this.$store.state.main.meta) {
        return this.$store.state.main.meta.id
      }
    },
    //-----------------------------------------
    hasMainActions() {
      return _.isArray(this.mainActions) 
         && !_.isEmpty(this.mainActions)
    },
    //-----------------------------------------
    logoIcon() {
      if(this.obj.meta && this.obj.meta.icon)
        return this.obj.meta.icon 
      return "/gu/rs/ti/icons/svg/im/puzzle-11.svg"
    }
    //-----------------------------------------
  },
  //////////////////////////////////////////////
  methods : {
    //-----------------------------------------
    getObjTitle(meta) {
      if(meta) {
        let title = meta.title || meta.nm
        return Ti.I18n.text(title)
      }
    },
    //-----------------------------------------
    getObjLink(meta) {
      //console.log("getObjLink")
      return Wn.Util.getAppLink(meta).toString()
    },
    //-----------------------------------------
    async onMainViewOpen(objMeta) {
      // Ti.Fuse.fire().then(()=>{

      // })
      // Try to protect data by Ti.Fuse
      let bombed = await Ti.Fuse.fire()
      if(!bombed)
        return

      // Then reload the object meta
      let meta = await Ti.App(this).dispatch("reloadMain", objMeta)

      // Push history to update the browser address bar
      let his = window.history
      if(his) {
        let newLink = this.getObjLink(meta)
        let title =  Wn.Util.getObjDisplayName(meta)
        if(Ti.IsInfo("app/wn-manager")) {
          console.log(title , "->", newLink)
        }
        his.pushState(meta, title, newLink)
      }
    },
    //-----------------------------------------
    onMainDataChange(data) {
      console.warn("onMainDataChange", data)
      this.$store.commit("main/set", data)
    },
    //-----------------------------------------
    onActionUpdated(actions) {
      //console.log("update the actions", actions)
      if(!_.isEmpty(actions)) {
        Ti.App(this).commit("setActions", actions)
      }
    }
  },
  //////////////////////////////////////////////
  mounted : function(){
    let vm = this
    // Watch the browser "Forward/Backward"
    window.onpopstate = function({state}){
      vm.$store.dispatch("reloadMain", state)
    }
    // Protected loading
    Ti.Fuse.getOrCreate().add({
      key : "wn-manager-view-opening",
      everythingOk : ()=>{
        return !vm.isLoading
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wnm-view-opening", "warn")
      }
    })
  },
  //////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-manager-view-opening")
  },
  //////////////////////////////////////////////
}