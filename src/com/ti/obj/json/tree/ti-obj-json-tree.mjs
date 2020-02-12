export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    myTreeRoot : [],
    myTreeCurrentPathId : null,
    myTreeOpenedStatus : {}
  }),
  //////////////////////////////////////////
  props : {
    "className" : null,
    "data" : null,
    "mainWidth" : {
      type : [String, Number],
      default : -200
    },
    "border" : {
      type : String,
      default : "cell",
      validator : v => /^(row|column|cell|none)$/.test(v)
    },
    "keepOpenBy" : {
      type : String,
      default : null
    },
    "autoOpen" : {
      type : Boolean,
      default : false
    },
    "showRoot" : {
      type : Boolean,
      default : true
    },
    "editing" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    theTreeDisplay() {
      return {
        key : "name",
        comType : "ti-label",
        comConf : (it)=>({
          className : _.kebabCase(`is-${it.nameType}`),
          editable  : 'Key' == it.nameType,
          format : ({
              "Index" : "[${val}]",
              "Label" : "i18n:json-${val}"
            })[it.nameType]
        })
      }
    },
    //--------------------------------------
    theTreeFields() {
      return [{
        title : "i18n:value",
        display : {
          key : "value",
          ignoreNil : false,
          comType : "ti-obj-json-tree-item",
          comConf : {
            valueType   : "${valueType}",
            valuePath   : "${=rowId}",
            showActions : "${=isCurrent}"
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
      let list = []
      // Join the top data
      this.joinTreeTableRow(list, this.data)

      // Update Tree Data
      this.myTreeRoot = _.first(list)
    },
    //--------------------------------------
    getJsValueType(val) {
      if(Ti.Util.isNil(val))
        return "Nil"

      if(_.isArray(val))
        return "Array"
      
      if(_.isNumber(val)) {
        return "Number"
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
          nameType, valueType: "Array",
          name  : key,
          value : item,
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
          nameType, valueType: "Object",
          name  : key,
          value : item,
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
    },
    //--------------------------------------
    async doAdd(root={}, path=[]) {
      // Looking for the target from data
      let hie = Ti.Trees.getByPath(this.myTreeRoot, path)
      let target = _.isEmpty(path) ? root : _.get(root, path)
      let isOpened = this.myTreeOpenedStatus[path.join("/")]
      //console.log({root, path, target, hie, isOpened})
      //.....................................
      // Guard: Fail to find the target
      if(!hie) {
        return
      }
      //.....................................
      // If Opened Array
      if(isOpened && _.isArray(target)) {
        // just append the nil at tail
        target.push(null)
      }
      //.....................................
      // If Opened Object
      else if(isOpened && _.isPlainObject(target)) {
        // ask the key
        let newKey = await Ti.Prompt("i18n:json-new-key")
        if(Ti.Util.isNil(newKey)) {
          return
        }
        // and insert nil at the tail
        target[newKey] = null
      }
      //.....................................
      // Other, it must be simple value
      else if(path.length > 0){
        //...................................
        // get the parent node
        let p_ph = path.slice(0, path.length-1);
        let parent = _.isEmpty(p_ph) ? root : _.get(root, p_ph);
        let keyOrIndex = _.last(path)
        //...................................
        // Prepare the new data
        let stub;
        //...................................
        // If array, insert nil after current
        if(_.isArray(parent)) {
          stub = parent
          Ti.Util.insertToArray(parent, keyOrIndex+1, null)
        }
        //...................................
        // If Object
        else if(_.isPlainObject(parent)) {
          // ask the key
          let newKey = await Ti.Prompt("i18n:json-new-key")
          if(Ti.Util.isNil(newKey)) {
            return
          }
          // and insert nil after current path
          stub = Ti.Util.appendToObject(parent, keyOrIndex, {
            [newKey] : null
          })
        }
        //...................................
        // If root, return the stub 
        if(p_ph.length == 0) {
          return stub
        }
        // Set stub
        _.set(root, p_ph, stub)
      }
      //.....................................
      return root
    },
    //--------------------------------------
    doRemove(root={}, path=[]) {
      // Forbid to remove the top
      if(_.isEmpty(path)) {
        return
      }
      //...................................
      // get the candidate for next highlight
      let hie = Ti.Trees.getByPath(this.myTreeRoot, path)
      let can = Ti.Trees.nextCandidate(hie)
      //...................................
      // get the parent node
      let p_ph = path.slice(0, path.length-1);
      let parent = _.isEmpty(p_ph) ? root : _.get(root, p_ph);
      let keyOrIndex = _.last(path)
      //...................................
      // Prepare the new data
      let stub;
      //...................................
      // If array, insert nil after current
      if(_.isArray(parent)) {
        stub = []
        _.forEach(parent, (val, index)=>{
          if(index != keyOrIndex) {
            stub.push(val)
          }
        })
      }
      //...................................
      // If Object
      else if(_.isPlainObject(parent)) {
        stub = {}
        // and insert nil after current path
        _.forEach(parent, (val, key)=>{
          if(key != keyOrIndex) {
            stub[key] = val
          }
        })
      }
      //.....................................
      // Highlight the next
      if(can && can.node) {
        let nextPathId = _.concat(can.path, can.node.name).join("/")
        this.$nextTick(()=>{
          this.myTreeCurrentPathId = nextPathId
        })
      }
      //...................................
      // If root, return the stub 
      if(p_ph.length == 0) {
        return stub
      }
      // Set stub
      _.set(root, p_ph, stub)
      //.....................................
      return root
    },
    //--------------------------------------
    doChangeValueType(root={}, path=[], type) {
      // Get the source
      let isRoot = _.isEmpty(path);
      let src = isRoot ? root : _.get(root, path)
      //.....................................
      // Prepare converter
      let convert = ({
        //...................................
        "Boolean" : (src)=>{
          return src ? true : false
        },
        //...................................
        "Number" : (src)=>{
          let nb = src * 1
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "Integer" : (src)=>{
          let nb = parseInt(src)
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "Float" : (src)=>{
          let nb = src * 1
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "String" : (src)=>{
          // Array/Object
          if(_.isArray(src) || _.isObject(src)) {
            return JSON.stringify(src)
          }
          // Other value
          return src + ""
        },
        //...................................
        "Array" : (src)=>{
          // Array
          if(_.isArray(src)) {
            return
          }
          // Nil
          else if(Ti.Util.isNil(src)) {
            return []
          }
          // Wrap to array
          else {
            return [src]
          }
        },
        //...................................
        "Object" : (src)=>{
          // Array
          if(_.isArray(src)) {
            // Try array as pairs
            let pairs = _.fromPairs(src)
            let stub = {}
            _.forEach(pairs, (val, key)=>{
              if(!Ti.Util.isNil(key) && !_.isUndefined(val)) {
                stub[key] = val
              }
            })
            // Maybe merget it 
            if(_.isEmpty(stub) && !_.isEmpty(src)) {
              Ti.Util.merge(stub, src)
            }
            // Whatever return the object
            return stub
          }
          // Object
          else if(_.isPlainObject(src)) {
            return
          }
          // String try to JSON
          else if(_.isString(src)) {
            return Ti.Types.safeParseJson(src, {
              "value" : src
            })
          }
          // Other value, just wrap to Object
          return {"value": src}
        },
        //...................................
        "Nil" : (src)=>{
          return null
        }
        //...................................
      })[type]
      //.....................................
      // Do convert
      if(_.isFunction(convert)) {
        let stub = convert(src)
        // Canceled
        if(_.isUndefined(stub)) {
          return
        }
        // Root object, return directly
        if(isRoot) {
          return stub
        }
        // Update to main data
        _.set(root, path, stub)
        return root
      }
      //.....................................
      // Fail to find the converter, return undeinfed to cancel
    },
    //--------------------------------------
    async onItemChanged({name, value, data, node, nodeId}={}) {
      //console.log({name,value, data, node, nodeId})
      //....................................
      // Guard it
      if(!node.id) {
        return;
      }
      //....................................
      // Prepare the new Data
      let newData = _.cloneDeep(this.data)
      //....................................
      // Get the target JSON path
      let path = node.path
      //....................................
      // Mutate JSON structure
      if(value && value.jsonMutate) {
        let fn = ({
          Add             : this.doAdd,
          Remove          : this.doRemove,
          ChangeValueType : this.doChangeValueType
        })[value.jsonMutate]
        // Invoke it
        newData = await Ti.DoInvoke(fn, _.concat([newData, path], value.args), this)

        // Canceled the mutation
        if(_.isUndefined(newData)) {
          return
        }
      }
      //....................................
      // Modify the Array/Object
      else {
        // Set the Key
        if("name" == name) {
          newData = Ti.Util.setKey(newData, path, value)
        }
        // Set the Value
        else if("value" == name) {
          // Eval the value smartly
          let fn = ({
            "Integer" : (v)=> {
              let v2 = parseInt(v)
              if(isNaN(v2)) {
                return v
              }
              return v2
            },
            "Float" : (v)=> {
              let v2 = v * 1
              if(isNaN(v2)) {
                return v
              }
              return v2
            },
            "Number" : (v)=> {
              let v2 = v * 1
              if(isNaN(v2)) {
                return v
              }
              return v2
            },
            "Nil" : (v)=> {
              return Ti.S.toJsValue(v, {
                autoDate : false
              })
            }
          })[data.valueType]
          let v2 = _.isFunction(fn) ? fn(value) : value
          
          // Set it to data
          _.set(newData, path, v2)
        }
      }
      //....................................
      // Emit the change
      this.$emit("changed", newData)
    },
    //--------------------------------------
    onOpenedStatusChanged(opened) {
      this.myTreeOpenedStatus = opened
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