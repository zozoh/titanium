export default {
  ////////////////////////////////////////////////
  getters : {
    //--------------------------------------------
    hasSession(state) {
      return state.ticket 
             && state.expi > Date.now()
             && !_.isEmpty(state.me)
    },
    //--------------------------------------------
    sessionState(state, getters) {
      return {
        ok : getters.hasSession,
        data : {
          me     : state.me     || null,
          ticket : state.ticket || null,
          expi   : state.expi   || 0
        }
      }
    },
    //--------------------------------------------
    urls(state, getters, rootState) {
      let map = {}
      let base = rootState.apiBase || "/api/"
      _.forEach(state.paths, (ph, key)=>{
        let aph = Ti.Util.appendPath(base, ph)
        map[key] = aph
      })
      return map
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    setTicket(state, ticket) {
      state.ticket = ticket
    },
    //--------------------------------------------
    setExpi(state, expi) {
      state.expi = expi
    },
    //--------------------------------------------
    setMe(state, me) {
      state.me = me
    },
    //--------------------------------------------
    setPaths(state, paths) {
      _.assign(state,paths, paths)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    async checkme({state, commit, dispatch, getters, rootState}, {
      force = false,
      success, fail,
      args = []
    }={}) {
      console.log("I am doCheckme", {force, success, fail, args})
      // Current Session ...
      let reo = getters.sessionState
      // Need to re-checkme from remote
      if(force || !reo.ok) {
        reo = await Ti.Http.get(getters.urls["checkme"], {
          params : {siteId : rootState.siteId},
          as : "json"
        })
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // success
      if(reo.ok) {
        console.log("checkme OK", reo)
        dispatch(success.action, success.payload, {root:true})
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // Fail
      else if(fail){
        dispatch(fail.action, fail.payload, {root:true})
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    },
    //--------------------------------------------
    
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}