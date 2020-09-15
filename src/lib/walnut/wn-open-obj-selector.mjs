/***
 * Open Modal Dialog to explore one or multi files
 */
async function OpenObjSelector(pathOrObj="~", {
  title = "i18n:select", 
  icon = "im-folder-open",
  type = "info", closer = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position = "top",
  width="80%", height="90%", spacing,
  multi=true,
  fromIndex=0,
  homePath=Wn.Session.getHomePath(),
  fallbackPath=Wn.Session.getHomePath(),
  filter= o => "FILE" == o.race,
  selected=[]
}={}){
  //................................................
  // Load the target object
  let meta = pathOrObj;
  if(_.isString(pathOrObj))
    meta = await Wn.Io.loadMeta(pathOrObj)
  // Fallback
  if(!meta && fallbackPath && pathOrObj!=fallbackPath) {
    meta = await Wn.Io.loadMeta(fallbackPath)
  }
  // Fail to load
  if(!meta) {
    return await Ti.Toast.Open({
      content : "i18n:e-io-obj-noexistsf",
      vars : _.isString(pathOrObj)
              ? { ph: pathOrObj, nm: Ti.Util.getFileName(pathOrObj)}
              : pathOrObj.ph
    }, "warn")
  }
  //................................................
  // Make sure the obj is dir
  if("DIR" != meta.race) {
    meta = await Wn.Io.loadMetaById(meta.pid)
    if(!meta) {
      return await Ti.Toast.Open({
        content : "i18n:e-io-obj-noexistsf",
        vars : {
          ph : `Parent of id:${meta.id}->pid:${meta.pid}`,
          nm : `Parent of id:${meta.nm}->pid:${meta.pid}`,
        }
      }, "warn")
    }
  }
  //................................................
  // Open modal dialog
  let reObj = await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    icon, title,
    //------------------------------------------
    actions : [{
      text: textOk,
      handler : ({$main})=>{
        return $main.myChecked
      }
    }, {
      text: textCancel,
      handler : ()=>undefined
    }],
    //------------------------------------------
    modules : {
      current  : "@mod:wn/obj-meta",
      main     : "@mod:wn/obj-current"
    },
    //------------------------------------------
    comType : "modal-inner-body",
    //------------------------------------------
    components : [{
      //////////////////////////////////////////
      name : "modal-inner-body",
      globally : false,
      //////////////////////////////////////////
      data : {
        myChecked : [],
        myShown : {}
      },
      //////////////////////////////////////////
      props : {
        "icon"   : undefined, 
        "text"   : undefined,
        "trimed" : undefined, 
        "placeholder" : undefined, 
        "valueCase" : undefined,
        "value"  : undefined
      },
      //////////////////////////////////////////
      template : `<ti-gui
        :layout="theLayout"
        :schema="theSchema"
        :shown="myShown"
        :can-loading="true"
        :loading-as="status.reloading"
        @sky::item:active="OnCurrentMetaChange"
        @arena::open="OnCurrentMetaChange"
        @arena::select="OnArenaSelect"/>`,
      //////////////////////////////////////////
      computed : {
        //--------------------------------------
        ...Vuex.mapGetters("current", {
          "obj"              : "get",
          "objHome"          : "getHome",
          "objIsHome"        : "isHome",
          "objHasParent"     : "hasParent",
          "objParentIsHome"  : "parentIsHome"
        }),
        //--------------------------------------
        ...Vuex.mapState("main", ["data", "status"]),
        //--------------------------------------
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
        //--------------------------------------
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
        //--------------------------------------
        theSchema(){
          return {
            "sky" : {
              comType : "ti-crumb",
              comConf : {
                "style" : {padding: "0 .1rem"},
                "data" : this.theCrumbData
              }
            },
            "main" : {
              comType : "wn-adaptlist",
              comConf : {
                "meta"   : this.obj,
                "data"   : this.data,
                "status" : this.status,
                "multi"  : multi,
                "listConf" : {
                  resizeDelay : 200
                }
              }
            }
          }
        }
      },
      //////////////////////////////////////////
      methods : {
        //--------------------------------------
        OnCurrentMetaChange({id, path, value}={}) {
          this.open(id || path || value)
        },
        //--------------------------------------
        OnArenaSelect({checked}) {
          //console.log("OnArenaSelect", checked)
          if(_.isFunction(filter))
            this.myChecked = _.filter(checked, filter)
          else
            this.myChecked = checked
        },
        //--------------------------------------
        async open(obj) {
          // Guard
          if(!obj) {
            return
          }
  
          // To WnObj
          if(_.isString(obj)) {
            obj = await Wn.Io.loadMetaBy(obj)
          }
  
          // Only can enter DIR
          if(obj && "DIR" == obj.race) {
            let app = Ti.App(this)
            app.dispatch("current/reload", obj)
            app.dispatch("main/reload", obj)    
          }
        }
        //--------------------------------------
      },
      //////////////////////////////////////////
      mounted : function() {
        this.open(meta)
      }
      //////////////////////////////////////////
    }]
    //------------------------------------------
  })
  //................................................
  // End of OpenObjSelector
  return reObj
}
////////////////////////////////////////////
export default OpenObjSelector;