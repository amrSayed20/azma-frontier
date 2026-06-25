/**
 * AZMA OS – Qiyamah Chamber
 * File: orbit-agent.ts
 *
 * Orbit Agent
 * Responsible for determining the next sovereign chamber
 * after Genesis completion.
 */

export type OrbitDestination =
  | 'ras-amr'
  | 'sovereign-vault-palace'
  | 'makman-al-ghayah';

export interface OrbitRoute {
  readonly destination: OrbitDestination;
  readonly createdAt: Date;
}

export class OrbitAgent {
  /**
   * Creates a new orbit route.
   */
  public createRoute(
    destination: OrbitDestination
  ): OrbitRoute {
    return {
      destination,
      createdAt: new Date(),
    };
  }

  /**
   * Determines whether the route points to Ras Al-Amr.
   */
  public isRasAlAmr(
    route: OrbitRoute
  ): boolean {
    return route.destination === 'ras-amr';
  }

  /**
   * Determines whether the route points to the Sovereign Vault Palace.
   */
  public isVault(
    route: OrbitRoute
  ): boolean {
    return route.destination === 'sovereign-vault-palace';
  }

  /**
   * Determines whether the route points to Makman Al-Ghayah.
   */
  public isMakman(
    route: OrbitRoute
  ): boolean {
    return route.destination === 'makman-al-ghayah';
  }
}