!function() {
  _.pg.scheme.add('file', {
    table_name: 'file',
    "*": 'url, width, height, ai_url, user_id, type, attached_type, attached_id',
    timestamps: ['created_at', 'updated_at']
  }, {
    user: {
      name: 'user',
      f_key: 'user_id',
      type: 'belongs_to',
      '*': 'id, email, name, created_at',
      tail: $('where', $.and('users.name', 'dfg'))
    }
  });

  $$.add('user', {
    table_name: 'users',
    '*': 'id, email, name, created_at, updated_at',
    timestamps: ['created_at', 'updated_at'],
    tail: 'order by id asc'
  }, {
    file: {
      name: 'file',
      f_key: 'user_id',
      '*': '*',
      type: 'has_many'
    },
    story_like : {
      name: 'story_like',
      f_key: 'user_id',
      '*' : '*',
      type: 'belongs_to'
    }
  });

  $$.add('notice', {
    table_name: 'notice',
    '*': 'id, user_id, title, body, created_at, updated_at',
    timestamps: ['created_at', 'updated_at']
  }, {
    user: {
      name: 'user',
      f_key: 'user_id',
      type: 'belongs_to',
      '*': 'id, email, name'
    },
    file: {
      name: 'file',
      f_key: 'id',
      '*': '*',
      poly: {
        id: 'attached_id',
        key: 'attached_type',
        val: 'notice'
      },
      type: 'has_many'
    },
    file_join: {
      name: 'file',
      f_key: 'id',
      poly: {
        id: 'attached_id',
        key: 'attached_type',
        val: 'notice'
      },
      type: 'belongs_to'
    }
  });

  // 기본상품관리
  $$.add('base_product', {
    table_name: 'base_product',
    '*': 'id, name, price, is_public',
    timestamps: ['created_at', 'updated_at'],
    tail: 'where is_hidden is not true',
    virtuals: function(attrs) {
      return {
        __name_price: attrs.price + attrs.name,
        __id: attrs.id
      }
    }
  }, {
    base_product_faces: {
      name: 'base_product_face',
      type: 'has_many',
      f_key: 'base_product_id',
      //tail: 'where is_hidden is not true order by no'
    },
    base_product_sizes: {
      name: 'base_product_size',
      type: 'has_many',
      f_key: 'base_product_id',
      //tail: 'where is_hidden is not true order by no'
    },
    base_product_colors: {
      name: 'base_product_color',
      type: 'has_many',
      f_key: 'base_product_id',
      //tail: 'where is_hidden is not true order by no'
    }
  });

  $$.add('base_product_face', {
    table_name: 'base_product_face',
    '*': 'no, id, name, price, base_product_id, is_hidden, size_faces',
    timestamps: ['created_at', 'updated_at'],
    tail: 'where is_hidden is not true order by no'
  }, {
    base_product_color_faces: {
      name: 'base_product_color_face',
      type: 'has_many',
      f_key: 'base_product_face_id',
      //tail: 'where is_hidden is not true order by no'
    }
  });

  $$.add('base_product_size', {
    table_name: 'base_product_size',
    '*': 'no, id, name, price, short_name, info, base_product_id, is_hidden',
    timestamps: ['created_at', 'updated_at']
  });

  $$.add('base_product_color', {
    table_name: 'base_product_color',
    '*': 'no, id, name, color_code, base_product_id',
    timestamps: ['created_at', 'updated_at'],
    tail: 'where is_hidden is not true order by no'
  }, {
    base_product_color_faces: {
      name: 'base_product_color_face',
      type: 'has_many',
      f_key: 'base_product_color_id'
    }
  });

  $$.add('base_product_color_face', {
    table_name: 'base_product_color_face',
    '*': 'no, id, base_product_id, base_product_color_id, base_product_face_id, face_name, is_hidden, url',
    timestamps: ['created_at', 'updated_at'],
    tail: 'where is_hidden is not true order by no',
    virtuals: function(base_product_color_face) {
      return {
        __url_150: base_product_color_face.url && base_product_color_face.url.replace('/original/', '/150/')
      }
    }
  }, {
    //file: {
    //  name: 'file',
    //  f_key: 'base_produce_color_face_id',
    //  '*': '*',
    //  type: 'belongs_to'
    //}
    file: {
      name: 'file',
      f_key: 'id',
      '*': '*',
      poly: {
        id: 'attached_id',
        key: 'attached_type',
        val: 'base_produce_color_face'
      },
      type: 'belongs_to'
    },

  });

  $$.add('product', {
    table_name: 'product',
    '*': 'id, type, price, name, product_details, product_faces, base_product_id, base_product_color_id, created_at, updated_at, base_product_size_id, is_hidden, is_public',
    timestamps: ['created_at', 'updated_at'],
    tail: 'where is_hidden is not true'
  }, {
    base_product: {
      name: 'base_product',
      f_key: 'base_product_id',
      '*': 'id, price',
      type: 'belongs_to'
    },
    base_product_color: {
      name: 'base_product_color',
      f_key: 'base_product_color_id',
      type: 'belongs_to'
    }
    //base_product_sizes: {
    //  name: 'base_product',
    //  f_key: 'base_product_id',
    //  '*': '*',
    //  type: 'has_many'
    //},
    //base_product_colors: {
    //  name: 'base_product',
    //  f_key: 'base_product_id ',
    //  '*': '*',
    //  type: 'has_many'
    //}
  });

  // 태스크 스킴
  $$.add('task', {
    table_name: 'task',
    '*': 'id, user_id, worker_id, admin_id, title, body, status, created_at, updated_at, assigned_at',
    timestamps: ['created_at', 'updated_at'],
    tail: 'order by id desc'
  }, {
    task_member: {
      name: 'task_member',
      f_key: 'task_id',
      '*': 'id, task_id, user_id, type, created_at, updated_at',
      type: 'has_many'
    }
  });

  $$.add('task_member', {
    table_name: 'task_member',
    '*': 'id, task_id, user_id, type, created_at, updated_at',
    timestamps: ['created_at', 'updated_at'],
    tail: 'order by id desc'
  });


  // 장바구니 스킴
  $$.add('projection', {
    table_name: 'projection',
    '*': 'id, status, user_id, receiver_address, receiver_name, receiver_mobile, receiver_memo, orderer_name, orderer_mobile, user_product_id, total_price, quantity, ordered_at, refund_request, refund_response',
    timestamps: ['created_at', 'updated_at'],
    tail: 'order by id desc'
  }, {
    user_products: {
      name: 'user_product',
      f_key: 'projection_id',
      '*': 'id, user_id, product_id, user_product_id, is_selected, quantity',
      type: 'has_many'
    },
    user_product: {
      name: 'user_product',
      f_key: 'user_product_id',
      '*': 'id, user_id, product_id, user_product_id, is_selected, quantity',
      type: 'belongs_to',
    },
    projection_payments: {
      name: 'projection_payment',
      f_key: 'projection_id',
      '*': 'id, type, pay_id, is_refund, projection_id, ordered_at, total_price',
      type: 'has_many'
    }
  });

  $$.add('projection_payment', {
    table_name: 'projection_payment',
    '*': 'id, type, pay_id, is_refund, projection_id, ordered_at, total_price',
    timestamps: ['created_at', 'updated_at'],
    tail: 'order by id desc'
  });

  $$.add('user_product', {
    table_name: 'user_product',
    '*': 'id, user_id, product_id, is_selected, quantity',
    timestamps: ['created_at', 'updated_at']
  }, {
    product: {
      name: 'product',
      f_key: 'product_id',
      '*': 'id, created_at, updated_at, price, name, product_faces',
      type: 'belongs_to'
    }
  });

  $$.add('product_list', {
    table_name: 'product',
    '*': 'id, price, name, base_product_id, created_at, updated_at',
    timestamps: ['created_at', 'updated_at']
  }, {
    base: {
      type: 'belongs_to',
      f_key: 'base_product_id',
      name: 'base_product_list'
    }
  });

  $$.add('base_product_list', {
    table_name: 'base_product',
    '*': 'id, price, name, created_at, updated_at',
    timestamps: ['created_at', 'updated_at']
  }, {
    product: {
      type: 'has_many',
      f_key: 'base_product_id',
      name: 'product_list'
    }
  });

  //
  // _.go(_p.pg.s.join([
  //   // [['*', 'notice', $('order', 'by', 'id')], 'user']
  //   'notice.user',
  //   'notice.file_join.user'
  // ]), _.last, function(r) {
  //   console.log(r);
  //   console.log(r._.user, '---------------------------');
  //   console.log(r._.file[0]._.user, '---------------------------');
  // });
  //
  // _.go(_p.pg.s.select([
  //   'notice.user',
  //   ['notice', ['*', 'file', $('where', $.and('id', '10'))]],
  //   'notice.file.user'
  // ]), _.last, function(r) {
  //   console.log(r);
  //   console.log(r._.user, '---------------------------');
  //   console.log(r._.file[0]._.user, '---------------------------');
  // });
  //
  // _.go(_p.pg.s.select_one([
  //   // [['*', 'notice', $('order', 'by', 'id')], 'user']
  //   'notice.user',
  //   'notice.file.user'
  // ]), function(r) {
  //   console.log(r);
  //   console.log(r._.user, '---------------------------');
  //   console.log(r._.file[0]._.user, '---------------------------');
  // });

  $$.add('story', {
    table_name: 'story',
    '*': 'id, title, user_id, comment_count, like_count, created_at, updated_at',
    timestamps: ['created_at', 'updated_at']
  }, {
    story_contents: {
      type: 'has_many',
      f_key: 'story_id',
      name: 'story_content',
      tail: 'order by no asc'
    },
    user: {
      type: 'belongs_to',
      f_key: 'id',
      name: 'user'
    },
    story_comments: {
      type: 'has_many',
      f_key: 'story_id',
      name: 'story_comment'
    }
  });

  $$.add('story_like', {
    table_name : 'story_like',
    '*' : 'id, story_id, created_at, updated_at, user_id',
    timestamps : ['created_at', 'updated_at']
  })

  $$.add('story_content', {
    table_name: 'story_content',
    '*': 'id, cid, type, story_id, url, body, body2, no, created_at, updated_at',
    timestamps: ['created_at', 'updated_at']
  }, {
    story_content_points: {
      type: 'has_many',
      f_key: 'story_content_id',
      name: 'story_content_point'
    }
  });

  $$.add('story_content_point', {
    table_name: 'story_content_point',
    '*' : 'id, created_at, cid, updated_at, top, left, story_content_id, user_id',
    timestamps: ['created_at', 'updated_at']
  }, {
    story_content_point_products: {
      type: 'has_many',
      f_key: 'story_content_point_id',
      name: 'story_content_point_product'
    }
  });
  $$.add('story_content_point_product', {
    table_name : 'story_content_point_product',
    '*' : 'id, created_at, updated_at, story_content_point_id, product_id',
    timestamps: ['created_at', 'updated_at']
  }, {
    product: {
      type: 'belongs_to',
      f_key: 'product_id',
      name: 'product'
    }
  });
  $$.add('story_comment', {
    table_name: 'story_comment',
    '*' : 'id, created_at, updated_at, user_id, story_id, body',
    timestamps: ['created_at', 'updated_at'],
    tail: 'order by created_at desc, id desc'
  },{
    user: {
      type: 'belongs_to',
      f_key: 'user_id',
      name: 'user'
    }
  });



  // 이미지 스킴
  $$.add('folder', {
    table_name: 'folder',
    '*': 'id, name, url, count, is_public, is_hidden, created_at, updated_at',
    timestamps: ['created_at', 'updated_at'],
    tail: ''
  }, {
    images: {
      type: 'has_many',
      f_key: 'folder_id',
      name: 'image'
    }
  });

  $$.add('image', {
    table_name: 'image',
    '*': 'id, name, price, type, can_press_types, is_hidden, folder_id, created_at, updated_at',
    timestamps: ['created_at', 'updated_at'],
    tail: ''
  }, {
    folder: {
      type: 'belongs_to',
      f_key: 'folder_id',
      name: 'image'
    },
    image_colors: {
      type: 'has_many',
      f_key: 'image_id',
      name: 'image_color',
      tail: 'and is_hidden = false order by id desc'
    }
  });

  $$.add('image_color', {
    table_name: 'image_color',
    '*': 'id, name, url, width, height, press_color_code, is_hidden, press_color_id, created_at, updated_at',
    timestamps: ['created_at', 'updated_at'],
    tail: '',
    virtuals: function(image_color) {
      return {
        __url_150: image_color.url && image_color.url.replace('/original/', '/150/')
      }
    }
  }, {
    image: {
      type: 'belongs_to',
      f_key: 'image_id',
      name: 'image'
    },
    press_color: {
      type: 'belongs_to',
      f_key: 'press_color_id',
      name: 'press_color'
    },
    file: {
      name: 'file',
      f_key: 'id',
      '*': '*',
      poly: {
        id: 'attached_id',
        key: 'attached_type',
        val: 'image_color'
      },
      type: 'belongs_to'
    }
  });

  $$.add('press_color', {
    table_name: 'press_color',
    '*': 'id, name, color_code, is_hidden, can_flex, created_at, updated_at',
    timestamps: ['created_at', 'updated_at'],
    tail: ''
  });

}();