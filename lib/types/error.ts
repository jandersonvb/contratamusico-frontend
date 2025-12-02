export interface BackendErrorResponse {
  message?: string | string[]; // Pode ser uma string ou um array de strings
  error?: string; // Tipo de erro (ex: 'Bad Request', 'Conflict')
  statusCode?: number;
}