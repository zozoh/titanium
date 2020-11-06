import WnSysRespParsing from "./wn-sys-resp-parsing.mjs";
////////////////////////////////////////////
const DFT_MACRO_OBJ_SEP = "%%wn.meta." + Ti.Random.str(10) + "%%"
////////////////////////////////////////////
const WnSys = {
  //-------------------------------------
  async exec(cmdText, {
    vars = {},
    input = "",
    appName = Ti.GetAppName(),
    eachLine = undefined,
    as = "text",
    blankAs = "",
    macroObjSep = DFT_MACRO_OBJ_SEP,
    autoRunMacro = true,
    forceFlushBuffer = false,
    errorBy,
    PWD = Wn.Session.getCurrentPath()
  }={}) {
    // Eval command
    cmdText = Ti.S.renderBy(cmdText, vars)
    // Prepare
    let url = `/a/run/${appName}`
    let params = {
      "mos"  : macroObjSep,
      "PWD"  : PWD,
      "cmd"  : cmdText,
      "in"   : input,
      "ffb"  : forceFlushBuffer
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

    // Watch each line if necessary
    let readyStateChanged = undefined
    if(forceFlushBuffer && _.isFunction(eachLine)) {
      readyStateChanged = ()=>{
        parsing.updated()
      }
    }

    // Request remote
    await Ti.Http.send(url, {
      method : "POST", params, as:"text",
      created : ($req)=>{
        parsing.init(()=>$req.responseText)
      },
      readyStateChanged
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
      if(_.isFunction(errorBy)) {
        let [code, ...datas] = str.split(/ *: */);
        let data = datas.join(" : ")
        code = _.trim(code)
        let msgKey = code.replace(/[.]/g, "-")
        return errorBy({
          code, msgKey, data
        })
      }
      // Just throw it
      else {
        throw str
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
        if(Ti.S.isBlank(json)) {
          json = blankAs
        }
        // Try parse json
        try{
          return JSON.parse(json)
        } catch(e) {
          console.error(`Error [${cmdText}] for parse JSON:`, json)
          throw e
        }
      },
      jso : ()=>{
        let json = re.lines.join("\n")
        if(Ti.S.isBlank(json)) {
          json = blankAs
        }
        // Try eval json
        try {
          return eval('('+json+')')
        } catch(e) {
          console.error(`Error [${cmdText}] for eval JSO:`, json)
          throw e
        }
      }
    })[as]()
  },
  //-------------------------------------
  async exec2(cmdText, options={}){
    // Default error process
    _.defaults(options, {
      errorBy: async function({code, msgKey, data}) {
        //console.log(code, msgKey, data)
        // Eval error message
        let msg = Ti.I18n.get(msgKey)
        if(!Ti.Util.isNil(data) && (!_.isString(data) || data)) {
          msg += " : " + Ti.Types.toStr(data)
        }
        // Show it to user
        await Ti.Alert(msg, {
          title : "i18n:warn",
          type : "error"
        })
        // Customized processing
        if(_.isFunction(options.errorAs)) {
          return options.errorAs({code, msgKey, data})
        }
        return Ti.Err.make(code, data)
      }
    })
    // Run command
    return await Wn.Sys.exec(cmdText, options)
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