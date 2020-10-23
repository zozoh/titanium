export default {
  ////////////////////////////////////////////////////
  props : {
    "percentKey" : {
      type : String,
      default : "percent"
    },
    "precise" : {
      type : Number,
      default : 2
    },
    "labelX" : {
      type : [Boolean, Object, String, Function],
      default: "${i18n:name} : ${percent}% : ${value}"
    },
    "tooltip" : {
      type : [Boolean, Object],
      default : ()=>({
        showTitle: false,
        showMarkers : false,
        showCrosshairs : false,
        itemTpl: '<li class="g2-tooltip-list-item">{name} : {percent}% : {value}</li>',
      })
    },
    "view" : {
      type : Object,
      default : ()=>({
        tooltip : ["name*percent*value", (n,p,v)=>{
          return {
            name: n, percent: p, value: v
          }
        }]
      })
    },
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ChartSetup() {
      return (chart, data)=>{
        let {list, sum} = this.evalXYData(data)
        if(_.isEmpty(list))
          return

        // Eval percent
        for(let li of list) {
          let v = li[this.positionY]
          li[this.percentKey] = Ti.Num.precise(v * 100 / sum, this.precise)
        }

        //console.log(list)
        chart.data(list);

        // Axis/Tick/Tooltip ...
        this.applyChartSetup(chart)
        
        // Coordinate
        chart.coordinate('theta', {
          radius: 0.75
        });
        
        const view = chart.interval().adjust('stack')
        view.position(this.percentKey).color(this.positionX);

        // View label
        this.applyViewLabel(view)

        this.applyViewOptions(view, {
          style : {
            opacity: 0.4
          },
          state : {
            active : {
              style: (element) => {
                const shape = element.shape;
                return {
                  matrix: G2.Util.zoom(shape, 1.5),
                }
              }
            }
          }
        }, this.view)
      
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