var _ = require('./partial');

// _.go(_.range(10),
//   _.reduce((m, v)=>{
//     return new Promise(function(resolve) {
//       setTimeout(function(){
//         console.log(v);
//         resolve(m+v);
//       }, 200);
//     })
//   }, 0),
//   _.log);

// new Promise(function(resolve){
//   setTimeout(function(){
//     resolve('1223')
//   }, 200)
// }).then(function(v){
//   console.log(v)
// })



// _.log(_.range(10).map(v=>{
//   return $.post('/abcd', {a: 123})
//
// }))

var a = _.throttle(()=>console.log('aa'), 1000, {trailing: false});
a()
a()
a()
a()
a()
a()