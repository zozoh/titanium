export default {
  set(state, {id,me,grp,du,envs}={}) {
    _.assign(state, {id,me,grp})
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
}