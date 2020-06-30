const _M = {
  //--------------------------------------------
  async openAddressEditor({state}, addr={}) {
    console.log("openAddressEditor", addr)
    // Prepare the Edit form
    let newAddr = await Ti.App.Open({
      title: "i18n:edit",
      position: "top",
      width: 640,
      height: 640,
      result: _.cloneDeep(addr),
      comType: "TiForm",
      comConf: {
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
            "title"   : "i18n:address-k-postcode",
            "name"    : "postcode",
            "comType" : "ti-input",
            "comConf" : {
              "valueCase": "upper"
            }
          },{
            "title"   : "i18n:address-k-city",
            "name"    : "city",
            "comType" : "ti-input"
          },{
            "title"   : "i18n:address-k-street",
            "name"    : "street",
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
    // Get the data
    console.log(newAddr)

  },
  //--------------------------------------------
  async removeAddress({state}, addr){
    console.log("removeAddress", addr)
  },
  //--------------------------------------------
  async setAddressDefault({state}, addr){
    console.log("setAddressDefault", addr)
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