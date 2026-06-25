export interface DocumentMetadata {
  id: string;
  title: string;
  author: string;
  source: string;
  publishedDate?: string;
  category?: string;
}

export interface Document {
  metadata: DocumentMetadata;
  content: string;
}

export interface SearchResult {
  id: string;
  title: string;
  score: number;
}