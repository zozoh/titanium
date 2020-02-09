export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
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
    },
    //------------------------------------------------
    topClass() {
      return this.className
    },
    //------------------------------------------------
    topStyle() {
      return {
        "height" : Ti.Css.toSize(this.height)
      }
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
        value : currentVal,
        data  : []
      }
      for(let i=fromVal; i<toVal; i++) {
        list.data.push({
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
    onListChanged(key, val) {
      let theDate = this.theDate || new Date()

      let d = ({
        "month" : (m)=>{
          return new Date(theDate.getFullYear(), m)
        },
        "year" : (y)=>{
          return new Date(y, theDate.getMonth())
        }
      })[key](val)

      this.$emit("changed", d)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}