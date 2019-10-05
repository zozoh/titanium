///////////////////////////////////////////
export default {
  /////////////////////////////////////////
  data: ()=>({
    "my_current" : null
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date],
      default : ()=>new Date()
    },
    // Which day is first day
    //  0 - Sunday
    //  1 - Monday
    "firstDayInWeek" : {
      type : [Number, String],  // 0, or "Sun" or "Sunday"
      default : 0
    },
    /***
     * How to decide the matrix end date
     * 
     * - "monthly" : end when next month
     * - N(1-n) : week count
     */ 
    "matrixMode" : {
      type : [Number, String],
      default : "monthly"
    },
    // true : can write time directly
    "monthEditable" : {
      type : Boolean,
      default : true
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
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    today() {
      return new Date()
    },
    todayName() {
      return Ti.Types.formatDate(this.today, "yyyy-MM-dd")
    },
    //--------------------------------------
    currentDate() {
      return this.my_current
        || Ti.Types.toDate(this.value)
    },
    //--------------------------------------
    currentYear() {
      if(this.currentDate)
        return this.currentDate.getFullYear()
    },
    //--------------------------------------
    currentMonth() {
      if(this.currentDate)
        return this.currentDate.getMonth()
    },
    currentMonthAbbr() {
      return Ti.DateTime.getMonthAbbr(this.currentMonth)
    },
    //--------------------------------------
    weekTitles() {
      let day = this.firstDayInWeek
      // Week day index
      if(_.isNumber(day)) {
        day = _.clamp(day, 0, 6)
      }
      // Week day abbr or name
      else if(_.isString(day)) {
        let dayName = _.lowerCase(day)
        day = Ti.DateTime.getWeekDayValue(dayName, 0)
      }
      // Join list
      let list = []
      for(let i=0; i<7; i++) {
        list.push({
          day,
          title : Ti.I18n.get(["cal","week",day])
        })
        if(++day >=7 ) {
          day = 0
        }
      }
      // Return it
      return list
    },
    //--------------------------------------
    weekFirstDayValue() {
      if(_.isString(this.firstDayInWeek)) {
        return Ti.DateTime.getWeekDayValue(this.firstDayInWeek, 0)
      }
      return _.clamp(this.firstDayInWeek, 0, 6)
    },
    //--------------------------------------
    dayMatrix() {
      let beginDate = new Date(this.currentDate)
      // Move to the first date in month
      if("monthly" == this.matrixMode) {
        beginDate.setDate(1)
      }
      //............................
      // Move the first day of week
      let wfdv = this.weekFirstDayValue
      while(beginDate.getDay() > wfdv) {
        Ti.DateTime.moveDate(beginDate, -1)
      }
      while(beginDate.getDay() < wfdv) {
        Ti.DateTime.moveDate(beginDate, 1)
      }
      //............................
      let valueDate = Ti.Types.toDate(this.value)
      let valueText = Ti.Types.formatDate(valueDate, "yyyy-MM-dd")
      //............................
      // Build the matrix
      let len = 7
      let y = 0
      let matrix = []
      let lastD = null
      while(true) {
        let row = []
        for(let x=0; x<len; x++) {
          let index = y*len + x
          lastD = Ti.DateTime.createDate(beginDate, index)
          let month = lastD.getMonth()
          let name  = Ti.Types.formatDate(lastD, "yyyy-MM-dd")
          let type = {
            "is-prev"  : month < this.currentMonth,
            "is-next"  : month > this.currentMonth,
            "in-month" : month == this.currentMonth,
            "is-today" : this.todayName == name,
            "is-current" : name == valueText
          }
          row.push({
            x, y, index, type, name,
            year  : lastD.getFullYear(),
            month,
            day   : lastD.getDay(),
            date  : lastD.getDate(),
            raw   : lastD
          })
        }
        // Move to next row
        y++
        // End by week count
        if(_.isNumber(this.matrixMode)) {
          let count = _.clamp(this.matrixMode, 1, 100)
          if(y>count)
            break
        }
        // End by next month
        else if("monthly" == this.matrixMode) {
          if((
              row[0].year  == this.currentYear &&
              row[0].month  > this.currentMonth
            ) || row[0].year > this.currentYear) {
            break
          }
        }
        // Join to matrix
        matrix.push(row)
      }
      //............................
      return matrix
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    gotoMonth(offset=0) {
      let cd = this.currentDate
      let dt = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate())
      Ti.DateTime.moveMonth(dt, offset)
      this.my_current = dt

      this.$emit("changed:current", this.currentDate)
    },
    //--------------------------------------
    onMonthChanged(month) {
      let dt = Ti.Types.toDate(month)
      this.my_current = dt

      this.$emit("changed:current", this.currentDate)
    },
    //--------------------------------------
    onClickCell(cell) {
      this.$emit("changed:cell", cell)
      this.$emit("changed", cell.raw)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}