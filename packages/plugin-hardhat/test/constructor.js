const test = require('ava');

const { ethers, upgrades } = require('hardhat');

test.before(async t => {
  t.context.WithConstructor = await ethers.getContractFactory('WithConstructor');
  const signers = await ethers.getSigners();
  t.context.user = signers[1];
});

test('new proxy - do not redeploy with same args', async t => {
  const { WithConstructor, user } = t.context;

  const proxy1 = (await upgrades.deployProxy(WithConstructor, { constructorArgs: [17] })).connect(user);
  const implementation1 = await upgrades.erc1967.getImplementationAddress(proxy1.address);
  t.is((await proxy1.value()).toNumber(), 17);

  const proxy2 = (await upgrades.deployProxy(WithConstructor, { constructorArgs: [17] })).connect(user);
  const implementation2 = await upgrades.erc1967.getImplementationAddress(proxy2.address);
  t.is((await proxy2.value()).toNumber(), 17);

  t.is(implementation1, implementation2);
});

test('new proxy - redeploy with different args', async t => {
  const { WithConstructor, user } = t.context;

  const proxy1 = (await upgrades.deployProxy(WithConstructor, { constructorArgs: [17] })).connect(user);
  const implementation1 = await upgrades.erc1967.getImplementationAddress(proxy1.address);
  t.is((await proxy1.value()).toNumber(), 17);

  const proxy2 = (await upgrades.deployProxy(WithConstructor, { constructorArgs: [42] })).connect(user);
  const implementation2 = await upgrades.erc1967.getImplementationAddress(proxy2.address);
  t.is((await proxy2.value()).toNumber(), 42);

  t.not(implementation1, implementation2);
});

test('upgrade - do not redeploy with same args', async t => {
  const { WithConstructor, user } = t.context;

  const proxy1 = (await upgrades.deployProxy(WithConstructor, { constructorArgs: [17] })).connect(user);
  const implementation1 = await upgrades.erc1967.getImplementationAddress(proxy1.address);
  t.is((await proxy1.value()).toNumber(), 17);

  const proxy2 = (await upgrades.upgradeProxy(proxy1, WithConstructor, { constructorArgs: [17] })).connect(user);
  const implementation2 = await upgrades.erc1967.getImplementationAddress(proxy2.address);
  t.is((await proxy2.value()).toNumber(), 17);

  t.is(implementation1, implementation2);
});

test('upgrade - redeploy with different args', async t => {
  const { WithConstructor, user } = t.context;

  const proxy1 = (await upgrades.deployProxy(WithConstructor, { constructorArgs: [17] })).connect(user);
  const implementation1 = await upgrades.erc1967.getImplementationAddress(proxy1.address);
  t.is((await proxy1.value()).toNumber(), 17);

  const proxy2 = (await upgrades.upgradeProxy(proxy1, WithConstructor, { constructorArgs: [42] })).connect(user);
  const implementation2 = await upgrades.erc1967.getImplementationAddress(proxy2.address);
  t.is((await proxy2.value()).toNumber(), 42);

  t.not(implementation1, implementation2);
});
