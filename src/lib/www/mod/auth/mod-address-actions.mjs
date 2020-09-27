const _M = {
  //--------------------------------------------
  async reloadMyAddresses({state, commit, getters}){
    let url = getters.urls.addr_mine

    commit("setLoading", true, {root:true})
    let reo = await Ti.Http.get(url, {
      params: {
        ticket: state.ticket 
      },
      as:"json"
    })
    commit("setLoading", false, {root:true})
    commit("setAddresses", reo)
  },
  //--------------------------------------------
  async editOrCreateAddress({state, getters, commit, dispatch}, addr={}) {
    //console.log("openAddressEditor", addr)
    // Pick the data
    let result = _.pick(addr, 
        "id", "country", "code",
        "province", "city", "area", "street", "door", "dftaddr",
        "consignee", "phone", "email")
    // Add Default Value
    _.defaults(result, {
      country : "CN",
      tp : "U",
      dftaddr : false
    })

    // Prepare the Edit form
    let newAddr = await Ti.App.Open({
      title: "i18n:edit",
      position: "top",
      width: 640,
      height: "90%",
      result: result,
      comType: "TiForm",
      comConf: {
        onlyFields: false,
        data: "=result",
        fields: [{
            "title"   : "i18n:address-k-country",
            "name"    : "country",
            "comType" : "ti-combo-input",
            "comConf" : {
              "mustInList": true,
              "autoCollapse": true,
              "valueCase": "upper",
              "dropDisplay": "name",
              "options": state.countries,
              "valueBy": "key",
              "textBy" : "name"
            }
          },{
            "title"   : "i18n:address-k-code",
            "name"    : "code",
            "tip"     : "i18n:address-k-code-tip",
            "comType" : "ti-input",
            "comConf" : {
              "valueCase": "upper"
            }
          },{
            "title"   : "i18n:address-k-province",
            "name"    : "province",
            "comType" : "ti-input"
          },{
            "title"   : "i18n:address-k-city",
            "name"    : "city",
            "comType" : "ti-input"
          },{
            "title"   : "i18n:address-k-area",
            "name"    : "area",
            "comType" : "ti-input"
          },{
            "title"   : "i18n:address-k-street",
            "name"    : "street",
            "comType" : "ti-input"
          },{
            "title"   : "i18n:address-k-door",
            "name"    : "door",
            "comType" : "ti-input"
          },{
            "title"   : "i18n:address-k-dftaddr",
            "name"    : "dftaddr",
            "type"    : "Boolean",
            "comType" : "ti-toggle"
          },{
            "title"   : "i18n:address-k-consignee",
            "name"    : "consignee",
            "comType" : "ti-input"
          },{
            "title"   : "i18n:address-k-phone",
            "name"    : "phone",
            "comType" : "ti-input"
          },{
            "title"   : "i18n:address-k-email",
            "name"    : "email",
            "comType" : "ti-input"
          }]
      }
    })
    // User cancel
    if(_.isUndefined(newAddr)) {
      return
    }

    // No change
    if(_.isEqual(newAddr, result)) {
      return
    }

    console.log("!!!", newAddr)
    // Eval the url
    let url;
    // Create
    if(!newAddr.id) {
      url = getters.urls.addr_create
    }
    // Update
    else {
      url = getters.urls.addr_update
    }

    // Prepare http options
    let params = {
      ticket: state.ticket,
      id: newAddr.id
    }
    let body = JSON.stringify(newAddr)

    commit("setLoading", true, {root:true})

    // Send request
    await Ti.Http.post(url, {
      params, body, as:"json"
    })

    // Then reload
    await dispatch("reloadMyAddresses")

    commit("setLoading", false, {root:true})
  },
  //--------------------------------------------
  async removeAddress({state, commit, getters, dispatch}, {id}={}){
    // Guard
    if(!id) {
      return
    }

    // Confirm
    if(!(await Ti.Confirm("i18n:address-rm-confirm"))) {
      return
    }

    commit("setLoading", true, {root:true})

    // Process delete
    let url = getters.urls.addr_delete
    await Ti.Http.get(url, {
      params: {
        ticket: state.ticket,
        id: id
      },
      as:"json"
    })
    
    // Then reload
    await dispatch("reloadMyAddresses")

    commit("setLoading", false, {root:true})
  },
  //--------------------------------------------
  async setAddressDefault({state, commit, getters, dispatch}, {id}={}){
    // Guard
    if(!id) {
      return
    }

    // Process delete
    let url = getters.urls.addr_update
    // Prepare http options
    let params = {
      ticket: state.ticket,
      id: id
    }
    let body = JSON.stringify({dftaddr:true})

    commit("setLoading", true, {root:true})

    // Send request
    await Ti.Http.post(url, {
      params, body, as:"json"
    })
    
    // Then reload
    await dispatch("reloadMyAddresses")

    commit("setLoading", false, {root:true})
  },
  //--------------------------------------------
  async initCountries({state, getters, commit}) {
    if(!state.countries) {
      let url = getters.urls.countries
      let reo = await Ti.Http.get(url, {as:"json"})
      commit("setCountries", reo)
    }
  }
  //--------------------------------------------
}
export default _M;