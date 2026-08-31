import { useState, useEffect, useRef } from 'react'
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  SearchIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  CheckIcon,
  TrashIcon,
  RefreshIcon,
  WhatsAppIcon,
  MapPinIcon,
  ClockIcon,
  MailIcon,
  InfoIcon,
  PhoneIcon,
  GlobeIcon,
  InstagramIcon,
  FacebookIcon
} from './Icons'
import { 
  normalizeUnit, 
  isWeightUnit, 
  convertQuantity, 
  calculateStockDeduction, 
  calculateUnitPriceForSoldUnit, 
  formatStockDisplay, 
  getUnitLabel, 
  getPriceUnitLabel,
  getAllowedSellUnits
} from './utils/units'

// Helper for formatting currencies in Colombian Pesos
const formatCOP = (val) => {
  if (val === undefined || val === null || isNaN(Number(val))) return '$ 0'
  return Number(val).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function PublicTiendaVirtual() {
  const [productos, setProductos] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Store filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sortBy, setSortBy] = useState('featured') // 'featured' | 'price_asc' | 'price_desc' | 'name_asc'

  // Cart state (stored in localStorage for persistence across reloads)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('elbuencorte_public_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Modals & Drawers
  const [selectedProductDetail, setSelectedProductDetail] = useState(null)
  const [detailModalQty, setDetailModalQty] = useState(1)
  const [showCartDrawer, setShowCartDrawer] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false) // ℹ️ Modal "Sobre esta tienda"
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [orderSuccessData, setOrderSuccessData] = useState(null)

  // ✨ Fly-to-Cart Animation State
  const [flyingItems, setFlyingItems] = useState([])
  const [isCartBouncing, setIsCartBouncing] = useState(false)

  // 🤖 CortIA AI Assistant States
  const [showCortIADrawer, setShowCortIADrawer] = useState(false)
  const [cortIAMessages, setCortIAMessages] = useState([])
  const [cortIAInput, setCortIAInput] = useState('')
  const [cortIATyping, setCortIATyping] = useState(false)
  const chatBottomRef = useRef(null)

  // Checkout Form (Métodos de pago: SOLO Efectivo y Transferencia, SIN datáfono)
  const [checkoutForm, setCheckoutForm] = useState({
    cliente: '',
    telefono: '',
    direccion: '',
    metodoPago: 'Efectivo', // 'Efectivo' | 'Transferencia'
    notas: ''
  })

  // Suggested Carousel
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elbuencorte_public_cart', JSON.stringify(cart))
    } catch (e) {
      console.error('Error saving cart to storage:', e)
    }
  }, [cart])

  // Fetch public catalog and business profile
  const fetchStoreData = async () => {
    setLoading(true)
    setError('')
    try {
      const [prodRes, profileRes] = await Promise.all([
        fetch(`${API_BASE}/public/productos`),
        fetch(`${API_BASE}/public/perfil`)
      ])

      if (!prodRes.ok) throw new Error('No se pudo cargar el catálogo de productos.')
      const prodData = await prodRes.json()
      const normalizedProds = (Array.isArray(prodData) ? prodData : []).map(p => ({
        ...p,
        unidadMedida: normalizeUnit(p.unidadMedida || p.unidad_medida, p.categoria, p.nombre),
        descuento: Number(p.descuento || 0)
      }))
      setProductos(normalizedProds)

      if (profileRes.ok) {
        const profData = await profileRes.json()
        setPerfil(profData)
      }
    } catch (err) {
      console.error('Error fetching public store data:', err)
      setError(err.message || 'Error al conectar con la tienda. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStoreData()
  }, [])

  // Dynamic Business Profile values
  const storeName = perfil?.general?.nombre || 'El Buen Corte'
  const storeCommercialName = perfil?.general?.nombreComercial || storeName
  const storeLegalName = perfil?.general?.razonSocial || storeName
  const storeSlogan = perfil?.general?.eslogan || 'Cortes Selectos de Calidad Garantizada'
  const storeDescription = perfil?.general?.descripcion || 'Carnicería premium especializada en cortes finos de res, cerdo y embutidos artesanales.'
  const storeLogo = perfil?.identidad?.logo || ''
  const storeCover = perfil?.identidad?.portada || ''
  const storeBusinessType = perfil?.general?.tipoNegocio || 'Carnicería Gourmet'
  const storeYear = perfil?.general?.anoCreacion || '2024'

  // Dynamic Contact & WhatsApp Number from Business Profile
  const rawWhatsApp = perfil?.contacto?.whatsapp || perfil?.contacto?.telefonoPrincipal || perfil?.contacto?.telefonoSecundario || '+573222067870'
  let cleanWhatsApp = String(rawWhatsApp).replace(/\D/g, '')
  if (cleanWhatsApp.length === 10) {
    cleanWhatsApp = `57${cleanWhatsApp}`
  }
  const storePhoneDisplay = perfil?.contacto?.telefonoPrincipal || perfil?.contacto?.whatsapp || '+57 322 206 7870'
  const storeEmail = perfil?.contacto?.email || 'contacto@elbuencorte.com'
  const storeWebsite = perfil?.contacto?.sitioWeb || ''
  
  // Location
  const storeAddress = perfil?.ubicacion?.direccion 
    ? `${perfil.ubicacion.direccion}, ${perfil.ubicacion.ciudad || 'Bogotá'}` 
    : (perfil?.ubicacion?.ciudad ? `${perfil.ubicacion.ciudad}, Colombia` : 'Bogotá, Colombia')

  // Redes Sociales
  const storeSocialNetworks = Array.isArray(perfil?.redes) 
    ? perfil.redes 
    : (perfil?.redes && typeof perfil.redes === 'object' ? Object.values(perfil.redes) : [])

  // Schedules
  const storeSchedules = perfil?.horarios || {}

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    if (showCortIADrawer && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [cortIAMessages, showCortIADrawer, cortIATyping])

  // Generate initial welcoming CortIA message analyzing real products
  useEffect(() => {
    if (productos.length === 0) return

    const availableProds = productos.filter(p => Number(p.stock) > 0)
    
    let welcomeText = ''
    let recommended = []

    if (availableProds.length > 0) {
      recommended = availableProds.slice(0, 3)
      const prodsListText = recommended.map(p => `• **${p.nombre}** (${p.categoria || 'Corte'}): ${formatCOP(p.precioVenta)} / kg — *Stock: ${p.stock} kg disponibles*`).join('\n')

      welcomeText = `👋 ¡Hola! Soy **CortIA**, tu asistente de compras inteligente en **${storeName}**.\n\n🔥 **Hoy analicé nuestro inventario en tiempo real y te recomiendo especialmente estos cortes selectos:**\n\n${prodsListText}\n\n🛍️ *¡Échales un vistazo y agrégalos a tu pedido antes de que se agoten! ¿Buscas algún corte para asado, cocina diaria o una ocasión especial?*`
    } else {
      welcomeText = `👋 ¡Hola! Soy **CortIA**, tu asistente de compras en **${storeName}**.\n\nEn este momento estamos actualizando nuestro inventario de cortes frescos del día. ¿Deseas que te ayude a explorar nuestras categorías de res, pollo o cerdo?`
    }

    setCortIAMessages([
      {
        id: 'msg-init-1',
        sender: 'cortia',
        text: welcomeText,
        products: recommended,
        chips: [
          '🥩 ¿Cuáles son los mejores cortes?',
          '🔥 Cortes para asado o parrilla',
          '🍗 Opciones de pollo frescas',
          '💰 Cortes económicos',
          '👨‍👩‍👧‍👦 ¿Cuánto calcular para 4 personas?'
        ],
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }, [productos, storeName])

  // Process customer questions in CortIA
  const handleSendCortIAMessage = (queryText) => {
    const text = (queryText || cortIAInput).trim()
    if (!text) return

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    }

    setCortIAMessages(prev => [...prev, userMsg])
    setCortIAInput('')
    setCortIATyping(true)

    setTimeout(() => {
      const lower = text.toLowerCase()
      const inStockProds = productos.filter(p => Number(p.stock) > 0)
      let botResponseText = ''
      let matchedProds = []
      let newChips = []

      if (lower.includes('asado') || lower.includes('parrilla') || lower.includes('bbq') || lower.includes('asador')) {
        matchedProds = inStockProds.filter(p => 
          p.categoria?.toLowerCase().includes('rojas') ||
          p.nombre.toLowerCase().includes('lomo') ||
          p.nombre.toLowerCase().includes('costilla') ||
          p.nombre.toLowerCase().includes('churrasco') ||
          p.nombre.toLowerCase().includes('punta')
        )
        if (matchedProds.length === 0) matchedProds = inStockProds.slice(0, 3)
        botResponseText = `🥩 **Para un asado o parrilla espectacular:** Te recomiendo cortes con excelente terneza y marmoleado. Aquí tienes nuestras mejores opciones disponibles hoy:`
        newChips = ['🍗 Ver opciones de pollo', '💰 Cortes económicos', '👨‍👩‍👧‍👦 Calcular kilos para mi asado']
      } else if (lower.includes('pollo') || lower.includes('pechuga') || lower.includes('alas') || lower.includes('muslo')) {
        matchedProds = inStockProds.filter(p => 
          p.categoria?.toLowerCase().includes('pollo') ||
          p.nombre.toLowerCase().includes('pollo') ||
          p.nombre.toLowerCase().includes('pechuga')
        )
        botResponseText = matchedProds.length > 0 
          ? `🍗 **Opciones de Pollo Fresco:** Contamos con cortes seleccionados, limpios y listos para tu cocina:`
          : `🍗 En este momento los cortes de pollo se encuentran en reposición. Te sugiero explorar nuestros cortes de res seleccionados:`
        if (matchedProds.length === 0) matchedProds = inStockProds.slice(0, 2)
        newChips = ['🥩 Ver carnes rojas', '🔥 Cortes para asado', '💰 Cortes económicos']
      } else if (lower.includes('economico') || lower.includes('barato') || lower.includes('precio') || lower.includes('ahorro') || lower.includes('oferta')) {
        matchedProds = [...inStockProds].sort((a, b) => Number(a.precioVenta) - Number(b.precioVenta)).slice(0, 3)
        botResponseText = `💰 **Cortes con excelente relación calidad-precio:** Estos son los cortes más accesibles disponibles en nuestro inventario:`
        newChips = ['🥩 Ver cortes premium', '🍗 Ver pollo', '🔥 Cortes para asado']
      } else if (lower.includes('4 personas') || lower.includes('cuanto calcular') || lower.includes('kilos') || lower.includes('personas') || lower.includes('porcion')) {
        matchedProds = inStockProds.slice(0, 3)
        botResponseText = `⚖️ **Cálculo de porciones recomendado:**\n• **Adultos:** Se calculan entre **300g y 350g por persona**.\n• **Para 4 personas:** Te recomiendo comprar entre **1.2 kg y 1.5 kg** en total.\n\nAquí tienes cortes ideales para esta cantidad:`
        newChips = ['🔥 Cortes para asado', '🍗 Ver pechuga', '🥩 Ver lomo fino']
      } else if (lower.includes('mejor') || lower.includes('premium') || lower.includes('tierno') || lower.includes('destacado') || lower.includes('suave')) {
        matchedProds = inStockProds.filter(p => 
          p.nombre.toLowerCase().includes('lomo') ||
          p.nombre.toLowerCase().includes('fino') ||
          p.nombre.toLowerCase().includes('premium') ||
          p.nombre.toLowerCase().includes('punta')
        )
        if (matchedProds.length === 0) matchedProds = inStockProds.slice(0, 3)
        botResponseText = `👑 **Nuestros Cortes Más Tiernos y Exclusivos:** Destacan por su suavidad, jugosidad y corte artesanal:`
        newChips = ['🔥 ¿Cómo prepararlo a la plancha?', '💰 Ver cortes económicos', '🛒 Ver mi carrito']
      } else {
        matchedProds = inStockProds.filter(p => 
          p.nombre.toLowerCase().includes(lower) || 
          (p.descripcion && p.descripcion.toLowerCase().includes(lower)) ||
          (p.categoria && p.categoria.toLowerCase().includes(lower))
        )
        if (matchedProds.length > 0) {
          botResponseText = `🔎 Encontré estos cortes en nuestro inventario relacionados con tu consulta "${text}":`
        } else {
          matchedProds = inStockProds.slice(0, 3)
          botResponseText = `Con gusto te asesoro para encontrar el mejor corte. Estos son los cortes frescos más destacados del día:`
        }
        newChips = ['🥩 ¿Cuáles son los mejores cortes?', '🔥 Cortes para asado', '🍗 Ver pollo']
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'cortia',
        text: botResponseText,
        products: matchedProds,
        chips: newChips,
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      }

      setCortIAMessages(prev => [...prev, botMsg])
      setCortIATyping(false)
    }, 600)
  }

  // Suggested products with stock > 0
  const suggestedProducts = productos.filter(p => Number(p.stock) > 0)

  // Carousel autoplay (velocidad optimizada para transiciones fluidas)
  useEffect(() => {
    if (suggestedProducts.length <= 1 || isCarouselPaused) return
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % suggestedProducts.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [suggestedProducts.length, isCarouselPaused])

  // Cart totals
  const cartTotalItems = cart.reduce((acc, item) => acc + item.cantidad, 0)
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.cantidad * item.precioVenta), 0)

  // ✨ Trigger Fly-to-Cart Animation
  const triggerFlyAnimation = (product, event) => {
    try {
      let startX = window.innerWidth / 2
      let startY = window.innerHeight / 2

      if (event && event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect()
        startX = rect.left + rect.width / 2
        startY = rect.top + rect.height / 2
      }

      const targetBtn = document.getElementById('floatingCartBtn') || document.querySelector('.floating-btn-cart')
      let targetX = window.innerWidth - 53
      let targetY = window.innerHeight - 100

      if (targetBtn) {
        const targetRect = targetBtn.getBoundingClientRect()
        targetX = targetRect.left + targetRect.width / 2
        targetY = targetRect.top + targetRect.height / 2
      }

      const flyerId = `flyer-${Date.now()}-${Math.random()}`
      const newFlyer = {
        id: flyerId,
        startX,
        startY,
        targetX,
        targetY,
        photo: product.foto || '',
        nombre: product.nombre || ''
      }

      setFlyingItems(prev => [...prev, newFlyer])

      // Pop / Bounce animation on floating cart upon landing
      setTimeout(() => {
        setIsCartBouncing(true)
        setTimeout(() => setIsCartBouncing(false), 500)
      }, 550)

      // Remove flyer element
      setTimeout(() => {
        setFlyingItems(prev => prev.filter(f => f.id !== flyerId))
      }, 700)
    } catch (err) {
      console.error('Fly to cart animation error:', err)
    }
  }

  // Add to cart with real stock validation and fly animation
  const handleAddToCart = (product, qty = 1, event = null) => {
    const realStock = Number(product.stock)
    if (realStock <= 0) {
      alert(`El corte "${product.nombre}" se encuentra agotado temporalmente.`)
      return
    }

    // Execute fly-to-cart animation
    if (event) {
      triggerFlyAnimation(product, event)
    }

    const originalPrice = Number(product.precioVenta)
    const discount = Number(product.descuento) || 0
    const effectivePrice = discount > 0 ? (originalPrice * (1 - discount / 100)) : originalPrice
    const unitMed = normalizeUnit(product.unidadMedida || 'kg')

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id)
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].cantidad
        const newQty = Math.min(realStock, currentQty + qty)
        const updated = [...prevCart]
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: newQty,
          stockMax: realStock,
          precioVenta: effectivePrice,
          precioOriginal: originalPrice,
          descuento: discount,
          unidadMedida: unitMed
        }
        return updated
      } else {
        const initialQty = Math.min(realStock, Math.max(1, qty))
        return [...prevCart, {
          id: product.id,
          nombre: product.nombre,
          precioVenta: effectivePrice,
          precioOriginal: originalPrice,
          descuento: discount,
          unidadMedida: unitMed,
          foto: product.foto || '',
          categoria: product.categoria || 'Carnes',
          cantidad: initialQty,
          stockMax: realStock
        }]
      }
    })
  }

  // Update cart quantity
  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId)
      return
    }
    
    const prodInInventory = productos.find(i => i.id === productId)
    const realStock = prodInInventory ? Number(prodInInventory.stock) : 9999

    setCart((prevCart) => prevCart.map(item => {
      if (item.id === productId) {
        const validatedQty = Math.min(realStock, newQty)
        return { ...item, cantidad: validatedQty, stockMax: realStock }
      }
      return item
    }))
  }

  // Remove from cart
  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId))
  }

  // Clear cart
  const handleClearCart = () => {
    setCart([])
  }

  // Open Checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return
    setCheckoutError('')
    setShowCartDrawer(false)
    setShowCheckoutModal(true)
  }

  // Helper para construir el enlace de WhatsApp con un mensaje estructurado y ultra-premium
  const generateWhatsAppOrderUrl = (orderData, clientData, itemsList, totalAmount) => {
    const clientName = clientData.cliente?.trim() || 'Cliente'
    const clientPhone = clientData.telefono?.trim() || ''
    const clientAddress = clientData.direccion?.trim() || 'Entrega en el local / Punto de venta'
    const paymentMethod = clientData.metodoPago || 'Efectivo'
    const notes = clientData.notas?.trim()
    const orderCode = orderData?.id ? `#${orderData.id}` : 'PENDIENTE'

    // Formatear cada producto con icono cárnico, cantidad, unidad, nombre y subtotal
    const productsFormatted = itemsList.map(item => {
      const subtotal = item.precioVenta * item.cantidad
      const uLabel = getUnitLabel(item.unidadMedida)
      const qtyStr = item.unidadMedida === 'und' ? `${item.cantidad} und` : `${item.cantidad} ${uLabel}`
      return `🥩 *${qtyStr} de ${item.nombre}*\n   └ Subtotal: *${formatCOP(subtotal)}*`
    }).join('\n\n')

    // Construcción del mensaje elegante, estructurado y con emoticones de alto impacto
    let message = `🥩✨ *¡NUEVO PEDIDO — ${storeName.toUpperCase()}!* ✨🥩\n`
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    message += `👋 *¡Hola, equipo de ${storeName}!* 👋\n`
    message += `Soy *${clientName}* y acabo de registrar mi orden a través de la tienda virtual:\n\n`
    message += `📋 *DETALLE DE CORTES SOLICITADOS:* 🥩\n`
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    message += `${productsFormatted}\n`
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    message += `💵 *RESUMEN DE PAGO & ENTREGA:* 📦\n`
    message += `💰 *Total a Pagar:* *${formatCOP(totalAmount)}*\n`
    message += `💳 *Método de Pago:* ${paymentMethod}\n`
    message += `📍 *Dirección de Entrega:* ${clientAddress}\n`
    if (clientPhone) {
      message += `📱 *Teléfono de Contacto:* ${clientPhone}\n`
    }
    message += `🆔 *Código de Orden:* *${orderCode}*\n`
    if (notes) {
      message += `📝 *Instrucciones para el Carnicero:* ${notes}\n`
    }
    message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    message += `🚚 *Quedo muy atento(a) a la confirmación de mi pedido y tiempo estimado de entrega. ¡Muchas gracias!* ✨🥩`

    return `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(message)}`
  }

  // Submit Public Order & Redirect to WhatsApp Automatically
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    if (!checkoutForm.cliente.trim()) {
      setCheckoutError('Por favor ingresa tu nombre completo.')
      return
    }
    if (!checkoutForm.telefono.trim()) {
      setCheckoutError('Por favor ingresa tu número de WhatsApp / Teléfono para coordinar el despacho.')
      return
    }
    if (cart.length === 0) {
      setCheckoutError('El carrito de compras está vacío.')
      return
    }

    const orderPayload = {
      cliente: checkoutForm.cliente.trim(),
      telefono: checkoutForm.telefono.trim(),
      direccion: checkoutForm.direccion.trim(),
      metodoPago: checkoutForm.metodoPago,
      notas: checkoutForm.notas.trim(),
      items: cart.map(item => ({
        productoId: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        unidad: item.unidadMedida || 'kg',
        precio: item.precioVenta
      }))
    }

    // Re-validate current stock
    for (const item of cart) {
      const prod = productos.find(i => i.id === item.id)
      if (!prod || Number(prod.stock) < item.cantidad) {
        setCheckoutError(`El producto "${item.nombre}" no cuenta con suficiente stock (${prod ? formatStockDisplay(prod.stock, prod.unidadMedida) : '0 disponibles'}). Por favor ajusta la cantidad en el carrito.`)
        return
      }
    }

    setCheckoutSubmitting(true)
    setCheckoutError('')

    const currentCartSnapshot = [...cart]
    const currentTotalSnapshot = cartTotalPrice

    try {
      const res = await fetch(`${API_BASE}/public/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al registrar el pedido.')
      }

      const createdOrder = await res.json()

      // Notificar al Dashboard en tiempo real (sonido + alerta)
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('el_buen_corte_channel')
          bc.postMessage({
            type: 'NUEVO_PEDIDO',
            order: createdOrder,
            cliente: checkoutForm.cliente,
            total: currentTotalSnapshot,
            id: createdOrder.id
          })
          bc.close()
        }
        localStorage.setItem('el_buen_corte_new_order_ping', JSON.stringify({
          id: createdOrder.id,
          cliente: checkoutForm.cliente,
          total: currentTotalSnapshot,
          time: Date.now()
        }))
      } catch (bcErr) {
        console.warn('BroadcastChannel error:', bcErr)
      }

      // Refresh stock from backend
      await fetchStoreData()

      // Construir URL de WhatsApp y redireccionar automáticamente
      const whatsappUrl = generateWhatsAppOrderUrl(createdOrder, checkoutForm, currentCartSnapshot, currentTotalSnapshot)
      window.open(whatsappUrl, '_blank')

      // Save order confirmation details on screen
      setOrderSuccessData({
        ...createdOrder,
        clienteInfo: { ...checkoutForm },
        itemsDetalle: currentCartSnapshot,
        total: currentTotalSnapshot,
        whatsappUrl: whatsappUrl
      })

      // Empty cart and close modal
      setCart([])
      setShowCheckoutModal(false)
    } catch (err) {
      console.error('Error al realizar checkout público:', err)
      setCheckoutError(err.message || 'Ocurrió un error al enviar tu pedido. Intenta nuevamente.')
    } finally {
      setCheckoutSubmitting(false)
    }
  }

  // Dynamic Categories from real inventory
  const categories = ['Todas', ...Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))]

  // Filtered and Sorted Products
  const filteredProducts = productos.filter(p => {
    const matchesSearch = !searchQuery.trim() ||
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.categoria && p.categoria.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory
    const matchesStock = !onlyInStock || Number(p.stock) > 0

    return matchesSearch && matchesCategory && matchesStock
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return Number(a.precioVenta) - Number(b.precioVenta)
    if (sortBy === 'price_desc') return Number(b.precioVenta) - Number(a.precioVenta)
    if (sortBy === 'name_asc') return a.nombre.localeCompare(b.nombre)
    return 0
  })

  return (
    <div className="public-store-wrapper" style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      
      {/* 🌟 ENCABEZADO PÚBLICO DE LA TIENDA VIRTUAL */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Logo & Marca Dinámica desde Perfil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {storeLogo ? (
              <img 
                src={storeLogo} 
                alt={storeName} 
                style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
              />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}>
                🥩
              </div>
            )}
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
                {storeName}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tienda Virtual Oficial
              </div>
            </div>
          </div>

          {/* Acciones de Cabecera: Carrito Integrado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 🛒 Botón de Carrito en el Header (Sincronizado) */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowCartDrawer(true)
                setShowCortIADrawer(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '800',
                boxShadow: '0 3px 10px rgba(220,38,38,0.25)'
              }}
              title="Abrir Carrito de Compras"
            >
              <ShoppingCartIcon style={{ width: 17, height: 17 }} />
              <span>Carrito</span>
              {cartTotalItems > 0 && (
                <span style={{
                  background: '#ffffff',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: '900',
                  padding: '1px 6px',
                  borderRadius: '99px'
                }}>
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 📦 CONTENIDO PRINCIPAL DE LA TIENDA */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px 20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        
        {/* Banner Hero Comercial */}
        <div 
          className="tienda-hero animate-fade-in"
          style={storeCover ? { backgroundImage: `linear-gradient(rgba(15,23,42,0.82), rgba(15,23,42,0.92)), url(${storeCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="tienda-hero-content">
            <div className="tienda-hero-badge">
              <SparklesIcon style={{ width: 14, height: 14 }} /> {storeBusinessType}
            </div>
            <h1 className="tienda-hero-title">
              {storeName} — Cortes Selectos Directos a tu Mesa
            </h1>
            <p className="tienda-hero-subtitle">
              {storeSlogan}
            </p>

            <div className="tienda-hero-features">
              <div className="tienda-hero-feature-pill">
                <span>🥩</span> 100% Carne Fresca Seleccionada
              </div>
              <div className="tienda-hero-feature-pill">
                <span>❄️</span> Cadena de Frío Garantizada
              </div>
              <div className="tienda-hero-feature-pill">
                <span>⚡</span> Despacho Rápido a Domicilio
              </div>
              <div className="tienda-hero-feature-pill" style={{ cursor: 'pointer' }} onClick={() => setShowAboutModal(true)}>
                <span>📍</span> {storeAddress}
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de Error de Carga si ocurre */}
        {error && (
          <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>⚠️ {error}</span>
            <button className="btn btn-secondary" onClick={fetchStoreData} style={{ padding: '4px 10px', fontSize: '12px' }}>
              Reintentar
            </button>
          </div>
        )}

        {/* 🥩 SECCIÓN CARRUSEL DE CORTES SUGERIDOS */}
        {suggestedProducts.length > 0 && (
          <section 
            className="suggested-carousel-section animate-fade-in"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            <div className="suggested-carousel-header">
              <div className="suggested-carousel-title">
                <StarIcon style={{ width: 20, height: 20, color: '#f59e0b', fill: '#f59e0b' }} />
                Cortes Sugeridos por el Maestro Carnicero
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  {carouselIndex + 1} de {suggestedProducts.length}
                </span>
              </div>
            </div>

            <div className="suggested-carousel-container">
              {(() => {
                const currentSuggested = suggestedProducts[carouselIndex] || suggestedProducts[0]
                if (!currentSuggested) return null
                const inCartItem = cart.find(c => c.id === currentSuggested.id)
                const isOutOfStock = Number(currentSuggested.stock) <= 0

                return (
                  <div className="suggested-slide-card">
                    <div 
                      className="suggested-slide-img-box" 
                      onClick={() => { setSelectedProductDetail(currentSuggested); setDetailModalQty(1); }}
                      style={{ cursor: 'pointer' }}
                    >
                      {currentSuggested.foto ? (
                        <img src={currentSuggested.foto} alt={currentSuggested.nombre} />
                      ) : (
                        <div className="suggested-placeholder-icon">🥩</div>
                      )}
                    </div>

                    <div className="suggested-slide-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="suggested-slide-badge">
                          <SparklesIcon style={{ width: 12, height: 12 }} /> Corte Recomendado
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                          {currentSuggested.categoria || 'Carnes'}
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '11px' }}>
                          Stock: {formatStockDisplay(currentSuggested.stock, currentSuggested.unidadMedida)}
                        </span>
                      </div>

                      <h2 
                        className="suggested-slide-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setSelectedProductDetail(currentSuggested); setDetailModalQty(1); }}
                      >
                        {currentSuggested.nombre}
                      </h2>

                      <p className="suggested-slide-desc">
                        {currentSuggested.descripcion || 'Corte seleccionado de res de primera categoría, con excelente marmóleo, textura tierna y sabor inigualable para parrilla, asados o cocina diaria.'}
                      </p>

                      <div className="suggested-slide-footer">
                        <div className="suggested-slide-price">
                          {Number(currentSuggested.descuento) > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through' }}>
                                {formatCOP(currentSuggested.precioVenta)}
                              </span>
                              <span style={{ fontSize: '24px', fontWeight: '900', color: '#fca5a5' }}>
                                {formatCOP(currentSuggested.precioVenta * (1 - currentSuggested.descuento / 100))}
                              </span>
                              <span style={{ fontSize: '12px', opacity: 0.8 }}>{getPriceUnitLabel(currentSuggested.unidadMedida)}</span>
                              <span style={{ fontSize: '10.5px', background: '#dc2626', color: '#ffffff', fontWeight: '900', padding: '2px 7px', borderRadius: '6px' }}>
                                🔥 {currentSuggested.descuento}% OFF
                              </span>
                            </div>
                          ) : (
                            <div>
                              {formatCOP(currentSuggested.precioVenta)} <span>{getPriceUnitLabel(currentSuggested.unidadMedida)}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setSelectedProductDetail(currentSuggested); setDetailModalQty(1); }}
                            style={{ padding: '9px 16px', fontSize: '13px' }}
                          >
                            Ver Detalles
                          </button>

                          {isOutOfStock ? (
                            <button type="button" className="tienda-card-btn-disabled" disabled style={{ width: 'auto', marginTop: 0, padding: '9px 16px' }}>
                              Agotado
                            </button>
                          ) : inCartItem ? (
                            <div className="tienda-card-stepper" style={{ width: 'auto', marginTop: 0, gap: '10px' }}>
                              <button 
                                type="button" 
                                className="tienda-stepper-btn"
                                onClick={() => handleUpdateCartQty(currentSuggested.id, inCartItem.cantidad - 1)}
                              >
                                -
                              </button>
                              <span className="tienda-stepper-val">{inCartItem.cantidad} {getUnitLabel(currentSuggested.unidadMedida)}</span>
                              <button 
                                type="button" 
                                className="tienda-stepper-btn"
                                disabled={inCartItem.cantidad >= Number(currentSuggested.stock)}
                                onClick={(e) => {
                                  handleUpdateCartQty(currentSuggested.id, inCartItem.cantidad + 1)
                                  triggerFlyAnimation(currentSuggested, e)
                                }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={(e) => handleAddToCart(currentSuggested, 1, e)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontSize: '13.5px' }}
                            >
                              <ShoppingCartIcon style={{ width: 16, height: 16 }} />
                              Agregar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Botones de Navegación */}
              {suggestedProducts.length > 1 && (
                <>
                  <button
                    type="button"
                    className="carousel-nav-btn carousel-prev-btn"
                    onClick={() => setCarouselIndex(prev => (prev === 0 ? suggestedProducts.length - 1 : prev - 1))}
                    aria-label="Corte anterior"
                  >
                    <ChevronLeftIcon style={{ width: 22, height: 22 }} />
                  </button>
                  <button
                    type="button"
                    className="carousel-nav-btn carousel-next-btn"
                    onClick={() => setCarouselIndex(prev => (prev + 1) % suggestedProducts.length)}
                    aria-label="Siguiente corte"
                  >
                    <ChevronRightIcon style={{ width: 22, height: 22 }} />
                  </button>
                </>
              )}
            </div>

            {/* Puntos Indicadores */}
            {suggestedProducts.length > 1 && (
              <div className="carousel-dots-container">
                {suggestedProducts.map((_, idx) => (
                  <div
                    key={idx}
                    className={`carousel-dot ${idx === carouselIndex ? 'active' : ''}`}
                    onClick={() => setCarouselIndex(idx)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 🔍 BARRA DE BÚSQUEDA, CATEGORÍAS Y ORDENAMIENTO */}
        <div className="tienda-toolbar-card animate-fade-in">
          <div className="tienda-search-row">
            <div className="tienda-search-wrapper">
              <span className="tienda-search-icon">
                <SearchIcon style={{ width: 18, height: 18 }} />
              </span>
              <input
                type="text"
                className="tienda-search-input"
                placeholder="Buscar por nombre, corte o categoría (ej. Lomo, Costilla, Pechuga)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="tienda-filters-right">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                />
                🟢 Solo Disponibles
              </label>

              <select
                className="input-control"
                style={{ width: 'auto', minWidth: '160px', fontSize: '12.5px', height: '40px', padding: '6px 34px 6px 12px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">✨ Destacados</option>
                <option value="price_asc">💵 Precio: Menor a Mayor</option>
                <option value="price_desc">💎 Precio: Mayor a Menor</option>
                <option value="name_asc">🔤 Nombre: A - Z</option>
              </select>
            </div>
          </div>

          {/* Categorías Generadas Dinámicamente desde el Inventario */}
          <div className="category-pills-row">
            {categories.map(cat => {
              const count = cat === 'Todas' 
                ? productos.length 
                : productos.filter(p => p.categoria === cat).length

              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-store-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat} <span style={{ opacity: 0.75, fontSize: '11px', marginLeft: '4px' }}>({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 🥩 CUADRÍCULA DE PRODUCTOS DEL CATÁLOGO */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Catálogo de Cortes ({filteredProducts.length} disponibles)
            </h3>
            {selectedCategory !== 'Todas' && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => setSelectedCategory('Todas')}
              >
                Mostrar Todas las Categorías
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <RefreshIcon className="animate-spin" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
              Cargando cortes frescos del inventario...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '18px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                No encontramos productos que coincidan
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto 16px' }}>
                Intenta con otros términos de búsqueda o cambia la categoría seleccionada.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setSearchQuery(''); setSelectedCategory('Todas'); setOnlyInStock(false); }}
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="tienda-products-grid">
              {filteredProducts.map(product => {
                const inCartItem = cart.find(c => c.id === product.id)
                const isOutOfStock = Number(product.stock) <= 0
                const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= Number(product.limiteMin || 5)

                return (
                  <div key={product.id} className="tienda-card">
                    {/* Imagen y Badges */}
                    <div 
                      className="tienda-card-img-wrapper"
                      onClick={() => { setSelectedProductDetail(product); setDetailModalQty(1); }}
                      title="Ver detalles del producto"
                    >
                      {product.foto ? (
                        <img src={product.foto} alt={product.nombre} loading="lazy" />
                      ) : (
                        <span style={{ fontSize: '48px' }}>🥩</span>
                      )}

                      {/* Badge de Descuento */}
                      {Number(product.descuento) > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: '#dc2626',
                          color: '#ffffff',
                          fontWeight: '900',
                          fontSize: '11px',
                          padding: '3px 7px',
                          borderRadius: '7px',
                          zIndex: 2,
                          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
                        }}>
                          🔥 {product.descuento}% OFF
                        </span>
                      )}

                      {isOutOfStock ? (
                        <span className="tienda-card-stock-tag tag-stock-out">Agotado</span>
                      ) : isLowStock ? (
                        <span className="tienda-card-stock-tag tag-stock-low">¡Pocas unidades! ({formatStockDisplay(product.stock, product.unidadMedida)})</span>
                      ) : (
                        <span className="tienda-card-stock-tag tag-stock-available">Stock: {formatStockDisplay(product.stock, product.unidadMedida)}</span>
                      )}
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <div className="tienda-card-body">
                      <span className="tienda-card-category">{product.categoria || 'Carnes'}</span>
                      <h4 
                        className="tienda-card-title"
                        onClick={() => { setSelectedProductDetail(product); setDetailModalQty(1); }}
                        title={product.nombre}
                      >
                        {product.nombre}
                      </h4>
                      <p className="tienda-card-desc">
                        {product.descripcion || 'Corte seleccionado de calidad garantizada para consumo fresco o preparaciones especiales.'}
                      </p>

                      <div className="tienda-card-price-row">
                        {Number(product.descuento) > 0 ? (
                          <div className="tienda-card-price" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '11.5px', color: '#94a3b8', textDecoration: 'line-through' }}>
                              {formatCOP(product.precioVenta)}
                            </span>
                            <span style={{ color: '#dc2626', fontWeight: '900' }}>
                              {formatCOP(product.precioVenta * (1 - product.descuento / 100))}
                            </span>
                            <span className="tienda-card-price-unit">{getPriceUnitLabel(product.unidadMedida)}</span>
                          </div>
                        ) : (
                          <div className="tienda-card-price">
                            {formatCOP(product.precioVenta)}
                            <span className="tienda-card-price-unit">{getPriceUnitLabel(product.unidadMedida)}</span>
                          </div>
                        )}
                      </div>

                      {/* Botón o Stepper de Carrito */}
                      {isOutOfStock ? (
                        <button type="button" className="tienda-card-btn-disabled" disabled>
                          Agotado
                        </button>
                      ) : inCartItem ? (
                        <div className="tienda-card-stepper">
                          <button
                            type="button"
                            className="tienda-stepper-btn"
                            onClick={() => handleUpdateCartQty(product.id, inCartItem.cantidad - 1)}
                            title="Disminuir cantidad"
                          >
                            -
                          </button>
                          <span className="tienda-stepper-val">{inCartItem.cantidad} {getUnitLabel(product.unidadMedida)} en carrito</span>
                          <button
                            type="button"
                            className="tienda-stepper-btn"
                            disabled={inCartItem.cantidad >= Number(product.stock)}
                            onClick={(e) => {
                              handleUpdateCartQty(product.id, inCartItem.cantidad + 1)
                              triggerFlyAnimation(product, e)
                            }}
                            title="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="tienda-card-btn-add"
                          onClick={(e) => handleAddToCart(product, 1, e)}
                        >
                          <ShoppingCartIcon style={{ width: 16, height: 16 }} />
                          Agregar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ================================================================= */}
      {/* ✨ OVERLAY DE ANIMACIÓN FLY-TO-CART */}
      {/* ================================================================= */}
      <div className="flying-items-container">
        {flyingItems.map(item => (
          <div
            key={item.id}
            className="flying-item"
            style={{
              '--start-x': `${item.startX}px`,
              '--start-y': `${item.startY}px`,
              '--target-x': `${item.targetX}px`,
              '--target-y': `${item.targetY}px`
            }}
          >
            {item.photo ? (
              <img src={item.photo} alt={item.nombre} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
            ) : (
              <span>🥩</span>
            )}
          </div>
        ))}
      </div>

      {/* ================================================================= */}
      {/* 🌟 BOTONES FLOTANTES CIRCULARES EN LA ESQUINA INFERIOR DERECHA */}
      {/* ORDEN: 1. CARRITO (ARRIBA)  2. CORTIA (DEBAJO) */}
      {/* ================================================================= */}
      <div className="floating-actions-dock">
        {/* 1. 🛒 Botón Carrito de Compras (ARRIBA) */}
        <button
          id="floatingCartBtn"
          type="button"
          className={`floating-circle-btn floating-btn-cart ${showCartDrawer ? 'active' : ''} ${isCartBouncing ? 'cart-bounce-pop' : ''}`}
          onClick={() => {
            setShowCartDrawer(prev => !prev)
            setShowCortIADrawer(false)
          }}
          aria-label="Ver Carrito de Compras"
          title="Abrir Carrito de Compras"
        >
          <ShoppingCartIcon style={{ width: 24, height: 24 }} />
          {cartTotalItems > 0 && (
            <span className="floating-cart-badge">{cartTotalItems}</span>
          )}
        </button>

        {/* 2. 🤖 Botón CortIA Asistente IA (DEBAJO) */}
        <button
          type="button"
          className={`floating-circle-btn floating-btn-cortia ${showCortIADrawer ? 'active' : ''}`}
          onClick={() => {
            setShowCortIADrawer(prev => !prev)
            setShowCartDrawer(false)
          }}
          aria-label="Abrir asistente de IA CortIA"
          title="Hablar con CortIA, tu asistente experto de carnes"
        >
          <span className="cortia-avatar-icon">🤖</span>
          <span className="cortia-pulse-dot" />
        </button>
      </div>

      {/* ================================================================= */}
      {/* 🤖 DRAWER SLIDE-OVER: CORTIA — ASISTENTE DE COMPRAS IA */}
      {/* ================================================================= */}
      <div 
        className={`cart-drawer-overlay ${showCortIADrawer ? 'active' : ''}`}
        onClick={() => setShowCortIADrawer(false)}
      />

      <aside className={`cortia-drawer ${showCortIADrawer ? 'open' : ''}`}>
        <div className="cortia-drawer-header">
          <div className="cortia-header-brand">
            <div className="cortia-header-avatar">
              🤖
            </div>
            <div>
              <div className="cortia-header-title">CortIA</div>
              <div className="cortia-header-status">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                Asistente IA • Especialista en Carnes
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-icon-only" 
            onClick={() => setShowCortIADrawer(false)}
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)' }}
          >
            ✕
          </button>
        </div>

        <div className="cortia-drawer-body">
          {cortIAMessages.map((msg) => (
            <div key={msg.id}>
              {msg.sender === 'user' ? (
                <div className="cortia-msg-user-row">
                  <div className="cortia-msg-user-bubble">
                    {msg.text}
                    <div style={{ fontSize: '10px', opacity: 0.75, textAlign: 'right', marginTop: '4px' }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cortia-msg-row">
                  <div className="cortia-msg-avatar">
                    🤖
                  </div>
                  <div className="cortia-msg-bubble">
                    <div style={{ whiteSpace: 'pre-line' }}>
                      {msg.text.split('\n').map((line, lIdx) => {
                        const parts = line.split(/(\*\*.*?\*\*)/g)
                        return (
                          <div key={lIdx} style={{ marginBottom: line === '' ? '8px' : '2px' }}>
                            {parts.map((p, pIdx) => {
                              if (p.startsWith('**') && p.endsWith('**')) {
                                return <strong key={pIdx} style={{ color: '#0f172a' }}>{p.slice(2, -2)}</strong>
                              }
                              return p
                            })}
                          </div>
                        )
                      })}
                    </div>

                    {/* Tarjetas Interactivas de Productos Recomendados */}
                    {msg.products && msg.products.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        {msg.products.map(prod => {
                          const isOutOfStock = Number(prod.stock) <= 0
                          const inCart = cart.find(c => c.id === prod.id)

                          return (
                            <div key={prod.id} className="cortia-product-card">
                              <div className="cortia-product-thumb">
                                {prod.foto ? (
                                  <img src={prod.foto} alt={prod.nombre} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                                ) : (
                                  <span>🥩</span>
                                )}
                              </div>
                              <div className="cortia-product-info">
                                <div className="cortia-product-name" title={prod.nombre}>{prod.nombre}</div>
                                <div className="cortia-product-price">{formatCOP(prod.precioVenta)} <span style={{ fontSize: '11px', color: '#64748b' }}>/ kg</span></div>
                                <div className="cortia-product-stock">
                                  {isOutOfStock ? '🔴 Agotado' : `🟢 Stock: ${prod.stock} kg`}
                                </div>
                              </div>
                              <div className="cortia-product-actions">
                                <button
                                  type="button"
                                  className="cortia-btn-detail-mini"
                                  onClick={() => {
                                    setSelectedProductDetail(prod)
                                    setDetailModalQty(1)
                                  }}
                                >
                                  Ver Detalles
                                </button>
                                {!isOutOfStock && (
                                  <button
                                    type="button"
                                    className="cortia-btn-add-mini"
                                    onClick={(e) => handleAddToCart(prod, 1, e)}
                                  >
                                    <ShoppingCartIcon style={{ width: 12, height: 12 }} />
                                    {inCart ? `+1 kg (${inCart.cantidad})` : 'Agregar'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Sugerencias Rápidas / Chips */}
                    {msg.chips && msg.chips.length > 0 && (
                      <div className="cortia-chips-row">
                        {msg.chips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            className="cortia-chip-btn"
                            onClick={() => handleSendCortIAMessage(chip)}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}

                    <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', marginTop: '6px' }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {cortIATyping && (
            <div className="cortia-msg-row">
              <div className="cortia-msg-avatar">🤖</div>
              <div className="cortia-msg-bubble" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <span className="animate-spin">⚙️</span>
                <span style={{ fontSize: '12.5px' }}>CortIA está consultando los cortes frescos...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Footer del Chat */}
        <form
          className="cortia-drawer-footer"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendCortIAMessage()
          }}
        >
          <input
            type="text"
            className="cortia-input-control"
            placeholder="Pregúntale algo a CortIA (ej. ¿Qué corte me sirve para asado?)..."
            value={cortIAInput}
            onChange={(e) => setCortIAInput(e.target.value)}
          />
          <button
            type="submit"
            className="cortia-btn-send"
            disabled={!cortIAInput.trim() || cortIATyping}
          >
            ➤ Enviar
          </button>
        </form>
      </aside>

      {/* ================================================================= */}
      {/* ℹ️ MODAL: "SOBRE ESTA TIENDA" (CARGA DINÁMICA DESDE PERFIL) */}
      {/* ================================================================= */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InfoIcon style={{ width: 20, height: 20, color: '#dc2626' }} />
                Sobre {storeName}
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-icon-only" 
                onClick={() => setShowAboutModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {/* Portada y Logo */}
              <div 
                className="about-store-cover"
                style={storeCover ? { backgroundImage: `url(${storeCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              />
              
              <div className="about-store-logo-wrapper">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="about-store-logo" />
                ) : (
                  <div className="about-store-logo">🥩</div>
                )}
              </div>

              {/* Título y Datos Generales */}
              <div style={{ padding: '0 4px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>
                  {storeName}
                </h2>
                {storeCommercialName && storeCommercialName !== storeName && (
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    {storeCommercialName} {storeLegalName && `(${storeLegalName})`}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span className="badge badge-secondary">{storeBusinessType}</span>
                  {storeYear && <span className="badge badge-pending">Fundada en {storeYear}</span>}
                  <span className="badge badge-success">✓ Certificado de Calidad</span>
                </div>

                {/* Slogan y Descripción */}
                <div style={{ background: '#f8fafc', borderLeft: '4px solid #dc2626', padding: '12px 16px', borderRadius: '0 12px 12px 0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>
                    "{storeSlogan}"
                  </div>
                  <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                    {storeDescription}
                  </p>
                </div>

                {/* Grid de Información: Ubicación, Contacto, Redes, Horarios */}
                <div className="about-store-grid">
                  {/* Ubicación */}
                  <div className="about-store-box">
                    <div className="about-store-box-title">
                      <MapPinIcon style={{ width: 16, height: 16, color: '#dc2626' }} />
                      Ubicación Principal
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                      {storeAddress}
                    </div>
                    {perfil?.ubicacion?.codigoPostal && (
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>C.P. {perfil.ubicacion.codigoPostal}</div>
                    )}
                  </div>

                  {/* Contacto Directo */}
                  <div className="about-store-box">
                    <div className="about-store-box-title">
                      <PhoneIcon style={{ width: 16, height: 16, color: '#10b981' }} />
                      Contacto & Atención
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>Teléfono:</strong> {storePhoneDisplay}</div>
                      {storeEmail && <div><strong>Email:</strong> {storeEmail}</div>}
                    </div>
                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(`👋 ¡Hola, ${storeName}! Quisiera consultar sobre sus cortes de carne seleccionados y disponibilidad. 🥩✨`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success"
                      style={{ marginTop: '6px', padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                    >
                      <WhatsAppIcon style={{ width: 15, height: 15 }} />
                      Chatear por WhatsApp
                    </a>
                  </div>

                  {/* Horarios de Atención */}
                  {Object.keys(storeSchedules).length > 0 && (
                    <div className="about-store-box" style={{ gridColumn: '1 / -1' }}>
                      <div className="about-store-box-title">
                        <ClockIcon style={{ width: 16, height: 16, color: '#f59e0b' }} />
                        Horarios de Atención
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '4px' }}>
                        {Object.entries(storeSchedules).map(([dia, info]) => {
                          if (!info) return null
                          const isAbierto = typeof info === 'object' ? info.abierto : true
                          const apertura = typeof info === 'object' ? info.apertura : '07:00'
                          const cierre = typeof info === 'object' ? info.cierre : '19:00'

                          return (
                            <div key={dia} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 8px', fontSize: '11.5px' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>{dia}</div>
                              {isAbierto ? (
                                <div style={{ color: '#059669', fontWeight: '600' }}>{apertura} - {cierre}</div>
                              ) : (
                                <div style={{ color: '#ef4444', fontWeight: '600' }}>Cerrado</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Redes Sociales */}
                  {storeSocialNetworks.length > 0 && (
                    <div className="about-store-box" style={{ gridColumn: '1 / -1' }}>
                      <div className="about-store-box-title">
                        <GlobeIcon style={{ width: 16, height: 16, color: '#3b82f6' }} />
                        Síguenos en Redes Sociales
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {storeSocialNetworks.map((net, idx) => {
                          if (!net?.url && !net?.usuario) return null
                          return (
                            <a
                              key={idx}
                              href={net.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="about-social-btn"
                            >
                              {net.plataforma?.toLowerCase().includes('instagram') ? (
                                <InstagramIcon style={{ width: 14, height: 14, color: '#e1306c' }} />
                              ) : net.plataforma?.toLowerCase().includes('facebook') ? (
                                <FacebookIcon style={{ width: 14, height: 14, color: '#1877f2' }} />
                              ) : (
                                <span>🌐</span>
                              )}
                              <span>{net.plataforma || 'Red Social'}: {net.usuario || 'Ver perfil'}</span>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Servicios y Misión */}
                  {perfil?.adicional && (
                    <div className="about-store-box" style={{ gridColumn: '1 / -1' }}>
                      <div className="about-store-box-title">
                        <SparklesIcon style={{ width: 16, height: 16, color: '#8b5cf6' }} />
                        Nuestros Servicios & Compromiso
                      </div>
                      {perfil.adicional.mision && (
                        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                          <strong>Misión:</strong> {perfil.adicional.mision}
                        </p>
                      )}
                      {Array.isArray(perfil.adicional.servicios) && perfil.adicional.servicios.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {perfil.adicional.servicios.map((srv, sIdx) => (
                            <span key={sIdx} className="badge badge-secondary" style={{ fontSize: '11px' }}>
                              ✓ {srv}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setShowAboutModal(false)}
              >
                Cerrar y Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🛍️ MODAL: DETALLES DE PRODUCTO */}
      {/* ================================================================= */}
      {selectedProductDetail && (
        <div className="modal-overlay" onClick={() => setSelectedProductDetail(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🥩 {selectedProductDetail.nombre}
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-icon-only" 
                onClick={() => setSelectedProductDetail(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="product-detail-layout">
                <div className="product-detail-img-box">
                  {selectedProductDetail.foto ? (
                    <img src={selectedProductDetail.foto} alt={selectedProductDetail.nombre} />
                  ) : (
                    <span style={{ fontSize: '64px' }}>🥩</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-secondary">{selectedProductDetail.categoria || 'Carnes'}</span>
                    {Number(selectedProductDetail.descuento) > 0 && (
                      <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', fontWeight: '800' }}>
                        🔥 {selectedProductDetail.descuento}% Descuento
                      </span>
                    )}
                    {Number(selectedProductDetail.stock) > 0 ? (
                      <span className="badge badge-success">Disponible: {formatStockDisplay(selectedProductDetail.stock, selectedProductDetail.unidadMedida)}</span>
                    ) : (
                      <span className="badge badge-danger">Agotado</span>
                    )}
                  </div>

                  {Number(selectedProductDetail.descuento) > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through' }}>
                        {formatCOP(selectedProductDetail.precioVenta)}
                      </span>
                      <span style={{ fontSize: '26px', fontWeight: '900', color: '#dc2626' }}>
                        {formatCOP(selectedProductDetail.precioVenta * (1 - selectedProductDetail.descuento / 100))}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{getPriceUnitLabel(selectedProductDetail.unidadMedida)}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626' }}>
                      {formatCOP(selectedProductDetail.precioVenta)} <span style={{ fontSize: '13px', color: '#64748b' }}>{getPriceUnitLabel(selectedProductDetail.unidadMedida)}</span>
                    </div>
                  )}

                  <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>
                    {selectedProductDetail.descripcion || 'Corte fresco de primera calidad, preparado y almacenado bajo estrictos controles sanitarios para conservar toda su jugosidad y textura.'}
                  </p>

                  {Number(selectedProductDetail.stock) > 0 && (
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>
                        Cantidad a agregar ({getUnitLabel(selectedProductDetail.unidadMedida)}):
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="number"
                          min="1"
                          max={Number(selectedProductDetail.stock)}
                          step={normalizeUnit(selectedProductDetail.unidadMedida) === 'und' ? '1' : 'any'}
                          className="input-control"
                          value={detailModalQty}
                          onChange={(e) => setDetailModalQty(Math.max(1, Math.min(Number(selectedProductDetail.stock), Number(e.target.value))))}
                          style={{ width: '100px', fontWeight: '700' }}
                        />
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          Subtotal: <strong>{formatCOP((Number(selectedProductDetail.descuento) > 0 ? selectedProductDetail.precioVenta * (1 - selectedProductDetail.descuento / 100) : selectedProductDetail.precioVenta) * (detailModalQty || 1))}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={(e) => {
                          handleAddToCart(selectedProductDetail, Number(detailModalQty) || 1, e)
                          setSelectedProductDetail(null)
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                      >
                        <ShoppingCartIcon style={{ width: 18, height: 18 }} />
                        Agregar al Carrito ({detailModalQty || 1} {getUnitLabel(selectedProductDetail.unidadMedida)})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🛒 DRAWER SLIDE-OVER: CARRITO DE COMPRAS */}
      {/* ================================================================= */}
      <div 
        className={`cart-drawer-overlay ${showCartDrawer ? 'active' : ''}`}
        onClick={() => setShowCartDrawer(false)}
      />

      <aside className={`cart-drawer ${showCartDrawer ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingCartIcon style={{ width: 22, height: 22, color: '#dc2626' }} />
            <span>Tu Carrito de Compras</span>
            <span className="badge badge-secondary" style={{ fontSize: '12px' }}>{cartTotalItems} items</span>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-icon-only" 
            onClick={() => setShowCartDrawer(false)}
          >
            ✕
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-box">
              <div className="cart-empty-icon">🛒</div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Tu carrito está vacío</h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Explora nuestra tienda virtual y agrega los mejores cortes frescos para tu hogar o negocio.
              </p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowCartDrawer(false)}
                style={{ marginTop: '8px' }}
              >
                Explorar Cortes
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-img">
                  {item.foto ? (
                    <img src={item.foto} alt={item.nombre} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                  ) : (
                    <span>🥩</span>
                  )}
                </div>

                <div className="cart-item-details">
                  <div className="cart-item-title">{item.nombre}</div>
                  <div className="cart-item-price">
                    {formatCOP(item.precioVenta)} {getPriceUnitLabel(item.unidadMedida)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div className="tienda-card-stepper" style={{ marginTop: 0, padding: '2px 6px', width: 'auto', gap: '6px' }}>
                      <button
                        type="button"
                        className="tienda-stepper-btn"
                        style={{ width: '22px', height: '22px', fontSize: '13px' }}
                        onClick={() => handleUpdateCartQty(item.id, item.cantidad - 1)}
                      >
                        -
                      </button>
                      <span className="tienda-stepper-val" style={{ fontSize: '12px' }}>
                        {item.cantidad} {getUnitLabel(item.unidadMedida)}
                      </span>
                      <button
                        type="button"
                        className="tienda-stepper-btn"
                        style={{ width: '22px', height: '22px', fontSize: '13px' }}
                        disabled={item.cantidad >= item.stockMax}
                        onClick={(e) => {
                          handleUpdateCartQty(item.id, item.cantidad + 1)
                          triggerFlyAnimation(item, e)
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="cart-item-total">
                    {formatCOP(item.precioVenta * item.cantidad)}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon-only"
                    onClick={() => handleRemoveFromCart(item.id)}
                    style={{ width: '28px', height: '28px', color: '#ef4444', border: 'none', background: 'transparent' }}
                    title="Eliminar del carrito"
                  >
                    <TrashIcon style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>Total Kilos Solicitados:</span>
              <strong>{cartTotalItems} kg</strong>
            </div>
            <div className="cart-total-row">
              <span>Total a Pagar:</span>
              <span style={{ color: '#dc2626' }}>{formatCOP(cartTotalPrice)}</span>
            </div>

            <button
              type="button"
              className="cart-btn-checkout"
              onClick={handleOpenCheckout}
            >
              <CheckIcon style={{ width: 18, height: 18 }} />
              Realizar Pedido ({formatCOP(cartTotalPrice)})
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearCart}
              style={{ fontSize: '12px', padding: '8px', color: '#64748b' }}
            >
              Vaciar Carrito
            </button>
          </div>
        )}
      </aside>

      {/* ================================================================= */}
      {/* 💳 MODAL: REALIZAR PEDIDO (CHECKOUT - SIN DATÁFONO) */}
      {/* ================================================================= */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <form className="modal-card" style={{ maxWidth: '600px' }} onSubmit={handleCheckoutSubmit}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBagIcon style={{ width: 20, height: 20, color: '#10b981' }} />
                Confirmar y Realizar Pedido
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-icon-only" 
                onClick={() => setShowCheckoutModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {checkoutError && (
                <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
                  ⚠️ {checkoutError}
                </div>
              )}

              {/* Resumen de Compra */}
              <div className="checkout-summary-box" style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
                  Resumen de Compra ({cart.length} cortes seleccionados)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item.id} className="checkout-item-preview">
                      <span><strong>{item.cantidad} kg</strong> × {item.nombre}</span>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>{formatCOP(item.precioVenta * item.cantidad)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '16px', fontWeight: '900' }}>
                  <span>Total a Pagar:</span>
                  <span style={{ color: '#dc2626' }}>{formatCOP(cartTotalPrice)}</span>
                </div>
              </div>

              {/* Datos de Contacto y Entrega */}
              <div className="form-group">
                <label className="form-label">Tu Nombre Completo *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Ej. María Gómez / Restaurante Don Elías"
                  value={checkoutForm.cliente}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, cliente: e.target.value })}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">WhatsApp / Teléfono *</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ej. 322 206 7870"
                    value={checkoutForm.telefono}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, telefono: e.target.value })}
                    required
                  />
                </div>

                {/* Método de Pago: Solo Efectivo y Transferencia (SIN DATÁFONO) */}
                <div className="form-group">
                  <label className="form-label">Método de Pago Preferido</label>
                  <select
                    className="input-control"
                    value={checkoutForm.metodoPago}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, metodoPago: e.target.value })}
                  >
                    <option value="Efectivo">💵 Efectivo al Entregar</option>
                    <option value="Transferencia">📲 Transferencia Nequi / Daviplata</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dirección de Entrega (o escribir 'Recoger en Local') *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Ej. Carrera 15 # 45-20 / Apto 302"
                  value={checkoutForm.direccion}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, direccion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Instrucciones para el Carnicero (Opcional)</label>
                <textarea
                  className="input-control"
                  rows={2}
                  placeholder="Ej. Porcionar en filetes gruesos de 2cm, empacar por libras, etc."
                  value={checkoutForm.notas}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, notas: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowCheckoutModal(false)}
                disabled={checkoutSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={checkoutSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {checkoutSubmitting ? (
                  <>
                    <RefreshIcon className="animate-spin" style={{ width: 16, height: 16 }} />
                    Procesando Pedido...
                  </>
                ) : (
                  <>
                    <CheckIcon style={{ width: 16, height: 16 }} />
                    Confirmar Pedido ({formatCOP(cartTotalPrice)})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🎉 MODAL: CONFIRMACIÓN Y RECIBO DE PEDIDO EXITOSO */}
      {/* ================================================================= */}
      {orderSuccessData && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '540px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0 }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                ✓
              </div>
            </div>

            <div className="modal-body" style={{ paddingTop: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                ¡Pedido Confirmado con Éxito!
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '16px' }}>
                Se ha generado el resumen de tu pedido y redirigido automáticamente a WhatsApp para que el carnicero lo reciba.
              </p>

              {/* Recibo digital */}
              <div className="order-success-receipt" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Código de Pedido:</span>
                    <div style={{ fontSize: '17px', fontWeight: '900', color: '#dc2626' }}>{orderSuccessData.id}</div>
                  </div>
                  <span className="badge badge-pending">Estado: Pendiente</span>
                </div>

                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  <div><strong>Cliente:</strong> {orderSuccessData.cliente}</div>
                  <div><strong>Fecha:</strong> {orderSuccessData.fecha}</div>
                  {orderSuccessData.metodoPago && (
                    <div><strong>Método de Pago:</strong> {orderSuccessData.metodoPago}</div>
                  )}
                  {orderSuccessData.direccion && (
                    <div><strong>Dirección:</strong> {orderSuccessData.direccion}</div>
                  )}
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>
                    Detalle de Cortes:
                  </div>
                  {orderSuccessData.itemsDetalle?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                      <span>{item.cantidad} x {item.nombre}</span>
                      <strong>{formatCOP(item.precioVenta * item.cantidad)}</strong>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '16px', fontWeight: '900' }}>
                    <span>Total Liquidado:</span>
                    <span style={{ color: '#dc2626' }}>{formatCOP(orderSuccessData.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Botón para Re-enviar por WhatsApp */}
              {orderSuccessData.whatsappUrl && (
                <a
                  href={orderSuccessData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <WhatsAppIcon style={{ width: 16, height: 16 }} />
                  Abrir Chat de WhatsApp
                </a>
              )}

              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setOrderSuccessData(null)}
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🥩 PIE DE PÁGINA PROFESIONAL (ESTRUCTURADO Y MODERNO) */}
      {/* ================================================================= */}
      <footer style={{
        background: '#0a0f1d',
        color: '#94a3b8',
        padding: '50px 20px 28px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '36px',
          marginBottom: '40px'
        }}>
          {/* Bloque 1: Identidad y Misión */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {storeLogo ? (
                <img src={storeLogo} alt={storeName} style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
              ) : (
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #7f1d1d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🥩</div>
              )}
              <div>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.3px', display: 'block', lineHeight: '1.2' }}>{storeName}</span>
                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{storeBusinessType}</span>
              </div>
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#cbd5e1', margin: 0 }}>
              {storeDescription || 'Cortes selectos, madurados y empacados al vacío con los más estrictos estándares de frescura y calidad.'}
            </p>
            {storeSlogan && (
              <div style={{ fontSize: '12.5px', color: '#fca5a5', fontStyle: 'italic', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', padding: '6px 12px', borderRadius: '0 8px 8px 0' }}>
                "{storeSlogan}"
              </div>
            )}
          </div>

          {/* Bloque 2: Contacto & Atención */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#ef4444' }}>●</span> Contacto & Pedidos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPinIcon style={{ width: 15, height: 15, color: '#f87171' }} />
                </div>
                <div style={{ lineHeight: '1.4' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Ubicación</div>
                  <span style={{ color: '#e2e8f0' }}>{storeAddress}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <WhatsAppIcon style={{ width: 15, height: 15, color: '#34d399' }} />
                </div>
                <div style={{ lineHeight: '1.4' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>WhatsApp Directo</div>
                  <a 
                    href={`https://wa.me/${cleanWhatsApp}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#34d399', fontWeight: '700', textDecoration: 'none' }}
                  >
                    {storePhoneDisplay}
                  </a>
                </div>
              </div>

              {storeEmail && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MailIcon style={{ width: 15, height: 15, color: '#38bdf8' }} />
                  </div>
                  <div style={{ lineHeight: '1.4' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Email</div>
                    <a href={`mailto:${storeEmail}`} style={{ color: '#e2e8f0', textDecoration: 'none' }}>
                      {storeEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bloque 3: Horarios de Atención */}
          {Object.keys(storeSchedules).length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b' }}>●</span> Horarios de Atención
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                {Object.entries(storeSchedules).slice(0, 5).map(([dia, info]) => {
                  const isAbierto = typeof info === 'object' ? info.abierto : true
                  const apertura = typeof info === 'object' ? info.apertura : '07:00'
                  const cierre = typeof info === 'object' ? info.cierre : '19:00'
                  return (
                    <div key={dia} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span style={{ color: '#94a3b8', fontWeight: '500' }}>{dia}</span>
                      <span style={{ fontWeight: '700', color: isAbierto ? '#f8fafc' : '#ef4444', fontSize: '12.5px' }}>
                        {isAbierto ? `${apertura} - ${cierre}` : 'Cerrado'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bloque 4: Redes Sociales & Calidad */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>●</span> Calidad Garantizada
            </h4>
            
            {storeSocialNetworks.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
                {storeSocialNetworks.map((net, idx) => {
                  if (!net?.url && !net?.usuario) return null
                  return (
                    <a
                      key={idx}
                      href={net.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-btn"
                      title={`${net.plataforma}: ${net.usuario}`}
                    >
                      {net.plataforma?.toLowerCase().includes('instagram') ? (
                        <InstagramIcon style={{ width: 16, height: 16 }} />
                      ) : net.plataforma?.toLowerCase().includes('facebook') ? (
                        <FacebookIcon style={{ width: 16, height: 16 }} />
                      ) : (
                        <GlobeIcon style={{ width: 16, height: 16 }} />
                      )}
                    </a>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: '900' }}>✓</span> Cortes 100% frescos porcionados al día
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: '900' }}>✓</span> Empaque al vacío y cadena de frío
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: '900' }}>✓</span> Despachos rápidos y seguros
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Derechos y Créditos */}
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12.5px'
        }}>
          <div style={{ color: '#64748b' }}>
            © {new Date().getFullYear()} <strong style={{ color: '#cbd5e1' }}>{storeName}</strong>. Todos los derechos reservados.
          </div>
          <div>
            Desarrollado por <span className="nexo-brand" style={{ color: '#ffffff', fontWeight: '800' }}>Ne<span className="nexo-x" style={{ color: '#2563eb' }}>X</span>o</span> <span className="nexo-by" style={{ color: '#94a3b8' }}>by: Brayan Cardozo</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
