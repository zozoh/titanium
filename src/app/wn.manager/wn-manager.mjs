export default {
  //////////////////////////////////////////////
  watch : {
    "mainComType" : function(newType){
      Ti.Shortcut.removeWatch(this)
      Ti.Shortcut.addWatch(this, this.mainActions)
    },
    "obj.meta" : function(meta) {
      // Push history to update the browser address bar
      let his = window.history
      if(his && meta) {
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
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className, ()=>{
        let klass = []
        _.forEach(this.theShown, (val, key)=>{
          klass.push(`is-${key}-${val?'shown':'hidden'}`)
        })
        return klass
      })
    },
    //---------------------------------------
    ...Vuex.mapState([
      "loading", "mainCom", "actions", "sidebar"]),
    //---------------------------------------
    ...Vuex.mapGetters([
      "mainActions",
      "mainComIcon", "mainComType", "mainComConf",
      "mainStatus", "mainStatusText"]),
    //---------------------------------------
    objIsNotHome() {
      return this.obj && this.obj.meta && !this.objIsHome
    },
    //---------------------------------------
    theMetaId(){
      if(this.$store.state.main && this.$store.state.main.meta) {
        return this.$store.state.main.meta.id
      }
    },
    //---------------------------------------
    hasMainActions() {
      return _.isArray(this.mainActions) 
         && !_.isEmpty(this.mainActions)
    },
    //---------------------------------------
    theLogo() {
      if("<:home>" == this.setup.logo) {
        let crIt = _.nth(this.theCrumbData, 0)
        if(crIt) {
          return crIt.icon
        }
      }
      // Then it is the static icon
      return this.setup.logo
    },
    //---------------------------------------
    theCrumbData() {
      let list = []
      if(this.obj && this.obj.meta) {
        let ans = _.map(this.obj.ancestors)
        // Find the first Index from home
        let i = Ti.Util.fallback(this.setup.firstCrumbIndex, 0)
        // Show ancestors form Home
        for(; i<ans.length; i++) {
          let an = ans[i]
          list.push({
            icon  : Wn.Util.getIconObj(an),
            text  : Wn.Util.getObjDisplayName(an),
            value : an.id,
            href  : Wn.Util.getAppLink(an) + ""
          })
        }
        // Show Self
        let self = this.obj.meta
        // Top Item, just show title
        list.push({
          icon  : Wn.Util.getIconObj(self),
          text  : Wn.Util.getObjDisplayName(self),
          value : self.id,
          href  : null,
          asterisk : _.get(this.mainStatus, "changed")
        })
      }
      return list
    },
    //---------------------------------------
    theCrumb() {
      let crumbs = _.cloneDeep(this.theCrumbData)
      // Remove the first 
      if(this.theLogo && !_.isEmpty(crumbs)) {
        crumbs[0].icon = null
      }
      // Return it
      return  {
        "mode" : "path",
        "removeIcon" : null,
        "statusIcons" : {
          "collapse" : "zmdi-chevron-right",
          "extended" : "zmdi-chevron-down"
        },
        "data" : crumbs
      }
    },
    //---------------------------------------
    theSessionBadge() {
      let me = _.get(this.session, "me")
      if(me) {
        return {
          me,
          avatarKey : "thumb",
          avatarSrc : null,
          loginIcon : me.sex == 1 ? "im-user-male" : "im-user-female",
          nameKeys  : ["nickname", "nm"]
        }
      }
    },
    //---------------------------------------
    theMenu() {
      if(_.isArray(this.mainActions) && !_.isEmpty(this.mainActions)) {
        return {
          className : `wn-${this.viewportMode}-menu`,
          data   : this.mainActions,
          status : this.mainStatus
        }
      }
    },
    //---------------------------------------
    theShown() {
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
    theCanLoading() {
      return _.get(this.setup, "canLoading")
    },
    //---------------------------------------
    theLoadingAs() {
      return _.get(this.setup, "loadingAs")
    },
    //---------------------------------------
    theArena() {
      return {
        meta    : _.get(this.obj, "meta"),
        comType : this.mainComType || "ti-loading",
        comConf : this.mainComConf || {}
      }
    },
    //---------------------------------------
    theLayout() {
      if(_.isEmpty(this.layout))
        return {}
      let lay = this.layout[this.viewportMode]
      // Refer onece
      if(_.isString(lay)) {
        lay = this.layout[lay]
      }
      // Refer twice (I think it is enough for most of cases)
      if(_.isString(lay)) {
        lay = this.layout[lay]
      }
      return Ti.Util.explainObj(this, lay)
    },
    //---------------------------------------
    theSchema() {
      return Ti.Util.explainObj(this, this.schema)
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    async invoke(fnName) {
      //console.log("invoke ", fnName)
      let fn = _.get(this.schema.methods, fnName)
      // Invoke the method
      if(_.isFunction(fn)) {
        return await fn.apply(this, [])
      }
      // Throw the error
      else {
        throw Ti.Err.make("e.WnManager.invoke.NoFunction", fnName)
      }
    },
    //--------------------------------------
    doChangeShown(newShown={}) {
      let ShownSet = _.get(this.setup, "shown")
      if(_.isPlainObject(showns)) {
        ShownSet[this.viewportMode] = _.assign({}, this.theShown, newShown)
      }
    },
    //--------------------------------------
    showBlock(name) {
      this.doChangeShown({[name]:true})
    },
    //--------------------------------------
    hideBlock(name) {
      this.doChangeShown({[name]:false})
    },
    //--------------------------------------
    changeTabsShown(tabs={}) {
      this.doChangeShown(tabs)
    },
    //--------------------------------------
    toggleBlockShown(name) {
      this.doChangeShown({[name]:!this.theShown[name]})
    },
    //--------------------------------------
    async onBlockEvent(be={}) {
      let evKey = _.concat(be.block, be.name).join(".")
      //console.log("wn-manager:onBlockEvent",evKey, be)
      // Find Event Handler
      let FnSet = {
        // sidebar or title
        "item:actived" : async (it)=>{
          await this.openView(it.id || it.path || it.value)
        },
        // For uinfo
        "do:logout" : async ()=>{
          await this.doLogout()
        },
        "arena.open" : async (o)=>{
          await this.openView(o.id)
        },
        "arena.changed" : ()=>{
          this.notifyChange(...be.args)
        },
        "arena.actions:updated" : (actions)=>{
          this.updateActions(actions)
        }
      }

      let fn = FnSet[evKey] || FnSet[be.name]

      // Invoke Event Handler
      if(_.isFunction(fn)) {
        await fn(...be.args)
      }
    },
    //--------------------------------------
    updateActions(actions) {
      if(_.isArray(actions)) {
        Ti.App(this).commit("setActions", actions)
      }
    },
    //--------------------------------------
    notifyChange(data) {
      Ti.App(this).dispatch("main/onChanged", data);
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
      Ti.App(this).dispatch("reloadMain", ph)
    },
    //--------------------------------------
    async doLogout() {
      await Wn.Sys.exec("exit")
      Ti.Be.Open("/", {target:"_self", delay:0})
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted : function(){
    //......................................
    // Watch the browser "Forward/Backward"
    window.onpopstate = ({state})=>{
      Ti.App(this).dispatch("reloadMain", state)
    }
    //......................................
    // Protected loading
    Ti.Fuse.getOrCreate().add({
      key : "wn-manager-view-opening",
      everythingOk : ()=>{
        return !this.loading
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wnm-view-opening", "warn")
      }
    })
    //......................................
  },
  ///////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-manager-view-opening")
  }
  ///////////////////////////////////////////
}