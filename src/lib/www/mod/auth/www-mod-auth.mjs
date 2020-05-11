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
    async doCheckMe({state, commit, dispatch, getters, rootState}, {
      force = false,
      success, fail, nophone
    }={}) {
      console.log("I am doCheckMe", {force, success, fail, nophone})
      // console.log(" -urls", getters.urls)
      // Guard SiteId
      let siteId  = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Get Back the Ticket
      let ticket = Ti.Storage.local.getString(`www-ticket-${siteId}`, "")

      // Check to remote
      commit("setLoading", true, {root:true})
      // Current Session ...
      let reo = getters.sessionState
      // Need to re-checkme from remote
      if(ticket && (force || !reo.ok)) {
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
        commit("setTicket", reo.data.ticket)
        commit("setExpi",   reo.data.expi)
        commit("setMe",     reo.data.me)

        // Check Phone
        if(nophone) {
          let me = reo.data.me
          if(!me.phone) {
            await dispatch(nophone.action, nophone.payload, {root:true})
            return
          }
        }
        // Success
        if(success) {
          await dispatch(success.action, success.payload, {root:true})
        }
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // Fail
      else if(fail){
        await dispatch(fail.action, fail.payload, {root:true})
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    },
    //--------------------------------------------
    async autoCheckmeOrAuthByWxghCode({dispatch}, {
      codeKey = "code",
      force = false,
      fail, nophone
    }={}) {
      dispatch("doCheckMe", {
        force,
        fail : {
          action : "auth/authByWxghCode",
          payload : {
            codeKey,
            //......................................
            fail : ()=>{
              if(fail) {
                dispatch(fail.action, fail.payload, {root:true})
              }
            },
            //......................................
            ok : ({me={}}={})=>{
              if(nophone) {
                if(!me.phone) {
                  dispatch(nophone.action, nophone.payload, {root:true})
                }
              }
            }
            //......................................
          }
        }
      })
    },
    //--------------------------------------------
    async authByWxghCode({commit, getters, rootState}, {
      codeKey = "code",
      done=_.identity,
      ok=_.identity, 
      fail=_.identity, 
      invalid=_.identity, 
      others=_.identity 
    }={}) {
      // Guard code
      let code = rootState.page.params[codeKey]
      if(!code) {
        return
      }

      console.log("authByWxghCode", code)

      // Guard SiteId
      let siteId = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }
      // Eval URL
      let url = getters.urls["login_by_wxcode"]

      let params = {
        site : siteId,
        code : code
      }

      let reo = await Ti.Http.get(url, {params, as:"json"})
      console.log(reo)

      done(reo)

      // Success
      if(reo.ok && reo.data) {
        // save ticket
        Ti.Storage.local.set(
          `www-ticket-${siteId}`,
          reo.data.ticket
        )
        // Save session info
        commit("setTicket", reo.data.ticket)
        commit("setExpi",   reo.data.expi)
        commit("setMe",     reo.data.me)
        // Callback
        ok(reo.data)
      }
      // Fail 
      else {
        // Fail : invalid
        if(/^e.www.login.invalid/.test(reo.errCode)) {
          invalid(reo)
        }
        // Fail : others
        else {
          others(reo)
        }
        // Callback
        fail(reo)
      }
    },
    //--------------------------------------------
    async doAuth({commit, getters, rootState}, {
      type="login_by_passwd",
      name, passwd,
      done=_.identity,
      ok=_.identity, 
      fail=_.identity, 
      noexist=_.identity, 
      invalid=_.identity, 
      others=_.identity 
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
      let ticket = Ti.Storage.local.getString(`www-ticket-${siteId}`, "")
      let passKey = ({
        "login_by_passwd" : "passwd",
        "login_by_phone"  : "vcode",
        "bind_phone"      : "vcode",
        "bind_email"      : "vcode"
      })[type]

      if(!passKey) {
        throw "Unknown auth type: " + type
      }

      let params = {
        site : siteId,
        name, 
        [passKey] : passwd,
        ticket
      }

      // Call Remote
      let reo = await Ti.Http.post(url, {params, as:"json"})
      console.log(reo)

      done(reo)

      // Success
      if(reo.ok && reo.data) {
        // save ticket
        Ti.Storage.local.set(
          `www-ticket-${siteId}`,
          reo.data.ticket
        )
        // Commit session to local
        commit("setTicket", reo.data.ticket)
        commit("setExpi",   reo.data.expi)
        commit("setMe",     reo.data.me)
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
        else if(/^e.www.login.invalid/.test(reo.errCode)) {
          invalid(reo)
        }
        // Fail : others
        else {
          others(reo)
        }
        // Callback
        fail(reo)
      }
    },
    //--------------------------------------------
    async doGetVcode({getters, rootState}, {
      type="login_by_phone",
      scene="auth",
      account, captcha,
      done=_.identity,
      ok=_.identity, 
      fail=_.identity
    }={}) {
      console.log("getVcode", scene, account, captcha)

      // Guard SiteId
      let siteId = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Eval URL
      let api = ({
        "login_by_phone" : "get_sms_vcode",
        "bind_phone"     : "get_sms_vcode",
        "bind_email"     : "get_email_vcode"
      })[type]
      let url = getters.urls[api]

      // Prepare params
      let params = {
        site : siteId,
        scene, account, captcha
      }

      // Call Remote
      let reo = await Ti.Http.get(url, {params, as:"json"})
      console.log(reo)

      done(reo)

      // Success
      if(reo.ok && reo.data) {
        ok(reo.data)
      }
      // Fail 
      else {
        fail(reo)
      }
    },
    //--------------------------------------------
    async doLogout({commit, getters, rootState}, {
      done=_.identity,
      ok=_.identity, 
      fail=_.identity
    }={}) {
      console.log("doLogout")
      // Guard SiteId
      let siteId = rootState.siteId
      if(!siteId) {
        Ti.Alert("Without siteId!!!")
        return
      }

      // Always force remove
      Ti.Storage.local.remove(`www-ticket-${siteId}`)

      // No Session, ignore
      if(!getters.hasSession) {
        fail(getters.sessionState)
        return
      }

      // Session
      let se = getters.sessionState

      // Eval URL
      let url = getters.urls["logout"]
      let params = {
        site   : siteId,
        ticket : se.ticket
      }

      commit("setLoading", {text:"i18n:logout-ing"}, {root:true})

      // Call Remote
      let reo = await Ti.Http.post(url, {params, as:"json"})
      console.log(reo)

      commit("setTicket", null)
      commit("setExpi",   0)
      commit("setMe",     null)

      commit("setLoading", false, {root:true})

      done(reo)

      // Success
      if(reo.ok) {
        ok(reo.data)
      }
      // Fail 
      else {
        fail(reo)
      }
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
export default _M;