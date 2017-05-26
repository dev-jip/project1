module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: 'jipdb.ctcgmkl18wuj.ap-northeast-2.rds.amazonaws.com',
      user: 'jip',
      password: '35343534',
      database: 'love_story'
    },
    pool: {
      min: 2,
      max: 4
    },
    migrations: {
      tableName: 'love_story_migrations'
    },
    debug: true
  }
  // ,
  //
  // staging: {
  //   client: 'pg',
  //   connection: {
  //     host: 'jipdb.ctcgmkl18wuj.ap-northeast-2.rds.amazonaws.com',
  //     user: 'jip',
  //     password: '35343534',
  //     database: 'iamami',
  //     charset  : 'utf8'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 15
  //   },
  //   migrations: {
  //     tableName: 'jip_migrations'
  //   },
  //   debug: false
  // },
  //
  // production: {
  //   client: 'pg',
  //   connection: {
  //     host: 'jipdb.ctcgmkl18wuj.ap-northeast-2.rds.amazonaws.com',
  //     user: 'jip',
  //     password: '35343534',
  //     database: 'iamami',
  //     charset  : 'utf8'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 15
  //   },
  //   migrations: {
  //     tableName: 'jip_migrations'
  //   },
  //   debug: false
  // }

};
