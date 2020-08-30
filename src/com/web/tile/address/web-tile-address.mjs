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
    "can": {
      type: Object,
      default: ()=>({
        remove  : true,
        edit    : true,
        default : true
      })
    },
    // If false emit the item after mapping
    "emitRawValue": {
      type: Boolean,
      default: true
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-highlight": this.Item.dftaddr
      })
    },
    //--------------------------------------
    Item() {
      let it = Ti.Util.translate(this.value, this.mapping)
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
    getEmitValue() {
      let v = this.emitRawValue ? this.value : this.Item
      return _.cloneDeep(v)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;