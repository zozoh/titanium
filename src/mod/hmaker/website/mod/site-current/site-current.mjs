export default {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //----------------------------------------
    setContent(state, content) {
      let meta = state.meta;
      // Guard
      if(!meta || Ti.Util.isNil(content)) {
        state.content = null
        state.data = null
        state.__saved_content = null
        state.status.changed = false
        return
      }
      //......................................
      // DIR
      if("DIR" == meta.race) {
        state.content = null
        state.data = content
      }
      //......................................
      // File
      else if("FILE" == meta.race) {
        //....................................
        // String content
        if(_.isString(content)) {
          state.content = content
          // JSON
          if(Wn.Util.isMimeJson(meta.mime)) {
            state.data = JSON.parse(content)
          }
          // Pure Text
          else if(Wn.Util.isMimeText(meta.mime)) {
            state.data = null
          }
        }
        //....................................
        // Take content as plain object or Array
        else {
          state.content = JSON.stringify(content, null, '  ')
          // JSON
          if(Wn.Util.isMimeJson(meta.mime)) {
            state.data = content
          }
          // Pure Text
          else if(Wn.Util.isMimeText(meta.mime)) {
            state.data = null
          }
        }
        //....................................
      }
    },
    //----------------------------------------
    setData(state, data) {
      state.data = data
    },
    //----------------------------------------
    setSavedContent(state, content) {
      state.__saved_content = content
    },
    //----------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //----------------------------------------
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.content, state.__saved_content)
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
}