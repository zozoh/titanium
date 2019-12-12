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
      return Ti.Css.mergeClassName(this.className)
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
      if(this.setup.logo) {
        let list = _.concat(this.setup.logo)
        for(let li of list) {
          // Dynamic get the object icon
          if("<:obj>" == li) {
            let icon = _.get(this.obj, "meta.icon")
            if(icon)
              return icon
          }
          // Get the home obj icon
          else if("<:home>" == li) {
            let icon = _.get(this.objHome, "icon")
            if(icon)
              return icon
          }
          // Then it is the static icon
          else {
            return li
          }
        }
      }
    },
    //---------------------------------------
    theCrumbData() {
      let list = []
      if(this.obj && this.obj.meta) {
        let ans = _.map(this.obj.ancestors)
        // Find the first Index from home
        let firstIndex = 0
        if(this.objHome) {
          for(;firstIndex<ans.length; firstIndex++) {
            let an = ans[firstIndex]
            if(this.objHome.id == an.id) {
              break
            }
          }
        }
        // Show ancestors form Home
        for(let i=firstIndex+1; i<ans.length; i++) {
          let an = ans[i]
          list.push({
            icon  : Wn.Util.getIconObj(an),
            text  : Wn.Util.getObjDisplayName(an),
            value : an.id,
            href  : isCurrent ? null : Wn.Util.getAppLink(an) + ""
          })
        }
        // Show Self
        let self = this.obj.meta
        // Top Item, just show title
        let icon = _.isEmpty(list) ? null : Wn.Util.getIconObj(self)
        list.push({
          icon,
          text  : Wn.Util.getObjDisplayName(self),
          value : self.id,
          href  : null
        })
      }
      return list
    },
    //---------------------------------------
    theCrumb() {
      return  {
        "mode" : "path",
        "removeIcon" : null,
        "statusIcons" : {
          "collapse" : "zmdi-chevron-right",
          "extended" : "zmdi-chevron-down"
        },
        "data" : this.theCrumbData
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
        return Ti.Util.explainObj(this, shown, {
          iteratee : (val)=> val ? true : false
        })
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
      let app = Ti.App(this)
      let evKey = _.concat(be.block, be.name).join("-")
      console.log("wn-manager:onBlockEvent",evKey, be)
      // Find Event Handler
      let fn = ({
        "sidebar-selected" : async (it)=>{
          await this.openView(it.id)
        },
        "title-selected" : async (it)=>{
          await this.openView(it.value)
        },
        "arena-open" : async (o)=>{
          await this.openView(o.id)
        },
        "uinfo-do:logout" : async ()=>{
          await this.doLogout()
        }
      })[evKey]

      // Invoke Event Handler
      if(_.isFunction(fn)) {
        await fn(...be.args)
      }
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
      Ti.App(this).dispatch("reloadMain", `id:${oid}`)
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