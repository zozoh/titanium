// Ti required(Wn)
//---------------------------------------
export default {
  //---------------------------------------
  async deleteSelected({commit, getters}) {
    let list = getters.selectedItems
    if(_.isEmpty(list)) {
      return await Ti.Alert('i18n:weo-del-none')
    }
    commit("set", {status:{deleting:true}})
    // Loop items
    let delCount = 0
    for(let it of list) {
      //console.log("delete:", it.nm)
      commit("$log". it.nm)
      // Mark item is processing
      commit("updateChildStatus", 
        {id:it.id, status:{loading:true, removed:false}})
      // If DIR, check it is empty or not
      if('DIR' == it.race) {
        let count = await Wn.Sys.exec(`count -A id:${it.id}`)
        count = parseInt(count)
        if(count > 0) {
          // If user confirmed, then rm it recurently
          if(!(await Ti.Confirm({
              text:'i18n:weo-del-no-empty-folder', vars:{nm:it.nm}}))) {
            commit("updateChildStatus", 
              {id:it.id, status:{loading:false, removed:false}})
            continue
          }
        }
      }
      // Do delete
      await new Promise((resolve)=>{
        _.delay(()=>{
          resolve(true)
        }, 200)
      })
      // Mark item removed
      commit("updateChildStatus", 
        {id:it.id, status:{loading:false, removed:true}})
      // Counting
      delCount++
      // Then continue the loop .......^
    }
    // End deleting
    commit("set", {status:{deleting:false}})
    commit("$log", null)
    commit("$toast", {text:"i18n:weo-del-ok", vars:{N:delCount}})
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
      await Ti.Be.OpenLink(link)
    }
  },
  //---------------------------------------
  /***
   * Get obj children by meta
   */
  async loadChildren({commit}, {
    meta, skip, limit, sort, mine, match
  }) {
    if('DIR' != meta.race) {
      commit("set", null)
      return
    }
    let re = await Wn.Io.loadChildren(meta, {
      skip, limit, sort, mine, match})
    commit("set", {
      children : re.list,
      pager    : re.pager,
      currentIndex : 0,
      currentId : null
    })
    return re
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
    }
    // All done, hide upload
    _.delay(()=>{
      commit("clearUploadings")
    }, 2000)
    // Reload the data
    return await dispatch("reload")
  },
  //---------------------------------------
  /***
   * Reload all
   */
  async reload({state, commit, dispatch}, meta) {
    // Use the default meta
    if(!meta) {
      meta = state.meta
    }
    // Update the current meta
    else {
      commit("set", {meta})
    }
    // Load children
    commit("set", {status:{reloading:true}})
    await dispatch("loadChildren", {meta})
    commit("set", {status:{reloading:false}})
    // return the root state
    return state
  },
  //---------------------------------------
  /***
   * Create new object
   */
  async create({state, commit, dispatch}) {
    let data = await Ti.Prompt("是不是要考虑一下呢？",{
      placeholder: "输入一下"
    })
    console.log("re:", data)
  }
  //---------------------------------------
}