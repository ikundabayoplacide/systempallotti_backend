const User = require('../database/models/User');
const BoutiqueStockItem = require('../database/models/BoutiqueStockItem');
const BoutiqueStockEntry = require('../database/models/BoutiqueStockEntry');
const BoutiqueStockSortie = require('../database/models/BoutiqueStockSortie');
const createStockController = require('./stockFactory.controller');

module.exports = createStockController(
  BoutiqueStockItem,
  BoutiqueStockEntry,
  BoutiqueStockSortie,
  User,
  ['ADMIN', 'STOCK'],       // managers (approve/reject/notify)
  ['RECEPTIONIST']           // requesters
);
