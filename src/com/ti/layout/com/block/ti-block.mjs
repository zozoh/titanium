export default {
  inheritAttrs : true,
  /////////////////////////////////////////
  props : {
    "title" : {
      type : String,
      default : null
    },
    "icon" : {
      type : String,
      default : null
    },
    "actions" : {
      type : Array,
      default : ()=>[]
    },
    "name" : {
      type : String,
      default : null
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "position" : {
      type : String,
      default : "center/center"
    },
    "width" : {
      type : [String,Number],
      default : -1
    },
    "height" : {
      type : [String,Number],
      default : -1
    },
    "closer" : {
      type : String,
      default : "default"
    }
  },
  //////////////////////////////////////////
  computed : {
    hasTitle() {
      return this.title ? true : false
    },
    hasIcon() {
      return this.icon ? true : false
    },
    hasActions() {
      return !_.isEmpty(this.actions)
    },
    showHeader() {
      return this.hasTitle || this.hasIcon || this.hasActions
    },
    topStyle() {
      let style = {}
      if(_.isString(this.width) || this.width > 0) {
        style.width = Ti.Css.toSize(this.width)
      }
      if(_.isString(this.height) || this.height > 0) {
        style.height = Ti.Css.toSize(this.height)
      }
      if(!_.isEmpty(style)) {
        style.flex = "0 0 auto"
      }
      return style
    }
  },
  //////////////////////////////////////////
  methods : {
    
  }
  //////////////////////////////////////////
}