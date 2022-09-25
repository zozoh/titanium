////////////////////////////////////////////
const DATERANGE_FILTER_TAG = [
  "=>Ti.DateTime.formatMsDateRange(val",
  "'i18n:date-fmt'",
  "'i18n:dt-range-unknown'",
  "'i18n:dt-range-to'",
  "''",
  "'i18n:dt-range-from'",
  "''",
  "'')"
].join(",")
////////////////////////////////////////////
export default {
  //////////////////////////////////////////
  data: () => ({
    myMajorValues: [],
    myTags: []
  }),
  //////////////////////////////////////////
  computed: {
    //-------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-mode-v": "V" == this.mode,
        "is-mode-h": "H" == this.mode
      })
    },
    //-------------------------------------
    MajorItems() {
      let list = []
      if (this.majors) {
        if (_.isArray(this.majors)) {
          list.push(...this.majors)
        } else {
          list.push(this.majors)
        }
      }
      return _.filter(list, li => li.key)
    },
    //-------------------------------------
    MajorIndexMap() {
      let re = {}
      _.forEach(this.MajorItems, (it, index) => {
        re[it.key] = index
      })
      return re
    },
    //-------------------------------------
    MajorDropList() {
      let list = []
      _.forEach(this.MajorItems, (it, index) => {
        let value = _.get(this.myMajorValues, index)
        let li = {
          key: it.key,
          index,
          comType: it.comType || "TiDroplist",
          comConf: _.assign({
            placeholder: it.placeholder,
            options: it.options,
            width: it.width,
            dropWidth: it.dropWidth,
            dropDisplay: it.dropDisplay,
          }, it.comConf, {
            value
          })
        }
        list.push(li)
      })
      return list
    },
    //-------------------------------------
    FilterInputConf() {
      let comConf = {
        placeholder: this.placeholder,
        prefixIcon: this.prefixIcon,
        prefixIconForClean: false,
        prefixIconNotifyName: "input:clean",
        suffixIconNotifyName: "open:advance"
      }
      if (!_.isEmpty(this.advanceForm)) {
        comConf.suffixIcon = this.suffixIcon
      }
      return comConf
    },
    //-------------------------------------
    FilterTagConf() {
      return {
        placeholder: null,
        removable: true
      }
    },
    //-------------------------------------
    hasMajors() {
      return !_.isEmpty(this.MajorItems)
    },
    //-------------------------------------
    hasFilter() {
      return !_.isEmpty(this.filter)
    },
    //-------------------------------------
    hasSorter() {
      return !_.isEmpty(this.sorter)
    },
    //-------------------------------------
    showSorter() {
      return !_.isEmpty(this.sorterConf)
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //-------------------------------------
    OnSorterChange(val) {
      this.$notify("sorter:change", val)
    },
    //-------------------------------------
    OnMajorChange(val, it) {
      if (_.isEmpty(val)) {
        val = null
      }
      let { index } = it
      this.myMajorValues[index] = val
      this.notifyFilterChange()
    },
    //-------------------------------------
    OnInputChange(val) {
      let str = _.trim(val)
      let newFlt = this.evalKeywords(str)
      this.notifyFilterChange({ newFlt })
    },
    //-------------------------------------
    OnTagsChange(val) {
      let newFlt = {}
      _.forEach(val, ({ key, val }) => {
        newFlt[key] = val
      })
      this.notifyFilterChange({ newFlt, withTags: false })
    },
    //-------------------------------------
    OnInputClean() {
      this.notifyFilterChange({ withTags: false })
    },
    //-------------------------------------
    async OnOpenAdvance() {
      let reo = await Ti.App.Open(_.assign({
        icon: "fas-search",
        title: "i18n:search-adv",
        position: "top",
        width: "6.4rem",
        height: "61.8%"
      }, this.dialog, {
        result: this.filter,
        model: { event: "change", prop: "data" },
        comType: "TiForm",
        comConf: this.advanceForm,
        components: this.advanceComponents
      }))
      // User cancel
      if (!reo) {
        return
      }
      // Notify change
      this.notifyFilterChange({ newFlt: reo, withTags: false })
    },
    //-------------------------------------
    notifyFilterChange({ newFlt = {}, withTags = true } = {}) {
      let flt = {}
      // Get the majorValue
      _.forEach(this.MajorDropList, ({ index, key }) => {
        let val = _.get(this.myMajorValues, index)
        if (!Ti.Util.isNil(val)) {
          flt[key] = val
        }
      })
      // Get the tags value
      if (withTags) {
        _.forEach(this.myTags, (tag) => {
          let { key, val } = tag.value
          flt[key] = val
        })
      }
      // Merge with new filter
      _.assign(flt, newFlt)

      // Do Notify
      if (!_.isEqual(this.filter, flt)) {
        this.$notify("filter:change", flt)
      }
    },
    //-------------------------------------
    evalKeywords(input) {
      let flt = _.cloneDeep(this.filter)
      for (let mk of this.matchKeywords) {
        let { test, key, val = "${0}", type, mode = "==" } = mk
        let m = [input];
        if (test) {
          if (_.isRegExp(test) || /^\^/.test(test)) {
            let reg = new RegExp(test)
            m = reg.exec(input)
          }
          // Auto Test
          else if (!Ti.AutoMatch.test(test, input)) {
            continue;
          }
        }
        if (m) {
          // Prepare the render context
          let c = {}
          _.forEach(m, (v, i) => c[i] = v)
          // Render key and value
          let k = Ti.S.renderBy(key, c)
          if (!k) {
            continue;
          }
          let v = Ti.S.renderBy(val, c)
          // Covert to type
          if (type) {
            let toType = Ti.Types.getFuncByType(type)
            v = Ti.Types[toType](v)
          }
          let v2 = ({
            "==": v => v,
            "~=": v => `^.*${v}$`,
            "=~": v => `^${v}`,
            "~~": v => `^.*${v}`,
          })[mode](v)
          // Set to result
          flt[k] = v2
          break;
        }
      }
      return flt
    },
    //-------------------------------------
    async evalFilter() {
      let mjvs = []
      let tags = []
      let keys = _.keys(this.filter)
      for (let key of keys) {
        let val = this.filter[key]
        // Is Major
        let mi = this.MajorIndexMap[key]
        if (mi >= 0) {
          mjvs[mi] = val
          continue
        }
        // Defined tag display
        let ft = this.filterTags[key]

        // Default value
        if (!ft) {
          tags.push({ text: `${key}=${val}`, value: { key, val } })
          continue
        }

        // Quick ft name
        if ("<MsDateRange>" == ft) {
          ft = DATERANGE_FILTER_TAG
        }

        // Customized function
        if (_.isFunction(ft)) {
          let text = await ft(val, key)
          tags.push({ text, value: { key, val } })
          continue;
        }

        // Dict
        let dictName = Ti.DictFactory.DictReferName(ft)
        if (dictName) {
          let d = Ti.DictFactory.CheckDict(dictName)
          let text = await d.getItemText(val)
          tags.push({ text, value: { key, val } })
          continue
        }
        // Template
        let text = Ti.Util.explainObj({ key, val }, ft)
        tags.push({ text, value: { key, val } })
      }
      this.myMajorValues = mjvs
      this.myTags = tags
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "filter": {
      handler: "evalFilter",
      immediate: true
    }
  }
  //////////////////////////////////////////
}