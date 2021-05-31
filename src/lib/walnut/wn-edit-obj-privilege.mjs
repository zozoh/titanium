////////////////////////////////////////////////////
async function EditObjPrivilege(pathOrObj="~", {
  icon = "fas-user-lock",  
  title = "i18n:wn-key-pvg", 
  type   = "info", 
  closer = true,
  escape = true,
  position   = "top",
  width      = "80%",
  minWidth   = 720,
  height     = "95%", 
  autoSave   = true
}={}){
  //............................................
  // Load meta
  let meta = pathOrObj
  if(_.isString(meta)) {
    meta = await Wn.Io.loadMeta(pathOrObj)
  }
  //............................................
  let theTitle = Ti.I18n.text(title) + " : " + (meta.title||meta.nm)
  //............................................
  let pvg = await Ti.App.Open({
    //------------------------------------------
    type, width, height, position, closer, escape,
    icon, 
    title : theTitle,
    result : meta.pvg,
    comType : "WnObjPrivilege", 
    components : ["@com:wn/obj/privilege"]
    //------------------------------------------
  })
  //............................................
  // User cancel
  if(!pvg || _.isEqual(meta.pvg, pvg)) {
    return
  }
  //............................................
  if(autoSave) {
    let input = _.isEmpty(pvg)
      ? {"!pvg":true}
      : {pvg};
    let json = JSON.stringify(input)
    let cmdText = `o 'id:${meta.id}' @update @json -cqn`
    let newMeta = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})
    await Ti.Toast.Open("i18n:save-done", "success")
    return newMeta
  }
  // Just update obj
  else {
    meta.pvg = pvg
  }
  //............................................
  return meta
}
////////////////////////////////////////////////////
export default EditObjPrivilege;