/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "idKey" : {
      type : String,
      default : "id"
    },
    "className" : {
      type : String,
      default : null
    },
    /***
     * @see ti-table.fields
     */
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "extendFunctionSet" : {
      type : Object,
      default : ()=>({})
    },
    "list" : {
      type : Array,
      default : ()=>[]
    },
    "changedId" : {
      type : String,
      default : null
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Array,
      default : ()=>[]
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    "checkable" : {
      type : Boolean,
      default : false
    },
    "blurable" : {
      type : Boolean,
      default : true
    },
    "border" : {
      type : Boolean,
      default : true
    },
    "selectable" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    formedFields() {
      let list = []
      for(let fld of this.fields) {
        // Eval fld
        let f2 = Ti.Util.explainObj(this, fld, (obj)=>{
          // Quick: table.field.display:: thumb->icon
          let m = /^@<thumb(:([^>]*))>$/.exec(obj)
          if(m) {
            let defaultIcon = m[2] || undefined
            return {
              key : ["icon", "thumb", "__updated_time"],
              type : "Object",
              transformer : {
                name : "toObject",
                args : {
                  icon  : "icon",
                  thumb : "thumb",
                  timestamp : "__updated_time"
                }
              },
              comType  : "wn-obj-icon",
              comConf : {
                "=value" : true,
                "defaultIcon" : defaultIcon
              }
            }
          }
          // by pass
          return obj
        })
        // join to the result list
        list.push(f2)
      }
      return list
    }
  }
  ///////////////////////////////////////////////////
}