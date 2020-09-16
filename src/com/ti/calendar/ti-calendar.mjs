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
      default : null
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
  watch : {
    // If the value changed outside,
    // and if the value our-of-view
    // It should auto switch the viewDate
    "value" : function(newVal, oldVal) {
      if(!_.isEmpty(newVal) && !_.isEqual(newVal, oldVal)) {
        let [v0] = [].concat(newVal)
        let dt = Ti.Types.toDate(v0)
        let ms = dt.getTime()
        if(!_.inRange(ms, ...this.theMatrixRangeInMs)) {
          this.view_date = null
        }
      }
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
        return null
      }
      return Ti.Types.toDate(this.value, null)
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
      dt1 = Ti.DateTime.setDayLastTime(new Date(msRange[1]))

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
    theMatrixRangeInMs() {
      let c0 = this.dateMatrixList[0][0][0]
      let i = this.dateMatrixList.length - 1
      let y = this.dateMatrixList[i].length - 1
      let x = this.dateMatrixList[i][y].length - 1
      let c1 = this.dateMatrixList[i][y][x]

      let dt0 = new Date(c0.raw)
      let dt1 = new Date(c1.raw)
      Ti.DateTime.setTime(dt0)
      Ti.DateTime.setDayLastTime(dt1)
      return [dt0.getTime(), dt1.getTime()]
    },
    //--------------------------------------
    theMatrixRange() {
      let dt0 = new Date(this.theMatrixRangeInMs[0])
      let dt1 = new Date(this.theMatrixRangeInMs[1])
      return [dt0, dt1]
    },
    //--------------------------------------
    theViewRange() {
      let i = this.dateMatrixList.length - 1
      let y = this.dateMatrixList[i].length - 1
      let x = this.dateMatrixList[i][y].length - 1
      let c1 = this.dateMatrixList[i][y][x]
      while(c1.type!="in-month" && x>0) {
        c1 = this.dateMatrixList[i][y][--x]
      }

      let dt0 = new Date(this.theViewDate)
      let dt1 = new Date(c1.raw)
      Ti.DateTime.setTime(dt0)
      Ti.DateTime.setDayLastTime(dt1)
      return [dt0, dt1]
    },
    //--------------------------------------
    theViewRangeText() {
      let dt0 = this.theViewRange[0]
      if(this.isMonthly && this.matrixCount > 1) {
        let dt1 = this.theViewRange[1]
        let yy0 = dt0.getFullYear()
        let MM0 = dt0.getMonth()
        let yy1 = dt1.getFullYear()
        let MM1 = dt1.getMonth()
        let abbr0 = Ti.DateTime.getMonthAbbr(MM0)
        let abbr1 = Ti.DateTime.getMonthAbbr(MM1)
        let MT0 = Ti.I18n.get(`cal.abbr.${abbr0}`)
        let MT1 = Ti.I18n.get(`cal.abbr.${abbr1}`)

        MM0++;  MM1++;  // Month change to 1 base

        let vars = {
          yy0, yy1,
          MM0, MM1,
          MT0, MT1
        }
        // Beyound year
        if(yy0 != yy1) {
          return Ti.I18n.getf("cal.m-range-beyond-years", vars)
        }
        // Beyound month
        if(MM0 != MM1) {
          return Ti.I18n.getf("cal.m-range-beyond-months", vars)
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
      return this.view_date || this.theDate || new Date()
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
    },
    //--------------------------------------
    onMonthChanged(month) {
      let dt = Ti.Types.toDate(month)
      this.view_date = dt
    },
    //--------------------------------------
    onClickCell(cell) {
      // Range
      if(this.range) {
        // If array ...
        if(_.isArray(this.value)) {
          //console.log(this.value)
          // Finish the range
          if(this.value.length == 1) {
            let msRange = [cell.raw.getTime(), this.theDate.getTime()].sort()
            let dt0 = Ti.Types.toDate(msRange[0])
            let dt1 = Ti.Types.toDate(msRange[1])
            this.$notify("change", [dt0, dt1])
          }
          // Start a new range
          else {
            this.$notify("change", [cell.raw])
          }
        }
        // Has Value
        else {
          this.$notify("change", [cell.raw])
        }
      }
      // Single value
      else {
        this.$notify("change", cell.raw)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted : function() {
    this.view_date = this.theDate || new Date()
  }
  //////////////////////////////////////////
}