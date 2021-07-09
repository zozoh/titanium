const _M = {
  ///////////////////////////////////////////
  provide: function() {
    return {
      $session: {
        ticket   : this.session.ticket,
        userId   : this.session.uid,
        userName : this.session.unm,
        group    : this.session.grp
      },
      $vars: this.vars
    }
  },
  ///////////////////////////////////////////
  data:()=>({
    loading : false,
    comIcon : "zmdi-hourglass-alt",
    comType : "ti-loading",
    comConf : {},
    actions : [],
    sidebar : [],
    privilege : {},
    sidebarStatusStoreKey : undefined,
    // for main view customized status
    // It will be clean each time reload main view
    mainViewStatus : {},
    // Current meta anestors
    // ancestors : [],
    // parent : null,
    // Current view(main) information
    view : null,
    // Message and Indicator
    myMessage   : null,
    myIndicator : null,
    // View ready
    myViewReady : false
  }),
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    TopClass() {
      let skyColorized = _.get(this.session, "envs.SKY_COLORIZED")
      return this.getTopClass({
        "is-current-as-home" : this.CurrentIsHome,
        "is-current-no-home" : !this.CurrentIsHome,
        "is-sky-colorized" : /^(yes|true)$/.test(skyColorized)
      },this.appClassName)
    },
    //---------------------------------------
    // Status
    //---------------------------------------
    isLoading() {
      return this.loading || this.isReloading || this.isGuiLoading
    },
    isViewReady() {return this.myViewReady},
    //---------------------------------------
    isChanged() {
      let modMain = this.$store.state.main
      if(_.get(modMain, "status.changed")) {
        return true
      }
      return _.get(this.status, "changed")
    },
    //---------------------------------------
    isSaving()    {return _.get(this.status, "saving")},
    isReloading() {return _.get(this.status, "reloading")},
    isGuiLoading() {return _.get(this.status, "guiLoading")},
    //---------------------------------------
    hasActions(){return !_.isEmpty(this.actions)},
    hasView()   {return this.view   ? true : false},
    hasMeta()   {return this.meta   ? true : false},
    hasParent() {return this.parent ? true : false},
    //---------------------------------------
    // Data
    //---------------------------------------
    MetaId ()   {return _.get(this.meta, "id")},
    MetaPath()  {return _.get(this.meta, "ph")},
    //---------------------------------------
    MyHome() {
      let obj = this.meta
      let ans = this.ancestors
      if(!_.isEmpty(ans)) {
        // for /home/xiaobai
        if(1 == ans.length) {
          if("home" == ans[0].nm) {
            return obj
          }
        }
        // for /home/xiaobai/path/to/file
        if("home" == ans[0].nm) {
          return ans[1]
        }
      }
      // for /root
      else if(obj && "root" == obj.nm) {
        return obj
      }
      // Dont't known how to find the home
      return null
    },
    //---------------------------------------
    MyHomeId() {return _.get(this.MyHome, "id")},
    //---------------------------------------
    ParentIsHome() {
      return this.hasParent && this.parent.id == this.MyHomeId
    },
    //---------------------------------------
    CurrentIsHome() {
      return this.hasMeta && this.MetaId == this.MyHomeId
    },
    //---------------------------------------
    // Tipping
    //---------------------------------------
    TheStatus() {
      let mainStatus = _.get(this.$store.state, "main.status")
      let reloading = _.get(mainStatus, "reloading") || this.status.reloading
      return _.assign({}, this.session.envs, 
        this.status, 
        mainStatus, 
        this.mainViewStatus,
        {
          pvg : this.privilege,
          exposeHidden : this.exposeHidden,
          listViewType : this.listViewType,
          changed      : this.isChanged,
          reloading    : reloading,
          loading      : this.loading
        })
    },
    StatusText(){
      let st = this.TheStatus
      if(st.saving) {
        return Ti.I18n.text("i18n:saving")
      }
      if(st.reloading || st.loading) {
        return Ti.I18n.text("i18n:loading")
      }
    },
    //---------------------------------------
    // Main Modules
    //---------------------------------------
    Main() {
      return this.$store.state.main
    },
    MainData() {return _.get(this.Main, "data")},
    MainContent() {return _.get(this.Main, "content")},
    Current() {
      return this.$store.state.current
    },
    Axis() {
      return this.$store.state.axis
    },
    //---------------------------------------
    // GUI
    //---------------------------------------
    GuiShown() {
      let ShownSet = _.get(this.setup, "shown")
      if(_.isPlainObject(ShownSet)) {
        let shown = ShownSet[this.viewportMode]
        // Refer onece
        if(_.isString(shown)) {
          shown = ShownSet[shown]
        }
        // Refer twice (I think it is enough for most of cases)
        if(_.isString(shown)) {
          shown = ShownSet[shown]
        }
        return Ti.Util.explainObj(this, shown)
      }
      return {}
    },
    //---------------------------------------
    GuiCanLoading() {
      return _.get(this.setup, "canLoading")
    },
    //---------------------------------------
    GuiLoadingAs() {
      return _.get(this.setup, "loadingAs")
    },
    //---------------------------------------
    GuiLayout() {
      return Ti.Util.explainObj(this, this.layout)
    },
    //---------------------------------------
    GuiSchema() {
      return Ti.Util.explainObj(this, this.schema)
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnLogout() {
      this.doLogout()
    },
    //--------------------------------------
    OnArenaSelect({checked}) {
      //console.log("OnArenaSelect", checked)
      let n = _.size(checked)
      if(n > 0) {
        this.myIndicator = `${n} selected`
      } else {
        this.myIndicator = null
      }
    },
    //--------------------------------------
    OnCurrentMetaChange({id, path, value}={}) {
      this.openView(id || path || value)
    },
    //--------------------------------------
    OnCurrentDataChange(data){
      if(this.view.mod) {
        this.execEvent("arena::change", data, "dispatch:main/changeContent")
      }
    },
    //--------------------------------------
    OnArenaViewStatusUpdated(status) {
      this.mainViewStatus = _.assign({}, this.mainViewStatus, status)
    },
    //--------------------------------------
    async OnUpdateMyVars({
      vars={}, 
      reloadPage=false
    }={}) {
      // Update the session vars
      await Ti.App(this).dispatch("session/updateMyVars", vars)

      // Reload whole page
      if(reloadPage) {
        window.location.reload()
      }
      // Reload data
      else {
        this.reloadSidebar()
        this.reloadPrivilege()
        this.reloadAncestors()
        this.reloadMain()
      }
    },
    //--------------------------------------
    OnArenaListViewTypeChange({type}={}) {
      Ti.App(this).dispatch("viewport/changeListViewType", type)
    },
    //--------------------------------------
    OnUpdateActions(actions) {
      //console.log("OnUpdateAction", actions)
      this.actions = _.cloneDeep(actions)
      Ti.App(this).reWatchShortcut(actions)
    },
    //--------------------------------------
    OnArenaIndicate(info) {
      this.myIndicator = info
    },
    //--------------------------------------
    OnArenaMessage(msg="") {
      this.myMessage = msg
    },
    //--------------------------------------
    doCheckDomainObjThumb() {
      let domain = Wn.Session.getMyGroup();
      let cmdText = `hookx @query 'd0:"home",d1:"${domain}",thumb_src:null,mime:"^image"' @invoke write -v`
      Wn.OpenCmdPanel(cmdText)
    },
    //--------------------------------------
    async __on_events(name, ...args) {
      // Guard
      if(!this.view.events) {
        return
      }

      //console.log("__on_events", name, args)
      // Get the view events dispatcher
      let at = _.get(this.view.events, name)

      // Get the event dispatcher by candidate names
      if(!at) {
        let names = name.split("::")
        for(let i=1; i<names.length; i++) {
          let key = names.slice(i).join("::")
          at = _.get(this.view.events, key)
          if(at) {
            break
          }
        }
      }
      
      // Guard again
      if(!at) {
        return
      }

      // Prepare the context
      let ctx = {$args:args}
      
      // Batch invoke
      if(_.isArray(at)) {
        for(let a of at) {
          await this.fireAction(a, ctx)
        }
      }
      // Just one invoke
      else {
        await this.fireAction(at, ctx)
      }
    },
    //--------------------------------------
    async fireAction(at, ctx={}) {
      let app = Ti.App(this)
      let {global, main, commit, dispatch, payload} = at

      // Explain payload
      let pld = Ti.Util.explainObj(ctx, payload)

      // commit
      if(commit) {
        app.commit(commit, pld)
      }
      // Dispatch
      else if(dispatch) {
        await app.dispatch(dispatch, pld)
      }
      // Global invoke
      else if(global) {
        await app.global(global, pld)
      }
      // Invoke main com method
      else if(main) {
        await app.main(main, pld)
      }
    },
    //--------------------------------------
    async openView(oid) {
      if(!_.isString(oid))
        return

      // Guard for changed
      if(this.isChanged) {
        await Ti.Toast.Open("i18n:wn-obj-nosaved", "warn", "left")
        return
      }

      // Guard for fure
      let bombed = await Ti.Fuse.fire()
      if(!bombed) {
        return
      }
      // Mark view ready
      this.myViewReady = false

      // Open It
      let ph = Wn.Io.isFullObjId(oid)
                ? `id:${oid}`
                : oid;
      await Ti.App(this).dispatch("current/reload", ph)
    },
    //--------------------------------------
    async doLogout() {
      let quitPath = Wn.Session.env("QUIT") || "/a/login/"
      let reo = await Ti.Http.get("/a/sys_logout", {
        params:{ajax:true}
      })
      //console.log(reo)
      Ti.Be.Open(quitPath, {target:"_self", delay:0})
    }
    //--------------------------------------
  },
  //////////////////////////////////////////////
  watch : {
    "meta" : function(newVal, oldVal) {
      let newId = _.get(newVal, "id")
      let oldId = _.get(oldVal, "id")
      let isSameId = _.isEqual(newId, oldId) 
      if(newVal) {
        //console.log("metaChanged", newVal, oldVal)
        // Update the ancestors path
        _.delay(async ()=>{
          if(!isSameId) {
            await this.reloadAncestors()
          }
          // Reload Current Main
          if(!isSameId || this.isChanged) {
            await this.reloadMain()
            this.pushHistory(newVal)
          }
        })
      }
    }
  },
  ///////////////////////////////////////////
  mounted : async function(){
    //......................................
    this.reloadSidebar()
    this.reloadPrivilege()
    //......................................
    window.onpopstate = (evt)=>{
      let obj = evt.state
      //console.log("popstate", obj)
      if(obj && obj.id && obj.ph) {
        Ti.App(this).dispatch("current/reload", obj)
      }
    }
    //......................................
  },
  ///////////////////////////////////////////
  beforeDestroy : function(){
    
  }
  ///////////////////////////////////////////
}
export default _M;