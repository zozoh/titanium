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
                display: k,
                comType: "ti-input-tags"
              }
            })[jsType] || {
              type: "String",
              display: k,
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
export default WnObj;