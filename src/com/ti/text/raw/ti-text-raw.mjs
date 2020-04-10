export default {
  ///////////////////////////////////////////////////
  model : {
    prop  : "content",
    event : "change"
  },
  ///////////////////////////////////////////////////
  data : ()=>({
    myContent : null
  }),
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
    "trimed" : {
      type : Boolean,
      default : false
    },
    "content" : {
      type : String,
      default : ""
    }, 
    "status" : {
      type : Object,
      default : ()=>{
        changed : false
      }
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
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass({
        "show-title" : this.showTitle,
        "hide-title" : !this.showTitle
      })
    },
    //-----------------------------------------------
    HeadClass() {
      return {
        "content-changed" : this.isContentChanged
      }
    },
    //-----------------------------------------------
    hasContent() {
      return !Ti.Util.isNil(this.content)
    },
    //-----------------------------------------------
    placeholder() {
      return Ti.I18n.text(this.blankText)
    },
    //-----------------------------------------------
    isContentChanged() {
      if(this.ignoreKeyUp) {
        return this.myContent != this.content
      }
      return _.get(this.status, "changed")
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    getContent() {
      return this.myContent
    },
    //-----------------------------------------------
    checkContentChanged(emit=true) {
      let vm = this
      let $t = vm.$refs.text
      if(_.isElement($t)) {
        let txt = $t.value
        if(this.trimed) {
          txt = _.trim(txt)
        }
        this.myContent = txt
        if(emit && txt != this.content) {
          vm.$notify("change", txt)
        }
      }
    },
    //-----------------------------------------------
    onTextareaKeyup() {
      this.checkContentChanged(!this.ignoreKeyUp)
    },
    //-----------------------------------------------
    OnContentChanged() {
      this.checkContentChanged(true)
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
  watch : {
    "content" : function() {
      this.myContent = this.content
    }
  },
  ///////////////////////////////////////////////////
  created : function() {
    this.OnTextareaKeyup = _.debounce(()=>{
      this.checkContentChanged(!this.ignoreKeyUp)
    }, 500)
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    this.myContent = this.content
  }
  ///////////////////////////////////////////////////
}