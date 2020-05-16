////////////////////////////////////////////////////
async function EditTiComponent({comType,comConf}={}, {
  icon= "fas-pencil-ruler",
  title= "i18n:edit-com", 
  type   = "info", 
  closer = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position   = "top",
  width      = 800,
  height     = "90%",
  spacing
}={}){
  //............................................
  return await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    icon, title,
    textOk, textCancel,
    //------------------------------------------
    comType : "hmaker-edit-com",
    comConf : {
      value: {comType, comConf}
    },
    //------------------------------------------
    result: {
      comType : comType, 
      comConf : _.cloneDeep(comConf)
    },
    //------------------------------------------
    components : ["@com:hmaker/edit-com"]
    //------------------------------------------
  })
}
////////////////////////////////////////////////////
export default EditTiComponent;