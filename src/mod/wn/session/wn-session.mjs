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
    reload() {
      // TODO 这里需要想想，如何刷新会话，得到新票据的问题
      _.delay(()=>{
        console.log("hahah")
      }, 1000)
    }
  }
  ////////////////////////////////////////////////
}
////////////////////////////////////////////////