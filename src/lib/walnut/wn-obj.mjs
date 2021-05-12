////////////////////////////////////////////////////
const TABLE_FIELDS = {
  //---------------------------------------------
  "title" : ()=>({
    title : "i18n:wn-key-title",
    display : [Wn.Obj.getObjThumbDisplay("rawData"), "title|nm"]
  }),
  //---------------------------------------------
  "tp" : {
    title : "i18n:wn-key-tp",
    width : -80,
    display : "rawData.tp::as-tip"
  },
  //---------------------------------------------
  "c" : {
    title : "i18n:wn-key-c",
    width : -150,
    display : "rawData.c::as-tip"
  },
  //---------------------------------------------
  "m" : {
    title : "i18n:wn-key-",
    width : -150,
    display : "rawData.c::as-tip"
  },
  //---------------------------------------------
  "g" : {
    title : "i18n:wn-key-g",
    width : -150,
    display : "rawData.g::as-tip"
  },
  //---------------------------------------------
  "md" : {
    title : "i18n:wn-key-md",
    width : 120,
    display : {
      key : "rawData.md",
      transformer : "Wn.Obj.modeToStr",
      comConf : {
        className : "as-tip"
      }
    }
  },
  //---------------------------------------------
  "len" : {
    title : "i18n:wn-key-len",
    width : -100,
    display : {
      key : "rawData.len",
      transformer : "Ti.S.sizeText",
      comConf : {
        className : "as-tip-block align-right",
      }
    }
  },
  //---------------------------------------------
  "ct" : {
    title : "i18n:wn-key-ct",
    width : -100,
    display : {
      key : "rawData.ct",
      transformer : "Ti.DateTime.timeText",
      comConf : {
        className : "as-tip-block align-right",
      }
    }
  },
  //---------------------------------------------
  "lm" : {
    title : "i18n:wn-key-lm",
    width : -100,
    display : {
      key : "rawData.lm",
      transformer : "Ti.DateTime.timeText",
      comConf : {
        className : "as-tip-block align-right",
      }
    }
  },
  //---------------------------------------------
}
////////////////////////////////////////////////////
const FORM_FIELDS = {
  //---------------------------------------------
  "id" : {
    title : "i18n:wn-key-id",
    name  : "id",
    comType : "WnObjId"
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
    emptyAs: null,
    display: "<=ti-label>",
    comType: "ti-input"
  },
  //---------------------------------------------
  "sort" : {
    title : "i18n:sort",
    name  : "sort",
    tip   : "i18n:sort-tip-asc",
    type  : "Integer",
    comType : "ti-input-num",
    comConf : {
      width : 140
    }
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
    name  : "sha1",
    comConf : {
      className : "is-nowrap",
      fullField : false
    }
  },
  //---------------------------------------------
  "md" : {
    title : "i18n:wn-key-md",
    name  : "md",
    type : "Integer",
    comType : "WnObjMode",
    comConf : {
      valueType : "decimal"
    }
  },
  //---------------------------------------------
  "pvg" : {
    title : "i18n:wn-key-pvg",
    name  : "pvg",
    type  : "Object",
    comType : "TiInputText",
    comConf : {
      autoJsValue : true,
      height : 200
    }
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
    name  : "duration",
    width : "auto",
    comConf : {
      suffixText : "i18n:tu-sec"
    }
  },
  //---------------------------------------------
  "len" : {
    title : "i18n:wn-key-len",
    name  : "len",
    width : "auto",
    transformer: (v)=>Ti.S.sizeText(v, {bytes:true})
  }
  //---------------------------------------------
}
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
    if(!newName || newName.search(/[%;:"'*?`\t^<>\/\\]/)>=0) {
      Ti.Alert("i18n:wn-rename-invalid", {type:"warn"})
      return false
    }
    // Check the newName length
    if(newName.length > 256) {
      Ti.Alert("i18n:wn-rename-too-long", {type:"warn"})
      return false
    }

    return true
  },
  //----------------------------------------
  octalModeToStr(octalMode) {
    let mode = parseInt(octalMode, 8);
    return WnObj.modeToStr(mode);
  },
  //----------------------------------------
  modeToStr(md) {
    let sb = []
    for (let i = 2; i >= 0; i--) {
      let m = md >> (i * 3) & RWX;
      sb.push((m & R) > 0 ? 'r' : '-');
      sb.push((m & W) > 0 ? 'w' : '-');
      sb.push((m & X) > 0 ? 'x' : '-');
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
    if (cs[0] == 'r')
        m |= R;
    if (cs[1] == 'w')
        m |= W;
    if (cs[2] == 'x')
        m |= X;
    return m;
  },
  //----------------------------------------
  modeToObj(md) {
    let keys = ["other", "member", "owner"]
    let re = {
      mode  : md,
      text  : WnObj.modeToStr(md),
      octal : md.toString(8)
    }
    for (let i = 2; i >= 0; i--) {
      let m = md >> (i * 3) & RWX;
      let key = keys[i]
      re[key] = {
        readable  : (m & R) > 0,
        writable  : (m & W) > 0,
        excutable : (m & X) > 0
      }
    }
    return re
  },
  //----------------------------------------
  modeFromObj({owner,member,other}={}) {
    let mdOwner  = WnObj.mode0FromObj(owner)
    let mdMember = WnObj.mode0FromObj(member)
    let mdOther  = WnObj.mode0FromObj(other)
    return (mdOwner << 6)
           | (mdMember << 3)
           | mdOther
  },
  //----------------------------------------
  mode0FromObj({readable,writable,excutable}={}) {
    let md = 0;
    if(readable)
      md |= R
    if(writable)
      md |= W
    if(excutable)
      md |= X
    return md
  },
  //----------------------------------------
  parseMode(input, octal=false) {
    let md = 0;
    if(/^\{.+\}$/.test(input)) {
      input = JSON.parse(input)
    }
    if(_.isPlainObject(input)) {
      if(input.readable) {
        return WnObj.mode0FromObj(input)
      }
      return WnObj.modeFromObj(input)
    }
    // rwxr-x---
    else if (/^[rwx-]{3,9}$/.test(input)) {
      if(3 == input.length) {
        md = WnObj.modeFromStr0(input)
      } else {
        md = WnObj.modeFromStr(input)
      }
    }
    // 0777
    else if(/^0[0-7]{3}$/.test(input)) {
      md = WnObj.modeFromOctalMode(input.substring(1))
    }
    // 777
    else if (octal) {
      md = WnObj.modeFromOctalMode(input)
    }
    // 488
    else {
      md = parseInt(input)
    }
    // Done
    return WnObj.modeToObj(md)
  },
  //----------------------------------------
  isBuiltInFields(key) {
    return FORM_FIELDS[key] ? true : false
  },
  //----------------------------------------
  getGroupTitle(titleKey) {
    if(/^(basic|privilege|thumb|timestamp|more|advance|customized|others)$/
        .test(titleKey))
      return `i18n:wn-key-grp-${titleKey}`
    return titleKey
  },
  //----------------------------------------
  getObjThumbDisplay(key="..") {
    return {
      key,
      type : "Object",
      transformer : {
        name : "Ti.Types.toObject",
        args : {
          icon  : "icon",
          thumb : "thumb",
          type  : "tp",
          mime  : "mime",
          race  : "race",
          timestamp : "__updated_time"
        }
      },
      comType  : "wn-obj-icon",
      comConf : {
        "className" : "img-contain",
        "..." : "${=value}",
        "defaultIcon" : "fas-birthday-cake",
        //"className"   : "thing-icon"
      }
    }
  },
  //----------------------------------------
  getTableFieldAs(key, type, iteratee=_.identity) {
    if(_.isFunction(type)) {
      iteratee = type
      type = null
    }
    let fld = {title:key}
    // Size
    if("size" == type) {
      fld.display = {
        key : `rawData.${key}`,
        transformer : "Ti.S.sizeText",
        comConf : {
          className : "as-tip-block align-right",
        }
      }
    }
    // Time
    else if("AMS" == type) {
      fld.display = {
        key : `rawData.${key}`,
        transformer : "Ti.DateTime.timeText",
        comConf : {
          className : "as-tip-block align-right",
        }
      }
    }
    // Default
    else {
      fld.display = {
        key : `rawData.${key}`
      }
    }
    // Done
    return iteratee(fld) || fld
  },
  //----------------------------------------
  getTableField(key) {
    if(_.isString(key)) {
      let fld = _.get(TABLE_FIELDS, key)
      if(!fld) {
        return {
          title: key,
          display: key
        }
      }
      if(_.isFunction(fld)) {
        return fld(key)
      }
      return fld
    }
    if(_.isFunction(key)) {
      return key()
    }
    return key
  },
  //----------------------------------------
  getField(key) {
    let fld = FORM_FIELDS[key]
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
               || "children" == k
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
    titleBy,
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
        if(homePath.endsWith("/")) {
          homePath = homePath.substring(0, homePath.length - 1)
        }
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
          text  : Wn.Util.getObjDisplayName(an, titleBy),
          value : an.id,
          href  : Wn.Util.getAppLink(an) + ""
        }
        item = iteratee(item, i, an)
        if(item) {
          list.push(item)
        }  
      }
      // Top Item, just show title
      if(self) {
        let item = {
          icon  : Wn.Util.getIconObj(meta),
          text  : Wn.Util.getObjDisplayName(meta, titleBy),
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