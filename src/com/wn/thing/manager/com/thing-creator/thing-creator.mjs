export default {
  ///////////////////////////////////////////
  data : ()=>({
    "myData" : {},
    "creating" : false
  }),
  ///////////////////////////////////////////
  props : {
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "data" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    onChanged({name, value}={}) {
      //console.log("changed", name, value)
      this.obj = _.assign({}, this.obj, {[name]: value})
    },
    //--------------------------------------
    async onCreate() {
      this.creating = true

      let app = Ti.App(this)
      await app.dispatch("main/create", this.myData)

      this.$emit("block:hide", "creator")
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch : {
    "data": {
      handler : function(){
        this.myData = _.assign({}, this.data)
      },
      immediate : true
    }
  }
  ///////////////////////////////////////////
}