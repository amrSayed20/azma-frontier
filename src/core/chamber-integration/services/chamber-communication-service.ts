/**
 * Communication service ensuring all chamber messaging passes through integration layer.
 */

import { ChamberLoader } from '../loading/chamber-loader';

export class ChamberCommunicationService {
  constructor(private readonly loader: ChamberLoader) {}

  public async send(
    sourceChamberId: string,
    targetChamberId: string,
    operation: string,
    payload: Readonly<Record<string, unknown>>
  ): Promise<Readonly<Record<string, unknown>>> {
    const target = this.loader.getAdapter(targetChamberId);
    if (!target) {
      throw new Error(`Target chamber adapter not registered: ${targetChamberId}`);
    }

    return target.handleMessage({
      messageId: `${sourceChamberId}-${targetChamberId}-${Date.now()}`,
      sourceChamberId,
      targetChamberId,
      operation,
      timestamp: Date.now(),
      payload
    });
  }
}
