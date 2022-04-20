import { DeployOpts, ValidationOptions, withValidationDefaults } from '@openzeppelin/upgrades-core';
import type ethers from 'ethers';

export type Options = ValidationOptions &
  DeployOpts & {
    constructorArgs?: unknown[];
  };

export function withDefaults(opts: Options = {}): Required<Options> {
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
  };
}

interface UupsOptions {
  kind: 'uups';
}

interface BeaconOptions {
  kind: 'beacon';
}

interface DeployProxyOptionsGeneric extends Options {
  initializer?: string | false;
  maxFeePerGas?: ethers.BigNumberish;
  maxPriorityFeePerGas?: ethers.BigNumberish;
  implementationGasLimit?: ethers.BigNumberish;
}

export interface UpgradeProxyOptions extends Options {
  call?: { fn: string; args?: unknown[] } | string;
  unsafeSkipStorageCheck?: boolean;
  maxFeePerGas?: ethers.BigNumberish;
  maxPriorityFeePerGas?: ethers.BigNumberish;
  implementationGasLimit?: ethers.BigNumberish;
}
