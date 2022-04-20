const test = require('ava');

const { ethers, upgrades } = require('hardhat');

test.before(async t => {
  t.context.Greeter = await ethers.getContractFactory('Greeter');
  t.context.GreeterProxiable = await ethers.getContractFactory('GreeterProxiable');
});

// Needs registering a ProxyAdmin in the manifest but this is no longer possible through deployment.
test.skip('infer proxy kind', async t => {
  const { Greeter, GreeterProxiable } = t.context;

  const uups = await upgrades.deployProxy(GreeterProxiable, ['Hello, Hardhat!']);
  t.is(await upgrades.erc1967.getAdminAddress(uups.address), ethers.constants.AddressZero);

  const proxyAdmin = (await upgrades.admin.getInstance()).address;
  const transparent = await upgrades.deployProxy(Greeter, ['Hello, Hardhat!'], { proxyAdmin });
  t.is(await upgrades.erc1967.getAdminAddress(transparent.address), proxyAdmin);

  const beacon = await upgrades.deployBeacon(Greeter);
  const beaconProxy = await upgrades.deployBeaconProxy(beacon, Greeter, ['Hello, Hardhat!']);
  t.is(await upgrades.erc1967.getAdminAddress(beaconProxy.address), ethers.constants.AddressZero);
  t.not(await upgrades.erc1967.getBeaconAddress(beaconProxy.address), ethers.constants.AddressZero);
});
