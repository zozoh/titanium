const _M = {
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    FormFields() {
      if(this.group) {
        return this.genFormFieldsByGroup()
      }
      return this.genFormFields(this.value)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    genFormFieldsByGroup(){
      let list = []
      _.forEach(this.value, (val, key)=>{
        let grp = _.defaults(this.getFieldDefine(key), {
          title : key,
          name  : key,
          fields : this.genFormFields(val, key)
        })
        list.push(grp)
      })
      return list
    },
    //-----------------------------------------------
    genFormFields(data={}, groupName) {
      let list = []
      let keys = groupName ? [groupName] : []
      _.forEach(data, (v, k) => {
        let fld = _.defaults(this.getFieldDefine(k, groupName), {
          title : k,
          name  : _.concat(keys, k).join(".")
        })
        list.push(fld)
      })
      return list
    },
    //-----------------------------------------------
    getFieldDefine(name, group) {
      let keys = []
      if(group) {
        keys.push(`${group}.${name}`)
      }
      keys.push(name)
      keys.push("@default")

      let fld = Ti.Util.getFallbackNil(this.fields, ...keys)
      if(fld && fld.title) {
        fld = _.cloneDeep(fld)
        fld.title = Ti.S.renderBy(fld.title, {name, group})
      }
      return fld
    }
    //-----------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;