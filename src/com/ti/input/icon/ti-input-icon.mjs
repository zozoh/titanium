export default {
  ////////////////////////////////////////////////////
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data: ()=>({
    hideBorder : false,
    myHoverIcon : null,
    status  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    // "hideBorder"  : {
    //   type : Boolean,
    //   default : false
    // },
    "value" : {
      type : [String, Object],
      default : null
    },
    "iconSize" : {
      type : String,
      default : null
    },
    "dropWidth" : {
      type : [Number, String],
      default : "4rem"
    },
    "dropHeight" : {
      type : [Number, String],
      default : "4rem"
    },
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
      }, this.className)
    },
    //------------------------------------------------
    theValueStyle() {
      return {
        "font-size" : this.iconSize
      }
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    hasValue () {
      return !Ti.Util.isNil(this.value)
    },
    //------------------------------------------------
    theTipIcon () {
      return  this.myHoverIcon || this.value
    },
    //------------------------------------------------
    theOptionIcons() {
      let list = []
      _.forEach(this.options, (icon, index)=>{
        let m = /^([a-z]+)-(.+)$/.exec(icon)
        list.push({
          value : icon,
          index : index,
          type  : m[1],
          name  : m[2]
        })
      })
      return list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onToggleDrop() {
      this.status = ({
        "collapse" : "extended",
        "extended" : "collapse"
      })[this.status]
    },
    //------------------------------------------------
    onSelectIcon({value}={}) {
      this.$emit("changed", value)
    },
    //------------------------------------------------
    onSelectIconAndCollapse({value}={}) {
      this.$emit("changed", value)
      this.status = "collapse"
    },
    //------------------------------------------------
    onChangedIcon() {
      let icon = _.trim(this.$refs.input.value)
      console.log("haha", icon)
      this.$emit("changed", icon)
    },
    //------------------------------------------------
    onHoverIcon({value}={}) {
      this.myHoverIcon = value
    },
    //------------------------------------------------
    onLeaveIcon() {
      this.myHoverIcon = null
    },
    //------------------------------------------------
    onClearIcon() {
      this.$emit("changed", null)
    },
    //------------------------------------------------
    doCollapse() {
      this.status = "collapse"
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}