var _ = require('./partial');

var i= 0
var updatePosition = ()=>console.log(i++);


var throttled = _.throttle(updatePosition, 1000);

throttled()
throttled()
throttled()
// _.delay(throttled, 4000)
// _.delay(throttled, 200)
// _.delay(throttled, 600)
// _.delay(throttled, 600)
// _.delay(throttled, 600)
//
// _.delay(throttled, 900)
// _.delay(throttled, 1000)
// _.delay(throttled, 1200)
// _.delay(throttled, 1300)
// _.delay(throttled, 400)
// _.delay(throttled, 400)
// _.delay(throttled, 400)
// _.delay(throttled, 400)
// _.delay(throttled, 400)

