export default {
  get : (state) => ({
      id    : state.id,
      name  : state.me,
      group : state.grp
  })
}