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
   * scrollIndex(-5, 5) => 0
   * ```
   */
  scrollIndex(index, len=0) {
    if(len > 0) {
      let md = index % len;
      return md >= 0
        ? md
        : len + md
    }
    return -1
  },
  /***
   * @param n{Number} input number
   * @param p{Number} precise bit
   * 
   * @return The number after tidy
   */
  precise(n, p=2) {
    if (p >= 0) {
        var y = Math.pow(10, p);
        return Math.round(n * y) / y;
    }
    return n;
  },
  /***
   * @param v{Number} input number
   * @param unit{Number} number unit
   * 
   * @return new ceil value for unit
   */
  ceilUnit(v, unit=0) {
    if(_.isNumber(v) && unit > 0) {
      let n = Math.ceil(v / unit)
      return n * unit
    }
    return v
  },
  /***
   * @param v{Number} input number
   * @param unit{Number} number unit
   * 
   * @return new floor value for unit
   */
  floorUnit(v, unit=0) {
    if(_.isNumber(v) && unit > 0) {
      let n = Math.floor(v / unit)
      return n * unit
    }
    return v
  }
}
//---------------------------------------
export const Num = TiNum

