// Ti required(Ti.Icons)
// Ti required(Ti.Http)
//---------------------------------------
import {WnSysRespParsing} from "./wn-sys-resp-parsing.mjs"
import Wn from "./walnut.mjs";
//---------------------------------------
const DFT_MACRO_OBJ_SEP = "%%wn.meta." + Ti.Random.str(10) + "%%"
//---------------------------------------
export const WnSys = {
  async exec(cmdText, {
    input = "",
    appName = Ti.GetAppName(),
    eachLine = _.identity,
    as = "text",
    macroObjSep = DFT_MACRO_OBJ_SEP,
    autoRunMacro = true,
    PWD = (Ti.SessionVar("PWD") || "~")
  }={}) {
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
    }).finally(()=>{
      parsing.done()
    })

    // Get result
    let re = parsing.getResult()
    // Then we got the result
    if(Ti.IsInfo("Wn.Sys")) {
      console.log("Wn.Sys.exec@return", re)
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
  }
}