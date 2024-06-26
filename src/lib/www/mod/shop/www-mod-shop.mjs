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
    async fetchOrder({getters, rootState}, {orderId}={}) {
      if(!orderId) {
        return 
      }
      let reo = await Ti.Http.get(getters.urls.fetchOrder, {
        params: {
          ticket: rootState.auth.ticket,
          id: orderId
        },
        as: "json"
      })
      // Success
      if(reo.ok) {
        return reo.data
      }
      // Fail
      else {
        console.warn("Fail to loadOrder", {items, reo})
      }
    },
    //--------------------------------------------
    async payOrder({getters, rootState}, {orderId, payType}={}) {
      if(!orderId) {
        return 
      }
      let reo = await Ti.Http.get(getters.urls.pay, {
        params: {
          ticket: rootState.auth.ticket,
          id: orderId,
          pt: payType
        },
        as: "json"
      })
      // Success
      if(reo.ok) {
        return reo.data
      }
      // Fail
      else {
        console.warn("Fail to payOrder", {items, reo})
      }
    },
    //--------------------------------------------
    async createOrder({getters, rootState}, {
      payType, 
      items,
      orderType,
      orderTitle,
      address,
      fail
    }={}) {
      if(!payType || _.isEmpty(items)) {
        return 
      }

      // Prepare the post obj
      let postObj = {
        title: orderTitle,
        tp: orderType,
        pay_tp: payType,
        products: items,
        // Address
      }
      if(address) {
        postObj.addr_user_country = _.get(address, "country")
        postObj.addr_user_code    = _.get(address, "code")
        postObj.addr_user_door    = _.get(address, "door")
        postObj.user_name  = _.get(address, "consignee")
        postObj.user_phone = _.get(address, "phone")
        postObj.user_email = _.get(address, "email")
        postObj.addr_user_province = _.get(address, "province")
        postObj.addr_user_city     = _.get(address, "city")
        postObj.addr_user_area     = _.get(address, "area")
        postObj.addr_user_street   = _.get(address, "street")
      }
      try{
        let reo = await Ti.Http.post(getters.urls.buy, {
          params: {
            ticket: rootState.auth.ticket
          },
          headers: {
            "Content-Type": "application/json;charset=utf-8"
          },
          body: JSON.stringify(postObj),
          as: "json"
        })
        // Success
        if(reo.ok) {
          return reo.data
        }
        // Fail
        else {
          console.warn("Fail to createOrder", {items, reo})
        }
      }
      // Handle error
      catch(resp) {
        let txt = _.trim(resp.responseText)
        let msg = Ti.I18n.explain(txt)
        Ti.Toast.Open(msg, 'error')
        if(_.isFunction(fail)) {
          fail(msg)
        }
      }
    },
    //--------------------------------------------
    async checkOrder({getters, rootState}, orderId) {
      console.log("checkOrder")
      if(!orderId) {
        return 
      }
      let reo = await Ti.Http.get(getters.urls.checkOrder, {
        params: {
          ticket: rootState.auth.ticket,
          id: orderId
        },
        as: "json"
      })
      // Success
      if(reo.ok) {
        return reo.data
      }
      // Fail
      else {
        console.warn("Fail to checkOrder", {items, reo})
      }
    },
    //--------------------------------------------
    /***
     * Load a group of item by `urls.objs`, and set the result
     * to `Store` by `@commitTarget` and `commitDataKey`
     * 
     * @param items{Array}: each element is string, whicn in form
     * `AMOUNT:ID` like `"4:4r..7a"`
     * 
     * @param commitDataKey{String} after loaded, which key in `page.data`
     * should be updated
     * @param commitTarget{String} after loaded, where to update
     */
    async loadBuyItems({getters, commit}, {
      items= [],
      commitDataKey= "goods",
      commitTarget= "page/updateData"
    }) {
      console.log("loadBuyItems", items)
      // Gether ids
      let ids = []
      let amounts = {}
      _.forEach(items, it=>{
        let m = /^(\d+):(.+)$/.exec(it)
        if(m) {
          let amount = m[1] * 1
          let id = m[2]
          if(id && amount > 0) {
            ids.push(`id:${id}`)
            amounts[id] = amount
          }
        }
      })

      // Guard
      if(_.isEmpty(ids)) {
        return
      }

      // ask remote for 
      let reo =  await Ti.Http.get(getters.urls.objs, {
        params : {phs: ids.join(" ")},
        as : "json"
      })

      // OK
      if(reo.ok) {
        let its = []
        _.forEach(reo.data, obj=> {
          let id = obj.id
          let amount = amounts[id]
          its.push({
            id, amount, obj
          })
        })

        commit(commitTarget, {
          key: commitDataKey,
          value: its
        }, {root:true})
      }
      // Fail
      else {
        console.warn("Fail to loadBuyItems", {items, reo})
      }
    },
    //--------------------------------------------
    async checkoutItems({dispatch}, {
      items=[],
      checkoutPage="page/shop/checkout.html",
      newtab=false,
      orderType="A",
      orderTitle
    }={}) {
      // Prepare the list
      let list = []
      _.forEach(items, (it)=> {
        if(it.id && it.amount > 0) {
          list.push(_.pick(it, "id", "amount"))
        }
      })

      // Do the checkout
      if(!_.isEmpty(items)) {
        await dispatch("checkout", {
          items, checkoutPage, newtab, orderType, orderTitle
        })
      }
      // Just warn it
      else {
        console.warn("!checkoutItems: Empty Item List!")
      }
    },
    //--------------------------------------------
    async checkoutBasket({state, dispatch}, {
      checkedNames = {},
      checkoutPage="page/shop/checkout.html",
      newtab=false
    }={}) {
      // Prepare the list
      let items = []
      _.forEach(state.basket, (it)=> {
        if(it.name && it.count > 0 && 
          (!checkedNames || checkedNames[it.name])) {
          items.push({
            id: it.name,
            amount: it.count
          })
        }
      })

      // Nil to buy
      if(_.isEmpty(items)) {
        Ti.Toast.Open('i18n:buy-checkout-nil', "warn")
        return
      }

      // Do the checkout
      if(!_.isEmpty(items)) {
        await dispatch("checkout", {
          items, checkoutPage, newtab
        })
      }
      // Just warn it
      else {
        console.warn("!checkoutBasket: Empty Basket")
      }
    },
    //--------------------------------------------
    /***
     * @param items{Array} - Array with item `{id:xxx, amount:1}`
     */
    async checkout({dispatch, rootGetters}, {
      items=[],
      checkoutPage="page/shop/checkout.html",
      newtab=false,
      orderType="A",
      orderTitle
    }={}) {
      //console.log("checkout", items)

      // encode the items as params
      let its = []
      _.forEach(items, it => {
        if(it.id && it.amount > 0)
          its.push(`${it.amount}:${it.id}`)
      })

      // Guard
      if(_.isEmpty(its)) {
        console.warn("!checkout: Empty Item");
        return
      }

      // Params
      let params= {
        its: its.join(","),
        tp: orderType,
        ot: orderTitle
      }

      // Open page in new tab
      if(newtab) {
        let url = rootGetters.getUrl(checkoutPage)
        await dispatch("openUrl", {
          url, 
          target:"_blank",
          params
        }, {root:true})
      }
      // Goto page
      else {
        await dispatch("navTo", {
          value: checkoutPage,
          params
        }, {root:true})
      }

    },
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
      if(n === 0 && !reset) {
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
      // Warn user for remove
      if(reset && n <= 0) {
        if(! (await Ti.Confirm("i18n:shop-basket-remove-confirm"))) {
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
      // Confirm
      if(!await Ti.Confirm("i18n:shop-basket-clean-confirm")) {
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
      //console.log("shop:reloadBasket")
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