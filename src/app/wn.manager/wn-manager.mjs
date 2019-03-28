export default {
  data : ()=>({
    "loadingCom" : "ti-loading",
    "mainView"   : null,
    "status"     : null,
    "sidebar"    : []
  }),
  //////////////////////////////////////////////
  watch : {
    "obj.meta" : function(newMeta, oldMeta) {
      let vm = this;
      if(Ti.IsTrace()) {
        console.log("watched-----------------", newMeta, oldMeta)
      }
      if(!newMeta || !oldMeta || newMeta.id != oldMeta.id) {
        vm.reloadMain(newMeta)
      }
    }
  },
  //////////////////////////////////////////////
  mounted : function(){
    let vm = this
    // Watch the browser "Forward/Backward"
    window.onpopstate = function({state}){
      let meta = state
      vm.$store.dispatch("wn-obj-meta/reload", meta)
    }
    // Reload sidebar
    vm.reloadSidebar()
  },
  //////////////////////////////////////////////
  computed : {
    main() {
      // evaluate the action menu
      let actionMenu = []
      if(this.mainView && !_.isEmpty(this.mainView.actions)) {
        _.forOwn(this.mainView.actions, (it, key)=>{
          if(_.isNumber(key)) {
            key = "menu-item-" + key
          }
          actionMenu.push({key, ...it})
        })
      }
      // gen result object
      return {
        comIcon : (this.mainView 
          ? this.mainView.comIcon 
          : null) || "extension",
        // Component
        comName : (this.mainView 
          ? this.mainView.comName 
          : null),
        // Module
        modType : this.mainView ? this.mainView.modType : null,
        // Menu
        actionMenu,
      }
    },
    mainStatus() {
      let status = {}
      if(this.mainData) {
        _.assign(status, this.$store.state.main.status, {
          changed : this.$store.getters["main/isChanged"]
        })
      }
      return status
    },
    mainData() {
      return this.$store.state.main
    }
  },
  //////////////////////////////////////////////
  methods : {
    getObjLink(meta) {
      return '/a/open/wn.manager?ph=id:'+meta.id
    },
    //.........................................
    async reloadSidebar() {
      let reo = await Wn.Sys.exec("ti sidebar -qn", {as:"json"});
      if(Ti.IsInfo("app/wn.manager")) {
        console.log("app/wn.manager::LoadSideBar", reo)
      }
      this.sidebar = reo.sidebar
    },
    //.........................................
    async onMainViewOpen(objMeta) {
      // Ti.Fuse.fire().then(()=>{

      // })
      // Try to protect data by Ti.Fuse
      let bombed = await Ti.Fuse.fire()
      if(!bombed)
        return

      // Then reload the object meta
      let meta = await this.$store.dispatch("wn-obj-meta/reload", objMeta)

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
    //.........................................
    onMainDataChange(data) {
      console.log("onMainDataChange", data)
      this.$store.commit("main/set", data)
    }
  }  // methods
  //////////////////////////////////////////////
}