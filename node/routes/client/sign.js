app.get('/sign_up', ___(
  G.$rrn,
  _.t('abc', '\
    form[method=post action="/api/sign_up"]\
      input[name=email type=text placeholder="type your e-mail"]\
      input[name=password type=password]\
      input[type=submit value=submit]\
    img[src="https://s3.ap-northeast-2.amazonaws.com/iamami.aws.jip/8809493314302_B_064.jpg"]'),
  _(G.$res_$klass, 'love-story', 'sign-up'),
  G.$res_$render
))


app.get('/abc', ___(
  G.$rrn,
  _.t$('\
//    form[action="/api/upload" method=post enctype=multipart/form-data]\
//      input[type=text name=title ]\
      input[type=file name=uploads[] multiple class=upload-btn]\
      input[type=submit]\
      .progress-bar\
  '),
  _(G.$res_$klass, 'upload_test', 'upload_test'),
  G.$res_$render
))