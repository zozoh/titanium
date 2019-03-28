export default {
  props : {
    icon  : {type:[String,Object], default:null},
    title : {type:String, default:null},
    path  : {type:String, default:null},
    view  : {type:String, default:null},
    items : {
      type : Array,
      default : ()=>[]
    }
  },
  computed : {
    itemIcon() {
      let icon = this.icon
      if(_.isString(icon)){
        return icon
      }
      return Ti.Icons.get(icon)
    }
  },
  methods : {}
}