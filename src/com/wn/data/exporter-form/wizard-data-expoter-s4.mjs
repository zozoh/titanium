export default {
  //---------------------------------------------------
  Step4Finished() {
    let vm = this
    return {
      title: "i18n:wn-export-done",
      prepare: async function () {
        let oTa = await vm.LoadTarget(this.value)
        // just return a path
        if (_.isString(oTa)) {
          oTa = await Wn.Io.loadMeta(oTa)
        }
        this.$notify("change", {
          ... this.value,
          target: oTa
        })
      },
      comType: "WebMetaBadge",
      comConf: {
        className: "is-success",
        value: ":=target",
        icon: "fas-check-circle",
        title: "i18n:wn-export-done-ok",
        brief: "i18n:wn-export-done-tip",
        links: [{
          icon: "fas-download",
          text: ":=target.nm",
          href: ":->/o/content?str=id:${target.id}&d=true",
          newtab: true
        }, {
          icon: "fas-external-link-alt",
          text: "i18n:wn-export-open-dir",
          href: ":=>Wn.Util.getAppLink(target)",
          newtab: true
        }]
      }
    }
  }
  //---------------------------------------------------
}