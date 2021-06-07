export default {
  //////////////////////////////////////////
  data: ()=>({
    // When media loaded, mark in the array
    // Then I can known if the whole content ready or not
    myMedias : []
  }),
  //////////////////////////////////////////
  watch : {
    "ArticleHtml" : "redrawContent"
  },
  //////////////////////////////////////////
  mounted: async function() {
    await this.redrawContent()
  }
  //////////////////////////////////////////
}