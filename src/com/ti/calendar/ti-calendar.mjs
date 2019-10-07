///////////////////////////////////////////
export default {
  /////////////////////////////////////////
  data: ()=>({
    "view_date" : null
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date, Array],
      default : ()=>new Date()
    },
    /***
     * The value represent a **Date Range**.
     * It must be a Array with two elements, first one is begin date
     * of the range, the last one is the end of the range.
     * Both the two date is includsive of the range.
     * 
     * If the value passed in is not array, It will be taken as 
     * the begin date
     */
    "range" : {
      type : Boolean,
      default : false
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
     * - "monthly" : show whole month
     * - "weekly"  : show few weeks defined by `matrixCount`
     */ 
    "matrixMode" : {
      type : String,
      default : "monthly"
    },
    /***
     * Define the matrix block count by `matrixMode`
     * 
     * - "monthly" - how many calenars should be shown in same time
     * - "weekly"  - how many week should be shown in block
     */
    "matrixCount" : {
      type : Number,
      default : 1
    },
    // true : can write time directly
    "monthEditable" : {
      type : Boolean,
      default : true
    },
    "monthFormat" : {
      type : String,
      default : "yyyy-MM-dd" 
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
    switcherClass() {
      if(this.isMonthly && this.matrixCount>1) {
        return "sz-double"
      }
    },
    //--------------------------------------
    isMonthly() {
      return "monthly" == this.matrixMode
    },
    isWeekly() {
      return "weekly" == this.matrixMode
    },
    //--------------------------------------
    today() {
      return new Date()
    },
    todayName() {
      return Ti.Types.formatDate(this.today, "yyyy-MM-dd")
    },
    //--------------------------------------
    theDate() {
      if(_.isArray(this.value)) {
        if(this.value.length > 0) {
          return Ti.Types.toDate(this.value[0])
        }
        return new Date()
      }
      return Ti.Types.toDate(this.value)
    },
    //--------------------------------------
    theRangeInMs() {
      // Move to 00:00:00
      let dt0 = new Date(this.theDate)
      // Define the dt1
      let dt1;
      if(_.isArray(this.value) && this.value.length > 1) {
        dt1 = Ti.Types.toDate(this.value[1])
      }
      // The End of the Day
      else {
        dt1 = new Date(dt0)
      }
      // Make the range
      let msRange = [dt0.getTime(), dt1.getTime()].sort()

      // dt0 start of the day
      dt0 = Ti.DateTime.setTime(new Date(msRange[0]))
      // dt1 end of the day
      dt1 = Ti.DateTime.moveDate(new Date(msRange[1]), 1)
      Ti.DateTime.setTime(dt1)

      // rebuild the range
      return [dt0.getTime(), dt1.getTime()]
    },
    //--------------------------------------
    theRangeInText() {
      return Ti.Types.formatDate(this.theRangeInMs, "yyyy-MM-dd")
    },
    //--------------------------------------
    theRangeBeginDate() {
      return new Date(this.theRangeInMs[0])
    },
    //--------------------------------------
    theRangeEndDate() {
      return new Date(this.theRangeInMs[1])
    },
    //--------------------------------------
    theViewRange() {
      let c0 = this.dateMatrixList[0][0][0]
      let i = this.dateMatrixList.length - 1
      let y = this.dateMatrixList[i].length - 1
      let x = this.dateMatrixList[i][y].length - 1
      let c1 = this.dateMatrixList[i][y][x]
      while(c1.type!="in-month" && x>0) {
        c1 = this.dateMatrixList[i][y][--x]
      }
      return [c0.raw, c1.raw]
    },
    //--------------------------------------
    theViewRangeText() {
      let dt0 = this.theViewDate
      if(this.isMonthly && this.matrixCount > 1) {
        let dt1 = this.theViewRange[1]
        let fromYear  = dt0.getFullYear()
        let fromMonth = dt0.getMonth()
        let toYear    = dt1.getFullYear()
        let toMonth   = dt1.getMonth()
        let fromMonthAbbr = Ti.DateTime.getMonthAbbr(fromMonth)
        let toMonthAbbr   = Ti.DateTime.getMonthAbbr(toMonth)
        let fromMonthText = Ti.I18n.get(fromMonthAbbr)
        let toMonthText   = Ti.I18n.get(toMonthAbbr)
        let vars = {
          fromYear,      toYear,
          fromMonth,     toMonth,
          fromMonthAbbr, toMonthAbbr,
          fromMonthText, toMonthText
        }
        // Beyound year
        if(fromYear != toYear) {
          return Ti.I18n.getf("cal.range-beyond-year", vars)
        }
        // Beyound month
        if(fromMonth != toMonth) {
          return Ti.I18n.getf("cal.range-beyond-month", vars)
        }
      }
      return Ti.Types.formatDate(dt0, this.monthFormat)
    },
    //--------------------------------------
    theDateName() {
      return Ti.Types.formatDate(this.theDate, "yyyy-MM-dd")
    },
    //--------------------------------------
    theViewDate() {
      return this.view_date || this.theDate
    },
    //--------------------------------------
    theViewYear() {
      return this.theViewDate.getFullYear()
    },
    //--------------------------------------
    theViewMonth() {
      return this.theViewDate.getMonth()
    },
    theViewMonthAbbr() {
      return Ti.DateTime.getMonthAbbr(this.theViewMonth)
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
    dateMatrixList() {
      let beginDate = new Date(this.theViewDate)
      //............................
      let list = []
      let theYear  = this.theViewYear
      let theMonth = this.theViewMonth
      // Monthly: may create multi-matrix
      if(this.isMonthly) {
        for(let i=0; i<this.matrixCount; i++) {
          let {matrix, lastDate} = this.createMatrix(
            beginDate, theYear, theMonth
          )
          list.push(matrix)
          beginDate = Ti.DateTime.moveDate(new Date(lastDate), 1)
          theMonth ++
          if(theMonth >= 12) {
            theMonth = 0
            theYear ++
          }
        }
      }
      // Weekly
      else {
        let {matrix} = this.createMatrix(beginDate)
        list.push(matrix)
      }
      return list
      //............................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    /***
     * Create a date matrix
     */
    createMatrix(beginDate, theYear, theMonth) {
      // Move to the first date in month
      if(this.isMonthly) {
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
      // Build the matrix
      let len = 7
      let y = 0
      let matrix = []
      let lastDate = null
      while(true) {
        let row = []
        for(let x=0; x<len; x++) {
          let index = y*len + x
          lastDate = Ti.DateTime.createDate(beginDate, index)
          let month = lastDate.getMonth()
          let date  = lastDate.getDate()
          let name  = Ti.Types.formatDate(lastDate, "yyyy-MM-dd")
          let isSelected = false
          // Range: match begin/end date
          if(this.range) {
            isSelected = _.inRange(lastDate.getTime(), ...this.theRangeInMs)
          }
          // Single: match the date
          else {
            isSelected = name == this.theDateName
          }
          let type = {
            "is-prev"  : month < theMonth,
            "is-next"  : month > theMonth,
            "in-month" : month == theMonth,
            "is-today" : this.todayName == name,
            "is-selected" : isSelected
          }
          // Eval displayText in cell
          // The first day of month should the Abbr
          let text = ""+date
          if(1 == date && (
              (this.isMonthly && this.matrixCount>1)
              || this.isWeekly
          )) {
            let abbr = Ti.DateTime.getMonthAbbr(month)
            text = Ti.I18n.get(`cal.abbr.${abbr}`)
          }
          // Join to the row
          row.push({
            x, y, index, type, name, text,
            year  : lastDate.getFullYear(),
            month,
            day   : lastDate.getDay(),
            date  : lastDate.getDate(),
            raw   : lastDate
          })
        }
        // Move to next row
        y++
        // End by week count
        if(this.isWeekly) {
          let count = _.clamp(this.matrixCount, 1, 100)
          if(y>count)
            break
        }
        // End by next month
        else if(this.isMonthly) {
          if((
              row[0].year  == theYear &&
              row[0].month  > theMonth
            ) || row[0].year > theYear) {
            break
          }
        }
        // Invalid mode, break now
        else {
          break
        }
        // Join to matrix
        matrix.push(row)
      }
      //............................
      return {
        matrix, lastDate
      }
    },
    //--------------------------------------
    gotoToday() {
      this.view_date = new Date()
    },
    //--------------------------------------
    gotoMatrix(offset=0) {
      let cd = this.theViewDate
      let dt = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate())

      // Monthly
      if(this.isMonthly) {
        Ti.DateTime.moveMonth(dt, offset)
      }
      // Weekly
      else if(this.isWeekly) {
        Ti.DateTime.moveDate(dt, offset*7*this.matrixCount)
      }
      // Invalid mode
      else {
        return
      }

      // Switch the current view
      this.view_date = dt

      this.$emit("view:changed", this.theViewDate)
    },
    //--------------------------------------
    onMonthChanged(month) {
      let dt = Ti.Types.toDate(month)
      this.view_date = dt

      this.$emit("view:changed", this.theViewDate)
    },
    //--------------------------------------
    onClickCell(cell) {
      // Notify the cell be selected
      this.$emit("cell:selected", cell)
      // Range
      if(this.range) {
        // If array ...
        if(_.isArray(this.value)) {
          // Finish the range
          if(this.value.length == 1) {
            let msRange = [cell.raw.getTime(), this.theDate.getTime()].sort()
            let dt0 = Ti.Types.toDate(msRange[0])
            let dt1 = Ti.Types.toDate(msRange[1])
            this.$emit("changed", [dt0, dt1])
          }
          // Start a new range
          else {
            this.$emit("changed", [cell.raw])
          }
        }
        // Has Value
        else {
          this.$emit("changed", [cell.raw])
        }
      }
      // Single value
      else {
        this.$emit("changed", cell.raw)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted : function() {
    this.view_date = new Date(this.theDate)
  }
  //////////////////////////////////////////
}