export default {
  ///////////////////////////////////////////
  computed : {
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
      if(this.obj) {
        let objList = _.concat(this.obj.ancestors, this.obj.meta)
        _.forEach(objList, (an)=>{
          if(_.isPlainObject(an)) {
            let isCurrent = an.id == this.obj.meta.id
            let icon = Wn.Util.getIconObj(an)
            if(icon && icon.value == this.theLogo) {
              icon = null
            }
            list.push({
              icon,
              text  : Wn.Util.getObjDisplayName(an),
              value : an.id,
              href  : isCurrent ? null : Wn.Util.getAppLink(an) + ""
            })
          }
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
        meta : _.get(this.obj, "meta")
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
    onBlockEvent(be={}) {
      console.log("wn-manager::BlockEvent", be)
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted : function(){
    let vm = this
    // Watch the browser "Forward/Backward"
    // window.onpopstate = function({state}){
    //   vm.$store.dispatch("reloadMain", state)
    // }
    // Protected loading
    Ti.Fuse.getOrCreate().add({
      key : "wn-manager-view-opening",
      everythingOk : ()=>{
        return !vm.isLoading
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wnm-view-opening", "warn")
      }
    })
  },
  ///////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-manager-view-opening")
  }
  ///////////////////////////////////////////
}