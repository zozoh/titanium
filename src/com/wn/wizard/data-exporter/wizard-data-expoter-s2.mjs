export default {
  //---------------------------------------------------
  Step2ChooseFields() {
    let vm = this
    //.........................................
    const _load_fields = async () => {
      let { mapping } = this.value
      if (mapping) {
        let list = await Wn.Sys.exec2(`cat id:${mapping}`, { as: "json" })
        let cans = []
        _.forEach(list, (li, key) => {
          // Group:  "Genaral": "-------------",
          if (/^[-]{5,}$/.test(li)) {
            cans.push({ title: key })
          }
          // Simple: "nm": "Name",
          else if (_.isString(li)) {
            cans.push({
              text: li,
              value: key
            })
          }
          // Complex: "race": {...}
          else if (li.name) {
            cans.push({
              text: li.name,
              value: key,
              asDefault: li.asDefault
            })
          }
        })
        this.myCanFields = cans
      }
    }
    //.........................................
    let listConf = {
      dftLabelHoverCopy: false,
      display: ['<:fas-tag>', "text::flex-auto"],
      rowAsGroupTitle: {
        "title": "![BLANK]"
      },
      rowGroupTitleDisplay: "title"
    }
    //.........................................
    return {
      title: "i18n:wn-export-choose-fields",
      comType: "TiTransfer",
      comConf: {
        idBy: "value",
        options: this.myCanFields,
        value: "=fields",
        changeEventName: "output:fields",
        canComConf: _.assign({
          className: "as-grid col-2",
          border: false,
        }, listConf),
        selComConf: listConf
      },
      prepare: async function () {
        //console.log(this.tiComType, vm.value)
        await _load_fields()
      },
      prev: true,
      next: {
        enabled : false
      }
    }
  },
  //---------------------------------------------------
} 