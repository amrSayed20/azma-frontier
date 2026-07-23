import { renderSealIcon } from '../src/install-experience/seal-icon';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return renderSealIcon(32);
}
