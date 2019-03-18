import {fireable} from "../../support/ti-menu-items.mjs"
//---------------------------------------
export default {
  data : ()=>({
    isOpened : false
  }),
  props : fireable.Props({
    items : {
      type : Array,
      default : ()=>[]
    }
  }),
  computed : fireable.Computed(
    (vm)=>vm.isOpened, {
      classObject() {
        let re = {}
        re.groupCon = this.isOpened
                        ? "mi-group-open"
                        : "mi-group-closed"
        return re;
      }
    }
  ),
  methods : {
    toggleChildren() {
      this.isOpened = !this.isOpened
    }
  },
  watch : {
    isOpened(newVal, oldVal) {
      if(newVal) {
        this.$nextTick(()=>{
          Ti.Dom.dockTo(this.$refs.sub, this.$el, {
            mode : "H",
            position : "fixed"
          })
        })
      } // ~ if(newVal)
    }
  }
}