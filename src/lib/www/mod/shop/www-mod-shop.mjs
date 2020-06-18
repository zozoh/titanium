const _M = {
  ////////////////////////////////////////////////
  getters : {
    //--------------------------------------------
    urls(state, getters, rootState, rootGetters) {
      let map = {}
      _.forEach(state.paths, (ph, key)=>{
        map[key] = rootGetters.getApiUrl(ph)
      })
      return map
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    appendBasket(state, buyIt) {
      state.basket = _.concat(state.basket, buyIt)
    },
    //--------------------------------------------
    setBasket(state, buyIts=[]) {
      state.basket = buyIts
    },
    //--------------------------------------------
    setPayment(state, pay) {
      state.payment = pay
    },
    //--------------------------------------------
    setPaths(state, paths) {
      state.paths = _.cloneDeep(paths)
    },
    //--------------------------------------------
    mergePaths(state, paths) {
      _.assign(state.paths, paths)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    /***
     * @param id{String} - Product ID
     * @param n{Integer} - Product buy count, 1 as default
     * @param reset{Boolean} If true, `n` will be take as the final buy count.
     *  else if false, `n` will be take as increasment. Of cause, 
     *  negative `n` will cause the decreasment.
     */
    async updateBasket({commit, dispatch, getters, rootState}, {
      id, n=1, reset=false, success, fail, invalid, noTicket
    }={}) {
      console.log("shop:addToBasket", {id, success, fail})
      //..........................................
      // N is 0, do nothing
      if(n === 0) {
        return
      }
      //..........................................
      // Guard Ticket
      let ticket  = rootState.auth.ticket
      if(!ticket) {
        // Customized exception handler
        if(noTicket) {
          return await dispatch(noTicket.action, noTicket.payload, {root:true})
        }
        // Default just notify
        else {
          Ti.Alert("Without Session Ticket!!!")
          return          
        }
      }
      //..........................................
      // Guard id
      if(!id) {
        // Customized exception handler
        if(invalid) {
          return await dispatch(invalid.action, invalid.payload, {root:true})
        }
        // Default just notify
        else {
          Ti.Alert("Without Product ID!!!")
          return
        }
      }
      //..........................................
      // Check to remote
      commit("setLoading", true, {root:true})
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let reo =  await Ti.Http.get(getters.urls.buyIt, {
        params : {
          ticket, id, n, r:reset
        },
        as : "json"
      })
      // success
      if(reo.ok) {
        commit("setBasket", reo.data)

        // Success
        if(success) {
          await dispatch(success.action, success.payload, {root:true})
        }
      }
      // Fail
      else if(fail){
        await dispatch(fail.action, fail.payload, {root:true})
      }
      // Show error
      else {
        console.warn("shop.updateBasket fail:", reo)
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      commit("setLoading", false, {root:true})
    },
    //--------------------------------------------
    async cleanBasket({commit, getters, rootState}) {
      console.log("shop:cleanBasket")
      //..........................................
      // Guard Ticket
      let ticket  = rootState.auth.ticket
      if(!ticket) {
        return
      }
      //..........................................
      // Check to remote
      commit("setLoading", true, {root:true})
      // Current Session ...
      let reo =  await Ti.Http.get(getters.urls.buyClean, {
        params : {
          ticket
        },
        as : "json"
      })
      commit("setLoading", false, {root:true})
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // success
      if(reo.ok) {
        commit("setBasket", [])
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // Fail
      else{
        console.error("www/shop module: Fail to reloadBasket", reo)
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    },
    //--------------------------------------------
    async reloadBasket({commit, getters, rootState}) {
      console.log("shop:reloadBasket")
      //..........................................
      // Guard Ticket
      let ticket  = rootState.auth.ticket
      if(!ticket) {
        return
      }
      //..........................................
      // Check to remote
      commit("setLoading", true, {root:true})
      // Current Session ...
      let reo =  await Ti.Http.get(getters.urls.buyGetAll, {
        params : {
          ticket
        },
        as : "json"
      })
      commit("setLoading", false, {root:true})
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // success
      if(reo.ok) {
        commit("setBasket", reo.data)
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // Fail
      else{
        console.error("www/shop module: Fail to reloadBasket", reo)
      }
      //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    }
    //--------------------------------------------
  } // actions : {
  ////////////////////////////////////////////////
}
export default _M;