//-----------------------------------
export const TiCss = {
  toSize(sz) {
    if(_.isNumber(sz) || /^[0-9]+$/.test(sz)) {
      if(sz>-1 && sz<1)
        return sz*100 + "%"
      return sz + "px"
    }
    return sz
  }
}
//---------------------------------------
export default TiCss
