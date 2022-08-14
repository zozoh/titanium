/***
 * Open Modal Dialog to explore one or multi files
 */
async function OpenObjTree(pathOrObj = "~", {
  title = "i18n:select",
  icon = "zmdi-gamepad",
  type = "info", closer = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position = "top",
  width = 640, height = "90%", spacing,
  multi = false,
  exposeHidden = false,
  treeDisplay,
  homePath = Wn.Session.getHomePath(),
  fallbackPath = Wn.Session.getHomePath(),
  objMatch = {
    race: "DIR"
  },
  leafBy,
  objSort,
  objFilter
} = {}) {
  //................................................
  let oHome = await Wn.Io.loadMeta(homePath, { loadPath: true })
  //................................................
  // Load the target object
  let meta = pathOrObj;
  // String as path
  if (_.isString(pathOrObj)) {
    meta = await Wn.Io.loadMeta(pathOrObj, { loadPath: true })
  }
  // Without path
  else if (meta && meta.id && !meta.ph) {
    meta = await Wn.Io.loadMetaById(meta.id, { loadPath: true })
  }
  // Fallback
  if (!meta && fallbackPath && pathOrObj != fallbackPath) {
    meta = await Wn.Io.loadMeta(fallbackPath)
  }
  // Fail to load
  if (!meta) {
    return await Ti.Toast.Open({
      content: "i18n:e-io-obj-noexistsf",
      vars: _.isString(pathOrObj)
        ? { ph: pathOrObj, nm: Ti.Util.getFileName(pathOrObj) }
        : pathOrObj.ph
    }, "warn")
  }
  //................................................
  // Make sure the obj is dir
  if ("DIR" != meta.race) {
    meta = await Wn.Io.loadMetaById(meta.pid)
    if (!meta) {
      return await Ti.Toast.Open({
        content: "i18n:e-io-obj-noexistsf",
        vars: {
          ph: `Parent of id:${meta.id}->pid:${meta.pid}`,
          nm: `Parent of id:${meta.nm}->pid:${meta.pid}`,
        }
      }, "warn")
    }
  }
  //................................................
  let oP = meta
  let aph = Wn.Io.getFormedPath(oP);
  if (aph.startsWith("~/")) {
    aph = aph.substring(2);
  }
  let phs = Ti.Util.splitPathToFullAncestorList(aph)
  //................................................
  // Open modal dialog
  let reo = await Ti.App.Open({
    //..............................................
    type, width, height, spacing, position, closer,
    icon, title, textOk, textCancel,
    //..............................................
    model: { event: "select" },
    //..............................................
    comType: "WnObjTree",
    comConf: {
      meta: oHome,
      showRoot: false,
      multi,
      display: treeDisplay,
      currentId: oP.id,
      openedNodePath: phs,
      objMatch,
      leafBy,
      sortBy: objSort,
      objFilter: objFilter || function (obj) {
        // Hidden file
        if (!exposeHidden && /^\./.test(obj.nm)) {
          return false
        }
        return true
      }
    },
    components: ["@com:wn/obj/tree"]
  })
  //................................................
  if (!reo || _.isEmpty(reo.selected)) {
    return
  }
  //................................................
  // End of OpenObjTree
  if (multi) {
    return reo.selected
  }
  return reo.current
}
////////////////////////////////////////////
export default OpenObjTree;