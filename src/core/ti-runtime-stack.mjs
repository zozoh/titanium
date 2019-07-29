export class TiRuntimeStack {
  //------------------------------------------
  constructor({setItemViewportMode=_.identity}={}) {
    this.viewportMode = "desktop"
    this.stack = []
    this.setItemViewportMode = setItemViewportMode
  }
  //------------------------------------------
  push(item) {
    if(item) {
      this.setItemViewportMode(item, this.viewportMode)
      this.stack.push(item)
    }
  }
  //------------------------------------------
  remove(item) {
    let stack = []
    let re
    for(let it of this.stack) {
      if(it === item) {
        re = it
      } else {
        stack.push(it)
      }
    }
    this.stack = stack
    return re
  }
  //------------------------------------------
  setViewportMode(mode) {
    this.viewportMode = mode
    for(let it of this.stack) {
      this.setItemViewportMode(it, mode)
    }
  }
  //------------------------------------------
  pop() {
    return this.stack.pop()
  }
  //------------------------------------------
}