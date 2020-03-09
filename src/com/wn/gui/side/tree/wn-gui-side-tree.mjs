export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    myItems : [],
    myTreeData : []
  }),
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : null
    },
    "highlightItemId" : {
      type : String,
      default : null
    },
    "highlightItemPath" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    theHighlightItemId() {
      let list = this.joinHighlightItems([], this.items)
      if(list.length > 0) {
        // Sort the list, 0->N, the first one should be the hightlight one
        list.sort((it0,it1)=>it0.score-it1.score)
        // Get the first one
        return _.first(list).id
      }
    },
    //-------------------------------------
    theCheckedIds() {
      if(!this.theHighlightItemId) {
        return []
      }
      return [this.theHighlightItemId]
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    evalTreeData(items=[]) {
      this.myItems = _.cloneDeep(items)
      let list = []
      if(_.isArray(items)) {
        for(let it of items) {
          list.push(this.evalItemToTreeNode(it))
        }
      }
      //console.log("theTreeData", list)
      this.myTreeData = list
    },
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
    joinHighlightItems(list=[], items=[]) {
      if(this.highlightItemId && _.isArray(items) && items.length>0) {
        for(let it of items) {
          // Match the ID, 0
          if(it.id == this.highlightItemId) {
            list.push({score:0, id: it.id})
          }
          // Match the Path, 1 or more
          else if(it.path && it.id
              && this.highlightItemPath 
              && this.highlightItemPath.startsWith(it.path)){
            let diff = this.highlightItemPath.length - it.path.length
            list.push({score:1+diff, id: it.id})
          }
          // Join Children
          if(it.items) {
            this.joinHighlightItems(list, it.items)
          }
        }
      }
      // Return self
      return list
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
  },
  //////////////////////////////////////////
  watch : {
    "items" : {
      handler : function(newVal, oldVal){
        if(!_.isEqual(newVal, this.myItems)) {
          this.evalTreeData(newVal)
        }
      },
      immediate : true
    }
  }
  //////////////////////////////////////////
}