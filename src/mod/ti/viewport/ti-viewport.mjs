export default {
  getters : {
    viewportMode : (state) => state.mode,
    viewportActivedComIds : (state) => state.activedIds,
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
    setActivedIds(state, activedIds=[]) {
      //console.log("viewport setActivedIds", activedIds)
      state.activedIds = _.cloneDeep(activedIds)
    }
  }
}