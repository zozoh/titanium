// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  async reloadPage({state, commit, dispatch}, pg) {
    commit("updatePager", pg)
    await dispatch("reload")
  },
  //--------------------------------------------
  async reload({state, commit, rootState}, meta) {
    //console.log("thing-manager-search.reload", meta)
    //............................................
    // Update New Meta
    if(meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    //............................................
    // Mark reloading
    commit("setStatus", {reloading:true})
    //............................................
    let cmds = [`thing id:${meta.id} query -pager -cqn`]
    
    let {keyword, match} = state.filter || {}
    let flt = {}
    //............................................
    // Eval Filter: keyword
    if(keyword) {
      if(/^[0-9a-z]{32}$/.test(keyword)) {
        flt.id = keyword
      }
      // Find
      else {
        let knm = "title"
        let beh = _.get(rootState, "main.config.schema.behavior") || {}
        let keys = _.keys(beh.keyword)
        //........................................
        for(let k of keys) {
          let val = beh.keyword[k]
          if(new RegExp(val).test(keyword)) {
            knm = k;
            break;
          }
        }
        //........................................
        // Accurate equal
        if(knm.startsWith("=")) {
          flt[knm.substring(1).trim()] = keyword
        }
        // Default is like
        else {
          flt[knm] = "^.*"+keyword;
        }
        //........................................
      }
    }
    //............................................
    // Eval Filter: match
    if(!_.isEmpty(match)) {
      _.assign(flt, match)
    }
    //............................................
    // Fix filter
    let beMatch = _.get(rootState, "main.config.schema.behavior.match")
    if(!_.isEmpty(beMatch)) {
      _.assign(flt, beMatch)
    }
    //............................................
    // InRecycleBin 
    flt.th_live = state.inRecycleBin ? -1 : 1
    //............................................
    // Eval Sorter
    if(!_.isEmpty(state.sorter)) {
      let sort = JSON.stringify(state.sorter)
      cmds.push(`-sort '${sort}'`)
    }
    //............................................
    // Eval Pager
    let pg = state.pager
    if(!_.isEmpty(pg) && pg.pgsz > 0 && pg.pn > 0) {
      let limit = pg.pgsz
      let skip  = pg.pgsz * (pg.pn - 1)
      cmds.push(`-limit ${limit}`)
      cmds.push(`-skip  ${skip}`)
    }
    
    //............................................
    // Run Command
    let input = _.isEmpty(flt) ? undefined : JSON.stringify(flt)
    let cmdText = cmds.join(" ")
    let reo = await Wn.Sys.exec2(cmdText, {input, as:"json"})
    //............................................
    // All done
    commit("setPager", reo.pager)
    commit("setList", reo.list)
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}