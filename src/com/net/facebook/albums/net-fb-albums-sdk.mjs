/////////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    FBAPI(path) {
      return `https://graph.facebook.com/${this.apiVersion}/${path}`
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods: {
    //---------------------------------------------------
    ReloginFBAccount() {
      this.checkdLongLiveAccessToken(true)
    },
    //---------------------------------------------------
    async reloadLongLiveAccessToken(accessToken) {
      let url = this.FBAPI("oauth/access_token")
      let reo = await Ti.Http.get(url, {
        params: {
          "grant_type": "fb_exchange_token",
          "client_id": this.appId,
          "client_secret": this.appSecret,
          "fb_exchange_token": accessToken
        },
        as: "json"
      })
      // Grap Long live access token
      this.longLiveAccessToken = reo.access_token

      // Save to remote
      if (reo.access_token) {
        let expireAt = Date.now() + reo.expires_in * 1000
        //
        // Update file content
        //
        let jsonToken = JSON.stringify({
          userId: this.myId,
          userName: this.myName,
          scope: this.ApiScope,
          grantedScopes: this.myGrantedScopes
        })
        let cmdText = `jsonx -qn @read id:${this.meta.id} -auto @set '${jsonToken}' > id:${this.meta.id}`
        await Wn.Sys.exec2(cmdText)
        //
        // Update file meta
        //
        let akPh = `~/.xapi/facebook/${this.domain}/long_live_access_token`
        let objMeta = JSON.stringify({
          ticket: reo.access_token,
          expiAtMs: expireAt,
          expiTime: reo.expires_in,
          expiTimeUnit: "s"
        })
        // 确保文件存在
        await Wn.Sys.exec2(`touch '${akPh}'`)
        // 更新文件元数据
        cmdText = `o '${akPh}' @update`
        await Wn.Sys.exec2(cmdText, { input: objMeta })

        // Reload data
        // await Ti.App(this).dispatch("current/reload")
        // await Ti.App(this).dispatch("main/reload", this.meta)
      }
      // Error
      else {
        console.error("Fail to reloadLongLiveAccessToken", reo)
      }
    },
    //---------------------------------------------------
    checkdLongLiveAccessToken(force = false) {
      // Refresh token before a day
      let expiAt = this.tokenExpireAt - 86400000
      if (force || Date.now() > expiAt || !this.myId || !this.longLiveAccessToken) {
        FB.login(resp => {
          console.log("after login", resp)
          if (resp.authResponse) {
            let { accessToken, userID, grantedScopes } = resp.authResponse
            this.myId = this.userId || userID
            this.myGrantedScopes = grantedScopes
            FB.api('/' + this.myId, resp => {
              console.log('Good to see you, ' + resp.name + '.', resp);
              // Get Long Live Access Token
              this.myName = resp.name
              this.reloadLongLiveAccessToken(accessToken)
                .then(() => {
                  this.doLoadMoreAlbums(1, { reset: true })
                })
            });
          }
        }, {
          scope: this.ApiScope,
          return_scopes: true,
          profile_selector_ids: this.ProfileSelectorIds
        })
      }
      // Has a valid LongLiveAK
      else {
        this.doLoadMoreAlbums(1, { reset: true })
      }
    },
    //---------------------------------------------------
    async initFBSdk() {
      // load token by domain 
      let pph = `~/.xapi/facebook/${this.domain}/`
      let conf = await Wn.Sys.exec2(`cat ${pph}config.json`, { as: "json" })
      this.appId = _.get(conf, "appId")
      this.appSecret = _.get(conf, "appSecret")
      let llAK = await Wn.Io.loadMeta(`${pph}long_live_access_token`)
      //console.log(llAK)
      if (llAK) {
        this.longLiveAccessToken = llAK.ticket
        this.tokenExpiresIn = llAK.expiTime
        this.tokenExpireAt = llAK.expiAtMs
        this.tokenType = llAK.token_type || "bearer"
      }

      // INIT SDK
      FB.init({
        appId: this.appId,
        autoLogAppEvents: this.autoLogAppEvents,
        xfbml: this.xfbml,
        version: this.apiVersion
      });


      // Login
      this.checkdLongLiveAccessToken()
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}