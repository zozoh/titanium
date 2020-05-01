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
    name  : "nm"
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
      name : "toStr",
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
export const WnObj = {
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
  evalFields(fields=[], iteratee=_.identity) {
    fields = _.pull(_.concat(fields), [null, undefined])
    // Eval the each field
    let list = []
    for(let fld of fields) {
      // Quick Name
      if(_.isString(fld)) {
        let f2 = WnObj.getField(fld)
        if(f2) {
          f2 = iteratee(f2)
          if(f2) {
            list.push(f2)
          }
        }
      }
      // Customized Prop
      else if(_.isPlainObject(fld) && fld.name){
        let f2 = iteratee(fld)
        if(f2) {
          list.push(f2)
        }
      }
    }
    return list
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