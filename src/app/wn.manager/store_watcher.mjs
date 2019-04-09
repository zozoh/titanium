export default function(store){
  store.subscribe((mutation, state) => {
    // called after every mutation.
    // The mutation comes in the format of `{ type, payload }`.
    // console.log("mutation", mutation)
    // console.log("state", state)
  })
}