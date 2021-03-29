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
      ("phone" == state.mode || "tablet" == state.mode),
    isExposeHidden : (state)=> state.exposeHidden,
  },
  mutations : {
    setMode(state, mode="desktop") {
      state.mode = mode
    },
    setActivedIds(state, activedIds=[]) {
      //console.log("viewport setActivedIds", activedIds)
      state.activedIds = _.cloneDeep(activedIds)
    },
    setExposeHidden(state, exposeHidden) {
      //console.log("viewport setActivedIds", activedIds)
      state.exposeHidden = exposeHidden
    }
  },
  actions : {
    toggleExposeHidden({state, commit}) {
      commit("setExposeHidden", !state.exposeHidden)
      if(state.keeyHiddenBy) {
        Ti.Storage.session.set(state.keeyHiddenBy, state.exposeHidden)
      }
    },
    reload({state, commit}) {
      if(state.keeyHiddenBy) {
        let eh = Ti.Storage.session.getBoolean(state.keeyHiddenBy)
        commit("setExposeHidden", eh)
      }
    }
  }
}