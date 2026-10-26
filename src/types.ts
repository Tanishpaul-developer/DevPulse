export type ModelId =
  | 'gemini-flash'
  | 'groq-llama'
  | 'gemini-4-argon'
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite'
  | 'groq-llama-70b';

export interface CdnDependency {
  id: string;
  name: string;
  url: string;
  type: 'script' | 'style';
  description: string;
}

export interface ArtifactCodeState {
  html: string;
  css: string;
  js: string;
  prompt?: string;
  dependencies?: (string | CdnDependency)[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface SavedSnippet {
  id: string;
  title: string;
  codeState: ArtifactCodeState;
  createdAt: number;
}

export interface ConsoleLogEntry {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
}

export interface VersionSnapshot {
  id: string;
  label: string;
  timestamp: number;
  codeState: ArtifactCodeState;
}

export interface ModelParameters {
  temperature: number;
  topP: number;
  topK: number;
}

export interface ByokConfig {
  geminiKey?: string;
  groqKey?: string;
  openRouterKey?: string;
  gemini?: string;
  groq?: string;
  openrouter?: string;
}
