export default {
  //////////////////////////////////////////
  data: () => ({
    // When media loaded, mark in the array
    // Then I can known if the whole content ready or not
    myMedias: []
  }),
  //////////////////////////////////////////
  watch: {
    "ArticleHtml": "redrawContent",
    "viewportMode": function (newVal, oldVal) {
      if (oldVal && !_.isEqual(newVal, oldVal)) {
        this.redrawContent();
      }
    }
  },
  //////////////////////////////////////////
  mounted: async function () {
    await this.redrawContent();

    this.DelegateClick = (evt, b) => {
      let $el = Ti.Dom.closest(evt.target, "[data-ti-emit]", {
        includeSelf: true
      });
      if ($el) {
        let emitName = _.trim($el.getAttribute("data-ti-emit"));
        this.$notify(emitName, { target: $el });
      }
    };

    this.$refs.main.addEventListener("click", this.DelegateClick);
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    this.$refs.main.removeEventListener("click", this.DelegateClick);
  }
  //////////////////////////////////////////
};
