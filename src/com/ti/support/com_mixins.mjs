export default {
  //////////////////////////////////////////
  computed :{
    // Auto PageMode
    ...Vuex.mapGetters("page", [
      "pageMode", 
      "isPageModeDesktop", 
      "isPageModeTablet", 
      "isPageModePhone",
      "isPageModeDesktopOrTablet", 
      "isPageModePhoneOrTablet"
    ])
  },
  //////////////////////////////////////////
  created : function(){
    if(!this.hijackEmit) {
      if(this.$parent && _.isFunction(this.$parent.hijackEmit)) {
        this.$emit = (name, ...args) => {
          this.$parent.hijackEmit(name, args)
        }
      }
    }
  }
  //////////////////////////////////////////
}