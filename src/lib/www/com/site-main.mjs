export default {
  /////////////////////////////////////////
  computed : {
    ...Vuex.mapState({
        "siteId"     : state=>state.siteId,
        "logo"       : state=>state.logo,
        "utils"      : state=>state.utils,
        "page"       : state=>state.page,
        "auth"       : state=>state.auth,
        "base"       : state=>state.base,
        "apiBase"    : state=>state.apiBase,
        "captcha"    : state=>state.captcha,
        "schema"     : state=>state.schema,
        "blocks"     : state=>state.blocks,
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
      if(this.logo && /\.(png|jpe?g)$/.test(this.logo))
        return this.getUrl(this.logo)
      return this.logo || "zmdi-globe"
    },
    //-------------------------------------
    // Page Navigation
    siteNavigation() {
      return Ti.WWW.explainNavigation(this.$store.state.nav, this.base)
    },
    //-------------------------------------
    pageNavigation() {
      let links = this.siteNavigation
      for(let li of links) {
        if(li.highlightBy(this.page.path)) {
          return Ti.WWW.explainNavigation(li.children||[], this.base)
        }
      }
      return []
    },
    //-------------------------------------
    // The template of captcha to prevent robot
    siteCaptcha() {
      let path = Ti.S.renderBy(this.captcha, {site:this.siteId})
      if(path.startsWith("/"))
        return path
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
    pageFnSet() {
      return _.assign({}, Ti.Types, this.utils)
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
      // Apply "@BLOCK(xxx)" in panels and layout blocks
      if(layout) {
        // Define the methods
        const ExplainBlock = (anyValue)=>{
          // String : Check the "@BLOCK(xxx)" 
          if(_.isString(anyValue)) {
            let m = /^@BLOCK\(([^ ]+)\)$/.exec(anyValue)
            if(m) {
              let blockName = m[1]
              return _.get(this.blocks, blockName)
            }
          }
          // Array 
          else if(_.isArray(anyValue)) {
            return _.map(anyValue, ExplainBlock)  
          }
          // Object
          else if(_.isPlainObject(anyValue)) {
            return _.mapValues(anyValue, ExplainBlock)
          }
          // Others return directly
          return anyValue
        }
        // do without layout
        layout = ExplainBlock(layout)
      }
      //.....................................
      // merge layout to gui
      _.assign(gui, layout)

      // Empty GUI ...
      if(!gui.body && _.isEmpty(gui.blocks)) {
        return gui
      }
      
      //.....................................
      // assign schema
      _.assign(gui.schema, this.schema, page.schema)
      
      //.....................................
      // format it
      let formedGUI = Ti.Util.explainObj(this, gui, {
        fnSet: this.pageFnSet
      })
      //console.log("pageGUI", formedGUI)
      return formedGUI
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
      //console.log("isReady", old, "->", current)
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
    async invokeAction(name, args=[]) {
      /*
      The action should like
      {
        action : "xx/xx",
        payload : {} | [] | ...
      } 
      */
      let act = _.cloneDeep(this.actions[name])
      if(!act)
        return;
  
      // Prepare
      let app = Ti.App(this)

      // Batch call
      if(_.isArray(act)) {
        for(let a of act) {
          await app.dispatch("doAction", {
            action  : a.action,
            payload : a.payload,
            args
          })
        }
      }
      // Direct call : String
      else if(_.isString(act)) {
        await app.dispatch("doAction", {
          action: act,
          args
        })
      }
      // Direct call : Object
      else {
        await app.dispatch("doAction", {
          action  : act.action,
          payload : act.payload,
          args
        })
      }
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