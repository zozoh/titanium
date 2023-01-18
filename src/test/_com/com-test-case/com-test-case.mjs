const _M = {
  ////////////////////////////////////////////
  data: () => ({
    myCom: null
  }),
  ////////////////////////////////////////////
  props: {
    "meta": {
      type: Object,
      default: () => ({})
    },
    "content": {
      type: String,
      default: null
    },
    "data": {
      type: [Array, Object, Number, Boolean, String],
      default: null
    },
    "status": {
      type: Object,
      default: () => ({})
    },
    "fieldStatus": {
      type: Object,
      default: () => ({})
    }
  },
  ////////////////////////////////////////////
  computed: {
    //----------------------------------------
    ComStyle() {
      return Ti.Css.toStyle(_.get(this.myCom, "style"))
    },
    //----------------------------------------
    ComType() {
      return _.get(this.myCom, "comType")
    },
    //----------------------------------------
    ComConf() {
      let conf = _.get(this.myCom, "comConf")
      return Ti.Util.explainObj(this, conf)
    },
    //----------------------------------------
    ComModel() {
      return _.assign({
        'change': {
          mode: "reset",   // reset | assign | merge
          data: '=..'
        }
      }, _.get(this.myCom, "comModel"))
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  methods: {
    //----------------------------------------
    setDataValue(val) {
      if (_.isDate(val)) {
        val = Ti.Types.formatDateTime(val)
      }
      Ti.App(this).dispatch("main/changeContent", val)
    },
    //----------------------------------------
    async reloadMyCom() {
      let aph = _.get(this.meta, "com")
      this.myCom = {
        comType: "TiLoading",
        comConf: {}
      }
      if (aph) {
        // console.log("haha", JSON.stringify({
        //   metaId: this.meta.id,
        //   data  : JSON.stringify(this.data)
        // }))
        console.log("reloadMyCom", aph)
        let com = await Wn.Io.loadMeta(aph)
        let comInfo = await Wn.Io.loadContent(com, { as: "json" })
        if (comInfo.comPath || comInfo.components) {
          await Ti.App(this).loadView({
            comType: comInfo.comPath,
            components: comInfo.components
          })
        }
        this.myCom = comInfo
      }
    },
    //----------------------------------------
    __on_events(name, payload) {
      let model = this.ComModel[name]
      if (model) {
        let { mode = "reset", data } = model
        console.log("Com Test Case", model, name, payload)
        let val = Ti.Util.explainObj(payload, data)
        if ("assign" == mode) {
          val = _.assign({}, this.data, val)
        }
        else if ("merge" == mode) {
          val = _.merge({}, this.data, val)
        }
        this.setDataValue(val)

      }
    },
    //----------------------------------------
  },
  ////////////////////////////////////////////
  watch: {
    "meta": {
      handler: function (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          if (!newVal || !oldVal || newVal.com != oldVal.com) {
            this.reloadMyCom()
          }
        }
      },
      immediate: true
    }
  },
  ////////////////////////////////////////////
  mounted: function () {
    //----------------------------------------
    Ti.Fuse.getOrCreate().add({
      key: "com-test-case",
      everythingOk: () => {
        return !this.status.changed
      },
      fail: () => {
        Ti.Toast.Open("i18n:no-saved", "warn")
      }
    })
    //----------------------------------------
  },
  ////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Fuse.get().remove("com-test-case")
  }
}
export default _M;