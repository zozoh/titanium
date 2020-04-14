export default {
  //////////////////////////////////////////
  data: ()=>({
    myCurrentId: null
  }),
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Array,
      default : undefined
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
          value: this.CurrentField
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
        type: "rows",
        border: true,
        blocks: [{
            size: 40,
            body: "actions"
          },{
            type: "cols",
            border: true,
            blocks: [{
                name: "tree",
                size: 300,
                body: "tree"
              }, {
                name: "detail",
                body: "detail"
              }]
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
            idBy: it => this.getFieldId(it),
            nameBy: it => this.getFieldId(it),
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
    addFieldOrGroup(fld) {
      //....................................
      // Clone the old
      let fields = []
      if(_.isArray(this.value)){
        fields.push(... this.value)
      }
      console.log("haha")
      //....................................
      // Find pos
      let list = fields
      let {path} = this.findField(this.myCurrentId) || {}
      let pos = -1
      //....................................
      if(path && "Group"!=fld.type) {
        let i0 = _.first(path)
        //..................................
        const _grp_list = (list, i)=>{
          let grp = _.nth(list, i)
          list = grp.fields
          if(!list) {
            list = []
            grp.fields = list
          }
          return list
        }
        //..................................
        // Select field in Group
        if(path.length > 1) {
          list = _grp_list(list, i0)
          pos  = _.last(path) + 1
        }
        //..................................
        // Select a group
        else if("Group" == list[i0].type) {
          list = _grp_list(list, i0)
          pos  = -1
        }
        //..................................
        // Insert after
        else {
          pos = i0 + 1
        }
        //..................................
      }
      //....................................
      // push to end
      Ti.Util.insertToArray(list, pos, fld)
      //....................................
      // Notify change
      this.$notify("change", fields)
      //....................................
      // Hightlight it
      this.myCurrentId = this.getFieldId(fld)
    },
    //--------------------------------------
    getFieldId(fldOrName) {
      return _.isPlainObject(fldOrName)
              ? Ti.Util.anyKey(fldOrName.name || fldOrName.title)
              : Ti.Util.anyKey(fldOrName)
    },
    //--------------------------------------
    findField(fldOrName) {
      let theFldId = this.getFieldId(fldOrName)
      if(_.isArray(this.value)) {
        for(let i=0; i<this.value.length; i++) {
          let fld = this.value[i]
          let fldId = this.getFieldId(fld)
          // Found
          if(theFldId == fldId) {
            return {
              index : i,
              path  : [i],
              field : fld
            }
          }
          // Group
          if("Group" == fld.type && _.isArray(fld.fields)) {
            for(let x=0; x<fld.fields.length; x++) {
              let sub = fld.fields[x]
              let subId = this.getFieldId(sub)
              // Found
              if(theFldId == subId) {
                return {
                  index : x,
                  path  : [i, x],
                  field : sub
                }
              }
            }
          } // ~ if("group"
        } // ~ for(let i=0; i<this.value.length; i++)
      } // ~ if(_.isArray(this.value))
    },
    //--------------------------------------
    existsField(fldOrName) {
      let ff = this.findField(fldOrName)
      return ff ? true : false
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
      if(this.existsField(fldName)) {
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
      if(this.existsField(name)) {
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
    }
    //--------------------------------------
    // evalFieldAsTreeNode(children=[], fld={}) {
    //   let node = {name: fld.name}
    // },
    // //--------------------------------------
    // evalFieldTree() {
    //   let root = {name:"Fields", children:[]}
    //   if(this.value && _.isArray(this.value.fields)) {
    //     for(let fld of this.value.fields) {
    //       this.evalFieldAsTreeNode(root.children, fld)
    //     }
    //   }
    //   return root
    // }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    // "value" : {
    //   handler: "evalFieldTree",
    //   immediate: true
    // }
  }
  //////////////////////////////////////////
}