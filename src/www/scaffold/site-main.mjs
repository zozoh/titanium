export default {
  /////////////////////////////////////////
  computed : {
    //-------------------------------------
    // Mapp The Getters
    ...Vuex.mapGetters([
      "siteBase",
      "navigation",
      "actions",
      "pageGUI"
    ]),
    //-------------------------------------
    // Format current pageGUI
    formatedPageGUI() {
      console.log("haha")
      let gui = this.pageGUI
      let fui = this.__format_obj(gui)
      _.assign(fui, {
        "adjustable" : false,
        "border"     : false,
        "canLoading" : true
      })
      return fui
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //-------------------------------------
    __format_obj(obj){
      console.log("format obj", obj)
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
      app.dispatch("showPageBlock", name)
    },
    //--------------------------------------
    async hideBlock(name) {
      let app = Ti.App(this)
      app.dispatch("hidePageBlock", name)
    },
    //-------------------------------------
    async onBlockEvent(be={}) {
      console.log("site-main::onBlockEvent", be)
      //....................................
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