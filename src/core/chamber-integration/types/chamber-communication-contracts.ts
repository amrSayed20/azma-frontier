/**
 * Communication contracts for chamber-to-core and chamber-to-chamber routing via integration layer.
 */

export interface ChamberRequest {
  readonly requestId: string;
  readonly sourceChamberId: string;
  readonly targetChamberId: string;
  readonly operation: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: number;
}

export interface ChamberResponse {
  readonly requestId: string;
  readonly success: boolean;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly error?: string;
  readonly timestamp: number;
}

export interface ChamberTransport {
  send(request: ChamberRequest): Promise<ChamberResponse>;
}
