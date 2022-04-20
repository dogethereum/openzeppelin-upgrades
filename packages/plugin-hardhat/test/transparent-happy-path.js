const test = require('ava');

const { ethers, upgrades } = require('hardhat');

test.before(async t => {
  t.context.Greeter = await ethers.getContractFactory('Greeter');
  t.context.GreeterV2 = await ethers.getContractFactory('GreeterV2');
  t.context.GreeterV3 = await ethers.getContractFactory('GreeterV3');
  t.context.user = await ethers.getSigner(2);
});

test('happy path', async t => {
  const { Greeter, GreeterV2, GreeterV3, user } = t.context;

  const greeter = await upgrades.deployProxy(Greeter, ['Hello, Hardhat!'], { kind: 'transparent' });

  const greeter2 = (await upgrades.upgradeProxy(greeter, GreeterV2)).connect(user);
  await greeter2.deployed();
  await greeter2.resetGreeting();

  const greeter3ImplAddr = await upgrades.prepareUpgrade(greeter.address, GreeterV3);
  const greeter3 = GreeterV3.attach(greeter3ImplAddr);
  const version3 = await greeter3.version();
  t.is(version3, 'V3');
});

test('happy path with specified fees', async t => {
  const { Greeter } = t.context;
  const maxFeePerGas = 42000000000;
  const maxPriorityFeePerGas = 21000000000;

  const greeter = await upgrades.deployProxy(Greeter, ['Hello, Hardhat!'], {
    kind: 'transparent',
    maxFeePerGas,
    maxPriorityFeePerGas,
  });

  t.is(greeter.deployTransaction.maxFeePerGas.toNumber(), maxFeePerGas);
  t.is(greeter.deployTransaction.maxPriorityFeePerGas.toNumber(), maxPriorityFeePerGas);
});

test('happy path with specified proxy gas limit', async t => {
  const { Greeter } = t.context;
  const gasLimit = 1700000;

  const greeter = await upgrades.deployProxy(Greeter, ['Hello, Hardhat!'], {
    kind: 'transparent',
    transparentProxy: {
      gasLimit,
    },
  });

  t.is(greeter.deployTransaction.gasLimit.toNumber(), gasLimit);
});

test.todo('happy path with specified implementation gas limit');

test('happy path with EOA proxy admin', async t => {
  const { Greeter } = t.context;
  const signers = await ethers.getSigners();
  const proxyAdmin = signers[3].address;

  const greeter = await upgrades.deployProxy(Greeter, ['Hello, Hardhat!'], {
    kind: 'transparent',
    proxyAdmin,
  });

  t.is(await upgrades.erc1967.getAdminAddress(greeter.address), proxyAdmin);
});
