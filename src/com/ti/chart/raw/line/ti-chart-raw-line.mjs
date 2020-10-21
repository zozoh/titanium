export default {
  ////////////////////////////////////////////////////
  props : {
    "valueTickNb" : {
      type : Number,
      default : 10
    },
    "lineAs" : {
      type : [Object, Boolean],
      default : true
    },
    "areaAs" : {
      type : [Object, Boolean],
      default : false
    },
    "pointAs" : {
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
        let tickInterval;
        if(this.valueTickNb > 0) {
          tickInterval = Math.round(maxValue / this.valueTickNb)
        }

        // Scale value axis
        chart.scale("value", {
          min: 0, max: maxValue,
          nice: true,
          tickInterval
        })

        // Draw line
        if(this.lineAs) {
          let lineAs = _.assign({   
            
          }, this.lineAs)

          let view = chart.line().position(`name*value`)
          _.forEach(lineAs, (v, k)=>{
            if(Ti.Util.isNil(v))
              return
            view[k](v)
          })
        }

        // Draw point
        if(this.areaAs) {
          let areaAs = _.assign({   
            
          }, this.areaAs)

          let view = chart.area().position(`name*value`)
          _.forEach(areaAs, (v, k)=>{
            if(Ti.Util.isNil(v))
              return
            view[k](v)
          })
        }

        // Draw point
        if(this.pointAs) {
          let pointAs = _.assign({   
            size  : 4,
            shape : 'circle',
            style : {
              stroke: '#FFF',
              lineWidth: 1
            }
          }, this.pointAs)

          let view = chart.point().position(`name*value`)
          _.forEach(pointAs, (v, k)=>{
            if(Ti.Util.isNil(v))
              return
            view[k](v)
          })
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