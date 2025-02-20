export interface ProviderRequest {
  method: string;
  params: any[];
}

export interface ProviderResponse {
  result: any;
  error?: string;
} 