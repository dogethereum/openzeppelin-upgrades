import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { ContractFactory, Contract, UnsignedTransaction } from 'ethers';

import { Manifest, logWarning, ProxyDeployment, BeaconProxyUnsupportedError } from '@openzeppelin/upgrades-core';

import {
  DeployProxyOptions,
  deploy,
  getProxyFactory,
  getTransparentUpgradeableProxyFactory,
  DeployTransaction,
  deployProxyImpl,
  getInitializerData,
} from './utils';

export interface DeployFunction {
  (ImplFactory: ContractFactory, args?: unknown[], opts?: DeployProxyOptions): Promise<Contract>;
  (ImplFactory: ContractFactory, opts?: DeployProxyOptions): Promise<Contract>;
}

export function makeDeployProxy(hre: HardhatRuntimeEnvironment): DeployFunction {
  return async function deployProxy(
    ImplFactory: ContractFactory,
    args: unknown[] | DeployProxyOptions = [],
    opts: DeployProxyOptions = {},
  ) {
    if (!Array.isArray(args)) {
      opts = args;
      args = [];
    }

    const { provider } = hre.network;
    const manifest = await Manifest.forNetwork(provider);

    const { impl, kind } = await deployProxyImpl(hre, ImplFactory, opts);
    // This allows us to discriminate the union type of `opts`.
    opts.kind = kind;
    const contractInterface = ImplFactory.interface;
    const data = getInitializerData(contractInterface, args, opts.initializer);

    if (opts.kind === 'uups') {
      if (await manifest.getAdmin()) {
        logWarning(`A proxy admin was previously deployed on this network`, [
          `This is not natively used with the current kind of proxy ('uups').`,
          `Changes to the admin will have no effect on this new proxy.`,
        ]);
      }
    }

    let proxyDeployment: Required<ProxyDeployment & DeployTransaction>;
    switch (opts.kind) {
      case 'beacon': {
        throw new BeaconProxyUnsupportedError();
      }

      case 'uups': {
        const ProxyFactory = await getProxyFactory(hre, ImplFactory.signer);
        proxyDeployment = Object.assign({ kind }, await deploy(ProxyFactory, impl, data));
        break;
      }

      case 'transparent': {
        const adminAddress = opts.proxyAdmin || (await ImplFactory.signer.getAddress());
        const TransparentUpgradeableProxyFactory =
          opts?.transparentProxy?.factory ?? (await getTransparentUpgradeableProxyFactory(hre, ImplFactory.signer));
        const transparentProxyTxOverrides: UnsignedTransaction = {
          gasLimit: opts?.transparentProxy?.gasLimit,
          maxFeePerGas: opts?.maxFeePerGas,
          maxPriorityFeePerGas: opts?.maxPriorityFeePerGas,
        };
        proxyDeployment = Object.assign(
          { kind },
          await deploy(TransparentUpgradeableProxyFactory, impl, adminAddress, data, transparentProxyTxOverrides),
        );
        break;
      }
    }

    await manifest.addProxy(proxyDeployment);

    const inst = ImplFactory.attach(proxyDeployment.address);
    // @ts-ignore Won't be readonly because inst was created through attach.
    inst.deployTransaction = proxyDeployment.deployTransaction;
    return inst;
  };
}
