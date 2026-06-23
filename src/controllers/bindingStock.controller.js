const User = require('../database/models/User');
const BindingStockItem = require('../database/models/BindingStockItem');
const BindingStockEntry = require('../database/models/BindingStockEntry');
const BindingStockSortie = require('../database/models/BindingStockSortie');
const createStockController = require('./stockFactory.controller');

module.exports = createStockController(
  BindingStockItem,
  BindingStockEntry,
  BindingStockSortie,
  User,
  ['ADMIN', 'SUPERVISOR'],  // managers (binding supervisor approves)
  ['SUPERVISOR']             // requesters (binding supervisor requests too)
);
