export default {
  //////////////////////////////////////////
  data: () => ({
    obj: undefined
  }),
  //////////////////////////////////////////
  props: {
    "openRefer": {
      type: Object,
      default: undefined
    },
    "labelValueBy": {
      type: [String, Function],
      default: "title|nm|id"
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    ValueClickable() {
      return this.openRefer ? true : false
    },
    //--------------------------------------
    LabelValue() {
      return this.getLabelValue(this.obj || this.value)
    },
    //--------------------------------------
    getLabelValue() {
      if (_.isFunction(this.labelValueBy)) {
        return this.labelValueBy
      }
      if (_.isString(this.labelValueBy)) {
        return v => {
          return Ti.Util.getOrPick(v, this.labelValueBy)
        }
      }
      return v => v
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnClickValue() {
      let obj = this.obj
      if (!this.openRefer || !this.obj)
        return


      // prepare conf
      let conf = _.assign({
        title: "i18n:info",
        width: 640,
        height: 480,
        textOk: null,
        textCancel: "i18n:close",
        result: obj
      }, this.openRefer)

      // Show Dialog
      await Ti.App.Open(conf)
    }
    //--------------------------------------
  },
  watch: {
    "value": {
      handler: async function (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.obj = await Wn.Io.loadMetaBy(this.value)
        }
      },
      immediate: true
    }
  }
  //////////////////////////////////////////
}