import {WnSysRespParsing} from "./wn-sys-resp-parsing.mjs"
////////////////////////////////////////////
const DFT_MACRO_OBJ_SEP = "%%wn.meta." + Ti.Random.str(10) + "%%"
////////////////////////////////////////////
export const WnSys = {
  //-------------------------------------
  async exec(cmdText, {
    vars = {},
    input = "",
    appName = Ti.GetAppName(),
    eachLine = _.identity,
    as = "text",
    macroObjSep = DFT_MACRO_OBJ_SEP,
    autoRunMacro = true,
    errorBy,
    PWD = (Ti.SessionVar("PWD") || "~")
  }={}) {
    // Eval command
    cmdText = Ti.S.renderBy(cmdText, vars)
    // Prepare
    let url = `/a/run/${appName}`
    let params = {
      "mos"  : macroObjSep,
      "PWD"  : PWD,
      "cmd"  : cmdText,
      "in"   : input
    }
    // Prepare analyzer
    let ing = {eachLine, macroObjSep}
    if(autoRunMacro) {
      ing.macro = {
        update_envs : (envs)=>{
          Wn.Session.env(envs)
          Wn.doHook("update_envs", envs)
        }
      }
    }
    let parsing = new WnSysRespParsing(ing)

    // Request remote
    await Ti.Http.send(url, {
      method : "POST", params, as:"text",
      created : ($req)=>{
        parsing.init(()=>$req.responseText)
      }
    }).catch($req=>{
      parsing.isError = true
    }).finally(()=>{
      parsing.done()
    })

    // Get result
    let re = parsing.getResult()
    // Then we got the result
    if(Ti.IsInfo("Wn.Sys")) {
      console.log("Wn.Sys.exec@return", re)
    }

    // Handle error
    if(parsing.isError) {
      let str = re.lines.join("\n")
      let [code, ...datas] = str.split(/ *: */);
      let data = datas.join(" : ")
      let msgKey = code.replace(/[.]/g, "-")
      if(_.isFunction(errorBy)) {
        errorBy({
          code, msgKey, data
        })
      }
      // Just throw it
      else {
        let err = Ti.Err.make(msgKey, data)
        throw err
      }
    }

    // Evaluate the result
    return ({
      raw : ()=> re,
      lines : ()=> re.lines,
      macro : ()=> re.macro,
      text : ()=>{
        return re.lines.join("\n")
      },
      json : ()=>{
        let json = re.lines.join("\n")
        return JSON.parse(json)
      },
      jso : ()=>{
        let json = re.lines.join("\n")
        return eval('('+json+')')
      }
    })[as]()
  },
  //-------------------------------------
  async exec2(cmdText, options={}){
    let errorAs = options.errorAs
    try {
      return await Wn.Sys.exec(cmdText, options)
    }
    // Handle Error
    catch(err) {
      // Report the Error
      if(!_.isUndefined(errorAs)) {
        if(Ti.IsError()) {
          console.error(err)
        }
        await Ti.Alert(err, {
          title : "i18n:warn",
          type : "error"
        })
        return err
      }
      // Return the error
      return errorAs
    }
  },
  //-------------------------------------
  async execJson(cmdText, options={as:"json"}) {
    return await WnSys.exec(cmdText, options)
  },
  //-------------------------------------
  async exec2Json(cmdText, options={as:"json"}) {
    return await WnSys.exec2(cmdText, options)
  }
  //-------------------------------------
}
////////////////////////////////////////////
export default WnSys;