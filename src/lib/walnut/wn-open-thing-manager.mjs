/***
 * Open Modal Dialog to manage a thing set
 */
export async function OpenThingManager(pathOrObj, {
  textOk = "i18n:ok",
  ok = ({result})=>result,
  textCancel = "i18n:close",
  position = "top",
  width="96%", height="96%", spacing,
}={}) {
  if(Ti.Util.isNil(pathOrObj)) {
    return await Ti.Toast.Open("ThingSet path is nil", "warn");
  }

  // Load thing set
  let oTs = await Wn.Io.loadMeta(pathOrObj)
  if(!oTs) {
    return await Ti.Toast.Open(`Fail to found ThingSet: ${pathOrObj}`, "warn");
  }

  // Forbid the auto select
  oTs.th_auto_select = false

  // Load default actions
  let view = await Wn.Sys.exec(`ti views id:${oTs.id} -cqn`, {as:"json"})

  // Open it
  return await Ti.App.Open({
    icon  : 'zmdi-github-alt',
    title : oTs.title || oTs.nm,
    position, width, height: "96%", 
    escape: false,
    topActions: view.actions,
    //------------------------------------------
    textOk, textCancel, ok,
    //------------------------------------------
    modules : {
      current  : "@mod:wn/obj-current",
      main     : "@mod:wn/thing"
    },
    //------------------------------------------
    comType : "wn-thing-manager",
    comConf : {
      "..." : "=Main",
      emitChange: true
    },
    //------------------------------------------
    components: ["@com:wn/thing/manager"],
    //------------------------------------------
    preload: async function(app) {
      app.commit("current/setMeta", oTs)
      await app.dispatch("main/reload", oTs)
    }
  })
}
////////////////////////////////////////////