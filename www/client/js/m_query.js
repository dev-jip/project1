var m = function( x ){
  var all = document.querySelectorAll( x );
  return all.length >1 ? all : document.querySelector(x);
};

m.sel = function( x, y ) {
  var a = _.filter(m.children(m(x)), (v,i,li) => {
    return v.className == y.split('.')[1];
  })
  console.log(a)
  return a.length ? a : m.sel(a, y)
}

m.children = function( x ) {
  return x.length ? x[0].children : x.children;
}

exports = m;
