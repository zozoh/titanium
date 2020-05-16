////////////////////////////////////////////////////
async function EditObjContent(pathOrObj="~", {
  title, icon, type = "info", closer = true,
  // undefined is auto, null is hidden
  // if auto, 'i18n:save' for saveBy, else 'i18n:ok'
  textOk = undefined,  
  textCancel = "i18n:cancel",
  position = "top",
  width=640, height="80%", spacing,
  readonly=false,
  showEditorTitle=true,
  content,
  blankText="i18n:blank"
}={}){
  //............................................
  // Load meta
  let meta = pathOrObj
  if(_.isString(meta)) {
    meta = await Wn.Io.loadMeta(pathOrObj)
  }
  //............................................
  if(_.isUndefined(textOk)) {
    textOk = this.saveBy ? 'i18n:save' : 'i18n:ok'
  }
  //............................................
  let autoSave = Ti.Util.isNil(content)
  //............................................
  let theIcon  = icon  || Wn.Util.getObjIcon(meta, "zmdi-receipt")
  let theTitle = title || "i18n:edit"
  let theContent = autoSave 
                    ? await Wn.Io.loadContent(meta)
                    : content;
  //............................................
  let newContent = await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    title   : theTitle,
    result  : theContent,
    //------------------------------------------
    comType : "ti-text-raw",
    comConf : {
      readonly, blankText,
      icon  : theIcon,
      title : Wn.Util.getObjDisplayName(meta),
      content : theContent,
      showTitle : showEditorTitle,
      ignoreKeyUp : true,
    },
    //------------------------------------------
    components : ["@com:ti/text/raw"]
    //------------------------------------------
  })
  //............................................
  //console.log(`newContent: [${newContent}]`)
  if(autoSave
    && !_.isUndefined(newContent) 
    && newContent != theContent) {
    await Wn.Io.saveContentAsText(meta, newContent)
    await Ti.Toast.Open("i18n:save-done", "success")
  }
  //............................................
  return newContent
}
////////////////////////////////////////////////////
export default EditObjContent;