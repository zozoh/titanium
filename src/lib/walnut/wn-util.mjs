////////////////////////////////////////////
const WnUtil = {
  toFuzzyStr(str, strictStart = false) {
    if (!str || str.startsWith("^"))
      return str

    if (strictStart)
      return '^' + str
    return '^.*' + str
  },
  fromFuzzyStr(str) {
    let m = /^(\^(\.\*)?)(.+)((\.\*)?\$)?$/.exec(str)
    if (m) {
      return m[3]
    }
    return str
  },
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
    if (m) {
      return m[3]
    }
    return iconHtml
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
        }
      }

      // Load walnut obj thunbmail
      return {
        type: "image",
        value: '/o/thumbnail/id:' + meta.id
      }
    }
    // Customized Icon
    if (meta.icon) {
      let icon = WnUtil.getIconName(meta.icon)
      return Ti.Icons.get(icon, {
        type: "font",
        value: icon
      })
    }
    // Default
    return Ti.Icons.get(meta)
  },
  getIconObj(meta) {
    if (meta && meta.icon) {
      return meta.icon
    }
    // return default
    return Ti.Icons.get(meta)
  },
  getObjIcon(meta, dft) {
    if (!meta)
      return dft
    return meta.icon || Ti.Icons.get(meta, dft)
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
    timestamp = 0
  } = {}, dftIcon) {
    //console.log("getObjThumbIcon", {icon,race, mime})
    // Thumb as image
    if (thumb) {
      let src = `/o/content?str=${thumb}`
      if (timestamp > 0) {
        src += `&_t=${timestamp}`
      }
      return {
        type: "image",
        value: src
      }
    }
    //.............................................
    // Icon
    if (icon) {
      return {
        type: "font",
        value: icon
      }
    }
    //.............................................
    // Force Default
    if (candidateIcon) {
      return candidateIcon
    }
    //.............................................
    // Auto get by type
    if (type || mime || race) {
      return Ti.Icons.get({ type, mime, race })
    }
    // Default
    return dftIcon
  },
  getObjThumbIcon2(meta, canIcon) {
    //console.log(meta, canIcon)
    if (meta) {
      if (meta.thumb) {
        let src;
        if (/^https?:\/\//.test(meta.thumb)) {
          src = meta.thumb
        } else {
          src = `/o/content?str=${meta.thumb}`
        }
        return {
          type: "image",
          value: src
        }
      }

      if (meta.icon) {
        return meta.icon
      }
    }

    if (canIcon)
      return canIcon

    return Ti.Icons.get(meta)
  },
  /***
   * return the object readable name
   */
  getObjDisplayName(meta, keys = []) {
    return Ti.Util.getFallbackEmpty(meta, keys, "title", "nm")
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
    encoded = false
  } = {}) {
    return WnUtil.getLink(`/a/open/${appName}`, meta, {
      pathKey: "id",
      encoded
    })
  },
  getAppLinkStr(meta, options) {
    return WnUtil.getAppLink(meta, options).toString()
  },
  getObjBadges(meta = {}, setup) {
    // Totaly customized
    if (_.isFunction(setup)) {
      return setup(meta)
    }

    let {
      NW = null,
      NE = ["ln", "zmdi-open-in-new"],
      SW = null,
      SE = null
    } = (setup || {})

    let badges = {}

    let _eval_badge = function (name, BD) {
      if (_.isFunction(BD)) {
        BD = BD(meta)
      }
      if (!BD)
        return;

      // Quick badge
      if (_.isArray(BD)) {
        if (BD.length == 1) {
          badges[name] = BD[0]
        }
        else if (BD.length > 1 && meta[BD[0]]) {
          badges[name] = BD[1]
        }
      }
      // Auto match badge
      else if (_.isPlainObject(BD) && BD.value) {
        //console.log("haha", BD)
        if (BD.test && !Ti.AutoMatch.test(BD.test, meta)) {
          return
        }
        let bag = Ti.Util.explainObj(meta, {
          type: BD.type || "icon",
          className: BD.className,
          style: BD.style,
          value: BD.value
        })
        if (bag)
          badges[name] = bag
      }
      // Static badge
      else {
        badges[name] = BD
      }
    }

    _eval_badge("NW", NW);
    _eval_badge("NE", NE);
    _eval_badge("SW", SW);
    _eval_badge("SE", SE);

    return badges
  },
  getObjThumbInfo(meta = {}, {
    exposeHidden = false,
    status = {},
    progress = {},
    badges = undefined,
    titleKey = undefined
  } = {}) {
    // Guard
    if (!meta || !meta.nm) {
      return
    }
    // Check the visibility
    let visibility = "show"
    if (meta.nm.startsWith(".")) {
      if (exposeHidden) {
        visibility = exposeHidden ? "weak" : "hide"
      }
    }
    let ttKey = titleKey
    if (_.isFunction(titleKey)) {
      ttKey = titleKey()
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
    }
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
    })
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
  getMatchByFilter({ keyword, match, majorKey, majorValue } = {}, setting = {}) {
    let flt = {}
    //console.log("getMatchByFilter", {match, setting})
    //............................................
    // compatibable mode, the majorKey can declare in settings also
    // And in higher priority
    majorKey = setting.majorKey || majorKey
    //............................................
    // Eval Filter: keyword
    if (keyword) {
      if (/"^[\d\w]{26}(:.+)?$"/.test(keyword)) {
        flt.id = keyword
      }
      // Find
      else {
        let knm = setting.defaultKey || "nm"
        let keywordSet = _.cloneDeep(setting.keyword)
        let keys = _.keys(keywordSet)
        //........................................
        for (let k of keys) {
          let val = keywordSet[k]
          if (new RegExp(val).test(keyword)) {
            knm = k;
            break;
          }
        }
        //........................................
        // Accurate equal
        if (knm.startsWith("=")) {
          flt[knm.substring(1).trim()] = keyword
        }
        // Startwith
        else if (knm.startsWith("~")) {
          flt[knm.substring(1).trim()] = "^" + keyword
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
          flt[key] = val
        }
      })
    }
    //............................................
    // Eval Filter: major
    if (majorKey && !Ti.Util.isNil(majorValue)) {
      _.set(flt, majorKey, majorValue)
    }
    //............................................
    // Fix filter
    let fixedMatch = setting.match
    if (!_.isEmpty(fixedMatch)) {
      _.assign(flt, fixedMatch)
    }
    //............................................
    // Done
    return flt
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
  getLink(url, meta, {
    pathKey = "ph",
    encoded = false,
    params = {}
  } = {}) {
    if (_.isEmpty(meta)) {
      return { url, params }
    }
    let params2 = { ...params }
    const __V = (val) => {
      return encoded
        ? encodeURIComponent(val)
        : val
    }
    // META: "~/path/to/obj"
    if (/^(\/|~|id:)/.test(meta)) {
      params2[pathKey] = __V(meta)
    }
    // META: "478e..6ea2"
    else if (_.isString(meta)) {
      params2[pathKey] = "id" == pathKey ? meta : `id:${meta}`
    }
    // META: {id:"478e..6ea2"}
    else if (meta.id) {
      params2[pathKey] = "id" == pathKey ? meta.id : `id:${meta.id}`
    }
    // META: {ph:"/path/to/obj"}
    else if (meta.ph) {
      params2[pathKey] = __V(meta.ph)
    }
    // Default return
    return Ti.Util.Link({
      url,
      params: params2,
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
    if (_.isPlainObject(meta)) {
      let node = {
        id: meta.id,
        name: meta.nm,
        leaf: 'DIR' != meta.race,
        rawData: meta
      }
      if (!node.leaf) {
        node.children = []
      }
      if (node.id && node.name) {
        return node
      }
    }
  },
  /***
   * @param query{String|Function}
   */
  genQuery(query, {
    vkey = "val",
    wrapArray = false,
    errorAs,
    blankAs = '[]'
  } = {}) {
    // Customized query
    if (_.isFunction(query)) {
      return query
    }
    // Array
    if (_.isArray(query)) {
      if (wrapArray) {
        return () => query
      }
      return query
    }
    // Command template
    if (_.isString(query)) {
      // Query by value 
      if (vkey) {
        return async (v) => {
          let cmdText = Ti.S.renderBy(query, { [vkey]: v })
          //console.log("exec", cmdText)
          return await Wn.Sys.exec2(cmdText, {
            as: "json",
            input: v,
            errorAs,
            blankAs
          })
        }
      }
      // Query directly
      else {
        return async (v) => {
          return await Wn.Sys.exec2(query, {
            as: "json",
            errorAs,
            blankAs
          })
        }
      }
    }
  }
}
////////////////////////////////////////////
export default WnUtil;