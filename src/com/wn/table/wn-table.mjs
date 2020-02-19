/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
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
    },
    //----------------------------------------------
    theExplainDict(){
      return this.explainDict
        || async function(value, dict){
          return await Wn.Dict.get(dict, value)
        }
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