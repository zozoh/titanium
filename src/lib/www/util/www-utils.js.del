export default {
  //---------------------------------------
  // Generate Preview Object for Item
  genPreviewObj(
    obj={},
    src="/api/thumb?id:${id}",
    dftIcon="broken_image",
    {
      imgKey="thumb",
      iconKey="icon"
    }= {}
  ) {
    // if("30a87ogcf6j6jqfcf78r7mj4ha" == obj.id) {
    //   console.log("genPreviewObj", obj)
    // }
    // Thumbnail
    if(obj[imgKey]) {
      let imgSrc = Ti.S.renderBy(src, obj)
      return {type:"image", value:imgSrc}
    }
    // Icon Font
    return obj[iconKey] || dftIcon
  },
  //---------------------------------------
  // Generate Preview Object for Item
  genLink(obj={}, link="page/to?id=${id}") {
    return Ti.S.renderBy(link, obj)
  }
  //---------------------------------------
}