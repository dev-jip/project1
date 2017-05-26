
var _ = {};


function _go(target, ...func) {
  return _reduce(func, (m, v)=>v(m), target);
}

_.go = _go;

function _curry(target, number) {

}


function _partial(func, ...args) {
  var arr = _reduce(args, function(m, v){
    if(v == _) return m;
    return m.concat(v)
  }, []);
  if(args.length == arr.length) return (...future)=>func(...arr, ...future);
  // console.log(arr, '===========')
  return (...future)=>func(...future, ...arr)
}



_.partial = _partial;

function _map(target, iteratee) {
  if(_isFunc(target)) return _partial(_map, _, target);

  if(Array.isArray(target)) res = [];
  if(_isObject(target)) res = {};
  for(var i in target) {
    res[i] = iteratee(target[i], i, target)
  }
  return res
}

_.map = _map;

function _each(target, iterate) {
  if(_isFunc(target)) return _partial(_each, _, target);
  for(var i in target) {
    iterate(target[i], i, target)
  }
}

_.each = _each;

function _reduce(target, iterate, start) {
  if(_isFunc(target)) return _partial(_reduce, _, target);

  var {memo, i} = start ? {memo: start, i: 0} : {memo: target[0], i:1};
  for(; i<target.length; i++) {
    memo = iterate(memo, target[i], i, target);
  }
  return memo;

}
_.reduce = _reduce

// function _reduceRight(target, iterate) {
//   return _reduce(target.reverse(), iterate);
//
// }
//
// _.reduceRight = _reduceRight;

function _find(target, predicate) {
  if(_isFunc(target)) return _partial(_find, _, target);

  for(var i in target) {
    if(predicate(target[i], i, target))
      return target[i]
  }
}
_.find = _find;

function _where(target, properties) {
  if(_isFunc(target)) return _partial(_where, _, target);
  return _filter(target, (v, i , li)=>_isMatch(v, properties));
}

_.where = _where;
function _findWhere(target, properties) {
  if(_isFunc(target)) return _partial(_findWhere, _, target);
  return _find(target, (v, i , li)=>_isMatch(v, properties));
}

var listOfPlays = [{title: "Cymbeline", author: "Shakespeare", year: 1611},
  {title: "The Tempest", author: "Shakespeare", year: 1611}];




function _filter(list, predicate){
  if(_isFunc(list)) return _partial(_filter, _, list);
  var res = []
  for(var i in list) {
    predicate(list[i], i, list) && res.push(list[i])
  }
  return res
}

_.filter = _filter;


function _reject(list, predicate) {
  if(_isFunc(list)) return _partial(_reject, _, list);
  return _filter(list, _negate(predicate));
}

_.reject = _reject;

function _every(list, predicate = (v)=> !!v) {
  if(_isFunc(list)) return _partial(_every, _, list);
  return _find(list, _negate(predicate)) === undefined;
}
_.every = _every;

function _some(list, predicate = _identity) {
  if(_isFunc(list)) return _partial(_some, _, list);
  return !(_find(list, predicate) === undefined)
}

_.some = _some;

function _contains(list, value) {
  if(_isFunc(list)) return _partial(_contains, _, list);
  return _some(list, (v)=> v == value);
}

_.contains = _contains;

function _invoke(list, method) {
  if(_isFunc(list)) return _partial(_invoke, _, list);
  return _isFunc(method) ? _map(list, (v)=>method(v)) : _map(list, (v)=>v[method]());
}
_.invoke = _invoke;

function _pluck(list, propertyName) {
  if(propertyName === undefined) return _partial(_pluck, _, list);
  return _map(list, (v)=>v[propertyName]);  
}

_.pluck = _pluck

// var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
// _.max(stooges, function(stooge){ return stooge.age; });
// => {name: 'curly', age: 60};

function _max(list, iteratee) {
  if(_isFunc(list)) return _partial(_max, _, list);
  return _isFunc(iteratee) ? _reduce(list, (m,v)=>iteratee(m)<=iteratee(v)?v : m) : _reduce(list, (m,v)=>m<=v?v:m);
}

_.max = _max;

function _min(list, iteratee) {
  if(_isFunc(list)) return _partial(_min, _, list);
  return _isFunc(iteratee) ? _reduce(list, (m,v)=>iteratee(m)<=iteratee(v)?m : v) : _reduce(list, (m,v)=>m<=v?m:v);
}
_.min = _min;

function cb(iteratee) {
  if(_isFunc(iteratee)) return (v) =>iteratee(v);
  if(_isStr(iteratee)) return (v)=>v[iteratee];
  if(!iteratee) return (v) => v;
}


function _sortBy(list, iteratee) {
  if(iteratee === undefined && !_isArray(list)) return _partial(_sortBy, _, list);

  iteratee = cb(iteratee);
  return _go(list,
    _map(function(v, i){return {value: v, index: i, res: iteratee(v)}
  }), (v)=>v.sort(function(a,b){
      if(a.res>b.res) return 1;
      if(a.res<b.res) return -1;
      return a.index - b.index;
    }), _pluck('value'));
}

_.sortBy = _sortBy;


function _group(behavior) {
  return function sorting (list, iteratee){
    if(iteratee===undefined && !_isArray(list)) return _partial(sorting, _, list);
    iteratee = cb(iteratee);
    return _.reduce(list, function(m, v){
      return behavior(m,iteratee, v);
    }, {});
  }
}

_.groupBy = _groupBy = _group(function(m, iteratee, v){
  m[iteratee(v)] ? m[iteratee(v)].push(v): m[iteratee(v)] = [v];
  return m;
});

_.countBy = _countBy = _group(function(m, iteratee, v){
  m[iteratee(v)] ? ++m[iteratee(v)] : m[iteratee(v)] = 1;
  return m;
});

_.indexBy = _indexBy = _group(function(m, iteratee, v){
  m[iteratee(v)] = v;
  return m;
});

function _shuffle(list){
  var clo = _clone(list);
  var res = [];
  do {
    var num = Math.floor((Math.random()*(clo.length-1)));
    res.push(clo.splice(num, 1)[0]);
  } while(clo.length)
  return res;
}

function _clone(list) {
  return _reduce(list, (m,v)=>m.concat(v), []);
}

function _sample(list, n) {
  return _shuffle(list).splice(0, n);
}

function _range(end_num) {
  var arr = [];
  for(var i = 0; i <end_num ; i++) {
    arr[i] = i
  }
  return arr;
}

_.range = _range;

function _isArray(target) {
  return Array.isArray(target);
}

_.isArray = _isArray;

function _negate(predicate) {
  return function(...arg) {
    return !predicate(...arg);
  }
}

_.negate = _negate;

function _identity(value) {
  return value;
}

_.identity = _identity

function _isObject(target) {
  return typeof target === 'object' && !target.length
}

_.isObject = _isObject;

function _isFunc(target) {
  return typeof target === 'function'
}

_.isFunc = _isFunc;

function _isStr(target) {
  return typeof target === 'string';
}

_.isStr = _isStr;

function _isMatch(object, properties) {
  for (var prop in properties) {
    if (!(object[prop] === properties[prop])) return false;
  }
  return true
}

_.isMatch = _isMatch;



module.exports = _;
