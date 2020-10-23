export default {
  ////////////////////////////////////////////////////
  props : {
    "areaView" : {
      type : [Object, Boolean],
      default : false
    },
    "pointView" : {
      type : [Object, Boolean],
      default : true
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ChartSetup() {
      return (chart, data)=>{
        //console.log(data)
        let {list} = this.evalXYData(data)
        if(_.isEmpty(list))
          return

        // Set data
        chart.data(list);

        // Axis/Tick/Tooltip ...
        this.applyChartSetup(chart)

        // Draw line
        let view = chart.line().position(this.ChartPosition)
        this.applyViewOptions(view, this.view)

        // Draw point
        if(this.areaView) {
          view = chart.area().position(this.ChartPosition)
          this.applyViewOptions(view, this.areaView)
        }

        // Draw point
        if(this.pointView) {
          view = chart.point().position(this.ChartPosition)
          this.applyViewOptions(view, {   
            size  : 4,
            shape : 'circle',
            style : {
              stroke: '#FFF',
              lineWidth: 1
            }
          }, this.pointView)
        }

      } // ~ function
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}