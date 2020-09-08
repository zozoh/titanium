////////////////////////////////////////////////
export default {
  getters : {
    get(state){return state}
  },
  ////////////////////////////////////////////////
  mutations : {
    set(state, session={}) {
      state.id     = session.id;
      state.grp    = session.grp;
      state.du     = session.du;
      state.expi   = session.expi;
      state.pwd    = session.pwd;
      state.ticket = session.ticket;
      state.uid    = session.uid;
      state.unm    = session.unm;
      state.me     = session.me;
      state.envs   = _.cloneDeep(session.envs);
    }
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    async openResetPasswd({dispatch}) {
      await Ti.App.Open({
        icon  : "fas-key",
        title : "i18n:my-passwd",
        position : "top",
        width  : 480,
        height : 640,
        textOk : null, textCancel : null,
        comType : "WebAuthPasswd",
        comConf : {
          allowModes: {
            "passwd" : true
          }
        },
        events : {
          "passwd:reset" : (payload)=> {
            console.log("passwd:reset", payload)
            dispatch("resetPasswd", payload)
          }
        },
        components : "@com:web/auth/passwd"
      })
    },
    //--------------------------------------------
    // pwd = {newpwd, oldpwd, done}
    async resetPasswd({}, pwd) {
      // User Cancels
      if(!pwd)
        return
      
      console.log(pwd)
      // Reset By old password
      if("passwd" == pwd.mode) {
        let cmdText = `passwd '${pwd.newpwd}' -old '${pwd.oldpwd}'`
        let doneRe = {ok: true}
        await Wn.Sys.exec(cmdText,  {
          errorBy : ({code}) => {
            doneRe.ok = false
            doneRe.errCode = code
          }
        })
        // Callback to show reset status
        pwd.done(doneRe)
      }
      // Not support for now
      else {
        throw  "Unsupport passwd-reset mode: " + pwd.mode
      }

    },
    //--------------------------------------------
    reload() {
      // TODO 这里需要想想，如何刷新会话，得到新票据的问题
      _.delay(()=>{
        console.log("hahah")
      }, 1000)
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
////////////////////////////////////////////////