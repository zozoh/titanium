export default {
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
    "options": {
      type: [Array, String],
      default: "stars"
    },
    "iconSize" : {
      type : [Number,String],
      default : null
    },
    "dropWidth" : {
      type : [Number, String],
      default : "4rem"
    },
    "dropHeight" : {
      type : [Number, String],
      default : "4.2rem"
    },
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return Ti.Css.mergeClassName({
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
      }, this.className)
    },
    //------------------------------------------------
    ValueStyle() {
      return {
        "font-size" : Ti.Css.toSize(this.iconSize)
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
    TipIcon () {
      return  this.myHoverIcon || this.value
    },
    //------------------------------------------------
    OptionIcons() {
      let list = []
      let icons;
      if(_.isArray(this.options)) {
        icons = this.options
      } else {
        icons = this.queryIcons(this.options)
      }
      _.forEach(icons, (icon, index)=>{
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
    OnToggleDrop() {
      this.status = ({
        "collapse" : "extended",
        "extended" : "collapse"
      })[this.status]
    },
    //------------------------------------------------
    OnSelectIcon({value}={}) {
      this.$notify("change", value)
    },
    //------------------------------------------------
    OnSelectIconAndCollapse({value}={}) {
      this.$notify("change", value)
      this.status = "collapse"
    },
    //------------------------------------------------
    OnChangedIcon() {
      let icon = _.trim(this.$refs.input.value)
      console.log("haha", icon)
      this.$notify("change", icon)
    },
    //------------------------------------------------
    OnHoverIcon({value}={}) {
      this.myHoverIcon = value
    },
    //------------------------------------------------
    OnLeaveIcon() {
      this.myHoverIcon = null
    },
    //------------------------------------------------
    OnClearIcon() {
      this.$notify("change", null)
    },
    //------------------------------------------------
    doCollapse() {
      this.status = "collapse"
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}