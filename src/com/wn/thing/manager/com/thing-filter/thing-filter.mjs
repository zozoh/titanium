const _M = {
  ///////////////////////////////////////////
  data : ()=>({
    keywordFocus : false
  }),
  ///////////////////////////////////////////
  props : {
    "filter" : {
      type : Object,
      default : ()=>({})
    },
    "sorter" : {
      type : Object,
      default : ()=>({})
    },
    "placeholder" : {
      type : String,
      default : 'i18n:find-data'
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "value" : {
      type : Object,
      default : ()=>({})
    },
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    TopClass() {
      return this.getTopClass({
        "in-recyclebin" : this.isInRecycleBin
      })
    },
    //---------------------------------------
    hasSorter() {
      return !_.isEmpty(this.sorter)
    },
    //---------------------------------------
    isInRecycleBin() {
      return this.status.inRecycleBin
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //---------------------------------------
    OnFilterChange(payload) {
      this.$notify("filter::change", payload)
    },
    //---------------------------------------
    OnSorterChange(payload) {
      this.$notify("sorter::change", payload)
    },
    //---------------------------------------
    // When this func be invoked, the recycleBin must be true
    OnLeaveRecycleBin() {
      Ti.App(this).dispatch('main/toggleInRecycleBin')
    }
    //---------------------------------------
  }
  ///////////////////////////////////////////
}
export default _M;