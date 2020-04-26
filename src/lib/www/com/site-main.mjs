export default {
  /////////////////////////////////////////
  computed : {
    ...Vuex.mapState({
        "siteId"     : state=>state.siteId,
        "logo"       : state=>state.logo,
        "utils"      : state=>state.utils,
        "page"       : state=>state.page,
        "auth"       : state=>state.auth,
        "domain"     : state=>state.domain,
        "base"       : state=>state.base,
        "apiBase"    : state=>state.apiBase,
        "cdnBase"    : state=>state.cdnBase,
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
      Ti.AddGlobalFuncs(this.utils)
      return Ti.GlobalFuncs()
    },
    //-------------------------------------
    // Format current pageGUI
    PageGUI() {
      let page = this.page
      //.....................................
      // Without current page
      if(!page || !page.layout) {
        return {}
      }
      //.....................................
      // Get layout be pageMode
      let layout = page.layout
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
      // Gen the GUI object
      let gui = {
        defaultFlex: "none",
        layout, 
        schema : {},
        canLoading : true
      }
     
      //.....................................
      // assign schema
      _.assign(gui.schema, this.schema, page.schema)
      
      //.....................................
      // explain it
      let theGUI = Ti.Util.explainObj(this, gui, {
        fnSet: this.pageFnSet
      })
      //console.log("pageGUI", formedGUI)
      return theGUI
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
    __on_events(name, ...args) {
      console.log("site-main.__on_events", name, ...args)
      // ShowBlock
      if("block:show" == name) {
        return blockName => this.showBlock(blockName)
      }
      // HideBlock
      else if("block:hide" == name) {
        return blockName => this.hideBlock(blockName)
      }
      // Dispatch actions
      else {
        return (...args)=>{
          this.invokeAction(name, args)
        }        
      }
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
      let AT = _.get(this.actions, name)

      // Try fallback
      if(!AT) {
        let canNames = _.split(name, "::")
        while(canNames.length > 1) {
          let [, ...names] = canNames
          let aName = names.join("::")
          AT = _.get(this.actions, aName)
          if(AT){
            break
          }
          canNames = names
        }
      }

      if(!AT)
        return;
  
      // Prepare
      let app = Ti.App(this)

      // Batch call
      if(_.isArray(AT)) {
        for(let a of AT) {
          await app.dispatch("doAction", {
            action  : a.action,
            payload : a.payload,
            args
          })
        }
      }
      // Direct call : String
      else if(_.isString(AT)) {
        await app.dispatch("doAction", {
          action: AT,
          args
        })
      }
      // Direct call : Object
      else {
        await app.dispatch("doAction", {
          action  : AT.action,
          payload : AT.payload,
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
    window.onpopstate = (evt)=>{
      let page = evt.state
      if(page && page.path) {
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
  }
  /////////////////////////////////////////
}