const WN_MANAGER_MIXINS = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      "$EmitBy" : (name, ...args)=>{
        this.$receive(name, args, {
          "expose-hidden" : (eh)=>{
            this.myExposeHidden = eh
          },
          // sidebar or title
          "item:active" : (it)=>{
            this.openView(it.id || it.path || it.value)
          },
          // For uinfo
          "do:logout" : ()=>{
            this.doLogout()
          },
          "arena>open" : (o)=>{
            this.openView(o.id)
          },
          "arena>change" : (content)=>{
            this.notifyChange(content)
          },
          "arena>actions:update" : (actions)=>{
            this.updateActions(actions)
          }
        })
      }
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
    view : null
  }),
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    TopClass() {
      return this.getTopClass(this.appClassName)
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
      return _.assign({}, this.status, {
        exposeHidden : this.myExposeHidden,
        changed : this.isChanged
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
    notifyChange(data) {
      Ti.App(this).dispatch("current/changeContent", data);
    },
    //--------------------------------------
    updateActions(actions) {
      console.log("updateActions", actions)
      this.actions = _.cloneDeep(actions)
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
      let quitPath = Wn.Session.env("QUIT") || "/"
      await Wn.Sys.exec("exit")
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
export default WN_MANAGER_MIXINS;