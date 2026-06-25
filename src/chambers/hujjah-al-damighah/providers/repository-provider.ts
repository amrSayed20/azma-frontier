import { Document, SearchResult } from '../types/repository.types';

export interface RepositoryProvider {
  readonly providerId: string;
  search(query: string, limit?: number): Promise<SearchResult[]>;
  fetchDocument(id: string): Promise<Document>;
}