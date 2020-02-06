export default {
  //////////////////////////////////////////
  computed :{
    // Auto PageMode
    ...Vuex.mapGetters("viewport", [
      "viewportMode", 
      "viewportActivedComIds",
      "isViewportModeDesktop", 
      "isViewportModeTablet", 
      "isViewportModePhone",
      "isViewportModeDesktopOrTablet", 
      "isViewportModePhoneOrTablet"
    ]),
    // Auto count my useful id path array
    myIdPathArray() {
      let list = [this._uid]
      let vm = this.$parent
      while(vm) {
        // Only the `v-ti-actived` marked Com join the parent paths
        if(vm.$el.getAttribute("ti-actived")) {
          list.push(vm._uid)
        }
        // Look up
        vm = vm.$parent
      }
      return list.reverse()
    },
    // Auto detected current com is actived or not.
    isActived() {
      return _.indexOf(this.viewportActivedComIds, this._uid) >= 0
    }
  },
  //////////////////////////////////////////
  created : async function(){
    // Hijack the emit by $parent
    if(!this.hijackEmit) {
      if(this.$parent 
        && this.$parent.hijackable
        && _.isFunction(this.$parent.hijackEmit)) {
        const __old_emit = this.$emit
        this.$emit = async (name, ...args) => {
          //await __old_emit.apply(this, [name, ...args])
          // Ignore the VueDevTool Event
          if(/^hook:/.test(name)) {
            return
          }
          // Do emit hijacking
          await this.$parent.hijackEmit(name, args)
        }
      }
    }
    // Auto mark self as actived Component in App
    this.__set_actived = ()=>{
      Ti.App(this).setActivedVm(this)
      this.$emit("actived", this)
    }
  },
  //////////////////////////////////////////
  destroyed : function(){
    if(Ti.App(this).setBlurredVm(this)) {
      this.$emit("blurred", this)
    }
  }
  //////////////////////////////////////////
}