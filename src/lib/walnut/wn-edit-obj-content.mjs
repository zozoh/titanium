////////////////////////////////////////////////////
async function EditObjContent(pathOrObj = "~", {
  title, icon, type = "info", closer = true,
  // undefined is auto, null is hidden
  // if auto, 'i18n:save' for saveBy, else 'i18n:ok'
  textOk = undefined,
  textCancel = "i18n:cancel",
  position = "top",
  width = "80%", height = "96%", spacing,
  readonly = false,
  showEditorTitle = true,
  content,
  placeholder = "i18n:blank",
  autoSave
} = {}) {
  //............................................
  // Load meta
  let meta = pathOrObj
  if (_.isString(meta)) {
    meta = await Wn.Io.loadMeta(pathOrObj)
  }
  //............................................
  if (_.isUndefined(textOk)) {
    textOk = this.saveBy ? 'i18n:save' : 'i18n:ok'
  }
  //............................................
  autoSave = Ti.Util.fallback(autoSave, Ti.Util.isNil(content))
  //............................................
  // Prepare the dialog configration
  let theIcon = icon || Wn.Util.getObjIcon(meta, "zmdi-receipt")
  let theTitle = title || "i18n:edit"
  let theContent = autoSave
    ? await Wn.Io.loadContent(meta)
    : content;
  //............................................
  let mode = "text"
  if ("application/json" == meta.mime) {
    mode = "json"
  }
  else if ("text/plain" == meta.mime) {
    mode = ({
      "js": "javascript",
      "json": "json"
    })[meta.tp] || "text"
  }
  else {
    let mm = /^text\/(.+)$/.exec(meta.mime)
    if (mm) {
      mode = mm[1]
    }
  }
  //............................................
  let newContent = await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    title: theTitle,
    result: theContent,
    //------------------------------------------
    comType: "TiTextCodeAce",
    comConf: {
      mode,
    },
    //------------------------------------------
    components: ["@com:ti/text/code/ace"]
    //------------------------------------------
  })
  //............................................
  //console.log(`newContent: [${newContent}]`)
  if (autoSave
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