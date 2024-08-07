export default {
  ///////////////////////////////////////////
  //inject: ["$ThingManager"],
  ///////////////////////////////////////////
  data : ()=>({
    "myData" : undefined,
    "creating" : false
  }),
  ///////////////////////////////////////////
  props : {
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "form": {
      type : Object,
      default : ()=>({})
    },
    "fixed": {
      type: Object,
      default: undefined
    }
  },
  ///////////////////////////////////////////
  computed: {
    TheData() {
      return this.myData || this.data
    },
    TheForm() {
      return _.assign({
        onlyFields: false,
        adjustDelay: 0
      }, this.form)
    }
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnFormInit($form) {
      this.$form = $form
    },
    //--------------------------------------
    OnFormFieldChange(pair={}) {
      //console.log("OnFormFieldChange", pair)
      this.myData = this.$form.getData(pair)
    },
    //--------------------------------------
    OnFormChange(data) {
      //console.log("OnFormChange", data)
      this.myData = data
    },
    //--------------------------------------
    async OnCreate() {
      this.creating = true
      let reo;
      let $ThingManager = this.tiParentCom("WnThingManager")
      if(!$ThingManager) {
        $ThingManager = this.tiParentCom("WnThAdaptor")
      }
      reo = await $ThingManager.dispatch("create", this.myData)
      this.creating = false
      if(reo && !(reo instanceof Error)) {
        this.$notify("block:hide", "creator")
      }
    },
    //--------------------------------------
    async OnSubmit() {
      this.$nextTick(()=>{
        this.OnCreate()
      })
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted() {
    this.myData = this.$form.getData()
  }
  ///////////////////////////////////////////
}