/***
 * Open Modal Dialog to explore one or multi files
 */
async function OpenCmdPanel(cmdText, {
  title = "i18n:run",
  icon = "fas-running",
  type = "info", closer = true,
  textCancel = "i18n:close",
  position = "top",
  width = "80%", height = "90%", spacing,
  vars,
  input,
  forceFlushBuffer, 
  showRunTip, showTailRunTip,
  cmdTipText,
  cmdTipIcon,
  onBodyReady,
  afterRunCommand,
  whenSuccess,
  whenError,
  beforeClosed
} = {}) {
  //................................................
  // Open modal dialog
  await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    icon, title, textCancel,
    textOk: null,
    //------------------------------------------
    model: null,
    //------------------------------------------
    ready: (app) => {
      if (_.isFunction(onBodyReady)) {
        onBodyReady(app)
      }
    },
    //------------------------------------------
    beforeClosed,
    //------------------------------------------
    comType: "WnCmdPanel",
    comConf: {
      "value": cmdText,
      "tipText": cmdTipText,
      "tipIcon": cmdTipIcon,
      vars, input, forceFlushBuffer,
      showRunTip, showTailRunTip,
      afterRunCommand,
      whenSuccess,
      whenError
    },
    //------------------------------------------
    components: ["@com:wn/cmd/panel"]
    //------------------------------------------
  })
}
////////////////////////////////////////////
export default OpenCmdPanel;