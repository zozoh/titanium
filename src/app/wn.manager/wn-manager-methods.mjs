const _M = {
  //.........................................
  async reloadMain() {
    //console.log("reloadMain")
    // Check meta
    let meta = this.meta
    if (!meta) {
      return await Ti.Toast.Open("i18n:wn-manager-no-meta", "warn")
    }

    // Guard loading
    if (this.isLoading) {
      //console.log("!!!")
      return await Ti.Toast.Open("i18n:wn-manager-is-loading", "warn")
    }
    // Mark loading
    this.loading = true
    this.comType = "ti-loading"
    this.comConf = {}
    try {
      //..................................
      // Get back the viewName from hash
      // User can use `#!text-editor` to force open any view
      let m = /^#!(.+)$/.exec(window.location.hash)
      let viewName = m ? m[1] : null

      //..................................
      // Prepare to read view detail from server
      let cmdText;
      if (viewName) {
        cmdText = `ti views -cqn -name '${viewName}'`
      }
      // Query by current object
      else {
        cmdText = `ti views -cqn id:${meta.id}`
      }
      //..................................
      // Load the main view
      let viewInfo = await Wn.Sys.exec2(cmdText, { as: "json" })
      let $app = Ti.App(this)
      let view = await $app.loadView(viewInfo, meta)
      //console.log("after loadView", view)
      //..................................
      if (Ti.IsInfo("app/wn.manager")) {
        console.log("TiView Loaded:", view)
      }
      //....................................
      // then try to unregisterModule safely
      // if(this.view && this.view.modType) {
      //   console.log("depose modType", this.view.modType)
      //   try{
      //     this.$store.unregisterModule("main")
      //   }catch(E){
      //     console.error("Error when unregisterModule", E)
      //   }
      // }
      //..................................
      // register main module
      if (view && view.modType) {
        if (this.Main) {
          this.$store.unregisterModule("main")
        }
        //
        // Main module
        //
        if (view && view.mod) {
          this.$store.registerModule("main", view.mod)
        }

        // 
        // Extends modules
        //
        if (this.view && !_.isEmpty(this.view.modules)) {
          for (let moName in this.view.modules) {
            this.$store.unregisterModule(moName)
          }
        }
        if (view && view.modules) {
          for (let moName in view.modules) {
            let mod = view.modules[moName]
            this.$store.registerModule(moName, mod)
          }
        }

        // Reload mod data
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
      this.$nextTick(() => {
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
    if (this.hasMeta) {
      // this.ancestors = await Wn.Io.loadAncestors("id:"+this.MetaId)
      // this.parent = _.last(this.ancestors)
      await Ti.App(this).dispatch("axis/reload", this.meta)
    }
  },
  //.........................................
  async reloadSidebar() {
    let cmdText = Wn.Session.env("SIDEBAR_BY") || "ti sidebar -cqn";
    let reo = await Wn.Sys.exec(cmdText, { as: "json" });
    this.sidebar = reo.sidebar
    this.sidebarStatusStoreKey = reo.statusStoreKey
  },
  //.........................................
  async reloadPrivilege() {
    this.privilege = await Wn.Sys.exec("www pvg -cqn", { as: "json" });
  },
  //.........................................
  async reloadCurrent() {
    let r0 = Ti.App(this).dispatch("current/reload")
    let r1 = this.reloadSidebar()
    let r2 = this.reloadPrivilege()
    let r3 = this.reloadAncestors()
    return await Promise.all([r0, r1, r2, r3])
  },
  //--------------------------------------------
  async openCurrentMetaEditor() {
    // Guard
    if (!this.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    //.........................................
    // For current selected
    //.........................................
    if (this.meta) {
      // Edit current meta
      let reo = await Wn.EditObjMeta(this.meta, {
        fields: "default", autoSave: false
      })

      // Cancel the editing
      if (_.isUndefined(reo)) {
        return
      }

      // Update the current editing
      let { updates } = reo
      if (!_.isEmpty(updates)) {
        await this.reloadCurrent()
      }
      return
    }
  },
  //--------------------------------------------
  async openCurrentPrivilege() {
    let meta = this.meta

    if (!meta) {
      await Ti.Toast.Open("i18n:nil-obj")
      return
    }

    let newMeta = await Wn.EditObjPvg(meta, {
      organization: "~/.domain/organization.json"
    })

    // Update to current list
    if (newMeta) {
      await this.reloadCurrent()
    }

    return newMeta
  },
  //.........................................
  async execEvent(eventName, payload, dftCommand) {
    let cmd = _.get(this.view.events, eventName) || dftCommand
    await Ti.App(this).exec(cmd, payload)
  },
  //.........................................
  getDocumentTitle(meta) {
    let title = Ti.Util.getFallback(meta, "title", "nm", "id")
    return Ti.Util.explainObj(meta, title)
  },
  //.........................................
  updateDocumentTitle(meta) {
    let title = this.getDocumentTitle(meta)
    if (title) {
      title = Ti.I18n.text(title)
      document.title = title
    }
    return title
  },
  //.........................................
  pushHistory(meta) {
    // Push history to update the browser address bar
    //console.log("pushHistory", meta.id)
    let his = window.history
    if (his && meta) {
      // Done push duplicate state
      if (his.state && his.state.id == meta.id) {
        //console.log("pushHistory ~ignore~")
        return
      }
      // Push to history stack
      let newLink = Wn.Util.getAppLinkStr(meta)
      let title = this.updateDocumentTitle(meta)
      let obj = _.cloneDeep(meta)
      //console.log(title , "->", newLink)
      his.pushState(obj, title, newLink)
      // Update the Title
      document.title = Ti.I18n.text(title);
    }
  }
  //.........................................
}
export default _M;