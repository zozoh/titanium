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
  // static tabs
  // if emtpy, apply the default
  // “auto" will load by `ti editmeta`, it will override the currentTab
  fields     = [],
  fixedKeys  = ["thumb"],
  saveKeys   = ["thumb"],  // If the key changed, `cancel` same as `OK`
  autoSave   = true
}={}){
  console.log("hahah")
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
  if(_.isEmpty(fields)) {
    fields = [{ 
      title: "basic",
      fields: [
        "id", "race", "thumb", "nm","ph", "tp", "mime", 
        "width", "height", "len"],
    }, {
      title: "privilege",
      fields: ["c","m","g", "md", "pvg"]
    }, {
      title: "timestamp",
      fields: ["ct", "lm", "expi"]
    }]
  }
  //............................................
  const __join_fields = function(flds=[], outs=[]) {
    _.forEach(flds, fld => {
      let f2;
      let quickName = false
      // Quick Name
      if(_.isString(fld)) {
        quickName = true
        f2 = Wn.Obj.getField(fld)
      }
      // Group
      else if(_.isArray(fld.fields)) {
        f2 = {
          title: Wn.Obj.getGroupTitle(fld.title), 
          type:"Group", 
          fields:[]
        }
        __join_fields(fld.fields, f2.fields)
        if(_.isEmpty(f2.fields)) {
          return
        }
      }
      // Normal field
      else {
        f2 = fld
      }
      //......................................
      // Try join
      // Fixed fields
      let uniqKey = Ti.S.join("-", f2.name)
      if(fixeds[uniqKey]) {
        outs.push(f2)
        return
      }
      // Auto test if join
      let v = _.get(meta, f2.name)
      if(!quickName || !_.isUndefined(v)) {
        outs.push(f2)
      }
    });
  }
  //............................................
  // Eval the form fields
  let myFormFields = []
  __join_fields(fields, myFormFields);
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