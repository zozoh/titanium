export default {
  props : {
    "name" : {
      type : [String, Object],
      default : "--"
    },
    "group" : {
      type : String,
      default : "--"
    }
  },
  computed : {
    myName() {
      if(_.isString(this.name)) {
        return this.name;
      }
      if(_.isPlainObject(this.name)) {
        return Ti.Util.getFallback(this.name, "nickname", "nm", "id")
      }
      return "--"
    }
  }
}