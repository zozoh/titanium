const _M = {
  //-----------------------------------------------
  // Delegate Quill Methods
  //-----------------------------------------------
  getSelection  (...args){return this.$editor.getSelection(...args)},
  setSelection  (...args){return this.$editor.setSelection(...args)},
  updateContents(...args){return this.$editor.updateContents(...args)},
}
export default _M;