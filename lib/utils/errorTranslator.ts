// src/lib/utils/errorTranslator.ts

import { BackendErrorResponse } from "../types/error";


/**
 * Traduz e formata mensagens de erro recebidas do backend para uma linguagem amigável ao usuário.
 * @param backendError O objeto de erro vindo diretamente da resposta da API.
 * @param defaultMessage Mensagem padrão a ser usada se nenhuma tradução específica for encontrada.
 * @returns Uma string com a mensagem de erro traduzida e formatada.
 */
export const translateErrorMessage = (backendError: BackendErrorResponse | undefined, defaultMessage: string): string => {
  if (!backendError) return defaultMessage;

  // Se for uma string de mensagem
  if (typeof backendError.message === 'string') {
    switch (backendError.message) {
      case 'Email already exists': return 'O email informado já está cadastrado.';
      case 'Password does not meet requirements': return 'A senha não atende aos requisitos mínimos.';
      case 'Passwords do not match': return 'As senhas não coincidem.';
      case 'Invalid file type. Only PNG and JPEG files are allowed.': return 'Tipo de arquivo inválido. Apenas PNG e JPEG são permitidos.';
      case 'Invalid phone number format': return 'O formato do número de telefone é inválido.';
      case 'User already exists': return 'Usuário já cadastrado com este email!';
      case 'Estado not found.': return 'O estado informado não foi encontrado.'; // Exemplo de erro de estado
      case 'Cidade not found.': return 'A cidade informada não foi encontrada.'; // Exemplo de erro de cidade
      case 'Error updating profile': return 'Erro ao atualizar o perfil. Tente novamente.';
      case 'Error updating profile: property usage_img_profile should not exist': return 'Erro interno ao atualizar a imagem de perfil.'; // Exemplo para o erro específico da imagem
      case 'Invalid credentials': return 'Credenciais inválidas. Verifique seu email e senha.';
      case 'User not found': return 'Usuário não encontrado. Verifique suas informações de login.';

      // Adicione mais casos de tradução aqui para outras mensagens específicas da API
      default: return backendError.message; // Retorna a mensagem original se não houver tradução específica
    }
  }
  // Se for um array de mensagens (ex: erros de validação do class-validator)
  if (Array.isArray(backendError.message) && backendError.message.length > 0) {
    const specificErrors = backendError.message.map(msg => {
      switch (true) {
        case msg.includes('email should not be empty'): return 'O campo de email não pode ser vazio.';
        case msg.includes('email must be an email'): return 'Por favor, insira um email válido.';
        case msg.includes('senha should not be empty'): return 'O campo de senha não pode ser vazio.';
        case msg.includes('username should not be empty'): return 'O campo de nome não pode ser vazio.';
        case msg.includes('telefone should not be empty'): return 'O campo de telefone não pode ser vazio.';
        case msg.includes('Password must be at least 8 characters long'): return 'A senha deve ter pelo menos 8 caracteres.';
        case msg.includes('User already exists'): return 'Usuário já cadastrado com este email!';
        case msg.includes('Invalid credentials'): return 'Credenciais inválidas. Verifique seu email e senha.';
        case msg.includes('User not found'): return 'Usuário não encontrado. Verifique suas informações de login.';

        // ... adicione outras traduções para mensagens de validação
        default:
          return msg; // Retorna a mensagem original se não houver tradução
      }
    }).join('\n'); // Junta múltiplas mensagens com nova quebra de linha
    return specificErrors;
  }

  // Fallback para outras estruturas de erro (ex: backendError.error)
  if (backendError.error) {
    switch (backendError.error) {
      case 'Conflict': return 'Conflito de dados. Verifique as informações.';
      case 'Unauthorized': return 'Não autorizado. Faça login novamente.';
      case 'Not Found': return 'Recurso não encontrado.';
      case 'Bad Request': return 'Requisição inválida. Verifique os dados enviados.';
      case 'Internal Server Error': return 'Erro interno no servidor. Tente novamente mais tarde.';
      default: return backendError.error;
    }
  }

  return defaultMessage; // Retorna a mensagem padrão se nada se encaixar
};