export default {
  ////////////////////////////////////////////
  data: () => ({
    myContent: undefined
  }),
  ////////////////////////////////////////////
  props: {
    "meta": {
      type: Object,
      default: () => ({})
    },
    "blankAs": {
      type: Object,
      default: () => ({
        className: "as-big",
        icon: "fas-align-justify",
        text: "i18n:empty"
      })
    },
  },
  ////////////////////////////////////////////
  computed: {
    //----------------------------------------
    isEmpty() {
      return _.isEmpty(this.myContent)
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  methods: {
    //----------------------------------------
    async reloadContent() {
      if (!this.meta) {
        this.myContent = undefined
      } else {
        this.myContent = await Wn.Io.loadContent(this.meta)
      }
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  watch: {
    "meta": {
      handler: "reloadContent",
      immediate: true
    }
  }
  ////////////////////////////////////////////
}