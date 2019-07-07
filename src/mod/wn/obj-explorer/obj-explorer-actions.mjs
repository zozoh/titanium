// Ti required(Wn)
//---------------------------------------
export default {
  //---------------------------------------
  async deleteSelected({commit, getters, dispatch}) {
    let list = getters.selectedItems
    if(_.isEmpty(list)) {
      return await Ti.Alert('i18n:weo-del-none')
    }
    commit("setStatus", {deleting:true})
    let delCount = 0
    // make removed files. it remove a video
    // it will auto-remove the `videoc_dir` in serverside also
    // so, in order to avoid delete the no-exists file, I should
    // remove the `videoc_dir` ID here, each time loop, check current
    // match the id set or not, then I will get peace
    let exRemovedIds = {}
    try {
      // Loop items
      for(let it of list) {
        // Duck check
        if(!it || !it.id || !it.nm)
          continue
        // Ignore obsolete item
        if(it.__is && (it.__is.loading || it.__is.removed))
          continue
        // Ignore the exRemovedIds
        if(exRemovedIds[it.id])
          continue
        
        // Mark item is processing
        commit("updateItemStatus", 
          {id:it.id, status:{loading:true, removed:false}})
        // If DIR, check it is empty or not
        if('DIR' == it.race) {
          let count = await Wn.Sys.exec(`count -A id:${it.id}`)
          count = parseInt(count)
          if(count > 0) {
            // If user confirmed, then rm it recurently
            if(!(await Ti.Confirm({
                text:'i18n:weo-del-no-empty-folder', vars:{nm:it.nm}}))) {
              commit("updateItemStatus", 
                {id:it.id, status:{loading:false, removed:false}})
              continue
            }
          }
        }
        // Do delete
        // await new Promise((resolve)=>{
        //   _.delay(()=>{
        //     resolve(true)
        //   }, 300)
        // })
        commit("$log", {
          text:"i18n:weo-del-item", vars:{name:it.nm}
        })
        await Wn.Sys.exec(`rm ${'DIR'==it.race?"-r":""} id:${it.id}`)
        // Mark item removed
        commit("updateItemStatus", 
          {id:it.id, status:{loading:false, removed:true}})
        // If video result folder, mark it at same time
        let m = /^id:(.+)$/.exec(it.videoc_dir)
        if(m) {
          let vdId = m[1]
          exRemovedIds[vdId] = true
          commit("updateItemStatus", 
            {id:it.vdId, status:{loading:false, removed:true}})
        }
        // Counting
        delCount++
        // Then continue the loop .......^
      }
      // Do reload
      await dispatch("reload")
    }
    // End deleting
    finally {
      commit("setStatus", {deleting:false})
      commit("$log", null)
      commit("$noti", {text:"i18n:weo-del-ok", vars:{N:delCount}})
    }
  },
  //---------------------------------------
  async rename({getters, commit}) {
    let it = getters.currentItem
    if(!it) {
      return await Ti.Alert('i18n:weo-rename-none')
    }
    commit("setStatus", {renaming:true})
    try {
      // Get newName from User input
      let newName = await Ti.Prompt({
          text : 'i18n:weo-rename',
          vars : {name:it.nm}
        }, {
          title : "i18n:rename",
          placeholder : it.nm,
          value : it.nm
        })
      // Check the newName
      if(newName) {
        // Check the newName contains the invalid char
        if(newName.search(/[%;:"'*?`\t^<>\/\\]/)>=0) {
          return await Ti.Alert('i18n:weo-rename-invalid')
        }
        // Check the newName length
        if(newName.length > 256) {
          return await Ti.Alert('i18n:weo-rename-too-long')
        }
        // Mark renaming
        commit("updateItemStatus", 
          {id:it.id, status:{loading:true}})
        // Do the rename
        let newMeta = await Wn.Sys.exec2(
            `obj id:${it.id} -cqno -u 'nm:"${newName}"'`,
            {as:"json"})
        // Error
        if(newMeta instanceof Error) {
          commit("$toast", {text:"i18n:weo-rename-fail", type:"error"})
          commit("updateItemStatus", 
            {id:it.id, status:{loading:false}})
        }
        // Replace the data
        else {
          commit("$toast", "i18n:weo-rename-ok")
          commit("updateItem", newMeta)
        }
      }  // ~ if(newName)
    }
    // reset the status
    finally {
      commit("setStatus", {renaming:false})
    }
  },
  //---------------------------------------
  async download({getters}) {
    let list = getters.selectedItems
    if(_.isEmpty(list)) {
      return await Ti.Alert('i18n:weo-download-none')
    }
    //let link = Wn.Util.getMetaLinkObj()
    //Ti.Be.Open("http://www.nutzam.com")
    if(list.length > 5) {
      if(!await Ti.Confirm({
        text : "i18n:weo-download-too-many",
        vars : {N:list.length}})) {
        return
      }
    }
    // Do the download
    for(let it of list) {
      if('FILE' != it.race) {
        if(!await Ti.Confirm({
            text : "i18n:weo-download-dir",
            vars : it
          }, {
            textYes : "i18n:continue",
            textNo  : "i18n:terminate"
          })){
          return
        }
        continue;
      }
      let link = Wn.Util.getDownloadLink(it)
      Ti.Be.OpenLink(link)
    }
  },
  //---------------------------------------
  /**
   * Upload files
   */
  async upload({state, commit, dispatch}, files) {
    let ups = _.map(files, (file, index)=>({
      id : `U${index}_${Ti.Random.str(6)}`,
      file : file,
      total : file.size,
      current : 0
    }))
    // Show uploading
    commit("addUploadings", ups)
    let list = []
    // Do upload file one by one
    for(let up of ups) {
      let file = up.file
      let newMeta = await Wn.Io.uploadFile(file, {
        target : `id:${state.meta.id}`,
        progress : function(pe){
          commit("updateUploadProgress", {
            uploadId : up.id, 
            loaded   : pe.loaded
          })
        }
      })
      list.push(newMeta)
    }
    // All done, hide upload
    _.delay(()=>{
      commit("clearUploadings")
    }, 2000)
    // Reload the data
    await dispatch("reload")

    return {
      ...state,
      localFiles   : files,
      uploadedList : list
    }
  },
  //---------------------------------------
  async publish({state,commit,dispatch}) {
    let meta = state.meta
    // Check the publish target
    if(!meta.publish_to) {
      commit("$toast", {
        type : "warning",
        text : "i18n:weo-publish-to-nil"
      })
    }
    // Get the target
    let ta = await Wn.Io.loadMetaAt(meta, meta.publish_to)
    if(!ta || !ta.id) {
      commit("$toast", {
        type : "warning",
        text : "i18n:weo-publish-to-noexist"
      })
    }

    commit("setStatus", {publishing:true})
    // Do copy
    let cmdText = `cp -r id:${meta.id}/* id:${ta.id}/`
    let re = await Wn.Sys.exec2(cmdText)

    // All done
    commit("setStatus", {publishing:false})
    commit("$toast", "i18n:weo-publish-done")
  },
  //---------------------------------------
  /***
   * Reload all
   */
  async reload({state, commit}, meta) {
    // Use the default meta
    if(!meta) {
      meta = state.meta
    }
    // !!! Must be DIR
    if('DIR' != meta.race) {
      commit("setMeta", null)
      return
    }
    // Update the current meta
    if(meta != state.meta) {
      commit("setMeta", meta)
    }
    // Mark begin
    commit("setStatus", {reloading:true})
       
    let re = await Wn.Io.loadChildren(meta)
    //console.log("reload", re)

    // Update state and Mark end
    commit("setList", re.list)
    commit("setPager", re.pager)
    commit("setStatus", {reloading:false})
    
    // return the root state
    return state
  },
  //---------------------------------------
  async tryReload({state, commit, dispatch}, meta) {
    if(!meta) {
      commit("reset")
    }
    if(!state.meta 
      || state.meta.id != meta.id 
      || _.isEmpty(state.list)) {
      return await dispatch("reload", meta)
    }
    return state
  },
  //---------------------------------------
  /***
   * Create new object
   */
  async create({state, commit, dispatch}) {
    let vm = this
    // Load the creation setting
    let {types, freeCreate} = await Wn.Sys.exec(
                    `ti creation -cqn id:${state.meta.id}`, 
                    {as:"json"})

    // Open modal to get the file name
    let no = await Ti.Modal({
      data : {
        types : types || [],
        freeCreate : freeCreate,
        value : {
          name : "",
          type : "",
          race : ""
        }
      },
      template : `<ti-obj-creation 
                    :types="types" 
                    :free-create="freeCreate"
                    v-model="value"/>`,
      components : ["@com:ti/obj/creation"]
    }, {
      width  : 640,
      height : 480,
      title : "i18n:create",
      type  : "success",
      actions : [{
        key : "ok",
        text: "i18n:ok", 
        handler : ({app})=>{
          return app.$vm().value
        }
      }, {
        key : "cancel",
        text: "i18n:cancel"
      }]
    })

    // do the new name
    //console.log("get the new object: ", no)

    // Do Create
    // Check the newName
    if(no && no.name) {
      // Check the newName contains the invalid char
      if(no.name.search(/[%;:"'*?`\t^<>\/\\]/)>=0) {
        return await Ti.Alert('i18n:weo-create-invalid')
      }
      // Check the newName length
      if(no.length > 256) {
        return await Ti.Alert('i18n:weo-create-too-long')
      }      
      // Do the creation
      let json = JSON.stringify({
        nm   : no.name, 
        tp   : no.type=="folder"?"":no.type, 
        race : no.race
      })
      let newMeta = await Wn.Sys.exec2(
          `obj id:${state.meta.id} -cqno -new '${json}'`,
          {as:"json"})
      // Error
      if(newMeta instanceof Error) {
        commit("$toast", {text:"i18n:weo-create-fail", type:"error"})
      }
      // Replace the data
      else {
        commit("$toast", "i18n:weo-create-ok")
        await dispatch("reload")
      }
    }  // ~ if(newName)
  }
  //---------------------------------------
}