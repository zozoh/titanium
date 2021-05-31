const _M = {
  ////////////////////////////////////////////////////
  props : {
    "multi" : {
      type : Boolean,
      default : false
    },
    "treeConf": {
      type : Object
    },
    "idBy": {
      type: String,
      default: "id"
    },
    "nameBy": {
      type: String,
      default: "name"
    },
    "childrenBy": {
      type: String,
      default: "children"
    },
    //
    // - id      : "6dywqcw.."   # Node Id
    // - path    : "a/b/c"       # Node Path
    // - axisIds : [ID,ID,ID]    # Node ancestor and self Ids
    //
    "valueType": {
      type: String,
      default: "id",
      validator: v => /^(id|path|axisIds)$/.test(v)
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ComType() {
      return this.multi
        ? "wn-combo-multi-input"
        : "wn-combo-input"
    },
    //------------------------------------------------
    TreeDropComConf() {
      return _.assign({
        border: this.dropItemBorder ? "row" : "none",
        display: this.dropDisplay || [
          '@<thumb>', 
          'title|text|nm::flex-auto', 
          'id|value|nm::as-tip-block align-right'],
        autoOpen : true,
        showRoot : false,
        defaultOpenDepth : 3
      }, this.treeConf)
    },
    //------------------------------------------------
    TheDropDisplay() {
      if(this.dropDisplay)
        return this.dropDisplay;

      return ["@<thumb>", "title|nm"]
    },
    //------------------------------------------------
    TheValue() {
      if(this.value) {
        let val = ({
          id : (val)=> val,
          path : (val)=> {
            if(_.isArray(val)) {
              return val.join("/")
            }
            return val
          },
          axisIds : (val)=>{
            if(!_.isArray(val)) {
              val = val.split(/[,; ]/g)
            }
            return _.last(val)
          }
        })[this.valueType](this.value)
        return val
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    OnValueChange(val) {
      let root = this.getTreeRoot()
      let hie = Ti.Trees.getById(root, val, {
        idBy: this.idBy,
        nameBy: this.nameBy,
        childrenBy: this.childrenBy
      })
      let v;
      if(hie) {
        v = ({
          id : (hie)=> hie.id,
          path : (hie)=> hie.path,
          axisIds : (hie)=>{
            let ids = []
            // Ancestors
            _.forEach(hie.ancestors, ({id})=>{
              if(!Ti.Util.isNil(id)) {
                ids.push(id)
              }
            })
            // Self
            if(hie.id) {
              ids.push(hie.id)
            }
            return ids
          }
        })[this.valueType](hie)
      }
      this.$notify("change", v)
    },
    //------------------------------------------------
    getMyOptionData() {
      let $comboInput = this.$children[0].$children[0]
      return $comboInput.myOptionsData || []
    },
    //------------------------------------------------
    getTreeRoot() {
      let treeData = this.getMyOptionData()
      if(_.isArray(treeData)) {
        return {children: treeData}
      }
      return treeData
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;