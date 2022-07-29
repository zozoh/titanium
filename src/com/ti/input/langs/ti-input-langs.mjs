const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
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
    // Aspect
    //------------------------------------------------
    "nameWidth": {
      type: [String, Number],
      default: null
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    NameComConf() {
      return {
        hoverCopy: false,
        format: (v) => {
          let re = _.get(this.myTexts, v) || v
          return Ti.I18n.text(re)
        }
      }
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
      let list = await this.Dict.getData()
      let vals = {}
      let txts = {}
      for (let li of list) {
        let key = li.value
        let val = _.get(this.value, key)
        vals[key] = val
        txts[key] = li.text
      }
      this.myValue = vals
      this.myTexts = txts
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