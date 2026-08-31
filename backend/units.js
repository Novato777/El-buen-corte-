// ============================================================================
// 🥩 EL BUEN CORTE — MÓDULO BACKEND DE UNIDADES Y CONVERSIONES EXACTAS
// ============================================================================

export const KG_TO_LB = 2.20462262185;
export const LB_TO_KG = 0.45359237;

export function normalizeUnit(unit) {
  if (!unit) return 'kg';
  const u = String(unit).toLowerCase().trim();
  if (u === 'und' || u === 'unidad' || u === 'unidades' || u === 'u') return 'und';
  if (u === 'lb' || u === 'libra' || u === 'libras' || u === 'lbs') return 'lb';
  return 'kg';
}

export function isWeightUnit(unit) {
  const norm = normalizeUnit(unit);
  return norm === 'kg' || norm === 'lb';
}

export function convertQuantity(quantity, fromUnit, toUnit) {
  const q = Number(quantity) || 0;
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to) return q;
  if (from === 'und' || to === 'und') {
    return q;
  }

  if (from === 'kg' && to === 'lb') {
    return q * KG_TO_LB;
  }
  if (from === 'lb' && to === 'kg') {
    return q * LB_TO_KG;
  }
  return q;
}

export function calculateStockDeduction(soldQty, soldUnit, baseUnit) {
  const q = Number(soldQty) || 0;
  const sold = normalizeUnit(soldUnit);
  const base = normalizeUnit(baseUnit);

  if (sold === base) return q;
  if (sold === 'und' || base === 'und') return q;

  return convertQuantity(q, sold, base);
}

export function calculateUnitPriceForSoldUnit(product, soldUnit) {
  if (!product) return 0;
  const basePrice = Number(product.precio_venta || product.precioVenta) || 0;
  const discount = Number(product.descuento) || 0;
  const effectiveBasePrice = discount > 0 ? (basePrice * (1 - discount / 100)) : basePrice;

  const baseUnit = normalizeUnit(product.unidad_medida || product.unidadMedida || 'kg');
  const sold = normalizeUnit(soldUnit);

  if (baseUnit === sold) {
    return effectiveBasePrice;
  }

  if (baseUnit === 'kg' && sold === 'lb') {
    return effectiveBasePrice * LB_TO_KG;
  }

  if (baseUnit === 'lb' && sold === 'kg') {
    return effectiveBasePrice * KG_TO_LB;
  }

  return effectiveBasePrice;
}

export function formatStockDisplay(stockVal, unit) {
  const norm = normalizeUnit(unit);
  const num = Number(stockVal) || 0;

  if (norm === 'und') {
    return `${Math.round(num)} ${Math.round(num) === 1 ? 'unidad' : 'unidades'}`;
  }

  if (norm === 'kg') {
    const formatted = num % 1 === 0 ? num.toFixed(0) : parseFloat(num.toFixed(3)).toString();
    return `${formatted} kg`;
  }

  if (norm === 'lb') {
    const formatted = num % 1 === 0 ? num.toFixed(0) : parseFloat(num.toFixed(3)).toString();
    return `${formatted} lb`;
  }

  return `${num} ${norm}`;
}
