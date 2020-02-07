//-----------------------------------
const TiNum = {
  /***
   * Fill array from given number. 
   * It will mutate the input array
   * 
   * @param startValue{Number} - The begin number to fill
   * @param len{Number} - how may items should be filled
   * @param ary{Array} - source array
   * @param step{Number} - Number increasement
   * 
   * @return the source array passed in
   */
  fillSteps(startValue=0, len=1, {
    ary=[], step=1
  }={}){
    for(let i=0; i<len; i++) {
      ary[i] = startValue + i*step
    }
    return ary
  },
  /***
   * Clamp the number in range.
   * 
   * ```
   * scrollIndex( 3, 5) => 3
   * scrollIndex( 0, 5) => 0
   * scrollIndex( 4, 5) => 4
   * scrollIndex( 5, 5) => 1
   * scrollIndex( 6, 5) => 2
   * scrollIndex(-1, 5) => 4
   * scrollIndex(-5, 5) => 0
   * scrollIndex(-6, 5) => 4
   * ```
   */
  scrollIndex(index, len=0) {
    if(len > 0) {
      if(index < 0) {
        return len + (index%len)
      }

      if(index >= len) {
        return index % len
      }

      return index
    }
    return -1
  }
}
//---------------------------------------
export default TiNum

