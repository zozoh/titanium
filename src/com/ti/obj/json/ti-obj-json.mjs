export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    theTreeData : []
  }),
  //////////////////////////////////////////
  props : {
    "className" : null,
    "data" : null
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalTreeData() {
      let list = []
      // Join the top data
      this.joinTreeTableRow(list, this.data)
      // Set the data
      this.theTreeData = list
    },
    //--------------------------------------
    joinTreeTableRow(list=[], item, key) {
      // Default itemKey is self-type
      // For top leval
      if(_.isUndefined(key)) {
        key = _.upperFirst(typeof item)
      }
      //................................
      // undefined
      if(_.isUndefined(item)) {
        list.push({
          name  : key,
          value : undefined
        })
      }
      //................................
      // null
      else if(_.isNull(item)) {
        list.push({
          name  : key,
          value : null
        })
      }
      //................................
      // Array
      if(_.isArray(item)) {
        // Create self
        let node = {
          name  : key,
          value : "[..]",
          children : []
        }
        // Join Children
        for(let i=0; i<item.length; i++) {
          let child = item[i]
          this.joinTreeTableRow(node.children, child, i)
        }
        // Join self
        list.push(node)
      }
      //................................
      // Object
      else if(_.isPlainObject(item)) {
        // Create self
        let node = {
          name  : key,
          value : "{..}",
          children : []
        }
        // Join Children
        _.forEach(item, (v, k)=>{
          this.joinTreeTableRow(node.children, v, k)
        })
        // Join self
        list.push(node)
      }
      //................................
      // Boolean
      else if(_.isBoolean(item)) {
        list.push({
          name  : key,
          value : item ? true : false
        })
      }
      //................................
      // Number 
      else if(_.isNumber(item)) {
        list.push({
          name  : key,
          value : item * 1
        })
      }
      //................................
      // String
      else if(_.isString(item)) {
        list.push({
          name  : key,
          value : item + ""
        })
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : function(){
      this.evalTreeData()
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.evalTreeData()
  }
  //////////////////////////////////////////
}