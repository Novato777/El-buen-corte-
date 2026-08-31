// ============================================================================
// 🥩 EL BUEN CORTE — MÓDULO CENTRALIZADO DE UNIDADES Y CONVERSIONES EXACTAS
// ============================================================================

/**
 * Constantes de conversión oficiales:
 * 1 kg = 2.20462262185 lb
 * 1 lb = 0.45359237 kg
 */
export const KG_TO_LB = 2.20462262185
export const LB_TO_KG = 0.45359237

export const UNIT_TYPES = {
  UND: 'und',
  KG: 'kg',
  LB: 'lb'
}

/**
 * Normaliza la unidad de medida a 'und', 'kg' o 'lb'
 * @param {string} unit 
 * @returns {'und' | 'kg' | 'lb'}
 */
export function normalizeUnit(unit) {
  if (!unit) return 'kg'
  const u = String(unit).toLowerCase().trim()
  if (u === 'und' || u === 'unidad' || u === 'unidades' || u === 'u') return 'und'
  if (u === 'lb' || u === 'libra' || u === 'libras' || u === 'lbs') return 'lb'
  return 'kg'
}

/**
 * Indica si una unidad es de peso (kg o lb) o de pieza individual (und)
 * @param {string} unit 
 * @returns {boolean}
 */
export function isWeightUnit(unit) {
  const norm = normalizeUnit(unit)
  return norm === 'kg' || norm === 'lb'
}

/**
 * Convierte una cantidad entre unidades de peso (kg <-> lb).
 * Si la unidad es 'und', NO realiza conversión de peso.
 * @param {number} quantity Cantidad a convertir
 * @param {string} fromUnit Unidad de origen
 * @param {string} toUnit Unidad de destino
 * @returns {number} Cantidad convertida con alta precisión
 */
export function convertQuantity(quantity, fromUnit, toUnit) {
  const q = Number(quantity) || 0
  const from = normalizeUnit(fromUnit)
  const to = normalizeUnit(toUnit)

  if (from === to) return q
  if (from === 'und' || to === 'und') {
    // Las unidades individuales nunca se convierten a peso
    return q
  }

  if (from === 'kg' && to === 'lb') {
    return q * KG_TO_LB
  }
  if (from === 'lb' && to === 'kg') {
    return q * LB_TO_KG
  }
  return q
}

/**
 * Calcula la cantidad a descontar del stock en la unidad base del producto.
 * @param {number} soldQty Cantidad vendida
 * @param {string} soldUnit Unidad en la que se vendió
 * @param {string} baseUnit Unidad base del inventario del producto
 * @returns {number} Cantidad exacta a descontar del stock base
 */
export function calculateStockDeduction(soldQty, soldUnit, baseUnit) {
  const q = Number(soldQty) || 0
  const sold = normalizeUnit(soldUnit)
  const base = normalizeUnit(baseUnit)

  if (sold === base) return q
  if (sold === 'und' || base === 'und') return q

  return convertQuantity(q, sold, base)
}

/**
 * Calcula el precio unitario según la unidad en la que se está vendiendo.
 * Aplica descuento si el producto lo tiene configurado.
 * @param {object} product Objeto del producto { precioVenta, unidadMedida, descuento }
 * @param {string} soldUnit Unidad de venta solicitada
 * @returns {number} Precio unitario correspondiente
 */
export function calculateUnitPriceForSoldUnit(product, soldUnit) {
  if (!product) return 0
  const basePrice = Number(product.precioVenta) || 0
  const discount = Number(product.descuento) || 0
  const effectiveBasePrice = discount > 0 ? (basePrice * (1 - discount / 100)) : basePrice

  const baseUnit = normalizeUnit(product.unidadMedida || product.unidad_medida || 'kg')
  const sold = normalizeUnit(soldUnit)

  if (baseUnit === sold) {
    return effectiveBasePrice
  }

  // Producto en kg vendido en lb: 1 lb cuesta = precioKg * 0.45359237
  if (baseUnit === 'kg' && sold === 'lb') {
    return effectiveBasePrice * LB_TO_KG
  }

  // Producto en lb vendido en kg: 1 kg cuesta = precioLb * 2.20462262185
  if (baseUnit === 'lb' && sold === 'kg') {
    return effectiveBasePrice * KG_TO_LB
  }

  return effectiveBasePrice
}

/**
 * Formatea el stock para mostrar al usuario con la unidad y precisión adecuada.
 * @param {number} stockVal Cantidad de stock
 * @param {string} unit Unidad de medida
 * @returns {string} Ej. "49 unidades", "20 kg", "19.093 kg", "50 lb"
 */
export function formatStockDisplay(stockVal, unit) {
  const norm = normalizeUnit(unit)
  const num = Number(stockVal) || 0

  if (norm === 'und') {
    return `${Math.round(num)} ${Math.round(num) === 1 ? 'unidad' : 'unidades'}`
  }

  if (norm === 'kg') {
    const formatted = num % 1 === 0 ? num.toFixed(0) : parseFloat(num.toFixed(3)).toString()
    return `${formatted} kg`
  }

  if (norm === 'lb') {
    const formatted = num % 1 === 0 ? num.toFixed(0) : parseFloat(num.toFixed(3)).toString()
    return `${formatted} lb`
  }

  return `${num} ${norm}`
}

/**
 * Retorna la etiqueta corta de la unidad ('und', 'kg', 'lb')
 */
export function getUnitLabel(unit) {
  const norm = normalizeUnit(unit)
  if (norm === 'und') return 'und'
  if (norm === 'lb') return 'lb'
  return 'kg'
}

/**
 * Retorna la etiqueta de precio para encabezados ('/ und', '/ kg', '/ lb')
 */
export function getPriceUnitLabel(unit) {
  const norm = normalizeUnit(unit)
  if (norm === 'und') return '/ und'
  if (norm === 'lb') return '/ lb'
  return '/ kg'
}

/**
 * Retorna las opciones de unidad permitidas para vender un producto
 */
export function getAllowedSellUnits(unit) {
  const norm = normalizeUnit(unit)
  if (norm === 'und') return ['und']
  return ['kg', 'lb']
}
