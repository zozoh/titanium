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
    theItems() {
      let list = []
      if(_.isArray(this.items)) {
        for(let it of this.items) {
          list.push(this.evalItem(it))
        }
      }
      return list;
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    evalItem(it={}) {
      // Children
      let items = null
      if(_.isArray(it.items)) {
        items = []
        for(let subIt of it.items) {
          items.push(this.evalItem(subIt))
        }
      }
      // Self
      return _.assign(_.pick(it, ["id","key","depth","icon","title","path","view"]), {
        items,
        groupStatusStoreKey : it.key,
        highlightId : this.highlightItemId,
        href : it.id ? Wn.Util.getAppLink(it.id)+"" : null
      })
    },
    //-------------------------------------
    onItemSelected(payload={}){
      this.$emit("selected", payload)
    }
    //-------------------------------------
  }
  //////////////////////////////////////////
}