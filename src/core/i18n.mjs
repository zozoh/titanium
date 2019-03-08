//-----------------------------------
const I18N = {}
//-----------------------------------
export const Ti18n = {
  put(msgs) {
    _.assign(I18N, msgs)
  },
  get(key, dft) {
    let msg = I18N[key]
    if(_.isUndefined(msg)){
      if(_.isUndefined(dft))
        return key
      return dft
    }
    return msg
  },
  async load(name) {
    let url = Ti.Config.i18n(name)
    let msgs = await Ti.Load(url)
    Ti18n.put(msgs)
  }
}
//---------------------------------------
export default Ti18n

