// Ti required(Wn)
//---------------------------------------
export default {
  //---------------------------------------
  /***
   * Reload all
   */
  async reload({state, commit}, meta) {
    // Use the default meta
    if(!meta || _.isEmpty(meta)) {
      meta = state.meta
    }
    // !!! Must be DIR
    if('DIR' != meta.race) {
      commit("setMeta", null)
      return
    }
    // Update the current meta
    if(meta != state.meta) {
      commit("setMeta", meta)
    }
    // Mark begin
    commit("setStatus", {reloading:true})
       
    let re = await Wn.Io.loadChildren(meta)
    //console.log("reload", re)

    // Update state and Mark end
    commit("setList", re.list)
    commit("setPager", re.pager)
    commit("setStatus", {reloading:false})
    
    // return the root state
    return state
  },
  //---------------------------------------
  async tryReload({state, commit, dispatch}, meta) {
    if(!meta) {
      commit("reset")
    }
    if(!state.meta 
      || state.meta.id != meta.id 
      || _.isEmpty(state.list)) {
      return await dispatch("reload", meta)
    }
    return state
  },
  //---------------------------------------
  /***
   * Create new object
   */
  async create({state, commit, dispatch}) {
    let vm = this
    // Load the creation setting
    let {types, freeCreate} = await Wn.Sys.exec(
                    `ti creation -cqn id:${state.meta.id}`, 
                    {as:"json"})

    // Open modal to get the file name
    let no = await Ti.Modal.Open({
      data : {
        types : types || [],
        freeCreate : freeCreate,
        value : {
          name : "",
          type : "",
          race : ""
        }
      },
      template : `<ti-obj-creation 
                    :types="types" 
                    :free-create="freeCreate"
                    v-model="value"/>`,
      components : ["@com:ti/obj/creation"]
    }, {
      width  : 640,
      height : 480,
      title : "i18n:create",
      type  : "success",
      actions : [{
        key : "ok",
        text: "i18n:ok", 
        handler : ({app})=>{
          return app.$vm().value
        }
      }, {
        key : "cancel",
        text: "i18n:cancel"
      }]
    })

    // do the new name
    //console.log("get the new object: ", no)

    // Do Create
    // Check the newName
    if(no && no.name) {
      // Check the newName contains the invalid char
      if(no.name.search(/[%;:"'*?`\t^<>\/\\]/)>=0) {
        return await Ti.Alert('i18n:wn-create-invalid')
      }
      // Check the newName length
      if(no.length > 256) {
        return await Ti.Alert('i18n:wn-create-too-long')
      }      
      // Do the creation
      let json = JSON.stringify({
        nm   : no.name, 
        tp   : no.type=="folder"?"":no.type, 
        race : no.race
      })
      let newMeta = await Wn.Sys.exec2(
          `obj id:${state.meta.id} -cqno -new '${json}'`,
          {as:"json"})
      // Error
      if(newMeta instanceof Error) {
        //commit("$toast", {text:"i18n:wn-create-fail", type:"error"})
        Ti.Toast.Open("i18n:wn-create-fail", "error")
      }
      // Replace the data
      else {
        //commit("$toast", "i18n:wn-create-ok")
        Ti.Toast.Open("i18n:wn-create-ok", "success")
        await dispatch("reload")
      }
    }  // ~ if(newName)
  }
  //---------------------------------------
}