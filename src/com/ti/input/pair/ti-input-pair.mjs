const _M = {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": {
      type: Object
    },
    //------------------------------------------------
    // Behaviors
    //------------------------------------------------
    "nameComType": {
      type: String,
      default: "TiInput"
    },
    "nameComConf": {
      type: Object,
      default: () => ({
        hideBorder: true
      })
    },
    "valueComType": {
      type: String,
      default: "TiInput"
    },
    "valueComConf": {
      type: Object,
      default: () => ({
        hideBorder: true
      })
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "blankAs": {
      type: Object,
      default: () => ({
        className: "as-big",
        icon: "fas-border-none",
        text: "i18n:empty"
      })
    },
    "nameWidth": {
      type: [String, Number],
      default: "38.2%"
    }

  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    isEmpty() {
      return _.isEmpty(this.PairFields)
    },
    //------------------------------------------------
    PairFields() {
      let re = []
      _.forEach(this.value, (v, k) => {
        re.push({
          name: k,
          value: v
        })
      })
      return re
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------

    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;