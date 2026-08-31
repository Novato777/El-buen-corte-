import crypto from 'crypto';

// Cache en memoria con TTL para almacenar respuestas ya procesadas
// Clave: idempotencyKey, Valor: { statusCode, body, timestamp }
const responseCache = new Map();

// Mapa de peticiones activas en vuelo (In-Flight Mutex)
// Clave: idempotencyKey, Valor: Promise<{ statusCode, body }>
const inFlightRequests = new Map();

// Tiempo de vida de la caché: 5 minutos
const CACHE_TTL_MS = 5 * 60 * 1000;

// Limpieza periódica de claves expiradas cada 2 minutos
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of responseCache.entries()) {
    if (now - record.timestamp > CACHE_TTL_MS) {
      responseCache.delete(key);
    }
  }
}, 2 * 60 * 1000);

if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

export const _clearIdempotencyStore = () => {
  responseCache.clear();
  inFlightRequests.clear();
};

/**
 * Genera una huella SHA-256 determinista a partir de los datos de la petición
 */
export const computeRequestFingerprint = (req) => {
  const userId = req.user?.id || 'public';
  const method = req.method;
  const path = req.originalUrl || req.url;
  const bodyStr = JSON.stringify(req.body || {});
  
  return crypto
    .createHash('sha256')
    .update(`${userId}:${method}:${path}:${bodyStr}`)
    .digest('hex');
};

/**
 * Middleware de Idempotencia para Express
 * Protege cualquier endpoint POST/PATCH/PUT contra ejecuciones duplicadas
 */
export const idempotencyMiddleware = async (req, res, next) => {
  // Solo aplica para métodos de mutación
  if (!['POST', 'PATCH', 'PUT'].includes(req.method)) {
    return next();
  }

  // 1. Obtener o calcular clave de idempotencia
  const clientKey = req.headers['x-idempotency-key'] || req.body?.idempotencyKey;
  const key = clientKey ? `key_${clientKey}` : `hash_${computeRequestFingerprint(req)}`;

  // 2. Verificar si la respuesta ya fue procesada y está en caché
  if (responseCache.has(key)) {
    const cached = responseCache.get(key);
    res.set('X-Idempotency-Hit', 'true');
    return res.status(cached.statusCode).json(cached.body);
  }

  // 3. Verificar si una petición con la misma clave está actualmente en vuelo
  if (inFlightRequests.has(key)) {
    try {
      // Esperar a que la primera petición termine y devolver su resultado
      const result = await inFlightRequests.get(key);
      res.set('X-Idempotency-Inflight', 'true');
      return res.status(result.statusCode).json(result.body);
    } catch (err) {
      return res.status(500).json({ error: 'Error procesando solicitud concurrente: ' + err.message });
    }
  }

  // 4. Crear un resolver de promesa para compartir con peticiones concurrentes
  let resolveInFlight;
  let rejectInFlight;
  const inFlightPromise = new Promise((resolve, reject) => {
    resolveInFlight = resolve;
    rejectInFlight = reject;
  });
  inFlightRequests.set(key, inFlightPromise);

  // Interceptar la llamada a res.json y res.send para capturar la respuesta
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = (body) => {
    const statusCode = res.statusCode || 200;

    // Solo almacenar en caché respuestas exitosas (2xx)
    if (statusCode >= 200 && statusCode < 300) {
      responseCache.set(key, {
        statusCode,
        body,
        timestamp: Date.now()
      });
    }

    inFlightRequests.delete(key);
    resolveInFlight({ statusCode, body });

    return originalJson(body);
  };

  res.send = (body) => {
    inFlightRequests.delete(key);
    resolveInFlight({ statusCode: res.statusCode || 200, body });
    return originalSend(body);
  };

  // Manejo de errores no capturados en el flujo
  res.on('finish', () => {
    if (inFlightRequests.has(key)) {
      inFlightRequests.delete(key);
    }
  });

  res.on('error', (err) => {
    if (inFlightRequests.has(key)) {
      inFlightRequests.delete(key);
      rejectInFlight(err);
    }
  });

  next();
};

export default idempotencyMiddleware;
