const _M = {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "mapping": {
      type: Object,
      default: ()=>({
        id : "id",
        country  : "country",
        postcode : "postcode",
        province: "province",
        city: "city",
        street: "street",
        door: "door",
        consignee: "consignee",
        phone: "phone",
        email: "email",
        dftaddr: "dftaddr"
      })
    },
    // {"HK":"Hong Kong","TW":"Taiwan","MO":"Macao"}
    "countries": {
      type: Object,
      default: undefined
    },
    "showCountry": {
      type: Boolean,
      default:true
    },
    // If indicate this prop, it will replace the left-top title display
    "title" : {
      type: String,
      default: undefined
    },
    "can": {
      type: Object,
      default: ()=>({
        remove  : true,
        edit    : true,
        default : true,
        choose  : false
      })
    },
    // If false emit the item after mapping
    "emitRawValue": {
      type: Boolean,
      default: true
    },
    // Auto highlight the default address
    "autoHighlight" : {
      type: Boolean,
      default: true
    },
    // Indicate the highlight ID
    "currentId" : {
      type: String,
      default: undefined
    },
    "blankAs" : {
      type : Object,
      default : ()=>({
        icon : "im-location",
        text : "i18n:address-nil"
      })
    },
    "selectable": {
      type: Boolean,
      default: false
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      let high = false
      if(_.isUndefined(this.currentId)) {
        if(this.autoHighlight && this.Item.dftaddr) {
          high = true
        }
      } else {
        high = this.currentId == this.Item.id
      }
      return this.getTopClass({
        "is-highlight": high,
        "is-selectable" : this.selectable
      })
    },
    //--------------------------------------
    hasValue() {
      return !_.isEmpty(this.value)
    },
    //--------------------------------------
    Item() {
      let it = Ti.Util.translate(this.value, this.mapping) || {}
      if(this.countries) {
        it.countryName = this.countries[it.country]
      } else {
        it.countryName = it.country
      }
      return it
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickTop() {
      if(this.selectable) {
        let v = this.getEmitValue()
        this.$notify('select', v)  
      }
    },
    //--------------------------------------
    OnRemove(){
      let v = this.getEmitValue()
      this.$notify('remove', v)
    },
    //--------------------------------------
    OnSetDefault(){
      let v = this.getEmitValue()
      this.$notify('set:default', v)
    },
    //--------------------------------------
    OnEdit(){
      let v = this.getEmitValue()
      this.$notify('edit', v)
    },
    //--------------------------------------
    OnChoose(){
      let v = this.getEmitValue()
      this.$notify('choose', v)
    },
    //--------------------------------------
    getEmitValue() {
      let v = this.emitRawValue ? this.value : this.Item
      return _.cloneDeep(v)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;