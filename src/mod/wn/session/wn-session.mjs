export default {
  getters : {
    get : (state) => ({
        name  : state.me,
        group : state.grp
    })
  },
  mutations : {
    set(state, {
      id,me,grp,du,envs
    }={}) {
      Ti.Util.setTo(state, {id,me,grp}, null)
      if(envs)
        state.envs = _.cloneDeep(envs)
    },
    reset(state) {
      _.assign(state, {
        "id": null,
        "me": null,
        "grp": null,
        "du": -1,
        "envs": {}
      })
    }
  },
  actions : {
    reload() {
      _.delay(()=>{
        console.log("hahah")
      }, 1000)
    }
  }
}