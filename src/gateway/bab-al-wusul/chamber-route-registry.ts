/**
 * AZMA OS - Phase 7: Bab Al-Wusul (The Omni-Gateway & API Perimeter)
 * File: src/gateway/bab-al-wusul/chamber-route-registry.ts
 * * The Chamber Route Registry.
 * The definitive, constitutional catalog of all exposed API routes.
 * Prevents magic strings, eliminates route duplication, and completely decouples
 * routing metadata from execution logic.
 * * Enforces Constraint 5: Strict Architectural Isolation.
 */

// ==========================================
// 1. QIYAMAH (MATERIALIZATION ENGINE) ROUTES
// ==========================================

export const QiyamahRoutes = {
  SUBMIT_INTENT: 'qiyamah.intent.submit',
  GET_OPERATION_STATUS: 'qiyamah.operation.status',
  CANCEL_OPERATION: 'qiyamah.operation.cancel',
} as const;

// ==========================================
// 2. RAS AL-AMR (ASSEMBLY ENGINE) ROUTES
// ==========================================

export const RasAlAmrRoutes = {
  CREATE_CANVAS: 'ras-al-amr.canvas.create',
  GET_CANVAS: 'ras-al-amr.canvas.get',
  MUTATE_CANVAS: 'ras-al-amr.canvas.mutate',
  COMPILE_FOR_PUBLISHING: 'ras-al-amr.canvas.compile',
} as const;

// ==========================================
// 3. MAKMAN AL-GHAYAH (DISTRIBUTION) ROUTES
// ==========================================

export const MakmanAlGhayahRoutes = {
  PUBLISH_ASSET: 'makman.publication.create',
  GET_PUBLICATION: 'makman.publication.get',
  REQUEST_CONSUMPTION: 'makman.consumption.request',
  VERIFY_ENTITLEMENTS: 'makman.ledger.entitlements.verify'
} as const;

// ==========================================
// 4. THE MASTER ROUTE REGISTRY
// ==========================================

/**
 * A strict union type of all officially registered route strings.
 * Ensures TypeScript enforces valid routing paths throughout the gateway.
 */
export type ChamberRoute = 
  | typeof QiyamahRoutes[keyof typeof QiyamahRoutes]
  | typeof RasAlAmrRoutes[keyof typeof RasAlAmrRoutes]
  | typeof MakmanAlGhayahRoutes[keyof typeof MakmanAlGhayahRoutes];

export class ChamberRouteRegistry {
  /**
   * Returns an array of all officially recognized gateway routes.
   * Used during Bootstrapper validation to ensure no unregistered magic strings 
   * are accidentally wired into the Omni-Router.
   */
  public static getAllRoutes(): string[] {
    return [
      ...Object.values(QiyamahRoutes),
      ...Object.values(RasAlAmrRoutes),
      ...Object.values(MakmanAlGhayahRoutes)
    ];
  }

  /**
   * Validates if a provided route string belongs to the official constitutional registry.
   * * @param route The untrusted or dynamic route string to verify.
   * @returns Boolean indicating if the route is structurally valid.
   */
  public static isValidRoute(route: string): route is ChamberRoute {
    return this.getAllRoutes().includes(route);
  }
}