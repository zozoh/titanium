export default {
  /////////////////////////////////////////
  getters : {
    mainComIcon(state) {
      return state.mainCom.icon
    },
    mainComType(state) {
      return state.mainCom.name
    },
    mainComConf(state) {
      let data = _.pickBy(state.main, (val, key)=>{
        return key && !key.startsWith("_")
      })
      return _.assign(data, state.mainCom.conf)
    },
    mainActions(state) {
      return state.actions
    },
    mainStatus(state) {
      if(state.main)
        return _.assign({}, state.main.status)
      return {}
    },
    mainStatusText(state){
      let st = {}
      if(state.main) {
        _.assign(st, state.main.status)
      }
      if(st.publishing) {
        return Ti.I18n.text("i18n:publishing")
      }
      if(st.reloading) {
        return Ti.I18n.text("i18n:loading")
      }
      if(st.renaming) {
        return Ti.I18n.text("i18n:renaming")
      }
    },
    mainLog() {
      // TODO how to read the logging? maybe use the `Ti.Log` ?
    }
  },
  /////////////////////////////////////////
  mutations : {
    setLoading(state, loading) {
      state.loading = loading
    },
    setMainCom(state, com) {
      _.assign(state.mainCom, com)
    },
    setActions(state, actions=[]) {
      if(_.isArray(actions)) {
        let actions2 = []
        _.forEach(actions, (it, key)=>{
          if(_.isNumber(key)) {
            key = "menu-item-" + key
          }
          actions2.push({key, ...it})
        })
        state.actions = actions2
      }
    },
    setSidebar(state, sidebar) {
      if(_.isArray(sidebar)) {
        state.sidebar = [].concat(sidebar)
      }
    }
  },
  /////////////////////////////////////////
  actions : {
    //-------------------------------------
    openConsole() {
      Ti.Be.Open("/a/open/wn.console")
    },
    //-------------------------------------
    async reloadSidebar({commit}) {
      let reo = await Wn.Sys.exec("ti sidebar -cqn", {as:"json"});
      commit("setSidebar", reo.sidebar)
    },
    //-------------------------------------
    async reloadMain({state, commit, dispatch}, basePath="~") {
      // Guard loading
      if(state.loading) {
        Ti.Toast.Open("store-root-is-in-loading", "warn")
        return
      }
      // Mark loading
      commit("setLoading", true)
      try {
        //....................................
        // Reload Meta
        let meta = await dispatch("meta/reload", basePath)
        //....................................
        // Meta Required
        if(!meta) {
          Ti.Toast.Open("store-root-no-meta", "warn")
          return
        }
        //....................................
        // then try to unregisterModule safely
        try{
          this.unregisterModule("main")
        }catch(Err){}
        //..................................
        // Get back the viewName from hash
        // User can use `#!text-editor` to force open any view
        let m = /^#!(.+)$/.exec(window.location.hash)
        let viewName = m ? m[1] : null

        //..................................
        // Prepare to read view detail from server
        let cmdText;
        if(viewName) {
          cmdText = `ti views -cqn -name '${viewName}'`
        }
        // Query by current object
        else {
          cmdText = `ti views -cqn id:${meta.id}`
        }

        //..................................
        // Load the main view
        let viewInfo = await Wn.Sys.exec2(cmdText, {as:"json"})
        let $app = Ti.App(this)
        let view = await $app.loadView("main", viewInfo, {
          updateStoreConfig : config=>{
            if(!config.state) {
              config.state = {}
            }
          },
          // Add hook to get back the mainView instance
          updateComSetup : conf=>{
            conf.mixins = [].concat(conf.mixins||[])
            conf.mixins.push({
              mounted : function(){
                $app.$vmMain(this)
              }
            })
          }
        })
        //..................................
        if(Ti.IsInfo("app/wn.manager")) {
          console.log("TiView Loaded:", view)
        }
        //..................................
        commit("setMainCom", {
          icon : view.comIcon,
          name : view.comName,
          conf : view.comConf
        })
        //..................................
        commit("setActions", view.actions)
        //..................................
        // call main reload
        await $app.dispatch("main/reload", meta)        
        //..................................
        return meta
      }
      // Clean
      finally {
        commit("setLoading", false) 
      }

    },
    //-------------------------------------
    async reload({dispatch}, basePath="~") {
      await dispatch("reloadSidebar")
      await dispatch("reloadMain", basePath)
    }
    //-------------------------------------
  }
  /////////////////////////////////////////
}