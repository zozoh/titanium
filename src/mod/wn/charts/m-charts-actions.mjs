////////////////////////////////////////////
const _M = {
  //----------------------------------------
  updateCurrentChartType({commit}, type) {
    commit("updateChartStatus", {type})
    commit("saveChartStatus")
  },
  //----------------------------------------
  async reloadChartDateSpan({commit,dispatch}, {date, span}={}) {
    commit("updateChartStatus", {date, span})
    commit("saveChartStatus")
    await dispatch("reloadChartData")
  },
  //----------------------------------------
  async reloadChart({dispatch}, chartName) {
    await dispatch("reloadChartSetup", chartName)
    await dispatch("reloadChartData")
  },
  //----------------------------------------
  async reloadChartData({state, commit}, {
    force, cleanCache, done=_.identity
  }={}) {
    if(!state.chart.data) {
      return
    }
    // console.log({force, cleanCache, done})
    // 准备时间区间
    let today = _.get(state, "chartStatus.date") || "today"
    let span  = _.get(state, "chartStatus.span") || "7d"

    // 准备命令模板
    let cmdText = Ti.S.renderBy(state.chart.data, {
      today, span
    })
    // 加载数据
    let data = await Wn.Sys.exec2(cmdText, {as:"json"})
    commit("setChartData", data)

    // 处理回调
    done(data)
  },
  //----------------------------------------
  async reloadChartSetup({state, commit}, chartName) {
    // 更新当前统计视图
    if(chartName) {
      commit("updateChartStatus", {name: chartName})
      commit("saveChartStatus")
    }
    // 如果没有 chartName 试图看看缓存
    else {
      chartName = _.get(state.chartStatus, "name")
    }

    // 还是没有的话，从当前可选的 chart 里读取第一个
    if(!chartName) {
      chartName = _.get(_.first(state.chartNameList), "name")
      commit("updateChartStatus", {name: chartName})
      commit("saveChartStatus")
    }

    // 还是没有，放其吧
    if(!chartName) {
      return
    }
    //console.log("reloadChart", chartName)
    // 读取其数据
    let ph = `id:${state.meta.id}/${chartName}/charts-setup.json`
    let oChartSetup = await Wn.Io.loadMeta(ph)
    let chart = await Wn.Io.loadContent(oChartSetup, {as:"json"})

    // 与全局的配置融合
    let setup = _.omit(_.cloneDeep(state.global), "keepToLocal")
    _.defaults(setup, {
      chartStatus: {},
      spanOptions: [],
      chartDefines: {},
      chartTypes: [],
      chartOptions: {}
    })
    _.merge(setup.chartStatus, chart.chartStatus)
    _.merge(setup.spanOptions, chart.spanOptions)
    _.merge(setup.chartDefines, chart.chartDefines)
    setup.chartTypes = chart.chartTypes || setup.chartTypes
    _.merge(setup.chartOptions, chart.chartOptions)
    setup.data = chart.data
    commit("setChart", setup)
  },
  //----------------------------------------
  async reloadChildren({state, commit}){
    let reo = await Wn.Io.loadChildren(state.meta, {
      sort : {sort:1, nm:1},
      match: {race:"DIR"}
    })
    commit("setChildren", reo.list)
  },
  //----------------------------------------
  async reloadSetup({state, commit}){
    let oSetup = await Wn.Io.loadMeta(`id:${state.meta.id}/global-setup.json`)
    let global = await Wn.Io.loadContent(oSetup, {as:"json"})
    commit("setGlobal", global || {})
  },
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    if(state.reloading){
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
      return
    }

    commit("setMeta", meta)
    commit("setStatus", {reloading:true})
    //......................................
    // 加载配置
    await dispatch("reloadSetup", meta)
    await dispatch("reloadChildren", meta)
    commit("loadChartStatus")
    //......................................
    // 加载当前图表配置
    await dispatch("reloadChartSetup")
    //......................................
    // 加载图表数据
    await dispatch("reloadChartData")
    //......................................
    commit("setStatus", {reloading:false})
  }
  //----------------------------------------
}
export default _M;