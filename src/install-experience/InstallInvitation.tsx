'use client';

import './install-invitation.css';
import { useInstallInvitation } from './InstallInvitationProvider';

/**
 * The Empire's own authored invitation — never the browser's default
 * mini-infobar. On Chromium, accepting calls the real captured prompt.
 * On iOS Safari, there is no programmatic prompt to call (a real,
 * disclosed platform limit, not a gap in this code) — the invitation
 * teaches the manual Share -> Add to Home Screen gesture instead.
 */
export function InstallInvitation() {
  const { visible, platform, accept, dismiss } = useInstallInvitation();

  if (!visible) return null;

  return (
    <div className="install-invitation" role="dialog" aria-label="Install AZMA OS">
      <div className="install-invitation-seal" aria-hidden="true">徵</div>
      <div className="install-invitation-body">
        {platform === 'ios-safari' ? (
          <>
            <p className="install-invitation-title">Keep the Empire one tap away</p>
            <p className="install-invitation-desc">
              Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
            </p>
          </>
        ) : (
          <>
            <p className="install-invitation-title">Keep the Empire one tap away</p>
            <p className="install-invitation-desc">Install AZMA OS for instant access, next time you create.</p>
          </>
        )}
      </div>
      <div className="install-invitation-actions">
        {platform !== 'ios-safari' && (
          <button type="button" className="install-invitation-accept" onClick={() => void accept()}>
            Install
          </button>
        )}
        <button type="button" className="install-invitation-dismiss" onClick={dismiss}>
          {platform === 'ios-safari' ? 'Got it' : 'Not now'}
        </button>
      </div>
    </div>
  );
}
