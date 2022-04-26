import { DeployOpts, ValidationOptions, withValidationDefaults } from '@openzeppelin/upgrades-core';
import type ethers from 'ethers';

export type OptionsWithDefaults = ValidationOptions &
  DeployOpts & {
    constructorArgs?: unknown[];
  };
export type Options = OptionsWithDefaults & {
  maxFeePerGas?: ethers.BigNumberish;
  maxPriorityFeePerGas?: ethers.BigNumberish;
  implementationGasLimit?: ethers.BigNumberish;
};

export function withDefaults(opts: Options = {}): Required<OptionsWithDefaults> {
  return {
    constructorArgs: opts.constructorArgs ?? [],
    timeout: opts.timeout ?? 60e3,
    pollingInterval: opts.pollingInterval ?? 5e3,
    ...withValidationDefaults(opts),
  };
}

export type DeployProxyOptions = DeployProxyOptionsGeneric & AllKindOptions;

type AllKindOptions = TransparentOptions | UupsOptions | BeaconOptions | UnspecifiedKind;
type UnspecifiedKind = Record<string, never>;

interface TransparentOptions {
  kind: 'transparent';
  transparentProxy?: {
    gasLimit?: ethers.BigNumberish;
    factory?: ethers.ContractFactory;
  };
  /**
   * Address of the EOA proxy admin once deployed.
   */
  proxyAdmin?: string;
}

interface UupsOptions {
  kind: 'uups';
}

interface BeaconOptions {
  kind: 'beacon';
}

interface DeployProxyOptionsGeneric extends Options {
  initializer?: string | false;
}

export interface UpgradeProxyOptions extends Options {
  call?: { fn: string; args?: unknown[] } | string;
  unsafeSkipStorageCheck?: boolean;
}
