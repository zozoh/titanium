const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    myText : undefined
  }),
  ////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "title" : {
      type : String,
      default : "i18n:comments"
    },
    "value" : {
      type : String,
      default : undefined
    },
    "total" : {
      type : Number,
      default : undefined
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "trimed" : {
      type : Boolean,
      default : true
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "placeholder" : {
      type : [String, Number],
      default : undefined
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "emojiBtnIcon" : {
      type : String,
      default : "far-smile"
    },
    "emojiBtnText" : {
      type : String,
      default : "i18n:emoji"
    },
    "postBtnIcon" : {
      type : String,
      default : "fas-paper-plane"
    },
    "postBtnText" : {
      type : String,
      default : "i18n:post"
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "width" : {
      type : [Number, String],
      default : "100%"
    },
    "height" : {
      type : [Number, String],
      default : "2.6rem"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return Ti.Css.mergeClassName(this.className, {
        "is-self-actived" : this.isSelfActived,
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder
      })
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    hasTitle() {
      return this.title ? true : false
    },
    //------------------------------------------------
    TextValue() {
      return Ti.Util.fallbackNil(this.myText, this.value)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnTextChange() {
      let str = this.$refs.text.value
      this.myText = this.formatValue(str)
    },
    //------------------------------------------------
    async OnBtnEmojiClick() {
      // Get Text Range
      let i_start = this.$refs.text.selectionStart
      let i_end = this.$refs.text.selectionEnd
      console.log({i_start, i_end})

      let emoji = await Ti.App.Open({
        title  : "i18n:emoji",
        width  : "6.4rem",
        height : "4.8rem",
        textOk : null,
        changeToClose : true,
        comType : "TiIsheetEmoji",
        comConf : {

        }
      })

      // User Cancel
      if(!emoji)
        return
      
      // Insert emoji
      let str = this.$refs.text.value
      let s_0 = str.substring(0, i_start)
      let s_1 = str.substring(i_end)
      this.myText = s_0 + emoji + s_1;
    },
    //------------------------------------------------
    OnBtnPostClick() {

    },
    //------------------------------------------------
    formatValue(val) {
      if(val && this.trimed) {
        return _.trim(val)
      }
      return val
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;