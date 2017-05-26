var knexfile = require('./knexfile');
global.knex = require('knex')(knexfile['development']);