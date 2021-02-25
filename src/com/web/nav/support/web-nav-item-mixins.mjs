const _M = {
  ///////////////////////////////////////////////////////
  props : {
    "id" : {
      type: String,
      default: undefined
    },
    "index" : {
      type: Number,
      default: undefined
    },
    "idPath" : {
      type : Array,
    },
    "indexPath" : {
      type : Array
    },
    "depth" : {
      type:Number, 
      default: 0
    },
    "icon"  : {
      type:[String,Object], 
      default:undefined
    },
    "title" : {
      type:String, 
      default:undefined
    },
    "type"  : {
      type:String, 
      default:undefined
    },
    "params"  : {
      type: Object, 
      default:undefined
    },
    "href"  : {
      type:String, 
      default:undefined
    },
    "target"  : {
      type:String, 
      default:undefined
    },
    "value"  : {
      type:String, 
      default:undefined
    },
    "items" : {
      type : Array,
      default : undefined
    },
    "highlight" : {
      type : Boolean,
    },
    "current" : {
      type : Boolean,
    },
    "openedIds"   : undefined,
    "openedDepth" : undefined
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-dock-ready" : this.myDockReady,
        "is-dock-show"  : this.myDockShow,
        "is-top"   : this.isTop,
        "is-sub"   : !this.isTop,
        "is-group" : this.isGroup,
        "is-item"  : !this.isGroup,
        "has-href"    : this.hasHref,
        "nil-href"    : !this.hasHref,
        "is-opened"   : this.isOpened,
        "is-closed"   : !this.isOpened,
        "is-highlight": this.highlight,
        "is-normal"   : !this.highlight,
        "is-current"  : this.current
      })
    },
    //---------------------------------------------------
    isTop() {return this.depth == 0},
    isGroup() {return _.isArray(this.items)},
    hasSubItems() {return !_.isEmpty(this.items)},
    //---------------------------------------------------
    hasHref() {return this.href ? true : false},
    hasValue() {return this.value ? true : false},
    hasHrefOrValue() {return this.hasHref || this.hasValue},
    //---------------------------------------------------
    isOpened() {
      if(this.isGroup) {
        let opened = _.get(this.openedIds, this.id)
        if(_.isUndefined(opened) && !_.isUndefined(this.openedDepth)) {
          return this.depth < this.openedDepth
        }
        return opened
      }
      return false
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    OnToggleGroupOpened() {
      this.notifyGroupOpenStatus(!this.isOpened)
    },
    //---------------------------------------------------
    OnOpenGroup() {
      //console.log("OnOpenGroup", this.indexPath)
      this.notifyGroupOpenStatus(true)
    },
    //---------------------------------------------------
    OnCloseGroup() {
      //console.log("OnCloseGroup", this.indexPath)
      this.notifyGroupOpenStatus(false)
    },
    //---------------------------------------------------
    notifyGroupOpenStatus(opened) {
      if(this.isGroup) {
        this.$notify("change:opened", {
          id     : this.id,
          idPath : this.idPath,
          type   : this.type,
          params : this.params,
          href   : this.href,
          target : this.target,
          value  : this.value,
          opened
        })
      }
    },
    //---------------------------------------------------
    OnClickItemInfo() {
      if(!this.hasHrefOrValue) {
        this.OnToggleGroupOpened()
      } else {
        this.OnClickItemLink()
      }
    },
    //---------------------------------------------------
    OnClickItemLink(evt) {
      if(this.hasHref && evt) {
        evt.stopPropagation()
      }
      this.$notify("click:item", evt, {
        id     : this.id,
        type   : this.type,
        params : this.params,
        href   : this.href,
        target : this.target,
        value  : this.value
      })
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
export default _M;