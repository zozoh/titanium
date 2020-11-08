export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  props : {
    "home" : {
      type : Object,
      default : null
    },
    "tree" : {
      type : Object,
      default : ()=>({})
    },
    "currentMeta" : {
      type : Object,
      default : null
    },
    "currentContent" : {
      type : String,
      default : null
    },
    "currentData" : {
      type : Object,
      default : null
    },
    "mapping" : {
      type : Object,
      default : ()=>({})
    },
    "views" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return {
        "is-changed" : this.status.changed
      }
    },
    //--------------------------------------
    theViewsMapping() {
      return new HmViewMapping(this.mapping || {})
    },
    //--------------------------------------
    hasCurrent() {
      return this.currentMeta
    },
    //--------------------------------------
    theTitleIcon() {
      return Wn.Util.getIconObj(this.currentMeta || this.home)
    },
    //--------------------------------------
    theTitleText() {
      return Wn.Util.getObjDisplayName(this.currentMeta || this.home)
    },
    //--------------------------------------
    theCurrentView() {
      // The default view
      let view = {
        comType : "ti-loading",
        comConf : {
          icon : "zmdi-alert-circle-o",
          text : "i18n:blank"
        }
      }
      // Find the view by current meta
      if(this.hasCurrent) {
        let homePath = this.home.ph
        let currentPath = this.currentMeta.ph
        view = this.theViewsMapping.getView({
          path : Ti.Util.getRelativePath(homePath, currentPath),
          type : this.currentMeta.tp,
          mime : this.currentMeta.mime,
          race : this.currentMeta.race
        }, view)
        if(_.isString(view)) {
          view = this.views[view]
        }
      }
      // Explain it ...
      return Ti.Util.explainObj(this, view)
    },
    //--------------------------------------
    theCurrentAction() {
      return this.theCurrentView.actions
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
/////////////////////////////////////////////
class HmViewMapping {
  constructor(mapping) {
    this.paths = new Ti.Mapping(mapping.paths)
    this.types = new Ti.Mapping(mapping.types)
    this.mimes = new Ti.Mapping(mapping.mimes)
    this.races = new Ti.Mapping(mapping.races)
  }
  getView({path,type,mime,race}={}, dft) {
    return this.paths.get(path)
      || this.types.get(type)
      || this.mimes.get(mime)
      || this.races.get(race)
      || dft
  }
}