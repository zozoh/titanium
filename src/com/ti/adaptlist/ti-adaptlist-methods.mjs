const OBJ = {
  //--------------------------------------------
  async doUpload(files = []) {
    if (_.isFunction(this.beforeUpload)) {
      await this.beforeUpload()
    }

    // Prepare the list
    let ups = _.map(files, (file, index) => ({
      id: `U${index}_${Ti.Random.str(6)}`,
      file: file,
      total: file.size,
      current: 0
    }))

    // Show Uploading
    this.myUploadigFiles = ups

    // Prepare the list
    let newIds = {}
    // Do upload file one by one
    for (let up of ups) {
      let file = up.file
      let { ok, data } = await Wn.Io.uploadFile(file, {
        target: `id:${this.meta.id}`,
        progress: function (pe) {
          up.current = pe.loaded
        }
      })
      if (ok) {
        newIds[data.id] = true
      }
    }

    // All done, hide upload
    _.delay(() => {
      this.myUploadigFiles = []
    }, 1000)

    if (_.isEmpty(newIds)) {
      return
    }

    // Tell user ...
    Ti.Toast.Open("i18n:upload-done", "success")


    // Call reload
    await this._run("reload")

    // Make it checked
    let checkIds = Ti.Util.truthyKeys(newIds)
    if (!this.multi) {
      checkIds = _.first(checkIds)
    }
    this.$innerList.checkRow(checkIds, { reset: true })
  }
  //--------------------------------------------
}
export default OBJ;