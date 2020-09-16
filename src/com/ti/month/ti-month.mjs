export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date],
      default : null
    },
    // the height of drop list
    "height" : {
      type : [Number, String],
      default : 200
    },
    "beginYear" : {
      type : [Number, String],
      default : 1970
    },
    "endYear" : {
      type : [Number, String],
      default : (new Date().getFullYear()+1)
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    topStyle() {
      return {
        "height" : Ti.Css.toSize(this.height)
      }
    },
    //------------------------------------------------
    theDate() {
      return Ti.Types.toDate(this.value, null)
    },
    //------------------------------------------------
    theListGroup() {
      return [
        this.createList("year",  
          this.beginYear*1, 
          this.endYear*1,
          this.theDate ? this.theDate.getFullYear() : null,
          {reverse:true}
        ),
        this.createList("month",
          0,
          12,
          this.theDate ? this.theDate.getMonth() : null,
          {getText: (val)=>{
            let abbr = Ti.DateTime.getMonthAbbr(val)
            return Ti.I18n.get(abbr)
          }}
        )
      ]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    createList(key, fromVal, toVal, currentVal, {
      reverse=false,
      getText=(val)=>val
    }={}) {
      let list = {
        key,
        currentId : `R-${currentVal}`,
        data  : []
      }
      for(let i=fromVal; i<toVal; i++) {
        list.data.push({
          id : `R-${i}`,
          value : i,
          text  : getText(i)
        })
      }
      if(reverse) {
        list.data.reverse()
      }
      return list
    },
    //------------------------------------------------
    onListSelected(key, {current}={}) {
      let val = _.get(current, "value") || 0

      let theDate = this.theDate || new Date()

      let d = ({
        "month" : (m)=>{
          return new Date(theDate.getFullYear(), m)
        },
        "year" : (y)=>{
          return new Date(y, theDate.getMonth())
        }
      })[key](val)
      this.$notify("change", d)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}