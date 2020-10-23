export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    /*
    [{
      name: "video-view",
      date: "2020-09-21",
      span: "7d",
      type: "pie"
    }]
    */
    myCharts : [],
    myShowChartNames : [],
    /*
    {
      $ChartName : {}
    }
    */
    myChartData : {},
    myDate : undefined,
    mySpan : undefined,
    myChartComConf : {}
  }),
  ////////////////////////////////////////////////////
  props : {
    "chartDefines" : {
      type : Object,
      default : undefined
    },
    "chartOptions" : {
      type : Object,
      default : undefined
    },
    /*
    [{name, title, agg, sum, sumOptions, types, type, chartOptions}]
    */
    "charts" : {
      type : Array,
      default : ()=>[]
    },
    "showCharts" : {
      type : [String, Array],
      default : undefined
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-multi-chart" : this.TheChartList.length > 1
      });
    },
    //------------------------------------------------
    TheShowChartNames() {
      if(_.isEmpty(this.myShowChartNames)) {
        return this.showCharts
      }
      return this.myShowChartNames
    },
    //------------------------------------------------
    TheChartNameList() {
      let list = []
      _.forEach(this.charts, ca => {
        list.push(_.pick(ca, "name", "title", "icon"))
      })
      return list
    },
    //------------------------------------------------
    TheChartMap() {
      let map = {}
      _.forEach(this.charts, ca => {
        map[ca.name] = ca
      })
      return map
    },
    //------------------------------------------------
    TheChartList() {
      let names = _.concat(this.TheShowChartNames)
      let list = []
      _.forEach(names, (caName, index) => {
        let ca = _.get(this.TheChartMap, caName)
        if(!ca)
          return

        let myChart = _.nth(this.myCharts, index) || {}
        let li = _.cloneDeep(myChart)
        let options = _.cloneDeep(this.chartOptions)
        //console.log(options)
        options = _.merge(options, ca.chartOptions)
        // Set default value
        _.defaults(li, {
          chartDefines : this.chartDefines,
          nameList : this.TheChartNameList,
          index,
          name : ca.name,
          chartTypes : ca.types,
          type : ca.type,
          chartOptions : options
        })
        // Test the type
        if(li.type && _.indexOf(li.chartTypes, li.type)<0) {
            li.type = ca.type
        }

        // Join to list
        list.push(li)
      })
      return list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async OnReloadChartData({index}, {force, cleanCache, done}) {
      await this.reloadChartData(index, {force, cleanCache})

      if(_.isFunction(done)) {
        done()
      }
    },
    //------------------------------------------------
    OnChangeChartName({index}, name) {
      // Update my chart setting
      this.$set(this.myShowChartNames, index, name)
      this.$set(this.myChartData, index, [])
      this.$nextTick(()=>{
        this.reloadChartData(index)
      })
    },
    //------------------------------------------------
    OnChangeChartType({index}, type) {
      // Update my chart setting
      this.setMyChart(index, {type})
    },
    //------------------------------------------------
    OnChangeChartDateSpan({index}, {date, span}) {
      // Update my chart setting
      this.setMyChart(index, {date, span})
      this.$nextTick(()=>{
        this.reloadChartData(index)
      })
    },
    //------------------------------------------------
    //
    // Utility
    //
    //------------------------------------------------
    setMyChart(index, obj) {
      let ca = _.nth(this.myCharts, index) || {}
      ca = _.assign({}, ca, obj)
      this.$set(this.myCharts, index, ca)
    },
    //------------------------------------------------
    getChartData(index) {
      //console.log("getChartData", name)
      return _.get(this.myChartData, index)
    },
    //------------------------------------------------
    //
    // Actions
    //
    //------------------------------------------------
    async reloadChartData(index, {force=false, cleanCache=false}={}) {
      let chartName = _.nth(this.TheShowChartNames, index)
      let chart = _.get(this.TheChartMap, chartName)
      if(!chart) {
        return
      }
      let {name, agg, sum, sumOptions} = chart
      let {date, span} = _.nth(this.myCharts, index) || {}

      // Prepare the command text
      let cmd = [`statistics sum '${sum}' -json -cqn`]
      // Date & span
      if(date) {
        cmd.push(`-date '${date}'`)
      }
      if(span) {
        cmd.push(`-span '${span}'`)
      }
      // Agg
      if(agg) {
        cmd.push(`-agg '${agg}'`)
        if(cleanCache) {
          cmd.push('-agg-force')
        }
      }
      // Force
      if(force){
        cmd.push("-force")
      }
      // More options
      _.forEach(sumOptions, (v, k)=>{
        let str
        if(_.isString(v) || _.isNumber(v) || _.isBoolean(v)) {
          str = v
        } else {
          str = JSON.stringify(v)
        }
        cmd.push(`-${k} '${str}'`)
      })

      // Executed command
      let cmdText = cmd.join(" ")
      //console.log("reloadChartData", cmdText)
      let reo = await Wn.Sys.exec2(cmdText, {as: "json"})
      if(reo && _.isArray(reo)) {
        this.$set(this.myChartData, index, reo)
      }
    },
    //------------------------------------------------
    preloadChartData() {
      if(!_.isEmpty(this.showCharts)) {
        for(let i=0; i<this.showCharts.length; i++) {
          this.reloadChartData(i)
        }
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "showCharts" : {
      handler: function(newVal, oldVal) {
        this.myShowChartNames = _.cloneDeep(this.showCharts)
        if(!_.isEqual(newVal, oldVal)) {
          this.preloadChartData()
        }
      },
      immediate : true
    }
  }
  ////////////////////////////////////////////////////
}