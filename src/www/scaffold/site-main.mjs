export default {
  /////////////////////////////////////////
  computed : {
    ...Vuex.mapState({
        "logo"       : state=>state.logo,
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
      if(!page || !page.layout) {
        return {}
      }
      // Gen the GUI object
      let gui = {
        schema : {},
        adjustable : false,
        border     : false,
        canLoading : true
      }
      // Get layout be pageMode
      let mode = this.viewportMode
      let layout = page.layout[mode]
      // Refer once
      if(_.isString(layout)) {
        layout = page.layout[layout]
      }
      // Refer twice
      if(_.isString(layout)) {
        layout = page.layout[layout]
      }
      // merge layout to gui
      if(layout) {
        _.assign(gui, layout)
      }
      // assign schema
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
    // Page changd, update document title
    "page.finger" : function() {
      document.title = this.page.title
      // TODO : Maybe here to embed the BaiDu Tongji Code
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
  },
  /////////////////////////////////////////
  mounted : function(){
    // Watch the browser "Forward/Backward"
    // The state(page) pushed by $store.dispath("navTo")
    window.onpopstate = ({state})=>{
      let page = state
      console.log("window.onpopstate", page)
      let app = Ti.App(this)
      app.dispatch("navTo", {
        type   : "page",
        value  : page.path,
        params : page.params,
        anchor : page.anchor
      })
    }
  }
  /////////////////////////////////////////
}