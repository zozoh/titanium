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
    async OnCreate() {
      this.creating = true

      let app = Ti.App(this)
      await app.dispatch("main/create", this.myData)

      this.$notify("block:hide", "creator")
    },
    //--------------------------------------
    async OnSubmit() {
      this.$nextTick(()=>{
        this.OnCreate()
      })
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