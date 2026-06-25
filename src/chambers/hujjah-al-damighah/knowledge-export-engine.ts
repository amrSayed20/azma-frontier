/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Export Engine
 *
 * Status: V1.0
 * Sovereign Export Layer
 */

import type { KnowledgeReport } from './knowledge-report-engine';

export type ExportFormat =
  | 'json'
  | 'markdown'
  | 'text';

export interface ExportedKnowledge {
  format: ExportFormat;

  content: string;

  exportedAt: string;
}

export function exportKnowledge(
  report: KnowledgeReport,
  format: ExportFormat = 'json'
): ExportedKnowledge {
  let content = '';

  switch (format) {
    case 'markdown':
      content = `
# Knowledge Report

- ID: ${report.id}
- Success: ${report.success}
- Generated At: ${report.generatedAt}

${report.summary}
`;
      break;

    case 'text':
      content = `
Knowledge Report
ID: ${report.id}
Success: ${report.success}
Generated At: ${report.generatedAt}

${report.summary}
`;
      break;

    default:
      content = JSON.stringify(report, null, 2);
  }

  return {
    format,
    content,
    exportedAt: new Date().toISOString(),
  };
}

export function isExportSupported(
  format: ExportFormat
): boolean {
  return ['json', 'markdown', 'text'].includes(format);
}