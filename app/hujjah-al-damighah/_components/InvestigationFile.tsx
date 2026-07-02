'use client';

import React from 'react';

interface Props {
  onContinue:          () => void;
  onExpand:            () => void;
  onTransferQiyamah:   () => void;
  onSaveVault:         () => void;
  savedToVault:        boolean;
}

export function InvestigationFile({
  onContinue, onExpand, onTransferQiyamah, onSaveVault, savedToVault,
}: Props) {
  return (
    <div className="investigation-file">
      <div className="inv-file-crown">
        <span className="inv-file-tag">ملف التحقيق</span>
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
          <span className="inv-coming-soon">قريباً</span>
        </button>
        <button className="inv-action inv-stub" disabled>
          توليد وثيقة
          <span className="inv-coming-soon">قريباً</span>
        </button>
      </div>
    </div>
  );
}
