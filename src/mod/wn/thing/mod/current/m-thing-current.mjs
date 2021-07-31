const _M = {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //--------------------------------------------
    assignMeta(state, meta) {
      state.meta = _.assign({}, state.meta, meta);
    },
    //--------------------------------------------
    mergeMeta(state, meta) {
      state.meta = _.merge({}, state.meta, meta);
    },
    //----------------------------------------
    setThingSetId(state, thingSetId) {
      state.thingSetId = thingSetId
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
        state.__saved_content = null
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
            try{
              state.data = JSON.parse(content)
            } catch(E) {
              state.data = null
            }
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
      if(Ti.Util.isNil(state.content) && Ti.Util.isNil(state.__saved_content)) {
        state.status.changed = false
      } else {
        state.status.changed = !_.isEqual(state.content, state.__saved_content)
      }
    },
    //----------------------------------------
    setFieldStatus(state, {name, type, text}={}) {
      if(name){
        let ukey = _.concat(name).join("-")
        Vue.set(state.fieldStatus, ukey, {type, text})
      }
    },
    //----------------------------------------
    clearFieldStatus(state, names=[]) {
      // Clean All
      if(_.isEmpty(names)) {
        state.fieldStatus = {}
      }
      // Clear one
      else {
        state.fieldStatus = _.omit(state.fieldStatus, names)
      }
    },
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
export default _M;