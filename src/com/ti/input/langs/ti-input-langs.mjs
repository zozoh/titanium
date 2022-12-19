const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    myFields:[],
    myTexts: {},
    myValue: {}
  }),
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": {
      type: Object
    },
    "options": {
      type: [String, Array],
      default: () => [
        {
          "text": "i18n:lang-en-us",
          "value": "en_us"
        },
        {
          "text": "i18n:lang-zh-cn",
          "value": "zh_cn"
        }
      ]
    },
    //------------------------------------------------
    // Behaviors
    //------------------------------------------------
    "mapping": {
      type: [Object, Function],
    },
    "explainMapping": {
      type: Boolean,
      default: true
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    OptionItemMapping() {
      if (_.isFunction(this.mapping)) {
        return this.mapping
      }
      if (_.isObject(this.mapping)) {
        if (this.explainMapping) {
          return (li) => {
            return Ti.Util.explainObj(li, this.mapping)
          }
        }
        return (li) => ({
          text: _.get(this.mapping, li.text) || li.text,
          value: _.get(this.mapping, li.value) || li.value
        })
      }
      return v => v
    },
    //------------------------------------------------
    Dict() {
      return Ti.DictFactory.CreateDictBy(this.options);
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    async evalPairValue() {
      // Eval list
      let list = await this.Dict.getData()
      let flds =[]
      let vals = {}
      for (let li of list) {
        let it = this.OptionItemMapping(li)
        let key = it.value
        let val = _.get(this.value, key)
        vals[key] = val
        flds.push({
          title  : it.text,
          name : it.value
        })
      }
      this.myFields = flds
      this.myValue = vals
    },
    //------------------------------------------------
    tryEvalPairValue(newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        this.evalPairValue()
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "value": "tryEvalPairValue",
    "options": "tryEvalPairValue",
  },
  ////////////////////////////////////////////////////
  mounted() {
    this.evalPairValue()
  }
  ////////////////////////////////////////////////////
}
export default _M;