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
    setContent(state, content) {
      let meta = state.meta;
      //console.log("setContent", content)
      // Guard
      if(!meta || _.isUndefined(content)) {
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
        // null value
        else if(Ti.Util.isNil(content)) {
          state.content = ""
          state.data = null
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
    setDataItem(state, newItem) {
      console.log("setDataItem:", newItem)
      // Guard
      if(!newItem || !newItem.id)
        return

      let data = state.data

      // Update pager list item of data
      if(_.isArray(data.list) && data.pager) {
        let list = _.cloneDeep(data.list)
        list = _.map(list, li => {
          if(li.id == newItem.id) {
            return newItem
          }
          return li
        })
        state.data = {
          list,
          pager : data.pager
        }
      }
    },
    //----------------------------------------
    setSavedContent(state, content) {
      state.__saved_content = content
    },
    //----------------------------------------
    setFilter(state, filter) {
      state.filter = _.cloneDeep(filter)
    },
    //----------------------------------------
    setSorter(state, sorter) {
      state.sorter = _.cloneDeep(sorter)
    },
    //----------------------------------------
    setPager(state, {pageNumber, pageSize}={}) {
      if(_.isNumber(pageNumber)) {
        state.pageNumber =  pageNumber
      }
      if(_.isNumber(pageSize)) {
        state.pageSize =  pageSize
      }
    },
    //----------------------------------------
    setPagerNumber(state, pageNumber=1) {
      state.pageNumber =  pageNumber
    },
    //----------------------------------------
    setPageSize(state, pageSize=100) {
      state.pageSize =  pageSize
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