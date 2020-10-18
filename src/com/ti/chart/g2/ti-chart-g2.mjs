export default {
  /////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "padding" : {
      type : [Number, Array, String],
      default : "auto"
    },
    "appendPadding" : {
      type : [Number, Array, String],
      default : undefined
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
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    hasData() {
      return !_.isEmpty(this.data)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    draw_chart() {
      let $container = this.$refs.chart
      //let rect = Ti.Rects.createBy($container)
      //let {width, height} = rect
      //--------------------------------------.
      // Create The Chart
      let chart = new G2.Chart({
        container: $container,
        padding : this.padding,
        appendPadding : this.appendPadding,
        autoFit: true,
        //width, height
      })
      //--------------------------------------.
      // Set datasource
      if(this.autoSource && this.hasData)
        chart.data(this.data)
      //--------------------------------------.
      // Setup chart
      if(_.isFunction(this.setup)) {
        this.setup(chart, this.data)
      }
      //--------------------------------------.
      // 渲染并返回
      chart.render()
      return chart
    },
    //--------------------------------------
    redrawChart() {
      if(!_.isElement(this.$refs.chart)) {
        return
      }
      if(this.$G2Chart) {
        try{
          this.$G2Chart.destroy()
        }catch(E){}
        $(this.$refs.chart).empty()
      }
      this.$G2Chart = this.draw_chart(this)
    },
    drawAll() {
      //console.log("I am drawAll")
      this.$nextTick(()=>{
        this.redrawChart()
      })
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : "drawAll"
  },
  //////////////////////////////////////////
  mounted : function() {
    this.drawAll()

    // 监控窗口尺寸变化
    Ti.Viewport.watch(this, {
      resize: function() {
        let chart = this.$G2Chart
        if(chart) {
          this.$notify("before_resize")
          // let $container = this.$refs.chart
          // let rect = Ti.Rects.createBy($container)
          // let {width, height} = rect
          //chart.changeSize({width, height})
          chart.forceFit()
        }
      }
    })
  },
  //////////////////////////////////////////
  beforeDestroy : function(){
    if(this.$G2Chart) {
      this.$G2Chart.destroy()
    }
    // 解除窗口监控
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}