////////////////////////////////////////////
function getKeepSearchAs(meta) {
  if(meta && meta.keep_search_as) {
    let keepAs = meta.keep_search_as
    if(_.isBoolean(keepAs)) {
      keepAs = `search-${meta.id}`
    }
    return keepAs
  }
}
////////////////////////////////////////////
const _M = {
  //----------------------------------------
  // Combin Mutations
  //----------------------------------------
  onChanged({dispatch}, payload) {
    dispatch("changeContent", payload)
  },
  //----------------------------------------
  changeContent({commit}, payload) {
    commit("setContent", payload)
    commit("syncStatusChanged");
  },
  //----------------------------------------
  changeMeta({commit}, {name, value}={}) {
    if(name) {
      let meta = _.set({}, name, value)
      commit("mergeMeta", meta)
      commit("syncStatusChanged")
    }
  },
  //----------------------------------------
  updateContent({state, commit}, content) {
    commit("setContent", content)
    if(state.meta && "FILE" == state.meta.race) {
      commit("setSavedContent", content)
    }
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  // User Interactivity
  //--------------------------------------------
  async openMetaEditor({state, dispatch}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let reo = await Wn.EditObjMeta(state.meta, {fields:"auto"})

    // Cancel the editing
    if(_.isUndefined(reo)) {
      return
    }

    // Update the current editing
    if(reo.saved) {
      await dispatch("reload", reo.data)
    }
  },
  //--------------------------------------------
  async openContentEditor({state, dispatch}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let newContent = await Wn.EditObjContent(state.meta, {
      content : state.content
    })

    // Cancel the editing
    if(_.isUndefined(newContent)) {
      return
    }

    // Update the current editing
    await dispatch("changeContent", newContent)
  },
  //--------------------------------------------
  async openPrivilegeEditor({state, dispatch}) {
    // Guard
    if(!state.meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    // Open Editor
    let newMeta = await Wn.EditObjPrivilege(state.meta)

    // Cancel the editing
    if(_.isUndefined(newMeta)) {
      return
    }

    // Update the current editing
    await dispatch("reload", newMeta)
  },
  //--------------------------------------------
  // Update to remote
  //----------------------------------------
  async updateMeta({commit, dispatch}, {name, value}={}) {
    let data = Ti.Types.toObjByPair({name, value})
    await dispatch("updateMetas", data)
  },
  //----------------------------------------
  async updateMetas({state, commit}, data={}) {
    // Check Necessary
    if(_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    // Mark field status
    _.forEach(data, (val, name)=>{
      commit("setFieldStatus", {name, type:"spinning", text:"i18n:saving"})
    })

    // Do the update
    let json = JSON.stringify(data)
    let id  = state.meta.id
    let cmdText = `o id:${id} @update @json -cqn`
    let reo = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})
    let isError = reo instanceof Error;

    if(!isError && !Ti.Util.isNil(reo)) {
      commit("setMeta", reo)
    }

    _.forEach(data, (val, name)=>{
      if(isError) {
        commit("setFieldStatus", {
          name, 
          type: "warn", 
          text: reo.message || "i18n:fail"
        })
      } else {
        commit("setFieldStatus", {
          name, 
          type: "ok", 
          text: "i18n:ok"
        })
        _.delay(()=>{commit("clearFieldStatus", name)}, 500)
      }
    })
  },
  //--------------------------------------------
  // Reload & Save
  //--------------------------------------------
  // async setCurrent({state, commit,dispatch}, {
  //   meta=null, force=false
  // }={}) {
  //   //console.log("setCurrent", meta, loadContent)

  //   // Not need to reload
  //   if(state.meta && meta && state.meta.id == meta.id) {
  //     if((_.isString(state.content)) && !force) {
  //       return
  //     }
  //   }

  //   // do reload
  //   await dispatch("reload", meta)

  // },
  //----------------------------------------
  async save({state, commit}) {
    if(state.status.saving || !state.status.changed){
      return
    }

    commit("setStatus", {saving:true})

    let meta = state.meta
    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setStatus", {saving:false})
    commit("setMeta", newMeta)
    commit("setSavedContent", content)
    commit("syncStatusChanged")

    // return the new meta
    return newMeta
  },
  //----------------------------------------
  saveSearchSetting({state, commit}, {filter, sorter, pager}={}) {
    if(filter) {
      commit("setFilter", filter)
    }
    if(sorter) {
      commit("setSorter", sorter)
    }
    if(pager) {
      commit("setPager", pager)
    }

    let keepAs = getKeepSearchAs(state.meta)
    if(keepAs) {
      Ti.Storage.session.setObject(keepAs, {
        filter : state.filter,
        sorter : state.sorter,
        pager  : {
          pageNumber : state.pageNumber,
          pageSize   : state.pageSize
        }
      })
    }
  },
  //----------------------------------------
  recoverSearchSetting({commit}, meta) {
    let keepAs = getKeepSearchAs(meta)
    if(keepAs) {
      let {
        filter, sorter, pager
      } = Ti.Storage.session.getObject(keepAs, {})

      pager = _.assign({}, {
        pageNumber : 1,
        pageSize   : meta.dft_page_size || 1000
      }, pager)

      commit("setFilter", filter)
      commit("setSorter", sorter)
      commit("setPager", pager)
    }
  },
  //----------------------------------------
  async query({dispatch}, search={}){
    //console.log("query", search)
    dispatch("saveSearchSetting", search)
    return await dispatch("reload")
  },
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }
    //......................................
    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }
    //......................................
    if(_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }
    else if(meta && meta.id) {
      meta = await Wn.Io.loadMetaById(meta.id)
    }
    //......................................
    // Guard
    if(!meta) {
      commit("setMeta", null)
      commit("setContent", null)
      return
    }
    //console.log("m-obj-current.reload", meta.id)
    //......................................
    // Restore the search setting
    dispatch("recoverSearchSetting", meta)

    // Init content as null
    let content = null
    commit("setStatus", {reloading:true})
    //......................................
    // For file
    if("FILE" == meta.race) {
      // need to be reload content
      content = await Wn.Io.loadContent(meta)
    }
    //......................................
    // For dir
    else if('DIR' == meta.race) {
      let cmds = [`o @query -p id:${meta.id}`]
      cmds.push('-pager -mine -hidden')
      if(state.pageSize > 0) {
        let pgsz = state.pageSize
        let pn = state.pageNumber || 1
        let skip = Math.max(0, pgsz * (pn-1))
        if(skip > 0) {
          cmds.push(`-skip ${skip}`)
        }
        cmds.push(`-limit ${pgsz}`)
      }
      if(state.sorter) {
        cmds.push(`-sort '${JSON.stringify(state.sorter)}'`)
      }
      let input;
      if(state.filter) {
        let flt = Wn.Util.getMatchByFilter(state.filter, meta.search_setting)
        // Empty filter, force update it again
        if(_.isEmpty(flt)) {
          commit("clearFilter")
          dispatch("saveSearchSetting", {filter:state.filter})
        }
        input = JSON.stringify(flt)
      }
      cmds.push('@json -cqnl')
      content = await Wn.Sys.exec2(cmds.join(' '), {as:"json", input})
    }
    //......................................
    // Just update the meta
    commit("setMeta", meta)
    commit("setStatus", {reloading:false})
    commit("clearFieldStatus")
    // Update content and sync state
    dispatch("updateContent", content)
  }
  //----------------------------------------
}
export default _M;