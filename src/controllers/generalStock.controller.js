const User = require('../database/models/User');
const GeneralStockItem = require('../database/models/GeneralStockItem');
const GeneralStockEntry = require('../database/models/GeneralStockEntry');
const GeneralStockSortie = require('../database/models/GeneralStockSortie');
const createStockController = require('./stockFactory.controller');

module.exports = createStockController(
  GeneralStockItem,
  GeneralStockEntry,
  GeneralStockSortie,
  User,
  ['ADMIN', 'STOCK'],   // managers
);
