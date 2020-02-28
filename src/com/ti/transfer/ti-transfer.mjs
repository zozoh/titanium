export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    "myCheckedItems" : []
  }),
  ///////////////////////////////////////////////////////
  props : {
    "options" : {
      type : Array,
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
    theDisplay() {
      return this.display || "text"
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
    //---------------------------------------------------
    theCandidateComType() {
      return this.genComType(this.candidateComType)
    },
    //---------------------------------------------------
    theCandidateComConf() {
      return this.genComConf(this.candidateComConf, {
        data : this.options
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
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onCandidateComInit($can) {this.$can = $can},
    onCheckedComInit($cheked){this.$cheked = $cheked},
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
    //---------------------------------------------------
    genComType(comType="ti-list") {
      return comType
    },
    //---------------------------------------------------
    genComConf(comConf, options) {
      return _.assign({
        idBy      : this.idBy,
        rawDataBy : this.rawDataBy,
        display   : this.theDisplay,
        multi     : true,
        checkable : true,
        autoCheckCurrent : false

      }, comConf, options)
    },
    //---------------------------------------------------
    addCandidates() {
      let checked = this.$can.getChecked()
      console.log(checked)
      if(!_.isEmpty(checked)) {
        this.myCheckedItems = _.concat(this.myCheckedItems, checked)
      }
    },
    //---------------------------------------------------
    removeFromChecked() {

    },
    //---------------------------------------------------
    syncTheValue() {
      this.myCheckedItems = this.getOptionItemListBy(this.theValues)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "value" : function() {
      this.syncTheValue()
    }
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    this.syncTheValue()
  }
  ///////////////////////////////////////////////////////
}