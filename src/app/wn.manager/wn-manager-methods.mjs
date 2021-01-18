const _M = {
  //.........................................
  async reloadMain() {
    // Check meta
    let meta = this.meta
    if(!meta) {
      return await Ti.Toast.Open("i18n:wn-manager-no-meta", "warn")
    }

    // Guard loading
    if(this.isLoading) {
      console.log("!!!")
      return await Ti.Toast.Open("i18n:wn-manager-is-loading", "warn")
    }
    // Mark loading
    this.loading = true
    this.comType = "ti-loading"
    this.comConf = {}
    try {
      //....................................
      // then try to unregisterModule safely
      if(this.view && this.view.modType) {
        try{
          this.$store.unregisterModule("main")
        }catch(E){
          console.error("Error when unregisterModule", E)
        }
      }
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
      let view = await $app.loadView(viewInfo)
      //..................................
      if(Ti.IsInfo("app/wn.manager")) {
        console.log("TiView Loaded:", view)
      }
      //..................................
      // register main module
      if(view && view.modType) {
        //console.log("load main!!!")
        this.$store.registerModule("main", view.mod)
        await $app.dispatch("main/reload", meta)
      }
      //..................................
      this.comType = view.comName
      this.comIcon = view.comIcon
      this.comConf = view.comConf
      this.view = view
      this.myMessage = null
      this.myIndicator = null
      this.mainViewStatus = {}
      this.OnUpdateActions(view.actions)
      this.$nextTick(()=>{
        this.myViewReady = true
      })
    }
    // Clean
    finally {
      this.loading = false
    }
  },
  //.........................................
  async reloadAncestors() {
    if(this.hasMeta) {
      // this.ancestors = await Wn.Io.loadAncestors("id:"+this.MetaId)
      // this.parent = _.last(this.ancestors)
      await Ti.App(this).dispatch("axis/reload", this.meta)
    }
  },
  //.........................................
  async reloadSidebar() {
    let reo = await Wn.Sys.exec("ti sidebar -cqn", {as:"json"});
    this.sidebar = reo.sidebar
    this.sidebarStatusStoreKey = reo.statusStoreKey
  },
  //.........................................
  async reloadPrivilege() {
    this.privilege = await Wn.Sys.exec("www pvg -cqn", {as:"json"});
  },
  //.........................................
  async reloadCurrent() {
    let r0 = Ti.App(this).dispatch("current/reload")
    let r1 = this.reloadSidebar()
    let r2 = this.reloadPrivilege()
    let r3 = this.reloadAncestors()
    return await Promise.all([r0, r1, r2, r3])
  },
  //.........................................
  pushHistory(meta) {
    // Push history to update the browser address bar
    let his = window.history
    if(his && meta) {
      // Done push duplicate state
      if(his.state && his.state.id == meta.id){
        return
      }
      // Push to history stack
      let newLink = Wn.Util.getAppLink(meta.id)
      let title =  Wn.Util.getObjDisplayName(meta)
      if(Ti.IsInfo("app/wn-manager")) {
        console.log(title , "->", newLink)
      }
      his.pushState(meta, title, newLink)
      // Update the Title
      document.title = Ti.I18n.text(title);
    }
  }
  //.........................................
}
export default _M;