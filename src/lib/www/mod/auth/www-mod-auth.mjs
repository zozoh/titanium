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
      console.log("base is", base)
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
      console.log(" -urls", getters.urls)
      // Guard SiteId
      let siteId  = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Get Back the Ticket
      let ticket = Ti.Storage.session.getString(`www-ticket-${siteId}`, "")

      // Check to remote
      commit("setLoading", true, {root:true})
      // Current Session ...
      let reo = getters.sessionState
      // Need to re-checkme from remote
      if(force || !reo.ok) {
        reo = await Ti.Http.get(getters.urls["checkme"], {
          params : {
            site : siteId,
            ticket 
          },
          as : "json"
        })
      }
      commit("setLoading", false, {root:true})
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
    async doAuth({state, commit, dispatch, getters, rootState}, {
      type="login_by_passwd",
      name, passwd,
      before=_.identity, 
      ok=_.identity, 
      fail=_.identity, 
      noexist=_.identity, 
      invalid=_.identity, 
      others=_.identity, 
      done=_.identity
    }={}) {
      console.log("doAuth", name, passwd)

      // Guard SiteId
      let siteId = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Eval URL
      let url = getters.urls[type]

      // Prepare params
      let ticket = Ti.Storage.session.getString(`www-ticket-${siteId}`, "")
      let passKey = ({
        "login_by_passwd" : "passwd",
        "login_by_vcode"  : "vcode",
        "bind_account"    : "vcode"
      })[type]
      let params = {
        site : siteId,
        name, 
        passwd : passwd,
        ticket
      }

      // Call Remote
      let reo = await Ti.Http.post(url, {params, as:"json"})
      console.log(reo)

      before(reo)

      // Success
      if(reo.ok && reo.data) {
        // save ticket
        Ti.Storage.session.set(
          `www-ticket-${siteId}`,
          reo.data.ticket
        )
        // Callback
        ok(reo.data)
      }
      // Fail 
      else {
        // Fail : noexist
        if("e.www.login.noexists" == reo.errCode) {
          noexist(reo)
        }
        // Fail : invalid
        else if("e.www.login.invalid.passwd" == reo.errCode) {
          invalid(reo)
        }
        // Fail : others
        else {
          others(reo)
        }
        // Callback
        fail(reo)
      }

      // Done
      done(reo)
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}