const _M = {
  //--------------------------------------
  //
  //           Batch Update
  //
  //--------------------------------------
  async batchUpdate() {
    //....................................
    // Prepare the data
    if(_.isEmpty(this.checkedItems)) {
      return Ti.Toast.Open("i18n:batch-none", "warn")
    }
    let current = _.first(this.checkedItems)
    //....................................
    let batch = _.get(this.config, "schema.behavior.batch") || {}
    _.defaults(batch, {
      "comType" : "wn-obj-form",
      "comConf" : {},
      "fields" : "schema.meta.comConf.fields",
      "names" : null,
      "valueKey": "data"
    })
    batch.comType = _.kebabCase(batch.comType)
    // Add default setting
    if(/^(ti-|wn-obj-)(form)$/.test(batch.comType)) {
      _.defaults(batch.comConf, {
        autoShowBlank: false,
        updateBy: true,
        setDataBy: true
      })
    }
    //....................................
    let name_filter;
    if(_.isString(batch.names)) {
      if(batch.names.startsWith("^")){
        let regex = new RegExp(batch.names)
        name_filter = fld => regex.test(fld.name)
      }
      else if(batch.names.startsWith("!^")){
        let regex = new RegExp(batch.names.substring(1))
        name_filter = fld => !regex.test(fld.name)
      }
      else {
        let list = Ti.S.toArray(batch.names)
        name_filter = fld => list.indexOf(fld.name)>=0
      }
    }
    // Filter by Array
    // TODO maybe I should use the validate
    else if(_.isArray(batch.names) && !_.isEmpty(batch.names)) {
      name_filter = v => batch.name.indexOf(v)>=0
    }
    // Allow all
    else {
      name_filter = fld => {
        //console.log(fld)
        // It is dangour when batch update
        // Many thing item may refer to same file
        if(/^(wn-upload-file|wn-imgfile)$/.test(fld.comType))
          return false
        return true
      }
    }

    //....................................
    // Prepare the fields
    let fields = _.get(this.config, batch.fields)
    //....................................
    // Define the filter processing
    let vm = this
    const do_filter_fields = function(flds=[], filter) {
      let list = []
      for(let fld of flds) {
        // Group
        if(_.isArray(fld.fields)) {
          let f2 = _.cloneDeep(fld)
          f2.fields = do_filter_fields(fld.fields, filter)
          if(!_.isEmpty(f2.fields)) {
            list.push(f2)
          }
        }
        // Fields
        else if(filter(fld)) {
          let f2 = Ti.Util.explainObj(vm, fld)
          list.push(f2)
        }
      }
      return list
    }
    //....................................
    // filter each fields
    fields = do_filter_fields(fields, name_filter)
    //....................................
    // Open the Modal
    let updates = await Ti.App.Open({
      title: "i18n:batch-update",
      width: 640,
      height: "90%",
      position: "top",
      //............................
      comType: "inner-body",
      //............................
      components: [{
        name: "inner-body",
        globally : false,
        data: {
          update: {},
          value: current,
          innerComConf: {
            ... batch.comConf,
            fields
          }
        },
        template: `<${batch.comType}
          v-bind="innerComConf"
          :${batch.valueKey}="value"
          @field:change="OnFieldChange"
          @change="OnChange"/>`,
        methods: {
          OnFieldChange({name, value}){
            _.set(this.update, name, value)
            this.$notify("change", this.update)
          },
          OnChange(payload) {
            this.value = payload
          }
        }
      }]
      //............................
    })
    //....................................
    if(!_.isEmpty(updates)) {
      // Get all checkes
      await this.dispatch("batchUpdateMetas", updates)
    }
  },
  //--------------------------------------
  //
  //      Utility: show/hide block
  //
  //--------------------------------------
  changeShown(shown={}) {
    this.dispatch("doChangeShown", shown)
  },
  //--------------------------------------
  showBlock(name) {
    //console.log("showBlock", name)
    // If creator, then must leave the recycle bin
    if("creator" == name) {
      if(this.status.inRecycleBin) {
        Ti.Alert("i18n:thing-create-in-recyclebin", {
          title : "i18n:warn",
          icon  : "im-warning",
          type  : "warn"
        })
        return
      }
    }
    if("files" == name) {
      this.dispatch("reloadFiles")
    }
    else if("content" == name) {
      this.dispatch("current/reload")
    }
    // Mark block
    this.dispatch("doChangeShown", {[name]:true})
  },
  //--------------------------------------
  hideBlock(name) {
    this.dispatch("doChangeShown", {[name]:false})
  },
  //--------------------------------------
  toggleBlock(name) {
    this.dispatch("doChangeShown", {
      [name]: !this.TheShown[name]
    })
  },
  //--------------------------------------
  //
  //           Utility: Others
  // 
  //--------------------------------------
  async invoke(fnName, ...args) {
    //console.log("invoke ", fnName, args)
    let fn = _.get(this.SchemaMethods, fnName)
    // Invoke the method
    if(_.isFunction(fn)) {
      return await fn.apply(this, args)
    }
    // Throw the error
    else {
      throw Ti.Err.make("e.thing.fail-to-invoke", fnName)
    }
  }
  //--------------------------------------
}
export default _M;