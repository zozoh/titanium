const _M = {
  ////////////////////////////////////////////////
  getters : {
    //--------------------------------------------
    hasSession(state) {
      return !_.isEmpty(state.ticket)
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
    urls(state, getters, rootState, rootGetters) {
      let map = {}
      _.forEach(state.paths, (ph, key)=>{
        map[key] = rootGetters.getApiUrl(ph)
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
      // Auto deal with Two-Stage-ID
      if(me && me.id) {
        me.OID = Ti.Types.parseTowStageID(me.id)
      }
      // Update state
      state.me = me
    },
    //--------------------------------------------
    setPaths(state, paths) {
      _.assign(state.paths, paths)
    },
    //--------------------------------------------
    mergePaths(state, paths) {
      _.merge(state.paths, paths)
    },
    //--------------------------------------------
    setAddresses(state, addresses) {
      state.addresses = addresses
      // Get default address
      if(_.isArray(addresses)) {
        let dfta = null
        for(let addr of addresses) {
          if(addr.dftaddr) {
            dfta = addr
            break
          }
        }
        state.defaultAddr = dfta
      }
    },
    //--------------------------------------------
    setCountries(state, countries) {
      state.countries = countries
      let map = {}
      _.forEach(countries, it=> {
        map[it.key] = it.name
      })
      state.countryMap = map
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
export default _M;