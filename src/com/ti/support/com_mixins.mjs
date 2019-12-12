export default {
  //////////////////////////////////////////
  computed :{
    // Auto PageMode
    ...Vuex.mapGetters("viewport", [
      "viewportMode", 
      "isViewportModeDesktop", 
      "isViewportModeTablet", 
      "isViewportModePhone",
      "isViewportModeDesktopOrTablet", 
      "isViewportModePhoneOrTablet"
    ])
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
  }
  //////////////////////////////////////////
}