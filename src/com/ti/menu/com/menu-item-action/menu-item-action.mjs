import {fireable} from "../../menu-items-support.mjs"
//---------------------------------------
export default {
  inject : ["$menu"],
  ///////////////////////////////////////////  
  props : fireable.Props({
    "action" : {
      type : [String, Function],
      default : null
    }
  }),
  ///////////////////////////////////////////
  computed : fireable.Computed(vm=>vm.isProcessing, { 
    isProcessing() {
      return this.status[this.statusKey] 
              ? true : false
    },
    hasShortcut() {
      return this.shortcut ? true : false
    },
    ShortcutText() {
      return this.shortcut || ""
    },
    InvokeFunc() {
      return Ti.Shortcut.genActionInvoking(this.action, ({mode, name, args})=>{
          if("$emit" == mode) {
            return ()=>{
              console.log("mode", {mode, name, args})
              this.$menu.$emit(name, ...args)
            }
          }
          if("$parent" == mode) {
            let $p = this.$menu.$parent
            let fn = _.get($p, name)
            if(_.isFunction(fn)){
              return ()=>fn.apply($p, args)
            }
            throw `menu-item.action noexits: ${mode}.${name}(${args.join(",")})`
          }
          let app = Ti.App(this)
          let fn = _.get(app, mode)
          if(_.isFunction(fn)) {
            let __args = Ti.S.joinArgs(args, [name])
            return ()=>fn.apply(app, __args)
          }
          throw `menu-item.action noexits: ${mode}.${name}(${args.join(",")})`
        }
      ,{
        wait : this.wait
      })
    }
  }),
  ///////////////////////////////////////////
  methods : {
    onClickTop() {
      // Guard
      if(this.isDisabled) {
        return
      }
      // Call Action
      this.InvokeFunc()
    }
  },
  ///////////////////////////////////////////
  mounted : function() {
    if(this.shortcut) {
      Ti.App(this).guardShortcut(this.shortcut, ()=>{
        return this.isEnabled
      }, this)
    }
  },
  ///////////////////////////////////////////
  destroyed : function(){
    if(this.shortcut) {
      Ti.App(this).unwatchShortcut(this)
    }
  }
  ///////////////////////////////////////////
}