const _M = {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": {
      type: [Array, String],
      default: () => []
    },
    "valueSep": {
      type: String,
      default: ","
    },
    "dftNewItem": {
      type: [Number, String, Object],
      default: null
    },
    //------------------------------------------------
    // Behaviors
    //------------------------------------------------
    "eleComType": {
      type: String,
      default: "TiInput"
    },
    "eleComConf": {
      type: Object,
      default: () => ({
        hideBorder: true,
        autoSelect: true,
        autoJsValue: true
      })
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "blankAs": {
      type: Object,
      default: () => ({
        className: "as-small-tip",
        icon: "fas-border-none",
        text: "i18n:empty"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-empty": this.isEmpty,
        "no-empty": !this.isEmpty
      })
    },
    //------------------------------------------------
    isEmpty() {
      return _.isEmpty(this.ListItems)
    },
    //------------------------------------------------
    TheValue() {
      if (_.isEmpty(this.value)) {
        return []
      }
      if (_.isString(this.value)) {
        if (/^\[([^\]]*)\]$/.test(this.value)) {
          return JSON.parse(this.value)
        }
        return Ti.S.splitIgnoreBlank(this.value, this.valueSep)
      }
      return _.concat(this.value)
    },
    //------------------------------------------------
    getEleComType() {
      if (_.isString(this.eleComType)) {
        return () => this.eleComType
      }
      if (_.isFunction(this.eleComType)) {
        return this.eleComType
      }
      if (_.isObject(this.eleComType)) {
        return (val) => {
          return _.get(this.eleComType[val])
        }
      }
      if (_.isArray(this.eleComType)) {
        return (val, index) => {
          return _.nth(this.eleComType, index)
        }
      }
      return "TiInput"
    },
    //------------------------------------------------
    getEleComConf() {
      let conf;
      if (_.isFunction(this.eleComConf)) {
        conf = this.eleComConf
      }
      else {
        conf = this.eleComConf
      }
      return (value, index) => {
        return Ti.Util.explainObj({ value, index }, conf)
      }
    },
    //------------------------------------------------
    ListItems() {
      let items = []
      _.forEach(this.TheValue, (value, index) => {
        let comType = this.getEleComType(value, index)
        let comConf = this.getEleComConf(value, index)
        items.push({
          index, value, comType, comConf
        })
      })
      return items;
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnValueChange({ index, value }, newVal) {
      if (!_.isEqual(value, newVal)) {
        let list = _.cloneDeep(this.TheValue) || {}
        list[index] = newVal
        this.tryNotifyChange(list)
      }
    },
    //------------------------------------------------
    OnDeleteItem({ index }) {
      let list = []
      _.forEach(this.TheValue, (v, i) => {
        if (i != index) {
          list.push(v)
        }
      })
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    OnAddNewItem() {
      let list = _.cloneDeep(this.TheValue) || {}
      let newItem = _.cloneDeep(this.dftNewItem)
      list.push(newItem)
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    tryNotifyChange(list) {
      if (!_.isEqual(list, this.TheValue)) {
        this.$notify("change", list)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;
