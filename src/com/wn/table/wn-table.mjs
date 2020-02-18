/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    explainDict : async function(value, dict){
      return await Wn.Dict.get(dict, value)
    }
  }),
  ///////////////////////////////////////////////////
  props : {
    "idBy" : {
      type : [String, Function],
      default : "id"
    },
    "className" : {
      type : String,
      default : null
    },
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "extendFunctionSet" : {
      type : Object,
      default : ()=>({})
    },
    "data" : {
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
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    },
    "cancelable" : {
      type : Boolean,
      default : true
    },
    "hoverable" : {
      type : Boolean,
      default : true
  },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "head" : {
      type : String,
      default : "frozen",
      validator : v =>
        Ti.Util.isNil(v) 
        || /^(frozen|none|normal)$/.test(v)
    },
    "border" : {
      type : String,
      default : "column",
      validator : v => /^(row|column|cell|none)$/.test(v)
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    theFields() {
      let list = []
      for(let fld of this.fields) {
        // Eval fld
        let f2 = Ti.Util.explainObj(this, fld, {
          iteratee : (obj)=>{
            // Quick: table.field.display:: thumb->icon
            let m = /^@<thumb(:([^>]*))?>$/.exec(obj)
            if(m) {
              let defaultIcon = m[2] || undefined
              return {
                key : ["icon", "thumb", "tp", "mime", "race", "__updated_time"],
                type : "Object",
                transformer : {
                  name : "toObject",
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
                  "..." : "${=value}",
                  "defaultIcon" : defaultIcon,
                  "className"   : "thing-icon"
                }
              }
            }
            // by pass
            return obj
          }
        })
        // join to the result list
        list.push(f2)
      }
      return list
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    onSelected(eventInfo) {
      //console.log("wn-table onSelected", eventInfo)
      this.$emit("selected", eventInfo)
    },
    //----------------------------------------------
    onOpen(eventInfo) {
      //console.log("wn-table onOpen", eventInfo)
      this.$emit("open", eventInfo)
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}