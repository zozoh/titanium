export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "icon" : {
      type : [String, Object],
      default : "im-hashtag"
    },
    "title" : {
      type : String,
      default : "No Title"
    },
    "showTitle" : {
      type : Boolean,
      default : true
    },
    "content" : {
      type : String,
      default : ""
    }, 
    "contentIsChanged" : {
      type : Boolean,
      default : false
    },
    "ignoreKeyUp" : {
      type : Boolean,
      default : false
    },
    "blankText" : {
      type : String,
      default : "i18n:blank"
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived"     : this.isActived,
        "show-title" : this.showTitle,
        "hide-title" : !this.showTitle
      }, this.className)
    },
    headClass() {
      return {
        "content-changed" : this.contentIsChanged
      }
    },
    placeholder() {
      return Ti.I18n.text(this.blankText)
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    checkContentChanged() {
      let vm = this
      let $t = vm.$refs.text
      let txt = $t.value
      if(txt != this.content) {
        vm.$emit("changed", txt)
      }
    },
    //-----------------------------------------------
    onTextareaKeyup() {
      if(!this.ignoreKeyUp) {
        this.checkContentChanged()
      }
    },
    //-----------------------------------------------
    onContentChanged() {
      this.checkContentChanged()
    },
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      if("CTRL+ENTER" == uniqKey) {
        this.checkContentChanged()
        return {prevent:true}
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  created : function() {
    this.debounceTextareaKeyup = _.debounce(
      this.onTextareaKeyup, 500
    )
  }
  ///////////////////////////////////////////////////
}