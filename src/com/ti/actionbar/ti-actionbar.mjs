export default {
  ///////////////////////////////////////////
  provide : function(){
    return {
      "$bar"  : this,
      "depth" : 0
    }
  },
  ///////////////////////////////////////////
  data: ()=>({
    mySeq : 0,
    myGroups: {}
  }),
  ///////////////////////////////////////////
  props : {
    "items" :{
      type : Array,
      default : ()=>[]
    },
    "align" : {
      type : String,
      default : "left",
      validator : v => /^(left|right|center)$/.test(v)
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    TopClass() {
      return this.getTopClass(`align-${this.align}`)
    },
    //---------------------------------------
    BarItems() {
      //console.log("EvalBarItems")
      let list = []
      _.forEach(this.items, it => {
        let bi = this.evalBarItem(it)
        if(bi) {
          list.push(bi)
        }
      })
      return list
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //---------------------------------------
    allocGroup($big) {
      //console.log("allocGroup", $big.name)
      this.myGroups[$big.name] = $big
    },
    //---------------------------------------
    freeGroup($big) {
      //console.log("freeGroup", $big.name)
      delete this.myGroups[$big.name]
    },
    //---------------------------------------
    notifyChange({name, value}={}) {
      if(name) {
        this.$notify("change", {name, value})
      }
    },
    //---------------------------------------
    evalBarItem(it){
      // Guard
      if(!it)
        return

      // Test hidden
      if(it.hidden) {
        if(Ti.AutoMatch.test(it.hidden, this.status)){
          return
        }
      }

      // Test vibible
      if(it.visible) {
        if(!Ti.AutoMatch.test(it.visible, this.status)){
          return
        }
      }

      // Eval bar item
      let type = this.getItemType(it)
      let key = this.getItemKey(type)
      let bi = {
        type, key,
        comType: `bar-item-${type}`,
        comConf: _.defaults(_.omit(it, "items"), {
            name: key
          })
      }
      if("group" == type && _.isArray(it.items)) {
        bi.items = []
        for(let child of it.items) {
          let ci = this.evalBarItem(child)
          if(ci) {
            bi.items.push(ci)
          }
        }
      }
      return bi
    },
    //---------------------------------------
    getItemType(bi) {
      if(bi.type) {
        return _.toLower(bi.type)
      }
      // Line
      if(_.isEmpty(bi)) {
        return "line"
      }
      // Group
      else if(_.isArray(bi.items)) {
        return "group"
      }
      // TODO support switcher
      // Default is action
      return "action"
    },
    //---------------------------------------
    getItemKey(type="BarItem") {
      return `${type}-${this.mySeq++}`
    },
    //---------------------------------------
    collapseAllGroup() {
      _.forEach(this.myGroups, $big=>{
        $big.doCollapse()
      })
    },
    //---------------------------------------
    __ti_shortcut(uniqKey) {
      Ti.InvokeBy({"ESCAPE":()=>this.collapseAllGroup()}, uniqKey)
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  mounted: function(){
    Ti.Viewport.watch(this, {resize:()=>this.collapseAllGroup()})
  },
  ///////////////////////////////////////////
  beforeDestroy: function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////
}