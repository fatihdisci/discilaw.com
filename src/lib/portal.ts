export const PORTAL_BUCKET = 'portal-documents';
export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const MAX_FILE_COUNT = 10;

export const ALLOWED_FILES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
};

export const FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png,.docx';

export const submissionStatuses = {
  new: 'Yeni',
  reviewing: 'İnceleniyor',
  awaiting_documents: 'Eksik Evrak Bekleniyor',
  in_progress: 'İşleme Alındı',
  completed: 'Tamamlandı',
} as const;

export type SubmissionStatus = keyof typeof submissionStatuses;
export type ProfileRole = 'admin' | 'client';
export type Visibility = 'client' | 'internal';

export interface Profile {
  id: string;
  role: ProfileRole;
  display_name: string;
  company_name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaseRecord {
  id: string;
  client_id: string;
  title: string;
  reference_number: string | null;
  status: string;
  client_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseUpdate {
  id: string;
  case_id: string;
  title: string;
  body: string;
  published_at: string;
}

export interface Submission {
  id: string;
  client_id: string;
  case_id: string | null;
  subject: string;
  description: string | null;
  document_type: string;
  status: SubmissionStatus;
  internal_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  case_id: string | null;
  submission_id: string | null;
  owner_client_id: string;
  uploaded_by: string;
  uploader_party: 'admin' | 'client';
  visibility: Visibility;
  document_type: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export function formatDate(value: string, withTime = false) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function sanitizeFileName(name: string) {
  const pieces = name.split('.');
  const extension = pieces.length > 1 ? `.${pieces.pop()!.toLowerCase()}` : '';
  const stem = pieces.join('.')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'evrak';
  return `${stem}${extension}`;
}

export function validateFiles(files: File[]) {
  if (files.length === 0) return 'En az bir dosya seçin.';
  if (files.length > MAX_FILE_COUNT) return `En fazla ${MAX_FILE_COUNT} dosya yükleyebilirsiniz.`;

  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ALLOWED_FILES[file.type];
    if (!allowedExtensions?.includes(extension)) {
      return `${file.name}: Yalnızca PDF, JPG, JPEG, PNG ve DOCX kabul edilir.`;
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return `${file.name}: Dosya boyutu 15 MB'dan küçük olmalıdır.`;
    }
  }

  return null;
}
