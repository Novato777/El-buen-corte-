/**
 * Generador de Claves de Idempotencia para el Frontend
 * Garantiza que cada acción del usuario viaje con un identificador único irrepetible
 */

export const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `idemp_${crypto.randomUUID()}`;
  }
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 11);
  const perfPart = (typeof performance !== 'undefined' && typeof performance.now === 'function')
    ? Math.round(performance.now() * 100).toString(36)
    : '';
  return `idemp_${timestamp}_${randomPart}_${perfPart}`;
};

export const getIdempotencyHeaders = (customKey = null) => {
  const key = customKey || generateIdempotencyKey();
  return {
    'X-Idempotency-Key': key
  };
};

export default {
  generateIdempotencyKey,
  getIdempotencyHeaders
};
