!function(_, knex) {
  var omit_1 = data => _.omit(data, function(val, key) {
    return key == "_" || key.indexOf('__') == 0;
  });

  var omit_2 = data => _.map(_.wrap_arr(data), omit_1);

  function q(t) {
    if (t.match(/\(([^]*?)\)/)) {
      var $1 = RegExp.$1;
      return t.replace($1, q($1));
    }
    if (t.match(/\./)) return _.map(t.split('.'), q).join('.');
    return t == '*' ? t : '"' + t.replace(/"/g, '') + '"';
  }

  function make_select_func(data, returning) {
    return _.map(returning ? (_.reject(_.isArray(returning) ? returning : returning.split(/\s*,\s*/g), function(val) {
        return val == "_" || val.indexOf('__') == 0;
      })) :
        _.keys(omit_1(_.isArray(data) ? _.defaults.apply(null, [{}].concat(data)) : data))
      , q).join(',');
  }
  // 'count(*), max("s"."age")'.replace(/\((.*?)\)/g, '("$1")')
  function returning_func(data, returning) {
    var _returning = make_select_func(data, returning);
    return _returning == '' ? 'id' : _returning + ',id';
  }

  GLOBAL.$ = _.pg = function() {
    var args = _.flatten(arguments);
    return _.go(args,
      _.to_mr,
      _.args,
      _.flatten,
      _.reject(_.isUndefined),
      (v) => v.join(' '));
  };

  _.pg.data_utc_date = function(data) {
    return _.mapObject(data, function(val) {
      if (!_.isObject(val) || val.constructor !== Date) return val;
      return val.toUTCString();
    })
  };

  _.pg.trx = (trx, tr_promise) => ({
    trx: trx,
    rollback: (msg) => {
      return new knex.Promise((rs) => {
        trx.rollback(msg);
        tr_promise.catch((err) => rs(err));
      });
    },
    commit: (data) => {
      trx.commit(data);
      return tr_promise.then(_.idtt);
    }
  });

  _.pg.transaction = _.cb((cb1) => {
    var tr_promise;
    _.go(__,
      _.cb((cb2) => tr_promise = knex.transaction((trx) => cb2(trx))),
      (trx) => cb1(_.pg.trx(trx, tr_promise)));
  });
  _.pg.raw = (raw_query) => knex.raw(raw_query).then(_.identity);
  _.pg.raw.trx = (raw_query, trx) => knex.raw(raw_query).transacting(trx.trx).then(_.identity);

  _.pg.insert = _.pipe(
    _.pg.insert_str = (table, data, returning) => {
      return _.pg(knex(table).insert(omit_2(_.pg.data_utc_date(data))).toString(),
        'returning', returning_func(data, returning))
    },
    _.pg.i_u_d_raw_str = _.pipe(
      _.pg.raw, _.property('rows'),
      v => v.length == 0 ? null : v.length == 1 ? v[0] : v));

  _.pg.insert.trx = _.pipe(
    function() {
      return _.mr(_.pg.insert_str.apply(null, _.initial(arguments)), _.last(arguments));
    },
    _.pg.i_u_d_raw_trx_str = _.pipe(
      _.pg.raw.trx, _.property('rows'),
      v => v.length == 0 ? null : v.length == 1 ? v[0] : v));

  _.pg.update = _.pipe(
    _.pg.update_str = (table, data, tail, returning) =>
      _.pg(knex(table).update(omit_1(_.pg.data_utc_date(data))).toString(), _.pg.tail(tail),
        'returning', returning_func(data, returning)),
    _.pg.i_u_d_raw_str);

  _.pg.update.trx = _.pipe(
    function() {
      return _.mr(_.pg.update_str.apply(null, _.initial(arguments)), _.last(arguments));
    },
    _.pg.i_u_d_raw_trx_str);

  _.pg.del = _.pipe(
    _.pg.del_str = (table, tail, returning) => _.pg('delete', 'from', table, _.pg.tail(tail),
      'returning', returning_func({id: null}, returning)),
    _.pg.i_u_d_raw_str);

  _.pg.del.trx = _.pipe(
    function() {
      return _.mr(_.pg.del_str.apply(null, _.initial(arguments)), _.last(arguments));
    },
    _.pg.i_u_d_raw_trx_str);

  _.pg.tail =
    _.If(_.pipe(
      v => _.isFunction(v) ? v() : v,
      v => _.isString(v) ? v : _.pg.where(v)))
      .else(_.constant(''));

  _.pg.column = _.pipe(columns => _.isArray(columns) ? columns.join(',') : columns);

  _.pg.wrap = _.pipe(str => '(' + str + ')');

  _.pg.or = remove_select__(knex.orWhere);
  _.pg.and = remove_select__(knex.andWhere);

  _.pg.where = function() { return $('where', $.and.apply(null, arguments)) };

  _.pg.not = remove_select__(knex.whereNot);
  _.pg.in = remove_select__(knex.whereIn);

  _.pg.node = _.pipe((as, cols) =>
    _.map(_.isArray(cols) ? cols : cols.split(/\s*,\s*/g), val => q(as) + '.' + q(val)).join(', '));

  _.pg.node_all = _.pipe(
    _.args,
    _(_.map, _, _.pipe((args) => _.pg.node(args[0], args[1]))),
    _('join', ', '));

  _.pg.node_as = _.pipe((as, cols, table, sep) =>
    _.map(_.isArray(cols) ? cols : cols.split(/\s*,\s*/g), val => q(as) + '.' + q(val) + ' as ' + q(table + sep + val)).join(', '));

  _.pg.node_as_all = _.pipe(
    _.args,
    _(_.map, _, _.pipe((args) => _.pg.node_as(args[0], args[1], args[2], args[3]))),
    _('join', ', '));

  _.pg.select_one = _.pg.find = _.pipe(
    _.pg.select_one_str = _.pg.find_str = (columns, table, tail) =>
      _.pg('select', make_select_func({}, _.pg.column(columns)), 'from', table, _.pg.tail(tail), 'limit 1'),
    _.pg.raw, _.property('rows'), _.first);

  _.pg.select = _.pg.filter = _.pipe(
    _.pg.select_str = _.pg.filter_str = (columns, table, tail) =>
      _.pg('select', make_select_func({}, columns), 'from', table, _.pg.tail(tail)),
    _.pg.raw, _.property('rows'));

  // ------------------------------------scheme----------------------------------------------------------

  GLOBAL.$$ = _.pg.scheme = _.extend((name) => _.pg.scheme._[name], { _: {} });
  _.pg.s = _.pg.scheme;
  _.pg.scheme.add = (name, table, rels) => {
    if (!_.pg.scheme._[name]) _.pg.scheme._[name] = { table: {} };
    _.pg.scheme._[name].name = name;
    _.extend(_.pg.scheme._[name].table, table);
    _.each(_.pg.scheme._[name].table.rels = rels, (rel) => {
      if (!_.pg.scheme._[rel.name]) _.pg.scheme._[rel.name] = { table: {}, name: rel.name };
      rel.table = _.pg.scheme._[rel.name].table;
    });
  };
  _.pg.scheme.virtuals = function(name, obj) {
    var s = _.pg.scheme(name);
    if (!s.table.virtuals) return obj;
    return _.extend(obj, s.table.virtuals(_.omit(obj, '_')));
  };

  _.pg.scheme.insert = _.indent(
    _.pg.scheme.insert_str = (scheme, data, returning) => {
      var date = (new Date()).toUTCString();
      var table = _.pg.scheme(scheme).table;
      return _.pg(knex(table.table_name).insert(_.map(_.wrap_arr(data), function(data) {
          return _.extend(_.object(table.timestamps, [date, date]), omit_1(_.pg.data_utc_date(data)));
        })).toString(),
        'returning', returning_func(data, returning));
    },
    _.pg.i_u_d_raw_str,
    _.pg.i_u_virtuals = function(rows) {
      var sname = this.arguments[0];
      return _.isArray(rows) ? _.each(rows, row => _.pg.scheme.virtuals(sname, row)) : _.pg.scheme.virtuals(sname, rows);
    });

  _.pg.scheme.insert.trx = _.indent(
    function() {
      return _.mr(_.pg.scheme.insert_str.apply(null, _.initial(arguments)), _.last(arguments));
    },
    _.pg.i_u_d_raw_trx_str,
    _.pg.i_u_virtuals);

  _.pg.scheme.update = _.indent(
    _.pg.scheme.update_str = (scheme, data, tail, returning) => {
      var date = (new Date()).toUTCString();
      var table = _.pg.scheme(scheme).table;
      return _.pg(knex(table.table_name).update(_.extend(_.object([table.timestamps[1]], [date]), omit_1(_.pg.data_utc_date(data)))).toString(),
        _.pg.tail(tail), 'returning', returning_func(data, returning));
    },
    _.pg.i_u_d_raw_str,
    _.pg.i_u_virtuals);

  _.pg.scheme.update.trx = _.indent(
    function() {
      return _.mr(_.pg.scheme.update_str.apply(null, _.initial(arguments)), _.last(arguments));
    },
    _.pg.i_u_d_raw_trx_str,
    _.pg.i_u_virtuals);

  _.pg.scheme.del = _.pipe(
    _.pg.scheme.del_str = (scheme, tail, returning) => {
      return _.pg('delete', 'from', _.pg.scheme(scheme).table.table_name, _.pg.tail(tail),
        'returning', returning_func({id: null}, returning));
    },
    _.pg.i_u_d_raw_str);

  _.pg.scheme.del.trx = _.pipe(
    function() {
      return _.mr(_.pg.scheme.del_str.apply(null, _.initial(arguments)), _.last(arguments));
    },
    _.pg.i_u_d_raw_trx_str);

  var push_squery = (arr, val) => _.go(
    _.map(val, _.pipe(_.idtt)),
    val => arr.push(val),
    _.constant(arr));

  _.pg.scheme.join = _.pipe(
    _.pg.scheme.squeries_group = _.Spread(
      _.map(_.pipe((squeries) =>
        _.reduce(_.wrap_arr(squeries), _.pipe((memo, squery) =>
          _.isArray(squery) ? push_squery(memo, squery) : memo.concat(_.map(squery.split('.'), (v) => ['*', v]))), [])))),
    function(squeries_group) {
      var columns = [];
      var inner_joins = [];

      var col_as_tail = squeries_group[0][0];
      var start_as = col_as_tail[1].split(/\s\s*as\s\s*/);
      if (!start_as[1]) start_as[1] = start_as[0];
      var start = _.pg.scheme(start_as[0]);
      var cols = col_as_tail[0];

      columns.push([
        start.name, cols == '*' ? start['*'] || start.table['*'] : cols, start.name, '__']);

      var complete = {};
      _.each(squeries_group, (squeries) => {
        var right = start;
        var right_as = start_as;
        _.each(_.rest(squeries), (col_as_tail) => {
          var cols = col_as_tail[0];
          var tail = col_as_tail[2] || '';
          var left = right;
          var left_as = right_as;
          right_as = col_as_tail[1].split(/\s\s*as\s\s*/);
          if (!right_as[1]) right_as[1] = right_as[0];
          right = left.table.rels[right_as[0]];
          if (complete[right_as[1]]) return ;
          columns.push([
            right_as[1], cols == '*' ? right['*'] || right.table['*'] : cols, right_as[1], '__']);

          var inner_join = ['inner join', q(right.table.table_name), 'as', q(right_as[1]),
            'on',
            q(right.type == "has_many" ? right_as[1] : left_as[1]) + '.' + q(right.f_key), '=', q(right.type == "has_many" ? left_as[1] : right_as[1]) + "." +
            (!right.poly ? "id" : [right.poly.id, 'and', q(right_as[1]) + "." + q(right.poly.key), "='" +right.poly.val + "'"].join(' '))];
          if (tail) inner_join = inner_join.concat('and (', tail, ')');
          inner_joins.push(inner_join);
          complete[right_as[1]] = true;
        });
      });

      return _.go(
        _.pg('select',
          _.pg.node_as_all.apply(null, columns),
          'from', q(start.table.table_name), 'as', q(start.name), inner_joins,
          _.pg(_.rest(arguments))
        ),
        _.pg.raw,
        _.property('rows'),
        _(_.map, _, (result) => {
          var result_obj = { _:{} };
          var _insert = (result, obj, table_name) => {
            return _.each(result, (val, key) => {
              if (key.indexOf(table_name+"__") == 0) obj[key.substr(table_name.length+2)] = val;
            });
          };
          _insert(result, result_obj, start.name);
          _.pg.scheme.virtuals(start.name, result_obj);

          var s = _.pg.scheme(start.name);
          _.each(squeries_group, (squeries) => {
            var rel = result_obj._;
            _.each(_.rest(squeries), (squerie) => {
              var keys = squerie[1].split(/\s\s*as\s\s*/);
              var key = keys[1] || keys[0];
              rel[key] = { _:{} };
              _insert(result, rel[key], key);
              _.pg.scheme.virtuals(s.table.rels[key].name, rel[key]);
              rel = rel[key]._;
              s = _.pg.s(s.table.rels[key].name);
            });
          });
          return result_obj;
        })
      );
    }
  );

  var pg_s_filters = [];
  _.pg.scheme.select = _.pg.scheme.filter = _.indent(
    _.pg.scheme.squeries_group,
    pg_s_filters[0] = (squeries_group) => {
      var merged_squeries_group = {};
      _.each(squeries_group, (squeries) => {
        var current_merged = merged_squeries_group;
        var stable;
        _.each(squeries, (col_as_tail) => {
          var col = col_as_tail[0];
          var as = col_as_tail[1];
          var tail = col_as_tail[2];
          stable = stable ? stable.table.rels[as] : _.pg.scheme(as);
          if (!current_merged[as]) {
            current_merged[as] = { col_stable_tail: [
              col != '*' ? col : stable['*'] || stable.table['*'] || '*',
              stable,
              tail || stable.tail || stable.table.tail], _: {} };

            current_merged = current_merged[as]._;
            return;
          }

          if (col != '*') current_merged[as].col_stable_tail[0] = col;
          if (tail) current_merged[as].col_stable_tail[2] = tail;
          current_merged = current_merged[as]._;
        })
      });
      return merged_squeries_group[_.keys(merged_squeries_group)[0]];
    },
    pg_s_filters[1] = _.pg._filter_ready = (start_squery, key) => {
      var scheme = start_squery.col_stable_tail[1];
      return _.mr(start_squery, start_squery.col_stable_tail[0], scheme, start_squery.col_stable_tail[2],
        scheme.table.table_name, _.reduce(start_squery._, (mem, rel, key) => {
          var rel2 = scheme.table.rels[key];
          if (rel2.type != 'belongs_to') return mem;
          return mem.concat(rel2.f_key);
        }, []), key);
    },
    (start_squery, cols, scheme, tail, table_name, f_keys) => _.mr(start_squery,
      _.pg.filter(_.pg(cols + (cols !== '*' && f_keys.length ? ',' + f_keys.join(',') : '')), table_name, tail)),
    pg_s_filters[2] = (start_squery, start_results) => {
      if (!_.size(start_squery._))
        return _.each(start_results, v => _.pg.scheme.virtuals(start_squery.col_stable_tail[1].name, v));
      return _.go(
        _.mr(start_squery, start_results),
        function recur(start_squery, start_results) {
          _.each(start_results, v => _.pg.scheme.virtuals(start_squery.col_stable_tail[1].name, v));

          if (!_.size(start_squery._) || !start_results.length) return ;
          return _.each(start_squery._, _.pipe(
            pg_s_filters[1],
            (start_squery2, cols, scheme, tail, table_name, f_keys, key) => {
              var where_in, arr, pluck, ids = ['id'], and = {};
              if (scheme.poly && scheme.poly.id) ids.push(scheme.poly.id);

              var columns = cols == '*' ? '*' : cols.split(/\s*,\s*/).concat(f_keys).concat(ids);
              if (scheme.type == 'has_many') {
                _.isArray(columns) && columns.push(scheme.f_key);
                if (scheme.poly && scheme.poly.id) {
                  pluck = _.compact(_.pluck(start_results, scheme.f_key));
                  if (!pluck.length) return ;
                  and[scheme.poly.key] = scheme.poly.val;
                  where_in = _.pg(_.pg.in(scheme.poly.id, pluck), 'and', _.pg.and(and));
                  arr = [_.groupBy, scheme.f_key, _.last(ids), true];
                } else {
                  pluck = _.compact(_.pluck(start_results, 'id'));
                  if (!pluck.length) return ;
                  where_in = _.pg.in(scheme.f_key, pluck);
                  arr = [_.groupBy, _.last(ids), scheme.f_key, true];
                }
              } else if (scheme.type == 'belongs_to') {
                pluck = _.compact(_.pluck(start_results, scheme.f_key));
                if (!pluck.length) return ;
                if (scheme.poly && scheme.poly.id) {
                  and[scheme.poly.key] = scheme.poly.val;
                  where_in = _.pg(_.pg.in(scheme.poly.id, pluck), 'and', _.pg.and(and));
                } else where_in =  _.pg.in('id', pluck);
                arr = [_.indexBy, scheme.f_key, _.last(ids), false];
              }

              return _.go(
                _.pg.filter(_.pg.column(_.isArray(columns) ? _.uniq(columns) : columns), table_name,
                  _.pg('where', where_in, tail && _.go(tail, _('replace', 'where', 'and')))),
                (list) => {
                  var group_or_index = arr[0](list, arr[2]);
                  return recur(start_squery._[key], _.reduce(start_results, (mem, val) =>
                      mem.concat((val._ = val._ || {})[key] = group_or_index[val[arr[1]]] || (arr[3] ? [] : {}))
                    , []));
                });
            }));
        },
        _.always(start_results)
      );
    }
  );

  _.pg.scheme.select_one = _.pg.scheme.find = _.pipe(
    _.pg.scheme.squeries_group,
    pg_s_filters[0],
    pg_s_filters[1],
    (start_squery, cols, scheme, tail, table_name, f_keys) => _.mr(start_squery,
      _.pg.filter(_.pg(cols + (cols !== '*' && f_keys.length ? ',' + f_keys.join(',') : '')), table_name,
        tail && _.go(tail, _('replace', /limit [0-9]+|limit null/, ''), tail => tail + ' limit 1'))),
    pg_s_filters[2],
    _.first
  );

  _.pg.scheme.load = (list, deep, squeries_group) => {
    var is_list = _.isArray(list);
    if (!is_list) list = [list];
    return _.go(
      squeries_group || deep,
      _.pg.scheme.squeries_group,
      pg_s_filters[0],
      pg_s_filters[1],
      _.Spread(_.idtt, _.always(_.compact(_[squeries_group ?  'deep_pluck' : 'idtt'](list, deep)))),
      pg_s_filters[2],
      _.always(list),
      is_list ? _.idtt : _.first
    );
  };

  function remove_select__(func) {
    return _.pipe(function() {
      return func.apply(knex, arguments).toString().replace('select * where ', '');
    });
  }
}(_p, knex);

var _ = _p;

_.pg.scheme.add('images', {
  table_name: 'images',
  "*": 'handbook_id, name, id, is_public, is_activate, cshop_id, created_at, updated_at',
  timestamps: ['created_at', 'updated_at'],
  virtuals: function(attrs) {
    attrs.keke = 5;
    return {};
  }
}, {
  handbook:{
    name: 'handbooks',
    type: 'belongs_to',
    f_key: 'handbook_id',
  },
  cshops: {
    name: 'cshops',
    type: 'belongs_to',
    f_key: 'cshop_id'
  },
  file: {
    name: 'files',
    '*': 'name',
    f_key: 'original_image_file_id',
    type: 'belongs_to'
  }
});

_.pg.scheme.add('colored_images', {
  table_name: 'colored_images',
  "*": 'has_bg, id, price',
  timestamps: ['created_at', 'updated_at']
}, {
  image: {
    name: 'images',
    f_key: 'image_id',
    type: 'belongs_to'
  },
  file: {
    name: 'files',
    f_key: 'id',
    '*': 'name',
    poly: {
      id: 'attached_id',
      key: 'attached_type',
      val: 'colored_images'
    },
    type: 'belongs_to'
  }
});


_.pg.scheme.add('files', {
  table_name: 'files',
  "*": 'url, width, height',
  timestamps: ['created_at', 'updated_at']
});

_.pg.scheme.add('feeds', {
  table_name: 'feeds',
  "*": '*',
  timestamps: ['created_at', 'updated_at'],
});

_.pg.scheme.add('cshops',
  {
    table_name: 'cshops',
    "*": 'id, name, description, is_brand',
    timestamps: ['created_at', 'updated_at'],
    // tail: _.pg('where', 'is_public=', true, 'order by id desc', 'limit 10')
  },
  {
    feeds: {
      name: 'feeds',
      type: 'has_many',
      f_key: 'cshop_id',
      '*': '*',
      tail: _.pg('where', _.pg.and({
        is_public: true
      }), 'order by no')
    },
    handbooks: {
      name: 'handbooks',
      type: 'has_many',
      f_key: 'cshop_id',
      tail: _.pg('where', 'is_activated=', true, 'order by recommend_point')
    },
    partner: {
      name: 'partners',
      type: 'belongs_to',
      f_key: 'partner_id'
    }
  });

_.pg.scheme.add('partners',
  {
    table_name: 'partners',
    "*": 'id, email',
    timestamps: ['created_at', 'updated_at']
  });

_.pg.scheme.add('handbook', {
  table_name: 'handbooks',
  "*": '*',
  timestamps: ['created_at', 'updated_at'],
}, {
  cshop: {
    name: 'cshops',
    type: 'belongs_to',
    f_key: 'cshop_id',
    "*": '*'
  },
  base_product: {
    name: 'base_products',
    type: 'belongs_to',
    f_key: 'base_product_id',
    "*": '*',
    tail: _.pg('where', _.pg.and({
      is_activated: true
    }))
  },
  hs_cis: {
    name: 'hs_cis',
    type: 'has_many',
    f_key: 'handbook_id',
    "*": '*',
    tail: 'order by no desc'
  },
  thumbnail: {
    name: 'files',
    type: 'belongs_to',
    f_key: 'thumbnail_file_id',
    "*": '*'
  },
  thumbnail2: {
    name: 'files',
    type: 'belongs_to',
    f_key: 'thumbnail2_file_id',
    "*": '*'
  },
  marpple_tags_tables: {
    name: 'marpple_tags_tables',
    type: 'has_many',
    f_key: 'id',
    poly: {
      id: 'attached_id',
      key: 'attached_type',
      val: 'handbooks'
    },
    '*': '*'
  }
});

_.pg.scheme.add('handbooks', {
    table_name: 'handbooks',
    "*": 'id, name, price, description, is_thumbnail',
    timestamps: ['created_at', 'updated_at'],
  },
  {
    cshop: {
      name: 'cshops',
      type: 'belongs_to',
      f_key: 'cshop_id'
    },
    base_product: {
      name: 'base_products',
      type: 'belongs_to',
      f_key: 'base_product_id'
    },
    hs_cis: {
      name: 'hs_cis',
      type: 'has_many',
      f_key: 'handbook_id'
    }
  });

_.pg.scheme.add('marpple_tags', {
  table_name: 'marpple_tags',
  '*': '*',
  timestamps: ['created_at', 'updated_at']
});

_.pg.scheme.add('marpple_tags_tables', {
  table_name: 'marpple_tags_tables',
  "*": 'id, name, price',
  timestamps: ['created_at', 'updated_at']
}, {
  marpple_tag: {
    name: 'marpple_tags',
    type: 'belongs_to',
    f_key: 'marpple_tag_id',
    '*': '*'
  }
});

_.pg.scheme.add('base_products', {
  table_name: 'base_products',
  "*": 'id, name, price',
  timestamps: ['created_at', 'updated_at']
},{
  colored_base_products: {
    name: 'colored_base_products',
    type: 'has_many',
    f_key: 'base_product_id'
  }
});

_.pg.scheme.add('colored_base_products', {
  table_name: 'colored_base_products',
  "*": 'id, color_id, color_name',
  tail: 'where color_name is not null',
  timestamps: ['created_at', 'updated_at']
});

_.pg.scheme.add('hs_cis', {
  table_name: 'hs_cis',
  "*": 'id, handbook_id, colored_image_id',
  timestamps: ['created_at', 'updated_at'],
}, {
  colored_image: {
    name: 'colored_images2',
    f_key: 'colored_image_id',
    type: 'belongs_to',
    '*': '*'
  },
  colored_image2: {
    name: 'colored_images2',
    f_key: 'colored_image_id',
    type: 'belongs_to',
    '*': "*"
  }
});

_.pg.scheme.add('press_colors', {
  table_name: 'press_colors',
  "*": '*',
  timestamps: ['created_at', 'updated_at']
});

_.pg.scheme.add('colored_images2', {
  table_name: 'colored_images',
  "*": 'has_bg, id, price',
  timestamps: ['created_at', 'updated_at']
}, {
  image: {
    name: 'images',
    f_key: 'image_id',
    type: 'belongs_to',
    '*': '*'
  },
  file: {
    name: 'files',
    f_key: 'id',
    '*': 'name',
    poly: {
      id: 'attached_id',
      key: 'attached_type',
      val: 'colored_images'
    },
    type: 'belongs_to'
  },
  photo: {
    name: 'files',
    f_key: 'id',
    '*': '*',
    poly: {
      id: 'attached_id',
      key: 'attached_type',
      val: 'colored_images'
    },
    type: 'belongs_to'
  },
  press_color: {
    name: 'press_colors',
    type: 'belongs_to',
    f_key: 'press_color_id',
    '*': '*'
  },
  cshop: {
    name: 'cshops',
    type: 'belongs_to',
    f_key: 'cshop_id'
  }
});