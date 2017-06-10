app.get('/card', ___(
  G.$rrn,
  _.t$('\
  p 123123123123\
  .menu\
    .create create\
  .card_container\
    .card_main\
  '),
_(G.$res_$klass, 'card', 'card'),
  G.$res_$render
));

app.post('/api/cards', ___(
  G.$rrn,
  function(){return $.select('id, img', 'cards')},
  function(res){
    return this.res.send(res);
  }
))