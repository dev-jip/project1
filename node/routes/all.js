G.$rrn = function(req, res, next) {
  this.req = req;
  this.res = res;
  this.next = next;
};

G.$res_$klass = (title, klass, body) => {
  return { title: title, klass: klass, body: body }
};

G.$res_$render = function(render_obj) {
  var box = this.box;
  this.res.render(app.locals.base_ejs, _.extend(render_obj, box ? {
    box: box.stringify()
  } : {
    box: '{}'
  }));
};