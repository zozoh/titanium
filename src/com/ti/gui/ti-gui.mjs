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
    "border" : {
      type : Boolean,
      default : false
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
    },
    "shown" : {
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
  watch : {
    "shown" : function() {
      //console.log("shown changed", this.shown)
      this.$forceUpdate()
    }
  },
  //////////////////////////////////////////
  methods : {
    __formed_list(list=[]) {
      let list2 = []
      if(_.isArray(list)) {
        for(let b of list) {
          // ClassName
          let klass = [`at-${b.position||"center"}`]
          // Show/hide
          let isShown = this.shown[b.name] ? true : false
          // Mask
          if(b.mask) {
            klass.push(`show-mask`)
          }
          // Transition Name
          let transName = `gui-panel-${b.position}`
          // Block Info
          let info = _.pick(b, [
              "title","icon","actions","name", "adjustable", 
              "position", "width", "height", "closer"])
          // Sizing
          if(b.size && "stretch"!=b.size) {
            // Cols
            if("cols" == this.type) {
              info.width = b.size
            }
            // Rows
            else if("rows" == this.type) {
              info.height = b.size
            }
          }
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
              "type", "blocks", "adjustable", "border"
            ])
            _.defaults(comConf, {
              type : "cols",
              schema : this.schema
            })
          }
          // Join to result list
          list2.push({
            className: klass.join(" "), 
            name : b.name,
            isShown, transName,
            info, comType, comConf
          })
        }
      }
      //console.log(list2)
      return list2
    }
  }
  //////////////////////////////////////////
}