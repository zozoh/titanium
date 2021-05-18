const _M = {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //--------------------------------------------
    setChildren(state, children) {
      state.children = children
      let list = []
      _.forEach(children, ({nm,title,icon})=>{
        list.push({name:nm, title, icon})
      })
      state.chartNameList = list
      // Check current chartName
      let {name} = state.chartStatus
      if(name && _.findIndex(list, li=>li.name==name)<0) {
        if(!_.isEmpty(list)) {
          state.chartStatus.name = _.first(list).name
        }
      }
    },
    //--------------------------------------------
    setChartType(state, type) {
      state.chartStatus.type = type
    },
    //--------------------------------------------
    setChartStatus(state, chartStatus) {
      state.chartStatus = chartStatus
    },
    //--------------------------------------------
    updateChartStatus(state, chartStatus) {
      state.chartStatus = _.assign({}, state.chartStatus, chartStatus)
    },
    //--------------------------------------------
    saveChartStatus(state) {
      if(state.global.keepToLocal) {
        let key = `wn-chart-status-${state.meta.id}`
        Ti.Storage.session.setObject(key, state.chartStatus)
      }
    },
    //--------------------------------------------
    loadChartStatus(state) {
      if(state.global.keepToLocal) {
        let key = `wn-chart-status-${state.meta.id}`
        state.chartStatus = Ti.Storage.session.getObject(key, {})
      }
    },
    //--------------------------------------------
    setGlobal(state, global) {
      state.global = global
    },
    //--------------------------------------------
    setChart(state, chart) {
      state.chart = chart

      // Check current chartType
      let {type} = state.chartStatus
      //console.log("check current type:", type)
      if(!type || _.findIndex(state.chart.chartTypes, ct=>ct==type)<0) {
        state.chartStatus.type = _.first(state.chart.chartTypes)
      }
    },
    //----------------------------------------
    setChartData(state, chartData) {
      state.chartData = chartData
    },
    //----------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
export default _M;