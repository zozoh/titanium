export default {
  ///////////////////////////////////////////
  data : ()=>({
    "obj" : {}
  }),
  ///////////////////////////////////////////
  props : {
    "config" : {
      type : Object,
      default : ()=>({})
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
    onChanged({name, value}={}) {
      console.log("changed", name, value)
    }
  }
  ///////////////////////////////////////////
}