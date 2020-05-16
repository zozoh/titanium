const _M = {
  ////////////////////////////////////////////
  data: ()=>({
    result : "???"
  }),
  ////////////////////////////////////////////
  props : {
    
  },
  ////////////////////////////////////////////
  computed : {
    //--------------------------------------
    ModalsForTest() {
      return [
        {type: "info",    position : "center", closer: false},
        {type: "warn",    position : "top",    closer: "bottom"},
        {type: "error",   position : "bottom", closer: "top"},
        {type: "success", position : "left",   closer: "right"},
        {type: "track",   position : "right",  closer: "left"},

        {type: "success", position : "left-top"},

        {type: "track",   position : "right-top"},

        {type: "error",   position : "bottom-left"},
        {type: "warn",    position : "bottom-right"},
        
      ]
    },
    //--------------------------------------
    PreStyle() {
      return {
        width: "100%",
        height: "300px",
        overflow: "auto",
        border: "1px solid #CCC"
      }
    }
    //--------------------------------------
  },
  ////////////////////////////////////////////
  methods : {
    //----------------------------------------
    async testAlert(mod={}) {
      let title = `${mod.position}-${mod.type}`
      this.result = await Ti.Alert(title, mod)
    },
    //----------------------------------------
    async testConfirm(mod={}) {
      let title = `${mod.position}-${mod.type}`
      this.result = await Ti.Confirm(title, mod)
    },
    //----------------------------------------
    async testPrompt(mod={}) {
      let title = `${mod.position}-${mod.type}`
      this.result = await Ti.Prompt(title, mod)
    },
    //----------------------------------------
    async testBasicModal(mod={}) {
      let title = `${mod.position}-${mod.type}`
      this.result = await Ti.App.Open(_.assign({
        icon  : 'zmdi-github-alt',
        title : _.upperFirst(_.camelCase(title)),
        clickMaskToClose : true,
        comConf : {
          value : title
        }
      }, mod))
    },
    //----------------------------------------
    async testOpenThingSet(ts) {
      // Open it
      this.result = await Wn.OpenThingManager(ts, {
        textOk:"选择",
        ok: ()=>true
      })

      console.log(this.result)
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
export default _M;