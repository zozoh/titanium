export default {
  ////////////////////////////////////////////////////
  props : {
    "valueTickNb" : {
      type : Number,
      default : 10
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ChartSetup() {
      return (chart, data)=>{
        //console.log(data)
        let list = []
        let maxValue = 0
        for(let it of data) {
          if(!it)
            return
          let value = it[this.valueBy]*1 || 0
          maxValue = Math.max(maxValue, value)
          list.push({
            name: Ti.I18n.text(it[this.nameBy]),
            value : value
          })
        }
        if(_.isEmpty(list))
          return

        // Set data
        chart.data(list);

        // Tick
        if(this.valueTickNb > 0) {
          let tickInterval = Math.round(maxValue / this.valueTickNb)
          chart.scale(this.valueBy, {tickInterval});
        }
        chart
          .line()
          .position(`name*value`)
        chart
          .point()
          .position(`name*value`)
          .size(4)
          .shape('circle')
          .style({
            stroke: '#fff',
            lineWidth: 1
          });

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