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
    <div className="install-invitation" role="dialog" aria-label="تثبيت الإمبراطورية">
      <div className="install-invitation-seal" aria-hidden="true">徵</div>
      <div className="install-invitation-body">
        {platform === 'ios-safari' && (
          <>
            <p className="install-invitation-title">الإمبراطورية على بُعد نقرة واحدة</p>
            <p className="install-invitation-desc">
              اضغط <strong>مشاركة ⬆</strong>، ثم <strong>إضافة إلى الشاشة الرئيسية</strong>.
            </p>
          </>
        )}
        {platform === 'chromium-manual' && (
          <>
            <p className="install-invitation-title">ثبّت الإمبراطورية كتطبيق</p>
            <p className="install-invitation-desc">
              افتح قائمة المتصفح <strong>⋮</strong>، ثم اختر <strong>تثبيت AZMA OS</strong> أو <strong>إضافة إلى الشاشة الرئيسية</strong>.
            </p>
          </>
        )}
        {platform === 'chromium' && (
          <>
            <p className="install-invitation-title">الإمبراطورية على بُعد نقرة واحدة</p>
            <p className="install-invitation-desc">ثبّت الإمبراطورية للوصول الفوري في كل مرة تبدع فيها.</p>
          </>
        )}
      </div>
      <div className="install-invitation-actions">
        {platform === 'chromium' && (
          <button type="button" className="install-invitation-accept" onClick={() => void accept()}>
            تثبيت
          </button>
        )}
        <button type="button" className="install-invitation-dismiss" onClick={dismiss}>
          {platform === 'ios-safari' || platform === 'chromium-manual' ? 'حسناً' : 'ليس الآن'}
        </button>
      </div>
    </div>
  );
}
