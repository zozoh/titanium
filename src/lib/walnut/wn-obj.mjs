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
    name  : "ph"
  },
  //---------------------------------------------
  "race" : {
    title : "i18n:wn-key-race",
    name  : "race",
    comConf : {
      format : "i18n:wn-race-${val}"
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
}
////////////////////////////////////////////
export const WnObj = {
  //----------------------------------------
  getField(key) {
    return _.cloneDeep(FIELDS[key])
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
          list.push(f2)
        }
      }
      // Customized Prop
      else if(_.isPlainObject(fld) && fld.name){
        fld = iteratee(fld)
        list.push(fld)
      }
    }
    return list
  }
  //----------------------------------------
}
////////////////////////////////////////////
export default WnObj;