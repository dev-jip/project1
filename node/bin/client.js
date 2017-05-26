require('../all/app');
app.locals.base_ejs = 'client';

require('../routes/all');


require('../routes/client/sign');


require('../apis/client/sign');

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});