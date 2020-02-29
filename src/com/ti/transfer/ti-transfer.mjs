export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    // Filter
    "myFilterValue" : null,
    // Data
    "myCheckedItems"  : [],
    "myCheckedValMap" : {},
    // Status
    "myCandidateCheckStatus" : "none",
    "myCheckedCheckStatus"   : "none",
    // Count
    "myCandidateCount" : 0,
    "myCheckedCount"   : 0,
  }),
  ///////////////////////////////////////////////////////
  props : {
    "candidates" : {
      type : [Array, Function],
      default : ()=>[]
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    theValueBy() {
      return this.valueBy || "value"
    },
    //------------------------------------------------
    theDisplay() {
      return this.display || "text"
    },
    //------------------------------------------------
    getItemValue() {
      return Ti.Util.genItemValueGetter(this.theValueBy)
    },
    //------------------------------------------------
    isItemMatchedValue() {
      return Ti.Util.genItemMatcher(this.theValueBy)
    },
    //------------------------------------------------
    theEmitFilterName() {
      if(this.filterBy) {
        let m = /^\$emit:(.+)$/.exec(this.filterBy)
        if(m) {
          return m[1]
        }
      }
    },
    //------------------------------------------------
    isMatchedFilter() {
      if(this.filterBy && !this.theEmitFilterName) {
        return Ti.Util.genItemMatcher(this.filterBy, true)
      }
    },
    //------------------------------------------------
    hasFilter() {
      return _.isFunction(this.isMatchedFilter)
    },
    //------------------------------------------------
    theFilterConf() {
      return _.assign({
        width       : "100%",
        prefixIcon  : "zmdi-filter-list",
        placeholder : "i18n:filter",
        hover       : ['prefixIcon','suffixText','suffixIcon']
      }, this.filterConf)
    },
    //------------------------------------------------
    theValues() {
      if(_.isString(this.value)) {
        return _.without(this.value.split(/[,;，； \n]+/g), "")
      }
      return  _.filter(_.concat(this.value), (v)=>!Ti.Util.isNil(v))
    },
    //---------------------------------------------------
    theCandidates() {
      // Dynamic Call
      if(_.isFunction(this.candidates)) {
        return this.candidates()
      }
      // Static
      return this.candidates
    },
    //---------------------------------------------------
    theShownCandidates() {
      let list = []
      _.forEach(this.theCandidates, (it)=>{
        // Apply the filter
        if(this.hasFilter && this.myFilterValue) {
          if(!this.isMatchedFilter(it, this.myFilterValue)) {
            return
          }
        }

        // If already checked, don't show
        let val = this.getItemValue(it)
        if(!this.myCheckedValMap[val]) {
          list.push(it)
        }
      })
      return list
    },
    //---------------------------------------------------
    theCandidateComType() {
      return this.genComType(this.candidateComType)
    },
    //---------------------------------------------------
    theCandidateComConf() {
      return this.genComConf(this.candidateComConf, {
        data : this.theShownCandidates
      })
    },
    //---------------------------------------------------
    theCheckedComType() {
      return this.genComType(this.checkedComType)
    },
    //---------------------------------------------------
    theCheckedComConf() {
      return this.genComConf(this.checkedComConf, {
        data : this.myCheckedItems,
        blankAs : {
          icon : "zmdi-arrow-left",
          text : "i18n:choose-obj"
        }
      })
    },
    //---------------------------------------------------
    theAddIcon() {
      return this.assignButtons.add
    },
    //---------------------------------------------------
    theRemoveIcon() {
      return this.assignButtons.remove
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onCandidateComInit($can) {this.$can = $can},
    onCheckedComInit($checked){this.$checked = $checked},
    //-----------------------------------------------
    findCandidateItemBy(val) {
      for(let it of this.theCandidates) {
        if(this.isItemMatchedValue(it, val)){
          return it
        }
      }
    },
    //-----------------------------------------------
    getCandidateItemsBy(vals=[]) {
      let list = []
      //.............................................
      if(this.theCandidates && !_.isEmpty(vals)) {
        for(let val of vals) {
          //.........................................
          let it = this.findCandidateItemBy(val)
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
    //---------------------------------------------------
    genComType(comType="ti-list") {
      return comType
    },
    //---------------------------------------------------
    genComConf(comConf, options) {
      return _.assign({
        idBy      : this.theValueBy,
        display   : this.theDisplay,
        multi     : true,
        checkable : true,
        autoCheckCurrent : false

      }, comConf, options)
    },
    //---------------------------------------------------
    // all | checked | none
    getHeadCheckerIcon(checkStatus="all") {
      return ({
        "all"     : "fas-check-square",
        "checked" : "fas-minus-square"
      })[checkStatus] || "far-square"
    },
    //---------------------------------------------------
    addCandidates() {
      let checked = this.$can.getChecked()
      if(!_.isEmpty(checked)) {
        this.myCheckedItems = _.concat(this.myCheckedItems, checked)

        // Highlight it
        this.$checked.checkRow(_.keys(this.buildItemValueMap(checked)))
        // Cancel runtime checked
        this.$can.cancelRow()

        // Sync checker status
        this.syncCheckStatus()
      }
    },
    //---------------------------------------------------
    removeFromChecked() {
      let removed = this.$checked.getChecked()
      if(!_.isEmpty(removed)) {
        let shouldRemoved = this.buildItemValueMap(removed)
        let list = []
        _.forEach(this.myCheckedItems, (it)=>{
          let val = this.getItemValue(it)
          if(!shouldRemoved[val]) {
            list.push(it)
          }
        })
        this.myCheckedItems = list
        
        // Highlight it
        this.$can.checkRow(_.keys(this.myCheckedValMap))
        // Cancel runtime checked
        this.$checked.cancelRow()

        // Sync checker status
        this.syncCheckStatus()
      }
    },
    //---------------------------------------------------
    onFilterChanged(val) {
      // Leave to parent
      if(this.theEmitFilterName) {
        this.$emit(this.theEmitFilterName, val)
      }
      // Handle be self, update private attribute
      // then the computed props should auto-updated the can-list
      else if(this.hasFilter) {
        this.myFilterValue = val || null
      }
    },
    //---------------------------------------------------
    onClickHeadChecker(checkStatus, $list) {
      ({
        all($list) {
          $list.cancelRow()
        },
        checked($list) {
          $list.checkRow()
        },
        none($list) {
          $list.checkRow()
        }
      })[checkStatus]($list)
    },
    //---------------------------------------------------
    buildItemValueMap(items=[]) {
      let map = {}
      _.forEach(items, (it)=>{
        let val = this.getItemValue(it)
        if(!Ti.Util.isNil(val)) {
          map[val] = it
        }
      })
      return map
    },
    //---------------------------------------------------
    syncListCount() {
      this.myCandidateCount = this.theShownCandidates.length
      this.myCheckedCount   = this.myCheckedItems.length
    },
    //---------------------------------------------------
    syncCheckStatus() {
      this.myCandidateCheckStatus = this.$can.isAllChecked
        ? "all"
        : (this.$can.hasChecked ? "checked" : "none");
      
      this.myCheckedCheckStatus = this.$checked.isAllChecked
        ? "all"
        : (this.$checked.hasChecked ? "checked" : "none");
    },
    //---------------------------------------------------
    syncTheValue() {
      this.myCheckedItems = this.getCandidateItemsBy(this.theValues)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "value" : function() {
      this.syncTheValue()
      this.syncCheckStatus()
    },
    "myCheckedItems" : function(){
      this.myCheckedValMap = this.buildItemValueMap(this.myCheckedItems)
      this.$emit("changed", _.keys(this.myCheckedValMap))
    },
    "theShownCandidates" : function() {
      this.syncListCount()
    }
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    this.syncTheValue()
    this.syncCheckStatus()
    this.syncListCount()
  }
  ///////////////////////////////////////////////////////
}