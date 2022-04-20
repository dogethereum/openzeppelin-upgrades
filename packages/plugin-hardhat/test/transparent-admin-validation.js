const test = require('ava');

const { ethers, upgrades } = require('hardhat');

const NEW_ADMIN = '0xeAD9C93b79Ae7C1591b1FB5323BD777E86e150d4';

test.before(async t => {
  t.context.Greeter = await ethers.getContractFactory('Greeter');
  t.context.GreeterV2 = await ethers.getContractFactory('GreeterV2');
});

// Needs registering a ProxyAdmin in the manifest but this is no longer possible through deployment.
test.skip('admin validation', async t => {
  const { Greeter, GreeterV2 } = t.context;
  const greeter = await upgrades.deployProxy(Greeter, ['Hola admin!'], { kind: 'transparent' });
  await upgrades.admin.changeProxyAdmin(greeter.address, NEW_ADMIN);
  await upgrades.upgradeProxy(greeter, GreeterV2);
  await t.throwsAsync(
    () => upgrades.upgradeProxy(greeter, GreeterV2),
    undefined,
    'Proxy admin is not the one registered in the network manifest',
  );
});
