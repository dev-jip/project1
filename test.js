
// import _ from './lib'



var arr = _.range(10000).reverse()
console.time()
arr.sort()
// console.log(arr.sort())
// _.go(arr, _.sortBy(_.identity))
console.timeEnd()
