(function(){
///////////////////////
class TiLoading {
  constructor(path, {recur=false,forceArray=false}={}) {
    this.recur = recur;
    this.resultDestructuring = false;
    
    // Prepare loading targets
    this.target = []

    // Prepare the cache, to result the loading result
    this.cache = new Map()
    
    // Analyze path to targets
    if(!_.isArray(path)) {
      path = [path]
      if(!forceArray)
        this.resultDestructuring = true
    }
    
    path.forEach((ph, index)=>{
      let m = /^(text|!?js|!?css|json|app|com)?(.+)$/.exec(ph)
      let ta = {mode:m[1], name:m[2], index}
      // Apply prefix and alias
      ta.target = ti.config.url(ta.name)
      // Auto detect loading mode
      if(!ta.mode) {
        this._auto_detect_mode_and_type_by_target(ta)
      }
      // Auto suffix target
      this._eval_loading_target_suffix_and_recur(ta)
      // Add to...
      this.target.push(ta)
    })

    // loading result
    this.result = []

  }
  //.................................
  _eval_loading_target_suffix_and_recur(ta) {
    // auto recur
    ta.canRecur = /^(app|com)$/.test(ta.mode)
    // auto suffix
    switch(ta.mode) {
      case 'js':
        ta.autoSuffix = ".js"
        break
      case 'css':
        ta.autoSuffix = ".css"
        break
      case 'app':
        ta.autoSuffix = "/app.json"
        break
      case 'com':
        ta.autoSuffix = "/com.json"
        break
      default:
        ta.autoSuffix = null
    }
    // apply suffix
    if(ta.autoSuffix && !ta.target.endsWith(ta.autoSuffix))
      ta.target += ta.autoSuffix
  }
  //.................................
  _auto_detect_mode_and_type_by_target(ta) {
    let m = /((\.(js|css|json|te?xt))|(\/(com|app)\.json))$/.exec(ta.target)
    switch(m[1]){
      case '.js':
        ta.mode = "!js"
        ta.type = "script"
        break
      case '.css':
        ta.mode = "!css"
        ta.type = "css"
        break
      case '.json':
        ta.mode = "json"
        ta.type = "json"
        break
      case '/com.json':
        ta.mode = "com"
        ta.type = "json"
        break
      case '/app.json':
        ta.mode = "app"
        ta.type = "json"
        break
      case '.text':
      case '.txt':
      default:
          ta.mode = "text"
          ta.type = "text"
    }
  }
  //.................................
  async run() {
    // Just my OCD habit 
    _.fill(this.result, null, 0, this.target.length)
    // Prepare the Promise Object list
    let ps = []
    this.target.map(ta=>{
      ps.push(new Promise((resolve, reject)=>{
        ti.use(ta.target, {type:ta.type}).then(data=>{
          ta.data = data
          // recur
          if(this.recur && ta.canRecur) {
            // TODO loading the `app/com` recursively
          }
          // no recur, resolved
          else {
            resolve(ta)
          }
          // return the data for next `then` chain
          return ta.data
        }).catch(reject)
      }).then(re=>{
        this.result[ta.index] = re
      }))
    })
    // wait all target done
    await Promise.all(ps)

    // eval result
    return this.resultDestructuring && this.result.length==1
            ? this.result[0]
            : this.result
  }
}
//-----------------------------------
const TiLoad = {
  //.................................
  run(path, {recur=true,forceArray=false}={}) {
    const ing = new TiLoading(path, {recur,forceArray})
    return ing.run()
  },
  //.................................
  explain(path, {recur=false,forceArray=false}={}) {
    const ing = new TiLoading(path, {recur,forceArray})
    return ing.explain()
  }
}

// join to namespace
ti.ns('ti.load', TiLoad)
///////////////////////
})();
