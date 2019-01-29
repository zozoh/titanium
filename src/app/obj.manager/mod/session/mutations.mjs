export default {
  set(state, sess) {
    state.id = sess.id
    state.me = sess.me
    state.grp = sess.grp
    state.du = sess.du
    state.envs = _.cloneDeep(sess.envs)
  },
  setName(state, myName) {
    state.me = myName
  },
  setGroup(state, myGroup) {
    state.grp = myGroup
  }
}