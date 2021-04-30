////////////////////////////////////////////
/***
 * @param images{Array} : [{height,width,source:"https://xxx"}]
 * @param thumbMinHeight{Integer} :
 *  The min height, -1 mean the max one, 0 mean the min one.
 *  If a `>0` number has been given, it will find the closest image
 */
function getThumbImage(images=[], thumbMinHeight=320) {
  // Find the closest one
  let minImg;
  let maxImg;
  let fitImg;
  for(let img of images) {
    // Min image
    if(!minImg) {
      minImg = img
      fitImg = img
    }
    else if(img.height < minImg.height) {
      minImg = img
    }
    // Fit image
    if(thumbMinHeight > 0
      && fitImg.height > thumbMinHeight
      && img.height <= thumbMinHeight) {
      fitImg = img
    }
    // Max Image
    if(!maxImg) {
      maxImg = img
    }
    else if(img.height > maxImg.height) {
      maxImg = img
    }
  }
  if(thumbMinHeight < 0) {
    return maxImg
  }
  if(thumbMinHeight == 0) {
    return minImg
  }
  return fitImg
}
//------------------------------------------
function setImages(obj, images=[], {
  preview = {type : "font", value : "fas-images"},
  thumbMinHeight = 320
}={}) {
  let thumbImg = getThumbImage(images, thumbMinHeight)
  let realImg =  getThumbImage(images, -1)
  obj.width = _.get(realImg, "width")
  obj.height = _.get(realImg, "height")
  obj.src = _.get(realImg, "source")
  obj.thumb_src = _.get(thumbImg, "source")

  if(obj.thumb_src) {
    obj.preview = {
      type : "image",
      value : obj.thumb_src
    }
  } else {
    obj.preview = preview
  }
}
//------------------------------------------
function FBAPI(path, version="v10.0") {
  return `https://graph.facebook.com/${version}/${path}`
}
////////////////////////////////////////////
const TiApiFacebook = {
  //----------------------------------------
  setObjPreview(obj, images, options) {
    setImages(obj, images, options)
    return obj
  },
  //----------------------------------------
  async getAlbumPhotoList({
    albumId, 
    access_token,
    fields = "id,link,name,images,width,height"
  }={}){
    if(!albumId)
      return
    let url = FBAPI(`${albumId}/photos`)
    let reo = await Ti.Http.get(url, {
      params : {access_token, fields},
      as : "json"
    })
    let {data, paging} = reo

    // Setup thumb src
    for(let photo of data) {
      TiApiFacebook.setObjPreview(photo, photo.images)
    }

    return data
  },
  //----------------------------------------
  async getPhoto({
    photoId, 
    access_token,
    fields = "id,link,name,images,width,height"
  }={}){
    if(!photoId)
      return
    let url = FBAPI(`${photoId}`)
    let photo = await Ti.Http.get(url, {
      params : {access_token, fields},
      as : "json"
    })
    return photo
  },
  //----------------------------------------
  async getAlbumList({
    userId, 
    access_token,
    after,
    fields = "id,name,place,created_time,description,link,count,cover_photo"
  }={}) {
    let url = FBAPI(`${userId}/albums`)
    return await Ti.Http.get(url, {
      params : {access_token, fields, after},
      as : "json"
    })
  }
  //----------------------------------------
}
////////////////////////////////////////////
export default TiApiFacebook;