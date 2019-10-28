export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "inputCompositionstart" : false,
    "focused" : false
  }),
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "value" : null,
    "inputing" : {
      type : String,
      default : null
    },
    "valueCase" : {
      type : String,
      default : null,
      validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
    },
    "placeholder" : {
      type : [String, Number],
      default : null
    },
    "trimed" : {
      type : Boolean,
      default : true
    },
    // the whole top-box width
    "width" : {
      type : [Number, String],
      default : null
    },
    "inputHeight" : {
      type : [Number, String],
      default : null
    },
    "highlight" : {
      type : Boolean,
      default : false
    },
    "tagIcon" : {
      type : String,
      default : null
    },
    "tagOptions" : {
      type : [Array, Function],
      default : ()=>[]
    },
    "suffixIcon" : {
      type : String,
      //default : "zmdi-chevron-down"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className, {
        "is-focused"   : this.focused,
        "is-blurred"   : !this.focused,
        "is-highlight" : this.highlight,
        "has-suffix-icon" : this.suffixIcon
      })
    },
    //------------------------------------------------
    topStyle(){
      return Ti.Css.toStyle({
        width  : this.width
      })
    },
    //------------------------------------------------
    inputStyle(){
      return Ti.Css.toStyle({
        height : this.inputHeight
      })
    },
    //------------------------------------------------
    theInputValue() {
      return Ti.S.toCase(this.inputing, this.valueCase)
    },
    //------------------------------------------------
    /***
     * @return The tag objects list like:
     * 
     * ```js
     * [{
     *   icon  : "zmdi-phone",
     *   text  : "i18n:xxx",
     *   value : 100,
     *   options : [{icon,text,value}...]
     * }]
     * ```
     */
    theTags() {
      let list = _.filter(_.concat(this.value), (v)=>!Ti.Util.isNil(v))
      let tags = []
      for(let li of list) {
        // Object
        if(_.isPlainObject(li)) {
          tags.push(_.assign({
            icon    : this.tagIcon,
            options : this.tagOptions
          }, li))
        }
        // String or simple value
        else {
          tags.push({
            icon  : this.tagIcon,
            text  : Ti.Types.toStr(li),
            value : li,
            options : this.tagOptions
          })
        }
      }
      return tags
    },
    //------------------------------------------------
    theTagValues() {
      let list = []
      for(let tag of this.theTags) {
        list.push(Ti.Util.fallback(tag.value, null))
      }
      return list
    },
    //------------------------------------------------
    hasTags() {
      return !_.isEmpty(this.theTags)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onInputCompositionStart(){
      this.inputCompositionstart = true
    },
    //------------------------------------------------
    onInputCompositionEnd(){
      this.inputCompositionstart = false
      this.doWhenInput()
    },
    //------------------------------------------------
    onInputing($event) {
      if(!this.inputCompositionstart) {
        this.doWhenInput()
      }
    },
    //------------------------------------------------
    doWhenInput(emitName="inputing") {
      if(_.isElement(this.$refs.input)) {
        //console.log("doWhenInput", emitName)
        let val = this.$refs.input.value
        if(this.trimed) {
          val = _.trim(val)
        }
        val = Ti.S.toCase(val, this.valueCase)
        this.$emit(emitName, val)
      }
    },
    //------------------------------------------------
    onInputKeyDown($event) {
      let payload = _.pick($event, 
        "code","key","keyCode",
        "altKey","ctrlKey","metaKey","shiftKey")
      payload.uniqueKey = Ti.Shortcut.getUniqueKey(payload)
      payload.$event = $event
      this.$emit("keypress", payload)
    },
    //------------------------------------------------
    onInputChanged($event) {
      let $in = $event.target
      if(_.isElement($in)) {
        let val = _.trim($in.value)
        let ss  = _.split(val, /[ ,;\t]+/)
        let s2  = _.remove(ss, (v)=>!v)
        let values = _.concat(this.theTagValues, ss)
        let caseFn = Ti.S.getCaseFunc(this.valueCase)
        if(_.isFunction(caseFn)) {
          for(let i=0; i<values.length; i++) {
            values[i] = caseFn(values[i])
          }
        }
        this.$emit("changed", values)
      }
    },
    //------------------------------------------------
    onInputFocus() {
      this.focused = true
      this.$emit("focused")      
    },
    //------------------------------------------------
    onInputBlur() {
      this.focused = false
      this.$emit("blurred")
    },
    //------------------------------------------------
    onTagChanged(vals=[]) {
      this.$emit("changed", vals)
    },
    //------------------------------------------------
    onClickSuffixIcon() {
      this.$emit("suffix:icon")
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}