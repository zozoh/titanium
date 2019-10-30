export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "inputCompositionstart" : false,
    "isFocused" : false
  }),
  ////////////////////////////////////////////////////
  watch : {
    "focus" : function(v) {
      this.isFocused = v
    }
  },
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "canInput" : {
      type : Boolean,
      default : true
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
    // +1 from the begin
    // -1 from the last
    "maxValueLen" : {
      type : Number,
      default : 0
    },
    "valueUnique" : {
      type : Boolean,
      default : true
    },
    // the whole top-box width
    "width" : {
      type : [Number, String],
      default : null
    },
    "inputWidth" : {
      type : [Number, String],
      default : null
    },
    "inputHeight" : {
      type : [Number, String],
      default : null
    },
    // If true, blur->changed willl be auto-apply as changed
    "autoApplyBlurChanged" : {
      type : Boolean,
      default : false
    },
    "clickToFocus" : {
      type : Boolean,
      default : false
    },
    "focus" : {
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
    "cancelTagBubble" : {
      type : Boolean,
      default : false
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
        "is-focused"   : this.isFocused,
        "is-blurred"   : !this.isFocused,
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
        width  : this.inputWidth,
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
          // try to find text in options
          let icon = this.tagIcon
          let text = li
          if(_.isArray(this.tagOptions)) {
            for(let to of this.tagOptions) {
              if(_.isEqual(li, to.value)) {
                icon = to.icon || this.tagIcon
                text = to.text || li
              }
            }
          }
          // Join to list
          tags.push({
            icon, text,
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
    //-----------------------------------------------
    tidyVList(vlist=[]) {
      let vlist2 = vlist
      // Unique Values
      if(this.valueUnique) {
        vlist2 = _.uniq(vlist)
      }
      // Slice from begin
      if(this.maxValueLen > 0) {
        return _.slice(vlist2, 0, this.maxValueLen)
      }
      // Slice from the end
      if(this.maxValueLen < 0) {
        let offset = Math.max(0, vlist2.length + this.maxValueLen)
        return _.slice(vlist2, offset)
      }
      // Then return
      return vlist2
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
      // Guard
      if(!this.autoApplyBlurChanged) {
        return
      }
      console.log("changed!")
      let $in = $event.target
      if(_.isElement($in)) {
        let val = _.trim($in.value)
        let ss  = _.split(val, /[ ,;\t]+/)
        let s2  = _.remove(ss, (v)=>!v)
        let vlist = _.concat(this.theTagValues, ss)
        let caseFn = Ti.S.getCaseFunc(this.valueCase)
        if(_.isFunction(caseFn)) {
          for(let i=0; i<vlist.length; i++) {
            vlist[i] = caseFn(vlist[i])
          }
        }
        let vlist2 = this.tidyVList(vlist)
        this.$emit("changed", vlist2)
      }
    },
    //------------------------------------------------
    onInputFocus() {
      this.isFocused = true
      this.$emit("focused")      
    },
    //------------------------------------------------
    onInputBlur() {
      this.isFocused = false
      this.$emit("blurred")
    },
    //------------------------------------------------
    onTagChanged(vlist=[]) {
      let vlist2 = this.tidyVList(vlist)
        this.$emit("changed", vlist2)
    },
    //------------------------------------------------
    onClickTop() {
      if(this.clickToFocus) {
        this.isFocused = true
        this.$emit("focused")
      }
    },
    //------------------------------------------------
    onClickSuffixIcon() {
      this.$emit("suffix:icon")
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    this.isFocused = this.focus
  }
  ////////////////////////////////////////////////////
}