const test = require('ava');

const { ethers, upgrades } = require('hardhat');

test.before(async t => {
  t.context.Adder = await ethers.getContractFactory('Adder');
  t.context.AdderV2 = await ethers.getContractFactory('AdderV2');
  t.context.user = await ethers.getSigner(2);
});

test('happy path with library', async t => {
  const { Adder, AdderV2, user } = t.context;
  const adder = await upgrades.deployProxy(Adder, { kind: 'transparent' });
  const adder2 = (await upgrades.upgradeProxy(adder, AdderV2)).connect(user);
  await adder2.add(1);
});
