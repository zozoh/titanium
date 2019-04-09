export default {
  data : ()=>({
    "reloading"  : false,
    "loadingCom" : "ti-loading",
    "mainView"   : null,
    "sidebar"    : []
  }),
  //////////////////////////////////////////////
  watch : {
    "obj.meta" : function(newMeta, oldMeta) {
      let vm = this
      if(Ti.IsTrace()) {
        console.log("watched-----------------", newMeta, oldMeta)
      }
      if(!newMeta || !oldMeta || newMeta.id != oldMeta.id) {
        vm.reloadMain(newMeta)
      }
    },
    "mainData.$message.toast" : function(newVal, oldVal) {
      if(newVal || oldVal) {
        console.log("mainData.$message.toast", newVal, oldVal)
        if(newVal) {
        this.$message({
            showClose : true,
            duration  : 2000,
            type : "success",
            message   : Ti.I18n.text(newVal)
          });
        }
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
    // Protected loading
    Ti.Fuse.getOrCreate().add({
      key : "wn-manager-view-opening",
      everythingOk : ()=>{
        return !vm.isLoading
      },
      fail : ()=>{
        vm.$message({
          showClose: true,
          message: Ti.I18n.get("wnm-view-opening"),
          duration : 3000,
          type: 'warning'
        });
      }
    })
  },
  //////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-manager-view-opening")
  },
  //////////////////////////////////////////////
  computed : {
    isLoading() {
      return this.$store.state.main == null
             || this.reloading
    },
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
    },
    mainDataId() {
      if(this.$store.state.main && this.$store.state.main.meta) {
        return this.$store.state.main.meta.id
      }
    },
    mainLog() {
      if(this.$store.state.main && this.$store.state.main.$message) {
        return this.$store.state.main.$message.log
      }
    }
  },
  //////////////////////////////////////////////
  methods : {
    getObjLink(meta) {
      return Wn.Util.getAppLink(meta).toString()
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
      //console.log("onMainDataChange", data)
      this.$store.commit("main/set", data)
    }
  }  // methods
  //////////////////////////////////////////////
}