export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  data : ()=>{
    return {
      collapse : true
    }
  },
  ///////////////////////////////////////////
  props : {
    groupStatusStoreKey : {type:String, default:null},
    highlightId : {type:String, default:null},
    id : {type:String, default:null},
    depth : {type:Number, default:0},
    icon  : {type:[String,Object], default:null},
    title : {type:String, default:null},
    path  : {type:String, default:null},
    view  : {type:String, default:null},
    href  : {type:String, default:null},
    items : {
      type : Array,
      default : ()=>[]
    }
  },
  ///////////////////////////////////////////
  computed : {
    topClass() {
      return {
        "is-top"   : this.isTop,
        "is-sub"   : !this.isTop,
        "is-group" : this.isGroup,
        "is-item"  : !this.isGroup,
        "is-collapse"  : this.collapse,
        "is-expend"    : !this.collapse,
        "is-highlight" : this.isHighlight
      }
    },
    isTop() {
      return this.depth == 0
    },
    isGroup() {
      return _.isArray(this.items)
    },
    isHighlight() {
      return this.id && this.id == this.highlightId
    }
  },
  ///////////////////////////////////////////
  methods : {
    onClickGroupInfo() {
      if(this.isGroup) {
        this.collapse = !this.collapse
        // Save status
        if(this.groupStatusStoreKey) {
          Ti.Storage.session.set(this.groupStatusStoreKey, this.collapse)
        }
      }
    },
    onClickItemInfo() {
      this.$emit("selected", {
        id: this.id,
        title : this.title,
        path : this.path,
        href : this.href,
        view : this.view
      })
    }
  },
  ///////////////////////////////////////////
  mounted : function(){
    if(this.isGroup) {
      // Only Top Group is expended
      if(this.isTop) {
        this.collapse = false
      }
      // Others group will default collapse
      // The 'item' will ignore the setting of collapse
      else {
        this.collapse = true
      }
      // Load local setting
      if(this.groupStatusStoreKey) {
        this.collapse = 
          Ti.Storage.session.getBoolean(this.groupStatusStoreKey, this.collapse)
      }
    }
  }
  ///////////////////////////////////////////
}