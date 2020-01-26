export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    theTreeData : []
  }),
  //////////////////////////////////////////
  props : {
    "className" : null,
    "data" : null,
    "border" : {
      type : String,
      default : "cell",
      validator : v => /^(row|column|cell|none)$/.test(v)
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    theTreeDisplay() {
      return "name"
    },
    //--------------------------------------
    theTreeFields() {
      return [{
        title : "i18n:value",
        display : {
          key : "value",
          comType : "ti-obj-json-value",
          comConf : {
          }
        }
      }]
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalTreeData() {
      console.log("haha")
      let list = []
      // Join the top data
      this.joinTreeTableRow(list, this.data)
      // Set the data
      this.theTreeData = list
    },
    //--------------------------------------
    getJsValueType(val) {
      if(Ti.Util.isNil(val))
        return "Nil"

      if(_.isArray(val))
        return "Array"
      
      if(_.isNumber(val)) {
        if(val === parseInt(val)) {
          return "Integer"
        }
        return "Float"
      }

      return _.upperFirst(typeof val)
    },
    //--------------------------------------
    joinTreeTableRow(list=[], item, key) {
      let nameType;
      let valueType = this.getJsValueType(item)
      // Default itemKey is self-type
      // For top leval
      if(_.isUndefined(key)) {
          key = valueType
          nameType = "Label"
      }
      // Index key
      else if(_.isNumber(key)) {
        nameType = "Index"
      }
      // String key
      else {
        nameType = "Key"
      }
      //................................
      // undefined
      if(_.isUndefined(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : undefined
        })
      }
      //................................
      // null
      else if(_.isNull(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : null
        })
      }
      //................................
      // Array
      if(_.isArray(item)) {
        // Create self
        let node = {
          nameType, valueType: "Label",
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
          nameType, valueType: "Label",
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
          nameType, valueType,
          name  : key,
          value : item ? true : false
        })
      }
      //................................
      // Number 
      else if(_.isNumber(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : item * 1
        })
      }
      //................................
      // String
      else if(_.isString(item)) {
        list.push({
          nameType, valueType,
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