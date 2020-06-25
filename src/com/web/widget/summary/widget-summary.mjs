export default {
  /////////////////////////////////////////
  props : {
    "title": {
      type: String,
      default: undefined
    },
    "items" : {
      type : Array,
      default : ()=>[]
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------
    TheItems() {
      let list = []
      _.forEach(this.items, (it, index)=>{
        list.push({
          key: `it-${index}`,
          index,
          icon: it.icon,
          title: it.title,
          value: it.value || 0
        })
      })
      return list
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}