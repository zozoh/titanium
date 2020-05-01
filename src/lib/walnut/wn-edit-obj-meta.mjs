////////////////////////////////////////////////////
export async function EditObjMeta(pathOrObj="~", {
  icon, title, 
  type   = "info", 
  closer = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position   = "top",
  width      = 640,
  height     = "80%", 
  spacing,
  currentTab = 0,
  tabs       = {},
  fixedKeys  = ["thumb"],
  saveKeys   = ["thumb"],  // If the key changed, `cancel` same as `OK`
  autoSave   = true
}={}){
  //............................................
  // Load meta
  let meta = pathOrObj
  if(_.isString(meta)) {
    meta = await Wn.Io.loadMeta(pathOrObj)
  }
  //............................................
  // Fixed key map
  let fixeds = {}
  _.forEach(fixedKeys, k => fixeds[k]=true)
  //............................................
  // Save key map
  let saves = {}
  _.forEach(saveKeys, k => saves[k]=true)
  //............................................
  // Default tabs
  if(_.isEmpty(tabs)) {
    tabs = { 
      basic : [
        "id", "race", "thumb", "nm","ph", "tp", "mime", 
        "width", "height", "len"],
      privilege : ["c","m","g", "md", "pvg"],
      timestamp : ["ct", "lm", "expi"]
    }
  }
  //............................................
  // Eval the form fields
  let myFormFields = []
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
    let fields = Wn.Obj.evalFields(grp.fields, (fld)=>{
      if(fld) {
        // Must show
        let uniqKey = Ti.S.join("-", fld.name)
        if(fixeds[uniqKey]) {
          return fld
        }
        // Depends on value
        let v = _.get(meta, fld.name)
        if(!_.isUndefined(v)) {
          return fld
        }
      }
    })
    
    // Join to group
    if(_.isArray(grp.fields) && !_.isEmpty(grp.fields)) {
      grp.type  = "Group"
      grp.fields = fields
      myFormFields.push(grp)
    }
  });
  //............................................
  let theIcon  = icon  || Wn.Util.getObjIcon(meta, "zmdi-info-outline")
  let theTitle = title || Wn.Util.getObjDisplayName(meta)
  //............................................
  let reo = await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    icon  : theIcon,
    title : theTitle,
    //------------------------------------------
    actions : [{
      text: textOk,
      handler : ({$main})=>_.cloneDeep({
        updates : $main.updates,
        data : $main.meta
      })
    }, {
      text: textCancel,
      handler : ({$main})=>{
        // Is in saveKeys
        let ks = _.keys($main.updates)
        for(let k of ks) {
          if(saves[k]) {
            return _.cloneDeep({
              updates : $main.updates,
              data : $main.meta
            })
          }
        }
        // Nothing be updated, just return undefined
      }
    }],
    //------------------------------------------
    comType : "modal-inner-body",
    //------------------------------------------
    components : [{
      name : "modal-inner-body",
      globally : false,
      data : {
        myFormFields,
        currentTab, 
        meta,
        updates : {}
      },
      template : `<ti-form
        mode="tab"
        :current-tab="currentTab"
        :fields="myFormFields"
        :data="meta"
        @field:change="onFieldChange"
        @change="onChange"
        />`,
      methods : {
        onChange(data){
          this.meta = data
        },
        onFieldChange({name, value}={}) {
          let obj = Ti.Types.toObjByPair({name, value})
          this.updates = _.assign({}, this.updates, obj)
        }
      }
    }, "@com:ti/form", "@com:wn/imgfile"]
    //------------------------------------------
  })
  //............................................
  // User cancel
  if(!reo) {
    return
  }
  //............................................
  let {updates} = reo
  let saved = false
  if(autoSave &&!_.isEmpty(updates)) {
    let json = JSON.stringify(updates)
    let cmdText = `obj 'id:${meta.id}' -ocqn -u`
    let newMeta = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})
    await Ti.Toast.Open("i18n:save-done", "success")
    saved = true

    return {updates, data:newMeta, saved}
  }
  //............................................
  return reo
}
////////////////////////////////////////////////////