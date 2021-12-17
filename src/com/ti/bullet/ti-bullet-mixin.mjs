const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    myDict: undefined,
    myOptionsData: [],
    loading: false
  }),
  ////////////////////////////////////////////////////
  props: {
    "value": undefined,
    "options": {
      type: [String, Array, Function, Ti.Dict],
      default: () => []
    },
    // Item ignore by the AutoMatch
    "ignoreBy": undefined,
    /*
     {
       title : "title",
       key   : "key",
       items : "items"
     } 
     */
    "groupBy": {
      type: [Object, Function, Boolean],
      default: undefined
    },
    "valueBy": {
      type: [String, Function],
      default: "value|id"
    },
    "textBy": {
      type: [String, Function],
      default: "text|name|title"
    },
    "iconeBy": {
      type: [String, Function],
      default: "icon"
    },
    "bulletIconOn": {
      type: String,
      default: "fas-check-circle"
    },
    "bulletIconOff": {
      type: String,
      default: "far-circle"
    },
    "blankAs": {
      type: Object,
      default: () => ({
        icon: "far-list-alt",
        text: "empty-data"
      })
    },
    "blankClass": {
      type: String,
      default: "as-big",
      validator: v => /^as-(big|hug|big-mask|mid-tip)$/.test(v)
    },
    "width": {
      type: [Number, String],
      default: undefined
    },
    "height": {
      type: [Number, String],
      default: undefined
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass(this.myTypeName)
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //-----------------------------------------------
    Grouping() {
      if (this.groupBy) {
        if (_.isFunction(this.groupBy)) {
          return this.groupBy
        }
        if (_.isPlainObject(this.groupBy)) {
          return (obj) => {
            let title = _.get(obj, this.groupBy.title)
            let key = _.get(obj, this.groupBy.key)
            let items = _.get(obj, this.groupBy.items)
            if (key && !_.isEmpty(items)) {
              return { title, key, items }
            }
          }
        }
        return (obj) => _.pick(obj, "title", "key", "items")
      }
    },
    //-----------------------------------------------
    IgnoreItem() {
      if (this.ignoreBy) {
        return Ti.AutoMatch.parse(this.ignoreBy)
      }
      return () => false
    },
    //-----------------------------------------------
    getItemIcon() {
      if (this.myDict)
        return it => this.myDict.getIcon(it)
      return Ti.Util.genGetterNotNil(this.iconBy)
    },
    getItemText() {
      if (this.myDict)
        return it => this.myDict.getText(it)
      return Ti.Util.genGetterNotNil(this.textBy)
    },
    getItemValue() {
      if (this.myDict)
        return it => this.myDict.getValue(it)
      return Ti.Util.genGetterNotNil(this.valueBy)
    },
    //------------------------------------------------
    hasItems() {
      return !_.isEmpty(this.ItemGroups)
    },
    //------------------------------------------------
    ItemGroups() {
      if (this.Grouping) {
        let list = []
        for (let data of this.myOptionsData) {
          let { title, key, items } = this.Grouping(data)
          items = this.evalItems(items)
          list.push({ title, key, items })
        }
        return list
      }
      // Single Group
      else {
        let items = this.evalItems(this.myOptionsData)
        return [{
          key: "g0",
          items
        }]
      }
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    evalItems(items = []) {
      let list = []
      _.forEach(items, li => {
        if (this.IgnoreItem(li))
          return
        let it;
        if (_.isString(li) || _.isNumber(li)) {
          it = {
            text: li, value: li
          }
        } else {
          it = {
            icon: this.getItemIcon(li),
            text: this.getItemText(li),
            value: this.getItemValue(li)
          }
        }
        if (this.isItemChecked(it.value, this.value)) {
          it.className = "is-checked"
          it.bullet = this.bulletIconOn
        } else {
          it.bullet = this.bulletIconOff
        }
        list.push(it)
      })
      return list
    },
    //------------------------------------------------
    createDict() {
      // Customized
      if (this.options instanceof Ti.Dict) {
        return this.options
      }
      // Refer dict
      if (_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options)
        if (dictName) {
          return Ti.DictFactory.CheckDict(dictName, ({ loading }) => {
            this.loading = loading
          })
        }
      }
      // Auto Create
      // return Ti.DictFactory.CreateDict({
      //   data : this.options,
      //   getValue : Ti.Util.genGetter(this.valueBy || "value|id"),
      //   getText  : Ti.Util.genGetter(this.textBy  || "text|name|title"),
      //   getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      // })
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "options": {
      handler: async function (newval, oldval) {
        if (!_.isEqual(newval, oldval)) {
          this.myDict = this.createDict()
          if (this.myDict) {
            this.loading = true
            this.myOptionsData = await this.myDict.getData()
          } else {
            this.myOptionsData = newval
          }
          this.$nextTick(() => {
            this.loading = false
          })
        }
      },
      immediate: true
    }
  }
  ////////////////////////////////////////////////////
}
export default _M;