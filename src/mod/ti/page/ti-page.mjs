export default {
  getters : {
    pageMode : (state) => state.mode,
    isPageModeDesktop : (state)=> "desktop" == state.mode,
    isPageModeTablet  : (state)=> "tablet" == state.mode,
    isPageModePhone   : (state)=> "phone" == state.mode,
    isPageModeDesktopOrTablet : (state)=> 
      ("desktop" == state.mode || "tablet" == state.mode),
    isPageModePhoneOrTablet : (state)=> 
      ("phone" == state.mode || "tablet" == state.mode),
  },
  mutations : {
    setMode(state, mode="desktop") {
      state.mode = mode
    }
  }
}