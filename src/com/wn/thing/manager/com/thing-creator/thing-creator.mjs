export default {
  ///////////////////////////////////////////
  data : ()=>({
    "obj" : {},
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
  computed : {
    newObj() {
      return _.assign({}, this.data, this.obj)
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
      await app.dispatch("main/create", this.newObj)

      this.$emit("block:hide", "creator")
    }
    //--------------------------------------
  }
  ///////////////////////////////////////////
}