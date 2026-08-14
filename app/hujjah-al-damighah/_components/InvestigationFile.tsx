'use client';

import React from 'react';

interface Props {
  onContinue:        () => void;
  onExpand:          () => void;
  onChallenge:       () => void;
  onAppeal:          () => void;
  onTransferQiyamah: () => void;
  onSaveVault:       () => void;
  savedToVault:      boolean;
}

export function InvestigationFile({
  onContinue, onExpand, onChallenge, onAppeal, onTransferQiyamah, onSaveVault, savedToVault,
}: Props) {
  return (
    <div className="investigation-file">
      <div className="inv-file-crown">
        <span className="inv-file-tag">خيارات البحث</span>
        <span className="inv-file-dot">●</span>
        <span className="inv-file-status">حي</span>
      </div>

      <div className="inv-file-actions">
        <button className="inv-action inv-continue" onClick={onContinue}>
          متابعة التحقيق
        </button>
        <button className="inv-action inv-expand" onClick={onExpand}>
          توسيع الأدلة
        </button>
        <button className="inv-action inv-challenge" onClick={onChallenge}>
          زاوية مختلفة
        </button>
        <button className="inv-action inv-appeal" onClick={onAppeal}>
          بحث معمّق
        </button>
        <button
          className={`inv-action inv-vault ${savedToVault ? 'inv-saved' : ''}`}
          onClick={onSaveVault}
          disabled={savedToVault}
        >
          {savedToVault ? '✓ محفوظ في الخزانة' : 'حفظ في الخزانة'}
        </button>
        <button className="inv-action inv-qiyamah" onClick={onTransferQiyamah}>
          انتقال إلى القيامة
        </button>
        <button className="inv-action inv-stub" disabled>
          توليد تقرير
          <span className="dormant-authority">◎</span>
        </button>
        <button className="inv-action inv-stub" disabled>
          توليد وثيقة
          <span className="dormant-authority">◎</span>
        </button>
      </div>
    </div>
  );
}
