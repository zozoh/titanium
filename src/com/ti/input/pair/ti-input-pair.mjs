const _M = {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": {
      type: Object
    },
    "dftNewItemName": {
      type: String,
      default: "newKey"
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
        hideBorder: true,
        autoSelect: true
      })
    },
    "valueComType": {
      type: String,
      default: "TiInput"
    },
    "valueComConf": {
      type: Object,
      default: () => ({
        hideBorder: true,
        autoJsValue: true,
        autoSelect: true
      })
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "blankAs": {
      type: Object,
      default: () => ({
        className: "as-mid-tip align-center",
        icon: "zmdi-code-setting",
        text: "i18n:empty-data"
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
    TopClass() {
      return this.getTopClass({
        "is-empty": this.isEmpty,
        "no-empty": !this.isEmpty
      })
    },
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
    },
    //------------------------------------------------
    ActionSetup() {
      return [
        {
          text: "i18n:add-item",
          icon: "zmdi-plus",
          className: "min-width-8",
          handler: () => {
            this.OnAddNewPair()
          }
        },
        {
          icon: "zmdi-code",
          className: "is-chip",
          handler: () => {
            this.OnViewSourceCode()
          }
        }
      ]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnNameChange({ name }, newName) {
      if (!_.isEqual(name, newName)) {
        let data = {}
        // To keep the original key order
        _.forEach(this.value, (v, k) => {
          if (k == name) {
            data[newName] = v
          } else {
            data[k] = v
          }
        })
        this.tryNotifyChange(data)
      }
    },
    //------------------------------------------------
    OnValueChange({ name, value }, newVal) {
      if (!_.isEqual(value, newVal)) {
        let data = _.cloneDeep(this.value) || {}
        data[name] = newVal
        this.tryNotifyChange(data)
      }
    },
    //------------------------------------------------
    OnDeleteFld({ name }) {
      let data = {}
      _.forEach(this.value, (v, k) => {
        if (k != name) {
          data[k] = v
        }
      })
      this.tryNotifyChange(data)
    },
    //------------------------------------------------
    OnAddNewPair() {
      let data = _.cloneDeep(this.value) || {}
      let newName = this.dftNewItemName
      let val = _.get(data, newName)
      let N = 1
      while (!_.isUndefined(val)) {
        newName = `${this.dftNewItemName}${N++}`
        val = _.get(data, newName)
      }
      data[newName] = null
      this.tryNotifyChange(data)
    },
    //------------------------------------------------
    async OnViewSourceCode() {
      let json = JSON.stringify(this.value || {}, null, '   ')
      let re = await Ti.App.Open({
        title: "i18n:edit",
        position: "top",
        width: "6.4rem",
        height: "90%",
        result: json,
        mainStyle: {
          padding: "2px"
        },
        comType: "TiInputText",
        comConf: {
          height: "100%"
        }
      })

      // User Cancel
      if (_.isUndefined(re)) {
        return
      }

      // Parse JSON
      let data = JSON.parse(_.trim(re) || "null")
      this.tryNotifyChange(data)
    },
    //------------------------------------------------
    tryNotifyChange(data) {
      if (!_.isEqual(data, this.value)) {
        this.$notify("change", data)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;