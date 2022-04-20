const test = require('ava');

const { ethers, upgrades } = require('hardhat');

upgrades.silenceWarnings();

test.before(async t => {
  t.context.Portfolio = await ethers.getContractFactory('Portfolio');
  t.context.PortfolioV2 = await ethers.getContractFactory('PortfolioV2');
  t.context.PortfolioV2Bad = await ethers.getContractFactory('PortfolioV2Bad');
  t.context.user = await ethers.getSigner(2);
});

test('deployProxy', async t => {
  const { Portfolio, user } = t.context;
  const portfolio = (await upgrades.deployProxy(Portfolio, [], { kind: 'transparent' })).connect(user);
  await portfolio.enable('ETH');
});

test('upgradeProxy', async t => {
  const { Portfolio, PortfolioV2, user } = t.context;
  const portfolio = await upgrades.deployProxy(Portfolio, [], { kind: 'transparent' });
  const portfolio2 = (await upgrades.upgradeProxy(portfolio, PortfolioV2)).connect(user);
  await portfolio2.enable('ETH');
});

test('upgradeProxy with incompatible layout', async t => {
  const { Portfolio, PortfolioV2Bad } = t.context;
  const portfolio = await upgrades.deployProxy(Portfolio, [], { kind: 'transparent' });
  const error = await t.throwsAsync(() => upgrades.upgradeProxy(portfolio, PortfolioV2Bad));
  t.true(error.message.includes('Upgraded `assets` to an incompatible type'));
});
