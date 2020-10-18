export default {
  ////////////////////////////////////////////////////
  props : {
    "valueAlias" : {
      type : String,
      default : "i18n:value"
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
        list.reverse()
        chart.data(list);

        // Scale
        chart.scale({
          value: {
            max: maxValue,
            min: 0,
            alias: Ti.I18n.text(this.valueAlias),
          },
        });

        chart.axis('name', {
          title: null,
          tickLine: null,
          line: null,
        });
        
        chart.axis('value', {
          label: null,
          title: {
            offset: 30,
            style: {
              fontSize: 12,
              fontWeight: 300,
            },
          },
        });
        chart.legend(false);
        chart.coordinate().transpose();

        chart
          .interval()
          .position(`name*value`)
          .size(26)
          .label('value', {
            style: {
              fill: '#8d8d8d',
            },
            offset: 10,
          });
        
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