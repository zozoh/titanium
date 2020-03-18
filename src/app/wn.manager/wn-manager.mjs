const WN_MANAGER_MIXINS = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      "$EmitBy" : async (name, ...args)=>{
        await this.DoEvent(name, args)
      }
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
    isChanged()   {return _.get(this.status, "changed")},
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
      this.actions = _.cloneDeep(actions)
    },
    //--------------------------------------
    async openView(oid) {
      console.log(oid)
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
    },
    //--------------------------------------
    async DoEvent(name, args=[]) {
      let {block, event} = Ti.Util.explainEventName(name)
      let data = _.first(args)
      console.log("wn-manager.DoEvent", {name, block, event, data})
      // Find Event Handler
      let FnSet = {
        // sidebar or title
        "item:active" : async (it)=>{
          await this.openView(it.id || it.path || it.value)
        },
        // For uinfo
        "do:logout" : async ()=>{
          await this.doLogout()
        },
        "arena>open" : async (o)=>{
          await this.openView(o.id)
        },
        "arena>change" : (content)=>{
          this.notifyChange(content)
        },
        "arena>actions:updated" : (actions)=>{
          this.updateActions(actions)
        }
      }

      let fn = FnSet[name] || FnSet[event]

      // Invoke Event Handler
      if(_.isFunction(fn)) {
        await fn.apply(this, args)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////////
  watch : {
    "meta" : async function(newVal, oldVal) {
      let newId = _.get(newVal, "id")
      let oldId = _.get(oldVal, "id")
      if(newVal && !_.isEqual(newId, oldId)) {
        console.log("metaChanged", newVal, oldVal)
        await this.reloadAncestors()
        await this.reloadMain()

        // Push history to update the browser address bar
        let his = window.history
        let meta = newVal
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
          document.title = title;
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