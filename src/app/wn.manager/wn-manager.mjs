const _M = {
  ///////////////////////////////////////////
  provide: function () {
    return {
      $session: {
        ticket: this.session.ticket,
        userId: this.session.uid,
        userName: this.session.unm,
        group: this.session.grp
      },
      $vars: this.vars
    }
  },
  ///////////////////////////////////////////
  data: () => ({
    loading: false,
    comIcon: "zmdi-hourglass-alt",
    comType: "ti-loading",
    comConf: {},
    actions: [],
    sidebar: [],
    privilege: {},
    sidebarStatusStoreKey: undefined,
    // for main view customized status
    // It will be clean each time reload main view
    mainViewStatus: {},
    // Current meta anestors
    // ancestors : [],
    // parent : null,
    // Current view(main) information
    view: null,
    // Message and Indicator
    myMessage: null,
    myIndicator: null,
    // View ready
    myViewReady: false
  }),
  ///////////////////////////////////////////
  computed: {
    //---------------------------------------
    TopClass() {
      let skyColorized = _.get(this.session, "envs.SKY_COLORIZED")
      return this.getTopClass({
        "is-current-as-home": this.CurrentIsHome,
        "is-current-no-home": !this.CurrentIsHome,
        "is-sky-colorized": /^(yes|true)$/.test(skyColorized)
      }, this.appClassName)
    },
    //---------------------------------------
    // Status
    //---------------------------------------
    isLoading() {
      return this.loading || this.isReloading || this.isGuiLoading
    },
    isViewReady() { return this.myViewReady },
    //---------------------------------------
    isChanged() {
      let modMain = this.$store.state.main
      if (_.get(modMain, "status.changed")) {
        return true
      }
      return _.get(this.status, "changed")
    },
    //---------------------------------------
    isSaving() { return _.get(this.status, "saving") },
    isReloading() { return _.get(this.status, "reloading") },
    isGuiLoading() { return _.get(this.status, "guiLoading") },
    //---------------------------------------
    hasActions() { return !_.isEmpty(this.actions) },
    hasView() { return this.view ? true : false },
    hasMeta() { return this.meta ? true : false },
    hasParent() { return this.parent ? true : false },
    //---------------------------------------
    // Data
    //---------------------------------------
    MetaId() { return _.get(this.meta, "id") },
    MetaPath() { return _.get(this.meta, "ph") },
    //---------------------------------------
    MyHome() {
      let obj = this.meta
      let ans = this.ancestors
      if (!_.isEmpty(ans)) {
        // for /home/xiaobai
        if (1 == ans.length) {
          if ("home" == ans[0].nm) {
            return obj
          }
        }
        // for /home/xiaobai/path/to/file
        if ("home" == ans[0].nm) {
          return ans[1]
        }
      }
      // for /root
      else if (obj && "root" == obj.nm) {
        return obj
      }
      // Dont't known how to find the home
      return null
    },
    //---------------------------------------
    MyHomeId() { return _.get(this.MyHome, "id") },
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
          pvg: this.privilege,
          exposeHidden: this.exposeHidden,
          listViewType: this.listViewType,
          changed: this.isChanged,
          reloading: reloading,
          loading: this.loading
        })
    },
    StatusText() {
      let st = this.TheStatus
      if (st.saving) {
        return Ti.I18n.text("i18n:saving")
      }
      if (st.reloading || st.loading) {
        return Ti.I18n.text("i18n:loading")
      }
    },
    //---------------------------------------
    // Modules
    //---------------------------------------
    RootState() {
      return this.$store.state
    },
    RootGetters() {
      return this.$store.getters
    },
    //---------------------------------------
    Main() {
      return this.$store.state.main
    },
    MainGetters() {
      let re = {}
      _.forEach(this.$store.getters, (v, k) => {
        let m = /^main\/(.+)$/.exec(k)
        if (m) {
          let key = _.camelCase(m[1].replace(/\\/g, "-"))
          re[key] = _.cloneDeep(v)
        }
      })
      return re
    },
    MainData() { return _.get(this.Main, "data") },
    MainContent() { return _.get(this.Main, "content") },
    hasMain() {
      return this.Main && !_.isEmpty(this.Main)
    },
    //---------------------------------------
    Current() {
      return this.$store.state.current
    },
    //---------------------------------------
    Axis() {
      return this.$store.state.axis
    },
    //---------------------------------------
    // GUI
    //---------------------------------------
    GuiShown() {
      let ShownSet = _.get(this.setup, "shown")
      if (_.isPlainObject(ShownSet)) {
        let shown = ShownSet[this.viewportMode]
        // Refer onece
        if (_.isString(shown)) {
          shown = ShownSet[shown]
        }
        // Refer twice (I think it is enough for most of cases)
        if (_.isString(shown)) {
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
  methods: {
    //--------------------------------------
    OnLogout() {
      this.doLogout()
    },
    //--------------------------------------
    OnArenaSelect(payload = {}) {
      let { checked } = payload
      //console.log("OnArenaSelect", this.view)
      let n = _.size(checked)
      if (n > 0) {
        this.myIndicator = `${n} selected`
      } else {
        this.myIndicator = null
      }
      //this.__on_events("arena::select", payload)
    },
    //--------------------------------------
    OnCurrentMetaChange({ id, path, value } = {}) {
      this.openView(id || path || value)
    },
    //--------------------------------------
    OnCurrentDataChange(data) {
      if (this.view.mod) {
        this.execEvent("arena::change", data, "dispatch:main/changeContent")
      }
    },
    //--------------------------------------
    OnArenaViewStatusUpdated(status) {
      this.mainViewStatus = _.assign({}, this.mainViewStatus, status)
    },
    //--------------------------------------
    async OnUpdateMyVars({
      vars = {},
      reloadPage = false
    } = {}) {
      // Update the session vars
      await Ti.App(this).dispatch("session/updateMyVars", vars)

      // Reload whole page
      if (reloadPage) {
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
    OnArenaListViewTypeChange({ type } = {}) {
      Ti.App(this).dispatch("viewport/changeListViewType", type)
    },
    //--------------------------------------
    OnUpdateActions(actions) {
      //console.log("OnUpdateAction", actions)
      const explainActionItem = (aItem) => {
        if (aItem.explain) {
          return Ti.Util.explainObj(this.RootState, _.omit(aItem, "explain"))
        }
        if (_.isArray(aItem.items)) {
          let items = []
          for (let it of aItem.items) {
            let it2 = explainActionItem(it)
            items.push(it2)
          }
          aItem.items = items
        }
        return aItem
      }
      // Eval actions 
      let aItems = _.cloneDeep(actions)
      let list = []
      if (_.isArray(aItems)) {
        for (let aItem of aItems) {
          let li = explainActionItem(aItem)
          list.push(li)
        }
      }
      // Update to data
      this.actions = list
      Ti.App(this).reWatchShortcut(actions)
    },
    //--------------------------------------
    OnArenaIndicate(info) {
      this.myIndicator = info
    },
    //--------------------------------------
    OnArenaMessage(msg = "") {
      this.myMessage = msg
    },
    //--------------------------------------
    doCheckDomainObjThumb() {
      let domain = Wn.Session.getMyGroup();
      let cmdText = `hookx @query 'd0:"home",d1:"${domain}",thumb_src:null,mime:"^image"' @invoke write -v`
      Wn.OpenCmdPanel(cmdText)
    },
    //--------------------------------------
    __on_events(name, payload) {
      //console.log("WnManager::__on_events", name, payload)
      // Special event 
      if (/^main::arena::(.+::)*select$/.test(name)) {
        this.OnArenaSelect(payload)
      }
      if (/^main::arena::(.+::)*indicate$/.test(name)) {
        this.OnArenaIndicate(payload)
      }
      if (/^main::arena::(.+::)*message$/.test(name)) {
        this.OnArenaMessage(payload)
      }

      // Guard
      if (!this.view || _.isEmpty(this.view.events)) {
        return
      }
      // Get candidate func invoking
      let fn = _.get(this.view.events, name)
      if (!fn) {
        fn = this.$tiEventTryFallback(name, this.view.events)
      }

      // Gen invoking
      return Ti.Shortcut.genEventActionInvoking(fn, {
        app: Ti.App(this),
        context: _.assign({
          $args: [payload]
        }, payload, this.RootState),
        funcSet: this
      })
    },
    //--------------------------------------
    async openView(oid) {
      if (!_.isString(oid))
        return

      // Guard for fure
      let bombed = await Ti.Fuse.fire()
      //console.log("openView", bombed)
      if (!bombed) {
        return
      }

      // Guard for changed
      if (this.isChanged) {
        await Ti.Toast.Open("i18n:wn-obj-nosaved", "warn", "left")
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
        params: { ajax: true }
      })
      //console.log(reo)
      Ti.Be.Open(quitPath, { target: "_self", delay: 0 })
    }
    //--------------------------------------
  },
  //////////////////////////////////////////////
  watch: {
    "meta": function (newVal, oldVal) {
      let newId = _.get(newVal, "id")
      let oldId = _.get(oldVal, "id")
      let isSameId = _.isEqual(newId, oldId)
      if (newVal && !isSameId) {
        this.updateDocumentTitle(newVal)
        //console.log("Wn.Manager.metaChanged", newVal, oldVal)
        // Update the ancestors path
        _.delay(async () => {
          if (!isSameId) {
            await this.reloadAncestors()
          }
          // Reload Current Main
          if (!isSameId || this.isChanged) {
            await this.reloadMain()
            this.pushHistory(newVal)
          }
        })
      }
    }
  },
  ///////////////////////////////////////////
  created: function(){
    Ti.Fuse.getOrCreate().add({
      key: "wn-manager",
      everythingOk: () => {
        return !this.isLoading
      },
      fail: () => {
        Ti.Toast.Open("i18n:wn-manager-is-loading", "warn")
      }
    })
  },
  ///////////////////////////////////////////
  mounted: async function () {
    //......................................
    // Update default listViewType
    if (this.setup.listViewType) {
      Ti.App(this).commit("viewport/setListViewType", this.setup.listViewType)
    }
    //......................................
    this.reloadSidebar()
    this.reloadPrivilege()
    //......................................
    window.onpopstate = (evt) => {
      //console.log("onpopstate", evt)
      let obj = evt.state
      //console.log("popstate", obj)
      if (obj && obj.id && obj.nm) {
        Ti.App(this).dispatch("current/reload", obj)
      }
    }
    //......................................
  },
  ///////////////////////////////////////////
  beforeDestroy: function () {

  }
  ///////////////////////////////////////////
}
export default _M;