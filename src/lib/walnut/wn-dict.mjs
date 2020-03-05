///////////////////////////////////////////////////////////
const WnDict = {
  /***
   * Get or create a Ti.Dict
   * 
   * @param name{String} : Dictionary name
   * @param dict{Object} : Dictionary setting for create
   * ```
   * {
   *   data,   // Command | Array | Function
   *   query,  // Command
   *   item,   // Command
   *   value,  // "id"
   *   text,   // "title|name"
   *   icon,   // "icon"
   *   // If defined, it will auto-create the Dict instance when fail 
   *   // to get dict in cache.
   *   shadowed : true
   * }
   * ```
   * @param hooks{Array|Function}
   * 
   * @return {Ti.Dict}
   */
  getOrCreate(name, dict={}, hooks) {
    let shadowed = Ti.Util.fallback(dict.shadowed, true)
    let theDict = {}
    if(!_.isEmpty(dict)){
      theDict = {
        //...............................................
        data  : Wn.Util.genQuery(dict.data, {vkey:null}),
        query : Wn.Util.genQuery(dict.query),
        item  : Wn.Util.genQuery(dict.item),
        //...............................................
        getValue : Ti.Util.genGetter(dict.value),
        getText  : Ti.Util.genGetter(dict.text),
        getIcon  : Ti.Util.genGetter(dict.icon),
        //...............................................
      }
    }

    return Ti.DictFactory.GetDict(name, theDict, {shadowed, hooks})
  },
  /***
   * @return {Ti.Dict}
   */
  evalOptionsDict({
    options, findBy, itemBy,
    valueBy, textBy, iconBy
  }, hooks) {
    // Quck Dict Name
    let m = /^@Dict:(.+)$/.exec(options)
    if(m) {
      return Wn.Dict.checkDict(_.trim(m[1]))
    }

    // Explaint 
    return Ti.DictFactory.CreateDict({
      //...............................................
      data  : Wn.Util.genQuery(options, {vkey:null}),
      query : Wn.Util.genQuery(findBy),
      item  : Wn.Util.genQuery(itemBy),
      //...............................................
      getValue : Ti.Util.genGetter(valueBy || "id"),
      getText  : Ti.Util.genGetter(textBy  || "title|nm"),
      getIcon  : Ti.Util.genGetter(iconBy  || Wn.Util.getObjThumbIcon),
      //...............................................
      hooks
      //...............................................
    })
  },
  /***
   * Setup dictionary set
   */
  setup(dicts) {
    //console.log(dicts)
    _.forEach(dicts, (dict, name)=>{
      WnDict.getOrCreate(name, dict)
    })
  },
  //-------------------------------------------------------
  checkDict(dictName) {
    let d = WnDict.getOrCreate(dictName)
    if(!d) {
      throw Ti.Err.make(`e.dict.noexists : ${dictName}`, {dictName})
    }
    return d
  },
  //-------------------------------------------------------
  async getAll(dictName) {
    try {
      let $dict = WnDict.checkDict(dictName)
      return await $dict.getData()
    } catch(E) {
      console.error(`e.wn.dict.getAll : ${dictName}`, E)
    }
  },
  //-------------------------------------------------------
  async getText(dictName, val) {
    try {
      let $dict = WnDict.checkDict(dictName)
      return await $dict.getItemText(val)
    } catch(E) {
      console.error(`e.wn.dict.getAll : ${dictName}`, E)
    }
  },
  //-------------------------------------------------------
  async getIcon(dictName, val) {
    try {
      let $dict = WnDict.checkDict(dictName)
      return await $dict.getItemIcon(val)
    } catch(E) {
      console.error(`e.wn.dict.getAll : ${dictName}`, E)
    }
  }
  //-------------------------------------------------------
}
///////////////////////////////////////////////////////////
export default WnDict;