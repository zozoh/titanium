export default {
  //////////////////////////////////////////
  data : ()=>({
    myData : [],
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
    TopClass() {
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
    DisplayItems() {
      let diss = _.concat(this.display)
      // Prepare the return list
      let items = []
      // Loop each items
      for(let dis of diss) {
        let item = this.evalFieldDisplayItem(dis)
        if(item) {
          items.push(item)
        }
      }
      // Done
      return items
    },
    //--------------------------------------
    TheData() {
      return this.myData
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickTop($event) {
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
      // Guard
      if(!this.autoScrollIntoView || Ti.Util.isNil(this.myCurrentId)) {
        return;
      }
      
      let [$first] = Ti.Dom.findAll(".list-row.is-current", this.$el)
      if($first) {
        let rect = Ti.Rects.createBy($first)
        let view = Ti.Rects.createBy(this.$el)
        if(!view.contains(rect)) {
          this.$el.scrollTop += rect.top - view.top
        }
      }
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-list", uniqKey)
      if("ARROWUP" == uniqKey) {
        this.selectPrevRow({
          payload: {byKeyboardArrow: true}
        })
        this.scrollCurrentIntoView()
        return {prevent:true, stop:true, quit:true}
      }

      if("ARROWDOWN" == uniqKey) {
        this.selectNextRow({payload:{byKeyboardArrow:true}})
        this.scrollCurrentIntoView()
        return {prevent:true, stop:true, quit:true}
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : {
      handler : async function(newVal, oldVal){
        let isSame = _.isEqual(newVal, oldVal)
        if(!isSame) {
          //console.log("!!!list data changed", {newVal, oldVal})
          this.myData = await this.evalData((it)=>{
            it.icon = this.getRowIcon(it.item)
            it.indent = this.getRowIndent(it.item)
          })

          this.$nextTick(()=>{
            this.scrollCurrentIntoView()
          })
        }
      },
      immediate : true
    },
    "myCurrentId" : function() {
      this.$nextTick(()=>{
        this.scrollCurrentIntoView()
      })
    }
  }
  //////////////////////////////////////////
}