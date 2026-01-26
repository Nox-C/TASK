// Fix for ox library type conflict with recoverAddress function
declare module "ox/core" {
  interface RecoverAddressOptions {
    payload: any;
    signature:
      | { r: bigint; s: bigint; yParity?: number }
      | { r: bigint; s: bigint; yParity: number };
  }

  function recoverAddress(options: RecoverAddressOptions): any;
}
