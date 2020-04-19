const _M = {
  //////////////////////////////////////////
  data: ()=>({
    myCurrentId: null
  }),
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Array,
      default : undefined
    },
    "keepTabIndexBy" : {
      type : String,
      default : "hMakerEditComForm"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TheDetailCom() {
      return {
        comType: "hmaker-edit-form-field",
        comConf: {
          value: this.CurrentField,
          keepTabIndexBy: this.keepTabIndexBy
            ? `${this.keepTabIndexBy}-field`
            : null
        }
      }
    },
    //--------------------------------------
    CurrentField() {
      if(this.myCurrentId) {
        let node = this.$tree.findTableRow(this.myCurrentId)
        if(node) {
          return node.rawData
        }
      }
    },
    //--------------------------------------
    Layout() {
      return {
        type: "cols",
        border: true,
        blocks: [{
            type: "rows",
            size: "37%",
            border: true,
            blocks: [{
                size: 40,
                body: "actions"
              }, {
                name: "tree",
                body: "tree"
              }]
          }, {
            name: "detail",
            body: "detail"
          }]
      }
    },
    //--------------------------------------
    Schema() {
      return {
        //..................................
        actions: {
          comType: "ti-menu",
          comConf: {
            data: [{
                type: "action",
                icon: "im-plus",
                text: "i18n:hmaker-edit-form-new-field",
                action: ()=>this.addNewField()
              }, {
                type: "action",
                icon: "im-folder-add",
                text: "i18n:hmaker-edit-form-new-group",
                action: ()=>this.addNewGroup()
              }, {
                type: "line"
              }, {
                type: "action",
                icon: "im-trash-can",
                action: ()=>this.removeSelectedFieldOrGroup()
              }, {
                type: "line"
              }, {
                type: "action",
                icon: "im-arrow-up",
                action: ()=>this.moveSelectedFieldsUp()
              }, {
                type: "action",
                icon: "im-arrow-down",
                action: ()=>this.moveSelectedFieldsDown()
              }]
          }
        },
        //..................................
        tree: {
          comType: "ti-tree",
          comConf: {
            data: this.value,
            showRoot: false,
            puppetMode: true,
            autoOpen: true,
            border: "row",
            defaultOpenDepth: 2,
            currentId: this.myCurrentId,
            nameBy: it => it.name || it.title,
            childrenBy: it => it.fields,
            leafBy: it => "Group" != it.type,
            display: [{
                key: "type",
                transformer: {
                  name: "toStr",
                  args: [{
                    "Group"   : "zmdi-collection-bookmark",
                    "Object"  : "zmdi-toys",
                    "Number"  : "zmdi-input-svideo",
                    "Integer" : "zmdi-n-6-square",
                    "Boolean" : "zmdi-toll",
                    "String"  : "zmdi-translate",
                    "Array"   : "zmdi-format-list-bulleted",
                  }]
                },
                defaultAs: "im-question",
                comType: "ti-icon"
              }, {
                key: "name",
                transformer: v => _.isArray(v) ? v.join("+") : v,
              },"title"],
            onInit: this.OnTreeInit
          }
        },
        //..................................
        detail: this.TheDetailCom
        //..................................
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnTreeInit($tree){this.$tree = $tree},
    //--------------------------------------
    OnFieldTreeSelect({currentId}) {
      this.myCurrentId = currentId
    },
    //--------------------------------------
    OnFieldChange(newFld) {
      this.updateCurrentField(newFld)
    },
    //--------------------------------------
    // Utility
    //--------------------------------------
    getMyCurrent(fields=this.value){
      if(!this.myCurrentId || !_.isArray(fields)) {
        return
      }

      let path  = this.myCurrentId.split("/")
      let re = {path, index:[], group:null, field:null}

      // Find the top field or group
      if(path.length > 0) {
        let fnm = path[0]
        for(let i=0; i<fields.length; i++) {
          let fg = fields[i]
          // Is group
          if(_.isArray(fg.fields) || "Group" == fg.type) {
            if(fnm == fg.title){
              re.group = fg
              re.index.push(i)
              break
            }
          }
          // Is field
          else {
            if(fnm == fg.name) {
              re.field = fg
              re.index.push(i)
              break
            }
          }
        }
      }

      // Find in group
      if(path.length > 1 && re.group && _.isArray(re.group.fields)) {
        let fnm = path[1]
        for(let i=0; i<re.group.fields.length; i++) {
          let fld = re.group.fields[i]
          if(fnm == fld.name) {
            re.field = fld
            re.index.push(i)
          }
        }
      }

      // Done
      return re
    },
    //--------------------------------------
    isGroup(fld) {
      return "Group" == fld.type || _.isArray(fld.fields)
    },
    //--------------------------------------
    selectNextIdByIndex(index=[], fields=this.value) {
      let names=[]
      for(let i of index){
        if(!fields || _.isEmpty(fields)) {
          break
        }
        let fld = _.nth(fields, i)
        // Find prev
        if(!fld) {
          fld = _.nth(fields, i-1)
        }
        // Join
        if(fld) {
          names.push(fld.name || fld.title)
          fields = fld.fields
        }
      }
      this.myCurrentId = names.join("/") || null
    },
    //--------------------------------------
    findByName(name) {
      // Guard
      if(!_.isArray(this.value)) {
        return
      }
      // Top list
      for(let i=0; i<this.value.length; i++) {
        let fld = this.value[i]
        let fldName = fld.name || fld.title
        if(_.isEqual(name, fldName)) {
          let fd = {
            index : [i],
            path  : [fldName],
            field : fld
          }
          if(this.isGroup(fld)){
            fd.group = fld
          } else {
            fd.field = fld
          }
          return fd
        }
        // Group
        if(this.isGroup(fld)) {
          for(let x=0; x<fld.fields.length; x++) {
            let sub = fld.fields[x]
            let subName = sub.name || sub.title
            if(_.isEqual(name, subName)) {
              return {
                index : [i, x],
                path  : [fldName, subName],
                group : fld,
                field : sub
              }
            }
          }
        } // ~ if(this.isGroup(fld)) {
      } // ~ for(let i=0; i<this.value.length; i++)
    },
    //--------------------------------------
    existsName(name) {
      let ff = this.findByName(name)
      return ff ? true : false
    },
    //--------------------------------------
    updateCurrentField(newFld) {
      let fields = _.cloneDeep(this.value)
      let cur = this.getMyCurrent(fields)
      console.log(cur)
      // Field in group
      if(cur.group && cur.field) {
        let i1 = _.last(cur.index)
        cur.group.fields[i1] = newFld
      }
      // Group
      else if(cur.group) {
        let i0 = _.first(cur.index);
        _.assign(fields[i0], newFld)
      }
      // Field
      else if(cur.field) {
        let i0 = _.first(cur.index)
        fields[i0] = newFld
      }
      // Impossiable
      else {
        return
      }
      //....................................
      // Select new item
      this.selectNextIdByIndex(cur.index, fields)
      //....................................
      // Notify change
      this.$notify("change", fields)
    },
    //--------------------------------------
    addFieldOrGroup(fld) {
      //....................................
      // Clone the old
      let fields = _.cloneDeep(this.value) || []
      //....................................
      // Find pos
      let cur = this.getMyCurrent(fields)
      let names = []
      //....................................
      // push to tail
      if(!cur) {
        fields.push(fld)
      }
      //....................................
      // in group
      else if(cur.group) {
        if(this.isGroup(fld)) {
          Ti.Util.insertToArray(fields, _.first(cur.index), fld)
          names.push(fld.title)
        }
        // in position
        else if(cur.field) {
          Ti.Util.insertToArray(cur.group.fields, _.last(cur.index)+1, fld)
          names.push(cur.path[0], fld.name)
        }
        // At the tail
        else if(_.isArray(cur.group.fields)) {
          cur.group.fields.push(fld)
          names.push(cur.path[0], fld.name)
        }
        // New list
        else {
          cur.group.fields = [fld]
          names.push(cur.path[0], fld.name)
        }
      }
      // At top 
      else {
        Ti.Util.insertToArray(fields, _.last(cur.index)+1, fld)
        names.push(fld.name || fld.title)
      }
      //....................................
      // Notify change
      this.$notify("change", fields)
      //....................................
      // Hightlight it
      this.myCurrentId = names.join("/")
    },
    //--------------------------------------
    async addNewField() {
      let name = await Ti.Prompt("i18n:hmaker-edit-form-new-field-tip")
      name = _.trim(name)
      // User cancel
      if(!name) {
        return
      }

      // Form the name
      let ss = _.without(name.split(/[\s\W]/), "")

      // Check
      for(let s of ss) {
        if(!/^[a-z_][\da-z_]+$/.test(s)) {
          return await Ti.Toast.Open("i18n:hmaker-edit-form-new-field-e0", "error")
        }
      }

      // The field name
      let fldName = ss.length == 1 ? name : ss

      // Check Duplicate
      if(this.existsName(fldName)) {
        return await Ti.Toast.Open({
          content: "i18n:hmaker-edit-form-new-field-e1",
          type: "error",
          vars: {val:name},
          position: "center",
          duration: 5000
        })
      }

      // Then Add new 
      this.addFieldOrGroup({
        name: fldName,
        type: _.isArray(fldName)?"Object":"String",
        comType: "ti-input"
      })
    },
    //--------------------------------------
    async addNewGroup() {
      let name = await Ti.Prompt("i18n:hmaker-edit-form-new-group-tip")
      name = _.trim(name)
      // User cancel
      if(!name) {
        return
      }

      // Check Duplicate
      if(this.existsName(name)) {
        return await Ti.Toast.Open({
          content: "i18n:hmaker-edit-form-new-field-e1",
          type: "error",
          vars: {val:name},
          position: "center",
          duration: 5000
        })
      }

      // Then Add new 
      this.addFieldOrGroup({
        type   : "Group",
        title  : name,
        fields : []
      })
    },
    //--------------------------------------
    async removeSelectedFieldOrGroup() {
      let cur = this.getMyCurrent()
      //....................................
      // Guard
      if(!cur) {
        return Ti.Toast.Open("i18n:hmaker-edit-form-nil-field", "warn")
      }
      //....................................
      // Prepare the newValue
      let fields;
      //....................................
      // Delete group
      if(cur.group && !cur.field) {
        let ask = true
        if(!_.isEmpty(cur.group.fields)) {
          ask = await Ti.Confirm("i18n:hmaker-edit-form-del-group-confirm", {
            closer : true,
            textYes: "i18n:hmaker-edit-form-del-group-all",
            textNo: "i18n:hmaker-edit-form-del-group-only",
          })
        }
        // User Cancel
        if(_.isUndefined(ask))
          return
        // Remove Group
        let index = _.first(cur.index)
        fields = _.filter(this.value, (_, i)=>i!=index)
        // Group only, insert the fields back to list
        if(false === ask) {
          if(!_.isEmpty(cur.group.fields)) {
            Ti.Util.insertToArray(fields,index, ...cur.group.fields) 
          }
        }
      }
      //....................................
      // Delete field in group
      else if(cur.group && cur.field) {
        fields = _.cloneDeep(this.value)
        let grp = _.cloneDeep(cur.group)
        let i0 = _.first(cur.index)
        let i1 = _.last(cur.index)
        grp.fields = _.filter(grp.fields, (_, i)=>i!=i1)
        fields[i0] = grp
      }
      //....................................
      // Delete field
      else {
        let index = _.first(cur.index)
        fields = _.filter(this.value, (_, i)=>i!=index)
      }
      //....................................
      // Select next item
      this.selectNextIdByIndex(cur.index, fields)
      //....................................
      // Notify change
      this.$notify("change", fields)
    },
    //--------------------------------------
    moveSelectedFieldsUp() {
      let fields = _.cloneDeep(this.value)
      let cur = this.getMyCurrent(fields)
      //....................................
      // Guard
      if(!cur) {
        return Ti.Toast.Open("i18n:hmaker-edit-form-nil-field", "warn")
      }
      let i0 = _.first(cur.index)
      //....................................
      // In Group
      if(cur.group && cur.field) {
        let i1 = _.last(cur.index)
        // Move out from group
        if(i1 == 0) {
          _.remove(cur.group.fields, (_, i)=>i==i1)
          Ti.Util.insertToArray(fields, i0, cur.field)
          this.myCurrentId = _.last(cur.path)
        }
        // Just move up
        else {
          cur.group.fields[i1] = cur.group.fields[i1-1]
          cur.group.fields[i1-1] = cur.field
        }
      }
      // At top
      else if(i0>0) {
        let prev = fields[i0-1]
        // Move in to group
        if(this.isGroup(prev) && cur.field && this.$tree.isOpened(prev.title)) {
          _.remove(fields, (_, i)=>i==i0)
          if(_.isArray(prev.fields)) {
            prev.fields.push(cur.field)
          } else {
            prev.fields = [cur.field]
          }
          this.myCurrentId = [prev.title, _.last(cur.path)].join("/")
        }
        // Switch
        else {
          fields[i0] = fields[i0-1]
          fields[i0-1] = cur.field || cur.group
        }
      }
      //....................................
      // Notify change
      this.$notify("change", fields)
    },
    //--------------------------------------
    moveSelectedFieldsDown() {
      let fields = _.cloneDeep(this.value)
      let cur = this.getMyCurrent(fields)
      //....................................
      // Guard
      if(!cur) {
        return Ti.Toast.Open("i18n:hmaker-edit-form-nil-field", "warn")
      }
      let i0 = _.first(cur.index)
      //....................................
      // In Group
      if(cur.group && cur.field) {
        let i1 = _.last(cur.index)
        // Move out from group
        if(i1 >= (cur.group.fields.length - 1)) {
          _.remove(cur.group.fields, (_, i)=>i==i1)
          Ti.Util.insertToArray(fields, i0+1, cur.field)
          this.myCurrentId = _.last(cur.path)
        }
        // Just move down
        else {
          cur.group.fields[i1] = cur.group.fields[i1+1]
          cur.group.fields[i1+1] = cur.field
        }
      }
      // At top
      else if(i0 < (fields.length-1)) {
        let next = fields[i0+1]
        // Move in to group
        if(this.isGroup(next) && cur.field && this.$tree.isOpened(next.title)) {
          _.remove(fields, (_, i)=>i==i0)
          if(_.isArray(next.fields)) {
            Ti.Util.insertToArray(next.fields, 0, cur.field)
          } else {
            next.fields = [cur.field]
          }
          this.myCurrentId = [next.title, _.last(cur.path)].join("/")
        }
        // Switch
        else {
          fields[i0] = fields[i0+1]
          fields[i0+1] = cur.field || cur.group
        }
      }
      //....................................
      // Notify change
      this.$notify("change", fields)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted: function() {
    // !!!!!!!!!!!!!!!!!!!!!!!!!
    //console.log("mounted")
    let vueDropMe = Ti.Storage.local.getObject("vue-drop-me", null)
    if(vueDropMe) {
      let du = Date.now() - vueDropMe.timeInMs
      console.log({du})
      if(du < 1000) {
        this.myCurrentId = vueDropMe.myCurrentId
      }
      Ti.Storage.local.remove("vue-drop-me")
    }
    // Auto Select first item
    else {
      this.selectNextIdByIndex([0])
    }
  },
  //////////////////////////////////////////
  beforeDestroy: function(){
    // !!!!!!!!!!!!!!!!!!!!!!!!!
    //console.log("beforeDestroy")
    // Vue will drop the com in some magical time
    // So I need  keep the state in 1000ms in case
    Ti.Storage.local.setObject("vue-drop-me", {
      myCurrentId : this.myCurrentId,
      timeInMs : Date.now()
    })
  }
  //////////////////////////////////////////
}
export default _M;