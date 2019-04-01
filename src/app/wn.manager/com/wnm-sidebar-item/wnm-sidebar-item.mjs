export default {
  data : ()=>{
    return {
      collapse : true
    }
  },
  props : {
    groupStatusStoreKey : {type:String, default:null},
    highlightId : {type:String, default:null},
    id : {type:String, default:null},
    depth : {type:Number, default:0},
    icon  : {type:[String,Object], default:null},
    title : {type:String, default:null},
    path  : {type:String, default:null},
    view  : {type:String, default:null},
    items : {
      type : Array,
      default : ()=>[]
    },
    doOpenPath : {type:Function, default:null},
    getObjLink : {type:Function, default:_.identity}
  },
  computed : {
    isTop() {
      return this.depth == 0
    },
    isGroup() {
      return _.isArray(this.items)
    },
    isHighlight() {
      return this.id && this.id == this.highlightId
    },
    itemLink() {
      return this.getObjLink(this.id)
    },
    itemClass() {
      let ss = [
        this.isTop ? "top" : "sub", 
        this.isGroup ? "group" : "item"]
      // Prepare return
      let re = ["", ss.join("-")].concat(ss)
      // collapse / expend
      re.push(this.collapse?"collapse":"expend")
      // hightlight or not
      if(this.isHighlight) {
        re.push("highlight")
      }
      // Return
      return re.join(" is-").trim()
    },
    itemIcon() {
      let icon = this.icon
      if(_.isString(icon)){
        return icon
      }
      return Ti.Icons.get(icon)
    }
  },
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
      if(this.path && _.isFunction(this.doOpenPath)) {
        this.doOpenPath(this.path)
      }
    }
  },
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
}