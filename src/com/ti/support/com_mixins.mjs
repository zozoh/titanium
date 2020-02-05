export default {
  //////////////////////////////////////////
  computed :{
    // Auto PageMode
    ...Vuex.mapGetters("viewport", [
      "viewportMode", 
      "viewportCurrentComponentId",
      "isViewportModeDesktop", 
      "isViewportModeTablet", 
      "isViewportModePhone",
      "isViewportModeDesktopOrTablet", 
      "isViewportModePhoneOrTablet"
    ]),
    isActived() {
      return this._uid === this.viewportCurrentComponentId
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