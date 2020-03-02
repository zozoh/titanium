////////////////////////////////////////////////////
export async function EditObjMeta(pathOrObj="~", {
  title, icon, type = "info", closer = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position = "top",
  width=640, height="80%", spacing,
  currentTab=0,
  tabs={}}={}){
  //............................................
  // Load meta
  let meta = pathOrObj
  if(_.isString(meta)) {
    meta = await Wn.Io.loadMeta(pathOrObj)
  }
  //............................................
  // Default tabs
  if(_.isEmpty(tabs)) {
    tabs = { 
      basic : ["id", "race", "nm","ph", "tp", "mime", "ct", "lm", "expi"],
      privilege : ["c","m","g", "md", "pvg"]
    }
  }
  //............................................
  // Eval the form config
  let config = {
    fields:[]
  }
  _.forEach(tabs, (tab, key)=>{
    let grp = tab
    // Default use the key as group title
    if(_.isArray(tab)) {
      grp = {
        title  : Wn.Obj.getGroupTitle(key),
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
  //............................................
  let theIcon  = icon  || Wn.Util.getObjIcon(meta, "zmdi-info-outline")
  let theTitle = title || Wn.Util.getObjDisplayName(meta)
  //............................................
  let updateMeta = await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    icon  : theIcon,
    title : theTitle,
    actions : [{
      text: textOk,
      handler : ({$main})=>_.cloneDeep($main.updates)
    }, {
      text: textCancel,
      handler : ()=>undefined
    }],
    //------------------------------------------
    comType : "modal-inner-body",
    //------------------------------------------
    components : [{
      name : "modal-inner-body",
      globally : false,
      data : {
        currentTab, config, meta,
        updates : {}
      },
      template : `<wn-form
        display="tab"
        :current-tab="currentTab"
        :config="config"
        :data="theData"
        @changed="onFieldChanged"
        />`,
      computed : {
        theData() {
          return _.assign({}, this.meta, this.updates)
        }
      },
      methods : {
        onFieldChanged({name, value}={}) {
          let obj = Ti.Types.toObjByPair({name, value})
          this.updates = _.assign({}, this.updates, obj)
        }
      }
    }, "@com:wn/form"]
    //------------------------------------------
  })
  //............................................
  if(!_.isEmpty(updateMeta)) {
    let json = JSON.stringify(updateMeta)
    let cmdText = `obj 'id:${meta.id}' -ocqn -u`
    let newMeta = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})
    await Ti.Toast.Open("i18n:save-done", "success")

    return newMeta
  }
  //............................................
}
////////////////////////////////////////////////////