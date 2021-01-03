////////////////////////////////////////////////////
async function EditObjMeta(pathOrObj="~", {
  icon, title, 
  type   = "info", 
  closer = true,
  escape = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position   = "top",
  width      = 640,
  height     = "90%", 
  spacing,
  currentTab = 0,
  // static tabs
  // if emtpy, apply the default
  // “auto" will load by `ti editmeta`, it will override the currentTab
  fields     = [],
  fixedKeys  = ["icon", "thumb", "title"],
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
  // Auto load 
  if("auto" == fields) {
    let reo = await Wn.Sys.exec2(`ti metas id:${meta.id} -cqn`, {as:"json"})
    if(reo) {
      fields = reo.fields
      currentTab = reo.currentTab || currentTab || 0
    }
  }
  //............................................
  // Default tabs
  if(_.isEmpty(fields) || !_.isArray(fields)) {
    fields = [{ 
      title: "basic",
      fields: [
        "id", "nm", "title",  "icon", "thumb","ph", "race", "tp", "mime", 
        "width", "height", "len", "sha1"],
    }, {
      title: "privilege",
      fields: ["c","m","g", "md", "pvg"]
    }, {
      title: "timestamp",
      fields: ["ct", "lm", "expi"]
    }, {
      title: "others",
      fields: ["..."]
    }]
  }
  //............................................
  let myFormFields = Wn.Obj.evalFields(meta, fields, (fld)=>{
    if(fixeds[fld.uniqKey]) {
      return fld
    }
    if(fld.quickName  && _.isUndefined(fld.value)) {
      return
    }
    return fld
  })
  //............................................
  let theIcon  = icon  || Wn.Util.getObjIcon(meta, "zmdi-info-outline")
  let theTitle = title || Wn.Util.getObjDisplayName(meta)
  //............................................
  let reo = await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer, escape,
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
export default EditObjMeta;