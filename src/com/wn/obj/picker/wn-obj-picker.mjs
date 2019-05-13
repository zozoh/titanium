export default {
  /////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "items" : []
  }),
  /////////////////////////////////////////
  props : {
    "empty" :{
      type : Object,
      default : ()=>({
        text  : "i18n:no-selected",
        value : undefined
      })
    },
    "value" : {
      type : [Object, String, Array],
      default : null
    },
    "base" : {
      type : [Object, String],
      default : "~"
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    // 这里思考一下，需要读取时，以及变 value 时都过一道
    // 应该声明两个属性吧
    "mapping" : {
      type : [Object, String, Function],
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    
  },
  //////////////////////////////////////////
  methods : {
    async openPicker() {
      let meta = this.value || this.base || "~"
      console.log(meta)
      let payload = await Wn.OpenObjSelector(meta, {multi:this.multi})
      this.$emit("changed", payload)
    },
    //......................................
    onRemoveItem(rmIt) {
      let payload = []
      for(let it of this.selectedItems){
        if(!_.isEqual(it.value, rmIt.value)){
          payload.push(it.value)
        }
      }
      this.$emit("changed", payload)
    },
    //......................................

    //......................................
    async tryReload() {

    },
    //......................................
    async reload() {
      
    }
    //......................................
  },
  /////////////////////////////////////////
  mounted : async function(){
    await this.tryReload()
  }
}