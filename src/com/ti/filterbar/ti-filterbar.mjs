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
      return this.getTopClass()
    },
    //-------------------------------------
    MajorItems() {
      let list = []
      if (_.isArray(this.majors)) {
        list.push(...this.majors)
      } else {
        list.push(this.majors)
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
    hasMajors() {
      return !_.isEmpty(this.MajorItems)
    },
    //-------------------------------------
    hasSorter() {
      return !_.isEmpty(this.sorter) && !_.isEmpty(this.sorterConf)
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //-------------------------------------
    evalKeywords(input) {
      let flt = _.cloneDeep(this.filter)
      for (let mk of this.matchKeywords) {
        let { test, key, val = "${0}", type, mode = "==" } = mk
        let m = [input];
        if (test) {
          let reg = new RegExp(test)
          m = reg.exec(input)
        }
        if (m) {
          // Prepare the render context
          let c = {}
          _.forEach(m, (v, i) => c[i] = v)
          // Render key and value
          let k = Ti.S.renderBy(key, c)
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

        // Customized function
        if (_.isFunction(ft)) {
          let text = await ft(val, key)
          tags.push({ text, value: { key, val } })
          continue;
        }

        // Dict
        let dictName = Ti.DictFactory.DictReferName()
        if (dictName) {
          let d = Ti.DictFactory.CheckDict(dictName)
          let text = await d.getItemText(val)
          tags.push({ text, value: { key, val } })
          continue
        }
        // Template
        if (_.isString(ft)) {
          let text = Ti.S.renderBy(ft, { key, val })
          tags.push({ text, value: { key, val } })
        }
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