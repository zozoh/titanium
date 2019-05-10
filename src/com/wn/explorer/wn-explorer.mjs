export default {
  //////////////////////////////////////////////
  props : {
    "loading" : {
      type : Boolean,
      default : false
    },
    "noTitle" : {
      type : Boolean,
      default : false
    },
    "meta" :{
      type : Object,
      default : ()=>({})
    },
    "ancestors" : {
      type : Array,
      default : ()=>[]
    },
    "children" : {
      type : Array,
      default : ()=>[]
    },
    "status" : {
      type : Object,
      default : ()=>({
        changed : false
      })
    }
  },
  //////////////////////////////////////////////
  computed : {
    show() {
      let re = {
        logo   : this.$slots.logo   ? true : false,
        action : this.$slots.action ? true : false,
        aside  : this.$slots.aside  ? true : false,
        footer : this.$slots.footer ? true : false,
      }
      re.sky = !this.noTitle && re.logo && re.action
      return re
    },
    topClass() {
      return {
        "no-sky"    : !this.show.sky,
        "no-aside"  : !this.show.aside,
        "no-footer" : !this.show.footer,
      }
    }
  },
  //////////////////////////////////////////////
  methods : {
    //.........................................
    getObjTitle(meta) {
      let title = meta.title || meta.nm
      return Ti.I18n.text(title)
    },
    //.........................................
    getObjLink(meta) {
      return Wn.Util.getAppLink(meta).toString()
    },
  },
  //////////////////////////////////////////////
  mounted : function() {
    // console.log(this.$slots)
  }
}