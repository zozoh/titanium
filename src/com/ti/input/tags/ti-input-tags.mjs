export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    
  }),
  ////////////////////////////////////////////////////
  props : {
    "inputChanged" : {
      type: Function,
      default : undefined
    }
  },
  ////////////////////////////////////////////////////
  computed : {
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
      return this.evalTagList(this.value)
    },
    //------------------------------------------------
    theTagValues() {
      return this.getTagValues(this.theTags)
    },
    //------------------------------------------------
    hasTags() {
      return !_.isEmpty(this.theTags)
    },
    //------------------------------------------------
    thePlaceholder() {
      if(this.placeholder) {
        return this.placeholder
      }
      if(this.readonly || !this.canInput) {
        return ""
      }
      return "i18n:input-tags"
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onInputInit($input) {this.$input=$input},
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
    evalTagList(values=[], newTagVal) {
      //...........................................
      // Prepare the list
      let list = _.filter(_.concat(values), (v)=>!Ti.Util.isNil(v))
      // Join the last one
      if(!Ti.Util.isNil(newTagVal)) {
        list.push(newTagVal)
      }
      // valueUnique
      if(this.valueUnique) {
        list = _.uniq(list)
      }
      // The MaxValueLen
      if(this.maxValueLen > 0) {
        list = _.slice(list, 0, this.maxValueLen)
      }
      // Slice from the end
      else if(this.maxValueLen < 0) {
        let offset = Math.max(0, list.length + this.maxValueLen)
        list = _.slice(list, offset)
      }
      // Gen Tag List
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
      //...........................................
      return tags
    },
    //------------------------------------------------
    getTagValues(tags=[]) {
      let list = []
      for(let tag of tags) {
        list.push(Ti.Util.fallback(tag.value, null))
      }
      return list
    },
    //------------------------------------------------
    onInputInputing(val) {
      this.$emit("inputing", val)
    },
    //------------------------------------------------
    onInputChanged(val) {
      //console.log("input changed", val)
      // May click the prefix icon for clean
      if(_.isNull(val)) {
        this.$emit("changed", [])
      }
      // Delegate to parent
      else if(_.isFunction(this.inputChanged)) {
        this.inputChanged(val)
      }
      // Handle by self
      else if(val) {
        let tags = this.evalTagList(this.value, val)
        let vals = this.getTagValues(tags)
        this.$emit("changed", vals)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}