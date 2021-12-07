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
    if (metaOrPath.id && metaOrPath.ph) {
      let { id, nm, ph, race } = metaOrPath
      if ('DIR' == race) {
        throw Ti.Err.make('e-wn-io-writeNoFile', ph || nm)
      }
      targetPath = `id:${id}`
    }
    // Get Path
    else {
      targetPath = metaOrPath
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
    objMatch, objFilter, objSort,
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
      objMatch, objFilter, objSort,
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
export default WnIo;