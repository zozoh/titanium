const _M = {
  //--------------------------------------------
  async saveProfile({state, getters, commit, dispatch,rootState}, profile={}) {
    //console.log("profile", profile)
    // Can not update email/phone/nm through this method
    profile = _.omit(profile, "email", "phone", "nm")
    // Guard Empty
    if(_.isEmpty(profile)) {
      return
    }
    // Guard No Change
    if(_.isMatch(state.me, profile)) {
      return
    }

    // Prepare http options
    let params = {
      site : rootState.siteId,
      ticket: state.ticket
    }
    let body = JSON.stringify(profile)
    
    commit("setLoading", true, {root:true})

    // Send request
    let url = getters.urls.profile_save
    await Ti.Http.post(url, {
      params, body, as:"json"
    })

    // Then reload
    await dispatch("doCheckMe", {force:true})

    commit("setLoading", false, {root:true})

  }
  //--------------------------------------------
}
export default _M;