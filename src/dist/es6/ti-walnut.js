// Pack At: 2020-07-03 20:26:00
//##################################################
// # import Io      from "./wn-io.mjs"
const Io = (function(){
  ////////////////////////////////////////////
  function URL(actionName) {
    return "/o/" + actionName
  }
  //-----------------------------------------
  function AJAX_RETURN(reo, invalid) {
    if(!reo.ok) {
      if(_.isUndefined(invalid))
        throw reo
      return invalid
    }
    return reo.data;
  }
  ////////////////////////////////////////////
  const WnIo = {
    isFullObjId(id) {
      return /^[0-9a-v]{26}(:file:.+)?$/.test(id)
    },
    isFullObjIdPath(idPath) {
      return /^id:[0-9a-v]{26}(:file:.+)?$/.test(idPath)
    },
    /***
     * Get object meta by id(fullobjId) or path
     */
    async loadMetaBy(idOrPath, oRefer) {
      if(WnIo.isFullObjId(idOrPath)) {
        return await WnIo.loadMetaById(idOrPath)
      }
      // Absolute path
      if(/^(id:|\/|~)/.test(idOrPath)) {
        return await WnIo.loadMeta(idOrPath)
      }
      // Relative path
      let base;
      if(oRefer) {
        // Refer by path
        if(_.isString(oRefer)) {
          base = Ti.Util.getParentPath(oRefer)
        }
        // Refer by FILE
        else if("FILE" == oRefer.race) {
          base = "id:" + oRefer.pid
        }
        // Refer by DIR
        else {
          base = "id:" + oRefer.id
        }
      }
      // Refer to home
      else {
          base = "~"
      }
      // Load the obj by absolute path
      let aph = Ti.Util.appendPath(base, idOrPath)
      return await WnIo.loadMeta(aph)
    },
    /***
     * Get object meta by id
     */
    async loadMetaById(id) {
      return await WnIo.loadMeta("id:"+id)
    },
    /***
     * Get object meta by full path
     */
    async loadMeta(path) {
      let url = URL("fetch")
      let reo = await Ti.Http.get(url, {
        params:{
          str : path
        }, 
        as:"json"})
      return AJAX_RETURN(reo, null)
    },
    /***
     * Get object meta by refer meta
     */
    async loadMetaAt(refer, path) {
      // eval absolute path
      let aph = path;
  
      // Relative to refer (path is not absolute)
      if(refer && !(/^(~\/|\/|id:)/.test(path))) {
        aph = `id:${refer.pid}/${path}`
      }
      // Do load
      return await WnIo.loadMeta(aph)
    },
    /***
     * Get obj children by meta
     */
    async loadAncestors(str) {
      let url = URL("ancestors")
      let reo = await Ti.Http.get(url, {
        params: {str}, 
        as:"json"})
      return AJAX_RETURN(reo, [])
    },
    /***
     * Get obj children by meta
     */
    async loadChildren(meta, {skip, limit, sort={nm:1}, mine, match={}}={}) {
      if(!meta)
        return null
      if('DIR' != meta.race)
        return []
      //......................................
      // Load children when linked obj
      if(meta.mnt || meta.ln) {
        let url = URL("children")
        let reo = await Ti.Http.get(url, {
          params: {
            "str" :  `id:${meta.id}`,
            "pg"  : true
          }, 
          as:"json"})
        return AJAX_RETURN(reo)
      }
      //......................................
      // Just normal query
      // parent ID
      match.pid = meta.id
  
      // find them
      let reo = await WnIo.find({skip, limit, sort, mine, match})
      // Auto set reo path if noexists
      if(meta.ph && reo && _.isArray(reo.list)) {
        for(let child of reo.list) {
          if(!child.ph) {
            child.ph = Ti.Util.appendPath(meta.ph, child.nm)
          }
        }
      }
      return reo
    },
    /***
     * Query object list
     */
    async find({skip=0, limit=100, sort={}, mine=true, match={}}={}) {
      let url = URL("find")
      let reo = await Ti.Http.get(url, {
        params: _.assign({}, match, {
          _l  : limit, 
          _o  : skip,
          _me : mine,
          _s  : JSON.stringify(sort)
        }), 
        as:"json"})
      return AJAX_RETURN(reo)
    },
    async findList(query={}) {
      let reo = await WnIo.find(query)
      if(reo && _.isArray(reo.list)) {
        return reo.list
      }
      return []
    },
    /***
     * Query object list by value
     */
    async findInBy(value, parent, {
      skip=0, limit=100, sort={}, mine=true, match={},
      keys = {
        "^[0-9a-v]{26}$" : ["id", "${val}"]
      },
      dftKey = ["nm", "^.*${val}.*$"]
    }={}) {
      // Join Key To Match
      if(!_.isUndefined(value)) {
        let key = dftKey;
        for(let regex of _.keys(keys)) {
          if(new RegExp(regex).test(value)) {
            key = keys[regex]
            break
          }
        }
        let k = key[0]
        let v = Ti.S.renderBy(key[1], {val:value})
        match[k] = v
      }
      // Eval Parent
      if(parent) {
        let oP = await WnIo.loadMeta(parent)
        match.pid = oP.id
      }
  
      // Do Find
      return await WnIo.find({skip,limit,sort,mine,match})
    },
    async findListInBy(value, parent, query={}) {
      let reo = await WnIo.findInBy(value, parent, query)
      if(reo && _.isArray(reo.list)) {
        return reo.list
      }
      return []
    },
    /***
     * Get obj content by meta:
     */
    async loadContent(meta, {as="text"}={}) {
      // Load by path
      if(_.isString(meta)) {
        meta = await WnIo.loadMeta(meta)
      }
      // un-readable
      if(!meta || 'DIR' == meta.race) {
        return null
      }
      // Do load
      let mime = meta.mime || 'application/octet-stream'
      // PureText
      if(Wn.Util.isMimeText(mime)) {
        let url = URL("content")
        let content = await Ti.Http.get(url, {
          params: {
            str : "id:" + meta.id,
            d   : "raw"
          }, as})
        // Others just return pure text content
        return content
      }
  
      // Others just return the SHA1 finger
      return meta.sha1
    },
    /***
     * Save obj content
     */
    async saveContentAsText(meta, content) {
      if(!meta || 'DIR' == meta.race) {
        throw Ti.Err.make('e-wn-io-writeNoFile', meta.ph || meta.nm)
      }
      // Prepare params
      let params = {
        str : "id:"+meta.id,
        content
      }
      // do send
      let url = URL("/save/text")
      let reo = await Ti.Http.post(url, {params, as:"json"})
  
      if(!reo.ok) {
        throw Ti.Err.make(reo.errCode, reo.data, reo.msg)
      }
  
      return reo.data
    },
    /***
     * Upload file
     */
    async uploadFile(file, {
      target = "~",
      mode = "a",
      tmpl = "${major}(${nb})${suffix}",
      progress = _.identity
    }={}) {
      // do send
      let url = URL("/save/stream")
      let reo = await Ti.Http.post(url, {
        file, 
        progress,
        params : {
          str  : target,
          nm   : file.name,
          sz   : file.size,
          mime : file.type,
          m    : mode,
          tmpl
        },
        as:"json"
      })
      return reo
    },
    /***
     *  Get relative path of WnObj to home
     *  path will starts by "~/"
     */
    getFormedPath(meta) {
      // Make sure it is meta
      let ph = meta.ph ? meta.ph : meta;
      let homePath = Wn.Session.getHomePath()
      let rph = Ti.Util.getRelativePath(homePath, ph, "")
      return Ti.Util.appendPath("~", rph)
    },
    /***
     * @param meta{WnObj} the source object
     * @param mode{String}: 
     *  - path : relative to home like "~/xxx/xxx"
     *  - fullPath : "/home/xiaobai/xxx/xxx"
     *  - idPath : "id:67u8..98a1"
     *  - id   : "67u8..98a1"
     * @param oRefer{WnObj} - meta refer, may nil
     */
    formatObjPath(meta, mode, oRefer) {
      //console.log("formatObjPath", {meta, mode, oRefer})
      let fn = ({
        path() {
          if(oRefer) {
            return Ti.Util.getRelativePath(oRefer.ph, meta.ph)
          }
          return WnIo.getFormedPath(meta.ph)
        },
        fullPath() {
          return meta.ph
        },
        idPath() {
          return `id:${meta.id}`
        },
        id() {
          return meta.id
        }
      })[mode]
      if(!fn) {
        throw "Invalid mode : " + mode
      }
      return fn()
    }
  }
  ////////////////////////////////////////////
  return WnIo;
})();
//##################################################
// # import Obj     from "./wn-obj.mjs"
const Obj = (function(){
  ////////////////////////////////////////////////////
  const FIELDS = {
    //---------------------------------------------
    "id" : {
      title : "i18n:wn-key-id",
      name  : "id"
    },
    //---------------------------------------------
    "nm" : {
      title : "i18n:wn-key-nm",
      name  : "nm",
      display: "<=ti-label>",
      comType: "ti-input"
    },
    //---------------------------------------------
    "title" : {
      title : "i18n:wn-key-title",
      name  : "title",
      display: "<=ti-label>",
      comType: "ti-input"
    },
    //---------------------------------------------
    "icon" : {
      title : "i18n:wn-key-icon",
      name  : "icon",
      width : "auto",
      comType: "ti-input-icon"
    },
    //---------------------------------------------
    "ph" : {
      title : "i18n:wn-key-ph",
      name  : "ph",
      comConf: {
        className: "is-break-word"
      }
    },
    //---------------------------------------------
    "thumb" : {
      title : "i18n:wn-key-thumb",
      name  : "thumb",
      checkEquals : false,
      serializer : {
        name : "Ti.Types.toStr",
        args : "id:${id}"
      },
      comType : "wn-imgfile",
      comConf : {
        target : "~/.thumbnail/gen/${id}.jpg",
        filter : "cover(256,256)",
        quality : 0.372
      }
    },
    //---------------------------------------------
    "race" : {
      title : "i18n:wn-key-race",
      name  : "race",
      comConf : {
        format : "i18n:wn-race-${race}"
      }
    },
    //---------------------------------------------
    "mime" : {
      title : "i18n:wn-key-mime",
      name  : "mime"
    },
    //---------------------------------------------
    "tp" : {
      title : "i18n:wn-key-tp",
      name  : "tp"
    },
    //---------------------------------------------
    "ct" : {
      title : "i18n:wn-key-ct",
      name  : "ct",
      type  : "AMS"
    },
    //---------------------------------------------
    "lm" : {
      title : "i18n:wn-key-lm",
      name  : "lm",
      type  : "AMS"
    },
    //---------------------------------------------
    "expi" : {
      title : "i18n:wn-key-expi",
      name  : "expi",
      type  : "AMS"
    },
    //---------------------------------------------
    "pid" : {
      title : "i18n:wn-key-pid",
      name  : "pid"
    },
    //---------------------------------------------
    "d0" : {
      title : "i18n:wn-key-d0",
      name  : "d0"
    },
    //---------------------------------------------
    "d1" : {
      title : "i18n:wn-key-d1",
      name  : "d1"
    },
    //---------------------------------------------
    "c" : {
      title : "i18n:wn-key-c",
      name  : "c"
    },
    //---------------------------------------------
    "m" : {
      title : "i18n:wn-key-m",
      name  : "m"
    },
    //---------------------------------------------
    "g" : {
      title : "i18n:wn-key-g",
      name  : "g"
    },
    //---------------------------------------------
    "data" : {
      title : "i18n:wn-key-data",
      name  : "data"
    },
    //---------------------------------------------
    "sha1" : {
      title : "i18n:wn-key-sha1",
      name  : "sha1"
    },
    //---------------------------------------------
    "md" : {
      title : "i18n:wn-key-md",
      name  : "md"
    },
    //---------------------------------------------
    "pvg" : {
      title : "i18n:wn-key-pvg",
      name  : "pvg"
    },
    //---------------------------------------------
    "width" : {
      title : "i18n:wn-key-width",
      name  : "width"
    },
    //---------------------------------------------
    "height" : {
      title : "i18n:wn-key-height",
      name  : "height"
    },
    //---------------------------------------------
    "duration" : {
      title : "i18n:wn-key-duration",
      name  : "duration"
    },
    //---------------------------------------------
    "len" : {
      title : "i18n:wn-key-len",
      name  : "len",
      width : "auto",
      transformer: (v)=>Ti.S.sizeText(v)
    }
    //---------------------------------------------
  }
  ////////////////////////////////////////////
  const WnObj = {
    //----------------------------------------
    isBuiltInFields(key) {
      return FIELDS[key] ? true : false
    },
    //----------------------------------------
    getGroupTitle(titleKey) {
      if(/^(basic|privilege|thumb|timestamp|more|advance|customized|others)$/.test(titleKey))
        return `i18n:wn-key-grp-${titleKey}`
      return titleKey
    },
    //----------------------------------------
    getField(key) {
      let fld = FIELDS[key]
      if(fld) {
        return _.cloneDeep(fld)
      }
      return {
        title : key,
        name  : key,
        type  : "String"
      }
    },
    //----------------------------------------
    evalFields(meta={}, fields=[], iteratee=_.identity) {
      //......................................
      const __join_fields = function(flds=[], outs=[], keys={}) {
        _.forEach(flds, fld => {
          // Remains fields
          // It will be deal with later
          if("..." == fld) {
            outs.push(fld)
            return
          }
          let f2;
          let quickName = false
          // Quick Name
          if(_.isString(fld)) {
            quickName = true
            f2 = Wn.Obj.getField(fld)
          }
          // Group
          else if(_.isArray(fld.fields)) {
            f2 = {
              title: Wn.Obj.getGroupTitle(fld.title), 
              type:"Group", 
              fields:[]
            }
            __join_fields(fld.fields, f2.fields, keys)
            if(_.isEmpty(f2.fields)) {
              return
            }
          }
          // Normal field
          else {
            f2 = fld
          }
          //......................................
          let uniqKey = Ti.S.join([f2.name], "-")
          keys[uniqKey] = true
          let value = _.get(meta, f2.name)
          outs.push(_.assign(f2, {
            quickName, uniqKey, value
          }))
          //......................................
        });
        return outs;
      };
      //......................................
      const __deal_with_remain_fields = function(flds=[], outs=[], keys={}) {
        for(let fld of flds) {
          // Group
          if(fld.type == "Group") {
            fld.fields = __deal_with_remain_fields(fld.fields, [], keys)
            if(!_.isEmpty(fld.fields)) {
              outs.push(fld)
            }
            continue
          }
          // Remains
          if("..." == fld) {
            _.forEach(meta, (v, k)=>{
              // Ignore nil and built-in fields
              if(Ti.Util.isNil(v) 
                 || Wn.Obj.isBuiltInFields(k)
                 || keys[k]
                 || k.startsWith("_")) {
                return
              }
              // Auto com type
              let jsType = Ti.Types.getJsType(v, "String");
              let fldConf = ({
                "Integer": {
                  type: "Number",
                  display: k,
                  comType: "ti-input"
                },
                "Number" : {
                  type: "Number",
                  display: k,
                  comType: "ti-input"
                },
                "Boolean" : {
                  type: "Boolean",
                  comType: "ti-toggle"
                },
                "Array" : {
                  type: "Array",
                  display: {
                    key: k
                  },
                  transformer: "JSON.stringify(null, '  ')",
                  comType: "ti-input-text",
                  comConf: {
                    height: 240
                  }
                }
              })[jsType] || {
                type: "String",
                display: {
                  key: k,
                  comConf: {
                    width:"100%",
                    className: _.isString(v)&&v.length>20?"is-break-word":"is-nowrap"
                  }
                },
                comType: "ti-input"
              }
              
              // Join
              let f2 = iteratee({
                title: k,
                name: k,
                ... fldConf
              })
              if(f2) {
                outs.push(f2)
              }
            })
          }
          // Normal fields
          else {
            let f2 = iteratee(fld)
            if(f2) {
              outs.push(f2)
            }
          }
        }
        return outs
      }
      //......................................
      let usedKeys = {}
      let myFormFields = __join_fields(fields, [], usedKeys);
      myFormFields = __deal_with_remain_fields(myFormFields, [], usedKeys)
      //......................................
      return myFormFields
    },
    //----------------------------------------
    isAs(meta={}, key, match) {
      let val = _.get(meta, key)
      if(Ti.Util.isNil(val)) {
        return false
      }
      //......................................
      if(_.isArray(match)) {
        for(let mi of match) {
          if(WnObj.isAs(meta, key, mi)){
            return true
          }
        }
        return false
      }
      //......................................
      if(_.isString(match)) {
        if(match.startsWith("^")) {
          return new RegExp(match).test(val)
        }
        if(match.startsWith("!^")) {
          return !new RegExp(match.substring(1)).test(val)
        }
        return val == match
      }
      //......................................
      if(_.isRegExp(match)) {
        return match.test(val)
      }
      //......................................
      return false
    },
    //----------------------------------------
    isMime(meta={}, mime) {
      return WnObj.isAs(meta, "mime", mime)
    },
    //----------------------------------------
    isType(meta={}, type) {
      return WnObj.isAs(meta, "type", type)
    },
    //----------------------------------------
    /***
     * Create the crumb data for `<ti-crumb>`
     * 
     * @param meta{Object} - WnObj to show crumb data
     * @param ancestors{Array} - parent path object(WnObj[]), top dir at first.
     * @param showSelf{Boolean} - append self at the end of path
     * @param fromIndex{Integer} - start index in ancestors to generate data
     * @param homePath{String} - another way to indicate the `fromIndex`
     * @param iteratee{Function} - customized iterator `(item, index, an)`
     *   return `null` to ignore current item
     * @param self{Function} - customized iterator for self `(item, index, an)`
     *   return `null` to ignore current item
     * 
     * @return JSON array like:
     * 
     * ```js
     * [{
     *    icon  : Wn.Util.getIconObj(self),
          text   : Wn.Util.getObjDisplayName(self),
          value  : self.id,
          href   : null,
          asterisk : _.get(this.mainStatus, "changed")
     * }]
     * ```
     */
    evalCrumbData({
      meta, 
      ancestors = [], 
      fromIndex=0, 
      homePath=null,
      iteratee=_.identity,
      self=_.identity
    }={}) {
      let list = []
      if(meta) {
        let ans = _.map(ancestors)
        // Find the first Index from home
        let i = fromIndex
  
        // find by homePath
        if(homePath) {
          for(; i<ans.length; i++) {
            let an = ans[i]
            if(an.ph == homePath) {
              break
            }
          }
        }
  
        // Show ancestors form Home
        for(; i<ans.length; i++) {
          let an = ans[i]
          let item = {
            icon  : Wn.Util.getIconObj(an),
            text  : Wn.Util.getObjDisplayName(an),
            value : an.id,
            href  : Wn.Util.getAppLink(an) + ""
          }
          item = iteratee(item, i, meta) || item
          if(item) {
            list.push(item)
          }  
        }
        // Top Item, just show title
        if(self) {
          let item = {
            icon  : Wn.Util.getIconObj(meta),
            text  : Wn.Util.getObjDisplayName(meta),
            value : meta.id,
            href  : null,
            asterisk : _.get(this.mainStatus, "changed")
          }
          // Customized
          if(_.isFunction(self)) {
            item = self(item, i, meta) || item
          }
          // Join to list
          if(item) {
            list.push(item)
          }
        }
      }
      return list
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
  return WnObj;
})();
//##################################################
// # import Session from "./wn-session.mjs"
const Session = (function(){
  ////////////////////////////////////////////
  const ENVS = {}
  const SESSION = {}
  ////////////////////////////////////////////
  const WnSession = {
    //----------------------------------------
    setup({id,uid,unm,grp,envs={}}={}) {
      _.assign(SESSION, {id,uid,unm,grp})
      WnSession.env(envs)
    },
    //----------------------------------------
    env(vars) {
      // Set Env
      if(_.isPlainObject(vars)) {
        _.assign(ENVS, vars)
      }
      // GET one
      else if(_.isString(vars)) {
        return ENVS[vars]
      }
      // Pick
      else if(_.isArray(vars)) {
        return _.pick(ENVS, vars)
      }
      // Get Env
      return _.cloneDeep(ENVS)
    },
    //----------------------------------------
    getMyId() {return SESSION.uid},
    getMyName() {return SESSION.unm},
    getMyGroup() {return SESSION.grp},
    //----------------------------------------
    getHomePath() {
      return WnSession.env("HOME")
    },
    //----------------------------------------
    getCurrentPath(dft="~") {
      return WnSession.env("PWD") || dft
    },
    //----------------------------------------
    // Analyze the current domain 
    getCurrentDomain() {
      let home = WnSession.getHomePath()
      if(!home) {
        return
      }
      // For root
      if("/root" == home)
        return "root"
      
      // Others
      let m = /^\/home\/(.+)$/.exec(home)
      if(m) {
        return m[1]
      }
    },
    //----------------------------------------
    getApiPrefix() {
      let dmn = WnSession.getCurrentDomain()
      return `/api/${dmn}`
    },
    //----------------------------------------
    getApiUrl(url) {
      let prefix = WnSession.getApiPrefix()
      return Ti.Util.appendPath(prefix, url)
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
  return WnSession;
})();
//##################################################
// # import Sys     from "./wn-sys.mjs"
const Sys = (function(){
  //################################################
  // # import WnSysRespParsing from "./wn-sys-resp-parsing.mjs";
  const WnSysRespParsing = (function(){
    // Ti required(Ti.Util)
    ////////////////////////////////////////////
    class WnSysRespParsing {
      constructor({
        macroObjSep, 
        eachLine = _.identity, 
        macro = {}
      }={}) {
        this.macroObjSep = macroObjSep
        this.lastIndex = 0
        this.lines = []
        this.MACRO = {}
        this.__TO = null
        this.eachLine = eachLine
        this.macro = macro
      }
      init(content) {
        this.content = content
      }
      done() {
        this.updated({isLastCalled:true})
    
        // for MACRO
        _.forOwn(this.MACRO, (val, key)=>{
          let json = val.join("\n")
          let payload = JSON.parse(json)
          this.MACRO[key] = payload
          Ti.InvokeBy(this.macro, key, [payload])
        })
      }
      __push_line(line) {
        // If begine the macro
        if(line.startsWith(this.macroObjSep)) {
          let str = line.substring(this.macroObjSep.length).trim()
          let [key, name] = _.without(str.split(/ *: */g),"")
          let tag = this[key]
          if(tag) {
            tag[name] = []
          }
          this.__TO = {key, name}
        }
        // Specially target
        else if(this.__TO) {
          let {key, name} = this.__TO
          this[key][name].push(line)
        }
        // Default dist
        else {
          this.lines.push(line)
          // Hook
          this.eachLine(line)
        }
      }
      updated({isLastCalled=false}={}) {
        let content = this.content()
    
        // Looking for each line
        while(this.lastIndex < content.length) {
          let pos = content.indexOf('\n', this.lastIndex)
          if(pos >= this.lastIndex) {
            let nextIndex = pos + 1
            if(pos>0 && content[pos-1] == '\r') {
              pos --
            }
            let line = content.substring(this.lastIndex, pos)
            this.__push_line(line)
            this.lastIndex = nextIndex
          }
          // force ending
          else if(isLastCalled) {
            let line = content.substring(this.lastIndex)
            this.__push_line(line)
            this.lastIndex = content.length
          }
          // not endind line, break it
          else {
            break
          }
        } 
      }
      getResult() {
        return {
          lines : this.lines,
          macro : this.MACRO
        }
      }
    }
    ////////////////////////////////////////////
    return WnSysRespParsing;
  })();
  ////////////////////////////////////////////
  const DFT_MACRO_OBJ_SEP = "%%wn.meta." + Ti.Random.str(10) + "%%"
  ////////////////////////////////////////////
  const WnSys = {
    //-------------------------------------
    async exec(cmdText, {
      vars = {},
      input = "",
      appName = Ti.GetAppName(),
      eachLine = _.identity,
      as = "text",
      blankAs = "",
      macroObjSep = DFT_MACRO_OBJ_SEP,
      autoRunMacro = true,
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
        if(_.isFunction(errorBy)) {
          let [code, ...datas] = str.split(/ *: */);
          let data = datas.join(" : ")
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
          // Eval error message
          let msg = Ti.I18n.get(msgKey)
          if(!Ti.Util.isNil(data)) {
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
  return WnSys;
})();
//##################################################
// # import Util    from "./wn-util.mjs"
const Util = (function(){
  ////////////////////////////////////////////
  const WnUtil = {
    isMimeText(mime) {
      return /^text\//.test(mime) 
             || "application/x-javascript" == mime
             || "application/json" == mime
    },
    isMimeJson(mime) {
      return "text/json" == mime
             || "application/json" == mime
    },
    // adapt for old versiton walnut icon attribute
    getIconName(iconHtml) {
      let m = /^<i +class=["'] *(fa|zmdi|im) +(fa|zmdi|im)-([^" ]+) *["']> *<\/i>$/
                .exec(iconHtml)
      if(m) {
        return m[3]
      }
      return iconHtml
    },
    /***
     * Gen preview object for a object
     */
    genPreviewObj(meta) {
      // Uploaded thumb preview
      if(meta.thumb) {
        return {
          type : "image",
          value : '/o/thumbnail/id:' + meta.id
        }
      }
      // Customized Icon
      if(meta.icon) {
        let icon = WnUtil.getIconName(meta.icon)
        return Ti.Icons.get(icon, {
          type  : "font",
          value : icon
        })
      }
      // Default
      return Ti.Icons.get(meta)
    },
    getIconObj(meta) {
      if(meta && meta.icon) {
        // customized icon object
        if(_.isPlainObject(meta.icon)) {
          return _.assign(Ti.Icons.get(), meta.icon)
        }
        // customized icon name
        return {
          type  : "font",
          value : WnUtil.getIconName(meta.icon)
        }
      }
      // return default
      return Ti.Icons.get(meta)
    },
    getObjIcon(meta, dft) {
      if(!meta)
        return dft
      return meta.icon || Ti.Icons.get(meta)
    },
    /***
     * Get icon or thumb for a WnObj
     */
    getObjThumbIcon({
      icon,
      thumb,
      mime,
      type,
      race, 
      candidateIcon,
      timestamp=0
    }={}, dftIcon) {
      // Thumb as image
      if(thumb) {
        let src = `/o/content?str=${thumb}`
        if(timestamp > 0) {
          src += `&_t=${timestamp}`
        }
        return {
          type : "image",
          value : src
        }
      }
      //.............................................
      // Icon
      if(icon) {
        return {
          type  : "font",
          value  : icon
        }
      }
      //.............................................
      // Force Default
      if(candidateIcon) {
        return candidateIcon
      }
      //.............................................
      // Auto get by type
      if(type || mime || race) {
        return Ti.Icons.get({type, mime, race})
      }
      // Default
      return dftIcon
    },
    getObjThumbIcon2(canIcon, meta) {
      //console.log(canIcon, meta)
      return WnUtil.getObjThumbIcon(_.defaults({
        candidateIcon : canIcon
      }, meta))
    },
    /***
     * return the object readable name
     */
    getObjDisplayName(meta, keys=[]) {
      return Ti.Util.getFallback(meta, keys, "title", "nm")
    },
    /***
     * Get Object link as `String`
     * 
     * @param meta{String|Object} : Object meta or id as string
     * @param options.appName{String} : Walnut App Name, "wn.manager" as default
     * @param options.encoded{Boolean} : Encode the path or not
     */
    getAppLink(meta, {
      appName = "wn.manager",
      encoded = true
    }={}) {
      return WnUtil.getLink(`/a/open/${appName}`, meta, {
        pathKey : "ph",
        encoded : true
      })
    },
    getAppLinkStr(meta, options) {
      return WnUtil.getAppLink(meta, options).toString()
    },
    getObjBadges(meta={}, {
      NW= null,
      NE= ["ln", "zmdi-open-in-new"],
      SW= null,
      SE= null
    }={}) {
      let bg = {}
      if(NW && meta[NW[0]])
        bg.NW = NW[1]
  
      if(NE && meta[NE[0]])
        bg.NE = NE[1]
  
      if(SW && meta[SW[0]])
        bg.SW = SW[1]
  
      if(SE && meta[SE[0]])
        bg.SE = SE[1]
      return bg
    },
    getObjThumbInfo(meta={}, {
      exposeHidden = false,
      status = {},
      progress = {},
      badges=undefined
    }={}) {
      // Guard
      if(!meta || !meta.nm) {
        return
      }
      // Check the visibility
      let visibility = "show"
      if(meta.nm.startsWith(".")) {
        if(exposeHidden) {
          visibility = exposeHidden ? "weak" : "hide"
        }
      }
      // Generate new Thumb Item
      return {
        id    : meta.id,
        title : WnUtil.getObjDisplayName(meta),
        preview : WnUtil.genPreviewObj(meta),
        href : WnUtil.getAppLinkStr(meta),
        visibility,
        status   : status[meta.id],
        progress : progress[meta.id],
        badges : WnUtil.getObjBadges(meta, badges)
      }
    },
    /***
     * Get object link for download
     */
    getDownloadLink(meta, {mode="force"}={}) {
      return WnUtil.getLink(`/o/content`, meta, {
        pathKey : "str",
        encoded : true,
        params : {d:mode}
      })
    },
    /***
     * Get Object link as `Plain Object`
     * 
     * @param url{String} : Target URL
     * @param meta{String|Object} : Object meta or id as string
     * @param options.pathKey{String} : Which key to send object path
     * @param options.encoded{Boolean} : Encode the path or not
     * @param options.params{Object} : Init params value
     * 
     * @return `TiLinkObj`
     */
    getLink(url, meta, {
      pathKey = "ph",
      encoded = false,
      params = {}
    }={}) {
      let params2 = {...params}
      if(!meta) {
        return {url, params2}
      }
      const __V = (val)=>{
        return encoded
          ? encodeURIComponent(val)
          : val
      }
      // META: "~/path/to/obj"
      if(/^(\/|~)/.test(meta)) {
        params2[pathKey] = __V(meta)
      }
      // META: "478e..6ea2"
      else if(_.isString(meta)) {
        params2[pathKey] = `id:${meta}`
      }
      // META: {id:"478e..6ea2"}
      else if(meta.id){
        params2[pathKey] = `id:${meta.id}`
      }
      // META: {ph:"/path/to/obj"}
      else if(meta.ph){
        params2[pathKey] = __V(meta.ph)
      }
      // Default return
      return Ti.Util.Link({
        url, 
        params : params2,
      })
    },
    /***
     * Wrap meta to standard tree node
     * 
     * @param meta{Object} - WnObj meta data
     * 
     * @return TreeNode: {id,name,leaf,rawData,children}
     */
    wrapTreeNode(meta) {
      if(_.isPlainObject(meta)) {
        let node = {
          id : meta.id,
          name : meta.nm,
          leaf : 'DIR' != meta.race,
          rawData : meta
        }
        if(!node.leaf) {
          node.children = []
        }
        if(node.id && node.name) {
          return node
        }
      }
    },
    /***
     * @param query{String|Function}
     */
    genQuery(query, {
      vkey="val", 
      wrapArray=false, 
      errorAs,
      blankAs= '[]'
    }={}) {
      // Customized query
      if(_.isFunction(query)) {
        return query
      }
      // Array
      if(_.isArray(query)) {
        if(wrapArray) {
          return ()=>query
        }
        return query
      }
      // Command template
      if(_.isString(query)) {
        // Query by value 
        if(vkey) {
          return async (v) => {
            let cmdText = Ti.S.renderBy(query, {[vkey]:v})
            //console.log("exec", cmdText)
            return await Wn.Sys.exec2(cmdText, {
              as : "json",
              input : v,
              errorAs,
              blankAs
            })
          }
        }
        // Query directly
        else {
          return async (v) => {
            return await Wn.Sys.exec2(query, {
              as : "json",
              errorAs,
              blankAs
            })
          }
        }
      }
    }
  }
  ////////////////////////////////////////////
  return WnUtil;
})();
//##################################################
// # import Dict    from "./wn-dict.mjs"
const Dict = (function(){
  ///////////////////////////////////////////////////////////
  const WnDict = {  
    /***
     * @return {Ti.Dict}
     */
    evalOptionsDict({
      options, findBy, itemBy, childrenBy,
      valueBy, textBy, iconBy,
      dictShadowed = true
    }, hooks) {
      // Quck Dict Name
      let dictName = Ti.DictFactory.DictReferName(options)
      if(dictName) {
        return Ti.DictFactory.CheckDict(dictName, hooks)
      }
  
      // Explaint 
      return Ti.DictFactory.CreateDict({
        //...............................................
        data  : Wn.Util.genQuery(options, {
          vkey:null,
          blankAs: "[]"
        }),
        query : Wn.Util.genQuery(findBy, {
          blankAs: "[]"
        }),
        item  : Wn.Util.genQuery(itemBy, {
          errorAs: null,
          blankAs: "{}"
        }),
        children  : Wn.Util.genQuery(childrenBy, {
          errorAs: null,
          blankAs: "[]"
        }),
        //...............................................
        getValue : Ti.Util.genGetter(valueBy || "id|value"),
        getText  : Ti.Util.genGetter(textBy  || "title|text|nm"),
        getIcon  : Ti.Util.genGetter(iconBy  || Wn.Util.getObjThumbIcon),
        //...............................................
      }, {
        shadowed : dictShadowed,
        hooks
      })
    },
    //-------------------------------------------------------
    /***
     * Setup dictionary set
     */
    setup(dicts) {
      //console.log(dicts)
      _.forEach(dicts, (dict, name)=>{
        let d = Ti.DictFactory.GetDict(name)
        if(!d) {
          //console.log("create", name, dict)
          Ti.DictFactory.CreateDict({
            //...............................................
            data  : Wn.Util.genQuery(dict.data, {vkey:null}),
            query : Wn.Util.genQuery(dict.query),
            item  : Wn.Util.genQuery(dict.item),
            children : Wn.Util.genQuery(dict.children),
            //...............................................
            getValue : Ti.Util.genGetter(dict.value),
            getText  : Ti.Util.genGetter(dict.text),
            getIcon  : Ti.Util.genGetter(dict.icon),
            //...............................................
            shadowed : Ti.Util.fallback(dict.shadowed, true)
            //...............................................
          }, {name})
        }
      })
    },
    //-------------------------------------------------------
    /***
     * 
     */
    hMakerComponents() {
      return Ti.DictFactory.GetOrCreate({
        //...............................................
        data  : Wn.Util.genQuery("ti coms -cqn", {vkey:null}),
        //...............................................
        getValue : it => it.name,
        getText  : it => (it.title || it.name),
        getIcon  : it => (it.icon  || "im-plugin"),
        //...............................................
        isMatched : (it, v)=>{
          if(it.name == v || it.title == v) {
            return true
          }
          if(it.name && it.name.indexOf(v)>=0) {
            return true
          }
          if(it.title) {
            if(it.title.indexOf(v)>=0) {
              return true
            }
            let text = Ti.I18n.text(it.title)
            if(text && text.indexOf(v)>=0) {
              return true
            }
          }
          return false
        },
        //...............................................
        shadowed : true
        //...............................................
      }, {name: "hMakerComponents"})
    }
    //-------------------------------------------------------
  }
  ///////////////////////////////////////////////////////////
  return WnDict;
})();
//##################################################
// # import OpenObjSelector  from "./wn-open-obj-selector.mjs"
const OpenObjSelector = (function(){
  /***
   * Open Modal Dialog to explore one or multi files
   */
  async function OpenObjSelector(pathOrObj="~", {
    title = "i18n:select", 
    icon = "im-folder-open",
    type = "info", closer = true,
    textOk = "i18n:ok",
    textCancel = "i18n:cancel",
    position = "top",
    width="80%", height="90%", spacing,
    multi=true,
    fromIndex=0,
    homePath=Wn.Session.getHomePath(),
    fallbackPath=Wn.Session.getHomePath(),
    selected=[]
  }={}){
    //................................................
    // Load the target object
    let meta = await Wn.Io.loadMeta(pathOrObj)
    // Fallback
    if(!meta && fallbackPath && pathOrObj!=fallbackPath) {
      meta = await Wn.Io.loadMeta(fallbackPath)
    }
    // Fail to load
    if(!meta) {
      return await Ti.Toast.Open({
        content : "i18n:e-io-obj-noexistsf",
        vars : _.isString(pathOrObj)
                ? { ph: pathOrObj, nm: Ti.Util.getFileName(pathOrObj)}
                : pathOrObj.ph
      }, "warn")
    }
    //................................................
    // Make sure the obj is dir
    if("DIR" != meta.race) {
      meta = await Wn.Io.loadMetaById(meta.pid)
      if(!meta) {
        return await Ti.Toast.Open({
          content : "i18n:e-io-obj-noexistsf",
          vars : {
            ph : `Parent of id:${meta.id}->pid:${meta.pid}`,
            nm : `Parent of id:${meta.nm}->pid:${meta.pid}`,
          }
        }, "warn")
      }
    }
    //................................................
    // Open modal dialog
    let reObj = await Ti.App.Open({
      //------------------------------------------
      type, width, height, spacing, position, closer,
      icon, title,
      //------------------------------------------
      actions : [{
        text: textOk,
        handler : ({$main})=>$main.myChecked
      }, {
        text: textCancel,
        handler : ()=>undefined
      }],
      //------------------------------------------
      modules : {
        current  : "@mod:wn/obj-meta",
        main     : "@mod:wn/obj-current"
      },
      //------------------------------------------
      comType : "modal-inner-body",
      //------------------------------------------
      components : [{
        //////////////////////////////////////////
        name : "modal-inner-body",
        globally : false,
        //////////////////////////////////////////
        data : {
          myChecked : [],
          myShown : {}
        },
        //////////////////////////////////////////
        props : {
          "icon"   : undefined, 
          "text"   : undefined,
          "trimed" : undefined, 
          "placeholder" : undefined, 
          "valueCase" : undefined,
          "value"  : undefined
        },
        //////////////////////////////////////////
        template : `<ti-gui
          :layout="theLayout"
          :schema="theSchema"
          :shown="myShown"
          :can-loading="true"
          :loading-as="status.reloading"
          @sky::item:active="OnCurrentMetaChange"
          @arena::open="OnCurrentMetaChange"
          @arena::select="OnArenaSelect"/>`,
        //////////////////////////////////////////
        computed : {
          //--------------------------------------
          ...Vuex.mapGetters("current", {
            "obj"              : "get",
            "objHome"          : "getHome",
            "objIsHome"        : "isHome",
            "objHasParent"     : "hasParent",
            "objParentIsHome"  : "parentIsHome"
          }),
          //--------------------------------------
          ...Vuex.mapState("main", ["data", "status"]),
          //--------------------------------------
          theCrumbData() {
            return Wn.Obj.evalCrumbData({
              meta      : _.get(this.obj, "meta"),
              ancestors : _.get(this.obj, "ancestors"),
              fromIndex : fromIndex,
              homePath  : homePath,
            }, (item)=>{
              item.asterisk = _.get(this.mainStatus, "changed")
            })
          },
          //--------------------------------------
          theLayout(){
            return {
              type : "rows",
              border : true,
              blocks : [{
                  name : "sky",
                  size : ".5rem",
                  body : "sky"
                }, {
                  name : "arena",
                  body : "main"
                }]
            }
          },
          //--------------------------------------
          theSchema(){
            return {
              "sky" : {
                comType : "ti-crumb",
                comConf : {
                  "data" : this.theCrumbData
                }
              },
              "main" : {
                comType : "wn-adaptlist",
                comConf : {
                  "meta"   : this.obj,
                  "data"   : this.data,
                  "status" : this.status,
                  "multi"  : multi,
                  "listConf" : {
                    resizeDelay : 200
                  }
                }
              }
            }
          }
        },
        //////////////////////////////////////////
        methods : {
          //--------------------------------------
          OnCurrentMetaChange({id, path, value}={}) {
            this.open(id || path || value)
          },
          //--------------------------------------
          OnArenaSelect({checked}) {
            this.myChecked = _.filter(checked, o=>"FILE"==o.race)
          },
          //--------------------------------------
          async open(obj) {
            // Guard
            if(!obj) {
              return
            }
    
            // To WnObj
            if(_.isString(obj)) {
              obj = await Wn.Io.loadMetaBy(obj)
            }
    
            // Only can enter DIR
            if(obj && "DIR" == obj.race) {
              let app = Ti.App(this)
              app.dispatch("current/reload", obj)
              app.dispatch("main/reload", obj)    
            }
          }
          //--------------------------------------
        },
        //////////////////////////////////////////
        mounted : function() {
          this.open(meta)
        }
        //////////////////////////////////////////
      }]
      //------------------------------------------
    })
    //................................................
    // End of OpenObjSelector
    return reObj
  }
  ////////////////////////////////////////////
  return OpenObjSelector;
})();
//##################################################
// # import OpenThingManager from "./wn-open-thing-manager.mjs"
const OpenThingManager = (function(){
  /***
   * Open Modal Dialog to manage a thing set
   */
  async function OpenThingManager(pathOrObj, {
    textOk = "i18n:ok",
    icon = "fas-database",
    title,
    ok = ({result})=>result,
    textCancel = "i18n:close",
    position = "top",
    width="96%", height="96%", spacing,
  }={}) {
    if(Ti.Util.isNil(pathOrObj)) {
      return await Ti.Toast.Open("ThingSet path is nil", "warn");
    }
  
    // Load thing set
    let oTs = _.isString(pathOrObj)
      ? await Wn.Io.loadMeta(pathOrObj)
      : pathOrObj
    if(!oTs) {
      return await Ti.Toast.Open(`Fail to found ThingSet: ${pathOrObj}`, "warn");
    }
  
    // Forbid the auto select
    oTs.th_auto_select = false
  
    // Load default actions
    let view = await Wn.Sys.exec(`ti views id:${oTs.id} -cqn`, {as:"json"})
  
    // Open it
    return await Ti.App.Open({
      icon,
      title : title || oTs.title || oTs.nm,
      position, width, height, 
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
  return OpenThingManager;
})();
//##################################################
// # import EditObjMeta      from "./wn-edit-obj-meta.mjs"
const EditObjMeta = (function(){
  ////////////////////////////////////////////////////
  async function EditObjMeta(pathOrObj="~", {
    icon, title, 
    type   = "info", 
    closer = true,
    escape = true,
    textOk = "i18n:ok",
    textCancel = "i18n:cancel",
    position   = "top",
    width      = 640,
    height     = "80%", 
    spacing,
    currentTab = 0,
    // static tabs
    // if emtpy, apply the default
    // “auto" will load by `ti editmeta`, it will override the currentTab
    fields     = [],
    fixedKeys  = ["thumb"],
    saveKeys   = ["thumb"],  // If the key changed, `cancel` same as `OK`
    autoSave   = true
  }={}){
    //............................................
    // Load meta
    let meta = pathOrObj
    if(_.isString(meta)) {
      meta = await Wn.Io.loadMeta(pathOrObj)
    }
    //............................................
    // Fixed key map
    let fixeds = {}
    _.forEach(fixedKeys, k => fixeds[k]=true)
    //............................................
    // Save key map
    let saves = {}
    _.forEach(saveKeys, k => saves[k]=true)
    //............................................
    // Auto load 
    if("auto" == fields) {
      let reo = await Wn.Sys.exec2(`ti metas id:${meta.id} -cqn`, {as:"json"})
      if(reo) {
        fields = reo.fields
        currentTab = reo.currentTab || currentTab || 0
      }
    }
    //............................................
    // Default tabs
    if(_.isEmpty(fields) || !_.isArray(fields)) {
      fields = [{ 
        title: "basic",
        fields: [
          "id", "nm", "title",  "icon", "thumb","ph", "race", "tp", "mime", 
          "width", "height", "len"],
      }, {
        title: "privilege",
        fields: ["c","m","g", "md", "pvg"]
      }, {
        title: "timestamp",
        fields: ["ct", "lm", "expi"]
      }, {
        title: "others",
        fields: ["..."]
      }]
    }
    //............................................
    let myFormFields = Wn.Obj.evalFields(meta, fields, (fld)=>{
      if(fixeds[fld.uniqKey]) {
        return fld
      }
      if(fld.quickName  && _.isUndefined(fld.value)) {
        return
      }
      return fld
    })
    //............................................
    let theIcon  = icon  || Wn.Util.getObjIcon(meta, "zmdi-info-outline")
    let theTitle = title || Wn.Util.getObjDisplayName(meta)
    //............................................
    let reo = await Ti.App.Open({
      //------------------------------------------
      type, width, height, spacing, position, closer, escape,
      icon  : theIcon,
      title : theTitle,
      //------------------------------------------
      actions : [{
        text: textOk,
        handler : ({$main})=>_.cloneDeep({
          updates : $main.updates,
          data : $main.meta
        })
      }, {
        text: textCancel,
        handler : ({$main})=>{
          // Is in saveKeys
          let ks = _.keys($main.updates)
          for(let k of ks) {
            if(saves[k]) {
              return _.cloneDeep({
                updates : $main.updates,
                data : $main.meta
              })
            }
          }
          // Nothing be updated, just return undefined
        }
      }],
      //------------------------------------------
      comType : "modal-inner-body",
      //------------------------------------------
      components : [{
        name : "modal-inner-body",
        globally : false,
        data : {
          myFormFields,
          currentTab, 
          meta,
          updates : {}
        },
        template : `<ti-form
          mode="tab"
          :current-tab="currentTab"
          :fields="myFormFields"
          :data="meta"
          @field:change="onFieldChange"
          @change="onChange"
          />`,
        methods : {
          onChange(data){
            this.meta = data
          },
          onFieldChange({name, value}={}) {
            let obj = Ti.Types.toObjByPair({name, value})
            this.updates = _.assign({}, this.updates, obj)
          }
        }
      }, "@com:ti/form", "@com:wn/imgfile"]
      //------------------------------------------
    })
    //............................................
    // User cancel
    if(!reo) {
      return
    }
    //............................................
    let {updates} = reo
    let saved = false
    if(autoSave &&!_.isEmpty(updates)) {
      let json = JSON.stringify(updates)
      let cmdText = `obj 'id:${meta.id}' -ocqn -u`
      let newMeta = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})
      await Ti.Toast.Open("i18n:save-done", "success")
      saved = true
  
      return {updates, data:newMeta, saved}
    }
    //............................................
    return reo
  }
  ////////////////////////////////////////////////////
  return EditObjMeta;
})();
//##################################################
// # import EditObjContent   from "./wn-edit-obj-content.mjs"
const EditObjContent = (function(){
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
  return EditObjContent;
})();
//##################################################
// # import EditTiComponent  from "./wn-edit-ti-component.mjs"
const EditTiComponent = (function(){
  ////////////////////////////////////////////////////
  async function EditTiComponent({comType,comConf}={}, {
    icon= "fas-pencil-ruler",
    title= "i18n:edit-com", 
    type   = "info", 
    closer = true,
    textOk = "i18n:ok",
    textCancel = "i18n:cancel",
    position   = "top",
    width      = 800,
    height     = "90%",
    spacing
  }={}){
    //............................................
    return await Ti.App.Open({
      //------------------------------------------
      type, width, height, spacing, position, closer,
      icon, title,
      textOk, textCancel,
      //------------------------------------------
      comType : "hmaker-edit-com",
      comConf : {
        value: {comType, comConf}
      },
      //------------------------------------------
      result: {
        comType : comType, 
        comConf : _.cloneDeep(comConf)
      },
      //------------------------------------------
      components : ["@com:hmaker/edit-com"]
      //------------------------------------------
    })
  }
  ////////////////////////////////////////////////////
  return EditTiComponent;
})();


//---------------------------------------
const WALNUT_VERSION = "2.1-20200703.202600"
//---------------------------------------
// For Wn.Sys.exec command result callback
const HOOKs = {

}
//---------------------------------------
export const Wn = {
  Version: WALNUT_VERSION,
  Io, Obj, Session, Sys, Util, Dict, 
  OpenObjSelector, EditObjMeta, EditObjContent,
  EditTiComponent, OpenThingManager,
  //-------------------------------------
  addHook(key, fn) {
    Ti.Util.pushValue(HOOKs, key, fn)
  },
  //-------------------------------------
  doHook(key, payload) {
    let fns = HOOKs[key]
    if(_.isArray(fns) && fns.length > 0) {
      for(let fn of fns) {
        fn(payload)
      }
    }
  }
}
//---------------------------------------
export default Wn
//---------------------------------------
if(window) {
  window.Wn = Wn
}