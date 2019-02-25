//-----------------------------------
const I18N = {}
//-----------------------------------
export const Ti18n = {
  put(msgs) {
    _.assign(I18N, msgs)
  },
  get(key) {
    return I18N[key] || key
  },
  async load(name) {
    let url = Ti.Config.i18n(name)
    let msgs = await Ti.Load(url)
    Ti18n.put(msgs)
  }
}
//---------------------------------------
export default Ti18n

