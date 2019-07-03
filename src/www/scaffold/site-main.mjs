export default {
  /////////////////////////////////////////
  computed : {
    ...Vuex.mapState({
        "page"       : state=>state.page,
        "base"       : state=>state.base,
        "loading"    : state=>state.loading,
        "navigation" : state=>state.nav
      }),
    //-------------------------------------
    // Mapp The Getters
    ...Vuex.mapGetters([
      "actions"
    ]),
    //-------------------------------------
    // Format current pageGUI
    pageGUI() {
      console.log("formatedPageGUI")
      let page = this.page
      // Without current page
      if(!page) {
        return {}
      }
      // Gen the GUI object
      let gui = {
        schema : {},
        adjustable : false,
        border     : false,
        canLoading : true
      }
      // Add layout
      if(page.layout) {
        _.assign(gui, page.layout)
      }
      // Schema
      if(page.schema) {
        _.assign(gui.schema, page.schema)
      }
      // format it
      let fui = this.__format_obj(gui)
      return fui
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  watch : {
    // PageChangd, Then push the history
    "page.finger" : function() {
      console.log("page changed to", this.page.path)
    }
  },
  /////////////////////////////////////////
  methods : {
    //-------------------------------------
    __format_obj(obj){
      //console.log("format obj", obj)
      // Array
      if(_.isArray(obj)) {
        let list = []
        for(let val of obj) {
          list.push(this.__format_obj(val))
        }
        return list
      }
      // Plain Object
      if(_.isPlainObject(obj)) {
        let o2 = {}
        _.forEach(obj, (v2, k2)=>{
          o2[k2] = this.__format_obj(v2)
        })
        return o2
      }
      // String: @xx.xx
      if(_.isString(obj)) {
        let m = /^=(.+)$/.exec(obj)
        if(m) {
          return _.get(this, m[1])
        }
      }
      // Others
      return obj
    },
    //--------------------------------------
    async showBlock(name) {
      let app = Ti.App(this)
      app.dispatch("page/showBlock", name)
    },
    //--------------------------------------
    async hideBlock(name) {
      let app = Ti.App(this)
      app.dispatch("page/hideBlock", name)
    },
    //-------------------------------------
    async onBlockEvent(be={}) {
      console.log("site-main::onBlockEvent", be)
      //....................................
      // It will routing the event to action
      // by site.actions|page.actions mapping
      let name = _.without([be.block, be.name], null).join(".")
      let dist = this.actions[name]
      if(!dist)
        return
      //....................................
      console.log("invoke->", dist)
      let app = Ti.App(this)
      await app.dispatch(dist, ...be.args)
    }
    //-------------------------------------
  }
  /////////////////////////////////////////
}