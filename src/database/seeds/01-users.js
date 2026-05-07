'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash('password123', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@printinghouse.com',
        password,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Staff Member',
        email: 'staff@printinghouse.com',
        password,
        role: 'STAFF',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Jane Doe',
        email: 'jane@printinghouse.com',
        password,
        role: 'STAFF',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
       {
        id: uuidv4(),
        name: 'super visor',
        email: 'supervisor@gmail.com',
        password,
        role: 'SUPERVISOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: {
        [require('sequelize').Op.in]: [
          'admin@printinghouse.com',
          'staff@printinghouse.com',
          'jane@printinghouse.com',
        ],
      },
    });
  },
};
