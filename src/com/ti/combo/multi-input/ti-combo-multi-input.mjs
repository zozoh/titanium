export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "myDropStatus"   : "collapse",
    "myCurrentItem"  : null,
    "myCheckedItems" : null
  }),
  ////////////////////////////////////////////////////
  // props
  props : {
    "options" : {
      type : Array,
      default : ()=>[]
    },
    "dropComType" : {
      type : String,
      default : "ti-list"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    hasOptions() {return !_.isEmpty(this.options)},
    //------------------------------------------------
    theValueBy() {
      return this.valueBy || "value"
    },
    //------------------------------------------------
    theMatchBy() {
      return this.matchBy || ["text", "value"]
    },
    //------------------------------------------------
    theDropDisplay() {
      return this.dropDisplay || "text"
    },
    //------------------------------------------------
    getItemValue() {
      return Ti.Util.genValueFunc(this.theValueBy)
    },
    //------------------------------------------------
    isOptionItemMatched() {
      return Ti.Util.genMatchFunc(this.theMatchBy)
    },
    //------------------------------------------------
    theValues() {
      if(_.isString(this.value)) {
        return _.without(this.value.split(/[,;，； \n]+/g), "")
      }
      return  _.filter(_.concat(this.value), (v)=>!Ti.Util.isNil(v))
    },
    //------------------------------------------------
    theInputTags() {
      if(this.myCheckedItems) {
        return this.myCheckedItems
      }
      return this.getOptionItemListBy(this.theValues)
    },
    //------------------------------------------------
    theSuffixIcon() {
      return this.statusIcons[this.myDropStatus]
    },
    //------------------------------------------------
    theDropCurrentId() {
      if(this.myCurrentItem) {
        return this.getItemValue(this.myCurrentItem)
      }
    },
    //------------------------------------------------
    theDropCheckedIds() {
      let ids = []
      _.forEach(this.theInputTags, (it)=>{
        let id = this.getItemValue(it)
        ids.push(id)
      })
      return ids
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onInputInit($input) {this.$input = $input},
    onListInit($list)   {this.$list  = $list},
    //-----------------------------------------------
    findOptionItemBy(val) {
      for(let it of this.options) {
        if(this.isOptionItemMatched(it, val)){
          return it
        }
      }
    },
    //-----------------------------------------------
    getOptionItemListBy(vals=[]) {
      let list = []
      //.............................................
      if(this.options && !_.isEmpty(vals)) {
        for(let val of vals) {
          //.........................................
          let it = this.findOptionItemBy(val)
          let foundInList = !Ti.Util.isNil(it)
          //.........................................
          if(foundInList) {
            list.push(it)
          }
          // Join the free value
          else if(!this.mustInList) {
            list.push(val)
          }
          //.........................................
        }
      }
      //.............................................
      return list
    },
    //-----------------------------------------------
    getItemValueList(items=[]) {
      let list = []
      for(let it of items) {
        list.push(this.getItemValue(it))
      }
      return list
    },
    //-----------------------------------------------
    doExtend() {
      this.myDropStatus = "extended"
      this.myCurrentItem = null
      this.myCheckedItems = null
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      if(escaped) {
        this.myCurrentItem = null
        this.myCheckedItems = null
      }
      // Find the new value
      let val = this.myCheckedItems
        ? this.getItemValueList(this.myCheckedItems)
        : this.theValues
      
      // Reset status
      this.myDropStatus = "collapse"
      this.myCurrentItem = null
      this.myCheckedItems = null

      // Actived Self
      this.$nextTick(()=>{
        this.setActived()
      })

      // Notify
      if(!_.isEqual(val, this.value)) {
        this.$emit("changed", val)
      }
    },
    //-----------------------------------------------
    onInputChanged(val) {
      console.log("onInputChanged", val)
      let it = this.findOptionItemBy(val)
      let foundInList = !Ti.Util.isNil(it)
      if(foundInList || !this.mustInList) {
        let vals = _.concat(this.theValues, val)

        // valueUnique
        if(this.valueUnique) {
          vals = _.uniq(vals)
        }
        // The MaxValueLen
        if(this.maxValueLen > 0) {
          vals = _.slice(vals, 0, this.maxValueLen)
        }
        // Slice from the end
        else if(this.maxValueLen < 0) {
          let offset = Math.max(0, vals.length + this.maxValueLen)
          vals = _.slice(vals, offset)
        }

        this.$emit("changed", vals)
      }
    },
    //-----------------------------------------------
    onInputFocused() {
      if(this.autoFocusExtended && !this.isExtended) {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    onTagListChanged(val=[]) {
      this.myCheckedItems = null
      this.myCurrentItem = null
      this.$emit("changed", val)
    },
    //-----------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    onListSelected({current, checked}={}) {
      //console.log("current", current, checked)
      this.myCurrentItem = current
      this.myCheckedItems = checked
      this.myValues = this.getItemValueList(checked)
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.doCollapse({escaped:true})
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      // If droplist is actived, should collapse it
      if("ENTER" == uniqKey) {
        if(this.$list && this.$list.isActived) {
          this.doCollapse()
          return {stop:true, quit:true}
        }
      }
      //....................................
      if("ARROWUP" == uniqKey) {
        if(this.$list) {
          this.$list.selectPrevRow({
            payload: {byKeyboardArrow: true}
          })
        }
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ARROWDOWN" == uniqKey) {
        if(this.$list && this.isExtended) {
          this.$list.selectNextRow({
            payload: {byKeyboardArrow: true}
          })
        } else {
          this.doExtend()
        }
        return {prevent:true, stop:true, quit:true}
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    
  }
  ////////////////////////////////////////////////////
}