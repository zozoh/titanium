/***
 * Open Modal Dialog to explore one or multi files
 */
export async function OpenObjSelector(pathOrObj="~", {
  title = "i18n:select", 
  icon = "im-folder-open",
  type = "info", closer = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position = "top",
  width="80%", height="90%", spacing,
  multi=true,
  fromIndex=0,
  homePath=Ti.SessionVar("HOME"),
  selected=[]
}={}){
  //................................................
  // Load the target object
  let meta = await Wn.Io.loadMeta(pathOrObj)
  // Fail to load
  if(!meta) {
    return Ti.Toast.Open({
      content : "i18n:e-io-obj-noexistsf",
      vars : _.isString(pathOrObj)
              ? { ph: pathOrObj, nm: Ti.Util.getFileName(pathOrObj)}
              : pathOrObj.ph
    }, "warn")
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
      handler : ({$main})=>$main.myChecked
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
        @block:event="onBlockEvent"/>`,
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
                "data" : this.theCrumbData
              }
            },
            "main" : {
              comType : "wn-adaptlist",
              comConf : {
                "meta"   : this.obj,
                "data"   : this.data,
                "status" : this.status,
                "multi"  : multi
              }
            }
          }
        }
      },
      //////////////////////////////////////////
      methods : {
        //--------------------------------------
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
            "arena.select" : async ({checked})=>{
              this.myChecked = _.filter(checked, o=>"FILE"==o.race)
            }
            //======================================
          }
    
          let fn = FnSet[evKey] || FnSet[name]
    
          // Invoke Event Handler
          if(_.isFunction(fn)) {
            await fn.apply(this, args)
          }
        },
        //--------------------------------------
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