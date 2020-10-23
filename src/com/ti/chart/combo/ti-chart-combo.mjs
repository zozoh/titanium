//////////////////////////////////////////////////////
var _CHARTS = {
  "pie" : {
    "icon"  : "im-pie-chart",
    "tip" : "i18n:chart-pie",
    "comPath" : "@com:ti/chart/raw/pie",
    "comType" : "TiChartRawPie",
    "comConf" : {}
  },
  "bar" : {
    "icon"  : "im-bar-chart",
    "tip" : "i18n:chart-bar",
    "comPath" : "@com:ti/chart/raw/bar",
    "comType" : "TiChartRawBar",
    "comConf" : {}
  },
  "line" : {
    "icon"  : "im-line-chart-up",
    "tip" : "i18n:chart-line",
    "comPath" : "@com:ti/chart/raw/line",
    "comType" : "TiChartRawLine",
    "comConf" : {}
  },
  "rank" : {
    "icon"  : "zmdi-sort-amount-desc",
    "tip" : "i18n:chart-rank",
    "comPath" : "@com:ti/chart/raw/rank",
    "comType" : "TiChartRawRank",
    "comConf" : {}
  }
}
//////////////////////////////////////////////////////
export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    myActionStatus : {
      reloading : false,
      force : false
    },
    myChartCom : undefined
  }),
  ////////////////////////////////////////////////////
  props : {
    // array -> droplist
    // object/string -> single title
    "nameList" : {
      type : Array,
      default : ()=>[]
    },
    "name" : {
      type : String,
      default : undefined
    },
    "date" : {
      type : [Number, String, Date],
      default : undefined
    },
    "maxDate" : {
      type : [Number, String, Date],
      default : undefined
    },
    "span" : {
      type : String,
      default : "7d"
    },
    "spanOptions" : {
      type : Array,
      default : ()=>[{
        text  : "7",
        value : "7d"
      }, {
        text  : "30",
        value : "30d"
      }, {
        text  : "60",
        value : "60d"
      }, {
        text  : "90",
        value : "90d"
      }]
    },
    "chartDefines" : {
      type : Object,
      default : undefined
    },
    "chartTypes" : {
      type : [Array, String],
      default : "pie,bar,line"
    },
    "type" : {
      type : String,
      default : undefined
    },
    // {pie:{..}, bar:{..}, line:{..}  ...}
    "chartOptions" : {
      type : Object,
      default : ()=>({})
    },
    "data" : {
      type : Array,
      default : ()=>[]
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //------------------------------------------------
    hasChartCom() {
      return this.myChartCom && this.myChartCom.comType
        ? true
        : false
    },
    //------------------------------------------------
    hasMultiChartNames() {
      return !_.isEmpty(this.nameList) && this.nameList.length > 1
    },
    //------------------------------------------------
    ChartNameListOptions() {
      return {
        prefixIconForClean : false,
        keepWidthWhenDrop : true,
        hover: "suffixIcon",
        valueBy : "name",
        textBy  : "title",
        dropDisplay : "title"
      }
    },
    //------------------------------------------------
    ChartTitle() {
      if(!_.isEmpty(this.nameList)){
        for(let li of this.nameList) {
          if(li.name == this.name) {
            return li.title
          }
        }
      }
      return this.name
    },
    //------------------------------------------------
    HeadActionBarItems() {
      return [{
        "name"  : "reloading",
        "type" : "action",
        "icon" : "zmdi-refresh",
        "text" : "i18n:refresh",
        "altDisplay" : {
          "icon" : "zmdi-refresh zmdi-hc-spin",
          "text" : "i18n:loading"
        },
        "action" : ()=> this.reloadData(false),
      }, {
        "type" : "group",
        "icon" : "im-menu-dot-v",
        "items" : [{
            "name"  : "forceReloading",
            "type" : "action",
            "icon" : "im-reset",
            "text" : "i18n:refresh-hard",
            "altDisplay" : {
              "icon" : "zmdi-refresh zmdi-hc-spin",
              "text" : "i18n:loading",
              "match" : {
                "reloading" : true,
                "force" : true
              }
            },
            "action" : ()=> this.reloadData(true),
          }, {
            "name"  : "forceClearReloading",
            "type" : "action",
            "icon" : "im-reset",
            "text" : "i18n:refresh-hard-clear",
            "altDisplay" : {
              "icon" : "zmdi-refresh zmdi-hc-spin",
              "text" : "i18n:loading",
              "match" : {
                "reloading" : true,
                "force" : true
              }
            },
            "action" : ()=> this.reloadData(true, true),
          }]
      }]
    },
    //------------------------------------------------
    TheDate() {
      let d = Ti.DateTime.moveDate(new Date(), -1)
      if(this.date) {
        d = Ti.DateTime.parse(this.date)
      }
      return Ti.DateTime.format(d, "yyyy-MM-dd")
    },
    //------------------------------------------------
    TheMaxDate() {
      let d = Ti.DateTime.moveDate(new Date(), -1)
      if(this.maxDate) {
        d = Ti.DateTime.parse(this.maxDate)
      }
      return d
    },
    //------------------------------------------------
    TheSpan() {
      return this.span || "7d"
    },
    //------------------------------------------------
    DateRangeText() {
      // Prepare the text
      let str = []

      // Get date
      let d = this.TheDate;
      str.push(Ti.DateTime.format(d, "yyyy-MM-dd"))

      // Get span
      let m = /^(\d+)([smhdw])?$/.exec(this.TheSpan)
      if(m) {
        let val = parseInt(m[1])
        let unitText = ({
          "w"  : "dt-u-week",
          "d"  : "dt-u-day",
          "h"  : "dt-u-hour",
          "m"  : "dt-u-min",
          "s"  : "dt-u-sec",
          "ms" : "dt-u-ms"
        })[m[2] || "ms"]
        let s = `${val}${Ti.I18n.get(unitText)}`
        str.push(Ti.I18n.getf("dt-in", {val:s}))
      }

      return str.join(" ")
    },
    //------------------------------------------------
    hasMultiChartTypes() {
      return !_.isEmpty(this.chartTypes) && this.chartTypes.length > 0
    },
    //------------------------------------------------
    ChartTypeList() {
      let types = this.chartTypes
      if(_.isString(types)) {
        types = Ti.S.toArray(types)
      }
      let list = []
      for(let type of types) {
        let li =this.loadChartDefine(type)
        if(li) {
          li.value = type
          list.push(li)
        }
      }
      return list
    },
    //------------------------------------------------
    ChartType() {
      if(this.type)
        return this.type
      
      if(!_.isEmpty(this.chartTypes))
        return _.first(this.ChartTypeList).value
      
      return undefined
    },
    //------------------------------------------------
    ChartData() {
      return this.data || []
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnChartNameChange(name) {
      this.$notify("change:chart:name", name)
    },
    //------------------------------------------------
    OnChartTypeChange(name) {
      this.$notify("change:chart:type", name)
    },
    //------------------------------------------------
    async OnPickDateRange() {
      // Open the form dialog
      let reo = await Ti.App.Open({
        title : "i18n:edit",
        width  : "5rem",
        height : "5rem",
        result : {
          date : this.TheDate,
          span : this.TheSpan
        },
        model : {prop:"data", event:"change"},
        comType : "TiForm",
        comConf : [{
          fields : [{
              title : "i18n:stat-date-at",
              name  : "date",
              comType : "TiInputDate",
              comConf : {}
            }, {
              title : "i18n:stat-date-span",
              name  : "span",
              tip   : "i18n:dt-u-day",
              width : "auto",
              comType : "TiSwitcher",
              comConf : {
                options : this.spanOptions
              }
            }]
        }]
      })

      // User Cancel
      if(!reo || !reo.date)
        return

      // Invalid date
      let d = Ti.DateTime.parse(reo.date)
      if(d.getTime() > this.TheMaxDate.getTime()) {
        return await Ti.Toast.Open("i18n:stat-date-at-oor", "warn")
      }

      this.$notify("change:chart:datespan", {
        date : reo.date,
        span : reo.span
      })
    },
    //------------------------------------------------
    loadChartDefine(type) {
      let chart = _.get(this.chartDefines, type)

      if(!chart) {
        chart = _.get(_CHARTS, type)
      }

      if(chart) {
        return _.cloneDeep(chart)
      }
    },
    //------------------------------------------------
    reloadData(force=false, cleanCache=false) {
      this.myActionStatus = {reloading:true,  force}
      this.$notify("reload:data", {
        force, cleanCache, 
        done: ()=>{
          this.myActionStatus = {}
        }
      })
    },
    ////////////////////////////////////////////////////
    async reloadChartCom(type=this.type) {
      let chart = this.loadChartDefine(type)
      if(!chart) {
        console.warn(`Fail to reloadChartCom by type : "${type}"`)
        return
      }

      // Load chart com
      await Ti.App(this).loadView({
        comType : chart.comPath
      })

      console.log({type, chart})
      // Eval The Chart Com
      let comType = chart.comType
      let comConf = _.assign({}, 
          chart.comConf, 
          _.get(this.chartOptions, this.type))

      // Assign com
      this.myChartCom = {comType, comConf}
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "type" : {
      handler : "reloadChartCom",
      immediate : true
    },
    "name" : function() {
      this.reloadChartCom()
    }
  }
  ////////////////////////////////////////////////////
}