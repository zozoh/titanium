////////////////////////////////////////////////////
export async function EditObjMeta(pathOrObj="~", {
  title = "i18n:info", 
  icon  = "zmdi-info",
  type  = "info",
  className,
  closer = true,
  textOk = "i18n:ok",
  width=640, height="80%",
  currentTab=0,
  tabs={}}={}){
  //................................................
  // Default tabs
  if(_.isEmpty(tabs)) {
    tabs = { 
      basic : ["id", "race", "nm","ph", "tp", "mime", "ct", "lm", "expi"],
      privilege : ["c","m","g", "md", "pvg"]
    }
  }
  //................................................
  // Eval the form config
  let config = {
    fields:[]
  }
  _.forEach(tabs, (tab, key)=>{
    let grp = tab
    // Default use the key as group title
    if(_.isArray(tab)) {
      grp = {
        title  : `i18n:wn-key-grp-${key}`,
        fields : tab
      }
    }
    // Eval the each field
    let fields = Wn.Obj.evalFields(grp.fields)
    
    // Join to group
    grp.type  = "Group"
    grp.fields = fields
    config.fields.push(grp)
  });
  //................................................
  // Prepare the DOM
  let html = `<wn-form 
    class="ti-fill-parent"
    display="tab"
    :current-tab="currentTab"
    :config="config"
    :data="meta"
    :fieldStatus="fieldStatus"
    @changed="onFieldChanged"/>`
  //................................................
  // Open modal dialog
  let reObj = await Ti.Modal.Open({
    template : html,
    /////////////////////////////////////////////////
    data : {
      config, currentTab
    },
    /////////////////////////////////////////////////
    store : {
      modules : {
        meta : "@mod:wn/obj-meta"
      }
    },
    /////////////////////////////////////////////////
    computed : {
      ...Vuex.mapState("meta", ["meta", "status", "fieldStatus"])
    },
    /////////////////////////////////////////////////
    methods : {
      async onFieldChanged({name, value}) {
        await Ti.App(this).dispatch("meta/updateMeta", {name, value})
      }
    },
    /////////////////////////////////////////////////
    // Load meta at first
    mounted : async function(){
      Ti.App(this).dispatch("meta/reload", pathOrObj)
    },
    /////////////////////////////////////////////////
    components : ["@com:wn/form"]
    /////////////////////////////////////////////////
  }, {
    icon, title, type, width, height, className, closer,
    actions : [{
      text : textOk,
      handler : ({app})=>{
        return app.$vm().meta
      }
    }]
  })
  //................................................
  return reObj
}
////////////////////////////////////////////////////