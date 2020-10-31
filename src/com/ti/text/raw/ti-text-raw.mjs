const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    myContent : null,
    inputCompositionstart: false
  }),
  ///////////////////////////////////////////////////
  props : {
    "icon" : {
      type : [String, Object],
      default : undefined
    },
    "title" : {
      type : String,
      default : undefined
    },
    "trimed" : {
      type : Boolean,
      default : false
    },
    "value" : {
      type : String,
      default : undefined
    }, 
    "placeholder" : {
      type : String,
      default : "i18n:blank"
    },
    "status": {
      type : Object,
      default: ()=>({})
    },
    "readonly" : {
      type : Boolean,
      default : false
    },
    "readonlyWhenNil" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass({
        "show-title" : this.showTitle,
        "hide-title" : !this.showTitle,
        "is-changed" : _.get(this.status, "changed")
      })
    },
    //-----------------------------------------------
    isShowHead() {
      return this.title || this.icon
    },
    //-----------------------------------------------
    hasContent() {
      return !Ti.Util.isNil(this.value)
    },
    //-----------------------------------------------
    isReadonly() {
      if(this.readonly) {
        return true
      }
      if(this.readonlyWhenNil && Ti.Util.isNil(this.value)) {
        return true
      }
      return false
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnInputCompositionStart(){
      this.inputCompositionstart = true
    },
    //------------------------------------------------
    OnInputCompositionEnd(){
      this.inputCompositionstart = false
      this.OnTextChanged()
    },
    //------------------------------------------------
    OnInputing($event) {
      if(!this.inputCompositionstart) {
        this.OnTextChanged()
      }
    },
    //-----------------------------------------------
    OnTextChanged() {
      let str = _.get(this.$refs.text, "value")
      if(this.trimed) {
        str = _.trim(str)
      }
      this.myContent = str
    },
    //-----------------------------------------------
    syncMyContent() {
      this.myContent = this.value
    },
    //-----------------------------------------------
    checkMyContent() {
      if(this.myContent != this.value) {
        this.$notify("change", this.myContent)
      }
    },
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      if("CTRL+ENTER" == uniqKey) {
        if(this.myContent != this.value) {
          this.$notify("change", this.myContent)
        }
        return {prevent:true}
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "value" : "syncMyContent",
    "myContent": function(){
      this.debCheckChange()
    }
  },
  ///////////////////////////////////////////////////
  created : function() {
    this.debCheckChange = _.debounce(()=>{
      this.checkMyContent()
    }, 500)
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    this.syncMyContent()
  }
  ///////////////////////////////////////////////////
}
export default _M;