//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    setHome(state, meta) {
      state.meta = meta
    },
    setSchema(state, schema) {
      state.schema = schema
    },
    setLayout(state, layout) {
      state.layout = layout
    },
    setActions(state, actions) {
      state.actions = actions
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    setSearchFilter(state, filter) {
      state.search.filter = filter
    },
    setSearchSorter(state, sorter) {
      state.search.sorter = sorter
    },
    setSearchPager(state, pager) {
      state.search.pager = pager
    },
    setSearchList(state, list) {
      state.search.list = list
    },
    setIndexMeta(state, meta) {
      state.index.meta = meta
    },
    setIndexContent(state, content) {
      state.index.content = content
    },
    setIndexSavedContent(state, content) {
      state.index.__saved_content = content
    },
    setIndexContentTypet(state, contentType) {
      state.index.contentType = contentType
    },
    setIndexStatus(state, status) {
      state.index.status = _.assign({}, state.index.status, status)
    },
    setFiles(state, {dir="media", payload={}}={}) {
      if(_.isUndefined(state.files[dir])) {
        state.files[dir] = {}
      }
      _.assign(state.files[dir], payload)
    }
  }
  ////////////////////////////////////////////
}