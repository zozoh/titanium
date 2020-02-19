/***
 * Open Modal Dialog to explore one or multi files
 */
export async function OpenObjSelector(pathOrObj="~", {
  title = "i18n:select", 
  icon = "im-folder-open",
  className,
  closer = true,
  type = "info", 
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  width="80%", height="90%",
  multi=false,
  fromIndex=0,
  homePath=Ti.SessionVar("HOME"),
  selected=[]
}={}){
  //................................................
  // Load the target object
  let theObj = await Wn.Io.loadMeta(pathOrObj)
  // Fail to load
  if(!theObj) {
    return Ti.Toast.Open({
      content : "i18n:e-io-obj-noexistsf",
      vars : _.isString(pathOrObj)
              ? { ph: pathOrObj, nm: Ti.Util.getFileName(pathOrObj)}
              : pathOrObj.ph
    }, "warn")
  }
  //................................................
  // Open modal dialog
  let reObj = await Ti.Modal.Open({
    // Prepare the DOM
    template : `<ti-gui
      :class="className"
      :layout="theLayout"
      :schema="theSchema"
      :shown="myShown"
      :can-loading="true"
      :loading-as="status.reloading"
      @block:event="onBlockEvent"/>`,
    /////////////////////////////////////////////////
    data : {
      className,
      mySelected : [],
      myShown : {}
    },
    /////////////////////////////////////////////////
    store : {
      modules : {
        viewport : "@mod:ti/viewport",
        current  : "@mod:wn/obj-meta",
        main     : "@mod:wn/obj-explorer"
      }
    },
    /////////////////////////////////////////////////
    computed : {
      //---------------------------------------------
      ...Vuex.mapGetters("current", {
        "obj"              : "get",
        "objHome"          : "getHome",
        "objIsHome"        : "isHome",
        "objHasParent"     : "hasParent",
        "objParentIsHome"  : "parentIsHome"
      }),
      //---------------------------------------------
      ...Vuex.mapState("main", ["list", "pager", "status"]),
      //---------------------------------------------
      theCrumbData() {
        return Wn.Obj.evalCrumbData({
          meta      : _.get(this.obj, "meta"),
          ancestors : _.get(this.obj, "ancestors"),
          fromIndex : fromIndex,
          homePath  : homePath,
        }, (item)=>{
          item.asterisk = _.get(this.mainStatus, "changed")
        })
      },
      //---------------------------------------------
      theLayout(){
        return {
          type : "rows",
          border : true,
          blocks : [{
              name : "sky",
              size : ".5rem",
              body : "sky"
            }, {
              name : "arena",
              body : "main"
            }]
        }
      },
      //---------------------------------------------
      theSchema(){
        return {
          "sky" : {
            comType : "ti-crumb",
            comConf : {
              "data" : this.theCrumbData
            }
          },
          "main" : {
            comType : "wn-adaptlist",
            comConf : {
              "meta"   : this.obj,
              "list"   : this.list,
              "pager"  : this.pager,
              "status" : this.status
            }
          }
        }
      }
      //---------------------------------------------
    },
    /////////////////////////////////////////////////
    methods : {
      //---------------------------------------------
      async onBlockEvent({block, name, args}={}) {
        let evKey = _.concat(block||[], name||[]).join(".")
        //console.log("wn-open-obj:onBlockEvent",evKey, args)
        // Find Event Handler
        let FnSet = {
          //======================================
          "sky.item:actived" : async ({value})=>{
            await this.open(`id:${value}`)
          },
          //======================================
          "arena.open" : async ({item})=>{
            await this.open(item)
          },
          //======================================
          "arena.selected" : async ({selected})=>{
            this.mySelected = _.filter(selected, o=>"FILE"==o.race)
          }
          //======================================
        }
  
        let fn = FnSet[evKey] || FnSet[name]
  
        // Invoke Event Handler
        if(_.isFunction(fn)) {
          await fn.apply(this, args)
        }
      },
      //---------------------------------------------
      async open(obj) {
        // Guard
        if(!obj) {
          return
        }

        // To WnObj
        if(_.isString(obj)) {
          obj = await Wn.Io.loadMeta(obj)
        }

        // Only can enter DIR
        if(obj && "DIR" == obj.race) {
          let app = Ti.App(this)
          app.dispatch("current/reload", obj)
          app.dispatch("main/reload", obj)    
        }
      }
      //---------------------------------------------
    },
    /////////////////////////////////////////////////
    mounted : function() {
      this.open(theObj)
    }
    /////////////////////////////////////////////////
  }, {
    icon, title, type, width, height, className, closer,
    actions : [{
      text : textOk,
      handler : function({app}){
        return _.cloneDeep(app.$vm().mySelected)
      }
    }, {
      text : textCancel
    }]
  })
  //................................................
  // End of OpenObjSelector
  return reObj
}
////////////////////////////////////////////