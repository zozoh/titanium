const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('')
//---------------------------------------
const TiRandom = {
  /***
   * Generator `N` length random string
   */
  str(n=4, dict=CHARS) {
    let s = ''
    for(let i=0; i < n; i++) {
      let index = _.random(0, CHARS.length - 1)
      s += dict[index]
    }
    return s
  },
  obj(dict=CHARS) {
    let index = _.random(0, CHARS.length - 1)
    return dict[index]
  },
  list(input=[], n=input.length) {
    let last = Math.min(n, input.length) - 1
    for(; last>0; last--) {
      let index = _.random(0, last)
      let lo = input[last]
      let li = input[index]
      input[last]  = li
      input[index] = lo
    }
    return input
  }
}
//---------------------------------------
export const Random = TiRandom

