// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  async reloadSchema({state, commit}) {
    let aph  = `id:${state.meta.id}/thing-schema.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})
    //console.log("setSchema", json)
    commit("setSchema", json)
    return json
  },
  //--------------------------------------------
  async reloadLayout({state, commit}) {
    let aph  = `id:${state.meta.id}/thing-layout.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})
    //console.log("setLayout", json)
    commit("setLayout", json)
    return json
  },
  //--------------------------------------------
  async reloadActions({state, commit}) {
    let aph  = `id:${state.meta.id}/thing-actions.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})
    //console.log("setActions", json)
    commit("setActions", json)
    return json
  },
  //--------------------------------------------
  async reloadData({state, commit}) {
    let home = state.meta
    let cmds = [`thing id:${home.id} query -pager -cqn`]
    // Eval Sorter
    if(!_.isEmpty(state.search.sorter)) {
      let sort = JSON.stringify(state.search.sorter)
      cmds.push(`-sort '${sort}'`)
    }
    // Eval Pager
    let pg = state.search.pager
    if(!_.isEmpty(pg) && pg.pgsz > 0 && pg.pn > 0) {
      let limit = pg.pgsz
      let skip  = pg.pgsz * (pg.pn - 1)
      cmds.push(`-limit ${limit}`)
      cmds.push(`-skip  ${skip}`)
    }

    // Run Command
    let cmdText = cmds.join(" ")
    let reo = await Wn.Sys.exec2(cmdText, {as:"json"})
    
    commit("setSearchPager", reo.pager)
    commit("setSearchList", reo.list)
  },
  //--------------------------------------------
  async reload({state, commit, dispatch}, meta) {
    console.log("thing-manager.reload", meta)
    // Update New Meta
    if(meta) {
      commit("setHome", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    await dispatch("reloadSchema")
    await dispatch("reloadLayout")
    await dispatch("reloadActions")

    await dispatch("reloadData")

    // All done
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}