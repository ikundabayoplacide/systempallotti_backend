'use strict';

const MACHINE_IDS = {
  kors:        'bbbbbbbb-0001-4000-b000-000000000001',
  gto:         'bbbbbbbb-0001-4000-b000-000000000002',
  mo:          'bbbbbbbb-0001-4000-b000-000000000003',
  speedmaster: 'bbbbbbbb-0001-4000-b000-000000000004',
  rogneuse:    'bbbbbbbb-0001-4000-b000-000000000005',
  largeFormat: 'bbbbbbbb-0001-4000-b000-000000000006',
};

const machines = [
  { id: MACHINE_IDS.kors,        name: 'KORS',         description: 'KORS printing machine.' },
  { id: MACHINE_IDS.gto,         name: 'GTO',          description: 'GTO offset printing press.' },
  { id: MACHINE_IDS.mo,          name: 'MO',           description: 'MO small format offset press.' },
  { id: MACHINE_IDS.speedmaster, name: 'SPEEDMASTER',  description: 'Heidelberg Speedmaster press.' },
  { id: MACHINE_IDS.rogneuse,    name: 'ROGNEUSE',     description: 'Cutting/trimming machine.' },
  { id: MACHINE_IDS.largeFormat, name: 'LARGE FORMAT', description: 'Large format digital printing machine.' },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('machines', machines.map((m) => ({
      ...m,
      status: 'active',
      note: null,
      createdById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('machines', {
      id: Object.values(MACHINE_IDS),
    });
  },
};

module.exports.MACHINE_IDS = MACHINE_IDS;
