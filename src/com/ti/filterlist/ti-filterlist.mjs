export default {
  //////////////////////////////////////////
  data: () => ({
    myFilterValue: undefined
  }),
  //////////////////////////////////////////
  props: {
    "filterInput": {
      type: Object
    },
    "filterKeys": {
      type: [Array, String],
      default: "text,value,title,abbr,id"
    },
    "filterBy": {
      type: [Function, String]
    },
    "list": {
      type: Object
    },
    "listType": {
      type: String,
      default: "list",
      validator: v => /^(list|table|wall)$/.test(v)
    }
  },
  //////////////////////////////////////////
  computed: {
    //-------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-------------------------------------
    ListFilterBy() {
      // Function
      if (_.isFunction(this.filterBy)) {
        return this.filterBy
      }
      // Invoking
      if (_.isString(this.filterBy) || _.isPlainObject(this.filterBy)) {
        return Ti.Util.genInvoking(this.filterBy)
      }
      // Auto get filter keys
      let itKeys = []
      let kss = _.concat([], this.filterKeys)
      for (let ks of kss) {
        let keys = Ti.S.splitIgnoreBlank(ks)
        if (!_.isEmpty(keys) && _.isArray(keys)) {
          itKeys.push(...keys)
        }
      }
      // Gen the function
      return (it, fltv) => {
        //console.log("filter", {it, fltv})
        for (let k of itKeys) {
          let v = it.rawData[k]
          if (Ti.Util.isNil(v)) {
            continue;
          }
          let s = v + ""
          if (s.indexOf(fltv) >= 0) {
            return true
          }
        }
        return false
      }
    },
    //-------------------------------------
    FilterInputComConf() {
      return _.assign({
        width: "100%",
        prefixIcon: "fas-filter",
        placeholder: "i18n:filter"
      }, this.filterInput)
    },
    //-------------------------------------
    ListComType() {
      return `ti-${this.listType}`
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //-------------------------------------
    OnInputChange(str) {
      this.myFilterValue = str || null
    }
    //-------------------------------------
  }
  //////////////////////////////////////////
}