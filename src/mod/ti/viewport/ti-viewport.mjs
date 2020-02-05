export default {
  getters : {
    viewportMode : (state) => state.mode,
    viewportCurrentComponentId : (state) => state.current,
    isViewportModeDesktop : (state)=> "desktop" == state.mode,
    isViewportModeTablet  : (state)=> "tablet" == state.mode,
    isViewportModePhone   : (state)=> "phone" == state.mode,
    isViewportModeDesktopOrTablet : (state)=> 
      ("desktop" == state.mode || "tablet" == state.mode),
    isViewportModePhoneOrTablet : (state)=> 
      ("phone" == state.mode || "tablet" == state.mode)
  },
  mutations : {
    setMode(state, mode="desktop") {
      state.mode = mode
    },
    setCurrent(state, currentVmId) {
      state.current = currentVmId
    }
  }
}