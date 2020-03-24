function draw_chart({
  $refs,
  padding,
  data,
  setup=_.identity,
  autoSource
}={}) {
  let $container = $refs.chart
  //console.log(data)
  let width  = G2.DomUtil.getWidth($container)
  let height = G2.DomUtil.getHeight($container)
  //.......................................
  // Create The Chart
  let chart = new G2.Chart({
    container: $container,
    padding, width, height
  })
  //.......................................
  // Set datasource
  if(autoSource && data && !_.isEmpty(data))
    chart.source(data)
  //.......................................
  // Setup chart
  setup(chart, data, {
    width, height
  })
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
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "padding" : {
      type : [Number, Array, String],
      default : "auto"
    },
    // Function(chart, data):void
    "setup" : {
      type : Function,
      default : _.identity
    },
    "autoSource" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  watch : {
    "data" : function() {this.debounceRedrawChart()},
  },
  //////////////////////////////////////////
  computed : {
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    redrawChart() {
      if(!_.isElement(this.$refs.chart)) {
        return
      }
      if(this.__g2_chart) {
        try{
          this.__g2_chart.destroy()
        }catch(E){}
        $(this.$refs.chart).empty()
      }
      this.__g2_chart = draw_chart(this)
    },
    drawAll() {
      //console.log("I am drawAll")
      this.$nextTick(()=>{
        this.redrawChart()
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
    // 监控窗口尺寸变化
    Ti.Viewport.watch(this, {
      resize: function() {
        let chart = this.__g2_chart
        if(chart) {
          this.$notify("before_resize")
          let $container = this.$refs.chart
          let width  = G2.DomUtil.getWidth($container)
          let height = G2.DomUtil.getHeight($container)
          chart.changeWidth(width)
          chart.changeHeight(height)
        }
      }
    })
  },
  beforeDestroy : function(){
    if(this.__g2_chart) {
      this.__g2_chart.destroy()
    }
    // 解除窗口监控
    Ti.Viewport.unwatch(this)
  }
  /////////////////////////////////////////
}