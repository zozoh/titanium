//---------------------------------------
function do_map_xxx(modPath, setting) {
  const re = {}
  _.forOwn(setting, (val, key)=>{
    let methodName = "map"+_.capitalize(key)
    // Map namespaced module
    if(modPath) {
      _.assign(re, Vuex[methodName](modPath, val))
    }
    // Map general
    else {
      _.assign(re, Vuex[methodName](val))
    }
  })
  return re
}
//---------------------------------------
function do_extend_setting(store, obj) {
  let is_extendable = false;
  let re = {}
  _.forOwn(obj, (val, key, obj)=>{
    let m = /^\.{3}(.*)$/.exec(key)
    if(m) {
      is_extendable = true
      let modPath = m[1]
      if(store) {
        _.assign(re, do_map_xxx(modPath, val))
      }
    }
  })
  return is_extendable ? re : obj
}
//---------------------------------------
function $vm($el) {

}
//---------------------------------------
export const TiVue = {
  /***
   * Install the Vue Plugin for i18n filter etc.
   */
  install() {
    Vue.use({install:(Vue)=>{
      // Filter: i18n
      Vue.filter("i18n", function(val){
        if(/^i18n:(.+)/.test(val)) {
          return Ti.I18n.text(val)
        }
        return Ti.I18n.get(val)
      })
      //................................
      // Directive: v-drop-files
      //  - value : f() | [f(), "i18n:mask-tip"]
      //  - modifiers : {
      //      mask : Auto show DIV.ti-drag-mask
      //    }
      Vue.directive("dropFiles", {
        bind : function($el, binding){
          //console.log("drop-files bind", $el, binding)
          // Preparent Handler / Mask Content
          let handler  = null
          let maskHtml = null
          let showMask = binding.modifiers.mask
          if(_.isArray(binding.value)) {
            handler  = binding.value.length > 0 ? binding.value[0] : null
            maskHtml = binding.value.length > 1 ? binding.value[1] : null
          }
          // Directly function
          else if(_.isFunction(binding.value)) {
            handler = binding.value
          }
          if(showMask) {
            maskHtml = Ti.I18n.text(
              maskHtml || "i18n:drop-file-here-to-upload"
            )
          }
          // Attach Events
          $el.__drag_enter_count = 0
          $el.addEventListener("dragenter", function(evt){
            $el.__drag_enter_count++;
            if($el.__drag_enter_count == 1) {
              //console.log(">>>>>>>>>>>> enter")
              $el.setAttribute("ti-is-drag", "")
              if(showMask) {
                $el.$ti_drag_mask = Ti.Dom.createElement({
                  className:"ti-drag-mask",
                  $p : $el
                })
                $el.$ti_drag_mask.innerHTML=`<span>${maskHtml}</span>`
              }
            }
          })
          $el.addEventListener("dragover", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
          })
          $el.addEventListener("dragleave", function(evt){
            $el.__drag_enter_count--;
            if($el.__drag_enter_count<=0) {
              //console.log("<<<<<<<<<<<<< leave")
              $el.removeAttribute("ti-is-drag")
              if($el.$ti_drag_mask) {
                Ti.Dom.remove($el.$ti_drag_mask)
                delete $el.$ti_drag_mask
              }
            }
          })
          $el.addEventListener("drop", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            //console.log("drop:", evt.dataTransfer.files)
            //..........................
            // reset drag tip
            $el.__drag_enter_count = 0
            $el.removeAttribute("ti-is-drag")
            if($el.$ti_drag_mask) {
              Ti.Dom.remove($el.$ti_drag_mask)
              delete $el.$ti_drag_mask
            }
            //..........................
            if(_.isFunction(handler)){
              handler(evt.dataTransfer.files)
            }
            //..........................
          })
        }
      })
      //................................
      // Directive: v-drop-files
      Vue.directive("dropOff", {
        bind : function($el, binding){
          // console.log("drop-off bind", $el, binding)
          $el.addEventListener("dragover", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
          })
          $el.addEventListener("drop", function(evt){
            evt.preventDefault();
            evt.stopPropagation();
          })
        }
      })  // ~ Vue.directive("drop-none"
    }})  // ~ Vue.use({install:(Vue)=>{
  },
  /***
   * Generated a new configuration object for `Vuex.Store` to 
   * generated a new Vuex instance. 
   * It  will build sub-modules deeply by invoke self recursively.
   * 
   * @param conf{Object} : Configuration object of `app.store | app.store.modules[n]`
   * @param modName{String} : If defined, the module should `namespaced=true`
   * 
   * @return A New Configuration Object
   */
  StoreConfig(conf={}, modName=null) {
    // Build the baseline
    let sc = Ti.Util.merge({
      modules : {}
    }, conf.mixins);

    // Pick the necessary fields
    if(conf.state || !sc.state) {
      sc.state = Ti.Util.genObj(conf.state)
    }
    sc.getters   = _.assign(sc.getters,   Ti.Util.merge({}, conf.getters))
    sc.mutations = _.assign(sc.mutations, Ti.Util.merge({}, conf.mutations))
    sc.actions   = _.assign(sc.actions,   Ti.Util.merge({}, conf.actions))

    // I18n
    Ti.I18n.put(conf.i18n)
    
    // namespaced module
    if(modName)
      sc.namespaced = true
    
    // Join modules
    _.forEach(conf.modules, (modConf, modKey)=>{
      let newModConf;
      // inline modual
      if(modKey.startsWith(".")) {
        newModConf = TiVue.StoreConfig(modConf)
      }
      // namespaced modual
      else {
        newModConf = TiVue.StoreConfig(modConf, modKey)
      }
      // Update to modules
      sc.modules[modKey] = newModConf
    })

    // Join plugins, make it force to Array
    sc.plugins = [].concat(conf.plugins||[])

    // Return then
    return sc
  },
  //---------------------------------------
  CreateStore(storeConf) {
    return new Vuex.Store({
      strict : Ti.IsForDev(),
      ...storeConf
    })
  },
  //---------------------------------------
  Options({global={}, conf={}, store}={}) {
    //.............................
    // Pick necessary fields
    //.............................
    /*Data*/
    const Data = _.pick(conf, [
      "data",
      /*form like `props:[..]` would not be supported*/
      "props",
      /*computed|methods will be deal with later*/
      "watch"])
    //.............................
    /*DOM*/
    const DOM = _.pick(conf, [
      "template",
      "render",
      "renderError"])
    //.............................
    /*Lifecycle Hooks*/
    const LifecycleHooks = _.pick(conf, [
      "beforeCreate",
      "created",
      "beforeMount",
      "mounted",
      "beforeUpdate",
      "updated",
      "activated",
      "deactivated",
      "beforeDestroy",
      "destroyed",
      "errorCaptured"])
    //.............................
    /*Assets*/
    // Find global Assets
    const Assets = _.pick(conf, [
      "directives",
      "filters",
      "components"])
    const it_asset_part = function(val, key, obj) {
      //console.log("!!!", key, val)
      const list = _.flattenDeep([val])
      const remain = []
      for(let asset of list) {
        // => global
        if(asset.globally) {
          Ti.Util.pushValue(global, key, asset)
        }
        // => key
        else {
          remain.push(asset)
        }
      }
      obj[key] = remain
    }
    _.forOwn(Assets, it_asset_part)
    //.............................
    /*Composition*/
    const Composition = _.pick(conf, [
      "mixins",
      "extends"])
    //.............................
    /*Misc*/
    const Misc = _.pick(conf, [
      "name",        /*com only*/
      "delimiters",
      "functional",
      "model",
      "inheritAttrs",
      "comments"])
    //.............................
    // create options
    let options = {
      ..._.mapValues(
          Data, v=>Ti.Util.merge({}, v)),
      ... DOM,
      // LifecycleHooks
      ..._.mapValues(
          LifecycleHooks, Ti.Util.groupCall),
      // Asserts
      directives : Ti.Util.merge({}, Assets.directives),
      filters    : Ti.Util.merge({}, Assets.filters),
      // components should merge the computed/methods/watch
      components : (function(){
        let coms = {}
        _.map(Assets.components, com=>{
          coms[com.name] = TiVue.Options({
            conf : com, global
          })
        })
        return coms
      })(),
      ...Composition,
      // ..._.mapValues(
      //     Composition, v=>Ti.Util.merge({}, v)),
      ... Misc
    }

    // thunk data
    if(!_.isFunction(options.data)) {
      options.data = Ti.Util.genObj(options.data || {})
    }

    //.............................
    // expend the "..." key like object for `computed/methods`
    // if without store defination, they will be dropped
    const merger = _.partial(do_extend_setting, store);
    if(_.isArray(conf.computed)) {
      options.computed = Ti.Util.mergeWith(
                            merger, {}, ...conf.computed)
    } else if(_.isObject(conf.computed)) {
      options.computed = conf.computed
    }
    
    if(_.isArray(conf.methods)) {
      options.methods = Ti.Util.mergeWith(
                            merger, {}, ...conf.methods)
    } else if(_.isObject(conf.methods)) {
      options.methods = conf.methods
    }

    //.............................
    // bind Vuex.store
    if(store)
      options.store = store

    // return the options
    return options
  },
  //---------------------------------------
  /***
  Generated a new conf object for `Vue` to generated a new Vue instance.

  @params
  - `conf{Object}` Configuration object of `app | app.components[n]`

  @return A New Configuration Object
  */
  Setup(conf={}, store) {
    const global  = {}
    const options = TiVue.Options({
      global, conf, store
    })
    
    // return the setup object
    return {
      global, options
    }
  },
  //---------------------------------------
  CreateInstance(setup) {
    // Global Assets
    const filters    = Ti.Util.merge({}, setup.global.filters)
    const directives = Ti.Util.merge({}, setup.global.directives)

    // filters
    _.forOwn(filters, (val, key)=>{
      Vue.filter(key, val)
    })
    
    // directives
    _.forOwn(directives, (val, key)=>{
      Vue.directive(key, val)
    })

    // components registration
    const defineComponent = com=>{
      // define sub
      _.map(com.components, defineComponent)
      delete com.components
      // define self
      Vue.component(com.name, com)
    }
    _.map(setup.global.components, defineComponent)

    // return new vm instance
    return new Vue(setup.options)
  }
}