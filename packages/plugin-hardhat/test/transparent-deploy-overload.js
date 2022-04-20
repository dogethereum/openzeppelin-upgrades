const test = require('ava');

const { ethers, upgrades } = require('hardhat');

test.before(async t => {
  t.context.DeployOverload = await ethers.getContractFactory('DeployOverload');
  t.context.user = await ethers.getSigner(1);
});

test('no args', async t => {
  const c = (
    await upgrades.deployProxy(t.context.DeployOverload, {
      kind: 'transparent',
      initializer: 'customInitialize',
    })
  ).connect(t.context.user);
  t.is((await c.value()).toString(), '42');
});
