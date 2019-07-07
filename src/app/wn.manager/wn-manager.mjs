const DF_STOREAGE_KEY_OF_EXPOSE_HIDDEN = "wn-list-adaptview-expose-hidden"
//----------------------------------------------
export default {
  //////////////////////////////////////////////
  data : ()=>({
    "reloading"  : false,
    "loadingCom" : "ti-loading",
    "mainView"   : null,
    "sidebar"    : [],
    "mainActions" : []
  }),
  //////////////////////////////////////////////
  watch : {
    "obj.meta" : function(newMeta, oldMeta) {
      if(Ti.IsInfo()) {
        console.log("MetaChanged:", newMeta, oldMeta)
      }
      if(!newMeta || !oldMeta || newMeta.id != oldMeta.id) {
        this.reloadMain(newMeta)
      }
    },
    "mainData.__wn_messages.toast" : function(newVal, oldVal) {
      let app = Ti.App(this)
      if(newVal) {
        //console.log("toast!", newVal)
        this.$message({
            showClose : true,
            duration  : 2000,
            type      : newVal.type || "success",
            message   : Ti.I18n.text(newVal)
          });
        app.commit("main/$toast", null)
      }
    },
    "mainData.__wn_messages.noti" : function(newVal, oldVal) {
      let app = Ti.App(this)
      if(newVal) {
        this.$notify({
            showClose : true,
            duration  : 2000,
            type      : newVal.type || "success",
            title    : Ti.I18n.text(newVal.title || "i18n:success"),
            message  : Ti.I18n.text(newVal)
          });
        app.commit("main/$noti", null)
      }
    }
  },
  //////////////////////////////////////////////
  mounted : function(){
    let vm = this
    // Watch the browser "Forward/Backward"
    window.onpopstate = function({state}){
      let meta = state
      vm.$store.dispatch("meta/reload", meta)
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
    logoIcon() {
      if(this.obj.meta && this.obj.meta.icon)
        return this.obj.meta.icon 
      return "/gu/rs/ti/icons/svg/im/puzzle-11.svg"
    },
    main() {
      // evaluate the action menu
      let actionList = this.mainActions
      if(_.isEmpty(actionList) 
        && this.mainView 
        && !_.isEmpty(this.mainView.actions)) {
          actionList = this.mainView.actions
      }
      let actionMenu = []
      _.forOwn(actionList, (it, key)=>{
        if(_.isNumber(key)) {
          key = "menu-item-" + key
        }
        actionMenu.push({key, ...it})
      })
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
        _.assign(status, this.mainData.status)
      }
      return status
    },
    mainData() {
      let data = _.pickBy(this.$store.state.main, (val, key)=>{
        if("__wn_messages" == key) {
          return true
        }
        return key && !key.startsWith("_")
      })
      if(this.mainView && !_.isEmpty(this.mainView.comConf)) {
        _.assign(data, this.mainView.comConf)
      }
      return data
    },
    mainDataId() {
      if(this.mainData && this.mainData.meta) {
        return this.mainData.meta.id
      }
    },
    mainLog() {
      if(this.mainData && this.mainData.__wn_messages) {
        return Ti.I18n.text(this.mainData.__wn_messages.log)
      }
    },
    mainStatusText(){
      let st = this.mainStatus
      if(st.publishing) {
        return Ti.I18n.text("i18n:publishing")
      }
      if(st.reloading) {
        return Ti.I18n.text("i18n:loading")
      }
      if(st.renaming) {
        return Ti.I18n.text("i18n:renaming")
      }
    }
  },
  //////////////////////////////////////////////
  methods : {
    //.........................................
    getObjTitle(meta) {
      if(meta) {
        let title = meta.title || meta.nm
        return Ti.I18n.text(title)
      }
    },
    //.........................................
    getObjLink(meta) {
      //console.log("getObjLink")
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
      let meta = await this.$store.dispatch("meta/reload", objMeta)

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
    },
    //.........................................
    onActionUpdated(actions) {
      //console.log("update the actions", actions)
      if(!_.isEmpty(actions)) {
        this.mainActions = actions
      }
    }
  }  // methods
  //////////////////////////////////////////////
}