const OBJ = {
  //---------------------------------------
  /***
   * Create new object
   */
  async doCreate() {
    // Load the creation setting
    let {
      types,
      freeCreate
    } = await Wn.Sys.exec(`ti creation -cqn id:${this.meta.id}`, {as:"json"})

    let no = await Ti.App.Open({
      title : "i18n:create",
      type  : "info",
      position: "top",
      width  : 640,
      height : "61.8%",
      comType : "wn-obj-creation",
      comConf : {
        types, freeCreate,
        autoFocus : true,
        enterEvent : "ok"
      },
      components : ["@com:wn/obj/creation"]
    })

    // console.log(no)
   
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

      // Default Race
      no.race = no.race || "FILE"

      if("folder" == no.type) {
        no.type = undefined
      }
      
      // Auto type
      if("FILE" == no.race) {
        if(!no.type) {
          no.type = Ti.Util.getSuffixName(no.name)
        }

        // Auto append suffix name
        if(!no.name.endsWith(no.type)) {
          no.name += `.${no.type}`
        }
      }
      
      // Do the creation
      let json = JSON.stringify({
        ... no.meta,
        nm : no.name,
        tp : no.type,
        race : no.race,
        mime : no.mime
      })
      // console.log(json)
      let newMeta = await Wn.Sys.exec2(
          `o @create -p id:${this.meta.id} @json -cqn`,
          {as:"json", input: json})
      // Error
      if(newMeta instanceof Error) {
        Ti.Toast.Open("i18n:wn-create-fail", "error")
      }
      // Replace the data
      else {
        Ti.Toast.Open("i18n:wn-create-ok", "success")
        await this._run("reload")

        // Make it checked
        this.myCheckedIds = [newMeta.id]
        this.myCurrentId = newMeta.id
      }
    }  // ~ if(newName)
  },
  //--------------------------------------------
  async doRename() {
    let it = this.getCurrentItem()
    if(!it) {
      return await Ti.Toast.Open('i18n:wn-rename-none', "warn")
    }
    this.setItemStatus(it.id, "renaming")
    try {
      // Get newName from User input
      let newName = await Ti.Prompt({
          text : 'i18n:wn-rename',
          vars : {name:it.nm}
        }, {
          title : "i18n:rename",
          placeholder : it.nm,
          value : it.nm
        })
      // Check the newName
      if(newName) {
        // Check name invalid or not
        if(!Wn.Obj.isValidName(newName)) {
          return
        }
        // Check the suffix Name
        let oldSuffix = Ti.Util.getSuffix(it.nm)
        let newSuffix = Ti.Util.getSuffix(newName)
        if('FILE' == it.race && oldSuffix && oldSuffix != newSuffix) {
          let repair = await Ti.Confirm("i18n:wn-rename-suffix-changed")
          if(repair) {
            newName += oldSuffix
          }
        }
        // Mark renaming
        this.setItemStatus(it.id, "loading")
        // Do the rename
        let newMeta = await Wn.Sys.exec2(
            `obj id:${it.id} -cqno -u 'nm:"${newName}"'`,
            {as:"json"})
        // Error
        if(newMeta instanceof Error) {
          await Ti.Toast.Open("i18n:wn-rename-fail", "error")
        }
        // Replace the data
        else {
          await Ti.Toast.Open("i18n:wn-rename-ok", "success")
          this.setItem(newMeta)
        }
        this.setItemStatus({id:it.id, status:{loading:false}})
      }  // ~ if(newName)
    }
    // reset the status
    finally {
      this.setItemStatus(it.id, null)
    }
  },
  //--------------------------------------------
  async doDelete(confirm=false, reloadWhenDone=true) {
    let list = this.getCheckedItems()
    // Guard
    if(_.isEmpty(list)) {
      return await Ti.Toast.Open('i18n:wn-del-none', "warn")
    }

    // Confirm
    if(confirm) {
      if(!(await Ti.Confirm({
        text:"i18n:wn-del-confirm", 
        vars:{N:list.length}}, {type: "warn"
      }))) {
        return
      }
    }

    let delCount = 0
    // make removed files. it remove a video
    // it will auto-remove the `videoc_dir` in serverside also
    // so, in order to avoid delete the no-exists file, I should
    // remove the `videoc_dir` ID here, each time loop, check current
    // match the id set or not, then I will get peace
    let exRemovedIds = {}
    try {
      // Loop items
      for(let it of list) {
        // Duck check
        if(!it || !it.id || !it.nm)
          continue
        // Ignore obsolete item
        if(it.__is && (it.__is.loading || it.__is.removed))
          continue
        // Ignore the exRemovedIds
        if(exRemovedIds[it.id])
          continue
        
        // Mark item is processing
        this.setItemStatus(it.id, "loading")
        // If DIR, check it is empty or not
        if('DIR' == it.race) {
          let count = await Wn.Sys.exec(`count -A id:${it.id}`)
          count = parseInt(count)
          if(count > 0) {
            // If user confirmed, then rm it recurently
            if(!(await Ti.Confirm({
                text:'i18n:wn-del-no-empty-folder', vars:{nm:it.nm}}))) {
              this.setItemStatus(it.id, null)
              continue
            }
          }
        }
        // Do delete
        await Wn.Sys.exec(`rm ${'DIR'==it.race?"-r":""} id:${it.id}`)
        // Mark item removed
        this.setItemStatus(it.id, "removed")
        // If video result folder, mark it at same time
        let m = /^id:(.+)$/.exec(it.videoc_dir)
        if(m) {
          let vdId = m[1]
          exRemovedIds[vdId] = true
          this.setItemStatus(vdId, "removed")
        }
        // Counting
        delCount++
        // Then continue the loop .......^
      }
      // Do reload
      if(reloadWhenDone) {
        await this._run("reload")
      }
    }
    // End deleting
    finally {
      Ti.Toast.Open("i18n:wn-del-ok", {N:delCount}, "success")
    }

  },
  //--------------------------------------------
  async doMoveTo(confirm=false, reloadWhenDone=true) {
    let list = this.getCheckedItems()
    // Move dialog
    await Wn.Io.moveTo(list, _.assign({}, this.moveToConf, {
      base: this.meta,
      confirm,
      markItemStatus: (itId, status)=>{
        this.setItemStatus(itId, status)
      },
      doneMove : async ()=>{
        if(reloadWhenDone) {
          return await this._run("reload")
        }
      }
    }))
  },
  //--------------------------------------------
  async doUpload(files=[]) {
    if(_.isFunction(this.beforeUpload)) {
      await this.beforeUpload()
    }

    // Prepare the list
    let ups = _.map(files, (file, index)=>({
      id : `U${index}_${Ti.Random.str(6)}`,
      file : file,
      total : file.size,
      current : 0
    }))

    // Show Uploading
    this.myUploadigFiles = ups

    // Prepare the list
    let newIds = {}
    // Do upload file one by one
    for(let up of ups) {
      let file = up.file
      let {ok, data} = await Wn.Io.uploadFile(file, {
        target : `id:${this.meta.id}`,
        progress : function(pe){
          up.current = pe.loaded
        }
      })
      if(ok) {
        newIds[data.id] = true
      }
    }

    // All done, hide upload
    _.delay(()=>{
      this.myUploadigFiles = []
    }, 1000)

    // Tell user ...
    Ti.Toast.Open("i18n:upload-done", "success")


    // Call reload
    await this._run("reload")

    // Make it checked
    let checkIds = Ti.Util.truthyKeys(newIds)
    if(!this.multi) {
      checkIds = _.first(checkIds)
    }
    this.$innerList.checkRow(checkIds, {reset:true})
  },
  //--------------------------------------------
  async doDownload() {
    let list = this.getCheckedItems()
    if(_.isEmpty(list)) {
      return await Ti.Toast.Open('i18n:wn-download-none', "warn")
    }
    // Too many, confirm at first
    if(list.length > 5) {
      if(!await Ti.Confirm({
        text : "i18n:wn-download-too-many",
        vars : {N:list.length}})) {
        return
      }
    }
    // Do the download
    for(let it of list) {
      if('FILE' != it.race) {
        if(!await Ti.Confirm({
            text : "i18n:wn-download-dir",
            vars : it
          }, {
            textYes : "i18n:continue",
            textNo  : "i18n:terminate"
          })){
          return
        }
        continue;
      }
      let link = Wn.Util.getDownloadLink(it)
      Ti.Be.OpenLink(link)
    }
  }
  //--------------------------------------------
}
export default OBJ;