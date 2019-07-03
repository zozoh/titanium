//////////////////////////////////////////////////
function appendFinger(obj) {
  let ss = [obj.path, obj.params, obj.anchor]
  let sha1 = Ti.Alg.sha1(ss)
  obj.finger = sha1
}
//////////////////////////////////////////////////
export default {
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    set(state, all) {
      _.assign(state, all)
    },
    //--------------------------------------------
    setTitle(state, title) {
      state.title = title
    },
    //--------------------------------------------
    setPath(state, path) {
      state.path = path
    },
    //--------------------------------------------
    setPath(state, path) {
      state.path = path
    },
    //--------------------------------------------
    setParams(state, params) {
      state.params = params
    },
    //--------------------------------------------
    setData(state, data) {
      _.assign(state.data, data)
    },
    //--------------------------------------------
    setLayout(state, layout) {
      state.layout = layout
    },
    //--------------------------------------------
    setShown(state, shown) {
      _.assign(state.shown, shown)
    },
    //--------------------------------------------
    updateFinger(state) {
      appendFinger(state)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    showBlock({state, commit}, name) {
      commit("setShown", {[name]:true})
    },
    //--------------------------------------------
    hideBlock({state, commit}, name) {
      commit("setShown", {[name]:false})
    },
    //--------------------------------------------
    //--------------------------------------------
    async reload({state, commit}, {
      path,
      params={},
      anchor=null
    }) {
      console.log("I am reload", {path,params,anchor})
      //.....................................
      // Load the page json
      let json = await Ti.Load(`@Site:${path}.json`)
      let page = _.assign({
        "title" : null,
        "apis" : {},
        "data" : {},
        "layout" : {
          "type" : "rows",
          "blocks" : []
        },
        "shown" : {},
        "schema" : {},
        "actions" : {}
      }, json, {
        path, params, anchor
      })
      // Add the finger
      appendFinger(page)
      
      // TODO: update title template here by data


      //...........................
      // Update page 
      commit("set", page)
      console.log(" -->", page)
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}