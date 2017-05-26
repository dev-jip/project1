app.post('/api/sign_up', ___(
  G.$rrn,
  function(){
    var at = new Date();
    return $.insert('users', _.extend(this.req.body, {created_at : at, updated_at: at}))
  },
  _.hi
))

app.post('/api/upload', upload.array('photo', 10), ___(
  G.$rrn,
  function(){
    return this.req.files
  },
  _.hi
))