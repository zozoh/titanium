export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "className" : null,
    "icon" : {
      type : Object,
      default : ()=>({
        type : "font",
        value : "im-hashtag"
      })
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
    onChangeTextarea() {
      let vm = this
      let $t = vm.$refs.text
      let txt = $t.value
      vm.$emit("changed", txt)
    }
  },
  ///////////////////////////////////////////////////
  created : function() {
    this.onDebounceChangeTextarea = _.debounce(
      this.onChangeTextarea, 500
    )
  }
  ///////////////////////////////////////////////////
}