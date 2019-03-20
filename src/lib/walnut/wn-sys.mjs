// Ti required(Ti.Icons)
// Ti required(Ti.Http)
const DFT_MACRO_OBJ_SEP = "%%wn.meta." + Ti.Random.str(10) + "%%"
//---------------------------------------
export const WnSys = {
  exec(cmdText, {
    input = "",
    appName = Ti.GetAppName(),
    changed  = _.identity,
    eachLine = _.identity,
    mime = "text/plain",
    responseTextAs = "text",
    macroObjSep = DFT_MACRO_OBJ_SEP,
    PWD = Ti.Env("PWD")
  }={}) {
    let url = `/a/run/${appName}`
    let postData = {
      "mos"  : macroObjSep,
      "PWD"  : PWD,
      "cmd"  : cmdText,
      "in"   : input,
      "mime" : mime
    }
  }
}