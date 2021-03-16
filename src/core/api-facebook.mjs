////////////////////////////////////////////
function getThumbImage(images=[], thumbMinHeight=320) {
  // Sort by image height
  images.sort((im1, im2)=>{
    return im1.height - im2.height
  })
  // Find the closest one
  for(let img of images) {
    if(img.height >= thumbMinHeight) {
      return img
    }
  }
  return _.first(images)
}
//------------------------------------------
function setImages(obj, images=[], {
  preview = {type : "font", value : "fas-images"},
  thumbMinHeight = 320
}={}) {
  let orgImg = _.first(images)
  let thumbImg = getThumbImage(images, thumbMinHeight)
  obj.width = _.get(orgImg, "width")
  obj.height = _.get(orgImg, "height")
  obj.src = _.get(orgImg, "source")
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
      setImages(photo, photo.images)   
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
    fields = "id,name,place,created_time,description,link,cover_photo",
    loadCover = false
  }={}) {
    let url = FBAPI(`${userId}/albums`)
    let reo = await Ti.Http.get(url, {
      params : {access_token, fields},
      as : "json"
    })
    let {data, paging} = reo
    // console.log(data)

    // Load cover photo
    if(loadCover) {
      for(let ab of data) {
        let photoId = _.get(ab, "cover_photo.id")
        if(photoId) {
          let photo = await TiApiFacebook.getPhoto({
            photoId, access_token
          })
          if(photo) {
            setImages(ab, photo.images)
            ab.cover_photo = photo
          }
        }
      }
    }

    return data
  }
  //----------------------------------------
}
////////////////////////////////////////////
export default TiApiFacebook;