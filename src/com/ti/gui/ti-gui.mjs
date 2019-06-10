export default {
  /////////////////////////////////////////
  props : {
    "type" : {
      type : String,
      // cols | rows | tabs | wall
      default : "cols"
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "panels" : {
      type : Array,
      default : ()=>[]
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    formedBlockList() {
      return this.__formed_list(this.blocks)
    },
    formedPanelList() {
      return this.__formed_list(this.panels)
    },
    hasPanels() {
      return !_.isEmpty(this.panels)
    }
  },
  //////////////////////////////////////////
  methods : {
    __formed_list(list=[]) {
      let list2 = []
      if(_.isArray(list)) {
        for(let b of list) {
          let info = _.pick(b, [
              "title","icon","actions","name", "adjustable", "size",
              "position", "width", "height", "closer"])
          // ComType as body
          let comType, comConf
          if(b.body) {
            let com = b.body || {}
            if(_.isString(com)) {
              let sch = this.schema[com]
              // Define the detail in schema
              if(_.isPlainObject(sch)) {
                com = sch
              }
              // Just a com-type
              else {
                com = {comType:com, comConf:{}}
              }
            }
            comType = com.comType || "ti-label"
            comConf = com.comConf || {value:b.name||"GUI"}
          }
          // ComType as layout/block
          else if(!_.isEmpty(b.blocks)){
            comType = "ti-gui"
            comConf = _.pick(b, [
              "type", "blocks", "adjustable"
            ])
            _.defaults(comConf, {
              type : "cols",
              schema : this.schema
            })
          }
          // Join to result list
          list2.push({
            info, comType, comConf
          })
        }
      }
      console.log(list2)
      return list2
    }
  }
  //////////////////////////////////////////
}