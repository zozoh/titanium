export default {
  /////////////////////////////////////////
  computed : {
    ...Vuex.mapState({
        "siteId"     : state=>state.siteId,
        "logo"       : state=>state.logo,
        "page"       : state=>state.page,
        "auth"       : state=>state.auth,
        "base"       : state=>state.base,
        "apiBase"    : state=>state.apiBase,
        "captcha"    : state=>state.captcha,
        "loading"    : state=>state.loading,
        "isReady"    : state=>state.isReady
      }),
    //-------------------------------------
    // Mapp The Getters
    ...Vuex.mapGetters([
      "actions",
      "getUrl",
      "getApiUrl"
    ]),
    //-------------------------------------
    siteLogo() {
      return this.getUrl(this.logo)
    },
    //-------------------------------------
    // Page Navigation
    navigation() {
      // TODO check the page overriding
      return this.$store.state.nav
    },
    //-------------------------------------
    // The template of captcha to prevent robot
    siteCaptcha() {
      let path = Ti.S.renderBy(this.captcha, {site:this.siteId})
      return this.getApiUrl(path)
    },
    //-------------------------------------
    siteLoginMode() {
      // Already login, then bind the phone 
      if(this.auth.me) {
        return "bind_phone"
      }
      return "login_by_passwd"
    },
    //-------------------------------------
    // Format current pageGUI
    pageGUI() {
      //console.log("formatedPageGUI")
      let page = this.page
      //.....................................
      // Without current page
      if(!page || !page.layout) {
        return {}
      }
      //.....................................
      // Gen the GUI object
      let gui = {
        schema : {},
        adjustable : false,
        border     : false,
        canLoading : true
      }
      //.....................................
      // Get layout be pageMode
      let mode = this.viewportMode
      let layout = page.layout[mode]
      //.....................................
      // Yes, I know that refer twice may clumsy,
      // but it was the most simple way I can find to deal with infinity.
      // Image the case: desktop=phone + phone=desktop
      // Thrown an Error in browser after all, better then make it crashed responseless
      // TODO: Maybe later, we will add some smart Error thrown here
      //.....................................
      // Refer once
      if(_.isString(layout)) {
        layout = page.layout[layout]
      }
      // Refer twice
      if(_.isString(layout)) {
        layout = page.layout[layout]
      }
      //.....................................
      // merge layout to gui
      if(layout) {
        _.assign(gui, layout)
      }
      //.....................................
      // assign schema
      if(page.schema) {
        _.assign(gui.schema, page.schema)
      }
      //console.log(gui)
      //.....................................
      // format it
      return Ti.Util.explainObj(this, gui)
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  watch : {
    // Page changd, update document title
    "page.finger" : function() {
      document.title = this.page.title
      // TODO : Maybe here to embed the BaiDu Tongji Code
    },
    "isReady" : function(current, old) {
      console.log("isReady", old, "->", current)
      if(true === current && false === old) {
        this.invokeAction("@page:ready", {

        })
      }
    }
  },
  /////////////////////////////////////////
  methods : {
    //--------------------------------------
    async showBlock(name) {
      Ti.App(this).dispatch("page/showBlock", name)
    },
    //--------------------------------------
    async hideBlock(name) {
      Ti.App(this).dispatch("page/hideBlock", name)
    },
    //-------------------------------------
    async onBlockEvent(be={}) {
      console.log("site-main::onBlockEvent", be)
      //....................................
      // It will routing the event to action
      // by site.actions|page.actions mapping
      let name = _.without([be.block, be.name], null).join(".")
      await this.invokeAction(name, be.args)
    },
    //-------------------------------------
    async invokeAction(name, theArgs=[]) {
      let dist = _.cloneDeep(this.actions[name])
      if(!dist)
        return;
      //....................................
      let args = theArgs;
      if(_.isArray(args) && args.length == 1) {
        args = args[0]
      }
      //....................................
      if(_.isString(dist)) {
        dist = {action : dist}
      }
      //....................................
      // apply args
      if(_.isUndefined(dist.payload) || _.isNull(dist.payload)) {
        dist.payload = args
      }
      // Add args
      else if(_.isPlainObject(dist.payload)) {
        dist.payload.args = args
      } 
      // Join the args
      else if(_.isArray(dist.payload) && theArgs.length>0){
        dist.payload = [].concat(dist.payload, args)
      }
      //....................................
      console.log("invoke->", dist)
      let app = Ti.App(this)
      await app.dispatch(dist.action, dist.payload)
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