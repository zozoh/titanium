export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    
  }),
  ////////////////////////////////////////////////////
  props : {
    "inputChange" : {
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
          tags.push(li)
        }
      }
      //...........................................
      return tags
    },
    //------------------------------------------------
    getTagValues(tags=[]) {
      let list = []
      for(let tag of tags) {
        let val = _.isPlainObject(tag)
          ? tag.value
          : tag
        if(!Ti.Util.isNil(val)) {
          list.push(val)
        }
      }
      return list
    },
    //------------------------------------------------
    onInputInputing(val) {
      this.$notify("inputing", val)
    },
    //------------------------------------------------
    onInputChanged(val) {
      // May click the prefix icon for clean
      if(_.isNull(val)) {
        this.$notify("change", [])
      }
      // Delegate to parent
      else if(_.isFunction(this.inputChange)) {
        this.inputChange(val)
      }
      // Handle by self
      else if(val) {
        let tags = this.evalTagList(this.value, val)
        let vals = this.getTagValues(tags)
        this.$notify("change", vals)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}