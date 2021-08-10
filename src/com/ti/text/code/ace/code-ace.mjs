const _M = {
  ///////////////////////////////////////////////////
  data: () => ({
    myValue: undefined
  }),
  ///////////////////////////////////////////////////
  computed: {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-----------------------------------------------
    BlankComStyle() {
      return {
        position: "absolute",
        top: 0, right: 0, bottom: 0, left: 0,
        zIndex: 10
      }
    },
    //-----------------------------------------------
    isContentLoading() {
      return _.isUndefined(this.value)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods: {
    //-----------------------------------------------
    initEditor() {
      // Create editor
      let editor = ace.edit(this.$refs.edit);
      editor.setTheme(`ace/theme/${this.theme}`)
      editor.setOptions(this.options || {})
      editor.session.setMode(`ace/mode/${this.mode}`)
      editor.session.setValue(this.value || "")

      // Events
      editor.session.on("change", (delta) => {
        let str = editor.getValue() || ""
        this.myValue = str
        this.$notify("change", str)
      })

      // Save instance
      this.$editor = editor
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch: {
    "mode": function (newVal, oldVal) {
      if (newVal && newVal != oldVal) {
        this.$editor.session.setMode(`ace/mode/${newVal}`)
      }
    },
    "theme": function (newVal, oldVal) {
      if (newVal && newVal != oldVal) {
        this.$editor.setTheme(`ace/theme/${newVal}`)
      }
    },
    "value": function (newVal) {
      if (Ti.Util.isNil(this.myValue) || newVal != this.myValue) {
        this.$editor.session.setValue(newVal || "")
      }
    }
  },
  ///////////////////////////////////////////////////
  mounted: async function () {
    this.initEditor()
  }
  ///////////////////////////////////////////////////
}
export default _M;