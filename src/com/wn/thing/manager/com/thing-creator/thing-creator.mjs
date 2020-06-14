export default {
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
    "onlyFields" : {
      type: Boolean,
      default: false
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

      await Ti.App(this).dispatch("main/create", this.myData)
      this.$notify("block:hide", "creator")
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