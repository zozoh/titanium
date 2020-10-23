export default {
  ////////////////////////////////////////////////////
  props : {
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
        //list.reverse()
        chart.data(list);

        // Axis/Tick/Tooltip ...
        this.applyChartSetup(chart)

        chart.coordinate().transpose();

        let view = chart.interval().position(this.ChartPosition)
        this.applyViewOptions(view, this.view)
       
        chart.interaction('element-active');
        

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