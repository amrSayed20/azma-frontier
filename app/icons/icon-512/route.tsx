import { renderSealIcon } from '../../../src/install-experience/seal-icon';

export async function GET() {
  return renderSealIcon(512);
}
