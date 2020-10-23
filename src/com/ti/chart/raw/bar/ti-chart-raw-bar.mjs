export default {
  ////////////////////////////////////////////////////
  props : {
    "scaleX" : {
      type : Object,
      default : ()=>({
        "range": [0.1, 0.9]
      })
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

        // Setup view
        let view = chart.interval().position(this.ChartPosition)
        this.applyViewOptions(view, this.view)

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