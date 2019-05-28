//////////////////////////////////////////
export default {
  computed :{
    ...Vuex.mapGetters("page", [
      "pageMode", 
      "isPageModeDesktop", 
      "isPageModeTablet", 
      "isPageModePhone",
      "isPageModeDesktopOrTablet", 
      "isPageModePhoneOrTablet"
    ])
  }
}