function __find_each_col_size($div) {
  let list = []
  let $cells = Ti.Dom.findAll(":scope > .table-row > li", $div)
  for(let $cell of $cells) {
    let orgWidth = $cell.getAttribute("org-width")
    if(orgWidth) {
      list.push(orgWidth * 1)
    }
    // Re-count
    else {
      let bcr = $cell.getBoundingClientRect()
      $cell.setAttribute("org-width", bcr.width)
      list.push(bcr.width)
    }
  }
  return list
}
function __clean_each_col_size($div) {
  let $cells = Ti.Dom.findAll(":scope > .table-row > li", $div)
  for(let $cell of $cells) {
    $cell.removeAttribute("org-width")
  }
}
/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    viewportWidth : 0,
    colSizes : []
  }),
  ///////////////////////////////////////////////////
  props : {
    "idKey" : {
      type : String,
      default : "id"
    },
    //
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    // The list to be rendered
    "list" : {
      type : Array,
      default : ()=>[]
    },
    // multi-selectable
    // effected when selectable is true
    "multi" : {
      type : Boolean,
      default : false
    },
    "checkable" : {
      type : Boolean,
      default : false
    },
    "border" : {
      type : Boolean,
      default : true
    },
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    isEmpty() {
      return this.list.length == 0
    },
    colSumWidth() {
      return _.sum(this.colSizes)
    },
    colSizesInPercent() {
      let sum = this.colSumWidth
      let list = []
      if(sum > 0) {
        for(let sz of this.colSizes) {
          list.push(sz / sum)
        }
      }
      return list
    },
    tableStyle() {
      let css = {}
      if(this.colSumWidth <= 0) {
        return css
      }

      let tableWidth = Math.max(this.viewportWidth, this.colSumWidth)
      if(tableWidth > 0) {
        css.width = tableWidth
        console.log("tableStyle", css, Ti.Css.toStyle(css))
      }
      return Ti.Css.toStyle(css)
    },
    topClass() {
      let klass = []
      if(this.border) {
        klass.push("show-border")
      }
      if(!_.isEmpty(klass))
        return klass.join(" ")
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    onSelected(it, index, eo){
      if(!this.selectable){
        return
      }
      // Eval Mode
      let mode = "active"
      if(this.multi) {
        if(eo.shiftKey) {
          mode = "shift"
        }
        // ctrl key on: toggle
        else if(eo.ctrlKey || eo.metaKey) {
          mode = "toggle"
        }
      }
      // Eval ID
      let id = it[this.idKey]
      // Do emit
      console.log("selected", {mode,id,index})
      this.$emit("selected", {mode,id,index})
    },
    onOpen({id,index}={}) {
      this.$emit("open", {id,index})
    },
    onBlur() {
      this.$emit("blur")
    },
    cellStyle(index, fld) {
      return Ti.Css.toStyle({
        width : this.colSizesInPercent[index]
      })
    },
    updateSizing() {
      this.viewportWidth = this.$el.getBoundingClientRect().width
      if(_.isEmpty(this.colSizes)) {
        // List two list of size 
        let lstHead = __find_each_col_size(this.$refs.head)
        let lstBody = __find_each_col_size(this.$refs.body)
        // Compare the max size to get the org-width of each columns
        let colSizes = []
        for(let i=0; i<lstHead.length; i++) {
          colSizes.push(Math.max(lstHead[i], lstBody[i]))
        }
        this.colSizes = colSizes
        console.log("!!!this.colSizes", this.colSizes)
      }
    }
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    const debounceUpdateSizing = _.debounce(()=>{
      // Reset
      this.colSizes = []

      __clean_each_col_size(this.$refs.head)
      __clean_each_col_size(this.$refs.body)

      // re-count
      if(!_.isEmpty(this.fields) && !_.isEmpty(this.list)) {
        this.$nextTick(()=>{
          this.updateSizing()
        })
      }
    }, 100, {
      leading : false
    })
    this.$watch("fields", debounceUpdateSizing)
    this.$watch("list"  , debounceUpdateSizing)

    const debounceUpdateSizing2 = _.debounce(()=>{
      this.updateSizing()
    }, 100, {
      leading : true
    })
    Ti.Viewport.watch(this, {resize : debounceUpdateSizing2})
  }
}