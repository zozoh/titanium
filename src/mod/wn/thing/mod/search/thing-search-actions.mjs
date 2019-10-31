// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  async reload({state, commit, dispatch}, meta) {
    //console.log("thing-manager-search.reload", meta)
    // Update New Meta
    if(meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    let cmds = [`thing id:${meta.id} query -pager -cqn`]
    // Eval Sorter
    if(!_.isEmpty(state.sorter)) {
      let sort = JSON.stringify(state.sorter)
      cmds.push(`-sort '${sort}'`)
    }
    // Eval Pager
    let pg = state.pager
    if(!_.isEmpty(pg) && pg.pgsz > 0 && pg.pn > 0) {
      let limit = pg.pgsz
      let skip  = pg.pgsz * (pg.pn - 1)
      cmds.push(`-limit ${limit}`)
      cmds.push(`-skip  ${skip}`)
    }
    // Eval Filter
    let flt = {}
    if(!_.isEmpty(state.filter)) {
      _.forEach(state.filter, (val, key)=>{
        if(!_.isNull(val)) {
          flt[key] = val
        }
      })
    }
    // Run Command
    let input = _.isEmpty(flt) ? undefined : JSON.stringify(flt)
    let cmdText = cmds.join(" ")
    let reo = await Wn.Sys.exec2(cmdText, {input, as:"json"})
    
    // All done
    commit("setPager", reo.pager)
    commit("setList", reo.list)
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}