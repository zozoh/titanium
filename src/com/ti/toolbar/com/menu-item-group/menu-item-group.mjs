import {fireable} from "../../menu-items-support.mjs"
//---------------------------------------
export default {
  ///////////////////////////////////////
  data : ()=>({
    isOpened : false
  }),
  ///////////////////////////////////////
  props : fireable.Props({
    items : {
      type : Array,
      default : ()=>[]
    }
  }),
  ///////////////////////////////////////
  watch : {
    isOpened(newVal, oldVal) {
      if(newVal) {
        this.$nextTick(()=>{
          // Top Sub-menu, dock to H
          // Else dock to V
          Ti.Dom.dockTo(this.$refs.sub, this.$el, {
            mode : this.isTop ? "H" : "V",
            position : "fixed",
            space: this.isTop ? {y:3} : {x:1}
          })
        })
      } // ~ if(newVal)
      // Clean
      else {
        Ti.Dom.setStyle(this.$refs.sub, {
          position:"", top:"", left:"",
          width:"", height:""
        })
      }
    }
  },
  ///////////////////////////////////////
  computed : fireable.Computed(
    (vm)=>vm.isOpened, {
      classObject() {
        let re = {}
        re.top = this.isTop ? "is-top" : "is-sub"
        re.groupCon = this.isOpened
                        ? "is-group-open"
                        : "is-group-closed"
        return re;
      },
      itemsHasIcon() {
        for(let it of this.items){
          if(it.icon) {
            return true
          }
          if(it.altDisplay && it.altDisplay.icon){
            return true
          }
        }
        return false
      }
    }
  ),
  ///////////////////////////////////////
  methods : {
    showChildren() {
      this.isOpened = true
    },
    hideChildren() {
      this.isOpened = false
    },
    onMouseEnter() {
      if(!this.isTop) {
        this.isOpened = true
      }
    },
    onMouseLeave() {
      if(!this.isTop) {
        this.isOpened = false
      }
    }
  }
  ///////////////////////////////////////
}