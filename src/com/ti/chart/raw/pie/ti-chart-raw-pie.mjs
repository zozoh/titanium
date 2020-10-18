export default {
  ////////////////////////////////////////////////////
  props : {
    "percentBy" : {
      type : String,
      default : "percent"
    },
    "precise" : {
      type : Number,
      default : 2
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ChartSetup() {
      return (chart, data)=>{
        // Tidy date: summary
        let list = []
        let sum = 0
        for(let it of data) {
          if(!it)
            return
          let name  = it[this.nameBy]
          let value = it[this.valueBy]*1 || 0
          let percent = it[this.percentBy]
          sum += value

          list.push({name,value,percent})
        }

        // Eval percent
        for(let li of list) {
          if(_.isUndefined(li.percent)) {
            li.percent = Ti.Num.precise(li.value / sum, this.precise)
          }
        }

        if(_.isEmpty(list))
          return

        //console.log(list)
        chart.data(list);
        
        chart.coordinate('theta', {
          radius: 0.75
        });
        chart.tooltip({
          showMarkers: false
        });
        
        const interval = chart
          .interval()
          .adjust('stack')
          .position('value')
          .color('name')
          .style({
            opacity: 0.4
          })
          .state({
            active: {
              style: (element) => {
                const shape = element.shape;
                return {
                  matrix: Util.zoom(shape, 1.5),
                }
              }
            }
          })
          .label('name', (val) => {
            return {
              offset: -30,
              content: (obj) => {
                return Ti.I18n.text(obj.name) + '\n' + obj.percent + '%';
              },
            };
          });
        
        chart.interaction('element-single-selected');

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