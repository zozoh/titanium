export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : null
    },
    "highlightItemId" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    theTreeData() {
      let list = []
      if(_.isArray(this.items)) {
        for(let it of this.items) {
          list.push(this.evalItemToTreeNode(it))
        }
      }
      return list;
    },
    //-------------------------------------
    theCheckedIds() {
      if(!this.highlightItemId) {
        return []
      }
      return [this.highlightItemId]
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    evalItemToTreeNode(it={}) {
      // Children
      let children = null
      if(_.isArray(it.items)) {
        children = []
        for(let subIt of it.items) {
          children.push(this.evalItemToTreeNode(subIt))
        }
      }
      // Self
      return {
        name  : it.key,
        text  : it.title,
        icon  : it.icon,
        value : it.id,
        children
      }
    },
    //-------------------------------------
    onItemActived({current={}}={}){
      if(current.value) {
        this.$emit("item:actived", {
          id : current.value
        })
      }
    }
    //-------------------------------------
  }
  //////////////////////////////////////////
}