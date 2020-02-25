export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    
  }),
  //////////////////////////////////////////
  props : {
    "iconBy" : {
      type : [String, Function],
      default : null
    },
    "indentBy" : {
      type : [String, Function],
      default : null
    },
    "itemClassName" : undefined,
    "display" : {
      type : [Object, String, Array],
      default : ()=>({
        key : "..",
        comType : "ti-label"
      })
    },
    "border" : {
      type : Boolean,
      default : true
    },
    "autoScrollIntoView" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return this.getTopClass({
        "is-hoverable"    : this.hoverable,
        "show-border"     : this.border
      })
    },
    //--------------------------------------
    getRowIndent() {
      if(_.isFunction(this.indentBy)) {
        return it => this.indentBy(it)
      }
      if(_.isString(this.indentBy)) {
        return it => _.get(it, this.indentBy)
      }
      return it => 0
    },
    //--------------------------------------
    getRowIcon() {
      if(_.isFunction(this.iconBy)) {
        return it => this.iconBy(it)
      }
      if(_.isString(this.iconBy)) {
        return it => _.get(it, this.iconBy)
      }
      return it => null
    },
    //--------------------------------------
    theDisplayItems() {
      let displayItems = _.concat(this.display)
      // Prepare the return list
      let items = []
      // Loop each items
      for(let li of displayItems) {
        let item = this.evalFieldDisplayItem(li, {
          funcSet: this.fnSet
        })
        if(item) {
          items.push(item)
        }
      }
      // Done
      return items
    },
    //--------------------------------------
    theData() {
      return this.evalData((it)=>{
        it.icon = this.getRowIcon(it.item)
        it.indent = this.getRowIndent(it.item)
      })
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-list', 'list-item')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    scrollCurrentIntoView() {
      if(this.autoScrollIntoView && this.myLastIndex>=0) {
        let [$first] = Ti.Dom.findAll(".list-row.is-current", this.$el)
        if($first) {
          let rect = Ti.Rects.createBy($first)
          let view = Ti.Rects.createBy(this.$el)
          if(!view.contains(rect)) {
            this.$el.scrollTop += rect.top - view.top
          }
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted : function() {
    if(this.autoScrollIntoView) {
      this.$nextTick(()=>{
        this.scrollCurrentIntoView()
      })
    }
  }
  //////////////////////////////////////////
}