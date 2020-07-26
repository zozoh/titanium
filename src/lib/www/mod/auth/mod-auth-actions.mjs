const _M = {
  //--------------------------------------------
  async doCheckMe({commit, dispatch, getters, rootState}, {
    force = false,
    ok, fail, nophone, noemail
  }={}) {
    console.log("I am doCheckMe", {force, ok, fail, nophone})
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
          return await dispatch("doAction", [nophone,reo], {root:true})
        }
      }
      // Check Phone
      if(noemail) {
        let me = reo.data.me
        if(!me.email) {
          return await dispatch("doAction", [noemail,reo], {root:true})
        }
      }

      // Success
      if(ok) {
        return await dispatch("doAction", [ok,reo], {root:true})
      }
    }
    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // Fail
    else if(fail){
      return await dispatch("doAction", [fail,reo], {root:true})
    }
    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  },
  //--------------------------------------------
  async autoCheckmeOrAuthByWxghCode({dispatch}, {
    codeKey = "code",
    codeTypeBy = "ct",
    force = false,
    fail, nophone, noemail
  }={}) {
    console.log("autoCheckmeOrAuthByWxghCode")
    dispatch("doCheckMe", {
      force,
      fail : {
        action : "auth/authByWxghCode",
        payload : {
          codeKey, codeTypeBy,
          //......................................
          fail,
          //......................................
          ok : async (reo={})=>{
            let me = reo.data
            console.log("autoCheckmeOrAuthByWxghCode->ok:me", me)
            if(nophone) {
              if(!me.phone) {
                return await dispatch("doAction", [nophone,reo], {root:true})
              }
            }
            if(noemail) {
              if(!me.email) {
                return await dispatch("doAction", [noemail,reo], {root:true})
              }
            }
          }
          //......................................
        }
      }
    })
  },
  //--------------------------------------------
  async authByWxghCode({commit, dispatch, getters, rootState}, {
    codeKey = "code",
    codeTypeBy = "ct",
    done, ok, fail, invalid, others
  }={}) {
    // Guard code
    let code = rootState.page.params[codeKey]
    if(!code) {
      return
    }

    let codeType = rootState.page.params[codeTypeBy]

    console.log("authByWxghCode", {codeType, code})

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
      code : code,
      ct   : codeType
    }

    let reo = await Ti.Http.get(url, {params, as:"json"})
    console.log(reo)

    // Callback: done
    await dispatch("doAction", [done, reo], {root:true})

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
      await dispatch("doAction", [ok, reo], {root:true})
    }
    // Fail 
    else {
      // Fail : invalid
      if(/^e.www.login.invalid/.test(reo.errCode)) {
        await dispatch("doAction", [invalid, reo], {root:true})
      }
      // Fail : others
      else {
        await dispatch("doAction", [others, reo], {root:true})
      }
      // Callback
      await dispatch("doAction", [fail, reo], {root:true})
    }
  },
  //--------------------------------------------
  async doAuth({commit, dispatch, getters, rootState}, {
    type="login_by_passwd",
    name, passwd,
    done, ok, fail, noexist, invalid, others
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
      "login_by_email"  : "vcode",
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
      ticket,
      ajax: true
    }

    // Call Remote
    let reo = await Ti.Http.post(url, {params, as:"json"})
    console.log(reo)

    // Callback: done
    await dispatch("doAction", [done, reo], {root:true})

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
      await dispatch("doAction", [ok, reo], {root:true})
    }
    // Fail 
    else {
      // Fail : noexist
      if("e.www.login.noexists" == reo.errCode) {
        await dispatch("doAction", [noexist, reo], {root:true})
      }
      // Fail : invalid
      else if(/^e.www.login.invalid/.test(reo.errCode)) {
        await dispatch("doAction", [invalid, reo], {root:true})
      }
      // Fail : others
      else {
        await dispatch("doAction", [others, reo], {root:true})
      }
      // Callback
      await dispatch("doAction", [fail, reo], {root:true})
    }
  },
  //--------------------------------------------
  async doGetVcode({getters, dispatch, rootState}, {
    type="login_by_phone",
    scene="auth",
    account, captcha,
    done, ok, fail, error
  }={}) {
    console.log("getVcode", {type,scene, account, captcha})

    // Guard SiteId
    let siteId = rootState.siteId
    if(!siteId) {
      Ti.Alert("Without siteId!!!")
      return
    }

    // Eval URL
    let api = ({
      "login_by_phone" : "get_sms_vcode",
      "login_by_email" : "get_email_vcode",
      "bind_phone"     : "get_sms_vcode",
      "bind_email"     : "get_email_vcode",
      "phone"          : "get_sms_vcode",
      "email"          : "get_email_vcode"
    })[type]
    let url = getters.urls[api]

    if(!api || !url) {
      return await Ti.Toast.Open(`Invalid type: ${type}`, "error");
    }

    // Prepare params
    let params = {
      site : siteId,
      scene, account, captcha
    }

    // Call Remote
    let reo;
    try{
      reo = await Ti.Http.get(url, {params, as:"json"})
      //console.log(reo)

      // Success
      if(reo.ok && reo.data) {
        await dispatch("doAction", [ok, reo], {root:true})
      }
      // Fail 
      else {
        await dispatch("doAction", [fail, reo], {root:true})
      }
    }
    // Error
    catch(err) {
      reo = err
      // Customized error handling
      if(error) {
        await dispatch("doAction", [error, err], {root:true})
      } else {
        await Ti.Alert(err.responseText, "error");
      }
    }
    // Done
    finally {
      // Callback: done
      await dispatch("doAction", [done, reo], {root:true})
    }
  },
  //--------------------------------------------
  async doResetPasswd({getters, dispatch, rootState}, {
    scene="resetpasswd",
    account, vcode, newpwd, oldpwd,
    done, ok, fail
  }={}) {
    console.log("doResetPasswd", {scene, account, vcode, newpwd, oldpwd})

    // Guard SiteId
    let siteId = rootState.siteId
    if(!siteId) {
      Ti.Alert("Without siteId!!!")
      return
    }

    // Guard Ticket
    let ticket = rootState.auth.ticket
    let me =  rootState.auth.me
    if(!me) {
      Ti.Alert("Without Login!!!")
      return
    }

    // Eval URL
    let url = getters.urls.resetpasswd

    if(!url) {
      console.error("doResetPasswd url is nil")
      return
    }

    // Prepare params
    let params = {
      site : siteId,
      ticket
    }
    let body = {
      account, vcode, newpwd, oldpwd,
    }

    // Call Remote
    let reo = await Ti.Http.post(url, {
      params, 
      body: JSON.stringify(body),
      as:"json"
    }).catch(({responseText})=>{
      return {ok:false, errCode:_.trim(responseText)}
    })
    //console.log(reo)

    // Callback: done
    await dispatch("doAction", [done, reo], {root:true})

    // Success
    if(reo.ok) {
      await dispatch("doAction", [ok, reo], {root:true})
    }
    // Fail 
    else {
      await dispatch("doAction", [fail, reo], {root:true})
    }
  },
  //--------------------------------------------
  async doLogout({state, commit, dispatch, getters, rootState}, {
    done, ok, fail
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
      dispatch("invokeAction", fail, {root:true})
      return
    }

    // Eval URL
    let url = getters.urls["logout"]
    let params = {
      site   : siteId,
      ticket : state.ticket
    }

    commit("setLoading", {text:"i18n:logout-ing"}, {root:true})

    // Call Remote
    let reo = await Ti.Http.get(url, {params, as:"json"})
    console.log(reo)

    commit("setTicket", null)
    commit("setExpi",   0)
    commit("setMe",     null)

    commit("setLoading", false, {root:true})

    // Callback: done
    await dispatch("doAction", [done, reo], {root:true})

    // Success
    if(reo.ok) {
      dispatch("doAction", [ok, reo], {root:true})
    }
    // Fail 
    else {
      dispatch("doAction", [fail, reo], {root:true})
    }
  }
  //--------------------------------------------
}
export default _M;