const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
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
          let k = _.kebabCase(v)
          return Ti.I18n.get(`lang-${k}`)
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
      let re = {}
      for (let li of list) {
        let key = li.value
        let val = _.get(this.value, key)
        re[key] = val
      }
      this.myValue = re
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