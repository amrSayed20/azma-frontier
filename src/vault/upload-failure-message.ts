/**
 * The creator-facing Arabic sentence for a refused vault upload. The
 * upload API's English `message` is for logs and API callers.
 */
export function uploadFailureMessage(failure: { readonly reason?: unknown }, fallback: string): string {
  switch (failure.reason) {
    case 'unsupported-file-type':
      return 'نوع الملف غير مدعوم. المقبول: صور PNG أو JPG أو WebP أو GIF، فيديو MP4 أو WebM أو MOV، صوت MP3 أو WAV أو M4A أو OGG، ونصوص TXT أو SRT أو VTT.';
    case 'file-too-large':
      return 'الملف أكبر من ٥٠ ميغابايت.';
    case 'unauthorized':
      return 'انتهت جلستك. سجّل الدخول من جديد.';
    default:
      return fallback;
  }
}
