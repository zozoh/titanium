export default {
  get(state) {
    return {
      id : state.id,
      name : state.me,
      group : state.grp
    }
  },
  getMyId(state) {
    return state.id
  },
  getMyName(state) {
    return state.me
  },
  getMyGroup(state) {
    return state.grp
  },
  getMyEnvs(state) {
    return state.envs
  },
  getEnv(state) {
    return (varName)=>state.envs[varName]
  }
}