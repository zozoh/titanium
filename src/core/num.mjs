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
  }
}
//---------------------------------------
export default TiNum

