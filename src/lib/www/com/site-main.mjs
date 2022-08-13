const _M = {
  /////////////////////////////////////////
  provide: function () {
    let ctx = _.cloneDeep(this.$store.state)
    let { langCase, lang } = ctx
    ctx.lang = _[`${langCase || "snake"}Case`](lang)
    return Ti.Util.explainObj(ctx, this.provide)
  },
  /////////////////////////////////////////
  computed: {
    ...Vuex.mapState({
      "siteId": state => state.siteId,
      "logo": state => state.logo,
      "lang": state => state.lang,
      "formatPageUrl": state => state.formatPageUrl,
      "analyzers": state => state.analyzers,
      "langName": state => state.langName,
      "utils": state => state.utils,
      "page": state => state.page,
      "shop": state => state.shop,
      "auth": state => state.auth,
      "domain": state => state.domain,
      "rs": state => state.rs,
      "nav": state => state.nav,
      "vars": state => state.vars,
      "data": state => state.data,
      "base": state => state.base,
      "apiBase": state => state.apiBase,
      "cdnTmpl": state => state.cdnTmpl,
      "captcha": state => state.captcha,
      "schema": state => state.schema,
      "provide": state => state.provide,
      "blocks": state => state.blocks,
      "loading": state => state.loading,
      "pageReady": state => state.pageReady
    }),
    ...Vuex.mapState("page", [
      "pageUri"
    ]),
    //-------------------------------------
    // Mapp The Getters
    ...Vuex.mapGetters([
      "actions",
      "getUrl",
      "getApiUrl"
    ]),
    ...Vuex.mapGetters("viewport", [
      "isViewportModeDesktop",
      "isViewportModeTablet",
      "isViewportModePhone",
      "isViewportModeDesktopOrTablet",
      "isViewportModePhoneOrTablet"
    ]),
    // ...Vuex.mapState("page", [
    //   "pageUri"
    // ]),
    // ...Vuex.mapGetters("viewport", [
    //   "isViewportModeDesktop",
    //   "isViewportModeTablet",
    //   "isViewportModePhone",
    //   "isViewportModeDesktopOrTablet",
    //   "isViewportModePhoneOrTablet"
    // ]),
    //-------------------------------------
    TopClass() {
      return this.getTopClass({
        "as-phone": this.isViewportModePhone,
        "as-tablet": this.isViewportModeTablet,
        "as-desktop": this.isViewportModeDesktop
      })
    },
    //-------------------------------------
    State() {
      return Ti.App(this).$store().state
    },
    //-------------------------------------
    PayReturnUrl: function () {
      let st = this.$store.state
      if (st.payReturnUrl) {
        return Ti.Util.explainObj(st, st.payReturnUrl)
      }
    },
    //-------------------------------------
    SiteLogo() {
      if (this.logo && /\.(png|jpe?g)$/.test(this.logo))
        return this.getUrl(this.logo)
      return this.logo || "zmdi-globe"
    },
    //-------------------------------------
    // Page Navigation
    // SiteNav() {
    //   let nav = {}
    //   _.forEach(this.$store.state.nav, (v, k)=>{
    //     nav[k] = Ti.WWW.explainNavigation(v, this.base)
    //   })
    //   return nav
    // },
    //-------------------------------------
    // The template of captcha to prevent robot
    SiteCaptcha() {
      let path = Ti.S.renderBy(this.captcha, { site: this.siteId })
      if (path.startsWith("/"))
        return path
      return this.getApiUrl(path)
    },
    //-------------------------------------
    SiteLoginMode() {
      // Already login, then bind the phone 
      if (this.auth.me) {
        return "bind_phone"
      }
      return "login_by_passwd"
    },
    //-------------------------------------
    PageFnSet() {
      Ti.AddGlobalFuncs(this.utils)
      return Ti.GlobalFuncs()
    },
    //-------------------------------------
    GUIContext() {
      return _.assign({
        PayReturnUrl: this.PayReturnUrl,
        SiteLogo: this.SiteLogo,
        SiteCaptcha: this.SiteCaptcha,
        SiteLoginMode: this.SiteLoginMode,
        PageFnSet: this.PageFnSet,
        isViewportModeDesktop: this.isViewportModeDesktop,
        isViewportModeTablet: this.isViewportModeTablet,
        isViewportModePhone: this.isViewportModePhone,
        isViewportModeDesktopOrTablet: this.isViewportModeDesktopOrTablet,
        isViewportModePhoneOrTablet: this.isViewportModePhoneOrTablet
      }, this.State)
    },
    //-------------------------------------
    // Format current pageGUI
    PageGUI() {
      let page = this.page
      //.....................................
      // Without current page
      if (!page || !page.layout) {
        return {}
      }
      //.....................................
      // Get layout be pageMode
      let layout = page.layout
      //.....................................
      // Apply "@BLOCK(xxx)" in panels and layout blocks
      if (layout) {
        // Define the methods
        const ExplainBlock = (anyValue) => {
          // String : Check the "@BLOCK(xxx)" 
          if (_.isString(anyValue)) {
            let m = /^@BLOCK\(([^ ]+)\)$/.exec(anyValue)
            if (m) {
              let blockName = m[1]
              return _.get(this.blocks, blockName)
            }
          }
          // Array 
          else if (_.isArray(anyValue)) {
            return _.map(anyValue, ExplainBlock)
          }
          // Object
          else if (_.isPlainObject(anyValue)) {
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
        className: page.className,
        defaultFlex: "=page.gui.flex?nil",
        defaultOverflow: "=page.gui.overflow?none",
        activeElement: "=page.activeElement",
        layout,
        schema: {},
        canLoading: true
      }

      //.....................................
      // assign schema
      _.assign(gui.schema, this.schema, page.schema)

      //.....................................
      // explain it
      //console.log("site-main: explain it!", gui);
      let theGUI = Ti.Util.explainObj(this.GUIContext, gui, {
        fnSet: this.PageFnSet
      })
      //console.log("pageGUI", formedGUI)
      return theGUI
    },
    //-------------------------------------
    PageShown() {
      let re = Ti.Util.explainObj(this.GUIContext, this.page.shown)
      return re
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnMouseRightClick($evn) {
      // Forbid context menu
      if (false === this.page.contextMenu) {
        $evn.preventDefault();
      }
      // Forbid context menu and show alert
      else if (_.isString(this.page.contextMenu)) {
        $evn.preventDefault();
        Ti.Toast.Open(this.page.contextMenu, "warn");
      }
    },
    //--------------------------------------
    async showBlock(name) {
      Ti.App(this).dispatch("page/showBlock", name)
    },
    //--------------------------------------
    async hideBlock(name) {
      Ti.App(this).dispatch("page/hideBlock", name)
    },
    //-------------------------------------
    // Handle by EventBubble
    __on_events(name, ...args) {
      //console.log("site-main.__on_events", name, ...args)
      // ShowBlock
      if ("block:show" == name) {
        return blockName => this.showBlock(blockName)
      }
      // HideBlock
      else if ("block:hide" == name) {
        return blockName => this.hideBlock(blockName)
      }
      // Dispatch actions
      else {
        return (...args) => {
          this.invokeAction(name, args)
        }
      }
    },
    //-------------------------------------
    async invokeAction(name, args = []) {
      await Ti.App(this).dispatch("invokeAction", {
        name, args
      })
    },
    //-------------------------------------
    pushBrowserHistory(pageTitle) {
      let his = window.history
      //...................................
      if (!his) {
        return
      }
      //...................................
      // Get current location
      let loc = window.location
      let loPath = [loc.pathname, loc.search, loc.hash].join("")
      //...................................
      //let pgLink = this.getUrl(this.pageLink)
      let pgLink = this.pageUri
      //...................................
      if (this.formatPageUrl) {
        let fmtUrl = Ti.Util.genInvoking(this.formatPageUrl)
        if (_.isFunction(fmtUrl)) {
          pgLink = fmtUrl(pgLink, this.page)
        }
      }
      //...................................
      if (loPath != pgLink || !his.state) {
        let pg = _.pick(this.page, "pageUri", "href", "path", "params", "anchor");
        pg = _.cloneDeep(pg)
        //console.log("pg", JSON.stringify(pg))
        // console.log("pageTitle", pageTitle)
        // console.log("pgLink", pgLink)
        his.pushState(pg, pageTitle, pgLink)
      }
      //...................................
    },
    //-------------------------------------
    updateBodyStyle() {
      let bodyStyleSheet = {}
      if (this.page.bodyStyle) {
        bodyStyleSheet = Ti.Util.explainObj(this, this.page.bodyStyle)
      }
      let cssRule = Ti.Css.renderCssStyleSheet(bodyStyleSheet)
      //console.log("cssRule", cssRule)
      // Find the body style rule
      let $style = Ti.Dom.find('style.ti-site-body')
      if (!_.isElement($style)) {
        $style = Ti.Dom.createElement({
          $p: this.$el.ownerDocument.body,
          className: "ti-site-body",
          tagName: "style",
          props: {
            rel: "stylesheet",
            type: "text/css"
          }
        })
      }
      $style.innerHTML = cssRule
    },
    //-------------------------------------
    invokeAnalyzers() {
      // Guard
      if (_.isEmpty(this.analyzers))
        return

      // Clean all
      let $scripts = Ti.Dom.findAll('script[ti-analyzer]')
      for (let $script of $scripts) {
        Ti.Dom.remove($script)
      }

      // Create
      for (let an of this.analyzers) {
        //console.log("an:", an)
        let src = an
        let $script = Ti.Dom.createElement({
          tagName: "script",
          attrs: {
            "ti-analyzer": true
          },
          props: { src }
        })
        Ti.Dom.appendToHead($script)
      }
    }
    //-------------------------------------
  },
  /////////////////////////////////////////
  watch: {
    // Page changd, update document title
    "page.finger": function () {
      //console.log("-> ", this.page.title)
      let pageTitle = Ti.Util.explainObj(this, this.page.title)
      if (!Ti.Util.isNil(pageTitle)) {
        document.title = pageTitle
      }
      this.pushBrowserHistory(pageTitle)

      this.updateBodyStyle()

      // TODO : Maybe here to embed the BaiDu Tongji Code
      this.invokeAnalyzers()
    }
  },
  /////////////////////////////////////////
  mounted: function () {
    // Watch the browser "Forward/Backward"
    // The state(page) pushed by $store.dispath("navTo")
    window.onpopstate = (evt) => {
      let page = evt.state
      //console.log("popstate", page)
      if (page && page.href) {
        //console.log("window.onpopstate", page)
        let app = Ti.App(this)
        app.dispatch("navTo", {
          type: "page",
          value: page.href,
          params: page.params,
          anchor: page.anchor
        })
      }
    }
  }
  /////////////////////////////////////////
}
export default _M;