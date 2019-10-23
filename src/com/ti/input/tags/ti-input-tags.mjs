export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "value" : null,
    "placeholder" : {
      type : [String, Number],
      default : null
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

    // For `multi=false` only
    "statusIcon" : {
      type : String,
      default : "zmdi-chevron-down"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      if(this.className)
        return this.className
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
      //console.log("input value:", this.value)
      //return Ti.Types.toStr(this.value, this.format)
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
      let list = _.without(_.concat(this.value), null)
      let tags = []
      for(let li of list) {
        // Object
        if(_.isPlainObject(li)) {
          tags.push(li)
        }
        // String or simple value
        else {
          tags.push({
            value : li,
            text  : Ti.Types.toStr(li)
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
    onInputChanged($event) {
      let $in = $event.target
      if(_.isElement($in)) {
        let val = _.trim($in.value)
        let ss  = _.split(val, /[ ,;\t]+/)
        let s2  = _.remove(ss, (v)=>!v)
        let values = _.concat(this.theTagValues, ss)
        this.$emit("changed", values)
      }
    },
    //------------------------------------------------
    onTagChanged(vals=[]) {
      this.$emit("changed", vals)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}