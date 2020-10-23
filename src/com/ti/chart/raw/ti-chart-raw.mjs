export default {
  ////////////////////////////////////////////////////
  data : ()=>({
    minDataValue : undefined,
    maxDataValue : undefined
  }),
  ////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "xKey" : {
      type : String,
      default : "name"
    },
    "yKey" : {
      type : String,
      default : "value"
    },
    "positionX" : {
      type : String,
      default : "name"
    },
    "positionY" : {
      type : String,
      default : "value"
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "scaleX" : {
      type : Object,
      default : ()=>({})
    },
    // Plus support: 
    //  - tickUnit : 50  // for tickCount, unit to 50
    "scaleY" : {
      type : Object,
      default : ()=>({
        nice : true,
        tickCount: 10
      })
    },
    "axisX" : {
      type : Object,
      default : undefined
    },
    "axisY" : {
      type : Object,
      default : undefined
    },
    "labelX" : {
      type : [Boolean, Object, String, Function],
      default : undefined
    },
    "labelY" : {
      type : [Boolean, Object, String, Function],
      default : undefined
    },
    "tooltip" : {
      type : [Boolean, Object],
      default : ()=>({
        showCrosshairs : true
      })
    },
    "legend" : {
      type : [Boolean, Object],
      default : ()=>({
        flipPage: false
      })
    },
    "view" : {
      type : Object,
      default : undefined
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "padding" : {
      type : [Number, Array, String],
      default : "auto"
    },
    "appendPadding" : {
      type : [Number, Array, String],
      default : undefined
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "height" : {
      type : [Number, String],
      default : undefined
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ChartPosition() {
      return `${this.positionX}*${this.positionY}`
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    evalXYData(data, iteratee=_.identity) {
      let list = []
      let max, min, sum = 0;
      let i = 0;
      for(let it of data) {
        let value = (it[this.yKey] * 1) || 0
        let li = iteratee({
          [this.positionX]: Ti.I18n.text(it[this.xKey]),
          [this.positionY] : value
        })
        list.push(li)

        sum += value

        if((i++) > 0) {
          min = Math.min(value, min)
          max = Math.max(value, max)
        } else {
          min = value
          max = value
        }
      }
      this.maxDataValue = max
      this.minDataValue = min
      return {list, max, min, sum}
    },
    //------------------------------------------------
    getChartScaleX() {
      return _.assign({}, this.scaleX)
    },
    //------------------------------------------------
    getChartScaleY() {
      let config = _.cloneDeep(this.scaleY) || {}
      if("auto" == config.min || true === config.min) {
        config.min = this.minDataValue
      }
      if("auto" == config.max || true === config.max) {
        config.max = this.maxDataValue
      }
      return config
    },
    //------------------------------------------------
    applyChartScale(chart) {
      this.__apply_scale(chart, this.positionX, this.getChartScaleX())
      this.__apply_scale(chart, this.positionY, this.getChartScaleY())
    },
    //------------------------------------------------
    __apply_scale(chart, key, config) {
      if(!_.isEmpty(config)){
        if(config.tickUnit > 0) {
          config.min = Ti.Num.floorUnit(config.min, config.tickUnit)
          config.max = Ti.Num.ceilUnit(config.max, config.tickUnit)
        }
        chart.scale(key, config)
      }
    },
    //------------------------------------------------
    applyChartAxis(chart) {
      if(!_.isEmpty(this.axisX)) {
        chart.axis(this.positionX, this.axisX)
      }
      if(!_.isEmpty(this.axisY)) {
        chart.axis(this.positionY, this.axisY)
      }
    },
    //------------------------------------------------
    applyChartTooltip(chart) {
      if(!_.isEmpty(this.tooltip)) {
        chart.tooltip(this.tooltip);
      }
    },
    //------------------------------------------------
    applyChartSetup(chart) {
      // Axis
      this.applyChartAxis(chart)
        
      // Tick
      this.applyChartScale(chart)

      // Tooltip
      this.applyChartTooltip(chart)

      // legend
      if(!_.isUndefined(this.legend)) {
        chart.legend(this.legend)
      }
    },
    //------------------------------------------------
    applyViewLabel(view) {
      this.__apply_view_label(view, this.positionX, this.labelX)
      this.__apply_view_label(view, this.positionY, this.labelY)
    },
    //------------------------------------------------
    __apply_view_label(view, key, labelConfig) {
      if(!Ti.Util.isNil(labelConfig)) {
        let config = _.cloneDeep(labelConfig)

        if(_.isString(config)) {
          config = {content: config}
        }
        if(_.isString(config.content)) {
          let tmpl = config.content
          config.content = (obj) => {
            return Ti.S.renderBy(tmpl, obj)
          }
        }

        view.label(key, config)
      }
    },
    //------------------------------------------------
    applyViewOptions(view, ...options) {
      let config = _.merge({}, ...options)
      _.forEach(config, (v, k)=>{
        if(Ti.Util.isNil(v))
          return
        let args = _.concat(v)
        view[k].apply(view, args)
      })
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}