// TypeScript declarations for ox library to resolve type conflicts
declare module "ox/core" {
  export interface Secp256k1SignaturePoint {
    r: bigint;
    s: bigint;
    yParity?: number;
  }
}
