/***
 * Open Modal Dialog to explore one or multi files
 */
async function OpenCmdPanel(cmdText, {
  title = "i18n:run", 
  icon = "fas-running",
  type = "info", closer = true,
  textCancel = "i18n:close",
  position = "top",
  width="80%", height="90%", spacing,
  vars
}={}){
  //................................................
  // Open modal dialog
  await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    icon, title, textCancel,
    textOk: null,
    //------------------------------------------
    model : null,
    //------------------------------------------
    comType : "WnCmdPanel",
    comConf : {
      "value" : cmdText,
      "vars"  : vars
    },
    //------------------------------------------
    components : ["@com:wn/cmd/panel"]
    //------------------------------------------
  })
}
////////////////////////////////////////////
export default OpenCmdPanel;