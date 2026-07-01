// Erro HTTP com status — capturado pelo middleware de erros.
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const badRequest = (msg) => new HttpError(400, msg)
export const unauthorized = (msg = 'Não autorizado') => new HttpError(401, msg)
export const notFound = (msg = 'Não encontrado') => new HttpError(404, msg)
export const conflict = (msg) => new HttpError(409, msg)
