const _M = {
  ///////////////////////////////////////////////////////
  props : {
    "depth" : {
      type:Number, 
      default:0
    },
    "icon"  : {
      type:[String,Object], 
      default:undefined
    },
    "title" : {
      type:String, 
      default:undefined
    },
    "page"  : {
      type:String, 
      default:undefined
    },
    "href"  : {
      type:String, 
      default:undefined
    },
    "items" : {
      type : Array,
      default : undefined
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return {
        "is-top"   : this.isTop,
        "is-sub"   : !this.isTop,
        "is-group" : this.isGroup,
        "is-item"  : !this.isGroup,
        "is-highlight" : this.isHighlight
      }
    },
    //---------------------------------------------------
    isTop() {
      return this.depth == 0
    },
    //---------------------------------------------------
    isGroup() {
      return _.isArray(this.items)
    },
    //---------------------------------------------------
    isHighlight() {
      return this.id && this.id == this.highlightId
    },
    //---------------------------------------------------
    hasSubItems() {
      return !_.isEmpty(this.items)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    OnClickItemInfo() {
      this.$notify("nav:to", {
        value: this.page
      })
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
export default _M;