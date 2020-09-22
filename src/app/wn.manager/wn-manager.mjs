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
    myExposeHidden : false,
    loading : false,
    comIcon : "zmdi-hourglass-alt",
    comType : "ti-loading",
    comConf : {},
    actions : [],
    sidebar : [],
    // Current meta anestors
    ancestors : [],
    parent : null,
    // Current view(main) information
    view : null,
    // Message and Indicator
    myMessage   : null,
    myIndicator : null
  }),
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-current-as-home" : this.CurrentIsHome,
        "is-current-no-home" : !this.CurrentIsHome
      },this.appClassName)
    },
    //---------------------------------------
    // Status
    //---------------------------------------
    isLoading() {return this.loading || this.isReloading},
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
      return _.assign({}, mainStatus, this.status, {
        exposeHidden : this.myExposeHidden,
        changed      : this.isChanged,
        reloading    : reloading
      })
    },
    StatusText(){
      let st = _.assign({}, this.status)
      if(st.saving) {
        return Ti.I18n.text("i18n:saving")
      }
      if(st.reloading) {
        return Ti.I18n.text("i18n:loading")
      }
    },
    //---------------------------------------
    // Main Module
    //---------------------------------------
    Main() {
      return this.$store.state.main
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
    OnExposeHidden(eh) {
      this.myExposeHidden = eh
    },
    //--------------------------------------
    OnLogout() {
      this.doLogout()
    },
    //--------------------------------------
    OnCurrentMetaChange({id, path, value}={}) {
      this.openView(id || path || value)
    },
    //--------------------------------------
    OnCurrentDataChange(data){
      Ti.App(this).dispatch("current/changeContent", data);
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
    async openView(oid) {
      if(!_.isString(oid))
        return

      // Guard it
      let bombed = await Ti.Fuse.fire()
      if(!bombed) {
        return
      }
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
      console.log(reo)
      Ti.Be.Open(quitPath, {target:"_self", delay:0})
    }
    //--------------------------------------
  },
  //////////////////////////////////////////////
  watch : {
    "meta" : async function(newVal, oldVal) {
      let newId = _.get(newVal, "id")
      let oldId = _.get(oldVal, "id")
      let isSameId = _.isEqual(newId, oldId) 
      if(newVal) {
        //console.log("metaChanged", newVal, oldVal)
        // Update the ancestors path
        if(!isSameId) {
          await this.reloadAncestors()
        }
        // Reload Current Main
        if(!isSameId || this.isChanged) {
          await this.reloadMain()
          this.pushHistory(newVal)
        }
      }
    }
  },
  ///////////////////////////////////////////
  mounted : async function(){
    //......................................
    await this.reloadSidebar()
    //......................................
  },
  ///////////////////////////////////////////
  beforeDestroy : function(){
    
  }
  ///////////////////////////////////////////
}
export default _M;