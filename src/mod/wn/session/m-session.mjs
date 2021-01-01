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
    },
    setEnvs(state, envs) {
      state.envs = envs
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
      
      //console.log(pwd)
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
    async updateMyVars({commit}, vars={}) {
      let cmds = []
      _.forEach(vars, (v, k)=>{
        cmds.push(`me -set '${k}=${v}'`)
      })
      if(_.isEmpty(cmds))
        return 
      
      // Do update
      let cmdText = cmds.join(";\n");
      await Wn.Sys.exec(cmdText)

      // Update envs
      let envs = Wn.Session.env()
      commit("setEnvs", envs)
    },
    //--------------------------------------------
    async reload({commit}) {
      let reo = await Wn.Sys.exec('session', {as:"json"})
      commit("set", reo)
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
////////////////////////////////////////////////