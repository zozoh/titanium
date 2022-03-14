export default {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": undefined,
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "keyDisplayBy": {
      type: [Object, Array]
    },
    "blankAs": {
      type: Object,
      default: () => ({
        className: "as-mid-tip align-center",
        text: "i18n:hm-am-empty",
        icon: "zmdi-lamp"
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
    TheValue() {
      if (Ti.Util.isNil(this.value)) {
        return []
      }
      return _.concat(this.value)
    },
    //------------------------------------------------
    isEmpty() {
      return _.isEmpty(this.TheValue)
    },
    //------------------------------------------------
    DisplayItems() {
      let list = []
      let lastI = this.TheValue.length - 1
      _.forEach(this.TheValue, (li, index) => {
        let am = Ti.AutoMatch.parse(li)
        let atFirst = 0 == index;
        let atLast = lastI == index;
        list.push({
          index,
          value: li,
          atFirst,
          atLast,
          className: {
            "at-first": atFirst,
            "at-last": atLast
          },
          matcher: am,
          text: am.explainText({
            keyDisplayBy: this.keyDisplayBy
          })
        })
      })
      return list
    },
    //------------------------------------------------
    ActionSetup() {
      return [
        {
          text: "i18n:hm-am-add",
          icon: "zmdi-plus",
          className: "min-width-8",
          handler: () => {
            this.OnAddNewItem()
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
    OnAddNewItem() {
      let list = _.cloneDeep(this.TheValue)
      list.push({})
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    async OnViewSourceCode() {
      let json = JSON.stringify(this.TheValue, null, '   ')
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
    async OnClickItem({ index, value }) {
      let re = await Ti.App.Open({
        title: "i18n:edit",
        position: "top",
        width: "6.4rem",
        height: "90%",
        result: value,
        mainStyle: {
          padding: "2px"
        },
        comType: "TiInputPair",
        comConf: {
          "valueComType": "TiInputDval",
          "valueComConf": {
            "hideBorder": true,
            "autoJsValue": true,
            "autoSelect": true
          }
        }
      })

      // User Cancel
      if (!re) {
        return
      }

      // Update current item
      let list = _.cloneDeep(this.TheValue)
      list[index] = re
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    OnRemoveItem({ index }) {
      let list = _.cloneDeep(this.TheValue)
      list = _.filter(list, (_, i) => i != index)
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    OnMoveUp({ index }) {
      // Guard
      if (index <= 0) {
        return
      }
      let list = _.cloneDeep(this.TheValue)
      Ti.Util.moveInArray(list, index, index - 1);
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    OnMoveDown({ index }) {
      // Guard
      if (index >= (this.TheValue.length - 1)) {
        return
      }
      let list = _.cloneDeep(this.TheValue)
      Ti.Util.moveInArray(list, index, index + 1);
      this.tryNotifyChange(list)
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