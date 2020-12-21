const _M = {
  ///////////////////////////////////////////////////////
  props : {
    "id" : {
      type: String,
      default: undefined
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
    "openedIds"   : undefined,
    "openedDepth" : undefined,
    "openedIcons" : undefined
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-top"   : this.isTop,
        "is-sub"   : !this.isTop,
        "is-group" : this.isGroup,
        "is-item"  : !this.isGroup,
        "is-highlight" : this.isHighlight
      })
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
    },
    //---------------------------------------------------
    isOpened() {
      if(this.isGroup) {
        let opened = _.get(this.openedIds, this.id)
        if(_.isUndefined(opened)) {
          return this.depth < this.openedDepth
        }
        return opened
      }
      return false
    },
    //---------------------------------------------------
    OpenStatusIcon() {
      return this.isOpened
        ? this.openedIcons.opened
        : this.openedIcons.closed
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    OnClickItemInfo() {
      if(this.isGroup) {
        this.$notify("change:opened", {
          id     : this.id,  
          type   : this.type,
          params : this.params,
          href   : this.href,
          target : this.target,
          value  : this.value,
          opened : !this.isOpened
        })
      }
    },
    //---------------------------------------------------
    OnClickItemLink(evt) {
      if(this.href) {
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
    },
    //---------------------------------------------------
    OnTransBeforeEnter($con) {
      // console.log("before enter")
      Ti.Dom.setStyle($con, {height: 0, overflow: "hidden"})
    },
    OnTransEnter($con) {
      // console.log("enter")
      Ti.Dom.setStyle($con, {height: $con.scrollHeight - 4})
    },
    OnTransAfterEnter($con) {
      // console.log("after enter")
      _.delay(()=>{
        Ti.Dom.setStyle($con, {height: "", overflow: ""})
      })
    },
    //---------------------------------------------------
    OnTransBeforeLeave($con) {
      //console.log("before leave", height)
      Ti.Dom.setStyle($con, {height: $con.scrollHeight, overflow: "hidden"})
    },
    OnTransLeave($con) {
      //console.log("leave", $con.scrollHeight)
      _.delay(()=>{
        Ti.Dom.setStyle($con, {height: 0})
      })
    },
    OnTransAfterLeave($con) {
      //console.log("after leave")
      _.delay(()=>{
        Ti.Dom.setStyle($con, {height: "", overflow: ""})
      })
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
export default _M;