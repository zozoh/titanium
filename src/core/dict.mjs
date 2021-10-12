///////////////////////////////////////////////
// const K = {
//   item      : Symbol("item"),
//   data      : Symbol("data"),
//   query     : Symbol("query"),
//   children  : Symbol("children"),
//   getValue  : Symbol("getValue"),
//   getText   : Symbol("getText"),
//   getIcon   : Symbol("getIcon"),
//   isMatched : Symbol("isMatched"),
//   itemCache : Symbol("itemCache"),
//   dataCache : Symbol("dataCache"),
//   hooks     : Symbol("hooks"),
//   shadowed  : Symbol("shadowed")
// }
const K = ["item", "data", "query", "children",
  "getValue", "getText", "getIcon", "isMatched",
  "itemCache", "dataCache", "hooks", "shadowed"]
///////////////////////////////////////////////
export class Dict {
  //-------------------------------------------
  constructor() {
    this.__item_loading = {}
    this.hooks = []
    this.shadowed = false
    this.item = _.idendity
    this.data = () => []
    this.dataChildrenKey = null,
      this.query = v => []
    this.children = v => []
    this.getValue = v => Ti.Util.getFallback(v, "value", "id")
    this.getText = v => Ti.Util.getFallback(v, "text", "title", "name", "nm")
    this.getIcon = v => _.get(v, "icon")
    this.isMatched = (it, v) => {
      //console.log("match", it, v)
      let itV = this.getValue(it)
      if ( v == itV || _.isEqual(v, itV))
        return true
      if (_.isString(itV) && _.isString(v)) {
        let itV2 = _.toLower(itV)
        let v2 = _.toLower(v)
        if (itV2.indexOf(v2) >= 0) {
          return true
        }
      }
      let itT = this.getText(it)
      if (itT && itT.indexOf(v) >= 0)
        return true
      return false
    }
    //-------------------------------------------
    this.itemCache = {}    // {val-item}
    this.dataCache = null  // last query result for data
  }
  //-------------------------------------------
  // Funcs
  //-------------------------------------------
  setShadowed(shadowed = false) {
    this.shadowed = shadowed
  }
  isShadowed() {
    return this.shadowed
  }
  //-------------------------------------------
  addHooks(...hooks) {
    let list = _.flattenDeep(hooks)
    _.forEach(list, hk => {
      if (_.isFunction(hk)) {
        this.hooks.push(hk)
      }
    })
  }
  //-------------------------------------------
  clearHooks() {
    this.hooks = []
  }
  //-------------------------------------------
  doHooks(loading = false) {
    for (let hk of this.hooks) {
      hk({ loading })
    }
  }
  //-------------------------------------------
  invoke(methodName, ...args) {
    let func = this[methodName]
    if (_.isFunction(func)) {
      return func.apply(this, [...args, this])
    }
  }
  //-------------------------------------------
  async invokeAsync(methodName, ...args) {
    let func = this[methodName]
    if (_.isFunction(func)) {
      let are = await func.apply(this, [...args, this])
      // console.log("invokeAsync", methodName, ...args)
      // console.log(" ==>", are)
      return are
    }
  }
  //-------------------------------------------
  setFunc(methods) {
    _.forEach(methods, (func, methodName) => {
      if (_.isFunction(func)) {
        this[methodName] = func
      }
    })
  }
  //-------------------------------------------
  duplicate({ hooks = false, cache = true, dataCache = true, itemCache = true } = {}) {
    let d = new Dict()
    _.forEach(K, (s_key) => {
      d[s_key] = this[s_key]
    })
    if (!hooks) {
      d.hooks = []
    }
    if (!cache) {
      d.itemCache = {}
      d.dataCache = null
    }
    if (!dataCache) {
      d.dataCache = null
    }
    if (!itemCache) {
      d.itemCache = {}
    }
    return d
  }
  //-------------------------------------------
  // Cache
  //-------------------------------------------
  isItemCached(val) {
    return !Ti.Util.isNil(this.itemCache[val])
  }
  //-------------------------------------------
  addItemToCache(it, val) {
    it = Ti.Util.fallback(it, null)
    let itV = val
    if (Ti.Util.isNil(itV)) {
      itV = this.getValue(it)
    }

    if (!_.isUndefined(it) && !Ti.Util.isNil(itV)) {
      this.itemCache[itV] = it
    }

    // Cache the children
    if (this.dataChildrenKey) {
      let subItems = it[this.dataChildrenKey]
      if (_.isArray(subItems) && subItems.length > 0) {
        for (let subIt of subItems) {
          this.addItemToCache(subIt)
        }
      }
    }
  }
  //-------------------------------------------
  clearCache() {
    this.itemCache = {}    // {val-item}
    this.dataCache = null  // last query result for data
  }
  //-------------------------------------------
  // Utility
  //-------------------------------------------
  findItem(val, list = []) {
    for (let it of list) {
      let itV = this.getValue(it)
      if (_.isEqual(val, itV)) {
        return it
      }
    }
  }
  //-------------------------------------------
  // Core Methods
  //-------------------------------------------
  async getItem(val) {
    // if("7dq8t02lo8hh2rjknlrudufeka" == val) {
    //   console.log("!!! getItem")
    // }
    // Guard
    if (Ti.Util.isNil(val)) {
      return null
    }
    //console.log("Dict.getItem", val)
    // Match cache
    let it = this.itemCache[val]
    // Not in cache, try getItem
    if (_.isUndefined(it)) {
      // If is loading, return the promise
      let loading = this.__item_loading[val]
      if (loading) {
        return await new Promise((resolve) => {
          loading.push(resolve)
        })
      }

      // Setup loading
      loading = []
      this.__item_loading[val] = loading

      // Do load item ...
      //console.log("getItem", val)
      this.doHooks(true)
      it = await this.invokeAsync("item", val)
      this.doHooks(false)
      if (it && _.isPlainObject(it)) {
        this.addItemToCache(it, val)
      }

      // Release loading
      for (let resolve of loading) {
        resolve(it || null)
      }
      delete this.__item_loading[val]
    }
    // Warn !!
    // 不知道什么时候，在 anju 项目，总出现返回值为空数组 `[]`
    // 诡异啊，加个 log 观察一下
    if (_.isArray(it)) {
      console.warn("!!!! Dict.getItem=>[] !!! 靠，又出现了 val=", val)
    }

    if (this.isShadowed())
      return _.cloneDeep(it)
    return it
  }
  //-------------------------------------------
  async getData(force = false) {
    let list = this.dataCache
    if (force || _.isEmpty(list)) {
      this.doHooks(true)
      list = await this.invokeAsync("data")
      this.doHooks(false)
      // Cache items
      _.forEach(list, (it, index) => {
        if (!_.isPlainObject(it)) {
          it = { text: it, value: it }
          list[index] = it
        }
        this.addItemToCache(it)
      })
      // Cache list
      this.dataCache = list
    }
    if (this.isShadowed())
      return _.cloneDeep(list) || []
    return list || []
  }
  //-------------------------------------------
  async queryData(str) {
    //console.log("@Dict.queryData", str)
    // Empty string will take as query all
    let s = _.trim(str)
    let list;
    if (!s) {
      list = await this.getData()
      return list
    }
    // Find by string
    this.doHooks(true)
    list = await this.invokeAsync("query", s)
    this.doHooks(false)
    // Cache items
    _.forEach(list, it => {
      this.addItemToCache(it)
    })

    if (this.isShadowed())
      return _.cloneDeep(list) || []
    return list || []
  }
  //-------------------------------------------
  async getChildren(val) {
    //console.log("@Dict.queryData", str)
    // Empty string will take as query all
    if (!val) {
      return await this.getData()
    }
    // Find by string
    this.doHooks(true)
    let list = await this.invokeAsync("children", val)
    this.doHooks(false)
    // Cache items
    _.forEach(list, it => {
      this.addItemToCache(it)
    })

    if (this.isShadowed())
      return _.cloneDeep(list) || []
    return list || []
  }
  //-------------------------------------------
  // getValue(it)   { return this.invoke("getValue",  it) }
  // getText(it)    { return this.invoke("getText" ,  it) }
  // getIcon(it)    { return this.invoke("getIcon" ,  it) }
  // isMatched(it,v){ return this.invoke("isMatched", it, v) }
  //-------------------------------------------
  getBy(vKey = ".text", it, dft) {
    // Text
    if (!vKey || ".text" == vKey) {
      return this.getText(it)
    }
    // Icon
    if (".icon" == vKey) {
      return this.getIcon(it)
    }
    // Value
    if (".value" == vKey) {
      return this.getValue(it)
    }
    // Other key
    return Ti.Util.fallback(Ti.Util.getOrPick(it, vKey), dft, this.getValue(it))
  }
  //-------------------------------------------
  async checkItem(val) {
    let it = await this.getItem(val)
    if (!it) {
      throw Ti.Err.make("e.dict.no-item", { dictName, val })
    }
    return it
  }
  //-------------------------------------------
  async getItemText(val) {
    let it = await this.getItem(val)
    //console.log("getItemText", {it,val})
    if (it) {
      return this.getText(it)
    }
  }
  //-------------------------------------------
  async getItemIcon(val) {
    let it = await this.getItem(val)
    if (it) {
      return this.getIcon(it)
    }
  }
  //-------------------------------------------
  async getItemAs(vKey, val) {
    let it = await this.getItem(val)
    if (it) {
      return this.getBy(vKey, it, val)
    }
  }
  //-------------------------------------------
}
///////////////////////////////////////////////
/*
Static dictionary instances
{
  $DICT_NAME : {Dict}
  ...
}
*/
const DICTS = {}
/*
Dynamic dictionary instances
{
  definations: {
    $DICT_NAME: Function(input):Dict
    ...
  }
  instances: {
    $DICT_NAME : {
      "$INPUT" : Dict
      ...
    }
    ...
  }
}
*/
const DYNAMIC_DICTS = {
  definations: {},
  instances: {}
}
///////////////////////////////////////////////
export const DictFactory = {
  //-------------------------------------------
  __debug_static() { return DICTS },
  __debug_dynamic() { return DYNAMIC_DICTS },
  //-------------------------------------------
  DictReferName(str) {
    if (_.isString(str)) {
      let m = /^(@Dict:|#)(.+)$/.exec(str)
      if (m) {
        return _.trim(m[2])
      }
    }
  },
  //-------------------------------------------
  GetOrCreate(options = {}, { hooks, name } = {}) {
    let d;
    // Aready a dict
    if (options.data instanceof Dict) {
      d = options.data
    }
    // Pick by Name
    else {
      let dictName = name || DictFactory.DictReferName(options.data)
      if (dictName) {
        d = DICTS[dictName]
      }
    }
    // Try return 
    if (d) {
      if (hooks) {
        d = d.duplicate({ hooks: false })
        d.addHooks(hooks)
      }
      return d
    }
    // Create New One
    return DictFactory.CreateDict(options, { hooks, name })
  },
  //-------------------------------------------
  CreateDict({
    data, query, item, children,
    dataChildrenKey,
    getValue, getText, getIcon,
    isMatched, shadowed
  } = {}, { hooks, name } = {}) {
    // if(!name)
    //   console.log("CreateDict", {data, dataChildrenKey})
    //.........................................
    if (_.isString(data) || _.isArray(data)) {
      let aryData = Ti.S.toObjList(data)
      data = () => aryData
    }
    // Default data
    else if (!data) {
      data = () => []
    }
    //.........................................
    if (!item) {
      item = async (val, $dict) => {
        // Load all data
        await $dict.getData()
        // Get the item
        //return await $dict.getItem(val)
        return $dict.itemCache[val]
      }
    }
    //.........................................
    if (!query) {
      // Look up each item
      query = async (v, $dict) => {
        let aryData = await $dict.getData()
        let list = []
        for (let it of aryData) {
          if ($dict.isMatched(it, v)) {
            list.push(it)
          }
        }
        return list
      }
    }
    //.........................................
    if (!children) {
      children = () => []
    }
    //.........................................
    // if(!isMatched) {
    //   isMatched = (it, v, $dict)=>{
    //     let itV = $dict.getValue(it)
    //     return _.isEqual(itV, v)
    //   }
    // }
    //.........................................
    let d = new Dict()
    d.dataChildrenKey = dataChildrenKey
    d.setFunc({
      data, query, item, children,
      getValue, getText, getIcon,
      isMatched
    })
    //.........................................
    if (name) {
      DICTS[name] = d
    }
    //.........................................
    if (shadowed) {
      d.setShadowed(shadowed)
    }
    //.........................................
    if (hooks) {
      d.addHooks(hooks)
    }
    return d
  },
  //-------------------------------------------
  /***
   * @param name{String} : Dict name in cache
   * @param shadowed{Boolean} : Create the shadown version
   * @param hooks{Array|Function} : add hooks for it
   * ```
   * @return {Ti.Dict}
   */
  GetDict(name, hooks) {
    // Try get
    let d = DICTS[name]

    // Return shadowed ? 
    if (d && hooks) {
      d = d.duplicate({ hooks: false })
      d.addHooks(hooks)
    }
    return d
  },
  //-------------------------------------------
  CheckDict(dictName, hooks) {
    // Already in cache
    let d = DictFactory.GetDict(dictName, hooks)
    if (d) {
      return d
    }
    // Maybe should create a shadow one.
    let { name, args } = DictFactory.explainDictName(dictName)
    d = DictFactory.GetDict(name, hooks)
    if (d) {
      // Return the mask dict
      // args[0] will -> getData -> getChildren(args[0])
      if (!_.isEmpty(args)) {
        let d2 = d.duplicate({ hooks: true, dataCache: false })
        d2.setFunc({
          data: function () {
            return this.getChildren(...args)
          }
        })
        // Cache D2
        DICTS[dictName] = d2

        // Then Return
        return d2
      }
      return d
    }
    throw `e.dict.noexists : ${dictName}`
  },
  //-------------------------------------------
  // dickName(args):valueKey
  explainDictName(dictName) {
    let re = {}
    let m = /^([^:()]+)(\(([^)]*)\))?(:(.+))?$/.exec(dictName)
    if (m) {
      re.name = m[1]
      re.args = Ti.S.joinArgs(m[3])
      re.vkey = m[5]
      if (re.args.length == 1 && /^=/.test(re.args[0])) {
        re.dynamic = true
        re.dictKey = _.trim(re.args[0].substring(1))
      }
    }
    return re
  },
  //-------------------------------------------
  CreateDynamicDict(factory, name) {
    if (name && _.isFunction(factory)) {
      DYNAMIC_DICTS.definations[name] = factory
    } else {
      console.error("Can not CreateDynamicDict", { factory, name })
    }
  },
  //-------------------------------------------
  GetDynamicDict({ name, key, vars } = {}, hooks) {
    // Try get
    let dKey = `${name}.${key}`
    let d = _.get(DYNAMIC_DICTS.instances, dKey)
    //console.log("GetDynamicDict", {name, key, vars})
    // Create New instance
    if (!d) {
      let dd = DYNAMIC_DICTS.definations[name]
      if (!dd) {
        return null
      }
      // Create instance
      d = dd(vars)
      if (!d) {
        return null
      }
      // Save instance
      _.set(DYNAMIC_DICTS.instances, dKey, d)
    }

    // Return shadowed ? 
    if (d && hooks) {
      d = d.duplicate({ hooks: false })
      d.addHooks(hooks)
    }
    return d
  },
  //-------------------------------------------
  CheckDynamicDict({ name, key, vars } = {}, hooks) {
    // Already in cache
    let d = DictFactory.GetDynamicDict({ name, key, vars }, hooks)
    if (d) {
      return d
    }
    throw `e.dict.dynamic.WithoutDefined : ${JSON.stringify({ name, key, vars })}`
  },
  //-------------------------------------------
  /***
   * @param dName{String} : like `Sexes:.icon`
   */
  async getBy(dName, val) {
    // Guard 1
    if (Ti.Util.isNil(val)) {
      return val
    }
    // Check if the name indicate the itemValueKey
    let { name, vKey } = DictFactory.explainDictName(dName)
    let $dict = DictFactory.CheckDict(name)
    return await $dict.getItemAs(vKey, val)
  },
  //-------------------------------------------
  async getAll(dictName) {
    try {
      let $dict = DictFactory.CheckDict(dictName)
      return await $dict.getData()
    } catch (E) {
      console.error(`e.dict.getAll : ${dictName}`, E)
    }
  },
  //-------------------------------------------
  async getText(dictName, val) {
    try {
      let $dict = DictFactory.CheckDict(dictName)
      return await $dict.getItemText(val)
    } catch (E) {
      console.error(`e.dict.getText : ${dictName}`, E)
    }
  },
  //-------------------------------------------
  async getIcon(dictName, val) {
    try {
      let $dict = DictFactory.CheckDict(dictName)
      return await $dict.getItemIcon(val)
    } catch (E) {
      console.error(`e.dict.getIcon : ${dictName}`, E)
    }
  },
  //-------------------------------------------
}
///////////////////////////////////////////////