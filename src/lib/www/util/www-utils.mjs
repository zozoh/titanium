export default {
  //---------------------------------------
  // Generate Preview Object for Item
  genPreviewObj(
    obj={},
    imgKey="thumb",
    iconKey="icon",
    src="/api/thumb",
    dftIcon="broken_image"
  ) {
    // Thumbnail
    if(obj[imgKey]) {
      let imgSrc = Ti.S.renderBy(src, obj)
      return {type:"img", value:imgSrc}
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