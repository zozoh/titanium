const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    myLastIndex: -1,      // The last row index selected by user
    myCurrentId: null,    // Current row ID
    myCheckedIds: {}      // Which row has been checked
  }),
  ///////////////////////////////////////////////////
  // props -> ti-table-props.mjs
  ///////////////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-checkable"   : this.checkable,
        "is-selectable"  : this.selectable,
        "is-openable"    : this.openable,
        "is-cancelable"  : this.cancelable,
        "is-hoverable"   : this.hoverable
      }, [
        `is-border-${this.border}`
      ])
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //--------------------------------------
    /*
    [{
      index, id, className,
      cells : [{
          index, width, nowrap, className,
          checked, changed, current,
          items : [{
            index, type,
            className,    // <- getClassName
            value,        // <- getValue
            displayValue  // <- transformer | tidy
          }]
      }]
    }]
    */
    TableData() {
      let showNumber = _.isNumber(this.rowNumberBase)
      let base = showNumber ? this.rowNumberBase : -1
      let list = _.map(this.data, (obj, index) => {
        let id = this.getRowId(obj, index)
        if(Ti.Util.isNil(id)) {
          id = `Row-${index}`
        }
        let checked = !!this.myCheckedIds[id]
        let changed = (this.changedId == id)
        let current = (this.myCurrentId == id)
        let className = {
          "is-checked" : checked,
          "is-current" : current,
          "is-changed" : changed
        }
        
        let number;
        if(base >= 0) {
          number = base + index
        }

        let cells = _.map(this.TableFields, fld=>{
          let items = _.map(fld.display, ({
            index, type, getClassName, getValue, 
            transform, tidy
          })=>{
            let it = {index, type}
            // Item value
            it.value = getValue(obj)
            // ClassName
            if(getClassName) {
              it.className = getClassName(it.value)
            }
            // Transform
            let disval = it.value
            if(transform) {
              disval = transform(disval)
            }
            disval = tidy(disval)
            // Tidy value by types
            it.displayValue = disval
            // Done for item
            return it
          }) // End Items

          return {... fld, items}
        }) // End cells

        return {
          showNumber,
          number, index, 
          id, className, cells,
          checked, changed, current,
          rawData : obj
        }
      })

      return list
    },
    //-----------------------------------------------
    getRowId() {
      return Ti.Util.genRowIdGetter(this.idBy)
    },
    //-----------------------------------------------
    isDataEmpty() {
      return !_.isArray(this.TableData) || _.isEmpty(this.TableData)
    },
    //-----------------------------------------------
    isAllChecked() {
      // Empty list, nothing checked
      if(this.isDataEmpty) {
        return false 
      }
      if(_.size(this.myCheckedIds) != _.size(this.TableData)) {
        return false
      }
      // Checking ...
      for(let row of this.TableData){
        if(!this.myCheckedIds[row.id])
          return false;  
      }
      return true
    },
    //-----------------------------------------------
    hasChecked() {
      return !_.isEmpty(this.myCheckedIds)
    },
    //--------------------------------------
    HeadCheckerIcon() {
      if(this.isAllChecked) {
        return "fas-check-square"
      }
      if(this.hasChecked) {
        return "fas-minus-square"
      }
      return "far-square"
    },
    //--------------------------------------
    TableFields() {
      //....................................
      const evalFldDisplay = (dis={}, index)=>{
        if(_.isString(dis)) {
          dis = {key:dis}
        }
        let {key, type, className, transformer} = dis

        // Key
        let m = /^([\w\d_-]+)(\.([\w\d_-]+))?/.exec(key)
        if(m) {
          key = m[1]
          className = className || m[3]
        }

        // Default type as text
        type = type || "text"

        // Get value
        let getValue;
        if(".." == key){
          getValue = obj => obj
        } else if(_.isArray(key)) {
          getValue = obj => _.pick(obj, key)
        } else {
          getValue = obj => _.get(obj, key)
        }

        // ClassName
        let getClassName;
        if(_.isFunction(className)) {
          getClassName = className
        } else if(_.isString(className)) {
          getClassName = ()=>className
        } else if(className){
          let cans = []
          _.forEach(className, (key, val)=>{
            cans.push({
              className : key,
              match : Ti.AutoMatch.parse(val)
            })
          })
          getClassName = (val) => {
            for(let can of cans) {
              if(can.match(val))
                return can.className
            }
          }
        }

        // transformer
        let transFunc;
        if(transformer) {
          transFunc = Ti.Util.genInvoking(transformer, {
            context: this, 
            partial: "right"
          })
        }

        // Tidy Value by type
        let tidyFunc =({
          "text" : v => v,
          "icon" : v => Ti.Icons.parseFontIcon(v),
          "img"  : v => v
        })[type]

        if(!tidyFunc) {
          throw "Invalid display type: " + type
        }

        return {
          index, type, 
          getClassName, 
          getValue, 
          transform: transFunc,
          tidy: tidyFunc
        }
      }
      //....................................
      let fields = _.map(this.fields, (fld, index) => {
        let diss = [].concat(fld.display)
        let display = _.map(diss, (dis,index) => {
          return evalFldDisplay(dis, index)
        })
        return {
          ... fld,
          headStyle : Ti.Css.toStyle({
            width : fld.width
          }),
          index, display,
          className : {
            "is-nowrap" : fld.nowrap
          }
        }
      })
      //....................................
      return fields
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-table', 'table-body',
            'table-head-cell',
            'table-head-cell-text')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    // Publish methods
    //--------------------------------------
    findRowIndexById(rowId) {
      for(let row of this.TableData) {
        if(row.id == rowId) {
          return row.index
        }
      }
      return -1
    },
    //--------------------------------------
    findRowById(rowId) {
      for(let row of this.TableData) {
        if(row.id == rowId) {
          return row
        }
      }
    },
    //--------------------------------------
    getRow(index=0) {
      return _.nth(this.TableData, index)
    },
    //--------------------------------------
    // Utility
    //--------------------------------------
    scrollCurrentIntoView() {
      //console.log("scrollCurrentIntoView", this.myLastIndex)
      if(this.autoScrollIntoView && this.myCurrentId) {
        let index = this.findRowIndexById(this.myCurrentId)
        //console.log("scroll", index)
        let $view = this.$el
        let $row  = Ti.Dom.find(`.table-row:nth-child(${index+1})`, $view)

        if(!_.isElement($view) || !_.isElement($row)) {
          return
        }

        let r_view = Ti.Rects.createBy($view)
        let r_row = Ti.Rects.createBy($row)

        // test it need to scroll or not
        if(!r_view.contains(r_row)) {
          // at bottom
          if(r_row.bottom > r_view.bottom) {
            $view.scrollTop += r_row.bottom - r_view.bottom
          }
          // at top
          else {
            $view.scrollTop += r_row.top - r_view.top
          }
        }
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "currentId" : {
      handler : function(newVal, oldVal){
        if(!_.isEqual(newVal, oldVal)) {
          this.myCurrentId = newVal
        }
      },
      immediate : true
    },
    "checkedIds" : {
      handler : function(newVal, oldVal){
        if(!_.isEqual(newVal, oldVal)) {
          this.myCheckedIds = newVal
        }
      },
      immediate : true
    }
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    if(this.autoScrollIntoView) {
      _.delay(()=>{
        this.scrollCurrentIntoView()
      }, 0)
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;