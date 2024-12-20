// Pack At: 2024-11-10 00:54:59
//##################################################
// # import Io from "./wn-io.mjs"
const Io = (function(){
  ////////////////////////////////////////////
  function URL(actionName) {
    return "/o/" + actionName
  }
  //-----------------------------------------
  function AJAX_RETURN(reo, invalid) {
    if (!reo.ok) {
      if (_.isUndefined(invalid))
        throw reo
      return invalid
    }
    return reo.data;
  }
  ////////////////////////////////////////////
  const WnIo = {
    OID(id) {
      if (!id) {
        return {}
      }
      // One stage ID
      let str = _.trim(id)
      let pos = str.indexOf(':');
      if (pos < 0) {
        return {
          id: str,
          myId: str
        }
      }
      // Two stage ID
      return {
        id: str,
        homeId: str.substring(0, pos).trim(),
        myId: str.substring(pos + 1).trim()
      }
    },
    getObjMyId(id) {
      return WnIo.OID(id).myId
    },
    isFullObjId(id) {
      return /^[0-9a-v]{26}(:.+)?$/.test(id)
    },
    isFullObjIdPath(idPath) {
      return /^id:[0-9a-v]{26}(:.+)?$/.test(idPath)
    },
    /***
     * Get object meta by id(fullobjId) or path
     */
    async loadMetaBy(idOrPath, oRefer, setup) {
      if (WnIo.isFullObjId(idOrPath)) {
        return await WnIo.loadMetaById(idOrPath, setup)
      }
      // Absolute path
      if (/^(id:|\/|~)/.test(idOrPath)) {
        return await WnIo.loadMeta(idOrPath, setup)
      }
      // Relative path
      let base;
      if (oRefer) {
        // Refer by path
        if (_.isString(oRefer)) {
          base = Ti.Util.getParentPath(oRefer)
        }
        // Refer by FILE
        else if ("FILE" == oRefer.race) {
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
    async loadMetaById(id, setup) {
      return await WnIo.loadMeta("id:" + id, setup)
    },
    /***
     * Get object meta by full path
     */
    async loadMeta(path, { loadPath = false } = {}) {
      let url = URL(loadPath ? "fetch2" : "fetch")
      let reo = await Ti.Http.get(url, {
        params: {
          str: path
        },
        as: "json"
      })
      return AJAX_RETURN(reo, null)
    },
    /***
     * Get object meta by refer meta
     */
    async loadMetaAt(refer, path) {
      // eval absolute path
      let aph = path;
  
      // Relative to refer (path is not absolute)
      if (refer && !(/^(~\/|\/|id:)/.test(path))) {
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
        params: { str },
        as: "json"
      })
      return AJAX_RETURN(reo, [])
    },
    /***
     * Get obj children by meta
     */
    async loadChildren(meta, { skip, limit, sort = { nm: 1 }, mine, match = {} } = {}) {
      if (!meta)
        return null
      if ('DIR' != meta.race)
        return 0 === limit ? [] : {}
      //......................................
      // Load children when linked obj
      if (meta.mnt || meta.ln) {
        let url = URL("children")
        let reo = await Ti.Http.get(url, {
          params: {
            "str": `id:${meta.id}`,
            "pg": true
          },
          as: "json"
        })
        return AJAX_RETURN(reo)
      }
      //......................................
      // Just normal query
      // parent ID
      match.pid = meta.id
  
      // find them
      let reo = await WnIo.find({ skip, limit, sort, mine, match })
      // Auto set reo path if noexists
      if (meta.ph && reo && _.isArray(reo.list)) {
        for (let child of reo.list) {
          if (!child.ph) {
            child.ph = Ti.Util.appendPath(meta.ph, child.nm)
          }
        }
      }
      return reo
    },
    /***
     * Query object list
     */
    async find({ skip = 0, limit = 100, sort = {}, mine = true, match = {} } = {}) {
      let url = URL("find")
      let reo = await Ti.Http.get(url, {
        params: _.assign({}, match, {
          _l: limit,
          _o: skip,
          _me: mine,
          _s: JSON.stringify(sort)
        }),
        as: "json"
      })
      return AJAX_RETURN(reo)
    },
    async findList(query = {}) {
      let reo = await WnIo.find(query)
      if (reo && _.isArray(reo.list)) {
        return reo.list
      }
      return []
    },
    /***
     * Query object list by value
     */
    async findInBy(value, parent, {
      skip = 0, limit = 100, sort = {}, mine = true, match = {},
      keys = {
        "^[0-9a-v]{26}(:.+)$": ["id", "${val}"]
      },
      dftKey = ["nm", "^.*${val}.*$"]
    } = {}) {
      // Join Key To Match
      if (!_.isUndefined(value)) {
        let key = dftKey;
        for (let regex of _.keys(keys)) {
          if (new RegExp(regex).test(value)) {
            key = keys[regex]
            break
          }
        }
        let k = key[0]
        let v = Ti.S.renderBy(key[1], { val: value })
        match[k] = v
      }
      // Eval Parent
      if (parent && parent.id && parent.ph) {
        match.pid = parent.id
      }
      // Parent patn => get back id
      else if (_.isString(parent)) {
        let oP = await WnIo.loadMeta(parent)
        match.pid = oP.id
      }
  
      // Do Find
      return await WnIo.find({ skip, limit, sort, mine, match })
    },
    async findListInBy(value, parent, query = {}) {
      let reo = await WnIo.findInBy(value, parent, query)
      if (reo && _.isArray(reo.list)) {
        return reo.list
      }
      return []
    },
    /***
     * Get obj content by meta:
     */
    async loadContent(meta, { as = "text" } = {}) {
      // Load by path
      if (_.isString(meta)) {
        meta = await WnIo.loadMeta(meta)
      }
      // un-readable
      if (!meta || 'DIR' == meta.race) {
        return null
      }
      // Do load
      let mime = meta.mime || 'application/octet-stream'
      // PureText
      if (Wn.Util.isMimeText(mime)) {
        let url = URL("content")
        let content = await Ti.Http.get(url, {
          params: {
            str: "id:" + meta.id,
            d: "raw"
          }, as
        })
        // Others just return pure text content
        return content
      }
  
      // Others just return the SHA1 finger
      return meta.sha1
    },
    /***
     * Save obj content
     */
    async update(meta, fields = {}) {
      // Guard
      if (!meta || _.isEmpty(fields)) {
        return
      }
      // Load meta 
      if (_.isString(meta)) {
        meta = await WnIo.loadMetaBy(meta)
      }
      if (!_.isPlainObject(meta)) {
        throw Ti.Err.make('e-wn-io-invalidUpdateTarget', meta)
      }
      // do send
      let url = URL("/update")
      let reo = await Ti.Http.post(url, {
        params: {
          str: "id:" + meta.id
        },
        body: JSON.stringify(fields),
        as: "json"
      })
  
      if (!reo.ok) {
        throw Ti.Err.make(reo.errCode, reo.data, reo.msg)
      }
  
      return reo.data
    },
    /***
     * Save obj content
     */
    async saveContentAsText(metaOrPath, content, {
      createIfNoExists = false,
      asBase64 = false
    } = {}) {
      // Guard
      if (!metaOrPath) {
        return
      }
      if (Ti.Util.isNil(content)) {
        content = ""
      }
      // Load meta 
      let targetPath;
      if (_.isString(metaOrPath)) {
        targetPath = metaOrPath
      }
      // {id}
      else if (metaOrPath.id) {
        let { id, nm, ph, race } = metaOrPath
        if ('DIR' == race) {
          throw Ti.Err.make('e-wn-io-writeNoFile', ph || nm || id)
        }
        targetPath = `id:${id}`
      }
      // {ph}
      else if (metaOrPath.ph) {
        let { ph, race } = metaOrPath
        if ('DIR' == race) {
          throw Ti.Err.make('e-wn-io-writeNoFile', ph)
        }
        targetPath = ph
      }
      // Get Path
      else {
        console.error("Invlaid metaOrPath", metaOrPath)
        throw Ti.Err.make('Invalid metaOrPath', metaOrPath)
      }
  
      // Prepare params
      let params = {
        str: targetPath,
        content,
        cine: createIfNoExists,
        base64: asBase64
      }
      // do send
      let url = URL("/save/text")
      let reo = await Ti.Http.post(url, { params, as: "json" })
  
      if (!reo.ok) {
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
    } = {}) {
      // do send
      let url = URL("/save/stream")
      let reo = await Ti.Http.post(url, {
        file,
        progress,
        params: {
          str: target,
          nm: file.uploadName || file.name,
          sz: file.size,
          mime: file.type,
          m: mode,
          tmpl
        },
        as: "json"
      })
      return reo
    },
    /***
     * Move select obj items to a target.
     * This method will pop-up a dialog to let user choose a target 
     */
    async moveTo(metaOrMetaList, {
      base, homePath,
      objMatch, objFilter, objSort, leafBy,
      treeDisplay,
      confirm = false,
      title = "i18n:move-to",
      exposeHidden = false,
      testBeforeMove = (it, exRemovedIds) => {
        // Duck check
        if (!it || !it.id || !it.nm)
          return false
        // Ignore obsolete item
        if (it.__is && (it.__is.loading || it.__is.removed))
          return false
        // Ignore the exRemovedIds
        if (exRemovedIds[it.id])
          return false
        return true
      },
      markItemStatus = _.identity,
      doneMove = _.identity,
      successTip = "i18n:wn-move-to-ok"
    } = {}) {
      // Guard
      if (!base) {
        return
      }
      if (_.isString(base)) {
        base = await Wn.Io.loadMeta(base)
      }
      // Make input as list
      let list = []
      if (metaOrMetaList) {
        if (_.isArray(metaOrMetaList)) {
          list = metaOrMetaList
        } else {
          list = [metaOrMetaList]
        }
      }
      // Guard
      if (_.isEmpty(list)) {
        return await Ti.Toast.Open('i18n:wn-move-to-none', "warn")
      }
  
      // Confirm
      if (confirm) {
        if (!(await Ti.Confirm({
          text: "i18n:wn-move-to-confirm",
          vars: { N: list.length }
        }, {
          type: "warn"
        }))) {
          return
        }
      }
  
      // Select target
      let reo = await Wn.OpenObjTree(base, {
        title, homePath,
        objMatch, objFilter, objSort, leafBy,
        treeDisplay, exposeHidden
      })
  
      // User cancel
      if (!reo || !reo.id || reo.id == base.id) {
        return
      }
  
      let delCount = 0
      // make removed files. it remove a video
      // it will auto-remove the `videoc_dir` in serverside also
      // so, in order to avoid delete the no-exists file, I should
      // remove the `videoc_dir` ID here, each time loop, check current
      // match the id set or not, then I will get peace
      let exRemovedIds = {}
      try {
        // Loop items
        for (let it of list) {
          // Test ...
          if (!testBeforeMove(it, exRemovedIds)) {
            continue
          }
  
          // Mark item is processing
          markItemStatus(it.id, "loading")
  
          // Do delete
          await Wn.Sys.exec(`mv id:${it.id} id:${reo.id}`)
  
          // Mark item removed
          markItemStatus(it.id, "moved")
  
          // If video result folder, mark it at same time
          let m = /^id:(.+)$/.exec(it.videoc_dir)
          if (m) {
            let vdId = m[1]
            exRemovedIds[vdId] = true
            this.setItemStatus(vdId, "moved")
            markItemStatus(vdId, "moved")
          }
          // Counting
          delCount++
          // Then continue the loop .......^
        }
        // Do reload
        await doneMove()
      }
      // End deleting
      finally {
        Ti.Toast.Open(successTip, { N: delCount }, "success")
      }
    },
    /***
     *  Get relative path of WnObj to home
     *  path will starts by "~/"
     */
    getFormedPath(meta) {
      if(!meta){
        return null
      }
      // Make sure it is meta
      let ph = _.isString(meta) ? meta : meta.ph;
      if(!ph){
        return null
      }
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
          if (oRefer) {
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
        },
        nm() {
          return meta.nm
        },
        obj() {
          let keys = oRefer || ['id', 'nm', 'thumb', 'title', 'mime', 'tp', 'sha1', 'len']
          return _.pick(meta, keys)
        },
        wnobj() {
          return meta
        }
      })[mode]
      if (!fn) {
        throw "Invalid mode : " + mode
      }
      return fn()
    },
    /***
     * @param input: obj id or path or meta
     * @param mode{String}: 
     *  - path : relative to home like "~/xxx/xxx"
     *  - fullPath : "/home/xiaobai/xxx/xxx"
     *  - idPath : "id:67u8..98a1"
     *  - id   : "67u8..98a1"
     * @param oRefer{WnObj} - meta refer, may nil
     */
    async loadObjAs(input, mode) {
      //console.log("formatObjPath", {meta, mode, oRefer})
      let fn = ({
        path() {
          return WnIo.loadMeta(input)
        },
        fullPath() {
          return WnIo.loadMeta(input)
        },
        idPath() {
          return WnIo.loadMeta(input)
        },
        id() {
          return WnIo.loadMetaById(input)
        },
        obj() {
          return WnIo.loadMetaById(input.id)
        },
        wnobj() {
          return _.cloneDeep(input)
        }
      })[mode]
      if (!fn) {
        throw "Invalid mode : " + mode
      }
      return await fn()
    }
  }
  ////////////////////////////////////////////
  return WnIo;
})();
//##################################################
// # import Obj from "./wn-obj.mjs"
const Obj = (function(){
  ////////////////////////////////////////////////////
  const TABLE_FIELDS = {
    //---------------------------------------------
    thumb: () => ({
      title: "i18n:wn-key-icon",
      display: Wn.Obj.getObjThumbDisplay("rawData")
    }),
    //---------------------------------------------
    title: () => ({
      title: "i18n:wn-key-title",
      display: "title|nm"
    }),
    //---------------------------------------------
    nm: () => ({
      title: "i18n:wn-key-nm",
      display: "nm"
    }),
    //---------------------------------------------
    race: {
      title: "i18n:wn-key-race",
      display: {
        key: "race",
        comConf: {
          format: "i18n:wn-race-${race}"
        }
      }
    },
    //---------------------------------------------
    tp: {
      title: "i18n:wn-key-tp",
      display: "rawData.tp::as-tip"
    },
    //---------------------------------------------
    mime: {
      title: "i18n:wn-key-mime",
      display: "rawData.mime::as-tip"
    },
    //---------------------------------------------
    c: {
      title: "i18n:wn-key-c",
      display: "rawData.c::as-tip"
    },
    //---------------------------------------------
    m: {
      title: "i18n:wn-key-m",
      display: "rawData.m::as-tip"
    },
    //---------------------------------------------
    g: {
      title: "i18n:wn-key-g",
      display: "rawData.g::as-tip"
    },
    //---------------------------------------------
    d0: {
      title: "i18n:wn-key-d0",
      display: "rawData.d0::as-tip"
    },
    //---------------------------------------------
    d1: {
      title: "i18n:wn-key-d1",
      display: "rawData.d1::as-tip"
    },
    //---------------------------------------------
    md: {
      title: "i18n:wn-key-md",
      display: {
        key: "rawData.md",
        transformer: "Wn.Obj.modeToStr",
        comConf: {
          className: "as-tip"
        }
      }
    },
    //---------------------------------------------
    sort: {
      title: "i18n:sort",
      display: "rawData.sort"
    },
    //---------------------------------------------
    width: {
      title: "i18n:wn-key-width",
      display: "rawData.width"
    },
    //---------------------------------------------
    height: {
      title: "i18n:wn-key-height",
      display: "rawData.height"
    },
    //---------------------------------------------
    duration: {
      title: "i18n:wn-key-duration",
      display: "rawData.duration"
    },
    //---------------------------------------------
    len: {
      title: "i18n:wn-key-len",
      display: {
        key: "rawData.len",
        transformer: "Ti.S.sizeText",
        comConf: {
          className: "as-tip-block align-right"
        }
      }
    },
    //---------------------------------------------
    ct: {
      title: "i18n:wn-key-ct",
      display: {
        key: "rawData.ct",
        transformer: "Ti.DateTime.timeText",
        comConf: {
          className: "as-tip-block align-right is-nowrap"
        }
      }
    },
    //---------------------------------------------
    lm: {
      title: "i18n:wn-key-lm",
      display: {
        key: "rawData.lm",
        transformer: "Ti.DateTime.timeText",
        comConf: {
          className: "as-tip-block align-right is-nowrap"
        }
      }
    }
    //---------------------------------------------
  };
  ////////////////////////////////////////////////////
  const FORM_FIELDS = {
    //---------------------------------------------
    id: {
      title: "i18n:wn-key-id",
      name: "id",
      comType: "WnObjId"
    },
    //---------------------------------------------
    nm: {
      title: "i18n:wn-key-nm",
      name: "nm",
      display: "<=ti-label>",
      comType: "ti-input"
    },
    //---------------------------------------------
    title: {
      title: "i18n:wn-key-title",
      name: "title",
      emptyAs: null,
      display: "<=ti-label>.is-nowrap",
      comType: "ti-input"
    },
    //---------------------------------------------
    sort: {
      title: "i18n:sort",
      name: "sort",
      type: "Integer",
      comType: "ti-input-num",
      comConf: {
        width: 140
      }
    },
    //---------------------------------------------
    icon: {
      title: "i18n:wn-key-icon",
      name: "icon",
      width: "auto",
      comType: "ti-input-icon"
    },
    //---------------------------------------------
    ph: {
      title: "i18n:wn-key-ph",
      name: "ph",
      comConf: {
        className: "is-break-word"
      }
    },
    //---------------------------------------------
    // "thumb" : {
    //   title : "i18n:wn-key-thumb",
    //   name  : "thumb",
    //   checkEquals : false,
    //   serializer : {
    //     name : "Ti.Types.toStr",
    //     args : "id:${id}"
    //   },
    //   comType : "wn-imgfile",
    //   comConf : {
    //     target : "~/.thumbnail/gen/${id}.jpg",
    //     filter : "cover(256,256)",
    //     quality : 0.372
    //   }
    // },
    thumb: {
      title: "i18n:wn-key-thumb",
      name: "thumb",
      checkEquals: false,
      rowSpan: 3,
      nameVAlign: "top",
      comType: "wn-upload-file",
      comConf: {
        valueType: "idPath",
        exlink: false,
        target: "~/.thumbnail/gen/${id}.jpg",
        filter: "cover(256,256)",
        quality: 0.372
      }
    },
    //---------------------------------------------
    race: {
      title: "i18n:wn-key-race",
      name: "race",
      comConf: {
        format: "i18n:wn-race-${race}"
      }
    },
    //---------------------------------------------
    mime: {
      title: "i18n:wn-key-mime",
      name: "mime",
      comConf: {
        className: "is-nowrap",
        editable: true
      }
    },
    //---------------------------------------------
    tp: {
      title: "i18n:wn-key-tp",
      name: "tp",
      comConf: {
        className: "is-nowrap",
        editable: true
      }
    },
    //---------------------------------------------
    ct: {
      title: "i18n:wn-key-ct",
      name: "ct",
      type: "AMS"
    },
    //---------------------------------------------
    lm: {
      title: "i18n:wn-key-lm",
      name: "lm",
      type: "AMS"
    },
    //---------------------------------------------
    expi: {
      title: "i18n:wn-key-expi",
      name: "expi",
      type: "AMS"
    },
    //---------------------------------------------
    pid: {
      title: "i18n:wn-key-pid",
      name: "pid",
      comType: "WnObjId"
    },
    //---------------------------------------------
    d0: {
      title: "i18n:wn-key-d0",
      name: "d0"
    },
    //---------------------------------------------
    d1: {
      title: "i18n:wn-key-d1",
      name: "d1"
    },
    //---------------------------------------------
    c: {
      title: "i18n:wn-key-c",
      name: "c"
    },
    //---------------------------------------------
    m: {
      title: "i18n:wn-key-m",
      name: "m"
    },
    //---------------------------------------------
    g: {
      title: "i18n:wn-key-g",
      name: "g"
    },
    //---------------------------------------------
    data: {
      title: "i18n:wn-key-data",
      name: "data"
    },
    //---------------------------------------------
    sha1: {
      title: "i18n:wn-key-sha1",
      name: "sha1",
      comConf: {
        className: "is-nowrap",
        fullField: false
      }
    },
    //---------------------------------------------
    md: {
      title: "i18n:wn-key-md",
      name: "md",
      type: "Integer",
      colSpan: 2,
      comType: "WnObjMode",
      comConf: {
        valueType: "decimal"
      }
    },
    //---------------------------------------------
    pvg: [
      {
        title: "i18n:wn-key-pvg"
      },
      {
        name: "pvg",
        type: "Object",
        colSpan: 3,
        comType: "TiInputText",
        comConf: {
          autoJsValue: true,
          height: 200
        }
      }
    ],
    //---------------------------------------------
    width: {
      title: "i18n:wn-key-width",
      name: "width"
    },
    //---------------------------------------------
    height: {
      title: "i18n:wn-key-height",
      name: "height"
    },
    //---------------------------------------------
    duration: {
      title: "i18n:wn-key-duration",
      name: "duration",
      width: "auto",
      comConf: {
        suffixText: "i18n:tu-sec"
      }
    },
    //---------------------------------------------
    len: {
      title: "i18n:wn-key-len",
      name: "len",
      width: "auto",
      transformer: (v) => Ti.S.sizeText(v, { bytes: true })
    }
    //---------------------------------------------
  };
  ////////////////////////////////////////////
  const R = 1 << 2;
  const W = 1 << 1;
  const X = 1;
  const RWX = R | W | X;
  ////////////////////////////////////////////
  const WnObj = {
    //----------------------------------------
    isValidName(newName) {
      // Check the newName contains the invalid char
      if (!newName || newName.search(/[%;:"'*?`\t^<>\/\\]/) >= 0) {
        Ti.Alert("i18n:wn-rename-invalid", { type: "warn" });
        return false;
      }
      // Check the newName length
      if (newName.length > 256) {
        Ti.Alert("i18n:wn-rename-too-long", { type: "warn" });
        return false;
      }
  
      return true;
    },
    //----------------------------------------
    octalModeToStr(octalMode) {
      let mode = parseInt(octalMode, 8);
      return WnObj.modeToStr(mode);
    },
    //----------------------------------------
    modeToStr(md) {
      let sb = [];
      for (let i = 2; i >= 0; i--) {
        let m = (md >> (i * 3)) & RWX;
        sb.push((m & R) > 0 ? "r" : "-");
        sb.push((m & W) > 0 ? "w" : "-");
        sb.push((m & X) > 0 ? "x" : "-");
      }
      return sb.join("");
    },
    //----------------------------------------
    modeToOctal(md) {
      return md.toString(8);
    },
    //----------------------------------------
    octalModeFromStr(mds) {
      let md = WnObj.modeFromStr(mds);
      return md.toString(8);
    },
    //----------------------------------------
    modeFromOctalMode(octalMode) {
      return parseInt(octalMode, 8);
    },
    //----------------------------------------
    modeFromStr(mds) {
      let md = 0;
      for (let i = 0; i < 3; i++) {
        let left = (2 - i) * 3;
        let cs = mds.substring(left, left + 3);
        let m = WnObj.modeFromStr0(cs);
        md |= m << (i * 3);
      }
      return md;
    },
    //----------------------------------------
    modeFromStr0(cs) {
      let m = 0;
      if (cs[0] == "r") m |= R;
      if (cs[1] == "w") m |= W;
      if (cs[2] == "x") m |= X;
      return m;
    },
    //----------------------------------------
    /*
    {
      owner: { readable, writable, excutable },
      member:{ readable, writable, excutable },
      other: { readable, writable, excutable }
    }
    */
    modeToObj(md) {
      let keys = ["other", "member", "owner"];
      let re = {
        mode: md,
        text: WnObj.modeToStr(md),
        octal: md.toString(8)
      };
      for (let i = 2; i >= 0; i--) {
        let m = (md >> (i * 3)) & RWX;
        let key = keys[i];
        re[key] = {
          readable: (m & R) > 0,
          writable: (m & W) > 0,
          excutable: (m & X) > 0
        };
      }
      return re;
    },
    //----------------------------------------
    modeFromObj({ owner, member, other } = {}) {
      let mdOwner = WnObj.mode0FromObj(owner);
      let mdMember = WnObj.mode0FromObj(member);
      let mdOther = WnObj.mode0FromObj(other);
  
      return (mdOwner << 6) | (mdMember << 3) | mdOther;
    },
    //----------------------------------------
    mode0FromObj({ readable, writable, excutable } = {}) {
      let md = 0;
      if (readable) md |= R;
      if (writable) md |= W;
      if (excutable) md |= X;
      return md;
    },
    //----------------------------------------
    parseMode(input, octal = false) {
      // Auto parse obj
      if (/^\{.+\}$/.test(input)) {
        input = JSON.parse(input);
      }
      // {readable,writable,excutable}
      // {owner: {...}, member, other}
      if (_.isPlainObject(input)) {
        if (input.readable) {
          return {
            owner: _.cloneDeep(input),
            member: _.cloneDeep(input),
            other: _.cloneDeep(input)
          };
        }
        return input;
      }
      //Blend mode
      let blend = "DEFAULT";
      if (_.isNumber(input) && input < 0) {
        blend = "WEAK";
        input = Math.abs(input);
      } else if (_.isString(input)) {
        let m = /^([!~])(.+)$/.exec(input);
        if (m) {
          blend = { "~": "WEAK", "!": "STRONG" }[m[1]];
          input = m[2];
        }
      }
  
      // Parse input
      let md = 0;
  
      // rwxr-x---
      if (/^[rwx-]{3,9}$/.test(input)) {
        if (3 == input.length) {
          md = WnObj.modeFromStr0(input);
        } else {
          md = WnObj.modeFromStr(input);
        }
      }
      // 0777
      else if (/^0[0-7]{3}$/.test(input)) {
        md = WnObj.modeFromOctalMode(input.substring(1));
      }
      // 777
      else if (octal) {
        md = WnObj.modeFromOctalMode(input);
      }
      // 7 -> 0777
      // 365
      else {
        md = parseInt(input);
        if (md <= 7) {
          md = (md << 6) | (md << 3) | md;
        }
      }
      // Done
      let re = WnObj.modeToObj(md);
      re.blend = blend;
      return re;
    },
    //----------------------------------------
    isBuiltInFields(key) {
      return FORM_FIELDS[key] ? true : false;
    },
    //----------------------------------------
    getGroupTitle(titleKey) {
      if (
        /^(basic|privilege|thumb|timestamp|more|advance|customized|others)$/.test(
          titleKey
        )
      )
        return `i18n:wn-key-grp-${titleKey}`;
      return titleKey;
    },
    //----------------------------------------
    getObjThumbDisplay(
      key = "..",
      { dftIcon = "fas-birthday-cake", className } = {}
    ) {
      return {
        key,
        type: "Object",
        transformer: {
          name: "Ti.Types.toObject",
          args: {
            icon: "icon",
            thumb: "thumb",
            type: "tp",
            mime: "mime",
            race: "race",
            timestamp: "__updated_time"
          }
        },
        comType: "wn-obj-icon",
        comConf: {
          className,
          "...": "${=value}",
          defaultIcon: dftIcon
          //"className"   : "thing-icon"
        }
      };
    },
    //----------------------------------------
    getTableFieldAs(key, type, iteratee = _.identity) {
      if (_.isFunction(type)) {
        iteratee = type;
        type = null;
      }
      let fld = { title: key };
      // Size
      if ("size" == type) {
        fld.display = {
          key: `rawData.${key}`,
          transformer: "Ti.S.sizeText",
          comConf: {
            className: "as-tip-block align-right"
          }
        };
      }
      // Time
      else if ("AMS" == type) {
        fld.display = {
          key: `rawData.${key}`,
          transformer: "Ti.DateTime.timeText",
          comConf: {
            className: "as-tip-block align-right is-nowrap"
          }
        };
      }
      // Default
      else {
        fld.display = {
          key: `rawData.${key}`
        };
      }
      // Done
      return iteratee(fld) || fld;
    },
    //----------------------------------------
    getTableField(key, setup = {}) {
      let tf;
      if (_.isString(key)) {
        tf = _.get(TABLE_FIELDS, key);
        if (!tf) {
          tf = {
            title: key,
            display: key
          };
        }
        // Dynamic
        if (_.isFunction(tf)) {
          tf = tf(key);
        }
      }
      // Dynamic
      else if (_.isFunction(key)) {
        tf = key();
      }
      // Object
      else {
        tf = key;
      }
      // done
      if (!_.isEmpty(setup)) {
        let tf2 = _.cloneDeep(tf);
        return _.assign(tf2, setup);
      }
      return tf;
    },
    //----------------------------------------
    getField(key) {
      let fld = FORM_FIELDS[key];
      if (fld) {
        return _.cloneDeep(fld);
      }
      return {
        title: key,
        name: key,
        type: "String",
        comConf: {
          className: "is-break-word"
        }
      };
    },
    //----------------------------------------
    evalFields(meta = {}, fields = [], iteratee = _.identity) {
      //......................................
      const __join_fields = function (flds = [], outs = [], keys = {}) {
        _.forEach(flds, (fld) => {
          // Remains fields
          // It will be deal with later
          if ("..." == fld) {
            outs.push(fld);
            return;
          }
          let f2;
          let quickName = false;
          // Quick Name
          if (_.isString(fld)) {
            quickName = true;
            f2 = Wn.Obj.getField(fld);
          }
          // Group
          else if (_.isArray(fld.fields)) {
            f2 = {
              ..._.omit(fld, "title", "type", "fields"),
              title: Wn.Obj.getGroupTitle(fld.title),
              type: "Group",
              fields: []
            };
            __join_fields(fld.fields, f2.fields, keys);
            if (_.isEmpty(f2.fields)) {
              return;
            }
          }
          // Normal field
          else {
            f2 = fld;
          }
          //......................................
          const _add_field = function (fld) {
            let uniqKey = Ti.S.join([fld.name], "-");
            keys[uniqKey] = true;
            let value = _.get(meta, fld.name);
            outs.push(
              _.assign(fld, {
                quickName,
                uniqKey,
                value
              })
            );
          };
          if (_.isArray(f2)) {
            for (let fld of f2) {
              _add_field(fld);
            }
          } else {
            _add_field(f2);
          }
          //......................................
        });
        return outs;
      };
      //......................................
      const __deal_with_remain_fields = function (
        flds = [],
        outs = [],
        keys = {}
      ) {
        for (let fld of flds) {
          // Group
          if (fld.type == "Group") {
            fld.fields = __deal_with_remain_fields(fld.fields, [], keys);
            if (!_.isEmpty(fld.fields)) {
              outs.push(fld);
            }
            continue;
          }
          // Remains
          if ("..." == fld) {
            _.forEach(meta, (v, k) => {
              // Ignore nil and built-in fields
              if (
                Ti.Util.isNil(v) ||
                Wn.Obj.isBuiltInFields(k) ||
                keys[k] ||
                "children" == k ||
                k.startsWith("_")
              ) {
                return;
              }
              // Auto com type
              let jsType = Ti.Types.getJsType(v, "String");
              let fldConf;
              // Auto detact timestamp :
              // Integer and more than 1977-09-21
              if (_.isNumber(v) && parseInt(v) === v && v > 243619200000) {
                fldConf = {
                  type: "AMS",
                  display: {
                    key: k,
                    transformer: "Ti.DateTime.format",
                    comConf: {
                      className: "ass-tip"
                    }
                  },
                  comType: "TiInputDatetime"
                };
              }
              // Normal field auto by type
              else {
                fldConf = {
                  Integer: {
                    type: "Number",
                    display: k,
                    comType: "ti-input"
                  },
                  Number: {
                    type: "Number",
                    display: k,
                    comType: "ti-input"
                  },
                  Boolean: {
                    type: "Boolean",
                    comType: "ti-toggle"
                  },
                  Array: {
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
                }[jsType] || {
                  type: "String",
                  display: {
                    key: k,
                    comConf: {
                      className: "is-nowrap"
                    }
                  },
                  comType: "ti-input"
                };
              }
  
              // Join
              let f2 = iteratee({
                title: k,
                name: k,
                ...fldConf
              });
              if (f2) {
                outs.push(f2);
              }
            });
          }
          // Normal fields
          else {
            let f2 = iteratee(fld);
            if (f2) {
              outs.push(f2);
            }
          }
        }
        return outs;
      };
      //......................................
      let usedKeys = {};
      let myFormFields = __join_fields(fields, [], usedKeys);
      myFormFields = __deal_with_remain_fields(myFormFields, [], usedKeys);
      //......................................
      return myFormFields;
    },
    //----------------------------------------
    // @return {currentTab:0, fields: [ [...] ]}
    async genObjFormFields({
      meta,
      fields = [],
      currentTab = 0,
      fixedKeys = ["icon", "thumb", "title"]
    } = {}) {
      //console.log("genObjFormFields", fixedKeys)
      //............................................
      // Fixed key map
      let fixeds = {};
      _.forEach(fixedKeys, (k) => (fixeds[k] = true));
      //............................................
      // Auto load
      if ("auto" == fields) {
        let reo = await Wn.Sys.exec2(`ti metas id:${meta.id} -cqn`, {
          as: "json"
        });
        if (reo) {
          fields = reo.fields;
          currentTab = reo.currentTab || currentTab || 0;
        }
      }
      //............................................
      // Default tabs
      if (_.isEmpty(fields) || !_.isArray(fields)) {
        fields = [
          {
            title: "basic",
            fields: [
              "id",
              "nm",
              "title",
              "icon",
              "thumb",
              "sort",
              "width",
              "height",
              "ph",
              "race",
              "tp",
              "mime",
              "len",
              "sha1",
              "pid"
            ]
          },
          {
            title: "privilege",
            fields: ["c", "m", "g", "md", "pvg"]
          },
          {
            title: "timestamp",
            fields: ["ct", "lm", "expi"]
          },
          {
            title: "others",
            gridColumnHint: [[1, 400], 0],
            fields: ["..."]
          }
        ];
      }
      //............................................
      let myFormFields = WnObj.evalFields(meta, fields, (fld) => {
        if (fixeds[fld.uniqKey]) {
          return fld;
        }
        if (fld.quickName && _.isUndefined(fld.value)) {
          return;
        }
        return fld;
      });
      //............................................
      return {
        currentTab,
        fields: myFormFields
      };
    },
    //----------------------------------------
    isAs(meta = {}, key, match) {
      let val = _.get(meta, key);
      if (Ti.Util.isNil(val)) {
        return false;
      }
      //......................................
      if (_.isArray(match)) {
        for (let mi of match) {
          if (WnObj.isAs(meta, key, mi)) {
            return true;
          }
        }
        return false;
      }
      //......................................
      if (_.isString(match)) {
        if (match.startsWith("^")) {
          return new RegExp(match).test(val);
        }
        if (match.startsWith("!^")) {
          return !new RegExp(match.substring(1)).test(val);
        }
        return val == match;
      }
      //......................................
      if (_.isRegExp(match)) {
        return match.test(val);
      }
      //......................................
      return false;
    },
    //----------------------------------------
    isMime(meta = {}, mime) {
      return WnObj.isAs(meta, "mime", mime);
    },
    //----------------------------------------
    isType(meta = {}, type) {
      return WnObj.isAs(meta, "type", type);
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
      fromIndex = 0,
      homePath = null,
      titleBy,
      iteratee = _.identity,
      self = _.identity
    } = {}) {
      let list = [];
      if (meta) {
        let ans = _.map(ancestors);
        // Find the first Index from home
        let i = fromIndex;
  
        // find by homePath
        if (homePath) {
          if (homePath.endsWith("/")) {
            homePath = homePath.substring(0, homePath.length - 1);
          }
          for (; i < ans.length; i++) {
            let an = ans[i];
            if (an.ph == homePath) {
              break;
            }
          }
        }
  
        // Show ancestors form Home
        for (; i < ans.length; i++) {
          let an = ans[i];
          let item = {
            icon: Wn.Util.getIconObj(an),
            text: Wn.Util.getObjDisplayName(an, titleBy),
            value: an.id,
            href: Wn.Util.getAppLink(an) + ""
          };
          item = iteratee(item, i, an);
          if (item) {
            list.push(item);
          }
        }
        // Top Item, just show title
        if (self) {
          let item = {
            icon: Wn.Util.getIconObj(meta),
            text: Wn.Util.getObjDisplayName(meta, titleBy),
            value: meta.id,
            href: null,
            asterisk: _.get(this.mainStatus, "changed")
          };
          // Customized
          if (_.isFunction(self)) {
            item = self(item, i, meta) || item;
          }
          // Join to list
          if (item) {
            list.push(item);
          }
        }
      }
      return list;
    }
    //----------------------------------------
  };
  ////////////////////////////////////////////
  return WnObj;
})();
//##################################################
// # import Session from "./wn-session.mjs"
const Session = (function(){
  ////////////////////////////////////////////
  const PVGS = {};
  const ENVS = {};
  const SESSION = {};
  ////////////////////////////////////////////
  const WnSession = {
    //----------------------------------------
    async setup({ id, uid, unm, me, grp, by_tp, by_val, envs = {} } = {}) {
      _.assign(SESSION, {
        id,
        uid,
        unm,
        me,
        grp,
        by_tp,
        by_val
      });
      WnSession.env(envs);
      Ti.Env("theme", envs.THEME);
  
      //let offsetInMs = await Wn.Sys.timeOffsetInMs();
      //Ti.Env("REMOTE_TIME_OFFSET_IN_MS", offsetInMs);
      Ti.Env("REMOTE_TIME_OFFSET_IN_MS", 0);
  
      // Get TimeZone
      let re = _.trim(await Wn.Sys.exec2("date -zone"));
      //console.log("!!!!!!!!!!!!!!!!!!", re);
      let m = /^(GMT)([+-][\d:]+)\/(\d+)$/.exec(re);
      if (m) {
        let tzOff_remote = m[3] * 1;
        Ti.Env("TIMEZONE_OFFSET_REMOTE", tzOff_remote);
  
        // The Js standard return -480 when GMT+8
        let tzOff_local = new Date().getTimezoneOffset() * -60000;
        Ti.Env("TIMEZONE_OFFSET_LOCAL", tzOff_local);
  
        // Get the diff value of rmote - local.
        Ti.Env("TIMEZONE_DIFF", tzOff_remote - tzOff_local);
      }
    },
    //----------------------------------------
    env(vars) {
      // Set Env
      if (_.isPlainObject(vars)) {
        _.assign(ENVS, vars);
      }
      // GET one
      else if (_.isString(vars)) {
        return ENVS[vars];
      }
      // Pick
      else if (_.isArray(vars)) {
        return _.pick(ENVS, vars);
      }
      // Get Env
      return _.cloneDeep(ENVS);
    },
    //----------------------------------------
    getLang() {
      return WnSession.env("LANG");
    },
    //----------------------------------------
    getMyId() {
      return SESSION.uid;
    },
    getMyName() {
      return SESSION.unm;
    },
    getMyGroup() {
      return SESSION.grp;
    },
    getMyJobs() {
      return SESSION.me.jobs || [];
    },
    getMyDepts() {
      return SESSION.me.depts || [];
    },
    //----------------------------------------
    getByType() {
      return SESSION.by_tp;
    },
    isByType(type) {
      if (_.isRegExp(type)) {
        return type.test(SESSION.by_tp);
      }
      if (_.isString(type) && type.startsWith("^")) {
        return new RegExp(type).test(SESSION.by_tp);
      }
      return type == SESSION.by_tp;
    },
    //----------------------------------------
    getByValue() {
      return SESSION.by_val;
    },
    isByValue(val) {
      if (_.isRegExp(val)) {
        return val.test(SESSION.by_val);
      }
      if (_.isString(val) && val.startsWith("^")) {
        return new RegExp(val).test(SESSION.by_val);
      }
      return val == SESSION.by_val;
    },
    //----------------------------------------
    getMe() {
      return SESSION.me;
    },
    //----------------------------------------
    I_am_SysAccount() {
      let rid = _.get(SESSION.me, "roleInDomain");
      return rid ? false : true;
    },
    //----------------------------------------
    I_am_domain_ADMIN() {
      let rid = _.get(SESSION.me, "roleInDomain");
      return "ADMIN" == rid;
    },
    //----------------------------------------
    I_am_domain_MEMBER() {
      let rid = _.get(SESSION.me, "roleInDomain");
      return /^(ADMIN|MEMEBER)$/.test(rid);
    },
    //----------------------------------------
    I_am_op_ADMIN() {
      let rid = _.get(SESSION.me, "roleInOp");
      return "ADMIN" == rid;
    },
    //----------------------------------------
    I_am_op_MEMBER() {
      let rid = _.get(SESSION.me, "roleInOp");
      return /^(ADMIN|MEMEBER)$/.test(rid);
    },
    //----------------------------------------
    async loadMyPvg() {
      let pvgs = await Wn.Sys.exec2("www pvg -cqn", { as: "json" });
      _.assign(PVGS, pvgs);
      return PVGS;
    },
    //----------------------------------------
    getAllPvgs() {
      return _.cloneDeep(PVGS);
    },
    //----------------------------------------
    isPvgCanOne(...actions) {
      if (PVGS["$SYS_USR"] && /^(admin|memeber)$/.test(SESSION.me.role)) {
        return true;
      }
      for (let a of actions) {
        if (PVGS[a]) {
          return true;
        }
      }
      return false;
    },
    //----------------------------------------
    isPvgCanAll(...actions) {
      if (PVGS["$SYS_USR"] && /^(admin|memeber)$/.test(SESSION.me.role)) {
        return true;
      }
      for (let a of actions) {
        if (!PVGS[a]) {
          return false;
        }
      }
      return true;
    },
    //----------------------------------------
    //          AND
    // pvg: ["A+B+C",...] => or
    isPvgCan(pvg, dft = true) {
      if (_.isEmpty(pvg)) {
        return dft;
      }
      let list = _.concat(pvg);
      for (let li of list) {
        let ss = li.split("+");
        ss = _.map(ss, (s) => _.trim(s));
        if (!WnSession.isPvgCanAll(ss)) {
          return false;
        }
      }
      return true;
    },
    //----------------------------------------
    getHomePath() {
      return WnSession.env("HOME");
    },
    //----------------------------------------
    getCurrentPath(dft = "~") {
      return WnSession.env("PWD") || dft;
    },
    //----------------------------------------
    // Analyze the current domain
    getCurrentDomain() {
      let home = WnSession.getHomePath();
      if (!home) {
        return;
      }
      // For root
      if ("/root" == home) return "root";
  
      // Others
      let m = /^\/home\/(.+)$/.exec(home);
      if (m) {
        return m[1];
      }
    },
    //----------------------------------------
    getApiPrefix() {
      let dmn = WnSession.getCurrentDomain();
      return `/api/${dmn}`;
    },
    //----------------------------------------
    getApiUrl(url) {
      let prefix = WnSession.getApiPrefix();
      return Ti.Util.appendPath(prefix, url);
    }
    //----------------------------------------
  };
  ////////////////////////////////////////////
  return WnSession;
})();
//##################################################
// # import Sys from "./wn-sys.mjs"
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
  const DFT_MACRO_OBJ_SEP = "%%wn.meta." + Ti.Random.str(10) + "%%";
  ////////////////////////////////////////////
  const WnSys = {
    //-------------------------------------
    async exec(
      cmdText,
      {
        vars = undefined,
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
      } = {}
    ) {
      // Eval command
      if (vars) {
        cmdText = Ti.S.renderBy(cmdText, vars);
      }
      // Prepare
      let url = `/a/run/${appName}`;
      let params = {
        "mos": macroObjSep,
        "PWD": PWD,
        "cmd": cmdText,
        "in": input,
        "ffb": forceFlushBuffer
      };
      // Prepare analyzer
      let ing = { eachLine, macroObjSep };
      if (autoRunMacro) {
        ing.macro = {
          update_envs: (envs) => {
            Wn.Session.env(envs);
            Wn.doHook("update_envs", envs);
          }
        };
      }
      let parsing = new WnSysRespParsing(ing);
  
      // Watch each line if necessary
      let readyStateChanged = undefined;
      if (forceFlushBuffer && _.isFunction(eachLine)) {
        readyStateChanged = () => {
          parsing.updated();
        };
      }
  
      // Request remote
      await Ti.Http.send(url, {
        method: "POST",
        params,
        as: "text",
        created: ($req) => {
          parsing.init(() => $req.responseText);
        },
        readyStateChanged
      })
        .catch(($req) => {
          parsing.isError = true;
        })
        .finally(() => {
          parsing.done();
        });
  
      // Get result
      let re = parsing.getResult();
      // Then we got the result
      if (Ti.IsInfo("Wn.Sys")) {
        console.log("Wn.Sys.exec@return", re);
      }
  
      // Handle error
      if (parsing.isError) {
        let str = re.lines.join("\n");
        if (_.isFunction(errorBy)) {
          let [code, ...datas] = str.split(/ *: */);
          let data = datas.join(" : ");
          code = _.trim(code);
          let msgKey = code.replace(/[.]/g, "-");
          return errorBy({
            code,
            msgKey,
            data
          });
        }
        // Just throw it
        else {
          throw str;
        }
      }
  
      // Evaluate the result
      return {
        raw: () => re,
        lines: () => re.lines,
        macro: () => re.macro,
        text: () => {
          return re.lines.join("\n");
        },
        json: () => {
          let json = re.lines.join("\n");
          if (Ti.S.isBlank(json)) {
            json = blankAs;
          }
          // Try parse json
          try {
            return JSON.parse(json);
          } catch (e) {
            console.error(`Error [${cmdText}] for parse JSON:`, json);
            throw e;
          }
        },
        jso: () => {
          let json = re.lines.join("\n");
          if (Ti.S.isBlank(json)) {
            json = blankAs;
          }
          // Try eval json
          try {
            return eval("(" + json + ")");
          } catch (e) {
            console.error(`Error [${cmdText}] for eval JSO:`, json);
            throw e;
          }
        }
      }[as]();
    },
    //-------------------------------------
    async exec2(cmdText, options = {}) {
      // Default error process
      _.defaults(options, {
        errorBy: async function ({ code, msgKey, data }) {
          //console.log(code, msgKey, data)
          // Eval error message
          let msg = Ti.I18n.get(msgKey);
          if (!Ti.Util.isNil(data) && (!_.isString(data) || data)) {
            msg += " : " + Ti.Types.toStr(data);
          }
          // Show it to user
          await Ti.Alert(msg, {
            title: "i18n:warn",
            type: "error"
          });
          // Customized processing
          if (_.isFunction(options.errorAs)) {
            return options.errorAs({ code, msgKey, data });
          }
          return Ti.Err.make(code, data);
        }
      });
      // Run command
      return await Wn.Sys.exec(cmdText, options);
    },
    //-------------------------------------
    async execJson(cmdText, options = { as: "json" }) {
      return await WnSys.exec(cmdText, options);
    },
    //-------------------------------------
    async exec2Json(cmdText, options = { as: "json" }) {
      return await WnSys.exec2(cmdText, options);
    },
    //-------------------------------------
    async nowInMs() {
      let re = await WnSys.exec2("date -ms");
      return re * 1;
    },
    //-------------------------------------
    /**
     * return the gap between server and local.
     * <p> So if you want to get server time,you can
     * local + offset
     *
     * @returns serverTime - localTime
     */
    async timeOffsetInMs() {
      let now = Date.now();
      let ams = await WnSys.nowInMs();
      return ams - now;
    }
    //-------------------------------------
  };
  ////////////////////////////////////////////
  return WnSys;
})();
//##################################################
// # import Util from "./wn-util.mjs"
const Util = (function(){
  ////////////////////////////////////////////
  const WnUtil = {
    toFuzzyStr(str, strictStart = false) {
      if (!str || str.startsWith("^")) return str;
  
      if (strictStart) return "^" + str;
      return "^.*" + str;
    },
    fromFuzzyStr(str) {
      let m = /^(\^(\.\*)?)(.+)((\.\*)?\$)?$/.exec(str);
      if (m) {
        return m[3];
      }
      return str;
    },
    isMimeText(mime) {
      return (
        /^text\//.test(mime) ||
        "application/x-javascript" == mime ||
        "application/json" == mime
      );
    },
    isMimeJson(mime) {
      return "text/json" == mime || "application/json" == mime;
    },
    // adapt for old versiton walnut icon attribute
    getIconName(iconHtml) {
      let m =
        /^<i +class=["'] *(fa|zmdi|im) +(fa|zmdi|im)-([^" ]+) *["']> *<\/i>$/.exec(
          iconHtml
        );
      if (m) {
        return m[3];
      }
      return iconHtml;
    },
    /***
     * Gen preview object for a object
     */
    genPreviewObj(meta) {
      // Uploaded thumb preview
      if (meta.thumb) {
        // Remove image resource
        if (/https?:\/\//.test(meta.thumb)) {
          return {
            type: "image",
            value: meta.thumb
          };
        }
  
        // Load walnut obj thunbmail
        return {
          type: "image",
          value: "/o/thumbnail/id:" + meta.id
        };
      }
      // Customized Icon
      if (meta.icon) {
        let icon = WnUtil.getIconName(meta.icon);
        return Ti.Icons.get(icon, {
          type: "font",
          value: icon
        });
      }
      // Default
      return Ti.Icons.get(meta);
    },
    getIconObj(meta) {
      if (meta && meta.icon) {
        return meta.icon;
      }
      // return default
      return Ti.Icons.get(meta);
    },
    getObjIcon(meta, dft) {
      if (!meta) return dft;
      return meta.icon || Ti.Icons.get(meta, dft);
    },
    /***
     * Get icon or thumb for a WnObj
     */
    getObjThumbIcon(
      { icon, thumb, mime, type, race, candidateIcon, timestamp = 0 } = {},
      dftIcon
    ) {
      //console.log("getObjThumbIcon", {icon,race, mime})
      // Thumb as image
      if (thumb) {
        let src = `/o/content?str=${thumb}`;
        if (timestamp > 0) {
          src += `&_t=${timestamp}`;
        }
        return {
          type: "image",
          value: src
        };
      }
      //.............................................
      // Icon
      if (icon) {
        return {
          type: "font",
          value: icon
        };
      }
      //.............................................
      // Force Default
      if (candidateIcon) {
        return candidateIcon;
      }
      //.............................................
      // Auto get by type
      if (type || mime || race) {
        return Ti.Icons.get({ type, mime, race });
      }
      // Default
      return dftIcon;
    },
    getObjThumbIcon2(meta, canIcon) {
      //console.log(meta, canIcon)
      if (meta) {
        if (meta.thumb) {
          let src;
          if (/^https?:\/\//.test(meta.thumb)) {
            src = meta.thumb;
          } else {
            src = `/o/content?str=${meta.thumb}`;
          }
          return {
            type: "image",
            value: src
          };
        }
  
        if (meta.icon) {
          return meta.icon;
        }
      }
  
      if (canIcon) return canIcon;
  
      return Ti.Icons.get(meta);
    },
    /***
     * return the object readable name
     */
    getObjDisplayName(meta, keys = []) {
      return Ti.Util.getFallbackEmpty(meta, keys, "title", "nm");
    },
    /***
     * Get Object link as `String`
     *
     * @param meta{String|Object} : Object meta or id as string
     * @param options.appName{String} : Walnut App Name, "wn.manager" as default
     * @param options.encoded{Boolean} : Encode the path or not
     */
    getAppLink(meta, { appName = "wn.manager", encoded = false } = {}) {
      // Auto Path key
      let pathKey;
      if (/^(\/|~|id:)/.test(meta)) {
        pathKey = "ph";
      }
      // META: "478e..6ea2"
      else if (_.isString(meta)) {
        pathKey = "id";
      }
      // META: {id:"478e..6ea2"}
      else if (meta.id) {
        pathKey = "id";
      }
      // META: {ph:"/path/to/obj"}
      else if (meta.ph) {
        pathKey = "ph";
      }
      return WnUtil.getLink(`/a/open/${appName}`, meta, {
        pathKey,
        encoded
      });
    },
    getAppLinkStr(meta, options) {
      if (meta) {
        return WnUtil.getAppLink(meta, options).toString();
      }
    },
    getObjBadges(meta = {}, setup) {
      // Totaly customized
      if (_.isFunction(setup)) {
        return setup(meta);
      }
  
      let {
        NW = null,
        NE = ["ln", "zmdi-open-in-new"],
        SW = null,
        SE = null
      } = setup || {};
  
      let badges = {};
  
      let _eval_badge = function (name, BD) {
        if (_.isFunction(BD)) {
          BD = BD(meta);
        }
        if (!BD) return;
  
        // Quick badge：　// ["isOpen", "fas-xxxx"]
        if (_.isArray(BD) && BD.length > 0) {
          // Quick badge：　// ["isOpen", "fas-xxxx"]
          if (BD.length == 2 && _.isString(BD[0])) {
            badges[name] = BD[1];
          }
          // Branche Badge
          // ["K1", AutoMatch, "fas-xxxx"]
          // [["K1", "K2"], AutoMatch, "fas-xxxx"]
          // ["K1", [{test:AutoMatch, badge:"fas-xxxx"}]]
          // TODO ..
        }
        // Auto match badge
        else if (_.isPlainObject(BD)) {
          // Test Badge
          /* {test:{...}, value:"fas-xxx"} */
          if (BD.value) {
            //console.log("haha", BD)
            if (BD.test && !Ti.AutoMatch.test(BD.test, meta)) {
              return;
            }
            let bag = Ti.Util.explainObj(meta, {
              type: BD.type || "icon",
              className: BD.className,
              style: BD.style,
              value: BD.value
            });
            if (bag) {
              badges[name] = bag;
            }
          }
          // Mapping Badge
          /* {key:"tp", badges: {docx:"fas-xxx", pdf:"fas-xxx"}} */
          else if ((BD.key, BD.badges)) {
            let val = _.get(meta, BD.key);
            let bag = BD.badges[val];
            if (bag) {
              if (_.isString(bag)) {
                bag = { value: bag };
              }
              badges[name] = { 
                type: "icon", 
                className: "as-label-70 is-primary",
                ...bag 
              };
            }
          }
        }
        // Static badge
        else {
          badges[name] = BD;
        }
      };
  
      _eval_badge("NW", NW);
      _eval_badge("NE", NE);
      _eval_badge("SW", SW);
      _eval_badge("SE", SE);
  
      return badges;
    },
    getObjThumbInfo(
      meta = {},
      {
        exposeHidden = false,
        status = {},
        progress = {},
        badges = undefined,
        titleKey = undefined
      } = {}
    ) {
      // Guard
      if (!meta || !meta.nm) {
        return;
      }
      // Check the visibility
      let visibility = "show";
      if (meta.nm.startsWith(".")) {
        if (exposeHidden) {
          visibility = exposeHidden ? "weak" : "hide";
        }
      }
      let ttKey = titleKey;
      if (_.isFunction(titleKey)) {
        ttKey = titleKey();
      }
      // Generate new Thumb Item
      return {
        id: meta.id,
        nm: meta.nm,
        title: WnUtil.getObjDisplayName(meta, ttKey),
        preview: WnUtil.genPreviewObj(meta),
        href: WnUtil.getAppLinkStr(meta),
        visibility,
        status: status[meta.id],
        progress: progress[meta.id],
        badges: WnUtil.getObjBadges(meta, badges),
        rawData: meta
      };
    },
    /***
     * Get object link for download
     */
    getDownloadLink(meta, { mode = "force", timestamp } = {}) {
      return WnUtil.getLink(`/o/content`, meta, {
        pathKey: "str",
        encoded: true,
        params: {
          d: mode,
          _ts: timestamp
        }
      });
    },
    getDownloadLinkStr(meta, options) {
      if (meta) {
        return WnUtil.getDownloadLink(meta, options).toString();
      }
    },
    /**
     * Eval filter obj {keyword, match, majorKey, majorValue}
     * to the query object match
     *
     * @param keyword{String} - Keyword to search. the `setting.keyword` will
     *        explain the meaning
     * @param match{Object} - match object
     * @param majorKey{String} - key of the major search condition
     * @param majorValue{Any} - value of the major search condition
     * @param setting{Object} - Setting object:
     * ```js
     * {
     *    "defaultKey" : "nm",
     *    "keyword": {
     *       "=id"   : "^[\\d\\w]{26}$",
     *       "~nm"   : "^[a-z0-9]{10}$",
     *       "title" : "^.+"
     *    },
     *    match : {  ...fixed matcher ... },
     *    majorKey : "key_xxx"
     * }
     * ```
     */
    getMatchByFilter(
      { keyword, match, majorKey, majorValue } = {},
      setting = {}
    ) {
      let flt = {};
      //console.log("getMatchByFilter", {match, setting})
      //............................................
      // compatibable mode, the majorKey can declare in settings also
      // And in higher priority
      majorKey = setting.majorKey || majorKey;
      //............................................
      // Eval Filter: keyword
      if (keyword) {
        if (/"^[\d\w]{26}(:.+)?$"/.test(keyword)) {
          flt.id = keyword;
        }
        // Find
        else {
          let knm = setting.defaultKey || "nm";
          let keywordSet = _.cloneDeep(setting.keyword);
          let keys = _.keys(keywordSet);
          //........................................
          for (let k of keys) {
            let val = keywordSet[k];
            if (new RegExp(val).test(keyword)) {
              knm = k;
              break;
            }
          }
          //........................................
          // Accurate equal
          if (knm.startsWith("=")) {
            flt[knm.substring(1).trim()] = keyword;
          }
          // Startwith
          else if (knm.startsWith("~")) {
            flt[knm.substring(1).trim()] = "^" + keyword;
          }
          // Default is like
          else {
            flt[knm] = "^.*" + keyword;
          }
          //........................................
        }
      }
      //............................................
      // Eval Filter: match
      if (!_.isEmpty(match)) {
        _.forEach(match, (val, key) => {
          if (!Ti.Util.isNil(val)) {
            flt[key] = val;
          }
        });
      }
      //............................................
      // Eval Filter: major
      if (majorKey && !Ti.Util.isNil(majorValue)) {
        _.set(flt, majorKey, majorValue);
      }
      //............................................
      // Fix filter
      let fixedMatch = setting.match;
      if (!_.isEmpty(fixedMatch)) {
        _.assign(flt, fixedMatch);
      }
      //............................................
      // Done
      return flt;
      //............................................
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
    getLink(url, meta, { pathKey = "ph", encoded = false, params = {} } = {}) {
      if (_.isEmpty(meta)) {
        return { url, params };
      }
      let params2 = { ...params };
      const __V = (val) => {
        return encoded ? encodeURIComponent(val) : val;
      };
      // META: "~/path/to/obj"
      if (/^(\/|~|id:)/.test(meta)) {
        params2[pathKey] = __V(meta);
      }
      // META: "478e..6ea2"
      else if (_.isString(meta)) {
        params2[pathKey] = "id" == pathKey ? meta : `id:${meta}`;
      }
      // META: {id:"478e..6ea2"}
      else if (meta.id) {
        params2[pathKey] = "id" == pathKey ? meta.id : `id:${meta.id}`;
      }
      // META: {ph:"/path/to/obj"}
      else if (meta.ph) {
        params2[pathKey] = __V(meta.ph);
      }
      // Default return
      return Ti.Util.Link({
        url,
        params: params2
      });
    },
    /***
     * Wrap meta to standard tree node
     *
     * @param meta{Object} - WnObj meta data
     *
     * @return TreeNode: {id,name,leaf,rawData,children}
     */
    wrapTreeNode(meta) {
      if (_.isPlainObject(meta)) {
        let node = {
          id: meta.id,
          name: meta.nm,
          leaf: "DIR" != meta.race,
          rawData: meta
        };
        if (!node.leaf) {
          node.children = [];
        }
        if (node.id && node.name) {
          return node;
        }
      }
    },
    /***
     * @param query{String|Function}
     */
    genQuery(
      query,
      { vkey = "val", wrapArray = false, errorAs, blankAs = "[]" } = {}
    ) {
      // Customized query
      if (_.isFunction(query)) {
        return query;
      }
      // Array
      if (_.isArray(query)) {
        if (wrapArray) {
          return () => query;
        }
        return query;
      }
      // Command template
      if (_.isString(query)) {
        // Query by value
        if (vkey) {
          return async (v) => {
            let cmdText = Ti.S.renderBy(query, { [vkey]: v });
            //console.log("exec", cmdText)
            return await Wn.Sys.exec2(cmdText, {
              as: "json",
              input: v,
              errorAs,
              blankAs
            });
          };
        }
        // Query directly
        else {
          return async (v) => {
            return await Wn.Sys.exec2(query, {
              as: "json",
              errorAs,
              blankAs
            });
          };
        }
      }
    },
    //-------------------------------------------
    //
    // Module help methods
    //
    //-------------------------------------------
    setFieldStatusBeforeUpdate({ commit }, name) {
      commit("setFieldStatus", {
        name,
        type: "spinning",
        text: "i18n:saving"
      });
    },
    setFieldStatusAfterUpdate({ commit }, name, reo) {
      let isError = reo instanceof Error;
      if (isError) {
        commit("setFieldStatus", {
          name,
          type: "warn",
          text: reo.message || "i18n:fail"
        });
      } else {
        commit("setFieldStatus", {
          name,
          type: "ok",
          text: "i18n:ok"
        });
        _.delay(() => {
          commit("clearFieldStatus", name);
        }, 500);
      }
    }
    //-------------------------------------------
  };
  ////////////////////////////////////////////
  return WnUtil;
})();
//##################################################
// # import Dict from "./wn-dict.mjs"
const Dict = (function(){
  ///////////////////////////////////////////////////////////
  const WnDict = {  
    /***
     * @return {Ti.Dict}
     */
    evalOptionsDict({
      options, dictVars,
      findBy, itemBy, childrenBy,
      valueBy, textBy, iconBy,
      dictShadowed = true
    }, hooks) {
      // Quck Dict Name
      let dictName = Ti.DictFactory.DictReferName(options)
      // console.log("evalOptionsDict", options)
      // if("ComDeptJobs" == dictName) {
      //   console.log("haha", {options, dictKey, dictVars})
      // }
      if(dictName) {
        let {name, dynamic, dictKey} = Ti.DictFactory.explainDictName(dictName)
        //
        // Dynamic dictionary
        //
        if(dynamic) {
          let key = _.get(dictVars, dictKey)
          if(!key) {
            return null
          }
          return Ti.DictFactory.CheckDynamicDict({
            name, key,
            vars : dictVars
          })
        }
        //
        // Static dictionary
        //
        return Ti.DictFactory.CheckDict(dictName, hooks)
      }
  
      // Explaint anonymity dictionary
      return Ti.DictFactory.CreateDict({
        dataChildrenKey : options.dataChildrenKey,
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
        //
        // Dynamic
        //
        if(dict.dynamic) {
          let ddef = _.pick(dict, 
            "dataChildrenKey",
            "data", "query", "item", "children",
            "value", "text", "icon", "shadowed")
          Ti.DictFactory.CreateDynamicDict(function(vars={}){
            let dobj = Ti.Util.explainObj(vars, ddef)
            return Ti.DictFactory.CreateDict({
              dataChildrenKey : dobj.dataChildrenKey,
              //...............................................
              data  : Wn.Util.genQuery(dobj.data, {vkey:null}),
              query : Wn.Util.genQuery(dobj.query),
              item  : Wn.Util.genQuery(dobj.item, {
                blankAs: "{}"
              }),
              children : Wn.Util.genQuery(dobj.children),
              //...............................................
              getValue : Ti.Util.genGetter(dobj.value),
              getText  : Ti.Util.genGetter(dobj.text),
              getIcon  : Ti.Util.genGetter(dobj.icon),
              //...............................................
              shadowed : Ti.Util.fallback(dobj.shadowed, true)
              //...............................................
            })
          }, name)
        }
        //
        // Static
        //
        else {
          let d = Ti.DictFactory.GetDict(name)
          if(!d) {
            //console.log("create", name, dict)
            Ti.DictFactory.CreateDict({
              dataChildrenKey : dict.dataChildrenKey,
              //...............................................
              data  : Wn.Util.genQuery(dict.data, {vkey:null}),
              query : Wn.Util.genQuery(dict.query),
              item  : Wn.Util.genQuery(dict.item, {
                blankAs: "{}"
              }),
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
// # import Hm from "./wn-hmaker.mjs"
const Hm = (function(){
  ////////////////////////////////////////////////////////
  const BORDER = {
    title: "i18n:hmk-css-border",
    name: "border",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const BORDER_RADIUS = {
    title: "i18n:hmk-css-border-radius",
    name: "border-radius",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const MARGIN = {
    title: "i18n:hmk-css-margin",
    name: "margin",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const PADDING = {
    title: "i18n:hmk-css-padding",
    name: "padding",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const BACKGROUND = {
    title: "i18n:hmk-css-background",
    name: "background",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const BACKGROUND_IMAGE = {
    title: "i18n:hmk-css-background-image",
    name: "background-image",
    fieldWidth: "100%",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const BACKGROUND_REPEAT = {
    title: "i18n:hmk-css-background-repeat",
    name: "background-repeat",
    comType: "TiDroplist",
    comConf: {
      placeholder: "i18n:no-set",
      options: "#CssBackgroundRepeats"
    }
  };
  //------------------------------------------------------
  const BACKGROUND_POSITION = {
    title: "i18n:hmk-css-background-position",
    name: "background-position",
    comType: "TiDroplist",
    comConf: {
      options: "#CssBackgroundPositions"
    }
  };
  //------------------------------------------------------
  const BACKGROUND_POSITION_X = {
    title: "i18n:hmk-css-background-position-x",
    name: "background-position-x",
    comType: "TiSwitcher",
    comConf: {
      options: "#CssBackgroundXPositions"
    }
  };
  //------------------------------------------------------
  const BACKGROUND_POSITION_Y = {
    title: "i18n:hmk-css-background-position-y",
    name: "background-position-y",
    comType: "TiSwitcher",
    comConf: {
      options: "#CssBackgroundYPositions"
    }
  };
  //------------------------------------------------------
  const BACKGROUND_SIZE = {
    title: "i18n:hmk-css-background-size",
    name: "background-size",
    width: "full",
    comType: "TiSwitcher",
    comConf: {
      options: "#CssBackgroundSizes"
    }
  };
  //------------------------------------------------------
  const BACKGROUND_COLOR = {
    title: "i18n:hmk-css-background-color",
    name: "background-color",
    comType: "ti-input-color"
  };
  //------------------------------------------------------
  const COLOR = {
    title: "i18n:hmk-css-color",
    name: "color",
    comType: "ti-input-color"
  };
  //------------------------------------------------------
  const OPACITY = {
    title: "i18n:hmk-css-opacity",
    name: "opacity",
    type: "Float",
    defaultAs: 1.0,
    comType: "TiSlideBar",
    comConf: {
      className: "hdl-lg inner-color-0 hdl-color-0",
      width: "100%",
      textWidth: ".5rem",
      prefixText: false
    }
  };
  //------------------------------------------------------
  const FLOAT = {
    title: "i18n:hmk-css-float",
    name: "float",
    comType: "TiSwitcher",
    comConf: {
      options: [
        { value: "none", text: "i18n:hmk-css-float-none", icon: "fas-align-justify" },
        { value: "left", text: "i18n:hmk-css-float-left", icon: "fas-align-left" },
        { value: "right", text: "i18n:hmk-css-float-right", icon: "fas-align-right" }
      ]
    }
  };
  //------------------------------------------------------
  const TEXT_ALIGN = {
    title: "i18n:hmk-css-text-align",
    name: "text-align",
    comType: "TiSwitcher",
    comConf: {
      options: [
        { value: "left", tip: "i18n:hmk-css-align-left", icon: "fas-align-left" },
        { value: "center", tip: "i18n:hmk-css-align-center", icon: "fas-align-center" },
        { value: "right", tip: "i18n:hmk-css-align-right", icon: "fas-align-right" },
        { value: "justify", tip: "i18n:hmk-css-align-justify", icon: "fas-align-justify" }
      ]
    }
  };
  //------------------------------------------------------
  const WHITE_SPACE = {
    title: "i18n:hmk-css-white-space",
    name: "white-space",
    comType: "TiDroplist",
    comConf: {
      options: [
        { value: "normal", text: "i18n:hmk-css-white-space-normal" },
        { value: "nowrap", text: "i18n:hmk-css-white-space-nowrap" },
        { value: "pre", text: "i18n:hmk-css-white-space-pre" },
        { value: "pre-wrap", text: "i18n:hmk-css-white-space-pre-wrap" },
        { value: "pre-line", text: "i18n:hmk-css-white-space-pre-line" },
        { value: "break-space", text: "i18n:hmk-css-white-space-break-space" }
      ]
    }
  };
  //------------------------------------------------------
  const TEXT_OVERFLOW = {
    title: "i18n:hmk-css-text-overflow",
    name: "text-overflow",
    comType: "TiSwitcher",
    comConf: {
      options: [
        { value: "clip", text: "i18n:hmk-css-text-overflow-clip", icon: "fas-cut" },
        { value: "ellipsis", text: "i18n:hmk-css-text-overflow-ellipsis", icon: "fas-ellipsis-h" }
      ]
    }
  };
  //------------------------------------------------------
  const OBJECT_FIT = {
    title: "i18n:hmk-css-object-fit",
    name: "object-fit",
    comType: "TiDroplist",
    comConf: {
      placeholder: "i18n:no-set",
      options: [
        { value: "fill", text: "i18n:hmk-css-object-fit-fill" },
        { value: "contain", text: "i18n:hmk-css-object-fit-contain" },
        { value: "cover", text: "i18n:hmk-css-object-fit-cover" },
        { value: "none", text: "i18n:hmk-css-object-fit-none" },
        { value: "scale-down", text: "i18n:hmk-css-object-fit-scale-down" }
      ]
    }
  };
  //------------------------------------------------------
  const OBJECT_POSITION = {
    title: "i18n:hmk-css-object-position",
    name: "object-position",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const BOX_SHADOW = {
    title: "i18n:hmk-css-box-shadow",
    name: "box-shadow",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const TEXT_SHADOW = {
    title: "i18n:hmk-css-text-shadow",
    name: "text-shadow",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const OVERFLOW = {
    title: "i18n:hmk-css-overflow",
    name: "overflow",
    fieldWidth: "100%",
    comType: "TiSwitcher",
    comConf: {
      options: [
        { value: "auto", text: "i18n:hmk-css-c-auto" },
        { value: "scroll", text: "i18n:hmk-css-overflow-scroll" },
        { value: "hidden", text: "i18n:hmk-css-overflow-hidden" },
        { value: "clip", text: "i18n:hmk-css-overflow-clip" },
        { value: "visible", text: "i18n:hmk-css-overflow-visible" }
      ]
    }
  };
  //------------------------------------------------------
  const TEXT_TRANSFORM = {
    title: "i18n:hmk-css-text-transform",
    name: "text-transform",
    comType: "TiSwitcher",
    comConf: {
      options: [
        { value: "capitalize", text: "i18n:hmk-css-text-transform-capitalize" },
        { value: "uppercase", text: "i18n:hmk-css-text-transform-uppercase" },
        { value: "lowercase", text: "i18n:hmk-css-text-transform-lowercase" }
      ]
    }
  };
  //------------------------------------------------------
  const WIDTH = {
    title: "i18n:hmk-css-width",
    name: "width",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const HEIGHT = {
    title: "i18n:hmk-css-height",
    name: "height",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const MAX_WIDTH = {
    title: "i18n:hmk-css-max-width",
    name: "max-width",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const MAX_HEIGHT = {
    title: "i18n:hmk-css-max-height",
    name: "max-height",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const MIN_WIDTH = {
    title: "i18n:hmk-css-min-width",
    name: "min-width",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const MIN_HEIGHT = {
    title: "i18n:hmk-css-min-height",
    name: "min-height",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const LINE_HEIGHT = {
    title: "i18n:hmk-css-line-height",
    name: "line-height",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const LETTER_SPACING = {
    title: "i18n:hmk-css-letter-spacing",
    name: "letter-spacing",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const FONT_SIZE = {
    title: "i18n:hmk-css-font-size",
    name: "font-size",
    comType: "TiInput"
  };
  //------------------------------------------------------
  const FONT_WEIGHT = {
    title: "i18n:hmk-css-font-weight",
    name: "font-weight",
    comType: "TiInput"
  };
  ////////////////////////////////////////////////////////
  const CSS_PROPS = {
    "background": BACKGROUND,
    "background-image": BACKGROUND_IMAGE,
    "background-position": BACKGROUND_POSITION,
    "background-position-x": BACKGROUND_POSITION_X,
    "background-position-y": BACKGROUND_POSITION_Y,
    "background-repeat": BACKGROUND_REPEAT,
    "background-size": BACKGROUND_SIZE,
    "background-color": BACKGROUND_COLOR,
    "border": BORDER,
    "border-radius": BORDER_RADIUS,
    "box-shadow": BOX_SHADOW,
    "color": COLOR,
    "float": FLOAT,
    "font-size": FONT_SIZE,
    "font-weight": FONT_WEIGHT,
    "height": HEIGHT,
    "letter-spacing": LETTER_SPACING,
    "line-height": LINE_HEIGHT,
    "margin": MARGIN,
    "max-height": MAX_HEIGHT,
    "max-width": MAX_WIDTH,
    "min-height": MIN_HEIGHT,
    "min-width": MIN_WIDTH,
    "object-fit": OBJECT_FIT,
    "object-positon": OBJECT_POSITION,
    "opacity": OPACITY,
    "overflow": OVERFLOW,
    "padding": PADDING,
    "text-align": TEXT_ALIGN,
    "text-shadow": TEXT_SHADOW,
    "text-transform": TEXT_TRANSFORM,
    "text-overflow": TEXT_OVERFLOW,
    "width": WIDTH,
    "white-space": WHITE_SPACE,
  }
  ////////////////////////////////////////////////////////
  const CSS_GROUPING = {
    aspect: [
      "margin",
      "padding",
      "border",
      "border-radius",
      "color",
      "box-shadow",
      "opacity",
      "object-fit",
      "object-positon",
      "float",
      "overflow"],
    background: [
      "background-color",
      "background-image",
      "background-position-x",
      "background-position-y",
      "background-size",
      "background-repeat"],
    measure: [
      "width",
      "height",
      "max-width",
      "max-height",
      "min-width",
      "min-height"],
    texting: [
      "text-align",
      "white-space",
      "text-overflow",
      "text-transform",
      "font-size",
      "font-weight",
      "letter-spacing",
      "line-height",
      "text-shadow"]
  }
  ////////////////////////////////////////////////////////
  const WnHMaker = {
    //----------------------------------------------------
    /**
     * Get css prop display text.
     * 
     * @param name {String} css prop name, must be kebabCase
     * 
     * @return  the prop display title text.
     */
    getCssPropTitle(name) {
      let fld = CSS_PROPS[name]
      if (fld) {
        return fld.title
      }
      return name
    },
    //----------------------------------------------------
    getCssPropField(name, setting = {}) {
      let fld = _.cloneDeep(CSS_PROPS[name])
      if (fld) {
        return _.merge(fld, setting)
      }
    },
    //----------------------------------------------------
    /**
     * 
     * @param filter {AutoMatch} css prop filter
     * 
     * @return `TiForm` fields setup
     */
    findCssPropFields(filter = true) {
      // Quick name
      let qf = ({
        "#BLOCK": [
          /^(margin|padding|border|overflow|background)-?/,
          /^(box-shadow|float|opacity)$/,
          /^((max|min)-)?(width|height)$/
        ],
        "#IMG": [
          /^(margin|border|object|background)-?/,
          /^(box-shadow|float|opacity|overflow)$/,
          /^((max|min)-)?(width|height)$/
        ],
        "#TEXT": [
          /^(color|background(-.+)?)$/,
          /^((text|font)-.+|opacity)$/,
          /^(line-height|letter-spacing|white-space)$/,
        ],
        "#TEXT-BLOCK": [
          /^(margin|padding|color||overflow)$/,
          /^(border|background)(-.+)?/,
          /^((text|font)-.+|opacity)$/,
          /^(line-height|letter-spacing|white-space)$/,
          /^(width|height)$/,
        ]
      })[filter]
      if (qf) {
        filter = qf
      }
  
      let am = Ti.AutoMatch.parse(filter)
      // Get the field list
      let fldMap = {}
      _.forEach(CSS_PROPS, (fld, name) => {
        if (am(name)) {
          fldMap[name] = fld
        }
      })
      //console.log(fldMap)
  
      // Make group
      let re = []
      _.forEach(CSS_GROUPING, (names, gnm) => {
        let fields = []
        for (let nm of names) {
          let fld = fldMap[nm]
          if (fld) {
            fields.push(fld)
          }
        }
        if (fields.length > 0) {
          let gridColumnHint = ({
            aspect: [[2, 720], [1, 360], 0],
            background: [[2, 720], [1, 360], 0],
            measure: [[2, 720], [1, 360], 0],
            texting: [[2, 720], [1, 360], 0]
          })[gnm]
          re.push({
            title: `i18n:hmk-css-grp-${gnm}`,
            gridColumnHint,
            fields
          })
        }
      })
  
      // Done
      return re
    }
    //----------------------------------------------------
  }
  ////////////////////////////////////////////////////////
  return WnHMaker;
})();
//##################################################
// # import OpenObjSelector from "./wn-open-obj-selector.mjs"
const OpenObjSelector = (function(){
  /***
   * Open Modal Dialog to explore one or multi files
   */
  async function OpenObjSelector(pathOrObj = "~", {
    title = "i18n:select",
    icon = "im-folder-open",
    type = "info", closer = true,
    textOk = "i18n:ok",
    textCancel = "i18n:cancel",
    position = "top",
    width = "80%", height = "90%", spacing,
    multi = true,
    titleBy = "title|nm",
    fromIndex = 0,
    exposeHidden = false,
    homePath = Wn.Session.getHomePath(),
    fallbackPath = Wn.Session.getHomePath(),
    sideItems = [],
    sideWidth = "2rem",
    search = {
      filter: {},
      sorter: { nm: 1 }
    },
    filter = o => "FILE" == o.race,
    canOpen = o => "DIR" == o.race,
    selected = []
  } = {}) {
    //................................................
    // Load the target object
    let meta = pathOrObj;
    if (_.isString(pathOrObj))
      meta = await Wn.Io.loadMeta(pathOrObj)
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
    // Eval side items
    let sideCandidateItems = []
    for (let si of sideItems) {
      let sideObj = await Wn.Io.loadMeta(si)
      if (sideObj) {
        sideCandidateItems.push({
          depth: 0,
          key: sideObj.id,
          id: sideObj.id,
          path: sideObj.ph,
          icon: Ti.Icons.get(sideObj),
          title: sideObj.title || sideObj.nm
        })
      }
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
    // Open modal dialog
    let reObj = await Ti.App.Open({
      //------------------------------------------
      type, width, height, spacing, position, closer,
      icon, title,
      //------------------------------------------
      actions: [{
        text: textOk,
        handler: ({ $main }) => {
          return $main.myChecked
        }
      }, {
        text: textCancel,
        handler: () => undefined
      }],
      //------------------------------------------
      modules: {
        axis: "@mod:wn/obj-axis",
        current: "@mod:wn/obj-current",
        main: "@mod:wn/obj-children"
      },
      //------------------------------------------
      comType: "modal-inner-body",
      //------------------------------------------
      components: [
        "@com:ti/crumb",
        "@com:wn/adaptlist",
        "@com:wn/gui/side/nav",
        {
          //////////////////////////////////////////
          name: "modal-inner-body",
          globally: false,
          //////////////////////////////////////////
          data: {
            myChecked: [],
            myShown: {
              side: sideCandidateItems.length > 1
            }
          },
          //////////////////////////////////////////
          props: {
            "icon": undefined,
            "text": undefined,
            "trimed": undefined,
            "placeholder": undefined,
            "valueCase": undefined,
            "value": undefined
          },
          //////////////////////////////////////////
          template: `<ti-gui
          :layout="TheLayout"
          :schema="TheSchema"
          :shown="myShown"
          :can-loading="true"
          :loading="status.reloading"
          @item:active="OnCurrentMetaChange"
          @arena::open:wn:obj="OnCurrentMetaChange"
          @arena::select="OnArenaSelect"/>`,
          //////////////////////////////////////////
          computed: {
            //--------------------------------------
            ...Vuex.mapState("axis", [
              "ancestors", "parent"]
            ),
            //--------------------------------------
            ...Vuex.mapState("current", [
              "meta", "status", "fieldStatus"]),
            //--------------------------------------
            ...Vuex.mapState("main", [
              "data"]),
            //--------------------------------------
            CrumbData() {
              let crumbs = Wn.Obj.evalCrumbData({
                meta: this.meta,
                ancestors: this.ancestors,
                fromIndex,
                homePath,
                titleBy,
                iteratee: (item, i, { nm } = {}) => {
                  if (!exposeHidden && nm && nm.startsWith(".")) {
                    return
                  }
                  return item
                }
              })
              // Cancel the first item icon
              if (!_.isEmpty(crumbs)) {
                crumbs[0].icon = null
              }
              return crumbs
            },
            //--------------------------------------
            SideConfig() {
              return {
                items: sideCandidateItems,
                highlightItemId: _.get(this.meta, "id"),
                highlightItemPath: _.get(this.meta, "ph")
              }
            },
            //--------------------------------------
            TheLayout() {
              return {
                type: "rows",
                border: true,
                blocks: [{
                  name: "sky",
                  size: ".5rem",
                  body: "sky"
                }, {
                  type: "cols",
                  border: true,
                  blocks: [{
                    name: "side",
                    size: sideWidth,
                    body: "side"
                  }, {
                    name: "arena",
                    body: "main"
                  }]
                }]
              }
            },
            //--------------------------------------
            TheSchema() {
              return {
                "sky": {
                  comType: "ti-crumb",
                  comConf: {
                    "style": { padding: "0 .1rem" },
                    "data": this.CrumbData
                  }
                },
                "side": {
                  comType: "wn-gui-side-nav",
                  comConf: this.SideConfig
                },
                "main": {
                  comType: "wn-adaptlist",
                  comConf: {
                    "meta": this.meta,
                    "data": this.data,
                    "status": this.status,
                    "multi": multi,
                    "listConf": {
                      resizeDelay: 200
                    },
                    "itemTitleKey": titleBy
                  }
                }
              }
            }
          },
          //////////////////////////////////////////
          methods: {
            //--------------------------------------
            OnCurrentMetaChange({ id, path, value } = {}) {
              this.open(id || path || value)
            },
            //--------------------------------------
            OnArenaSelect({ checked }) {
              //console.log("OnArenaSelect", checked)
              if (_.isFunction(filter))
                this.myChecked = _.filter(checked, (obj) => {
                  if (filter(obj))
                    return true
                  return false
                })
              else
                this.myChecked = checked
            },
            //--------------------------------------
            async open(obj) {
              // Guard
              if (!obj) {
                return
              }
  
              // To WnObj
              if (_.isString(obj)) {
                obj = await Wn.Io.loadMetaBy(obj)
              }
  
              // Only can enter DIR
              if (canOpen(obj)) {
                let app = Ti.App(this)
                // Setup search filter/sorter
                if (search) {
                  app.commit("main/setFilter", search.filter || {})
                  app.commit("main/setSorter", search.sorter || { nm: 1 })
                }
                app.commit("current/setMeta", obj)
                app.dispatch("main/reload", obj)
                app.dispatch("axis/reload", obj)
              }
              // Double click file to select and click "OK"
              else {
                console.log(this.myChecked)
                this.$notify("ok", this.myChecked)
              }
            }
            //--------------------------------------
          },
          //////////////////////////////////////////
          mounted: function () {
            this.open(meta)
          }
          //////////////////////////////////////////
        }]  // ~ components: []
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
// # import OpenObjTree from "./wn-open-obj-tree.mjs"
const OpenObjTree = (function(){
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
  return OpenObjTree;
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
// # import EditObjMeta from "./wn-edit-obj-meta.mjs"
const EditObjMeta = (function(){
  ////////////////////////////////////////////////////
  async function EditObjMeta(pathOrObj = "~", {
    icon, title,
    type = "info",
    closer = true,
    escape = true,
    textOk = "i18n:ok",
    textCancel = "i18n:cancel",
    position = "top",
    width = 640,
    height = "90%",
    spacing,
    currentTab = 0,
    // static tabs
    // if emtpy, apply the default
    // “auto" will load by `ti editmeta`, it will override the currentTab
    fields = [],
    fixedKeys = ["icon", "thumb", "title"],
    saveKeys = ["thumb"],  // If the key changed, `cancel` same as `OK`
    autoSave = true
  } = {}) {
    //............................................
    // Load meta
    let meta = pathOrObj
    if (_.isString(meta)) {
      meta = await Wn.Io.loadMeta(pathOrObj)
    }
    //............................................
    // Save key map
    let saves = {}
    _.forEach(saveKeys, k => saves[k] = true)
    //............................................
    let reo = await Wn.Obj.genObjFormFields({
      meta, fields, currentTab, fixedKeys
    })
    let myFormFields = reo.fields
    currentTab = reo.currentTab || currentTab || 0
  
    //............................................
    let theIcon = icon || Wn.Util.getObjIcon(meta, "zmdi-info-outline")
    let theTitle = title || Wn.Util.getObjDisplayName(meta)
    //............................................
    reo = await Ti.App.Open({
      //------------------------------------------
      type, width, height, spacing, position, closer, escape,
      icon: theIcon,
      title: theTitle,
      //------------------------------------------
      actions: [{
        text: textOk,
        handler: ({ $main }) => _.cloneDeep({
          updates: $main.updates,
          data: $main.meta
        })
      }, {
        text: textCancel,
        handler: ({ $main }) => {
          // Is in saveKeys
          let ks = _.keys($main.updates)
          for (let k of ks) {
            if (saves[k]) {
              return _.cloneDeep({
                updates: $main.updates,
                data: $main.meta
              })
            }
          }
          // Nothing be updated, just return undefined
        }
      }],
      //------------------------------------------
      ready() {
        this.$main.meta = meta
      },
      //------------------------------------------
      comType: "modal-inner-body",
      //------------------------------------------
      components: [{
        name: "modal-inner-body",
        globally: false,
        data: {
          myFormFields,
          currentTab,
          meta: undefined,
          updates: {}
        },
        template: `<ti-form
          mode="tab"
          :current-tab="currentTab"
          :fields="myFormFields"
          :gridColumnHint="[[1,420],0]"
          :data="meta"
          @field:change="onFieldChange"
          @change="onChange"
          />`,
        methods: {
          onChange(data) {
            this.meta = data
          },
          onFieldChange({ name, value } = {}) {
            let obj = Ti.Types.toObjByPair({ name, value })
            this.updates = _.assign({}, this.updates, obj)
          }
        }
      },
        "@com:ti/form",
        "@com:ti/input/text",
        "@com:wn/imgfile",
        "@com:wn/obj/mode"]
      //------------------------------------------
    })
    //............................................
    // User cancel
    if (!reo) {
      return
    }
    //............................................
    let { updates } = reo
    let saved = false
    if (autoSave && !_.isEmpty(updates)) {
      let json = JSON.stringify(updates)
      let cmdText = `obj 'id:${meta.id}' -ocqn -u`
      let newMeta = await Wn.Sys.exec2(cmdText, { input: json, as: "json" })
      await Ti.Toast.Open("i18n:save-done", "success")
      saved = true
  
      return { updates, data: newMeta, saved }
    }
    //............................................
    return reo
  }
  ////////////////////////////////////////////////////
  return EditObjMeta;
})();
//##################################################
// # import EditObjContent from "./wn-edit-obj-content.mjs"
const EditObjContent = (function(){
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
  return EditObjContent;
})();
//##################################################
// # import EditObjPrivilege from "./wn-edit-obj-privilege.mjs"
const EditObjPrivilege = (function(){
  ////////////////////////////////////////////////////
  async function EditObjPrivilege(pathOrObj="~", {
    icon = "fas-user-lock",  
    title = "i18n:wn-key-pvg", 
    type   = "info", 
    closer = true,
    escape = true,
    position   = "top",
    width      = "80%",
    minWidth   = 720,
    height     = "95%", 
    autoSave   = true
  }={}){
    //............................................
    // Load meta
    let meta = pathOrObj
    if(_.isString(meta)) {
      meta = await Wn.Io.loadMeta(pathOrObj)
    }
    //............................................
    let theTitle = Ti.I18n.text(title) + " : " + Ti.I18n.text(meta.title||meta.nm)
    //............................................
    let pvg = await Ti.App.Open({
      //------------------------------------------
      type, width, height, position, closer, escape,
      icon, 
      title : theTitle,
      result : meta.pvg,
      comType : "WnObjPrivilege", 
      components : ["@com:wn/obj/privilege"]
      //------------------------------------------
    })
    //............................................
    // User cancel
    if(!pvg || _.isEqual(meta.pvg, pvg)) {
      return
    }
    //............................................
    if(autoSave) {
      let input = _.isEmpty(pvg)
        ? {"!pvg":true}
        : {pvg};
      let json = JSON.stringify(input)
      let cmdText = `o 'id:${meta.id}' @update @json -cqn`
      let newMeta = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})
      await Ti.Toast.Open("i18n:save-done", "success")
      return newMeta
    }
    // Just update obj
    else {
      meta.pvg = pvg
    }
    //............................................
    return meta
  }
  ////////////////////////////////////////////////////
  return EditObjPrivilege;
})();
//##################################################
// # import EditObjPvg from "./wn-edit-obj-pvg.mjs"
const EditObjPvg = (function(){
  ////////////////////////////////////////////////////
  async function EditObjPvg(pathOrObj = "~", {
    icon = "fas-user-lock",
    title = "i18n:wn-key-pvg",
    type = "info",
    closer = true,
    escape = true,
    position = "top",
    width = "80%",
    minWidth = 720,
    height = "95%",
    autoSave = true
  } = {}) {
    //............................................
    // Load meta
    let meta = pathOrObj
    if (_.isString(meta)) {
      meta = await Wn.Io.loadMeta(pathOrObj)
    }
    //............................................
    let theTitle = Ti.I18n.text(title) + " : " + Ti.I18n.text(meta.title || meta.nm)
    //............................................
    let pvg = await Ti.App.Open({
      //------------------------------------------
      type, width, height, position, closer, escape,
      icon,
      title: theTitle,
      result: meta.pvg,
      comType: "WnObjPvg",
      comConf: {
        autoRemoveDefault: true
      },
      components: ["@com:wn/obj/pvg"]
      //------------------------------------------
    })
    //............................................
    // User cancel
    if (!pvg || _.isEqual(meta.pvg, pvg)) {
      return
    }
    //............................................
    if (autoSave) {
      let input = _.isEmpty(pvg)
        ? { "!pvg": true }
        : { pvg };
      let json = JSON.stringify(input)
      let cmdText = `o 'id:${meta.id}' @update @json -cqn`
      let newMeta = await Wn.Sys.exec2(cmdText, { input: json, as: "json" })
      await Ti.Toast.Open("i18n:save-done", "success")
      return newMeta
    }
    // Just update obj
    else {
      meta.pvg = pvg
    }
    //............................................
    return meta
  }
  ////////////////////////////////////////////////////
  return EditObjPvg;
})();
//##################################################
// # import EditTiComponent from "./wn-edit-ti-component.mjs"
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
//##################################################
// # import OpenCmdPanel from "./wn-run-cmd-panel.mjs"
const OpenCmdPanel = (function(){
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
    preface, 
    epilog="i18n:wn-cmd-panel-epilog",
    cmdTipText="i18n:wn-cmd-panel-tip",
    cmdTipIcon="fad-radiation",
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
        preface, epilog,
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
  return OpenCmdPanel;
})();
//##################################################
// # import Youtube from "./wn-youtube.mjs"
const Youtube = (function(){
  ////////////////////////////////////////////
  const WnYoutube = {
    //----------------------------------------
    async getVideoDetails(config, videoIds = [], force = false) {
      // Guard
      if (!config || _.isEmpty(videoIds)) {
        return
      }
      let { domain, thumbType, coverType } = config
  
      // Get api url
      let json = JSON.stringify({
        id: videoIds.join(","),
        part: config.videoPart
      })
      // let cmdText = `xapi req youtube ${domain} videos -url -vars '${json}'`
      // let curl = await Wn.Sys.exec2(cmdText, { as: "text" });
      // if (!curl) {
      //   throw "Fail to get youtube API(videos) URL: " + cmdText
      // }
      // //console.log(curl)
      // // Reload from youtube server
      // let reo = await Ti.Http.get(curl, { as: "json" })
      let cmdText = `xapi send youtube ${domain} videos ${force ? '-force' : ''} -vars '${json}'`
      let reo = await Wn.Sys.exec2(cmdText, { as: "json" });
  
      if (!reo || !_.isArray(reo.items)) {
        throw "Fail to load youtube playlists by: " + cmdText
      }
  
      // Update uploadPlaylistId for reload all videos in channel
      let list = []
      _.forEach(reo.items, it => {
        let { id, snippet, contentDetails } = it
        let video = {
          id,
          title: snippet.title,
          publishedAt: snippet.publishedAt,
          description: snippet.description,
          thumbUrl: _.get(snippet, `thumbnails.${thumbType}.url`),
          coverUrl: _.get(snippet, `thumbnails.${coverType}.url`),
          defaultLanguage: snippet.defaultLanguage,
          defaultAudioLanguage: snippet.defaultAudioLanguage,
          categoryId: snippet.categoryId,
          duration: contentDetails.duration,
          definition: contentDetails.definition
        }
  
        let du = Ti.DateTime.parseTime(video.duration)
        video.du_in_sec = du.value
        video.du_in_str = du.toString("min")
  
        list.push(video)
      })
      // Done
      return list
    },
    //----------------------------------------
    async getAllVideos(config, playlistId) {
      // Guard
      if (!config) {
        return
      }
      // load key fields in config
      let reo = await WnYoutube.getPlaylistVideos(config, playlistId)
      let list = reo.list || []
      while (reo.next) {
        reo = await WnYoutube.getPlaylistVideos(config, playlistId, {
          pageToken: reo.next
        })
        list = _.concat(list, reo.list)
      }
  
      // Done
      return list
    },
    //----------------------------------------
    async getPlaylistVideos(config, playlistId, {
      pageToken, maxResults = 50, force
    } = {}) {
      // Guard
      if (!config) {
        return
      }
      // load key fields in config
      let { domain } = config
  
      // Default to get uploaed videos
      playlistId = playlistId || config.uploadsPlaylistId
  
      // Reload from youtube
      let json = JSON.stringify({
        playlistId, part: "contentDetails", pageToken, maxResults
      })
  
      // Get api url
      // let cmdText = `xapi req youtube ${domain} playlistItems -url -vars '${json}'`
      // let curl = await Wn.Sys.exec2(cmdText, { as: "text" });
      // if (!curl) {
      //   throw "Fail to get youtube API(playlistItems) URL: " + cmdText
      // }
      // //console.log(curl)
      // // Reload from youtube server
      // let reo = await Ti.Http.get(curl, { as: "json" })
      let cmdText = `xapi send youtube ${domain} playlistItems ${force ? '-force' : ''} -vars '${json}'`
      let reo = await Wn.Sys.exec2(cmdText, { as: "json" });
  
      if (!reo || !_.isArray(reo.items)) {
        throw "Fail to load youtube playlistItems by: " + cmdText
      }
  
      // Update uploadPlaylistId for reload all videos in channel
      let ids = []
      _.forEach(reo.items, it => {
        let vid = _.get(it.contentDetails, "videoId")
        ids.push(vid)
      })
  
      // Load video details
      let list = await WnYoutube.getVideoDetails(config, ids)
  
      // Return
      return {
        list,
        prev: reo.prevPageToken,
        next: reo.nextPageToken
      }
    },
    //----------------------------------------
    async getAllPlaylists(config, { force = false } = {}) {
      // Guard
      if (!config) {
        return
      }
  
      // Reload Data
      let reo = await WnYoutube.getPlaylists(config)
      let list = reo.list || []
      while (reo.next) {
        reo = await WnYoutube.getPlaylists(config, { pageToken: reo.next, force })
        list = _.concat(list, reo.list)
      }
  
      // Done
      return list
    },
    //----------------------------------------
    async getPlaylists(config, {
      pageToken, maxResults = 50, force
    } = {}) {
      // Guard
      if (!config) {
        return
      }
      // load key fields in config
      let { domain, channelId, thumbType } = config
  
      // Reload from youtube
      let json = JSON.stringify({
        channelId, part: config.playlistPart, pageToken, maxResults
      })
  
      // Get api url
      //let cmdText = `xapi req youtube ${domain} playlists -url -vars '${json}'`
      // //console.log(cmdText)
      // let curl = await Wn.Sys.exec2(cmdText, { as: "text" });
      // if (!curl) {
      //   throw "Fail to get youtube API(playlist) URL: " + cmdText
      // }
      // //console.log(curl)
      // // Reload from youtube server
      // let reo = await Ti.Http.get(curl, { as: "json" })
      let cmdText = `xapi send youtube ${domain} playlists ${force ? '-force' : ''} -vars '${json}'`
      let reo = await Wn.Sys.exec2(cmdText, { as: "json" });
  
      if (!reo || !_.isArray(reo.items)) {
        throw "Fail to load youtube playlists by: " + cmdText
      }
  
      // Update uploadPlaylistId for reload all videos in channel
      let list = []
      _.forEach(reo.items, it => {
        let { id, snippet, contentDetails } = it
        let pl = {
          id,
          title: snippet.title,
          description: snippet.description,
          thumbUrl: _.get(snippet, `thumbnails.${thumbType}.url`),
          itemCount: contentDetails.itemCount
        }
        list.push(pl)
      })
  
      // Return
      return {
        list,
        prev: reo.prevPageToken,
        next: reo.nextPageToken
      }
    },
    //----------------------------------------
    /**
     * Reload youtube channel configuration
     * 
     * @param domain: domain Name
     * @param channelId
     * @param force
     * @returns Youtube channel configuration
     */
    async loadConfig({
      domain, channelId, force = false
    } = {}) {
      //console.log("loadConfig",domain)
      // Use default domain name 
      if (!domain) {
        domain = Wn.Session.getCurrentDomain()
      }
      // Load cache file
      let ytHome = `~/.domain/youtube/${domain}`
      let oConfig = await Wn.Io.loadMeta(`${ytHome}/youtube.json`)
      let noexists = true
      let config = {};
      if (oConfig) {
        config = await Wn.Io.loadContent(oConfig, { as: "json" })
        noexists = false
      }
  
      // Setup config default
      _.defaults(config, {
        domain,
        thumbType: "high",
        coverType: "maxres",
        maxResults: 50,
        channelId,
        channelTitle: "No Title",
        channelPart: "snippet,contentDetails,statistics",
        uploadsPlaylistId: null,
        playlistPart: "snippet,contentDetails,status,id,player,localizations",
        videoPart: "snippet,contentDetails,status,id,player"
      })
  
      // force reload
      if (noexists || force) {
        // Reload from youtube
        let json = JSON.stringify({
          id: channelId, part: config.channelPart
        })
  
        // Get api url
        // let cmdText = `xapi req youtube ${domain} channels -url -vars '${json}'`
        // let curl = await Wn.Sys.exec2(cmdText, { as: "text" });
        // if (!curl) {
        //   throw "Fail to get youtube API(channels) URL: " + cmdText
        // }
        // //console.log(curl)
        // // Reload from youtube server
        // let reo = await Ti.Http.get(curl, { as: "json" })
        let cmdText = `xapi send youtube ${domain} channels ${force ? '-force' : ''} -vars '${json}'`
        let reo = await Wn.Sys.exec2(cmdText, { as: "json" });
  
        if (!reo || !_.isArray(reo.items) || _.isEmpty(reo.items)) {
          throw "Fail to load youtube channels by: " + cmdText
        }
  
        // Update uploadPlaylistId for reload all videos in channel
        config.channelTitle = _.get(reo, "items.0.snippet.title")
        config.uploadsPlaylistId = _.get(reo,
          "items.0.contentDetails.relatedPlaylists.uploads")
  
        // Save config
        json = JSON.stringify(config)
        await Wn.Sys.exec2(`json -qn > ${ytHome}/youtube.json`, { input: json })
      }
  
      // Done
      return config
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
  return WnYoutube;
})();
//##################################################
// # import FbAlbum from "./wn-fb-album.mjs"
const FbAlbum = (function(){
  ////////////////////////////////////////////
  const WnFbAlbum = {
    async reloadAllPhotoList({
      albumId,
      domain,
      force
    } = {}) {
      let photos = []
  
      // Reload first page
      let re = await WnFbAlbum.loadPhotos(domain, albumId, { force })
      if (re && !_.isEmpty(re.data)) {
        photos.push(...re.data)
  
        // Next pages...
        while (re && re.after) {
          re = await await WnFbAlbum.loadPhotos(domain, albumId, { force, after: re.after })
          if (re && !_.isEmpty(re.data)) {
            photos.push(...re.data)
          }
        }
      }
  
      // Done 
      return photos
    },
    //----------------------------------------
    async loadPhotos(domain, id, { after, force } = {}) {
      let vars = JSON.stringify({ id, after })
      let fmak = force ? '-force' : ''
      let cmdText = `xapi send fb-graph ${domain} photos ${fmak} -vars '${vars}'`
      return await Wn.Sys.exec2(cmdText, { as: "json" })
    },
    //----------------------------------------
    async loadAlbums(domain, id, { after, force } = {}) {
      let vars = JSON.stringify({ id, after })
      let fmak = force ? '-force' : ''
      let cmdText = `xapi send fb-graph ${domain} albums ${fmak} -vars '${vars}'`
      return await Wn.Sys.exec2(cmdText, { as: "json" })
    },
    //----------------------------------------
    async loadPhoto(domain, id, force) {
      let vars = JSON.stringify({ id })
      let fmak = force ? '-force' : ''
      let cmdText = `xapi send fb-graph ${domain} photo ${fmak} -vars '${vars}'`
      return await Wn.Sys.exec2(cmdText, { as: "json" })
    },
    //----------------------------------------
  }
  ////////////////////////////////////////////
  return WnFbAlbum;
})();

//---------------------------------------
const WALNUT_VERSION = "1.2-20241110.005459"
//---------------------------------------
// For Wn.Sys.exec command result callback
const HOOKs = {

}
//---------------------------------------
export const Wn = {
  Version: WALNUT_VERSION,
  Io, Obj, Session, Sys, Util, Dict, Hm,
  OpenObjSelector, OpenObjTree,
  EditObjMeta, EditObjContent,
  EditObjPrivilege, EditObjPvg,
  EditTiComponent, OpenThingManager, OpenCmdPanel,
  Youtube, FbAlbum,
  //-------------------------------------
  addHook(key, fn) {
    Ti.Util.pushValue(HOOKs, key, fn)
  },
  //-------------------------------------
  doHook(key, payload) {
    let fns = HOOKs[key]
    if (_.isArray(fns) && fns.length > 0) {
      for (let fn of fns) {
        fn(payload)
      }
    }
  }
}
//---------------------------------------
export default Wn
//---------------------------------------
if (window) {
  window.Wn = Wn
}