export default {
  //////////////////////////////////////////
  data: ()=>({
    // When media loaded, mark in the array
    // Then I can known if the whole content ready or not
    myMedias : []
  }),
  //////////////////////////////////////////
  watch : {
    "ArticleHtml" : "redrawContent",
    "viewportMode": function(newVal, oldVal) {
      if(oldVal && !_.isEqual(newVal, oldVal)) {
        this.redrawContent()
      }
    }
  },
  //////////////////////////////////////////
  mounted: async function() {
    await this.redrawContent()
  }
  //////////////////////////////////////////
}