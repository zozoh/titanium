export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    
  }),
  ///////////////////////////////////////////////////
  props : {
    "idKey" : {
      type : String,
      default : "id"
    },
    "className" : {
      type : String,
      default : null
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "changedId" : {
      type : String,
      default : null
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Object,
      default : ()=>({})
    },
    "transformer" : {
      type : Function,
      default : null
    },
    "comType" : {
      type : String,
      default : "ti-label"
    },
    "comConf" : {
      type : Object,
      default : ()=>({
        value : "=formedData"
      })
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      let itId = this.data[this.idKey]
      let klass = []
      if(this.className) {
        klass.push(this.className)
      }
      if(this.checkedIds && this.checkedIds[itId]) {
        klass.push("is-selected")
      }
      if(this.currentId && this.currentId == itId) {
        klass.push("is-current")
      }
      if(this.changedId && this.changedId == itIds) {
        klass.push("is-changed")
      }
      if(!_.isEmpty(klass))
        return klass.join(" ")
    },
    //-----------------------------------------------
    formedData() {
      if(_.isFunction(this.transformer))
        return this.transformer(this.data)
      return this.data
    },
    //-----------------------------------------------
    formedComConf() {
      return Ti.Util.explainObj(this, this.comConf)
    },
    //-----------------------------------------------
    tileKey() {
      let list = []
      for(let it of this.displayItems) {
        list.push(it.uniqueKey)
      }
      return list.join("+")
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    
  }
  ///////////////////////////////////////////////////
}