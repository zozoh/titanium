export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  props : {
    "className" : null,
    "index" : {
      type : Number,
      default : 0
    },
    "name" : {
      type : String,
      default : null
    },
    "path" : {
      type : Array,
      default : ()=>[]
    },
    "text" : {
      type : String,
      default : null
    },
    "icon" : {
      type : [String, Object],
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    "value" : null,
    "tip" : {
      type : String,
      default : null
    },
    "selected" : {
      type : Boolean,
      default : false
    },
    "opened" : {
      type : Boolean,
      default : false
    },
    "children" : {
      type : Array,
      default : null
    },
    "handleIcons" : {
      type : Object,
      default : ()=>({
        "opened" : "zmdi-chevron-down",
        "closed" : "zmdi-chevron-right"
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-opened"   : this.opened,
        "is-selected" : this.selected
      }, this.className)
    },
    //--------------------------------------
    isLeaf() {
      return _.isArray(this.children)
    },
    //--------------------------------------
    theIconList() {
      if(this.icon) {
        // Static Icon
        if(_.isString(this.icon)) {
          return [this.icon]
        }
        // Alt Icon Set
        if(_.isPlainObject(this.icon)) {
          if(this.icon.opened && this.icon.closed) {
            return this.opened
              ? [this.icon.opened]
              : [this.icon.closed]
          }
          return [this.icon]
        }
        // Array icon list
        if(_.isArray(this.icon)) {
          return this.icon
        }
      }
      return []
    },
    //--------------------------------------
    theHref() {
      if(this.href) {
        return Ti.S.renderBy(this.href, this)
      }
    },
    //--------------------------------------
    theHandleIcon() {
      return this.opened
        ? this.handleIcons.opened
        : this.handleIcons.closed
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onClickSelf() {
      console.log("click self")
    },
    //--------------------------------------
    onClickHandle() {
      console.log("click handle")
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}