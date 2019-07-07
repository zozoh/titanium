function draw_chart({
  $refs,
  type="interval",
  unit,
  data=[],
  axisX,
  axisY,
  padding,
  minValue,
  maxValue,
  valueInterval
}={}) {
  let $container = $refs.chart
  console.log(data)
  let width  = G2.DomUtil.getWidth($container)
  let height = G2.DomUtil.getHeight($container)
  // if(width > 500 && width < 510)
  //   console.log(width, height)
  // if(hasSlider)
  //   console.log("XXXX", data)
  //.......................................
  // maxValue
  if(_.isUndefined(maxValue)) {
    maxValue = 0
    let valKey = axisY.name
    for(let it of data){
      maxValue = Math.max(maxValue, it[valKey])
    }
  }
  //.......................................
  // Create The Chart
  let chart = new G2.Chart({
    container: $container,
    padding, width, height
  })
  //.......................................
  // Set datasource
  chart.source(data)
  //.......................................
  // Setup title
  chart.legend(false)
  //.......................................
  // axisX
  let axisXOptions = {
    label : {
      textStyle : {
        fill : axisX.color || "#888"
      }
    }
  }
  chart.axis(axisX.name, axisXOptions)
  //.......................................
  // 纵轴设定
  let axisYOptions = {
    label : {
      autoRotate : false,
      textStyle : {
        fill : axisY.color || "#888"
      }
    },
    grid: {
      type: 'line',
      lineStyle: {
        stroke: 'rgba(255,255,255,0.4)',
        lineWidth: 0.5,
        lineDash: false
      }
    }
  }
  chart.axis(axisY.name, axisYOptions)
  //.......................................
  // 视图缩放
  let alias = axisY.title || axisY.name
  chart.scale(axisY.name, {
    alias,
    type : "linear",
    min: minValue,
    max: maxValue,
    tickInterval: valueInterval
  })
  //.......................................
  // 图表种类和风格
  let position = `${axisX.name}*${axisY.name}`
  let geom = chart[type]()
    .position(position)
    //.color(color || 'l(270) 0:#0d4a6a 1:#00fddd')
    .animate({
      appear: {
        delay: 500, // 动画延迟执行时间
        duration: 1000 // 动画执行时间
      }
    });
    
  //.......................................
  // 渲染并返回
  chart.render()
  return chart
}
///////////////////////////////////////////
export default {
  /////////////////////////////////////////
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "title" : {
      type : String,
      default : null
    },
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "type" : {
      type : String,
      default : "interval"
    },
    "axisX" : {
      type : Object,
      default : ()=>({
        name : "name",
        title : "name"
      })
    },
    "axisY" : {
      type : Object,
      default : ()=>({
        name : "value",
        title : "value"
      })
    },
    "aside" : {
      type : Boolean,
      default : true
    },
    "unit" : {
      type : String,
      default : null
    },
    "padding" : {
      type: Array,
      default : ()=>[20,20,30,45]
    },
    "minValue" : {
      type: Number,
      default : 0
    },
    "maxValue" : {
      type: Number,
      default : undefined
    },
    "valueInterval" : {
      type: Number,
      default : 100
    }
  },
  //////////////////////////////////////////
  watch : {
    // "data" : function() {this.debounceRedrawChart()},
    // "type" : function() {this.debounceRedrawAll()},
    // "axisX" : function() {this.debounceRedrawAll()},
    // "axisY" : function() {this.debounceRedrawAll()}
  },
  //////////////////////////////////////////
  computed : {
    //......................................

    //......................................
    // TODO support slider
    hasSlider() {return false}
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    redrawChart() {
      console.log("I am redrawChart")
      if(this.__g2_chart) {
        this.__g2_chart.destroy()
        $(this.$refs.chart).empty()
      }
      this.__g2_chart = draw_chart(this)
    },
    drawAll() {
      console.log("I am drawAll")
      this.$nextTick(()=>{
        this.redrawChart()
        //this.redrawSlider()
      })
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : function() {
    this.drawAll()
    this.debounceRedrawChart = _.debounce(()=>{
      this.redrawChart()
    }, 500)
    this.debounceRedrawAll = _.debounce(()=>{
      this.drawAll()
    }, 500)
  },
  beforeDestroy : function(){
    if(this.__g2_chart) {
      this.__g2_chart.destroy()
    }
    // if(this.__g2_slider) {
    //   this.__g2_slider.destroy()
    // }
  }
  /////////////////////////////////////////
}