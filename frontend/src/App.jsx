import { useState, useEffect, useRef } from 'react'
import {
  HomeIcon,
  ClipboardIcon,
  BoxIcon,
  ScaleIcon,
  DollarIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon,
  TrendingUpIcon,
  SparklesIcon,
  ShieldCheckIcon,
  StoreIcon,
  WalletIcon,
  ChartIcon,
  BoltIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  LogOutIcon,
  MailIcon,
  CrownIcon,
  SearchIcon,
  KeyIcon,
  PencilIcon,
  UsersIcon,
  RefreshIcon,
  UserCheckIcon,
  UserXIcon,
  CopyIcon,
  MenuIcon,
  CloseIcon,
  ShoppingCartIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  SlidersIcon,
  ShoppingBagIcon,
  BellIcon,
  BrandLogoSvg,
  BrandWatermark,
  EmptyState
} from './Icons'
import PublicTiendaVirtual from './PublicTiendaVirtual'
import { 
  normalizeUnit, 
  isWeightUnit, 
  convertQuantity, 
  calculateStockDeduction, 
  calculateUnitPriceForSoldUnit, 
  formatStockDisplay, 
  getUnitLabel, 
  getPriceUnitLabel,
  getAllowedSellUnits,
  KG_TO_LB,
  LB_TO_KG
} from './utils/units'
import { getIdempotencyHeaders } from './utils/idempotency'

// Helper for formatting currencies
const formatCOP = (val) => {
  return val.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const PRODUCTO_OWNER = 'NeXo by: Brayan Cardozo'
const INITIAL_INVENTARIO = []
const INITIAL_PEDIDOS = []
const INITIAL_TRANSACCIONES = []
const INITIAL_MERMAS = []

const DEFAULT_PROFILE = {
  general: {
    nombre: 'El Buen Corte',
    nombreComercial: '',
    razonSocial: 'El Buen Corte S.A.S.',
    tipoNegocio: 'Carnicería',
    tipoNegocioOtro: '',
    descripcion: 'Carnicería premium especializada en cortes finos de res, cerdo y embutidos artesanales.',
    anoCreacion: '2024',
    estado: 'Activo'
  },
  identidad: {
    logo: '',
    portada: ''
  },
  contacto: {
    telefonoPrincipal: '+57 322 206 7870',
    telefonoSecundario: '',
    whatsapp: '+57 322 206 7870',
    email: 'cardozobrayan334@gmail.com',
    sitioWeb: 'https://elbuencorte.com'
  },
  ubicacion: {
    pais: 'Colombia',
    departamento: 'Cundinamarca',
    ciudad: 'Bogotá',
    direccion: 'Calle 80 #15-20',
    codigoPostal: '110111',
    latitud: '',
    longitud: ''
  },
  redes: [
    { id: '1', plataforma: 'Facebook', usuario: 'El Buen Corte', url: 'https://facebook.com/elbuencorte' },
    { id: '2', plataforma: 'Instagram', usuario: '@elbuencorte', url: 'https://instagram.com/elbuencorte' }
  ],
  horarios: {
    'Lunes': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Martes': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Miércoles': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Jueves': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Viernes': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Sábado': { abierto: true, apertura: '08:00', cierre: '20:00' },
    'Domingo': { abierto: false, apertura: '09:00', cierre: '14:00' }
  },
  financiero: {
    moneda: 'COP',
    simbolo: '$',
    nit: '901.234.567-8',
    responsable: 'Brayan Cardozo'
  },
  adicional: {
    mision: 'Proveer los mejores cortes de carne con altos estándares de higiene y servicio excepcional.',
    vision: 'Ser la carnicería líder y de confianza preferida por los hogares y restaurantes de la región.',
    servicios: ['Venta de carnes', 'Servicio a domicilio', 'Cortes personalizados', 'Empaque al vacío']
  }
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

// 🔔 Reproductor de sonido y voz sintetizada para nuevo pedido
export const playOrderVoiceNotification = (customText = "Tienes un nuevo pedido") => {
  try {
    // 1. Sonido de campana / chime digital con Web Audio API
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass()
      if (audioCtx.state === 'suspended') {
        audioCtx.resume()
      }
      const t = audioCtx.currentTime

      const osc1 = audioCtx.createOscillator()
      const osc2 = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(523.25, t) // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, t + 0.12) // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, t + 0.24) // G5

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(783.99, t)
      osc2.frequency.exponentialRampToValueAtTime(1046.50, t + 0.24) // C6

      gainNode.gain.setValueAtTime(0.3, t)
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.7)

      osc1.connect(gainNode)
      osc2.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      osc1.start(t)
      osc2.start(t)
      osc1.stop(t + 0.7)
      osc2.stop(t + 0.7)
    }

    // 2. Voz en Español: "Tienes un nuevo pedido"
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Limpiar colas previas
      const msg = new SpeechSynthesisUtterance(customText)
      msg.lang = 'es-ES'
      msg.rate = 0.98
      msg.pitch = 1.05
      msg.volume = 1.0

      const voices = window.speechSynthesis.getVoices()
      const esVoice = voices.find(v => v.lang.startsWith('es') || v.name.toLowerCase().includes('spanish') || v.name.toLowerCase().includes('español'))
      if (esVoice) {
        msg.voice = esVoice
      }

      setTimeout(() => {
        window.speechSynthesis.speak(msg)
      }, 350)
    }
  } catch (err) {
    console.warn('No se pudo reproducir la notificación de voz:', err)
  }
}

function App() {

  // Helpers para formato numérico
  const formatNumberWithDots = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const cleanStr = String(val).replace(/\D/g, '');
    if (!cleanStr) return '';
    return cleanStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const [currentPath, setCurrentPath] = useState(
    window.location.pathname + window.location.hash + window.location.search
  )

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.hash + window.location.search)
    }
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  // 🔌 Ping automático al backend (Render) para evitar que se congele por inactividad
  // Se ejecuta cada 10 minutos (600,000 ms) solo si la app está abierta en el navegador.
  useEffect(() => {
    const pingBackend = async () => {
      try {
        // Hacemos una petición ligera, no importa si da 401 o 404, el objetivo es generar tráfico
        await fetch(`${API_BASE}/productos`, { 
          method: 'GET', 
          headers: { 'Cache-Control': 'no-cache' } 
        })
      } catch (err) {
        // Silenciamos el error para no ensuciar la consola
      }
    }
    
    // Iniciar el ping repetitivo cada 10 minutos
    const interval = setInterval(pingBackend, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const isPublicStore = 
    window.location.pathname.startsWith('/tienda') || 
    window.location.hash.startsWith('#/tienda') || 
    window.location.search.includes('view=tienda')

  if (isPublicStore) {
    return <PublicTiendaVirtual />
  }

  const parseFormattedNumber = (val) => {
    if (!val) return '';
    return Number(String(val).replace(/\D/g, ''));
  };

  const [activeTab, setActiveTab] = useState('resumen')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [inventario, setInventario] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const [mermas, setMermas] = useState([])
  const [savedSimulations, setSavedSimulations] = useState([])
  
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE)
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE)
  const [profileSubTab, setProfileSubTab] = useState('general')
  const [newPlatform, setNewPlatform] = useState('Facebook')
  const [newUsername, setNewUsername] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newServiceTag, setNewServiceTag] = useState('')

  // Sistema de Notificaciones states
  const [notificaciones, setNotificaciones] = useState([])
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [newOrderBanner, setNewOrderBanner] = useState(null)
  const notifRef = useRef(null)
  const knownOrderNotifIdsRef = useRef(new Set())
  const isInitialNotifLoadRef = useRef(true)

  // 🔔 Disparador de alerta de nuevo pedido (Sonido de campana + Voz "Tienes un nuevo pedido" + Banner flotante)
  const triggerNewOrderAlert = (orderData) => {
    playOrderVoiceNotification("Tienes un nuevo pedido")
    setNewOrderBanner(orderData || { cliente: 'Cliente de Tienda Virtual' })
    setTimeout(() => {
      setNewOrderBanner(null)
    }, 9000)
  }

  // Caja state
  const [isCajaAbierta, setIsCajaAbierta] = useState(true)

  // --- TIENDA VIRTUAL STATES ---
  const [cart, setCart] = useState([])
  const [storeSearch, setStoreSearch] = useState('')
  const [storeCategory, setStoreCategory] = useState('Todas')
  const [storeOnlyInStock, setStoreOnlyInStock] = useState(false)
  const [storeSortBy, setStoreSortBy] = useState('featured')
  const [selectedProductDetail, setSelectedProductDetail] = useState(null)
  const [detailModalQty, setDetailModalQty] = useState(1)
  const [showCartDrawer, setShowCartDrawer] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({
    cliente: '',
    telefono: '',
    direccion: '',
    metodoPago: 'Efectivo',
    notas: ''
  })
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)
  const checkoutSubmittingRef = useRef(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [orderSuccessData, setOrderSuccessData] = useState(null)

  // Modal para Cobrar & Entregar Pedido
  const [orderToCharge, setOrderToCharge] = useState(null)
  const [chargePaymentMethod, setChargePaymentMethod] = useState('Efectivo')
  const [chargeLoading, setChargeLoading] = useState(false)
  const chargeLoadingRef = useRef(false)
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)

  // Carrusel de Sugerencias
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  // Sugeridos con stock real
  const suggestedProducts = inventario.filter(i => Number(i.stock) > 0)

  useEffect(() => {
    if (suggestedProducts.length <= 1 || isCarouselPaused) return
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % suggestedProducts.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [suggestedProducts.length, isCarouselPaused])

  const cartTotalItems = cart.reduce((acc, item) => acc + item.cantidad, 0)
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.cantidad * item.precioVenta), 0)

  const handleAddToCart = (product, qty = 1) => {
    const realStock = Number(product.stock)
    if (realStock <= 0) {
      alert(`El corte "${product.nombre}" se encuentra agotado temporalmente.`)
      return
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id)
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].cantidad
        const newQty = Math.min(realStock, currentQty + qty)
        const updated = [...prevCart]
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: newQty,
          stockMax: realStock
        }
        return updated
      } else {
        const initialQty = Math.min(realStock, Math.max(1, qty))
        return [...prevCart, {
          id: product.id,
          nombre: product.nombre,
          precioVenta: Number(product.precioVenta),
          foto: product.foto || '',
          categoria: product.categoria || 'Carnes',
          cantidad: initialQty,
          stockMax: realStock
        }]
      }
    })
  }

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId)
      return
    }
    
    const prodInInventory = inventario.find(i => i.id === productId)
    const realStock = prodInInventory ? Number(prodInInventory.stock) : 9999

    setCart((prevCart) => prevCart.map(item => {
      if (item.id === productId) {
        const validatedQty = Math.min(realStock, newQty)
        return { ...item, cantidad: validatedQty, stockMax: realStock }
      }
      return item
    }))
  }

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId))
  }

  const handleOpenCheckout = () => {
    if (cart.length === 0) return
    setCheckoutForm({
      cliente: currentUser?.nombre || '',
      telefono: profileData?.contacto?.telefonoPrincipal || '',
      direccion: profileData?.ubicacion?.ciudad || '',
      metodoPago: 'Efectivo',
      notas: ''
    })
    setCheckoutError('')
    setShowCartDrawer(false)
    setShowCheckoutModal(true)
  }

  const handleCheckoutSubmit = async (e) => {
    if (e) e.preventDefault()
    if (checkoutSubmittingRef.current || checkoutSubmitting) return
    if (!checkoutForm.cliente.trim()) {
      setCheckoutError('Por favor ingresa el nombre del cliente o solicitante.')
      return
    }
    if (cart.length === 0) {
      setCheckoutError('El carrito está vacío.')
      return
    }

    // Re-validar stock real en el inventario antes de procesar
    for (const item of cart) {
      const prod = inventario.find(i => i.id === item.id)
      if (!prod || Number(prod.stock) < item.cantidad) {
        setCheckoutError(`El producto "${item.nombre}" no cuenta con suficiente stock (${prod ? prod.stock : 0} kg disponibles). Por favor ajusta la cantidad en el carrito.`)
        return
      }
    }

    checkoutSubmittingRef.current = true
    setCheckoutSubmitting(true)
    setCheckoutError('')

    const orderPayload = {
      cliente: checkoutForm.cliente.trim(),
      items: cart.map(i => ({
        productoId: i.id,
        cantidad: i.cantidad
      }))
    }

    try {
      const res = await fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify(orderPayload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al procesar el pedido')
      }

      const createdOrder = await res.json()
      
      // Sincronizar inventario y pedidos con la base de datos
      await loadData()

      setOrderSuccessData({
        ...createdOrder,
        clienteInfo: { ...checkoutForm },
        itemsDetalle: [...cart],
        total: cartTotalPrice
      })

      setCart([])
      setShowCheckoutModal(false)
    } catch (err) {
      console.error('Error al realizar checkout:', err)
      setCheckoutError(err.message || 'Ocurrió un error al enviar tu pedido. Intenta nuevamente.')
    } finally {
      checkoutSubmittingRef.current = false
      setCheckoutSubmitting(false)
    }
  }

  const storeCategories = ['Todas', ...Array.from(new Set(inventario.map(i => i.categoria).filter(Boolean)))]

  const filteredStoreProducts = inventario.filter(prod => {
    const matchesSearch = !storeSearch.trim() || 
      prod.nombre.toLowerCase().includes(storeSearch.toLowerCase()) ||
      (prod.descripcion && prod.descripcion.toLowerCase().includes(storeSearch.toLowerCase())) ||
      (prod.categoria && prod.categoria.toLowerCase().includes(storeSearch.toLowerCase()))
    
    const matchesCategory = storeCategory === 'Todas' || prod.categoria === storeCategory
    const matchesStock = !storeOnlyInStock || Number(prod.stock) > 0

    return matchesSearch && matchesCategory && matchesStock
  }).sort((a, b) => {
    if (storeSortBy === 'price_asc') return Number(a.precioVenta) - Number(b.precioVenta)
    if (storeSortBy === 'price_desc') return Number(b.precioVenta) - Number(a.precioVenta)
    if (storeSortBy === 'name_asc') return a.nombre.localeCompare(b.nombre)
    return 0
  })
  const [cajaBase, setCajaBase] = useState(0)
  const [showCierreModal, setShowCierreModal] = useState(false)
  const [cierreResult, setCierreResult] = useState(null)

  // Modals / Form toggles
  const [showAddOrderModal, setShowAddOrderModal] = useState(false)
  const [showAddMermaModal, setShowAddMermaModal] = useState(false)
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)

  // User Management state
  const [usersList, setUsersList] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Form states
  const [newOrderClient, setNewOrderClient] = useState('')
  const [newOrderItems, setNewOrderItems] = useState([{ productoId: '1', cantidad: 1 }])
  const [newMermaProduct, setNewMermaProduct] = useState('1')
  const [newMermaWeight, setNewMermaWeight] = useState(1.0)
  const [newMermaReason, setNewMermaReason] = useState('')
  const [newStockProduct, setNewStockProduct] = useState('1')
  const [newStockWeight, setNewStockWeight] = useState(10.0)
  const [newStockCost, setNewStockCost] = useState('')
  const [newStockPaymentMethod, setNewStockPaymentMethod] = useState('Efectivo')
  const [newExpenseDesc, setNewExpenseDesc] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState(0)
  const [newExpensePaymentMethod, setNewExpensePaymentMethod] = useState('Efectivo')
  const [newIncomeDesc, setNewIncomeDesc] = useState('')
  const [newIncomeAmount, setNewIncomeAmount] = useState(0)
  const [newIncomePaymentMethod, setNewIncomePaymentMethod] = useState('Efectivo')

  // POS & Venta de Mostrador States
  const [incomeMode, setIncomeMode] = useState('pos') // 'pos' | 'manual'
  const [posCategory, setPosCategory] = useState('Todas')
  const [posSelectedProdId, setPosSelectedProdId] = useState('')
  const [posQty, setPosQty] = useState(1)
  const [posUnit, setPosUnit] = useState('kg') // 'kg' | 'lb' | 'und'
  const [posCart, setPosCart] = useState([])
  const [posClientName, setPosClientName] = useState('Cliente Mostrador')
  const [posCashReceived, setPosCashReceived] = useState('')
  const [posSubmitting, setPosSubmitting] = useState(false)
  const posSubmittingRef = useRef(false)
  const [posSelectedOrder, setPosSelectedOrder] = useState(null)

  // Candados síncronos y estados de envío (Anti Double-Submit)
  const [addIncomeSubmitting, setAddIncomeSubmitting] = useState(false)
  const addIncomeSubmittingRef = useRef(false)
  const [addExpenseSubmitting, setAddExpenseSubmitting] = useState(false)
  const addExpenseSubmittingRef = useRef(false)
  const [addProductSubmitting, setAddProductSubmitting] = useState(false)
  const addProductSubmittingRef = useRef(false)
  const [addStockSubmitting, setAddStockSubmitting] = useState(false)
  const addStockSubmittingRef = useRef(false)
  const [addMermaSubmitting, setAddMermaSubmitting] = useState(false)
  const addMermaSubmittingRef = useRef(false)
  const [createOrderSubmitting, setCreateOrderSubmitting] = useState(false)
  const createOrderSubmittingRef = useRef(false)
  const [saveSimSubmitting, setSaveSimSubmitting] = useState(false)
  const saveSimSubmittingRef = useRef(false)
  const [saveProfileSubmitting, setSaveProfileSubmitting] = useState(false)
  const saveProfileSubmittingRef = useRef(false)
  const discountLoadingRef = useRef(false)

  // Descuentos en productos
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discountProduct, setDiscountProduct] = useState(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountLoading, setDiscountLoading] = useState(false)

  // New product form states
  const [newProdName, setNewProdName] = useState('')
  const [newProdCategory, setNewProdCategory] = useState('Carnes Rojas')
  const [newProdDesc, setNewProdDesc] = useState('')
  const [newProdFoto, setNewProdFoto] = useState('')
  const [newProdPrice, setNewProdPrice] = useState(0)
  const [newProdStock, setNewProdStock] = useState(0)
  const [newProdLimitMin, setNewProdLimitMin] = useState(10)
  const [newProdUnit, setNewProdUnit] = useState('kg') // 'und' | 'kg' | 'lb'
  const [uploadingProdFoto, setUploadingProdFoto] = useState(false)

  const handleProductFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert("❌ Formato no permitido. Solo se permiten imágenes PNG, JPG, JPEG o WEBP.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Tamaño de archivo superior a 5MB. Por favor sube una imagen más ligera.")
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      setNewProdFoto(base64)
      setUploadingProdFoto(true)

      try {
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ image: base64, folder: 'el_buen_corte/productos' })
        })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          if (data.secure_url || data.url) {
            setNewProdFoto(data.secure_url || data.url)
          }
        }
      } catch (err) {
        console.warn('Subida a Cloudinary falló, manteniendo base64 local:', err)
      } finally {
        setUploadingProdFoto(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // Calculadora de la Res state
  const [calcPesoPie, setCalcPesoPie] = useState(450)
  const [calcPrecioPie, setCalcPrecioPie] = useState(9800)
  const [calcRendCanal, setCalcRendCanal] = useState(55) // %
  const [calcYieldCarne, setCalcYieldCarne] = useState(70) // % del canal
  const [calcYieldHueso, setCalcYieldHueso] = useState(15) // % del canal
  const [calcYieldGrasa, setCalcYieldGrasa] = useState(11) // % del canal
  const [calcYieldMerma, setCalcYieldMerma] = useState(4)  // % del canal
  const [showAdvancedCalc, setShowAdvancedCalc] = useState(false)

  // Filter state for orders & inventory
  const [orderFilter, setOrderFilter] = useState('Todos')
  const [inventoryFilter, setInventoryFilter] = useState('Todos')

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('el_buen_corte_user')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      localStorage.removeItem('el_buen_corte_user')
      return null
    }
  })
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('el_buen_corte_token') || '')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Auth Inputs
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regNombre, setRegNombre] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRol, setRegRol] = useState('cajero')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // SuperAdmin User Management & Search Filter
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('todos')
  const [userActionSuccess, setUserActionSuccess] = useState('')

  // Modal Edición Usuario
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [editUserId, setEditUserId] = useState(null)
  const [editUserNombre, setEditUserNombre] = useState('')
  const [editUserEmail, setEditUserEmail] = useState('')
  const [editUserUsername, setEditUserUsername] = useState('')
  const [editUserRol, setEditUserRol] = useState('cajero')
  const [editUserPassword, setEditUserPassword] = useState('')
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [editUserLoading, setEditUserLoading] = useState(false)
  const [editUserError, setEditUserError] = useState('')

  const getAuthHeaders = () => {
    const token = localStorage.getItem('el_buen_corte_token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
    let pass = ''
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pass
  }

  const handleLogin = async (e, mode = 'regular') => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      if (mode === 'regular' && data.user.rol === 'superadmin') {
        throw new Error('El Super Administrador debe ingresar desde el Portal Maestro.')
      }
      if (mode === 'superadmin' && data.user.rol !== 'superadmin') {
        throw new Error('Credenciales inválidas para el Portal Maestro.')
      }

      // Limpiar estados de sesión anterior para evitar retención en memoria
      setInventario([])
      setPedidos([])
      setTransacciones([])
      setMermas([])
      setSavedSimulations([])
      setNotificaciones([])
      setProfileData(DEFAULT_PROFILE)
      setProfileForm(DEFAULT_PROFILE)

      localStorage.setItem('el_buen_corte_token', data.token)
      localStorage.setItem('el_buen_corte_user', JSON.stringify(data.user))
      setAuthToken(data.token)
      setCurrentUser(data.user)
      if (data.user.rol === 'superadmin') {
        setActiveTab('superadmin')
      } else {
        setActiveTab('resumen')
        loadData(data.token)
      }
    } catch (err) {
      console.error("Login error:", err)
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setAuthError('')
    setUserActionSuccess('')
    setAuthLoading(true)

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ nombre: regNombre, email: regEmail, username: regUsername, password: regPassword, rol: regRol })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar usuario')
      }

      setUserActionSuccess(`¡Usuario "${data.user.nombre}" registrado exitosamente con rol ${data.user.rol.toUpperCase()}!`)
      setTimeout(() => setUserActionSuccess(''), 5000)
      setRegNombre('')
      setRegEmail('')
      setRegPassword('')
      setRegRol('cajero')
      fetchUsersList() // Refrescar la tabla
    } catch (err) {
      console.error("Register error:", err)
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const openEditUserModal = (u) => {
    setEditUserId(u.id)
    setEditUserNombre(u.nombre)
    setEditUserEmail(u.email)
    setEditUserUsername(u.username || '')
    setEditUserRol(u.rol)
    setEditUserPassword('')
    setShowEditPassword(false)
    setEditUserError('')
    setEditUserModalOpen(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setEditUserError('')
    setEditUserLoading(true)

    try {
      const payload = {
        nombre: editUserNombre,
        email: editUserEmail,
        rol: editUserRol
      }
      if (editUserPassword.trim()) {
        payload.password = editUserPassword.trim()
      }

      const res = await fetch(`${API_BASE}/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar usuario')
      }

      setEditUserModalOpen(false)
      setEditUserId(null)
      setEditUserPassword('')
      setUserActionSuccess(`Usuario "${data.user.nombre}" actualizado correctamente.`)
      setTimeout(() => setUserActionSuccess(''), 5000)
      fetchUsersList()
    } catch (err) {
      console.error('Update user error:', err)
      setEditUserError(err.message)
    } finally {
      setEditUserLoading(false)
    }
  }

  const handleDeleteUser = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${nombre}" del sistema?`)) return
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar usuario')
      }
      setUserActionSuccess(`Usuario "${nombre}" eliminado del sistema.`)
      setTimeout(() => setUserActionSuccess(''), 5000)
      fetchUsersList()
    } catch (err) {
      console.error("Delete user error:", err)
      alert(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('el_buen_corte_token')
    localStorage.removeItem('el_buen_corte_user')
    localStorage.removeItem('el_buen_corte_profile')
    setAuthToken('')
    setCurrentUser(null)
    setInventario([])
    setPedidos([])
    setTransacciones([])
    setMermas([])
    setSavedSimulations([])
    setNotificaciones([])
    setUnreadNotifsCount(0)
    setShowNotifDropdown(false)
    setProfileData(DEFAULT_PROFILE)
    setProfileForm(DEFAULT_PROFILE)
    setActiveTab('resumen')
  }

  // Fetch notificaciones desde el backend y detectar nuevos pedidos
  const fetchNotificaciones = async () => {
    if (!currentUser || currentUser.rol === 'superadmin') return
    try {
      const res = await fetch(`${API_BASE}/notificaciones`, { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await res.json()
        setNotificaciones(data)
        setUnreadNotifsCount(data.filter(n => !n.leida).length)

        // Detección automática de nuevos pedidos para disparar voz
        if (isInitialNotifLoadRef.current) {
          data.forEach(n => knownOrderNotifIdsRef.current.add(n.id))
          isInitialNotifLoadRef.current = false
        } else {
          const freshOrderNotifs = data.filter(n => 
            !n.leida && 
            (n.tipo === 'pedido_nuevo' || n.titulo?.toLowerCase().includes('pedido')) &&
            !knownOrderNotifIdsRef.current.has(n.id)
          )

          if (freshOrderNotifs.length > 0) {
            freshOrderNotifs.forEach(n => knownOrderNotifIdsRef.current.add(n.id))
            const latest = freshOrderNotifs[0]
            let metadata = {}
            try { 
              metadata = typeof latest.metadata === 'string' ? JSON.parse(latest.metadata) : (latest.metadata || {}) 
            } catch(e){}

            triggerNewOrderAlert({
              id: latest.referencia_id || metadata.orderId,
              cliente: metadata.cliente || 'Cliente de Tienda',
              total: metadata.total
            })
          }
        }
      }
    } catch (err) {
      console.error('Error al obtener notificaciones:', err)
    }
  }

  // Marcar notificación individual como leída
  const handleMarkNotifAsRead = async (id, e) => {
    if (e) e.stopPropagation()
    try {
      await fetch(`${API_BASE}/notificaciones/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
      setUnreadNotifsCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error al marcar notificación:', err)
    }
  }

  // Marcar todas las notificaciones como leídas
  const handleMarkAllNotifsAsRead = async () => {
    try {
      await fetch(`${API_BASE}/notificaciones/mark-all-read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadNotifsCount(0)
    } catch (err) {
      console.error('Error al marcar todas las notificaciones:', err)
    }
  }

  // Al hacer clic sobre una notificación
  const handleNotifClick = async (notif) => {
    if (!notif.leida) {
      await handleMarkNotifAsRead(notif.id)
    }
    setShowNotifDropdown(false)
    if (notif.tipo === 'pedido_nuevo' || notif.referenciaId?.startsWith('PED')) {
      setActiveTab('pedidos')
    }
  }

  // Verificar token en el montaje inicial para evitar 403 zombi
  useEffect(() => {
    const checkActiveSession = async () => {
      const token = localStorage.getItem('el_buen_corte_token')
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (!res.ok) {
            console.warn('Token de autenticación expirado o inválido. Limpiando sesión.')
            handleLogout()
          } else {
            const data = await res.json()
            if (data.user) {
              setCurrentUser(data.user)
            }
          }
        } catch (e) {
          console.warn('No se pudo conectar para validar sesión:', e)
        }
      }
    }
    checkActiveSession()
  }, [])

  // Cerrar menú de notificaciones al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ⚡ Sincronización en tiempo real (BroadcastChannel, Storage Events y Polling)
  useEffect(() => {
    if (!currentUser || currentUser.rol === 'superadmin') return
    const myTenantId = currentUser.tenant_id || currentUser.id

    // 1. Canal BroadcastChannel entre pestañas (Tienda -> Dashboard)
    let bc;
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('el_buen_corte_channel')
        bc.onmessage = (event) => {
          if (event.data && event.data.type === 'NUEVO_PEDIDO') {
            const incomingTenant = event.data.tenantId
            if (!incomingTenant || Number(incomingTenant) === Number(myTenantId)) {
              triggerNewOrderAlert(event.data)
              fetchNotificaciones()
              if (activeTab === 'pedidos' || activeTab === 'resumen') {
                loadData()
              }
            }
          }
        }
      } catch (e) {
        console.warn('BroadcastChannel no disponible:', e)
      }
    }

    // 2. Storage Event (Respaldo en caso de navegadores sin BroadcastChannel)
    const handleStorageEvent = (e) => {
      if (e.key === 'el_buen_corte_new_order_ping' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          const incomingTenant = parsed.tenantId
          if (!incomingTenant || Number(incomingTenant) === Number(myTenantId)) {
            triggerNewOrderAlert(parsed)
            fetchNotificaciones()
            if (activeTab === 'pedidos' || activeTab === 'resumen') {
              loadData()
            }
          }
        } catch (err) {}
      }
    }
    window.addEventListener('storage', handleStorageEvent)

    fetchNotificaciones()

    // 3. Polling cada 5 segundos
    const interval = setInterval(() => {
      fetchNotificaciones()
      if (activeTab === 'pedidos' || activeTab === 'resumen') {
        fetch(`${API_BASE}/pedidos`, { headers: getAuthHeaders() })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data && Array.isArray(data)) setPedidos(data)
          })
          .catch(() => {})
      }
    }, 5000)

    return () => {
      if (bc) bc.close()
      window.removeEventListener('storage', handleStorageEvent)
      clearInterval(interval)
    }
  }, [currentUser, activeTab])

  // Load data function
  const loadData = async (tokenOverride) => {
    const activeToken = tokenOverride || localStorage.getItem('el_buen_corte_token') || authToken;
    if (!activeToken) return;

    try {
      const safeFetch = async (url) => {
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${activeToken}`
          }
        })
        if (res.status === 401 || res.status === 403) {
          console.warn(`Sesión expirada (${res.status}) al acceder a ${url}. Cerrando sesión.`);
          handleLogout();
          throw new Error('Sesión expirada. Por favor ingresa nuevamente.');
        }
        if (!res.ok) throw new Error(`HTTP status ${res.status}`)
        return res.json()
      }

      const [invData, pedData, trxData, mermaData, simData, profileRes] = await Promise.all([
        safeFetch(`${API_BASE}/inventario`),
        safeFetch(`${API_BASE}/pedidos`),
        safeFetch(`${API_BASE}/transacciones`),
        safeFetch(`${API_BASE}/mermas`),
        safeFetch(`${API_BASE}/simulaciones`),
        safeFetch(`${API_BASE}/business-profile`)
      ])

      const normalizedInv = (Array.isArray(invData) ? invData : []).map(p => ({
        ...p,
        unidadMedida: normalizeUnit(p.unidadMedida || p.unidad_medida, p.categoria, p.nombre),
        descuento: Number(p.descuento || 0)
      }))

      setInventario(normalizedInv)
      setPedidos(Array.isArray(pedData) ? pedData : [])
      setTransacciones(Array.isArray(trxData) ? trxData : [])
      setMermas(Array.isArray(mermaData) ? mermaData : [])
      setSavedSimulations(Array.isArray(simData) ? simData : [])

      if (profileRes && profileRes.general && Object.keys(profileRes.general).length > 0) {
        const mergedProfile = {
          ...DEFAULT_PROFILE,
          ...profileRes,
          general: { ...DEFAULT_PROFILE.general, ...(profileRes.general || {}) },
          identidad: { ...DEFAULT_PROFILE.identidad, ...(profileRes.identidad || {}) },
          contacto: { ...DEFAULT_PROFILE.contacto, ...(profileRes.contacto || {}) },
          ubicacion: { ...DEFAULT_PROFILE.ubicacion, ...(profileRes.ubicacion || {}) },
          redes: profileRes.redes || DEFAULT_PROFILE.redes,
          horarios: profileRes.horarios || DEFAULT_PROFILE.horarios,
          financiero: { ...DEFAULT_PROFILE.financiero, ...(profileRes.financiero || {}) },
          adicional: { ...DEFAULT_PROFILE.adicional, ...(profileRes.adicional || {}) }
        }
        setProfileData(mergedProfile)
        setProfileForm(mergedProfile)
      } else {
        const defaultTenantProfile = {
          ...DEFAULT_PROFILE,
          general: {
            ...DEFAULT_PROFILE.general,
            nombre: currentUser?.nombre ? `Carnicería ${currentUser.nombre}` : 'El Buen Corte'
          }
        }
        setProfileData(defaultTenantProfile)
        setProfileForm(defaultTenantProfile)
      }
    } catch (err) {
      console.warn("Error al cargar datos de la sede:", err)
    }
  }

  const fetchUsersList = async () => {
    if (currentUser?.rol !== 'admin' && currentUser?.rol !== 'superadmin') return;
    setUsersLoading(true)
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() })
      if(res.ok) {
        const data = await res.json()
        setUsersList(data)
      }
    } catch(e) {
      console.error('Error fetching users:', e)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentUser.rol !== 'superadmin') {
      loadData()
    }
  }, [currentUser])

  useEffect(() => {
    if (activeTab === 'usuarios' || activeTab === 'superadmin') {
      fetchUsersList()
    }
  }, [activeTab, currentUser])


  // Calculate calculations
  const hasUnsavedChanges = JSON.stringify(profileData) !== JSON.stringify(profileForm)
  const totalVentasHoy = transacciones
    .filter(t => t.tipo === 'Ingreso')
    .reduce((acc, t) => acc + Number(t.monto || 0), 0)

  const totalEgresosHoy = transacciones
    .filter(t => t.tipo === 'Egreso')
    .reduce((acc, t) => acc + Number(t.monto || 0), 0)

  const saldoCajaActual = cajaBase + totalVentasHoy - totalEgresosHoy

  const pedidosPendientesCount = pedidos.filter(p => p.estado === 'Pendiente').length
  
  const stockBajoAlerts = inventario.filter(item => item.stock <= item.limiteMin)

  const filteredInventario = inventario.filter(item => {
    if (inventoryFilter === 'Todos') return true
    return item.categoria === inventoryFilter
  })

  const filteredUsersList = usersList.filter(u => {
    const matchesSearch = 
      (u.nombre || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase())
    const matchesRole = userRoleFilter === 'todos' || u.rol === userRoleFilter
    return matchesSearch && matchesRole
  })

  // Handle new product creation
  const handleCreateProduct = async (e) => {
    if (e) e.preventDefault()
    if (addProductSubmittingRef.current || addProductSubmitting) return
    if (!newProdName.trim() || newProdPrice <= 0) return

    const body = {
      nombre: newProdName,
      categoria: newProdCategory,
      descripcion: newProdDesc,
      foto: newProdFoto || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300',
      precioVenta: Number(newProdPrice),
      stock: Number(newProdStock),
      limiteMin: Number(newProdLimitMin),
      unidadMedida: normalizeUnit(newProdUnit)
    }

    addProductSubmittingRef.current = true
    setAddProductSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/inventario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }
      await loadData()
    } catch (err) {
      console.error('Error al crear producto. Usando fallback local:', err)
      // Local fallback
      const nuevoId = String(inventario.length > 0 ? Math.max(...inventario.map(i => Number(i.id))) + 1 : 1)
      const newProduct = {
        id: nuevoId,
        ...body
      }
      setInventario([...inventario, newProduct])
    } finally {
      addProductSubmittingRef.current = false
      setAddProductSubmitting(false)
    }

    // Reset form
    setNewProdName('')
    setNewProdCategory('Carnes Rojas')
    setNewProdDesc('')
    setNewProdFoto('')
    setNewProdPrice(0)
    setNewProdStock(0)
    setNewProdLimitMin(10)
    setNewProdUnit('kg')
    setShowAddProductModal(false)
  }

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto del inventario?')) return
    try {
      await fetch(`${API_BASE}/inventario/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      await loadData()
    } catch (err) {
      // Local fallback
      setInventario(inventario.filter(i => i.id !== id))
    }
  }

  // Res yields derived values
  const canalKg = (calcPesoPie * calcRendCanal) / 100
  const carneKg = (canalKg * calcYieldCarne) / 100
  const huesoKg = (canalKg * calcYieldHueso) / 100
  const grasaKg = (canalKg * calcYieldGrasa) / 100
  const mermaKg = (canalKg * calcYieldMerma) / 100
  const aprovechableKg = carneKg + huesoKg + grasaKg
  const costTotalAnimal = calcPesoPie * calcPrecioPie
  
  // Usable meat yield cost
  const realCostPerKgMeat = carneKg > 0 ? Math.round(costTotalAnimal / carneKg) : 0

  // Handle new order creation
  const handleCreateOrder = async (e) => {
    if (e) e.preventDefault()
    if (createOrderSubmittingRef.current || createOrderSubmitting) return
    if (!newOrderClient.trim()) return

    const items = newOrderItems.map(oi => ({
      productoId: oi.productoId,
      cantidad: Number(oi.cantidad)
    }))

    createOrderSubmittingRef.current = true
    setCreateOrderSubmitting(true)

    try {
      await fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify({ cliente: newOrderClient, items })
      })
      await loadData()
    } catch (err) {
      // Local fallback
      const fullItems = newOrderItems.map(oi => {
        const prod = inventario.find(i => i.id === oi.productoId)
        return {
          productoId: oi.productoId,
          nombre: prod?.nombre || 'Corte',
          cantidad: Number(oi.cantidad),
          precio: prod?.precioVenta || 0
        }
      })
      const total = fullItems.reduce((acc, item) => acc + (item.cantidad * item.precio), 0)
      const orderId = `PED-${100 + pedidos.length + 1}`
      const newOrder = {
        id: orderId,
        cliente: newOrderClient,
        items: fullItems,
        total,
        estado: 'Pendiente',
        fecha: new Date().toLocaleDateString('es-CO')
      }
      setPedidos([newOrder, ...pedidos])
      setInventario(prev => prev.map(prod => {
        const orderItem = fullItems.find(oi => oi.productoId === prod.id)
        if (orderItem) {
          return { ...prod, stock: Math.max(0, prod.stock - orderItem.cantidad) }
        }
        return prod
      }))
    } finally {
      createOrderSubmittingRef.current = false
      setCreateOrderSubmitting(false)
    }

    // Reset form
    setNewOrderClient('')
    setNewOrderItems([{ productoId: '1', cantidad: 1 }])
    setShowAddOrderModal(false)
  }

  // Add items dynamically to new order form
  const handleAddOrderItemRow = () => {
    setNewOrderItems([...newOrderItems, { productoId: '1', cantidad: 1 }])
  }

  const handleRemoveOrderItemRow = (index) => {
    if (newOrderItems.length === 1) return
    setNewOrderItems(newOrderItems.filter((_, i) => i !== index))
  }

  const handleOrderItemChange = (index, field, value) => {
    const updated = [...newOrderItems]
    updated[index][field] = value
    setNewOrderItems(updated)
  }

  // Delivery & Cobro handling
  const handleOpenChargeOrderModal = (order) => {
    setPosSelectedOrder(order)
    setNewIncomePaymentMethod(order.metodoPago === 'Transferencia' ? 'Transferencia' : 'Efectivo')
    setPosClientName(order.cliente || 'Cliente')
    setPosCashReceived('')
    setIncomeMode('pos')
    setShowAddIncomeModal(true)
  }

  const handleDeliverOrder = async (orderId, paymentMethod = 'Efectivo') => {
    if (chargeLoadingRef.current || chargeLoading) return
    chargeLoadingRef.current = true
    setChargeLoading(true)

    try {
      const res = await fetch(`${API_BASE}/pedidos/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify({ 
          estado: 'Entregado',
          metodoPago: paymentMethod
        })
      })
      if (!res.ok) throw new Error('Error al registrar cobro y entrega del pedido')
      await loadData()
      setPosSelectedOrder(null)
      setShowAddIncomeModal(false)
      alert(`✅ ¡Pedido ${orderId} cobrado (${paymentMethod}) y entregado exitosamente!\n\nLa venta se registró como Ingreso en Contabilidad y se actualizó el saldo de caja.`)
    } catch (err) {
      console.warn('Error al actualizar pedido en backend, aplicando cambios localmente:', err)
      // Local fallback
      const updatedPedidos = pedidos.map(p => {
        if (p.id === orderId) {
          const newTrx = {
            id: `TRX-${100 + transacciones.length + 1}`,
            tipo: 'Ingreso',
            descripcion: `Venta de ${p.cliente} (${p.id})`,
            monto: p.total,
            metodoPago: paymentMethod,
            fecha: new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})
          }
          setTransacciones(prev => [newTrx, ...prev])
          return { ...p, estado: 'Entregado', metodoPago: paymentMethod }
        }
        return p
      })
      setPedidos(updatedPedidos)
      setPosSelectedOrder(null)
      setShowAddIncomeModal(false)
      alert(`✅ ¡Pedido ${orderId} cobrado (${paymentMethod}) y entregado (Modo local)!`)
    } finally {
      chargeLoadingRef.current = false
      setChargeLoading(false)
    }
  }

  // Cancel order handling
  const handleCancelOrder = async (orderId) => {
    try {
      await fetch(`${API_BASE}/pedidos/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify({ estado: 'Cancelado' })
      })
      await loadData()
    } catch (err) {
      // Local fallback
      const updatedPedidos = pedidos.map(p => {
        if (p.id === orderId) {
          setInventario(prev => prev.map(prod => {
            const orderItem = p.items.find(oi => oi.productoId === prod.id)
            if (orderItem) {
              return { ...prod, stock: prod.stock + orderItem.cantidad }
            }
            return prod
          }))
          return { ...p, estado: 'Cancelado' }
        }
        return p
      })
      setPedidos(updatedPedidos)
    }
  }

  // Add stock handling (con costo real pagado al proveedor)
  const handleAddStock = async (e) => {
    if (e) e.preventDefault()
    if (addStockSubmittingRef.current || addStockSubmitting) return
    const prod = inventario.find(i => String(i.id) === String(newStockProduct))
    if (!prod) return

    const qtyNumber = Number(newStockWeight)
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      alert('Por favor ingresa una cantidad válida mayor a 0.')
      return
    }

    const parsedCost = parseFormattedNumber(newStockCost) || Number(newStockCost) || 0
    if (isNaN(parsedCost) || parsedCost < 0) {
      alert('El costo total de compra debe ser un número válido mayor o igual a 0.')
      return
    }

    addStockSubmittingRef.current = true
    setAddStockSubmitting(true)

    const payload = {
      productoId: newStockProduct,
      cantidad: qtyNumber,
      costoTotal: parsedCost,
      metodoPago: newStockPaymentMethod
    }

    try {
      const res = await fetch(`${API_BASE}/inventario/abastecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al abastecer inventario')
      }
      await loadData()
      alert(`✅ ¡Abastecimiento registrado con éxito!\n\n• +${qtyNumber} ${getUnitLabel(prod.unidadMedida)} ingresados a "${prod.nombre}".\n• Egreso de caja registrado: ${formatCOP(parsedCost)} (${newStockPaymentMethod}).`)
    } catch (err) {
      console.warn('Error al abastecer en backend, aplicando cambios localmente:', err)
      // Local fallback
      setInventario(prev => prev.map(i => {
        if (String(i.id) === String(newStockProduct)) {
          return { ...i, stock: Number(i.stock) + qtyNumber }
        }
        return i
      }))
      if (parsedCost > 0) {
        const newTrx = {
          id: `TRX-${100 + transacciones.length + 1}`,
          tipo: 'Egreso',
          descripcion: `Compra / Abastecimiento: +${qtyNumber} ${getUnitLabel(prod.unidadMedida)} de ${prod.nombre}`,
          monto: parsedCost,
          metodoPago: newStockPaymentMethod,
          fecha: new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})
        }
        setTransacciones(prev => [newTrx, ...prev])
      }
      alert(`✅ ¡Abastecimiento registrado (Modo local)!\n\n• +${qtyNumber} ${getUnitLabel(prod.unidadMedida)} a "${prod.nombre}".\n• Egreso: ${formatCOP(parsedCost)}.`)
    } finally {
      addStockSubmittingRef.current = false
      setAddStockSubmitting(false)
      setShowAddStockModal(false)
      setNewStockCost('')
    }
  }

  // Record Merma handling
  const handleAddMerma = async (e) => {
    if (e) e.preventDefault()
    if (addMermaSubmittingRef.current || addMermaSubmitting) return
    const prod = inventario.find(i => i.id === newMermaProduct)
    if (!prod) return

    addMermaSubmittingRef.current = true
    setAddMermaSubmitting(true)

    try {
      await fetch(`${API_BASE}/inventario/mermas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify({ productoId: newMermaProduct, peso: Number(newMermaWeight), motivo: newMermaReason })
      })
      await loadData()
    } catch (err) {
      // Local fallback
      setInventario(prev => prev.map(i => {
        if (i.id === newMermaProduct) {
          return { ...i, stock: Math.max(0, i.stock - Number(newMermaWeight)) }
        }
        return i
      }))
      const newMerma = {
        id: `M-${mermas.length + 1}`,
        productoNombre: prod.nombre,
        peso: Number(newMermaWeight),
        motivo: newMermaReason || 'Descarte estándar',
        fecha: new Date().toLocaleDateString('es-CO')
      }
      setMermas([newMerma, ...mermas])
    } finally {
      addMermaSubmittingRef.current = false
      setAddMermaSubmitting(false)
    }
    setShowAddMermaModal(false)
    setNewMermaWeight(1.0)
    setNewMermaReason('')
  }

  // Record manual expense
  const handleAddExpense = async (e) => {
    if (e) e.preventDefault()
    if (addExpenseSubmittingRef.current || addExpenseSubmitting) return
    if (!newExpenseDesc.trim() || newExpenseAmount <= 0) return

    addExpenseSubmittingRef.current = true
    setAddExpenseSubmitting(true)

    try {
      await fetch(`${API_BASE}/transacciones/egreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify({ 
          descripcion: newExpenseDesc, 
          monto: Number(newExpenseAmount),
          metodoPago: newExpensePaymentMethod
        })
      })
      await loadData()
      alert('¡Egreso registrado correctamente!')
    } catch (err) {
      // Local fallback
      const newTrx = {
        id: `TRX-${100 + transacciones.length + 1}`,
        tipo: 'Egreso',
        descripcion: newExpenseDesc,
        monto: Number(newExpenseAmount),
        metodoPago: newExpensePaymentMethod,
        fecha: new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})
      }
      setTransacciones(prev => [newTrx, ...prev])
      alert('¡Egreso registrado correctamente (Modo local)!')
    } finally {
      addExpenseSubmittingRef.current = false
      setAddExpenseSubmitting(false)
    }
    setShowAddExpenseModal(false)
    setNewExpenseDesc('')
    setNewExpenseAmount(0)
    setNewExpensePaymentMethod('Efectivo')
  }

  // Descuento handlers
  const handleOpenDiscountModal = (product) => {
    setDiscountProduct(product)
    setDiscountPercent(Number(product.descuento) || 0)
    setShowDiscountModal(true)
  }

  const handleSaveDiscount = async (e) => {
    if (e) e.preventDefault()
    if (!discountProduct) return
    if (discountLoadingRef.current || discountLoading) return

    const numDescuento = Math.max(0, Math.min(100, Number(discountPercent) || 0))
    discountLoadingRef.current = true
    setDiscountLoading(true)

    try {
      const res = await fetch(`${API_BASE}/inventario/${discountProduct.id}/descuento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify({ descuento: numDescuento })
      })

      if (!res.ok) {
        throw new Error('Error al actualizar el descuento en el servidor')
      }

      await loadData()
      alert(`✅ ¡Descuento de ${numDescuento}% aplicado exitosamente a "${discountProduct.nombre}"!`)
      setShowDiscountModal(false)
    } catch (err) {
      console.warn('Error backend al actualizar descuento, aplicando fallback local:', err)
      setInventario(prev => prev.map(p => {
        if (p.id === discountProduct.id) {
          return { ...p, descuento: numDescuento }
        }
        return p
      }))
      alert(`✅ ¡Descuento de ${numDescuento}% guardado (Modo local) para "${discountProduct.nombre}"!`)
      setShowDiscountModal(false)
    } finally {
      discountLoadingRef.current = false
      setDiscountLoading(false)
    }
  }

  // Helper for adding product to POS cart
  const handlePosAddToCart = () => {
    const prod = inventario.find(i => String(i.id) === String(posSelectedProdId))
    if (!prod) {
      alert('⚠️ Por favor selecciona un corte o producto.')
      return
    }

    const baseUnit = normalizeUnit(prod.unidadMedida || 'kg')
    const numQty = parseFloat(posQty)
    if (isNaN(numQty) || numQty <= 0) {
      alert('⚠️ Por favor ingresa una cantidad válida mayor a 0.')
      return
    }
    if (baseUnit === 'und' && (!Number.isInteger(numQty) || numQty < 1)) {
      alert('⚠️ Los productos por unidad solo se pueden vender en cantidades enteras (ej. 1, 2, 3...).')
      return
    }

    // Stock deduction calculation in base units of the product
    const stockDeduct = calculateStockDeduction(numQty, posUnit, baseUnit)

    // Check currently added in cart for this product in base units
    const existingInCartItems = posCart.filter(item => String(item.productoId) === String(prod.id))
    const currentInCartStock = existingInCartItems.reduce((sum, item) => sum + calculateStockDeduction(item.cantidad, item.unidad, baseUnit), 0)
    const totalRequiredStock = currentInCartStock + stockDeduct

    if (totalRequiredStock > Number(prod.stock)) {
      alert(`❌ Stock insuficiente para "${prod.nombre}".\n\n• Stock disponible: ${formatStockDisplay(prod.stock, baseUnit)}\n• Ya agregado a la venta: ${formatStockDisplay(currentInCartStock, baseUnit)}\n• Intentas agregar: ${numQty} ${posUnit} (${formatStockDisplay(stockDeduct, baseUnit)})`)
      return
    }

    // Calculate item unit price and subtotal
    const unitPrice = calculateUnitPriceForSoldUnit(prod, posUnit)
    const subtotal = numQty * unitPrice

    const existingSameUnitIndex = posCart.findIndex(item => String(item.productoId) === String(prod.id) && item.unidad === posUnit)

    if (existingSameUnitIndex > -1) {
      // Update existing item in cart
      setPosCart(posCart.map((item, idx) => {
        if (idx === existingSameUnitIndex) {
          const updatedQty = baseUnit === 'und' 
            ? Math.round(item.cantidad + numQty) 
            : Number((item.cantidad + numQty).toFixed(3))
          return {
            ...item,
            cantidad: updatedQty,
            subtotal: updatedQty * unitPrice
          }
        }
        return item
      }))
    } else {
      // Add new item
      const newItem = {
        productoId: String(prod.id),
        nombre: prod.nombre,
        categoria: prod.categoria,
        cantidad: numQty,
        unidad: posUnit,
        precioUnitario: unitPrice,
        precioBase: Number(prod.precioVenta),
        baseUnit: baseUnit,
        descuento: Number(prod.descuento) || 0,
        subtotal: subtotal
      }
      setPosCart([...posCart, newItem])
    }

    // Reset input quantity
    setPosQty(1)
  }

  const handlePosRemoveFromCart = (index) => {
    setPosCart(posCart.filter((_, i) => i !== index))
  }

  const handleConfirmPosSale = async (e) => {
    if (e) e.preventDefault()
    if (posSubmittingRef.current || posSubmitting) return
    if (posCart.length === 0) {
      alert('⚠️ La venta no tiene productos agregados. Selecciona y agrega al menos un corte.')
      return
    }

    const posTotal = posCart.reduce((sum, item) => sum + item.subtotal, 0)
    const posCashNum = parseFormattedNumber(posCashReceived) || 0
    const posChange = posCashNum >= posTotal ? posCashNum - posTotal : 0

    posSubmittingRef.current = true
    setPosSubmitting(true)
    const itemsPayload = posCart.map(item => ({
      productoId: item.productoId,
      nombre: item.nombre,
      cantidad: item.cantidad,
      unidad: item.unidad,
      precio: item.precioUnitario
    }))

    const descItems = posCart.map(i => `${i.cantidad} ${i.unidad} de ${i.nombre}`).join(', ')
    const body = {
      cliente: posClientName.trim() || 'Cliente Mostrador',
      monto: posTotal,
      metodoPago: newIncomePaymentMethod,
      descripcion: `Venta Mostrador: ${descItems}`,
      items: itemsPayload
    }

    try {
      const res = await fetch(`${API_BASE}/transacciones/ingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Error ${res.status}`)
      }

      await loadData()
      alert(`✅ ¡Venta registrada exitosamente por ${formatCOP(posTotal)}!\n\n• Se descontó el inventario de los productos vendidos.\n• Se registró el ingreso en Contabilidad / Caja (${newIncomePaymentMethod}).${posCashNum > posTotal ? `\n• Cambio / Vueltas a entregar al cliente: ${formatCOP(posChange)}` : ''}`)
      
      // Reset POS state
      setPosCart([])
      setPosCashReceived('')
      setPosClientName('Cliente Mostrador')
      setShowAddIncomeModal(false)
    } catch (err) {
      console.warn('Error backend venta POS, aplicando fallback local:', err)
      // Local fallback
      setInventario(prev => prev.map(prod => {
        const cartItemsForProd = posCart.filter(ci => String(ci.productoId) === String(prod.id))
        if (cartItemsForProd.length > 0) {
          const baseUnit = normalizeUnit(prod.unidadMedida || 'kg')
          const totalDeduct = cartItemsForProd.reduce((sum, item) => sum + calculateStockDeduction(item.cantidad, item.unidad, baseUnit), 0)
          return { ...prod, stock: Math.max(0, prod.stock - totalDeduct) }
        }
        return prod
      }))

      const newTrx = {
        id: `TRX-${100 + transacciones.length + 1}`,
        tipo: 'Ingreso',
        descripcion: body.descripcion,
        monto: posTotal,
        metodoPago: newIncomePaymentMethod,
        fecha: new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})
      }
      setTransacciones(prev => [newTrx, ...prev])

      alert(`✅ ¡Venta registrada exitosamente (Modo local) por ${formatCOP(posTotal)}!\n\n• Se actualizó el stock y la caja.`)
      setPosCart([])
      setPosCashReceived('')
      setPosClientName('Cliente Mostrador')
      setShowAddIncomeModal(false)
    } finally {
      posSubmittingRef.current = false
      setPosSubmitting(false)
    }
  }

  // Record manual income
  const handleAddIncome = async (e) => {
    if (e) e.preventDefault()
    if (addIncomeSubmittingRef.current || addIncomeSubmitting) return
    if (!newIncomeDesc.trim() || newIncomeAmount <= 0) return

    addIncomeSubmittingRef.current = true
    setAddIncomeSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/transacciones/ingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify({ 
          descripcion: newIncomeDesc, 
          monto: Number(newIncomeAmount),
          metodoPago: newIncomePaymentMethod
        })
      })
      if (!res.ok) throw new Error('Error al registrar ingreso')
      await loadData()
      alert('¡Ingreso registrado correctamente!')
    } catch (err) {
      console.error('Error registering income, using fallback:', err)
      // Local fallback
      const newTrx = {
        id: `TRX-${100 + transacciones.length + 1}`,
        tipo: 'Ingreso',
        descripcion: newIncomeDesc,
        monto: Number(newIncomeAmount),
        metodoPago: newIncomePaymentMethod,
        fecha: new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})
      }
      setTransacciones(prev => [newTrx, ...prev])
      alert('¡Ingreso registrado correctamente (Modo local)!')
    } finally {
      addIncomeSubmittingRef.current = false
      setAddIncomeSubmitting(false)
    }
    setShowAddIncomeModal(false)
    setNewIncomeDesc('')
    setNewIncomeAmount(0)
    setNewIncomePaymentMethod('Efectivo')
  }

  // Generate and download financial PDF report
  const handleExportPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF()
      
      // Con el encabezado dinámico, el contenido de la primera página comienza en Y = 36
      let y = 36
      
      // Resumen Financiero Section
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(33, 37, 41)
      doc.text("RESUMEN FINANCIERO DEL DÍA", 14, y)
      y += 8
      
      const ingresos = transacciones.filter(t => t.tipo === 'Ingreso')
      const egresos = transacciones.filter(t => t.tipo === 'Egreso')
      
      const sumIngresos = ingresos.reduce((acc, t) => acc + Number(t.monto || 0), 0)
      const sumEgresos = egresos.reduce((acc, t) => acc + Number(t.monto || 0), 0)
      const balance = sumIngresos - sumEgresos
      
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Total de Ingresos: ${formatCOP(sumIngresos)}`, 14, y)
      y += 6
      doc.text(`Total de Egresos: ${formatCOP(sumEgresos)}`, 14, y)
      y += 6
      doc.setFont("helvetica", "bold")
      doc.text(`Balance Final: ${formatCOP(balance)}`, 14, y)
      y += 12
      
      doc.setDrawColor(220, 220, 220)
      doc.line(14, y, 196, y)
      y += 8
      
      // Tabla de Ingresos
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("TABLA DE INGRESOS", 14, y)
      y += 8
      
      // Header Table
      doc.setFontSize(9)
      doc.setFillColor(240, 240, 240)
      doc.rect(14, y, 182, 7, "F")
      doc.setTextColor(33, 37, 41)
      doc.text("Fecha / Hora", 16, y + 5)
      doc.text("Descripción o concepto", 45, y + 5)
      doc.text("Método de pago", 125, y + 5)
      doc.text("Valor", 165, y + 5)
      y += 7
      
      doc.setFont("helvetica", "normal")
      if (ingresos.length === 0) {
        doc.text("No hay ingresos registrados.", 16, y + 5)
        y += 8
      } else {
        ingresos.forEach(item => {
          if (y > 270) {
            doc.addPage()
            y = 36
          }
          doc.text(item.fecha || 'N/A', 16, y + 5)
          
          let desc = item.descripcion || ''
          if (desc.length > 40) desc = desc.substring(0, 37) + '...'
          doc.text(desc, 45, y + 5)
          
          doc.text(item.metodoPago || 'Efectivo', 125, y + 5)
          doc.text(formatCOP(item.monto), 165, y + 5)
          
          doc.line(14, y + 7, 196, y + 7)
          y += 8
        })
      }
      y += 6
      
      // Tabla de Egresos
      if (y > 250) {
        doc.addPage()
        y = 36
      }
      
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("TABLA DE EGRESOS", 14, y)
      y += 8
      
      // Header Table
      doc.setFontSize(9)
      doc.setFillColor(240, 240, 240)
      doc.rect(14, y, 182, 7, "F")
      doc.setTextColor(33, 37, 41)
      doc.text("Fecha / Hora", 16, y + 5)
      doc.text("Descripción o concepto", 45, y + 5)
      doc.text("Método Pago", 125, y + 5)
      doc.text("Valor", 165, y + 5)
      y += 7
      
      doc.setFont("helvetica", "normal")
      if (egresos.length === 0) {
        doc.text("No hay egresos registrados.", 16, y + 5)
        y += 8
      } else {
        egresos.forEach(item => {
          if (y > 270) {
            doc.addPage()
            y = 36
          }
          doc.text(item.fecha || 'N/A', 16, y + 5)
          
          let desc = item.descripcion || ''
          if (desc.length > 40) desc = desc.substring(0, 37) + '...'
          doc.text(desc, 45, y + 5)
          
          doc.text(item.metodoPago || 'Efectivo', 125, y + 5)
          doc.text(formatCOP(item.monto), 165, y + 5)
          
          doc.line(14, y + 7, 196, y + 7)
          y += 8
        })
      }
      
      // --- DIBUJAR ENCABEZADOS Y PIES DE PÁGINA CORPORATIVOS ---
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        
        // --- HEADER ---
        const logo = profileData.identidad?.logo
        let logoWidth = 0
        if (logo) {
          try {
            let format = 'PNG'
            if (logo.includes('image/jpeg') || logo.includes('image/jpg')) {
              format = 'JPEG'
            } else if (logo.includes('image/webp')) {
              format = 'WEBP'
            }
            doc.addImage(logo, format, 14, 8, 14, 14)
            logoWidth = 18 // Desplazamiento del texto a la derecha del logo
          } catch (e) {
            console.error('Error rendering logo in PDF:', e)
          }
        }

        // Información General de Identidad del Negocio
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(33, 37, 41)
        doc.text(profileData.general?.nombre || 'El Buen Corte', 14 + logoWidth, 13)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        
        const razonSocial = profileData.general?.razonSocial || ''
        const nit = profileData.financiero?.nit ? `NIT: ${profileData.financiero.nit}` : ''
        const subHeaderLine = [razonSocial, nit].filter(Boolean).join(' | ')
        if (subHeaderLine) {
          doc.text(subHeaderLine, 14 + logoWidth, 18)
        }

        // Título del Reporte y Fecha (Alineado a la derecha)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(212, 175, 55) // Color Accent Dorado
        doc.text("Reporte Diario de Contabilidad y Caja", 196, 13, { align: 'right' })

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})}`, 196, 18, { align: 'right' })

        // Línea de división superior
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.3)
        doc.line(14, 25, 196, 25)

        // --- FOOTER ---
        // Línea divisoria inferior
        doc.line(14, 278, 196, 278)

        // Contactos del Negocio
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(120, 120, 120)

        const address = [
          profileData.ubicacion?.direccion,
          profileData.ubicacion?.ciudad
        ].filter(Boolean).join(', ')

        const contact = [
          profileData.contacto?.telefonoPrincipal ? `Tel: ${profileData.contacto.telefonoPrincipal}` : '',
          profileData.contacto?.email ? `Email: ${profileData.contacto.email}` : '',
          profileData.contacto?.sitioWeb ? `Web: ${profileData.contacto.sitioWeb}` : ''
        ].filter(Boolean).join(' | ')

        const footerLeftText = [address, contact].filter(Boolean).join('  •  ')
        doc.text(footerLeftText || 'El Buen Corte - Sistema de Gestión', 14, 284)

        // Numeración de páginas
        doc.text(`Página ${i} de ${totalPages}`, 196, 284, { align: 'right' })
      }
      
      doc.save(`Reporte_Financiero_${new Date().toISOString().split('T')[0]}.pdf`)
    }).catch(err => {
      console.error("Error al cargar jsPDF:", err)
      alert("Error al cargar la librería para exportar PDF.")
    })
  }

  // Save Business Profile changes
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault()
    if (saveProfileSubmittingRef.current || saveProfileSubmitting) return
    
    // Validations
    if (!profileForm.general?.nombre?.trim()) {
      alert("❌ El nombre del negocio es obligatorio.")
      return
    }
    if (profileForm.contacto?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.contacto.email)) {
      alert("❌ Ingresa un correo electrónico válido.")
      return
    }
    if (profileForm.contacto?.sitioWeb && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(profileForm.contacto.sitioWeb)) {
      alert("❌ Ingresa una URL de sitio web válida.")
      return
    }
    
    saveProfileSubmittingRef.current = true
    setSaveProfileSubmitting(true)

    try {
      const response = await fetch(`${API_BASE}/business-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify(profileForm)
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${response.status}`)
      }
      const updated = await response.json()
      if (updated && updated.general) {
        const merged = {
          ...DEFAULT_PROFILE,
          ...updated,
          general: { ...DEFAULT_PROFILE.general, ...(updated.general || {}) },
          identidad: { ...DEFAULT_PROFILE.identidad, ...(updated.identidad || {}) },
          contacto: { ...DEFAULT_PROFILE.contacto, ...(updated.contacto || {}) },
          ubicacion: { ...DEFAULT_PROFILE.ubicacion, ...(updated.ubicacion || {}) },
          redes: updated.redes || DEFAULT_PROFILE.redes,
          horarios: updated.horarios || DEFAULT_PROFILE.horarios,
          financiero: { ...DEFAULT_PROFILE.financiero, ...(updated.financiero || {}) },
          adicional: { ...DEFAULT_PROFILE.adicional, ...(updated.adicional || {}) }
        }
        setProfileData(merged)
        setProfileForm(merged)
        alert("✅ Los cambios se guardaron correctamente en la base de datos.")
      } else {
        throw new Error('Respuesta inválida del servidor')
      }
    } catch (err) {
      console.warn("Error al guardar perfil en backend:", err)
      alert("❌ No se pudo guardar el perfil en el servidor: " + (err.message || 'Error desconocido'))
    } finally {
      saveProfileSubmittingRef.current = false
      setSaveProfileSubmitting(false)
    }
  }

  const updateProfileGeneral = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }))
  }

  const updateProfileIdentidad = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      identidad: { ...prev.identidad, [field]: value }
    }))
  }

  const updateProfileContacto = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      contacto: { ...prev.contacto, [field]: value }
    }))
  }

  const updateProfileUbicacion = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      ubicacion: { ...prev.ubicacion, [field]: value }
    }))
  }

  const updateProfileFinanciero = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      financiero: { ...prev.financiero, [field]: value }
    }))
  }

  const updateProfileAdicional = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      adicional: { ...prev.adicional, [field]: value }
    }))
  }

  const handleAddSocialNetwork = (platform, username, url) => {
    if (!platform || !url) return
    const newNetwork = {
      id: String(Date.now()),
      plataforma: platform,
      usuario: username,
      url: url
    }
    setProfileForm(prev => ({
      ...prev,
      redes: [...prev.redes, newNetwork]
    }))
  }

  const handleRemoveSocialNetwork = (id) => {
    setProfileForm(prev => ({
      ...prev,
      redes: prev.redes.filter(r => r.id !== id)
    }))
  }

  const handleUpdateBusinessHour = (day, field, value) => {
    setProfileForm(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [day]: { ...prev.horarios[day], [field]: value }
      }
    }))
  }

  const handleCopyBusinessHoursWeek = () => {
    const mondayHours = profileForm.horarios['Lunes']
    setProfileForm(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        'Lunes': { ...mondayHours },
        'Martes': { ...mondayHours },
        'Miércoles': { ...mondayHours },
        'Jueves': { ...mondayHours },
        'Viernes': { ...mondayHours },
        'Sábado': { ...mondayHours }
      }
    }))
  }

  const handleFileChange = (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate format
    const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert("❌ Formato no permitido. Solo se permiten imágenes PNG, JPG, JPEG o WEBP.")
      return
    }
    
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Tamaño de archivo superior a 5MB. Por favor sube una imagen más ligera.")
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      // Mostrar vista previa de inmediato
      updateProfileIdentidad(field, base64)
      
      // Intentar subir a Cloudinary a través del backend
      try {
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ image: base64, folder: 'el_buen_corte/branding' })
        })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          if (data.secure_url || data.url) {
            updateProfileIdentidad(field, data.secure_url || data.url)
          }
        }
      } catch (err) {
        console.warn('Subida a Cloudinary falló, manteniendo base64 local:', err)
      }
    }
    reader.readAsDataURL(file)
  }

  // Save Calculator simulation
  const handleSaveSimulation = async () => {
    if (saveSimSubmittingRef.current || saveSimSubmitting) return
    saveSimSubmittingRef.current = true
    setSaveSimSubmitting(true)

    try {
      await fetch(`${API_BASE}/simulaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...getIdempotencyHeaders() },
        body: JSON.stringify({
          pesoPie: calcPesoPie,
          costoTotal: costTotalAnimal,
          carneKg: Number(carneKg.toFixed(1)),
          realCostoKg: realCostPerKgMeat
        })
      })
      await loadData()
    } catch (err) {
      // Local fallback
      const newSim = {
        id: savedSimulations.length + 1,
        fecha: new Date().toLocaleDateString('es-CO'),
        pesoPie: calcPesoPie,
        costoTotal: costTotalAnimal,
        carneKg: Number(carneKg.toFixed(1)),
        realCostoKg: realCostPerKgMeat
      }
      setSavedSimulations([newSim, ...savedSimulations])
    } finally {
      saveSimSubmittingRef.current = false
      setSaveSimSubmitting(false)
    }
  }

  // Delete simulation
  const handleDeleteSimulation = async (id) => {
    try {
      await fetch(`${API_BASE}/simulaciones/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      await loadData()
    } catch (err) {
      // Local fallback
      setSavedSimulations(savedSimulations.filter(s => s.id !== id))
    }
  }

  // Perform daily box closure
  const handleCloseCaja = () => {
    const salesCount = transacciones.filter(t => t.tipo === 'Ingreso').length
    const expenseCount = transacciones.filter(t => t.tipo === 'Egreso').length
    const result = {
      fecha: new Date().toLocaleDateString('es-CO'),
      hora: new Date().toLocaleTimeString('es-CO'),
      baseApertura: cajaBase,
      ingresosTotales: totalVentasHoy,
      egresosTotales: totalEgresosHoy,
      totalEfectivo: saldoCajaActual,
      numVentas: salesCount,
      numEgresos: expenseCount
    }
    setCierreResult(result)
    setIsCajaAbierta(false)
    setShowCierreModal(true)
  }

  // Open box again
  const handleOpenCaja = (base) => {
    setCajaBase(base || 300000)
    setTransacciones([])
    setIsCajaAbierta(true)
    setCierreResult(null)
  }

  if (!currentUser) {
    return (
      <LoginView 
        loginUsername={loginUsername} setLoginUsername={setLoginUsername}
        loginPassword={loginPassword} setLoginPassword={setLoginPassword}
        handleLogin={handleLogin}
        authLoading={authLoading} authError={authError} setAuthError={setAuthError}
        showPassword={showPassword} setShowPassword={setShowPassword}
      />
    )
  }

  if (currentUser.rol === 'superadmin') {
    return (
      <SuperAdminPortal 
        currentUser={currentUser}
        handleLogout={handleLogout}
        API_BASE={API_BASE}
        getAuthHeaders={getAuthHeaders}
      />
    )
  }

  return (
    <div className="app-container">
      {/* 🔔 BANNER TOAST FLOTANTE: NUEVO PEDIDO ENTRANTE */}
      {newOrderBanner && (
        <div 
          className="new-order-toast-banner"
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '14px 18px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '440px'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            flexShrink: 0
          }}>
            📦
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>¡Tienes un nuevo pedido!</span>
              <span style={{ fontSize: '10px', background: '#ef4444', color: '#ffffff', padding: '1px 6px', borderRadius: '99px', fontWeight: '800' }}>NUEVO</span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Cliente: <strong style={{ color: '#ffffff' }}>{newOrderBanner.cliente || 'Tienda Virtual'}</strong>
              {newOrderBanner.total ? ` • ${formatCOP(newOrderBanner.total)}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('pedidos')
                setNewOrderBanner(null)
              }}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
              }}
            >
              Ver Pedido
            </button>
            <button
              type="button"
              onClick={() => setNewOrderBanner(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#94a3b8',
                border: 'none',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-icon">
              <BrandLogoSvg style={{ width: '24px', height: '24px' }} />
            </div>
            <div className="brand-name">
              El Buen Corte
              <span>Dashboard</span>
            </div>
          </div>
          <button 
            type="button" 
            className="mobile-sidebar-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar Menú"
          >
            <CloseIcon style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <nav className="nav-menu">
          <div
            className={`nav-item ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => { setActiveTab('resumen'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon"><HomeIcon /></span>
            Resumen General
          </div>

          <a
            href={`/tienda?tenant=${currentUser?.tenant_id || currentUser?.id || 1}`}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            style={{ textDecoration: 'none' }}
            title="Abrir Tienda Virtual de su sede en pestaña nueva para clientes"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon"><ShoppingBagIcon /></span>
            <span>Tienda Virtual</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#dc2626', background: '#fee2e2', padding: '2px 7px', borderRadius: '6px', fontWeight: '800' }}>
              Abrir ↗
            </span>
          </a>
          
          <div
            className={`nav-item ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pedidos'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon"><ClipboardIcon /></span>
            Gestión Pedidos
            {pedidosPendientesCount > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: '11px' }}>
                {pedidosPendientesCount}
              </span>
            )}
          </div>

          <div
            className={`nav-item ${activeTab === 'inventario' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inventario'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon"><BoxIcon /></span>
            Inventario & Mermas
            {stockBajoAlerts.length > 0 && (
              <span className="badge badge-pending" style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: '11px' }}>
                {stockBajoAlerts.length}
              </span>
            )}
          </div>

          <div
            className={`nav-item ${activeTab === 'calculadora' ? 'active' : ''}`}
            onClick={() => { setActiveTab('calculadora'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon"><ScaleIcon /></span>
            Calculadora Res
          </div>

          <div
            className={`nav-item ${activeTab === 'contabilidad' ? 'active' : ''}`}
            onClick={() => { setActiveTab('contabilidad'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon"><DollarIcon /></span>
            Contabilidad / Caja
          </div>

          <div
            className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => { setActiveTab('perfil'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon"><StoreIcon /></span>
            Perfil del Negocio
          </div>
        </nav>

        <div className="sidebar-footer-container">
          <button 
            type="button" 
            className="sidebar-logout-btn" 
            onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
            title="Cerrar Sesión"
          >
            <span className="sidebar-logout-icon"><LogOutIcon /></span>
            <span>Cerrar Sesión</span>
          </button>

          <div className="sidebar-footer">
            Desarrollado por <span className="nexo-brand">Ne<span className="nexo-x">X</span>o</span> <span className="nexo-by">by: Brayan Cardozo</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button" 
              className="mobile-hamburger-btn" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir Menú"
            >
              <MenuIcon style={{ width: '22px', height: '22px' }} />
            </button>
            <div className="navbar-title">
              {activeTab === 'resumen' && 'Resumen Operativo'}
              {activeTab === 'tienda' && 'Tienda Virtual'}
              {activeTab === 'pedidos' && 'Gestión de Pedidos'}
              {activeTab === 'inventario' && 'Inventario & Mermas'}
              {activeTab === 'calculadora' && 'Calculadora de Res'}
              {activeTab === 'contabilidad' && 'Caja & Contabilidad'}
              {activeTab === 'perfil' && 'Perfil del Negocio'}
            </div>
          </div>

          <div className="navbar-actions">
            <div className="date-badge">
              📅 {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
            
            {isCajaAbierta ? (
              <div className="caja-status abierta">
                <span className="status-dot"></span>
                <span className="caja-status-full">Caja Abierta: {formatCOP(saldoCajaActual)}</span>
                <span className="caja-status-compact">Abierta</span>
              </div>
            ) : (
              <div className="caja-status cerrada">
                <span className="status-dot"></span>
                <span className="caja-status-full">Caja Cerrada</span>
                <span className="caja-status-compact">Cerrada</span>
              </div>
            )}

            {/* 🔔 Campana de Notificaciones */}
            <div className="notification-bell-wrapper" ref={notifRef}>
              <button
                type="button"
                className={`notification-bell-btn ${showNotifDropdown ? 'active' : ''}`}
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                title="Notificaciones del Sistema"
                aria-label="Notificaciones"
              >
                <BellIcon style={{ width: '18px', height: '18px' }} />
                {unreadNotifsCount > 0 && (
                  <span className="notification-badge">
                    {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Panel Desplegable de Notificaciones */}
              {showNotifDropdown && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <div className="notification-dropdown-title">
                      <span>🔔 Notificaciones</span>
                      {unreadNotifsCount > 0 && (
                        <span className="badge badge-danger" style={{ fontSize: '10px', padding: '1px 6px', marginLeft: '6px' }}>
                          {unreadNotifsCount} nuevas
                        </span>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        type="button"
                        className="notification-mark-all-btn"
                        onClick={handleMarkAllNotifsAsRead}
                      >
                        Marcar todas leídas
                      </button>
                    )}
                  </div>

                  <div className="notification-dropdown-body">
                    {notificaciones.length === 0 ? (
                      <div className="notification-empty-state">
                        <div className="notification-empty-icon">🔕</div>
                        <div className="notification-empty-text">No tienes notificaciones en este momento</div>
                      </div>
                    ) : (
                      notificaciones.map((n) => (
                        <div
                          key={n.id}
                          className={`notification-item ${!n.leida ? 'unread' : 'read'}`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <div className="notification-item-icon">
                            {n.tipo === 'pedido_nuevo' ? '📦' : n.tipo === 'stock_bajo' ? '⚠️' : '🔔'}
                          </div>
                          <div className="notification-item-content">
                            <div className="notification-item-header">
                              <span className="notification-item-title">{n.titulo}</span>
                              <span className="notification-item-time">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <div className="notification-item-msg">
                              {n.mensaje}
                            </div>
                          </div>
                          {!n.leida && <span className="notification-item-dot" title="No leída" />}
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ padding: '9px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => playOrderVoiceNotification("Tienes un nuevo pedido")}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Probar sonido y voz del sistema"
                    >
                      <span>🔊</span> Probar voz ("Tienes un nuevo pedido")
                    </button>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '600' }}>Alerta en tiempo real</span>
                  </div>
                </div>
              )}
            </div>

            {currentUser && (
              <div className="auth-user-badge">
                <div className={`auth-user-avatar ${currentUser.rol === 'superadmin' ? 'avatar-superadmin' : ''}`}>
                  {currentUser.rol === 'superadmin' ? '👑' : (currentUser.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="auth-user-info-text">
                  <div style={{ fontSize: '12px', fontWeight: '700', lineHeight: 1.1 }}>{currentUser.nombre || 'Usuario'}</div>
                  {currentUser.rol === 'superadmin' ? (
                    <div className="superadmin-header-badge" style={{ marginTop: '2px' }}>
                      <CrownIcon style={{ width: '12px', height: '12px' }} /> SuperAdmin
                    </div>
                  ) : (
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'capitalize' }}>{currentUser.rol || 'admin'}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="page-container">
          
          {/* ================================================================= */}
          {/* 📊 TAB: RESUMEN GENERAL */}
          {/* ================================================================= */}
          {activeTab === 'resumen' && (
            <div>
              {/* Alert for low stock */}
              {stockBajoAlerts.length > 0 && (
                <div className="alert alert-warning">
                  ⚠️ <strong>¡Alerta de Inventario!</strong> Tienes {stockBajoAlerts.length} productos por debajo del stock mínimo recomendado ({stockBajoAlerts.map(i => i.nombre).join(', ')}).
                </div>
              )}

              {/* Metrics cards */}
              <div className="grid-metrics">
                <div className="card metric-card card-tint-blue">
                  <BrandWatermark size={130} style={{ right: '-10px', bottom: '-10px', transform: 'rotate(-5deg)' }} />
                  <div className="card-title">Ventas del Día <span className="nav-icon"><DollarIcon /></span></div>
                  <div className="metric-value" style={{ color: 'var(--accent-blue)' }}>{formatCOP(totalVentasHoy)}</div>
                  <div className="metric-footer">
                    <span className="metric-trend-up">↑ 12%</span> respecto a promedio diario
                  </div>
                </div>

                <div className="card metric-card card-tint-gold">
                  <BrandWatermark size={130} style={{ right: '-10px', bottom: '-10px', transform: 'rotate(-5deg)' }} />
                  <div className="card-title">Pedidos Activos <span className="nav-icon"><ClipboardIcon /></span></div>
                  <div className="metric-value" style={{ color: 'var(--accent-gold)' }}>{pedidosPendientesCount}</div>
                  <div className="metric-footer">
                    <span>{pedidos.filter(p => p.estado === 'Entregado').length} entregados hoy</span>
                  </div>
                </div>

                <div className="card metric-card card-tint-red">
                  <BrandWatermark size={130} style={{ right: '-10px', bottom: '-10px', transform: 'rotate(-5deg)' }} />
                  <div className="card-title">Egresos Hoy <span className="nav-icon"><DollarIcon /></span></div>
                  <div className="metric-value" style={{ color: 'var(--accent-red)' }}>{formatCOP(totalEgresosHoy)}</div>
                  <div className="metric-footer">
                    <span style={{ color: 'var(--accent-red)' }}>Egreso neto</span> compras y mermas
                  </div>
                </div>

                <div className="card metric-card card-tint-green">
                  <BrandWatermark size={130} style={{ right: '-10px', bottom: '-10px', transform: 'rotate(-5deg)' }} />
                  <div className="card-title">Saldo Efectivo Caja <span className="nav-icon"><BoxIcon /></span></div>
                  <div className="metric-value" style={{ color: 'var(--accent-green)' }}>{formatCOP(saldoCajaActual)}</div>
                  <div className="metric-footer">
                    <span>Base: {formatCOP(cajaBase)}</span>
                  </div>
                </div>
              </div>

              {/* Main dashboard content */}
              <div className="grid-dashboard-main">
                {/* Column Left: Actions and lists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="card card-tint-blue" style={{ background: 'linear-gradient(160deg, #ffffff 40%, #eff6ff 100%)' }}>
                    <BrandWatermark size={160} style={{ right: '5px', bottom: '5px', transform: 'rotate(-5deg)' }} />
                    <div className="card-watermark-icon" style={{ color: 'var(--accent-red)' }}><BoltIcon /></div>
                    <h3 className="card-title" style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '18px' }}>
                      Acciones Rápidas
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => {
                          if(!isCajaAbierta) { alert('Abre la caja antes de registrar pedidos.'); return; }
                          setShowAddOrderModal(true)
                        }}
                      >
                        <PlusIcon /> Nuevo Pedido
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          if (inventario.length > 0) {
                            setNewStockProduct(inventario[0].id);
                            setNewStockWeight(inventario[0].unidadMedida === 'und' ? 10 : 5);
                          }
                          setNewStockCost('');
                          setNewStockPaymentMethod('Efectivo');
                          setShowAddStockModal(true);
                        }}
                      >
                        <BoxIcon /> Abastecer Inventario
                      </button>
                      <button className="btn btn-danger" onClick={() => setShowAddMermaModal(true)}>
                        <TrashIcon /> Registrar Merma
                      </button>
                      <button 
                        className="btn btn-gold" 
                        onClick={() => {
                          if(!isCajaAbierta) { alert('La caja ya está cerrada.'); return; }
                          handleCloseCaja()
                        }}
                      >
                        <StoreIcon /> Cerrar Caja
                      </button>
                    </div>
                  </div>

                  <div className="card card-tint-gold" style={{ background: 'linear-gradient(160deg, #ffffff 40%, #fffbeb 100%)' }}>
                    <BrandWatermark size={160} style={{ right: '5px', bottom: '5px', transform: 'rotate(-5deg)' }} />
                    <div className="card-watermark-icon" style={{ color: 'var(--accent-gold)' }}><ClockIcon /></div>
                    <div className="card-title">
                      Pedidos Pendientes Recientes
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setActiveTab('pedidos')}>
                        Ver todos
                      </button>
                    </div>
                    
                    {pedidos.filter(p => p.estado === 'Pendiente').length === 0 ? (
                      <EmptyState 
                        icon="🎉" 
                        title="Todo al día" 
                        subtitle="No hay pedidos pendientes por entregar en este momento." 
                        compact={true} 
                      />
                    ) : (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Cliente</th>
                              <th>Detalle</th>
                              <th>Total</th>
                              <th>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedidos.filter(p => p.estado === 'Pendiente').slice(0, 3).map(p => (
                              <tr key={p.id}>
                                <td style={{ fontWeight: '700' }}>{p.id}</td>
                                <td>{p.cliente}</td>
                                <td>{p.items.map(i => `${i.cantidad}kg ${i.nombre}`).join(', ')}</td>
                                <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{formatCOP(p.total)}</td>
                                <td>
                                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDeliverOrder(p.id)}>
                                    Entregar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column Right: Transacciones */}
                <div className="card card-tint-green" style={{ background: 'linear-gradient(160deg, #ffffff 40%, #f0fdf4 100%)' }}>
                  <BrandWatermark size={180} style={{ right: '10px', bottom: '10px', transform: 'rotate(-5deg)' }} />
                  <div className="card-watermark-icon" style={{ color: 'var(--accent-green)' }}><TrendingUpIcon /></div>
                  <h3 className="card-title">Transacciones del Turno</h3>
                  {transacciones.length === 0 ? (
                    <EmptyState 
                      icon="💸" 
                      title="Sin movimientos hoy" 
                      subtitle="Las ventas y egresos asentados aparecerán en este registro cronológico." 
                      compact={true} 
                    />
                  ) : (
                    <div className="activity-list">
                      {transacciones.map(trx => (
                        <div className="activity-item" key={trx.id}>
                          <div 
                            className="activity-icon-container" 
                            style={{ 
                              backgroundColor: trx.tipo === 'Ingreso' ? 'var(--accent-green-glow)' : 'var(--accent-red-glow)',
                              color: trx.tipo === 'Ingreso' ? 'var(--accent-green)' : 'var(--accent-red)'
                            }}
                          >
                            {trx.tipo === 'Ingreso' ? '+$' : '-$'}
                          </div>
                          <div className="activity-details">
                            <div className="activity-text">{trx.descripcion}</div>
                            <div className="activity-time">{trx.fecha} • <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{trx.metodoPago || 'Efectivo'}</span></div>
                          </div>
                          <div 
                            className="activity-amount"
                            style={{ color: trx.tipo === 'Ingreso' ? 'var(--accent-green)' : 'var(--accent-red)' }}
                          >
                            {trx.tipo === 'Ingreso' ? '+' : '-'}{formatCOP(trx.monto)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 🛒 TAB: GESTIÓN DE PEDIDOS */}
          {/* ================================================================= */}
          {activeTab === 'pedidos' && (
            <div className="card card-tint-gold" style={{ padding: '24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #ffffff 20%, #fffbeb 100%)' }}>
              <BrandWatermark size={300} style={{ right: '-20px', bottom: '-20px', transform: 'rotate(-5deg)' }} />
              
              <div className="filters-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                <div className="filter-tabs">
                  {[
                    { id: 'Todos', label: 'Todos' },
                    { id: 'Pendiente', label: 'Pendientes' },
                    { id: 'Entregado', label: 'Entregados' },
                    { id: 'Cancelado', label: 'Cancelados' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      type="button"
                      className={`filter-tab tab-${tab.id.toLowerCase()} ${orderFilter === tab.id ? 'active' : ''}`}
                      onClick={() => setOrderFilter(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    if(!isCajaAbierta) { alert('Abre la caja antes de registrar pedidos.'); return; }
                    setShowAddOrderModal(true)
                  }}
                >
                  <PlusIcon /> Crear Nuevo Pedido
                </button>
              </div>

              <div className="card">
                <BrandWatermark size={150} opacity={0.03} style={{ right: '20px', bottom: '20px', transform: 'rotate(-10deg)' }} />
                {pedidos.filter(p => orderFilter === 'Todos' || p.estado === orderFilter).length === 0 ? (
                  <EmptyState 
                    icon="📋" 
                    title={orderFilter === 'Todos' ? "No hay pedidos registrados" : `No hay pedidos ${orderFilter.toLowerCase()}s`} 
                    subtitle={orderFilter === 'Todos' ? "Crea un nuevo pedido para clientes de mostrador o espera pedidos entrantes desde la tienda virtual." : `No se encontraron pedidos con el estado "${orderFilter}".`}
                    actionButton={
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          if(!isCajaAbierta) { alert('Abre la caja antes de registrar pedidos.'); return; }
                          setShowAddOrderModal(true)
                        }}
                      >
                        <PlusIcon /> Crear Nuevo Pedido
                      </button>
                    }
                  />
                ) : (
                  <>
                    {/* Desktop View: Full data table */}
                    <div className="orders-desktop-view table-container table-scrollable">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Cortes Solicitados</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedidos
                            .filter(p => orderFilter === 'Todos' || p.estado === orderFilter)
                            .map(p => (
                              <tr key={p.id}>
                                <td style={{ fontWeight: '700' }}>{p.id}</td>
                                <td style={{ fontWeight: '600' }}>{p.cliente}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{p.fecha}</td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {p.items.map((i, idx) => (
                                      <span key={idx} style={{ fontSize: '13px' }}>
                                        • {formatStockDisplay(i.cantidad, i.unidad || 'kg')} de <strong>{i.nombre}</strong>
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatCOP(p.total)}</td>
                                <td>
                                  <span className={`badge ${
                                    p.estado === 'Pendiente' ? 'badge-pending' : 
                                    p.estado === 'Entregado' ? 'badge-success' : 'badge-danger'
                                  }`}>
                                    <span className="badge-dot" />
                                    {p.estado}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <button 
                                      type="button" 
                                      className="btn btn-secondary"
                                      style={{ padding: '5px 12px', fontSize: '11.5px', borderRadius: '20px' }}
                                      onClick={() => setSelectedOrderDetail(p)}
                                      title="Ver qué pidió el cliente para preparar y despachar"
                                    >
                                      👁️ Ver Pedido
                                    </button>
                                    {p.estado === 'Pendiente' && (
                                      <>
                                        <button 
                                          type="button" 
                                          className="btn btn-primary"
                                          style={{ 
                                            padding: '5px 14px', 
                                            fontSize: '11.5px', 
                                            borderRadius: '20px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            border: 'none',
                                            color: '#ffffff'
                                          }} 
                                          onClick={() => handleOpenChargeOrderModal(p)}
                                          title="Cobrar pedido y registrar venta en contabilidad"
                                        >
                                          💳 Cobrar & Entregar
                                        </button>
                                        <button 
                                          type="button" 
                                          className="btn btn-danger"
                                          style={{ padding: '5px 11px', fontSize: '11.5px', borderRadius: '20px' }}
                                          onClick={() => handleCancelOrder(p.id)}
                                        >
                                          Cancelar
                                        </button>
                                      </>
                                    )}
                                    {p.estado === 'Entregado' && (
                                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                                        ✓ Pagado en caja
                                      </span>
                                    )}
                                    {p.estado === 'Cancelado' && (
                                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                        ✕ Pedido anulado
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View: Dedicated intuitive Operator Order Cards */}
                    <div className="orders-mobile-view">
                      {pedidos
                        .filter(p => orderFilter === 'Todos' || p.estado === orderFilter)
                        .map(p => (
                          <div className="mobile-order-card" key={p.id}>
                            <div className="mobile-order-card-header">
                              <div>
                                <span className="mobile-order-code">{p.id}</span>
                                <span className="mobile-order-date">{p.fecha}</span>
                              </div>
                              <span className={`badge ${
                                p.estado === 'Pendiente' ? 'badge-pending' : 
                                p.estado === 'Entregado' ? 'badge-success' : 'badge-danger'
                              }`}>
                                <span className="badge-dot" />
                                {p.estado}
                              </span>
                            </div>

                            <div className="mobile-order-client-row">
                              <span className="client-icon">👤</span>
                              <strong>{p.cliente}</strong>
                            </div>

                            <div className="mobile-order-items-box">
                              {p.items.map((i, idx) => (
                                <div key={idx} className="mobile-order-item-line">
                                  <span>• {formatStockDisplay(i.cantidad, i.unidad || 'kg')} de <strong>{i.nombre}</strong></span>
                                  <span className="mobile-order-item-sub">{formatCOP(i.precio * i.cantidad)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="mobile-order-total-row">
                              <span>Total a cobrar:</span>
                              <span className="mobile-order-total-val">{formatCOP(p.total)}</span>
                            </div>

                            <div className="mobile-order-actions-row">
                              <button 
                                type="button" 
                                className="btn btn-secondary mobile-order-btn"
                                onClick={() => setSelectedOrderDetail(p)}
                              >
                                👁️ Ver Detalle
                              </button>
                              {p.estado === 'Pendiente' && (
                                <>
                                  <button 
                                    type="button" 
                                    className="btn btn-primary mobile-order-btn-charge"
                                    onClick={() => handleOpenChargeOrderModal(p)}
                                  >
                                    💳 Cobrar & Entregar
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-danger mobile-order-btn-cancel"
                                    onClick={() => handleCancelOrder(p.id)}
                                    title="Cancelar pedido"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                              {p.estado === 'Entregado' && (
                                <span className="mobile-order-status-pill success">
                                  ✓ Entregado y cobrado
                                </span>
                              )}
                              {p.estado === 'Cancelado' && (
                                <span className="mobile-order-status-pill danger">
                                  ✕ Pedido cancelado
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 📦 TAB: INVENTARIO & MERMAS */}
          {/* ================================================================= */}
          {activeTab === 'inventario' && (
            <div className="card card-tint-red" style={{ padding: '24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #ffffff 20%, #fff1f2 100%)' }}>
              <BrandWatermark size={300} style={{ right: '-20px', bottom: '-20px', transform: 'rotate(-5deg)' }} />
              
              <div className="filters-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div className="filter-tabs">
                  {['Todos', 'Carnes Rojas', 'Pollos', 'Embutidos', 'Cerdo', 'Otras'].map(cat => (
                    <button 
                      key={cat}
                      type="button"
                      className={`filter-tab ${inventoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setInventoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowAddProductModal(true)}
                  >
                    <PlusIcon /> Agregar Producto
                  </button>
                </div>
              </div>

              <div style={{ width: '100%' }}>
                {/* Product Cards Grid */}
                <div>
                  {filteredInventario.length === 0 ? (
                    <EmptyState 
                      icon="🥩" 
                      title={inventoryFilter === 'Todos' ? "No hay productos en inventario" : `No hay productos en "${inventoryFilter}"`} 
                      subtitle="Agrega nuevos cortes de carne o ajusta el filtro de categoría para visualizar los productos."
                      actionButton={
                        <button className="btn btn-primary" onClick={() => setShowAddProductModal(true)}>
                          <PlusIcon /> Agregar Producto
                        </button>
                      }
                    />
                  ) : (
                    <div className="inventory-products-grid">
                      {filteredInventario.map(item => {
                        const isLow = item.stock <= item.limiteMin
                        const hasDiscount = Number(item.descuento) > 0
                        const finalPrice = hasDiscount 
                          ? (item.precioVenta * (1 - item.descuento / 100)) 
                          : item.precioVenta

                        return (
                          <div className="card product-card inventory-card-item" key={item.id}>
                            {/* Product Photo & Overlays */}
                            <div className="inventory-card-media">
                              <img 
                                src={item.foto || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300'} 
                                alt={item.nombre}
                                className="product-image-hover"
                              />

                              {/* Discount Badge on Top-Left */}
                              {hasDiscount && (
                                <span className="inventory-discount-badge">
                                  🔥 {item.descuento}% OFF
                                </span>
                              )}

                              {/* Category Badge */}
                              <span className="inventory-category-badge">
                                {item.categoria}
                              </span>

                              {/* Red Delete Button Overlay */}
                              <button 
                                type="button" 
                                className="inventory-delete-btn"
                                onClick={() => handleDeleteProduct(item.id)}
                                title="Eliminar producto"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                                <span className="delete-btn-text">Eliminar</span>
                              </button>
                            </div>

                            {/* Card Content */}
                            <div className="inventory-card-body">
                              <h4 className="inventory-card-title">
                                {item.nombre}
                              </h4>
                              
                              <p className="inventory-card-desc">
                                {item.descripcion || 'Sin descripción disponible.'}
                              </p>

                              <div className="inventory-card-meta">
                                <div>
                                  <div className="inventory-price-label">
                                    Precio {getPriceUnitLabel(item.unidadMedida)}
                                  </div>
                                  {hasDiscount ? (
                                    <div>
                                      <span className="inventory-old-price">
                                        {formatCOP(item.precioVenta)}
                                      </span>
                                      <span className="inventory-final-price discount">
                                        {formatCOP(finalPrice)}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="inventory-final-price">
                                      {formatCOP(item.precioVenta)}
                                    </div>
                                  )}
                                </div>

                                <div className="inventory-stock-box">
                                  <div className="inventory-stock-label">Stock actual</div>
                                  <div className={`inventory-stock-val ${isLow ? 'low' : 'ok'}`}>
                                    {formatStockDisplay(item.stock, item.unidadMedida)}
                                    {isLow && <span className="stock-critical-tag">⚠️ Crítico</span>}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Stock & Discount Quick Actions */}
                              <div className="inventory-card-actions">
                                <button 
                                  className="btn btn-secondary inventory-action-btn"
                                  onClick={() => {
                                    setNewStockProduct(item.id);
                                    setNewStockWeight(item.unidadMedida === 'und' ? 10 : 5);
                                    setNewStockCost('');
                                    setNewStockPaymentMethod('Efectivo');
                                    setShowAddStockModal(true);
                                  }}
                                >
                                  📦 + Stock
                                </button>
                                <button 
                                  className={`btn ${hasDiscount ? 'btn-danger-discount' : 'btn-gold'} inventory-action-btn`}
                                  onClick={() => handleOpenDiscountModal(item)}
                                  title="Configurar porcentaje de descuento"
                                >
                                  🏷️ {hasDiscount ? `${item.descuento}% Dcto` : 'Descuento'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 🧮 TAB: CALCULADORA DE RES */}
          {/* ================================================================= */}
          {activeTab === 'calculadora' && (
            <div style={{ position: 'relative' }}>
              <div className="calc-res-grid">
                {/* Inputs card */}
                <div className="card card-tint-blue" style={{ background: 'linear-gradient(160deg, #ffffff 30%, #eff6ff 100%)' }}>
                  <BrandWatermark size={180} style={{ right: '-10px', bottom: '-10px', transform: 'rotate(-5deg)' }} />
                  <div className="card-watermark-icon" style={{ color: 'var(--accent-blue)' }}><ChartIcon /></div>
                  <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    Variables de Desposte y Compra
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Peso del Animal en Pie (kg)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="number" 
                        className="input-control" 
                        value={calcPesoPie}
                        onChange={(e) => setCalcPesoPie(Math.max(0, Number(e.target.value)))}
                        style={{ width: '120px', fontSize: '20px', fontWeight: '700' }}
                      />
                      <span style={{ fontSize: '16px', fontWeight: '700' }}>kg</span>
                    </div>
                    <input 
                      type="range" 
                      min={200} 
                      max={800} 
                      step={5} 
                      value={calcPesoPie}
                      onChange={(e) => setCalcPesoPie(Number(e.target.value))}
                      className="range-input"
                      style={{ marginTop: '12px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Precio Compra en Pie (por kg)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
    type="text" 
    className="input-control" 
    value={formatNumberWithDots(calcPrecioPie)}
    onChange={(e) => setCalcPrecioPie(parseFormattedNumber(e.target.value))}
                        style={{ width: '140px', fontSize: '20px', fontWeight: '700' }}
                      />
                      <span style={{ fontSize: '16px', fontWeight: '700' }}>COP/kg</span>
                    </div>
                  </div>

                  {/* Advanced Toggle Link */}
                  <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => setShowAdvancedCalc(!showAdvancedCalc)}
                    >
                      ⚙️ {showAdvancedCalc ? 'Ocultar Ajustes de Rendimiento' : 'Ajustar Porcentajes (Avanzado)'}
                    </button>
                  </div>

                  {/* Advanced Sliders */}
                  {showAdvancedCalc && (
                    <div style={{ padding: '16px', borderRadius: '12px', border: '1px dashed var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="range-slider-group" style={{ margin: 0 }}>
                        <div className="range-slider-header">
                          <span>Rendimiento en Canal</span>
                          <span style={{ color: 'var(--accent-gold)' }}>{calcRendCanal}%</span>
                        </div>
                        <input 
                          type="range" 
                          min={45} 
                          max={65} 
                          value={calcRendCanal}
                          onChange={(e) => setCalcRendCanal(Number(e.target.value))}
                          className="range-input"
                        />
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', margin: 0 }}>
                          Peso de la canal: <strong>{canalKg.toFixed(1)} kg</strong>
                        </p>
                      </div>

                      <div className="range-slider-group" style={{ margin: 0 }}>
                        <div className="range-slider-header">
                          <span>Carne Comercial Aprovechable</span>
                          <span style={{ color: 'var(--accent-red)' }}>{calcYieldCarne}%</span>
                        </div>
                        <input 
                          type="range" 
                          min={50} 
                          max={85} 
                          value={calcYieldCarne}
                          onChange={(e) => {
                            const val = Number(e.target.value)
                            setCalcYieldCarne(val)
                            const diff = 100 - val - calcYieldHueso - calcYieldGrasa
                            setCalcYieldMerma(Math.max(0, diff))
                          }}
                          className="range-input"
                        />
                      </div>

                      <div className="form-row">
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>Hueso (%)</label>
                          <input 
                            type="number" 
                            className="input-control" 
                            value={calcYieldHueso} 
                            onChange={(e) => {
                              const val = Number(e.target.value)
                              setCalcYieldHueso(val)
                              const diff = 100 - calcYieldCarne - val - calcYieldGrasa
                              setCalcYieldMerma(Math.max(0, diff))
                            }}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>Grasa (%)</label>
                          <input 
                            type="number" 
                            className="input-control" 
                            value={calcYieldGrasa} 
                            onChange={(e) => {
                              const val = Number(e.target.value)
                              setCalcYieldGrasa(val)
                              const diff = 100 - calcYieldCarne - calcYieldHueso - val
                              setCalcYieldMerma(Math.max(0, diff))
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '24px' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ 
                        width: '100%', 
                        opacity: saveSimSubmitting ? 0.65 : 1, 
                        cursor: saveSimSubmitting ? 'not-allowed' : 'pointer' 
                      }} 
                      onClick={handleSaveSimulation}
                      disabled={saveSimSubmitting}
                    >
                      {saveSimSubmitting ? '⏳ Guardando Simulación...' : <><CheckIcon /> Guardar Simulación</>}
                    </button>
                  </div>
                </div>

                {/* Outputs card */}
                <div className="card card-tint-green" style={{ background: 'linear-gradient(160deg, #ffffff 30%, #f0fdf4 100%)', position: 'relative', overflow: 'hidden' }}>
                  <BrandWatermark size={200} style={{ right: '-10px', bottom: '-10px', transform: 'rotate(-5deg)' }} />
                  <div className="card-watermark-icon" style={{ color: 'var(--accent-green)' }}><ScaleIcon /></div>
                  <h3 className="card-title">Resultado de Rendimiento Real</h3>

                  <div style={{ padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), transparent)', border: '1px solid var(--accent-red)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Costo Real de Carne Comercial Usable
                    </span>
                    <div style={{ fontSize: '38px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '8px' }}>
                      {formatCOP(realCostPerKgMeat)} <span style={{ fontSize: '16px', fontWeight: '600' }}>/ kg</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4', margin: 0 }}>
                      Este es tu costo real promedio por kilo de carne limpia (excluyendo hueso, grasa y merma). <strong>Cualquier precio de venta por debajo de este valor te generará pérdidas directas.</strong>
                    </p>
                  </div>

                  <div className="calc-yield-box">
                    <div className="yield-mini-card">
                      <div className="yield-mini-title" style={{ color: 'var(--accent-red)' }}>Carne Comercial</div>
                      <div className="yield-mini-value">{carneKg.toFixed(1)} kg</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(carneKg / calcPesoPie * 100).toFixed(1)}% total</div>
                    </div>
                    <div className="yield-mini-card">
                      <div className="yield-mini-title" style={{ color: 'var(--accent-gold)' }}>Hueso Sobrante</div>
                      <div className="yield-mini-value">{huesoKg.toFixed(1)} kg</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(huesoKg / calcPesoPie * 100).toFixed(1)}% total</div>
                    </div>
                    <div className="yield-mini-card">
                      <div className="yield-mini-title" style={{ color: '#fbbf24' }}>Grasa / Sebo</div>
                      <div className="yield-mini-value">{grasaKg.toFixed(1)} kg</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(grasaKg / calcPesoPie * 100).toFixed(1)}% total</div>
                    </div>
                    <div className="yield-mini-card">
                      <div className="yield-mini-title" style={{ color: '#9ca3af' }}>Merma / Oreo</div>
                      <div className="yield-mini-value">{mermaKg.toFixed(1)} kg</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(mermaKg / calcPesoPie * 100).toFixed(1)}% total</div>
                    </div>
                  </div>

                  {/* Chart breakdown */}
                  <div className="bar-chart-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', fontWeight: '600' }}>
                      <span>Desglose Gráfico de la Canal</span>
                      <span>Total: {canalKg.toFixed(1)} kg</span>
                    </div>
                    <div className="bar-chart-wrapper">
                      <div className="bar-segment" style={{ width: `${calcYieldCarne}%`, backgroundColor: 'var(--accent-red)' }} title="Carne" />
                      <div className="bar-segment" style={{ width: `${calcYieldHueso}%`, backgroundColor: 'var(--accent-gold)' }} title="Hueso" />
                      <div className="bar-segment" style={{ width: `${calcYieldGrasa}%`, backgroundColor: '#fbbf24' }} title="Grasa" />
                      <div className="bar-segment" style={{ width: `${calcYieldMerma}%`, backgroundColor: '#6b7280' }} title="Merma" />
                    </div>
                    
                    <div className="bar-legend">
                      <div className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: 'var(--accent-red)' }} />
                        <span>Carne: {calcYieldCarne}%</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: 'var(--accent-gold)' }} />
                        <span>Hueso: {calcYieldHueso}%</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#fbbf24' }} />
                        <span>Grasa: {calcYieldGrasa}%</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: '#6b7280' }} />
                        <span>Merma: {calcYieldMerma}%</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Costo Compra Animal Vivo:</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                      <span>{calcPesoPie} kg × {formatCOP(calcPrecioPie)}:</span>
                      <strong style={{ color: 'var(--accent-gold)' }}>{formatCOP(costTotalAnimal)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved simulations list */}
              {savedSimulations.length > 0 && (
                <div className="card" style={{ marginTop: '32px' }}>
                  <h3 className="card-title">Simulaciones Guardadas</h3>
                  <div className="table-container table-scrollable">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Peso Vivo (kg)</th>
                          <th>Costo Animal</th>
                          <th>Carne Producida (kg)</th>
                          <th>Costo Real / kg Carne</th>
                          <th style={{ textAlign: 'right' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {savedSimulations.map(sim => (
                          <tr key={sim.id}>
                            <td>{sim.fecha}</td>
                            <td style={{ fontWeight: '600' }}>{sim.pesoPie} kg</td>
                            <td>{formatCOP(sim.costoTotal)}</td>
                            <td>{sim.carneKg} kg</td>
                            <td style={{ fontWeight: '700', color: 'var(--accent-green)' }}>{formatCOP(sim.realCostoKg)}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-danger" style={{ padding: '4px' }} onClick={() => handleDeleteSimulation(sim.id)}>
                                <TrashIcon />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* 💵 TAB: CONTABILIDAD Y CAJA */}
          {/* ================================================================= */}
          {activeTab === 'contabilidad' && (
            <div>
              <div className="contabilidad-toolbar">
                <div className="contabilidad-actions-group">
                  <button 
                    className="btn btn-primary btn-venta-pos"
                    onClick={() => {
                      if(!isCajaAbierta) { alert('Abre la caja antes de registrar ventas o ingresos.'); return; }
                      setIncomeMode('pos')
                      setPosCart([])
                      setPosCategory('Todas')
                      setPosQty(1)
                      setPosUnit('kg')
                      setPosCashReceived('')
                      setPosClientName('Cliente Mostrador')
                      const defaultProd = inventario.find(i => Number(i.stock) > 0) || inventario[0]
                      if (defaultProd) {
                        setPosSelectedProdId(String(defaultProd.id))
                        if (defaultProd.categoria === 'Embutidos' || defaultProd.nombre.toLowerCase().includes('chorizo')) {
                          setPosUnit('und')
                        } else {
                          setPosUnit('kg')
                        }
                      }
                      setNewIncomePaymentMethod('Efectivo')
                      setShowAddIncomeModal(true)
                    }}
                  >
                    <PlusIcon /> 🛒 Registrar Venta / Ingreso
                  </button>
                  <button 
                    className="btn btn-secondary btn-egreso"
                    onClick={() => {
                      if(!isCajaAbierta) { alert('Abre la caja antes de registrar egresos.'); return; }
                      setShowAddExpenseModal(true)
                    }}
                  >
                    <PlusIcon /> Registrar Egreso / Gasto
                  </button>
                </div>
                <div className="contabilidad-caja-btn-wrapper">
                  {isCajaAbierta ? (
                    <button className="btn btn-gold btn-cierre-caja" onClick={handleCloseCaja}>
                      <WalletIcon /> Realizar Cierre de Caja
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-abrir-caja" onClick={() => handleOpenCaja(300000)}>
                      <StoreIcon /> Abrir Turno de Caja
                    </button>
                  )}
                </div>
              </div>

              <div className="contabilidad-grid-layout">
                {/* Left side: caja summary */}
                <div className="contabilidad-summary-column">
                  <div className="card contabilidad-summary-card">
                    <div className="card-watermark-icon" style={{ color: 'var(--accent-green)' }}><WalletIcon /></div>
                    <h3 className="card-title">Resumen de Caja</h3>

                    <div className="caja-summary-list">
                      <div className="caja-summary-row">
                        <span className="summary-row-label">Base Inicial</span>
                        <strong className="summary-row-val">{formatCOP(cajaBase)}</strong>
                      </div>
                      <div className="caja-summary-row">
                        <span className="summary-row-label">+ Ventas Cobradas</span>
                        <strong className="summary-row-val green">+{formatCOP(totalVentasHoy)}</strong>
                      </div>
                      <div className="caja-summary-row">
                        <span className="summary-row-label">- Egresos / Pagos</span>
                        <strong className="summary-row-val red">-{formatCOP(totalEgresosHoy)}</strong>
                      </div>
                      <div className="caja-summary-row total-row">
                        <span>Saldo Neto en Caja</span>
                        <strong className="total-saldo-val">{formatCOP(saldoCajaActual)}</strong>
                      </div>
                    </div>

                    {!isCajaAbierta && (
                      <div style={{ marginTop: '16px' }} className="alert alert-warning">
                        Caja actualmente Cerrada. Abre un nuevo turno para registrar transacciones.
                      </div>
                    )}
                  </div>

                  <div className="card contabilidad-report-card">
                    <h3 className="card-title">Reporte</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      Exporta el reporte consolidado de ingresos, egresos y el balance del turno actual.
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-export-pdf" 
                      onClick={handleExportPDF}
                    >
                      📄 Exportar PDF
                    </button>
                  </div>
                </div>

                {/* Right side: transaction log list */}
                <div className="card contabilidad-history-card card-tint-green" style={{ background: 'linear-gradient(160deg, #ffffff 20%, #f0fdf4 100%)' }}>
                  <BrandWatermark size={250} style={{ right: '10px', bottom: '10px', transform: 'rotate(-5deg)' }} />
                  <div className="card-watermark-icon" style={{ color: 'var(--accent-blue)' }}><TrendingUpIcon /></div>
                  <h3 className="card-title">Historial de Transacciones del Turno</h3>
                  {transacciones.length === 0 ? (
                    <EmptyState 
                      icon="💸" 
                      title="No hay transacciones en este turno" 
                      subtitle="Registra una venta de mostrador, ingreso o egreso de caja para comenzar el flujo del turno."
                      actionButton={
                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            if(!isCajaAbierta) { alert('Abre la caja antes de registrar ventas.'); return; }
                            setIncomeMode('pos')
                            setShowAddIncomeModal(true)
                          }}
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#059669' }}
                        >
                          <PlusIcon /> 🛒 Registrar Venta POS
                        </button>
                      }
                    />
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="transactions-desktop-view table-container table-scrollable">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Código</th>
                              <th>Descripción</th>
                              <th>Hora/Fecha</th>
                              <th>Tipo</th>
                              <th>Método de Pago</th>
                              <th style={{ textAlign: 'right' }}>Monto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transacciones.map(t => (
                              <tr key={t.id}>
                                <td style={{ fontWeight: '700' }}>{t.id}</td>
                                <td style={{ fontWeight: '500' }}>{t.descripcion}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{t.fecha}</td>
                                <td>
                                  <span className={`badge ${t.tipo === 'Ingreso' ? 'badge-success' : 'badge-danger'}`}>
                                    <span className="badge-dot" />
                                    {t.tipo}
                                  </span>
                                </td>
                                <td>
                                  <span className="payment-method-badge" style={{ 
                                    backgroundColor: t.tipo === 'Ingreso' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                    color: t.tipo === 'Ingreso' ? '#059669' : '#dc2626',
                                    padding: '4px 8px', 
                                    borderRadius: '6px',
                                    fontSize: '11.5px',
                                    fontWeight: '600',
                                    border: t.tipo === 'Ingreso' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)'
                                  }}>
                                    {t.metodoPago || 'Efectivo'}
                                  </span>
                                </td>
                                <td style={{ 
                                  textAlign: 'right', 
                                  fontWeight: '700',
                                  color: t.tipo === 'Ingreso' ? 'var(--accent-green)' : 'var(--accent-red)'
                                }}>
                                  {t.tipo === 'Ingreso' ? '+' : '-'}{formatCOP(t.monto)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Activity List View */}
                      <div className="transactions-mobile-view">
                        {transacciones.map(t => (
                          <div className="mobile-transaction-item" key={t.id}>
                            <div className={`mobile-trx-icon ${t.tipo === 'Ingreso' ? 'income' : 'expense'}`}>
                              {t.tipo === 'Ingreso' ? '+$' : '-$'}
                            </div>
                            <div className="mobile-trx-details">
                              <div className="mobile-trx-desc">{t.descripcion}</div>
                              <div className="mobile-trx-meta">
                                <span className="mobile-trx-code">{t.id}</span>
                                <span>•</span>
                                <span>{t.fecha}</span>
                                <span>•</span>
                                <span className="mobile-trx-payment">{t.metodoPago || 'Efectivo'}</span>
                              </div>
                            </div>
                            <div className={`mobile-trx-amount ${t.tipo === 'Ingreso' ? 'income' : 'expense'}`}>
                              {t.tipo === 'Ingreso' ? '+' : '-'}{formatCOP(t.monto)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 🏢 TAB: PERFIL DEL NEGOCIO */}
          {/* ================================================================= */}
          {activeTab === 'perfil' && (
            <div className="card card-tint-blue" style={{ padding: '24px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #ffffff 20%, #eff6ff 100%)' }}>
              <BrandWatermark size={300} style={{ right: '-20px', bottom: '-20px', transform: 'rotate(-5deg)' }} />
              
              {hasUnsavedChanges && (
                <div className="alert alert-warning animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px 20px', borderRadius: 'var(--radius-lg)', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span>
                    <div>
                      <strong>Tienes cambios sin guardar</strong> en la configuración del perfil.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setProfileForm(profileData)}>
                      Descartar cambios
                    </button>
                    <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={handleSaveProfile}>
                      💾 Guardar cambios
                    </button>
                  </div>
                </div>
              )}

              <div className="profile-layout" style={{ position: 'relative', zIndex: 1 }}>
                {/* Left menu column */}
                <div className="card" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '12px 16px 8px' }}>
                    Secciones del Perfil
                  </h4>
                  <div 
                    className={`profile-nav-item ${profileSubTab === 'general' ? 'active' : ''}`}
                    onClick={() => setProfileSubTab('general')}
                  >
                    📝 Info General
                  </div>
                  <div 
                    className={`profile-nav-item ${profileSubTab === 'identidad' ? 'active' : ''}`}
                    onClick={() => setProfileSubTab('identidad')}
                  >
                    🎨 Identidad Visual
                  </div>
                  <div 
                    className={`profile-nav-item ${profileSubTab === 'contacto' ? 'active' : ''}`}
                    onClick={() => setProfileSubTab('contacto')}
                  >
                    📞 Contacto y Ubicación
                  </div>
                  <div 
                    className={`profile-nav-item ${profileSubTab === 'redes' ? 'active' : ''}`}
                    onClick={() => setProfileSubTab('redes')}
                  >
                    🌐 Redes Sociales
                  </div>
                  <div 
                    className={`profile-nav-item ${profileSubTab === 'horarios' ? 'active' : ''}`}
                    onClick={() => setProfileSubTab('horarios')}
                  >
                    ⏰ Horarios de Atención
                  </div>
                  <div 
                    className={`profile-nav-item ${profileSubTab === 'financiero' ? 'active' : ''}`}
                    onClick={() => setProfileSubTab('financiero')}
                  >
                    💵 Info Financiera
                  </div>
                  <div 
                    className={`profile-nav-item ${profileSubTab === 'adicional' ? 'active' : ''}`}
                    onClick={() => setProfileSubTab('adicional')}
                  >
                    ✨ Info Adicional
                  </div>
                  <div 
                    className={`profile-nav-item ${profileSubTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setProfileSubTab('preview')}
                    style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '12px', fontWeight: '700' }}
                  >
                    👀 Vista Previa
                  </div>
                </div>

                {/* Right content column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* 1. INFORMACIÓN GENERAL */}
                  {profileSubTab === 'general' && (
                    <div className="card">
                      <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                        Información General del Negocio
                      </h3>
                      
                      <div className="form-group">
                        <label className="form-label">Nombre del Negocio <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                        <input 
                          type="text"
                          className="input-control"
                          value={profileForm.general.nombre}
                          onChange={(e) => updateProfileGeneral('nombre', e.target.value)}
                          placeholder="Ej. El Buen Corte"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Nombre Comercial (Opcional)</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.general.nombreComercial}
                            onChange={(e) => updateProfileGeneral('nombreComercial', e.target.value)}
                            placeholder="Ej. Distribuidora El Buen Corte"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Razón Social (Opcional)</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.general.razonSocial}
                            onChange={(e) => updateProfileGeneral('razonSocial', e.target.value)}
                            placeholder="Ej. El Buen Corte S.A.S."
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Tipo de Negocio</label>
                          <select 
                            className="input-control"
                            value={profileForm.general.tipoNegocio}
                            onChange={(e) => updateProfileGeneral('tipoNegocio', e.target.value)}
                          >
                            <option value="Carnicería">Carnicería</option>
                            <option value="Restaurante">Restaurante</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Tienda">Tienda</option>
                            <option value="Supermercado">Supermercado</option>
                            <option value="Distribuidora">Distribuidora</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Año de Creación</label>
                          <input 
                            type="number"
                            className="input-control"
                            value={profileForm.general.anoCreacion}
                            onChange={(e) => updateProfileGeneral('anoCreacion', e.target.value)}
                            placeholder="Ej. 2024"
                          />
                        </div>
                      </div>

                      {profileForm.general.tipoNegocio === 'Otro' && (
                        <div className="form-group">
                          <label className="form-label">Especifique el Tipo de Negocio</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.general.tipoNegocioOtro}
                            onChange={(e) => updateProfileGeneral('tipoNegocioOtro', e.target.value)}
                            placeholder="Ej. Fama / Frigorífico"
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Estado de la Operación</label>
                        <select 
                          className="input-control"
                          value={profileForm.general.estado}
                          onChange={(e) => updateProfileGeneral('estado', e.target.value)}
                        >
                          <option value="Activo">Activo</option>
                          <option value="Temporalmente cerrado">Temporalmente cerrado</option>
                          <option value="En mantenimiento">En mantenimiento</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Descripción del Negocio 
                          <span style={{ float: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {profileForm.general.descripcion.length} / 300 caracteres
                          </span>
                        </label>
                        <textarea 
                          className="input-control"
                          style={{ height: '100px', resize: 'none' }}
                          maxLength={300}
                          value={profileForm.general.descripcion}
                          onChange={(e) => updateProfileGeneral('descripcion', e.target.value)}
                          placeholder="Escribe una breve descripción institucional de tu negocio..."
                        />
                      </div>

                      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleSaveProfile}>
                          💾 Guardar Sección
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. IDENTIDAD VISUAL */}
                  {profileSubTab === 'identidad' && (
                    <div className="card">
                      <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                        Identidad Visual del Negocio
                      </h3>

                      <div className="form-group" style={{ marginBottom: '28px' }}>
                        <label className="form-label" style={{ marginBottom: '12px' }}>Logo del Negocio (PNG, JPG, máx 2MB)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          <label className="logo-upload-box">
                            {profileForm.identidad.logo ? (
                              <img src={profileForm.identidad.logo} alt="Logo" className="logo-preview-img" />
                            ) : (
                              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                📷 <br /> Sube Logo
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={(e) => handleFileChange(e, 'logo')} 
                            />
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label className="btn btn-secondary" style={{ display: 'inline-block', textAlign: 'center', cursor: 'pointer' }}>
                              Seleccionar Archivo
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileChange(e, 'logo')} 
                              />
                            </label>
                            {profileForm.identidad.logo && (
                              <button className="btn btn-danger" onClick={() => updateProfileIdentidad('logo', '')}>
                                Eliminar Logo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ marginBottom: '12px' }}>Imagen de Portada / Banner (PNG, JPG, máx 2MB)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <label className="cover-upload-box">
                            {profileForm.identidad.portada ? (
                              <img src={profileForm.identidad.portada} alt="Portada" className="cover-preview-img" />
                            ) : (
                              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                🖼️ <br /> Arrastra o selecciona una imagen de portada para reportes o perfil público
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={(e) => handleFileChange(e, 'portada')} 
                            />
                          </label>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                              Seleccionar Portada
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileChange(e, 'portada')} 
                              />
                            </label>
                            {profileForm.identidad.portada && (
                              <button className="btn btn-danger" onClick={() => updateProfileIdentidad('portada', '')}>
                                Eliminar Portada
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleSaveProfile}>
                          💾 Guardar Sección
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. CONTACTO Y UBICACIÓN */}
                  {profileSubTab === 'contacto' && (
                    <div className="card">
                      <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                        Datos de Contacto y Ubicación
                      </h3>

                      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Medios de Contacto
                      </h4>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Teléfono Principal</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.contacto.telefonoPrincipal}
                            onChange={(e) => updateProfileContacto('telefonoPrincipal', e.target.value)}
                            placeholder="Ej. +57 300 123 4567"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Teléfono Secundario (Opcional)</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.contacto.telefonoSecundario}
                            onChange={(e) => updateProfileContacto('telefonoSecundario', e.target.value)}
                            placeholder="Ej. (601) 123 4567"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">WhatsApp</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.contacto.whatsapp}
                            onChange={(e) => updateProfileContacto('whatsapp', e.target.value)}
                            placeholder="Ej. +57 300 123 4567"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nombre de Usuario (Nik)</label>
                          <input 
                            type="email"
                            className="input-control"
                            value={profileForm.contacto.email}
                            onChange={(e) => updateProfileContacto('email', e.target.value)}
                            placeholder="Ej. contacto@elbuencorte.com"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Sitio Web</label>
                        <input 
                          type="text"
                          className="input-control"
                          value={profileForm.contacto.sitioWeb}
                          onChange={(e) => updateProfileContacto('sitioWeb', e.target.value)}
                          placeholder="Ej. https://elbuencorte.com"
                        />
                      </div>

                      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '24px 0 16px' }}>
                        Dirección Física
                      </h4>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">País</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.ubicacion.pais}
                            onChange={(e) => updateProfileUbicacion('pais', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Departamento / Estado</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.ubicacion.departamento}
                            onChange={(e) => updateProfileUbicacion('departamento', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Ciudad</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.ubicacion.ciudad}
                            onChange={(e) => updateProfileUbicacion('ciudad', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Código Postal (Opcional)</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.ubicacion.codigoPostal}
                            onChange={(e) => updateProfileUbicacion('codigoPostal', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Dirección Completa</label>
                        <input 
                          type="text"
                          className="input-control"
                          value={profileForm.ubicacion.direccion}
                          onChange={(e) => updateProfileUbicacion('direccion', e.target.value)}
                          placeholder="Ej. Calle 80 #15-20"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Latitud (Mapa)</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.ubicacion.latitud}
                            onChange={(e) => updateProfileUbicacion('latitud', e.target.value)}
                            placeholder="Ej. 4.6097"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Longitud (Mapa)</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.ubicacion.longitud}
                            onChange={(e) => updateProfileUbicacion('longitud', e.target.value)}
                            placeholder="Ej. -74.0817"
                          />
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                        💡 Las coordenadas geográficas están listas para integrarse con servicios de mapas en el futuro.
                      </p>

                      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleSaveProfile}>
                          💾 Guardar Sección
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. REDES SOCIALES */}
                  {profileSubTab === 'redes' && (
                    <div className="card">
                      <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                        Presencia en Redes Sociales
                      </h3>

                      {profileForm.redes.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aún no has agregado ninguna red social.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                          {profileForm.redes.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                              <div>
                                <span style={{ fontWeight: '700', color: 'var(--accent-red)', marginRight: '8px' }}>{r.plataforma}:</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.usuario}</span>
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{r.url}</span>
                              </div>
                              <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleRemoveSocialNetwork(r.id)}>
                                Quitar
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '24px 0 12px' }}>
                        Agregar Red Social
                      </h4>

                      <div className="form-row" style={{ alignItems: 'end' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>Plataforma</label>
                          <select 
                            className="input-control"
                            value={newPlatform}
                            onChange={(e) => setNewPlatform(e.target.value)}
                          >
                            <option value="Facebook">Facebook</option>
                            <option value="Instagram">Instagram</option>
                            <option value="TikTok">TikTok</option>
                            <option value="YouTube">YouTube</option>
                            <option value="X / Twitter">X / Twitter</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>Usuario / Nombre</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Ej. @elbuencorte"
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0, flexGrow: 2 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>URL del Perfil</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="Ej. https://instagram.com/elbuencorte"
                          />
                        </div>
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          style={{ whiteSpace: 'nowrap' }}
                          onClick={() => {
                            if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                              alert("❌ La URL debe comenzar con http:// o https://")
                              return
                            }
                            handleAddSocialNetwork(newPlatform, newUsername || newPlatform, newUrl)
                            setNewUsername('')
                            setNewUrl('')
                          }}
                        >
                          ➕ Añadir
                        </button>
                      </div>

                      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleSaveProfile}>
                          💾 Guardar Sección
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5. HORARIOS DE ATENCIÓN */}
                  {profileSubTab === 'horarios' && (
                    <div className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>
                          Horarios de Atención
                        </h3>
                        <button 
                          className="btn btn-secondary"
                          type="button"
                          style={{ fontSize: '11px', padding: '6px 12px' }}
                          onClick={handleCopyBusinessHoursWeek}
                        >
                          📋 Aplicar horario de Lunes a Sábado
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.keys(profileForm.horarios).map(day => {
                          const h = profileForm.horarios[day]
                          return (
                            <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                              <div style={{ width: '120px', fontWeight: '700' }}>{day}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox"
                                    checked={!h.abierto}
                                    onChange={(e) => handleUpdateBusinessHour(day, 'abierto', !e.target.checked)}
                                  />
                                  Cerrado
                                </label>
                                
                                {h.abierto && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                      type="time"
                                      className="input-control"
                                      style={{ width: '120px', padding: '4px 8px' }}
                                      value={h.apertura}
                                      onChange={(e) => handleUpdateBusinessHour(day, 'apertura', e.target.value)}
                                    />
                                    <span>—</span>
                                    <input 
                                      type="time"
                                      className="input-control"
                                      style={{ width: '120px', padding: '4px 8px' }}
                                      value={h.cierre}
                                      onChange={(e) => handleUpdateBusinessHour(day, 'cierre', e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleSaveProfile}>
                          💾 Guardar Horarios
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 6. INFORMACIÓN FINANCIERA */}
                  {profileSubTab === 'financiero' && (
                    <div className="card">
                      <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                        Información Financiera Básica
                      </h3>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Moneda Principal</label>
                          <select 
                            className="input-control"
                            value={profileForm.financiero.moneda}
                            onChange={(e) => updateProfileFinanciero('moneda', e.target.value)}
                          >
                            <option value="COP">COP — Peso Colombiano</option>
                            <option value="USD">USD — Dólar Estadounidense</option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="MXN">MXN — Peso Mexicano</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Símbolo Monetario</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.financiero.simbolo}
                            onChange={(e) => updateProfileFinanciero('simbolo', e.target.value)}
                            placeholder="Ej. $"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Identificación Tributaria (NIT / RUT)</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.financiero.nit}
                            onChange={(e) => updateProfileFinanciero('nit', e.target.value)}
                            placeholder="Ej. 901.234.567-8"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Persona Responsable</label>
                          <input 
                            type="text"
                            className="input-control"
                            value={profileForm.financiero.responsable}
                            onChange={(e) => updateProfileFinanciero('responsable', e.target.value)}
                            placeholder="Nombre del propietario o gerente"
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleSaveProfile}
                          disabled={saveProfileSubmitting}
                          style={{ 
                            opacity: saveProfileSubmitting ? 0.65 : 1, 
                            cursor: saveProfileSubmitting ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          {saveProfileSubmitting ? '⏳ Guardando Sección...' : '💾 Guardar Sección'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 7. INFORMACIÓN ADICIONAL */}
                  {profileSubTab === 'adicional' && (
                    <div className="card">
                      <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                        Información Adicional e Institucional
                      </h3>

                      <div className="form-group">
                        <label className="form-label">Misión del Negocio</label>
                        <textarea 
                          className="input-control"
                          style={{ height: '80px', resize: 'none' }}
                          value={profileForm.adicional.mision}
                          onChange={(e) => updateProfileAdicional('mision', e.target.value)}
                          placeholder="Describe la misión o propósito central de tu negocio..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Visión del Negocio</label>
                        <textarea 
                          className="input-control"
                          style={{ height: '80px', resize: 'none' }}
                          value={profileForm.adicional.vision}
                          onChange={(e) => updateProfileAdicional('vision', e.target.value)}
                          placeholder="Describe hacia dónde proyectas el futuro del negocio..."
                        />
                      </div>

                      <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '24px 0 12px' }}>
                        Servicios Principales
                      </h4>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {profileForm.adicional.servicios.map(srv => (
                          <span key={srv} className="tag-badge">
                            {srv}
                            <button type="button" onClick={() => {
                              updateProfileAdicional('servicios', profileForm.adicional.servicios.filter(s => s !== srv))
                            }}>✕</button>
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                          type="text"
                          className="input-control"
                          value={newServiceTag}
                          onChange={(e) => setNewServiceTag(e.target.value)}
                          placeholder="Ej. Cortes Premium a domicilio"
                        />
                        <button 
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => {
                            if (!newServiceTag.trim()) return
                            if (profileForm.adicional.servicios.includes(newServiceTag.trim())) return
                            updateProfileAdicional('servicios', [...profileForm.adicional.servicios, newServiceTag.trim()])
                            setNewServiceTag('')
                          }}
                        >
                          Agregar Servicio
                        </button>
                      </div>

                      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleSaveProfile}
                          disabled={saveProfileSubmitting}
                          style={{ 
                            opacity: saveProfileSubmitting ? 0.65 : 1, 
                            cursor: saveProfileSubmitting ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          {saveProfileSubmitting ? '⏳ Guardando Sección...' : '💾 Guardar Sección'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 8. VISTA PREVIA (PROFESSIONAL SHEET MOCKUP) */}
                  {profileSubTab === 'preview' && (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      {/* Portada banner */}
                      <div className="preview-banner" style={{ backgroundImage: profileForm.identidad.portada ? `url(${profileForm.identidad.portada})` : 'linear-gradient(135deg, #1f1212, #0d0606)' }}>
                        <div className="preview-logo-wrapper">
                          {profileForm.identidad.logo ? (
                            <img src={profileForm.identidad.logo} alt="Logo" className="preview-logo-img" />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '28px', backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                              🥩
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="preview-header-content">
                        <div className="preview-title-row">
                          <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                              {profileForm.general.nombre || 'Nombre del Negocio'}
                            </h2>
                            {profileForm.general.nombreComercial && (
                              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                                Nombre Comercial: {profileForm.general.nombreComercial}
                              </p>
                            )}
                          </div>
                          
                          <span className={`preview-status-tag ${profileForm.general.estado.toLowerCase().replace(/ /g, '-')}`}>
                            {profileForm.general.estado}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          <div>🏢 {profileForm.general.tipoNegocio === 'Otro' ? profileForm.general.tipoNegocioOtro : profileForm.general.tipoNegocio}</div>
                          {profileForm.general.anoCreacion && <div>📅 Creado en {profileForm.general.anoCreacion}</div>}
                          {profileForm.general.razonSocial && <div>⚖️ Razón Social: {profileForm.general.razonSocial}</div>}
                        </div>

                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '20px', lineHeight: '1.6' }}>
                          {profileForm.general.descripcion || 'Sin descripción configurada.'}
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', padding: '24px' }}>
                        {/* Left column: Contact / Location */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
                              Contacto & Ubicación
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                              <div>📞 {profileForm.contacto.telefonoPrincipal || 'Sin teléfono'}</div>
                              {profileForm.contacto.telefonoSecundario && <div>☎️ {profileForm.contacto.telefonoSecundario}</div>}
                              <div>✉️ {profileForm.contacto.email || 'Sin correo electrónico'}</div>
                              {profileForm.contacto.sitioWeb && <div>🌐 <a href={profileForm.contacto.sitioWeb} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-red)', textDecoration: 'none' }}>{profileForm.contacto.sitioWeb}</a></div>}
                              <div>📍 {profileForm.ubicacion.direccion ? `${profileForm.ubicacion.direccion}, ${profileForm.ubicacion.ciudad}, ${profileForm.ubicacion.pais}` : 'Sin dirección'}</div>
                            </div>
                          </div>

                          {profileForm.contacto.whatsapp && (
                            <div>
                              <a 
                                href={`https://wa.me/${profileForm.contacto.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-secondary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', color: '#fff', border: 'none', fontWeight: '600' }}
                              >
                                💬 Contactar vía WhatsApp
                              </a>
                            </div>
                          )}

                          {profileForm.redes.length > 0 && (
                            <div>
                              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
                                Redes Sociales
                              </h4>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {profileForm.redes.map(r => (
                                  <a 
                                    key={r.id} 
                                    href={r.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-secondary" 
                                    style={{ fontSize: '11px', padding: '6px 12px' }}
                                  >
                                    {r.plataforma}: {r.usuario}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {profileForm.adicional.servicios.length > 0 && (
                            <div>
                              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
                                Servicios Principales
                              </h4>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {profileForm.adicional.servicios.map(srv => (
                                  <span key={srv} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                    {srv}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right column: Horarios / Adicional */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div>
                            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
                              Horarios de Atención
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                              {Object.keys(profileForm.horarios).map(day => {
                                const h = profileForm.horarios[day]
                                return (
                                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{day}</span>
                                    <span>
                                      {h.abierto ? `${h.apertura} — ${h.cierre}` : <span style={{ color: 'var(--accent-red)', fontWeight: '600' }}>Cerrado</span>}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {profileForm.financiero.nit && (
                            <div>
                              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
                                Datos Fiscales
                              </h4>
                              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div><strong>ID / NIT:</strong> {profileForm.financiero.nit}</div>
                                <div><strong>Responsable:</strong> {profileForm.financiero.responsable || 'No definido'}</div>
                                <div><strong>Moneda:</strong> {profileForm.financiero.moneda} ({profileForm.financiero.simbolo})</div>
                              </div>
                            </div>
                          )}

                          {(profileForm.adicional.mision || profileForm.adicional.vision) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                              {profileForm.adicional.mision && (
                                <div>
                                  <h5 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px' }}>Misión</h5>
                                  <p style={{ fontSize: '12px', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>"{profileForm.adicional.mision}"</p>
                                </div>
                              )}
                              {profileForm.adicional.vision && (
                                <div>
                                  <h5 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px' }}>Visión</h5>
                                  <p style={{ fontSize: '12px', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>"{profileForm.adicional.vision}"</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 🛒 TAB: TIENDA VIRTUAL */}
          {/* ================================================================= */}
          {activeTab === 'tienda' && (
            <div className="tienda-container animate-fade-in">
              {/* Hero Banner Comercial */}
              <div className="tienda-hero">
                <div className="tienda-hero-content">
                  <div className="tienda-hero-badge">
                    <SparklesIcon style={{ width: 14, height: 14 }} /> Boutique de Carnes & Cortes Selectos
                  </div>
                  <h1 className="tienda-hero-title">
                    {profileData?.general?.nombre || 'El Buen Corte'} — Tienda Virtual
                  </h1>
                  <p className="tienda-hero-subtitle">
                    {profileData?.general?.eslogan || 'Cortes madurados, porcionados y empacados con los más estrictos estándares de calidad. ¡Haz tu pedido online y recíbelo fresco!'}
                  </p>

                  <div className="tienda-hero-features">
                    <div className="tienda-hero-feature-pill">
                      <span>🥩</span> 100% Frescura Garantizada
                    </div>
                    <div className="tienda-hero-feature-pill">
                      <span>❄️</span> Cadena de Frío Controlada
                    </div>
                    <div className="tienda-hero-feature-pill">
                      <span>⚡</span> Despacho Rápido & Seguro
                    </div>
                    <div className="tienda-hero-feature-pill">
                      <span>⚖️</span> Peso Exacto al Gramo
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrusel de Productos Sugeridos / Destacados */}
              {suggestedProducts.length > 0 && (
                <section 
                  className="suggested-carousel-section"
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
                          <div className="suggested-slide-img-box" onClick={() => { setSelectedProductDetail(currentSuggested); setDetailModalQty(1); }}>
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
                                Stock: {currentSuggested.stock} kg
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
                                {formatCOP(currentSuggested.precioVenta)} <span>/ kg</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                                    <span className="tienda-stepper-val">{inCartItem.cantidad} kg</span>
                                    <button 
                                      type="button" 
                                      className="tienda-stepper-btn"
                                      disabled={inCartItem.cantidad >= Number(currentSuggested.stock)}
                                      onClick={() => handleUpdateCartQty(currentSuggested.id, inCartItem.cantidad + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleAddToCart(currentSuggested, 1)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontSize: '13.5px' }}
                                  >
                                    <ShoppingCartIcon style={{ width: 16, height: 16 }} />
                                    Agregar al Carrito
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Controles de Navegación del Carrusel */}
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

                  {/* Indicadores de Puntos */}
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

              {/* Barra de Búsqueda, Categorías Dinámicas y Ordenamiento */}
              <div className="tienda-toolbar-card">
                <div className="tienda-search-row">
                  <div className="tienda-search-wrapper">
                    <span className="tienda-search-icon">
                      <SearchIcon style={{ width: 18, height: 18 }} />
                    </span>
                    <input
                      type="text"
                      className="tienda-search-input"
                      placeholder="Buscar por nombre, corte o categoría (ej. Lomo, Costilla, Pollo)..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                    />
                  </div>

                  <div className="tienda-filters-right">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={storeOnlyInStock}
                        onChange={(e) => setStoreOnlyInStock(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#dc2626' }}
                      />
                      🟢 Solo Disponibles
                    </label>

                    <select
                      className="input-control"
                      style={{ width: 'auto', minWidth: '170px', padding: '8px 12px' }}
                      value={storeSortBy}
                      onChange={(e) => setStoreSortBy(e.target.value)}
                    >
                      <option value="featured">✨ Destacados</option>
                      <option value="price_asc">💵 Precio: Menor a Mayor</option>
                      <option value="price_desc">💎 Precio: Mayor a Menor</option>
                      <option value="name_asc">🔤 Nombre: A - Z</option>
                    </select>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowCartDrawer(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px' }}
                    >
                      <ShoppingCartIcon style={{ width: 17, height: 17 }} />
                      <span>Carrito ({cartTotalItems})</span>
                    </button>
                  </div>
                </div>

                {/* Categorías Generadas Dinámicamente del Inventario */}
                <div className="category-pills-row">
                  {storeCategories.map(cat => {
                    const count = cat === 'Todas' 
                      ? inventario.length 
                      : inventario.filter(i => i.categoria === cat).length

                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`category-store-pill ${storeCategory === cat ? 'active' : ''}`}
                        onClick={() => setStoreCategory(cat)}
                      >
                        {cat} <span style={{ opacity: 0.75, fontSize: '11px', marginLeft: '4px' }}>({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Catálogo de Productos */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    Catálogo de Cortes ({filteredStoreProducts.length} productos)
                  </h3>
                  {storeCategory !== 'Todas' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setStoreCategory('Todas')}
                    >
                      Mostrar Todos
                    </button>
                  )}
                </div>

                {filteredStoreProducts.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '18px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                      No encontramos productos que coincidan
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto 16px' }}>
                      Intenta buscar con otros términos o cambia la categoría seleccionada.
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setStoreSearch(''); setStoreCategory('Todas'); setStoreOnlyInStock(false); }}
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                ) : (
                  <div className="tienda-products-grid">
                    {filteredStoreProducts.map(product => {
                      const inCartItem = cart.find(c => c.id === product.id)
                      const isOutOfStock = Number(product.stock) <= 0
                      const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= Number(product.limiteMin || 5)

                      return (
                        <div key={product.id} className="tienda-card">
                          {/* Imagen y Badge de Stock */}
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
                                  onClick={() => handleUpdateCartQty(product.id, inCartItem.cantidad + 1)}
                                  title="Aumentar cantidad"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="tienda-card-btn-add"
                                onClick={() => handleAddToCart(product, 1)}
                              >
                                <ShoppingCartIcon style={{ width: 16, height: 16 }} />
                                Agregar al Carrito
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================================================================= */}
      {/* MODAL: REGISTRAR NUEVO PEDIDO */}
      {/* ================================================================= */}
      {showAddOrderModal && (() => {
        const calculatedOrderTotal = newOrderItems.reduce((acc, item) => {
          const prod = inventario.find(i => String(i.id) === String(item.productoId))
          const hasDcto = prod && Number(prod.descuento) > 0
          const price = prod ? (hasDcto ? (Number(prod.precioVenta) * (1 - Number(prod.descuento) / 100)) : Number(prod.precioVenta)) : 0
          const qty = Number(item.cantidad) || 0
          return acc + (price * qty)
        }, 0)

        return (
          <div className="modal-overlay" onClick={() => setShowAddOrderModal(false)}>
            <form 
              className="modal-card animate-fade-in" 
              onSubmit={handleCreateOrder} 
              onClick={(e) => e.stopPropagation()} 
              style={{ maxWidth: '580px', width: '92%', borderRadius: '20px', overflow: 'hidden' }}
            >
              <div className="modal-header" style={{ padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)'
                  }}>
                    🛒
                  </div>
                  <div>
                    <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                      Registrar Nuevo Pedido
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                      Ingresa el cliente y añade los cortes solicitados
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowAddOrderModal(false)}
                  style={{ 
                    border: 'none', 
                    background: '#e2e8f0', 
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%', 
                    fontSize: '14px', 
                    cursor: 'pointer', 
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 24px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                    Nombre del Cliente / Negocio *
                  </label>
                  <input 
                    type="text" 
                    className="input-control"
                    placeholder="Ej. Restaurante Don Elías / Carlos Martínez" 
                    value={newOrderClient}
                    onChange={(e) => setNewOrderClient(e.target.value)}
                    required
                    style={{ fontSize: '14px', padding: '0 14px', height: '44px', lineHeight: '44px' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', margin: 0 }}>
                      Cortes y Productos Solicitados:
                    </label>
                    <span style={{ fontSize: '12px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '99px', fontWeight: '700' }}>
                      {newOrderItems.length} {newOrderItems.length === 1 ? 'corte' : 'cortes'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px', scrollbarWidth: 'thin' }}>
                    {newOrderItems.map((item, index) => {
                      const selectedProd = inventario.find(i => String(i.id) === String(item.productoId))
                      const hasDcto = selectedProd && Number(selectedProd.descuento) > 0
                      const prodPrice = selectedProd 
                        ? (hasDcto ? (Number(selectedProd.precioVenta) * (1 - Number(selectedProd.descuento) / 100)) : Number(selectedProd.precioVenta)) 
                        : 0
                      const itemSubtotal = prodPrice * (Number(item.cantidad) || 0)

                      return (
                        <div 
                          key={index} 
                          style={{ 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px', 
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Item Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span>🥩</span> Corte #{index + 1}
                              {hasDcto && (
                                <span style={{ fontSize: '10.5px', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                                  🔥 {selectedProd.descuento}% OFF
                                </span>
                              )}
                            </span>
                            
                            {newOrderItems.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => handleRemoveOrderItemRow(index)}
                                style={{ 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 10px',
                                  background: '#fff1f2',
                                  color: '#e11d48',
                                  border: '1px solid #fecdd3',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                title="Eliminar este corte del pedido"
                              >
                                <span>🗑️</span> Quitar corte
                              </button>
                            )}
                          </div>

                          {/* Inputs Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '10px', alignItems: 'center' }}>
                            <div>
                              <select 
                                className="input-control"
                                value={item.productoId}
                                onChange={(e) => handleOrderItemChange(index, 'productoId', e.target.value)}
                                style={{ 
                                  fontSize: '13.5px', 
                                  fontWeight: '600',
                                  color: '#0f172a',
                                  backgroundColor: '#ffffff'
                                }}
                              >
                                {inventario.map(i => {
                                  const itemHasDcto = Number(i.descuento) > 0
                                  const effPrice = itemHasDcto ? (i.precioVenta * (1 - i.descuento / 100)) : i.precioVenta
                                  return (
                                    <option key={i.id} value={i.id}>
                                      {i.nombre} — ({formatCOP(effPrice)}/kg) {itemHasDcto ? `(🔥 ${i.descuento}% OFF)` : ''}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>
                            <div>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input 
                                  type="number" 
                                  min="0.1" 
                                  step="any"
                                  className="input-control"
                                  value={item.cantidad}
                                  onChange={(e) => handleOrderItemChange(index, 'cantidad', e.target.value)}
                                  required
                                  style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '700', 
                                    padding: '0 28px 0 10px', 
                                    height: '44px',
                                    textAlign: 'center' 
                                  }}
                                />
                                <span style={{ position: 'absolute', right: '8px', fontSize: '12px', color: '#64748b', fontWeight: '700', pointerEvents: 'none' }}>
                                  kg
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Subtotal footer of card */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12px', color: '#64748b' }}>
                            Subtotal: <strong style={{ color: '#0f172a', marginLeft: '4px' }}>{formatCOP(itemSubtotal)}</strong>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Add button */}
                  <button 
                    type="button" 
                    onClick={handleAddOrderItemRow}
                    style={{ 
                      width: '100%',
                      marginTop: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '2px dashed #cbd5e1',
                      background: '#f8fafc',
                      color: '#2563eb',
                      fontWeight: '700',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>➕</span> Agregar otro corte al pedido
                  </button>
                </div>

                {/* Total Preview */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    Total Estimado del Pedido:
                  </span>
                  <strong style={{ fontSize: '20px', color: '#dc2626', fontWeight: '900' }}>
                    {formatCOP(calculatedOrderTotal)}
                  </strong>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddOrderModal(false)} 
                  disabled={createOrderSubmitting}
                  style={{ padding: '10px 18px', borderRadius: '10px' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createOrderSubmitting}
                  style={{ 
                    padding: '10px 22px', 
                    borderRadius: '10px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    opacity: createOrderSubmitting ? 0.65 : 1,
                    cursor: createOrderSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {createOrderSubmitting ? '⏳ Guardando Pedido...' : '✓ Registrar Pedido'}
                </button>
              </div>
            </form>
          </div>
        )
      })()}

      {/* ================================================================= */}
      {/* MODAL: ABASTECER INVENTARIO */}
      {/* ================================================================= */}
      {showAddStockModal && (() => {
        const curProd = inventario.find(i => String(i.id) === String(newStockProduct)) || inventario[0]
        const u = normalizeUnit(curProd?.unidadMedida)
        const isUnd = u === 'und'
        const qtyNum = Number(newStockWeight) || 0
        const costNum = parseFormattedNumber(newStockCost) || Number(newStockCost) || 0
        const unitCostCalc = qtyNum > 0 && costNum > 0 ? Math.round(costNum / qtyNum) : 0
        const salePrice = Number(curProd?.precioVenta || 0)
        const profitPerUnit = salePrice > 0 && unitCostCalc > 0 ? (salePrice - unitCostCalc) : 0
        const marginPercent = unitCostCalc > 0 ? Math.round((profitPerUnit / unitCostCalc) * 100) : 0

        return (
          <div className="modal-overlay" onClick={() => !addStockSubmitting && setShowAddStockModal(false)}>
            <form 
              className="modal-card animate-fade-in" 
              onSubmit={handleAddStock}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '540px', width: '92%', maxHeight: 'calc(100vh - 28px)', display: 'flex', flexDirection: 'column', borderRadius: '22px', overflow: 'hidden' }}
            >
              <div className="modal-header" style={{ padding: '16px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                  }}>
                    📦
                  </div>
                  <div>
                    <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                      Abastecer Inventario
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                      Ingresa existencias y registra el monto real pagado al proveedor
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowAddStockModal(false)}
                  disabled={addStockSubmitting}
                  style={{ 
                    border: 'none', 
                    background: '#e2e8f0', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    fontSize: '14px', 
                    cursor: 'pointer', 
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
                {/* Producto Selector */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                    Producto / Corte a Abastecer *
                  </label>
                  <select 
                    className="input-control"
                    value={newStockProduct}
                    onChange={(e) => setNewStockProduct(e.target.value)}
                    style={{ fontSize: '14px', fontWeight: '600' }}
                  >
                    {inventario.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} — (Stock actual: {formatStockDisplay(i.stock, i.unidadMedida)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Banner de Referencia: Precio de Venta al Cliente */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                      Precio de Venta al Público (Cliente)
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {formatCOP(curProd?.precioVenta)} <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>/ {getUnitLabel(u)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '8px', fontWeight: '700' }}>
                    🔒 Precio de Venta Intacto
                  </span>
                </div>

                {/* Grid: Cantidad + Método de Pago */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                      Cantidad a Añadir *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        step={isUnd ? '1' : 'any'}
                        min={isUnd ? '1' : '0.1'}
                        className="input-control" 
                        value={newStockWeight}
                        onChange={(e) => setNewStockWeight(isUnd ? Math.round(Number(e.target.value)) : e.target.value)}
                        required
                        placeholder="Ej. 20"
                        style={{ fontSize: '15px', fontWeight: '700', padding: '0 45px 0 14px', height: '44px' }}
                      />
                      <span style={{ position: 'absolute', right: '12px', fontSize: '12px', color: '#64748b', fontWeight: '700', pointerEvents: 'none' }}>
                        {getUnitLabel(u)}
                      </span>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                      Método de Pago del Egreso
                    </label>
                    <select
                      className="input-control"
                      value={newStockPaymentMethod}
                      onChange={(e) => setNewStockPaymentMethod(e.target.value)}
                      style={{ fontSize: '13.5px', fontWeight: '600', height: '44px' }}
                    >
                      <option value="Efectivo">💵 Efectivo (Caja)</option>
                      <option value="Transferencia">📱 Transferencia</option>
                      <option value="Tarjeta">💳 Tarjeta / Datáfono</option>
                    </select>
                  </div>
                </div>

                {/* Costo Total Real de Compra (Proveedor) */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '800', fontSize: '13.5px', color: '#dc2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>💰 Costo Total Pagado al Proveedor (COP) *</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Egreso de Caja</span>
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="input-control" 
                      value={formatNumberWithDots(newStockCost)}
                      onChange={(e) => setNewStockCost(parseFormattedNumber(e.target.value))}
                      placeholder="Ej. 18.000"
                      required
                      style={{ 
                        fontSize: '17px', 
                        fontWeight: '800', 
                        padding: '0 50px 0 14px', 
                        height: '46px',
                        border: '2px solid #fca5a5',
                        backgroundColor: '#fffaf0'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '14px', fontSize: '13px', color: '#dc2626', fontWeight: '800', pointerEvents: 'none' }}>
                      COP
                    </span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Ingresa el monto total real que le pagaste al proveedor por estas {qtyNum} {getUnitLabel(u)}.
                  </p>
                </div>

                {/* Desglose & Margen Estimado si se ingresó costo */}
                {costNum > 0 && qtyNum > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <span style={{ color: '#166534', fontWeight: '600' }}>Costo Real por {getUnitLabel(u)}:</span>
                      <strong style={{ color: '#15803d' }}>{formatCOP(unitCostCalc)} / {getUnitLabel(u)}</strong>
                    </div>
                    {salePrice > unitCostCalc && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderTop: '1px dashed #bbf7d0', paddingTop: '4px', marginTop: '2px' }}>
                        <span style={{ color: '#166534', fontWeight: '600' }}>Margen de ganancia estimado:</span>
                        <strong style={{ color: '#047857' }}>+{formatCOP(profitPerUnit)} ({marginPercent}%)</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Cuadro aclaratorio de diferenciación financiera */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>💡</span>
                  <div style={{ fontSize: '11.5px', color: '#1e40af', lineHeight: 1.45 }}>
                    <strong>Diferenciación Financiera:</strong>
                    <div style={{ marginTop: '2px' }}>
                      • <strong>Precio de Venta ({formatCOP(curProd?.precioVenta)}):</strong> Lo que cobras al cliente.
                    </div>
                    <div>
                      • <strong>Costo de Compra ({formatCOP(costNum || 0)}):</strong> Lo que pagaste al proveedor. Este es el monto que se registrará como egreso y se descontará de caja.
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddStockModal(false)}
                  disabled={addStockSubmitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={addStockSubmitting}
                  style={{ 
                    opacity: addStockSubmitting ? 0.65 : 1, 
                    cursor: addStockSubmitting ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  {addStockSubmitting ? '⏳ Guardando Abastecimiento...' : '✓ Confirmar Abastecimiento'}
                </button>
              </div>
            </form>
          </div>
        )
      })()}

      {/* ================================================================= */}
      {/* 🏷️ MODAL: CONFIGURAR DESCUENTO EN PRODUCTO */}
      {/* ================================================================= */}
      {showDiscountModal && discountProduct && (
        <div className="modal-overlay" onClick={() => !discountLoading && setShowDiscountModal(false)}>
          <form 
            className="modal-card animate-fade-in" 
            onSubmit={handleSaveDiscount}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '92%', maxHeight: 'calc(100vh - 28px)', display: 'flex', flexDirection: 'column', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
          >
            <div className="modal-header" style={{ padding: '16px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
                }}>
                  🏷️
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    Aplicar Descuento a Producto
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
                    {discountProduct.nombre} ({discountProduct.categoria})
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDiscountModal(false)}
                disabled={discountLoading}
                style={{ 
                  border: 'none', 
                  background: '#e2e8f0', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  fontSize: '14px', 
                  cursor: 'pointer', 
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
              
              {/* Resumen de Precios */}
              <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Precio Base / Original</span>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    {formatCOP(discountProduct.precioVenta)} <span style={{ fontSize: '12px', color: '#64748b' }}>{getPriceUnitLabel(discountProduct.unidadMedida)}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase' }}>Precio con Descuento</span>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626' }}>
                    {formatCOP(discountProduct.precioVenta * (1 - (Number(discountPercent) || 0) / 100))}
                  </div>
                </div>
              </div>

              {/* Input de porcentaje */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Porcentaje de Descuento (%) *</span>
                  <span style={{ color: '#dc2626', fontWeight: '800' }}>{discountPercent}% OFF</span>
                </label>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#dc2626', cursor: 'pointer' }}
                  />
                  <div style={{ position: 'relative', width: '85px', flexShrink: 0 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="input-control"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                      style={{ fontSize: '16px', fontWeight: '800', textAlign: 'center', height: '40px', padding: '0 18px 0 6px' }}
                    />
                    <span style={{ position: 'absolute', right: '8px', top: '10px', fontWeight: '800', color: '#64748b', fontSize: '13px' }}>%</span>
                  </div>
                </div>

                {/* Quick discount presets */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {[0, 5, 10, 15, 20, 25, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: discountPercent === pct ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                        background: discountPercent === pct ? '#fee2e2' : '#ffffff',
                        color: discountPercent === pct ? '#991b1b' : '#334155',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {pct === 0 ? 'Sin Dcto (0%)' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px' }}>🔥</span>
                <p style={{ fontSize: '12px', color: '#b45309', margin: 0, lineHeight: '1.4' }}>
                  Este descuento se aplicará automáticamente en la <strong>Tienda Virtual</strong>, en la calculadora de ventas del <strong>Punto de Venta</strong> y en los pedidos de WhatsApp.
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDiscountModal(false)}
                disabled={discountLoading}
                style={{ padding: '9px 18px', borderRadius: '10px' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={discountLoading}
                style={{ 
                  padding: '10px 22px', 
                  borderRadius: '10px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderColor: '#dc2626',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)'
                }}
              >
                {discountLoading ? '⏳ Guardando...' : (discountPercent === 0 ? '✓ Quitar Descuento' : `✓ Aplicar ${discountPercent}% de Descuento`)}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: REGISTRAR MERMA */}
      {/* ================================================================= */}
      {showAddMermaModal && (
        <div className="modal-overlay" onClick={() => !addMermaSubmitting && setShowAddMermaModal(false)}>
          <form 
            className="modal-card animate-fade-in" 
            onSubmit={handleAddMerma}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%', maxHeight: 'calc(100vh - 28px)', display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden' }}
          >
            <div className="modal-header" style={{ padding: '16px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)'
                }}>
                  ⚠️
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    Registrar Pérdida (Merma)
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Descuenta del inventario mermas por recorte, hueso o secado
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddMermaModal(false)}
                disabled={addMermaSubmitting}
                style={{ 
                  border: 'none', 
                  background: '#e2e8f0', 
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%', 
                  fontSize: '14px', 
                  cursor: 'pointer', 
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                  Corte con Merma *
                </label>
                <select 
                  className="input-control"
                  value={newMermaProduct}
                  onChange={(e) => setNewMermaProduct(e.target.value)}
                  style={{ fontSize: '13.5px', fontWeight: '600' }}
                >
                  {inventario.map(i => (
                    <option key={i.id} value={i.id}>{i.nombre} — (Stock: {formatStockDisplay(i.stock, i.unidadMedida)})</option>
                  ))}
                </select>
              </div>

              {(() => {
                const curProd = inventario.find(i => String(i.id) === String(newMermaProduct)) || inventario[0]
                const u = normalizeUnit(curProd?.unidadMedida)
                const isUnd = u === 'und'

                return (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                      Cantidad de Merma a Descontar ({isUnd ? 'unidades' : u}) *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        step={isUnd ? '1' : 'any'}
                        min={isUnd ? '1' : '0.05'}
                        className="input-control" 
                        value={newMermaWeight}
                        onChange={(e) => setNewMermaWeight(isUnd ? Math.round(Number(e.target.value)) : e.target.value)}
                        required
                        style={{ fontSize: '15px', fontWeight: '700', padding: '0 45px 0 14px', height: '44px' }}
                      />
                      <span style={{ position: 'absolute', right: '12px', fontSize: '12px', color: '#64748b', fontWeight: '700', pointerEvents: 'none' }}>
                        {getUnitLabel(u)}
                      </span>
                    </div>
                  </div>
                )
              })()}

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                  Motivo / Observación *
                </label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Ej. Grasa recortada en mostrador, secado en cámara"
                  value={newMermaReason}
                  onChange={(e) => setNewMermaReason(e.target.value)}
                  required
                  style={{ fontSize: '14px', padding: '0 14px', height: '44px' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowAddMermaModal(false)}
                disabled={addMermaSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-danger"
                disabled={addMermaSubmitting}
                style={{ 
                  opacity: addMermaSubmitting ? 0.65 : 1, 
                  cursor: addMermaSubmitting ? 'not-allowed' : 'pointer' 
                }}
              >
                {addMermaSubmitting ? '⏳ Asentando Merma...' : '✓ Asentar Merma'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: REGISTRAR EGRESO */}
      {/* ================================================================= */}
      {showAddExpenseModal && (
        <div className="modal-overlay" onClick={() => !addExpenseSubmitting && setShowAddExpenseModal(false)}>
          <form 
            className="modal-card animate-fade-in" 
            onSubmit={handleAddExpense}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '92%', maxHeight: 'calc(100vh - 28px)', display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden' }}
          >
            <div className="modal-header" style={{ padding: '16px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
                }}>
                  💸
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    Registrar Gasto de Caja (Egreso)
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Registra salidas de dinero por compras, insumos o servicios
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddExpenseModal(false)}
                disabled={addExpenseSubmitting}
                style={{ 
                  border: 'none', 
                  background: '#e2e8f0', 
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%', 
                  fontSize: '14px', 
                  cursor: 'pointer', 
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                  Descripción del Gasto *
                </label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Ej. Bolsas plásticas, pago afilado de cuchillos, hielo"
                  value={newExpenseDesc}
                  onChange={(e) => setNewExpenseDesc(e.target.value)}
                  required
                  style={{ fontSize: '14px', padding: '0 14px', height: '44px' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                  Monto del Gasto (COP) *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '14px', fontSize: '15px', color: '#64748b', fontWeight: '800', pointerEvents: 'none' }}>$</span>
                  <input 
                    type="text" 
                    className="input-control" 
                    value={formatNumberWithDots(newExpenseAmount)}
                    onChange={(e) => setNewExpenseAmount(parseFormattedNumber(e.target.value))}
                    required
                    style={{ fontSize: '17px', fontWeight: '800', padding: '0 14px 0 32px', height: '44px', color: '#dc2626' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
                  Método de Pago Utilizado *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setNewExpensePaymentMethod('Efectivo')}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: newExpensePaymentMethod === 'Efectivo' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      background: newExpensePaymentMethod === 'Efectivo' ? '#fff1f2' : '#f8fafc',
                      color: newExpensePaymentMethod === 'Efectivo' ? '#991b1b' : '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '800',
                      fontSize: '13.5px',
                      transition: 'all 0.2s ease',
                      boxShadow: newExpensePaymentMethod === 'Efectivo' ? '0 2px 8px rgba(220, 38, 38, 0.2)' : 'none'
                    }}
                  >
                    <span>💵</span> Efectivo de Caja
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewExpensePaymentMethod('Transferencia')}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: newExpensePaymentMethod === 'Transferencia' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: newExpensePaymentMethod === 'Transferencia' ? '#eff6ff' : '#f8fafc',
                      color: newExpensePaymentMethod === 'Transferencia' ? '#1e40af' : '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '800',
                      fontSize: '13.5px',
                      transition: 'all 0.2s ease',
                      boxShadow: newExpensePaymentMethod === 'Transferencia' ? '0 2px 8px rgba(37, 99, 235, 0.2)' : 'none'
                    }}
                  >
                    <span>📲</span> Transferencia
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowAddExpenseModal(false)}
                disabled={addExpenseSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={addExpenseSubmitting}
                style={{ 
                  opacity: addExpenseSubmitting ? 0.65 : 1, 
                  cursor: addExpenseSubmitting ? 'not-allowed' : 'pointer' 
                }}
              >
                {addExpenseSubmitting ? '⏳ Asentando Egreso...' : '✓ Asentar Egreso'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🥩🛒 MODAL UNIFICADO: REGISTRAR VENTA (POS) / COBRO DE PEDIDO / INGRESO */}
      {/* ================================================================= */}
      {showAddIncomeModal && (
        <div className="modal-overlay" onClick={() => !posSubmitting && !chargeLoading && { setShowAddIncomeModal: () => { setShowAddIncomeModal(false); setPosSelectedOrder(null); } }.setShowAddIncomeModal()}>
          <div 
            className="modal-card animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: posSelectedOrder ? '560px' : '680px', width: '95%', maxHeight: 'calc(100vh - 28px)', display: 'flex', flexDirection: 'column', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.28)' }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '16px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: posSelectedOrder 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : (incomeMode === 'pos' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'),
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  {posSelectedOrder ? '💳' : (incomeMode === 'pos' ? '🥩' : '💰')}
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    {posSelectedOrder ? `Cobrar y Entregar Pedido #${posSelectedOrder.id}` : (incomeMode === 'pos' ? 'Punto de Venta / Registrar Venta' : 'Registrar Ingreso Adicional')}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
                    {posSelectedOrder 
                      ? `Cliente: ${posSelectedOrder.cliente} • Fecha: ${posSelectedOrder.fecha}` 
                      : (incomeMode === 'pos' ? 'Selecciona productos, calcula totales y descuenta inventario automáticamente' : 'Entradas de dinero extraordinarias, aportes o ajustes')}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => { setShowAddIncomeModal(false); setPosSelectedOrder(null); }}
                disabled={posSubmitting || chargeLoading}
                style={{ 
                  border: 'none', 
                  background: '#e2e8f0', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  fontSize: '14px', 
                  cursor: 'pointer', 
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* CASO A: COBRO Y ENTREGA DE PEDIDO DESDE GESTIÓN DE PEDIDOS */}
            {posSelectedOrder ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
                <div className="modal-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
                  
                  {/* SECCIÓN 1: RESUMEN DE CORTES (AZUL/SLATE) */}
                  <div style={{ background: '#f0f7ff', borderRadius: '14px', padding: '14px 16px', border: '1.5px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '10.5px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        1. Cortes del Pedido
                      </span>
                      <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: '700' }}>
                        ({posSelectedOrder.items?.length || 0} ítems a despachar)
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                      {posSelectedOrder.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '13px' }}>
                          <span style={{ fontWeight: '600' }}>{item.cantidad} {item.unidad || 'kg'} × {item.nombre}</span>
                          <strong style={{ color: '#0f172a' }}>{formatCOP((item.precio || item.precioVenta || 0) * item.cantidad)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECCIÓN 2: DATOS DEL CLIENTE */}
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '10px 14px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <div>👤 <strong>Cliente:</strong> {posSelectedOrder.cliente}</div>
                    {posSelectedOrder.direccion && <div>📍 <strong>Dirección:</strong> {posSelectedOrder.direccion}</div>}
                    {posSelectedOrder.notas && <div style={{ color: '#b45309' }}>📝 <strong>Notas:</strong> {posSelectedOrder.notas}</div>}
                  </div>

                  {/* SECCIÓN 3: PAGO Y CAMBIO */}
                  <div style={{ background: '#ecfdf5', borderRadius: '14px', padding: '14px 16px', border: '1.5px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#059669', color: '#ffffff', fontSize: '10.5px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        2. Liquidación y Cobro
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#065f46', fontWeight: '700' }}>
                        Selecciona el método recibido
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#15803d', display: 'block', marginBottom: '6px' }}>
                          Método de Pago:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setNewIncomePaymentMethod('Efectivo')}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: newIncomePaymentMethod === 'Efectivo' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                              background: newIncomePaymentMethod === 'Efectivo' ? '#dcfce7' : '#ffffff',
                              color: newIncomePaymentMethod === 'Efectivo' ? '#15803d' : '#475569',
                              fontWeight: '800',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            💵 Efectivo
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewIncomePaymentMethod('Transferencia')}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: newIncomePaymentMethod === 'Transferencia' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                              background: newIncomePaymentMethod === 'Transferencia' ? '#eff6ff' : '#ffffff',
                              color: newIncomePaymentMethod === 'Transferencia' ? '#1e40af' : '#475569',
                              fontWeight: '800',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            📲 Transf.
                          </button>
                        </div>
                      </div>

                      {/* Vueltas / Cambio Calculator */}
                      {newIncomePaymentMethod === 'Efectivo' ? (
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#15803d', display: 'block', marginBottom: '4px' }}>
                            Paga con ($):
                          </label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="Ej. 100.000"
                            value={formatNumberWithDots(posCashReceived)}
                            onChange={(e) => setPosCashReceived(parseFormattedNumber(e.target.value))}
                            style={{ height: '36px', fontSize: '13px', fontWeight: '800', padding: '0 8px', borderColor: '#86efac' }}
                          />
                          {(() => {
                            const cashNum = parseFormattedNumber(posCashReceived) || 0
                            if (cashNum > posSelectedOrder.total) {
                              return (
                                <div style={{ fontSize: '11.5px', color: '#15803d', fontWeight: '900', marginTop: '3px', background: '#dcfce7', padding: '3px 6px', borderRadius: '5px', textAlign: 'center' }}>
                                  🔄 Vueltas: {formatCOP(cashNum - posSelectedOrder.total)}
                                </div>
                              )
                            }
                            return null
                          })()}
                        </div>
                      ) : (
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#15803d', display: 'block', marginBottom: '4px' }}>
                            Referencia / Comprobante:
                          </label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="Ej. Nequi # 849302"
                            style={{ height: '36px', fontSize: '12px', padding: '0 8px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setShowAddIncomeModal(false); setPosSelectedOrder(null); }}
                    disabled={chargeLoading}
                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px' }}
                  >
                    Cancelar
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleConfirmChargeOrder}
                    disabled={chargeLoading}
                    style={{ 
                      padding: '9px 20px', 
                      borderRadius: '8px', 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      borderColor: '#059669', 
                      color: '#ffffff', 
                      fontWeight: '800',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    {chargeLoading ? '⏳ Procesando Cobro...' : `✓ Confirmar Cobro (${formatCOP(posSelectedOrder.total)}) & Entregar`}
                  </button>
                </div>
              </div>
            ) : (
              /* CASO B: REGISTRO NORMAL DESDE CONTABILIDAD / CAJA */
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
                {/* Mode Switcher Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f1f5f9', padding: '6px 16px', gap: '8px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setIncomeMode('pos')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: incomeMode === 'pos' ? '#ffffff' : 'transparent',
                      color: incomeMode === 'pos' ? '#dc2626' : '#64748b',
                      fontWeight: '800',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      boxShadow: incomeMode === 'pos' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>🛒</span> Venta de Mostrador (POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncomeMode('manual')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: incomeMode === 'manual' ? '#ffffff' : 'transparent',
                      color: incomeMode === 'manual' ? '#059669' : '#64748b',
                      fontWeight: '800',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      boxShadow: incomeMode === 'manual' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>💵</span> Ingreso Libre / Ajuste
                  </button>
                </div>

                {/* Modal Body */}
                {incomeMode === 'pos' ? (
                  <>
                  <div className="modal-body" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
                    
                    {/* 🟦 SECCIÓN 1: SELECCIÓN Y CONFIGURACIÓN DEL CORTE */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1.5px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
                      {/* Section Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ background: '#3b82f6', color: '#ffffff', fontSize: '10px', fontWeight: '900', padding: '2px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>
                            Paso 1
                          </span>
                          <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>Seleccionar Corte & Cantidad</strong>
                        </div>

                        {/* Category Filter Pills */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {['Todas', 'Carnes Rojas', 'Pollos', 'Embutidos', 'Cerdo'].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setPosCategory(cat)
                                const prodsInCat = inventario.filter(i => cat === 'Todas' || i.categoria === cat)
                                if (prodsInCat.length > 0) {
                                  setPosSelectedProdId(String(prodsInCat[0].id))
                                  if (cat === 'Embutidos') setPosUnit('und')
                                  else setPosUnit('kg')
                                }
                              }}
                              style={{
                                padding: '2px 7px',
                                borderRadius: '6px',
                                border: posCategory === cat ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                                background: posCategory === cat ? '#dbeafe' : '#ffffff',
                                color: posCategory === cat ? '#1d4ed8' : '#64748b',
                                fontWeight: '700',
                                fontSize: '10.5px',
                                cursor: 'pointer'
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Product & Quantity Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px', alignItems: 'flex-start' }}>
                        
                        {/* Select Product */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '3px' }}>
                            Corte / Producto:
                          </label>
                          <select
                            className="input-control"
                            value={posSelectedProdId}
                            onChange={(e) => {
                              setPosSelectedProdId(e.target.value)
                              const p = inventario.find(i => String(i.id) === e.target.value)
                              if (p) {
                                const u = normalizeUnit(p.unidadMedida || 'kg')
                                setPosUnit(u)
                                if (u === 'und') setPosQty(1)
                              }
                            }}
                            style={{ fontSize: '12.5px', fontWeight: '700', height: '36px', padding: '0 8px', borderColor: '#94a3b8' }}
                          >
                            <option value="" disabled>-- Selecciona un corte --</option>
                            {inventario
                              .filter(i => posCategory === 'Todas' || i.categoria === posCategory)
                              .map(p => {
                                const hasDcto = Number(p.descuento) > 0
                                const effPrice = hasDcto ? (p.precioVenta * (1 - p.descuento / 100)) : p.precioVenta
                                const uLabel = getPriceUnitLabel(p.unidadMedida)
                                return (
                                  <option key={p.id} value={p.id}>
                                    {p.nombre} — {formatCOP(effPrice)} {uLabel} {hasDcto ? `(🔥 ${p.descuento}% OFF)` : ''} (Stock: {formatStockDisplay(p.stock, p.unidadMedida)})
                                  </option>
                                )
                              })}
                          </select>
                        </div>

                        {/* Quantity & Unit */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                              Cantidad ({posUnit}):
                            </label>
                            {/* Unit Selector */}
                            {(() => {
                              const currentProd = inventario.find(i => String(i.id) === String(posSelectedProdId)) || inventario[0]
                              const allowedUnits = getAllowedSellUnits(currentProd?.unidadMedida)

                              return (
                                <div style={{ display: 'flex', gap: '2px', background: '#e2e8f0', padding: '1px', borderRadius: '5px' }}>
                                  {allowedUnits.map(u => (
                                    <button
                                      key={u}
                                      type="button"
                                      onClick={() => {
                                        setPosUnit(u)
                                        if (u === 'und') setPosQty(Math.max(1, Math.round(posQty)))
                                      }}
                                      style={{
                                        border: 'none',
                                        background: posUnit === u ? '#2563eb' : 'transparent',
                                        color: posUnit === u ? '#ffffff' : '#64748b',
                                        fontWeight: '800',
                                        fontSize: '10px',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {u}
                                    </button>
                                  ))}
                                </div>
                              )
                            })()}
                          </div>

                          <input
                            type="number"
                            step={posUnit === 'und' ? '1' : '0.25'}
                            min={posUnit === 'und' ? '1' : '0.1'}
                            className="input-control"
                            value={posQty}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0
                              setPosQty(posUnit === 'und' ? Math.max(1, Math.round(val)) : Math.max(0.1, val))
                            }}
                            style={{ fontSize: '14px', fontWeight: '800', height: '36px', textAlign: 'center', padding: '0 8px', borderColor: '#94a3b8' }}
                          />
                        </div>
                      </div>

                      {/* Quick increment buttons & Subtotal calculation preview */}
                      {(() => {
                        const currentProd = inventario.find(i => String(i.id) === String(posSelectedProdId)) || inventario[0]
                        if (!currentProd) return null
                        const unitPrice = calculateUnitPriceForSoldUnit(currentProd, posUnit)
                        const itemSubtotal = (Number(posQty) || 0) * unitPrice
                        const isOutOfStock = Number(currentProd.stock) <= 0
                        const isUnd = normalizeUnit(currentProd.unidadMedida) === 'und'

                        return (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700' }}>Rápido:</span>
                              {(isUnd ? [1, 2, 3, 5, 10] : [0.5, 1, 2, 3, 5]).map(q => (
                                <button
                                  key={q}
                                  type="button"
                                  onClick={() => setPosQty(q)}
                                  style={{
                                    padding: '2px 6px',
                                    borderRadius: '5px',
                                    border: '1px solid #cbd5e1',
                                    background: posQty === q ? '#0f172a' : '#ffffff',
                                    color: posQty === q ? '#ffffff' : '#334155',
                                    fontSize: '10.5px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  +{q}
                                </button>
                              ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                  Stock: <strong style={{ color: isOutOfStock ? '#dc2626' : '#059669' }}>{formatStockDisplay(currentProd.stock, currentProd.unidadMedida)}</strong>
                                  {Number(currentProd.descuento) > 0 && <span style={{ color: '#dc2626', marginLeft: '3px', fontWeight: '700' }}>(-{currentProd.descuento}%)</span>}
                                </div>
                                <div style={{ fontSize: '13.5px', fontWeight: '900', color: '#dc2626' }}>
                                  {formatCOP(itemSubtotal)}
                                </div>
                              </div>

                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={isOutOfStock}
                                onClick={handlePosAddToCart}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  background: isOutOfStock ? '#94a3b8' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                  borderColor: '#b91c1c',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  borderRadius: '6px',
                                  boxShadow: isOutOfStock ? 'none' : '0 2px 8px rgba(220, 38, 38, 0.3)'
                                }}
                              >
                                ➕ Agregar
                              </button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* 🟧 SECCIÓN 2: TICKET DE VENTA (PRODUCTOS AGREGADOS) */}
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px 14px', border: '1.5px solid #fed7aa', boxShadow: '0 2px 8px rgba(251, 146, 60, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ background: '#ea580c', color: '#ffffff', fontSize: '10px', fontWeight: '900', padding: '2px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>
                            Paso 2
                          </span>
                          <strong style={{ fontSize: '12.5px', color: '#9a3412' }}>
                            Ticket de Venta ({posCart.length} {posCart.length === 1 ? 'corte' : 'cortes'})
                          </strong>
                        </div>
                        {posCart.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setPosCart([])}
                            style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            ✕ Vaciar ticket
                          </button>
                        )}
                      </div>

                      {posCart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px 12px', background: '#fffaf5', borderRadius: '8px', border: '1px dashed #fdba74', color: '#9a3412' }}>
                          <span style={{ fontSize: '20px', display: 'block', marginBottom: '2px' }}>🛒</span>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>
                            El ticket está vacío.
                          </p>
                          <span style={{ fontSize: '11px', color: '#c2410c' }}>
                            Selecciona un corte arriba y haz clic en <strong>"➕ Agregar"</strong>.
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto', paddingRight: '2px' }}>
                          {posCart.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#fffaf5',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid #ffedd5'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  background: '#ea580c',
                                  color: '#ffffff',
                                  fontWeight: '800',
                                  fontSize: '11px',
                                  padding: '2px 6px',
                                  borderRadius: '5px'
                                }}>
                                  {item.cantidad} {item.unidad}
                                </span>
                                <div>
                                  <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0f172a' }}>
                                    {item.nombre}
                                  </div>
                                  <div style={{ fontSize: '10.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{formatCOP(item.precioUnitario)} / {item.unidad}</span>
                                    {item.descuento > 0 && (
                                      <span style={{ fontSize: '9.5px', background: '#fee2e2', color: '#dc2626', padding: '0 4px', borderRadius: '3px', fontWeight: '800' }}>
                                        🔥 {item.descuento}% OFF
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '13.5px', color: '#9a3412', fontWeight: '900' }}>
                                  {formatCOP(item.subtotal)}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => handlePosRemoveFromCart(idx)}
                                  style={{
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px'
                                  }}
                                  title="Quitar"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 🟩 SECCIÓN 3: FORMA DE PAGO Y VUELTAS */}
                    <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px 14px', border: '1.5px solid #86efac' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ background: '#16a34a', color: '#ffffff', fontSize: '10px', fontWeight: '900', padding: '2px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>
                          Paso 3
                        </span>
                        <strong style={{ fontSize: '12.5px', color: '#15803d' }}>
                          Forma de Cobro & Vueltas
                        </strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {/* Payment Method */}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', display: 'block', marginBottom: '4px' }}>
                            Método:
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setNewIncomePaymentMethod('Efectivo')}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: newIncomePaymentMethod === 'Efectivo' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                background: newIncomePaymentMethod === 'Efectivo' ? '#dcfce7' : '#ffffff',
                                color: newIncomePaymentMethod === 'Efectivo' ? '#15803d' : '#475569',
                                fontWeight: '800',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px'
                              }}
                            >
                              💵 Efectivo
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewIncomePaymentMethod('Transferencia')}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: newIncomePaymentMethod === 'Transferencia' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                background: newIncomePaymentMethod === 'Transferencia' ? '#eff6ff' : '#ffffff',
                                color: newIncomePaymentMethod === 'Transferencia' ? '#1e40af' : '#475569',
                                fontWeight: '800',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px'
                              }}
                            >
                              📲 Transf.
                            </button>
                          </div>
                        </div>

                        {/* Cash Change Calculator */}
                        {newIncomePaymentMethod === 'Efectivo' ? (
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', display: 'block', marginBottom: '4px' }}>
                              Paga con ($):
                            </label>
                            <input
                              type="text"
                              className="input-control"
                              placeholder="Ej. 50.000"
                              value={formatNumberWithDots(posCashReceived)}
                              onChange={(e) => setPosCashReceived(parseFormattedNumber(e.target.value))}
                              style={{ height: '34px', fontSize: '12.5px', fontWeight: '800', padding: '0 8px', borderColor: '#86efac' }}
                            />
                            {(() => {
                              const totalSale = posCart.reduce((sum, item) => sum + item.subtotal, 0)
                              const cashNum = parseFormattedNumber(posCashReceived) || 0
                              if (cashNum > totalSale && totalSale > 0) {
                                return (
                                  <div style={{ fontSize: '11.5px', color: '#15803d', fontWeight: '900', marginTop: '3px', background: '#dcfce7', padding: '3px 6px', borderRadius: '5px', textAlign: 'center' }}>
                                    🔄 Vueltas: {formatCOP(cashNum - totalSale)}
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>
                        ) : (
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', display: 'block', marginBottom: '4px' }}>
                              Cliente (Opcional):
                            </label>
                            <input
                              type="text"
                              className="input-control"
                              value={posClientName}
                              onChange={(e) => setPosClientName(e.target.value)}
                              placeholder="Cliente Mostrador"
                              style={{ height: '34px', fontSize: '12px', padding: '0 8px' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ⬛ SECCIÓN 4: TOTAL DE LA VENTA (DARK LUXURY) */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #334155',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.4px' }}>
                          Total de la Venta:
                        </span>
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>
                          {posCart.length} {posCart.length === 1 ? 'producto en ticket' : 'productos en ticket'}
                        </div>
                      </div>

                      <strong style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>
                        {formatCOP(posCart.reduce((sum, item) => sum + item.subtotal, 0))}
                      </strong>
                    </div>
                  </div>

                  {/* Footer for POS mode */}
                  <div className="modal-footer" style={{ padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddIncomeModal(false)}
                      disabled={posSubmitting}
                      style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px' }}
                    >
                      Cancelar
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleConfirmPosSale}
                      disabled={posSubmitting || posCart.length === 0}
                      style={{ 
                        padding: '9px 20px', 
                        borderRadius: '8px', 
                        background: posCart.length === 0 ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                        borderColor: '#059669', 
                        color: '#ffffff', 
                        fontWeight: '800',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: posCart.length === 0 ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      {posSubmitting ? '⏳ Registrando...' : `✓ Confirmar Venta (${formatCOP(posCart.reduce((sum, item) => sum + item.subtotal, 0))}) & Descontar Stock`}
                    </button>
                  </div>
                </>
              ) : (
                /* TAB 2: INGRESO MANUAL EXTRAORDINARIO */
                <form onSubmit={handleAddIncome} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
                  <div className="modal-body" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                        Concepto / Descripción del Ingreso *
                      </label>
                      <input 
                        type="text" 
                        className="input-control" 
                        placeholder="Ej. Abono cliente Don Carlos, Ajuste de caja, Propinas"
                        value={newIncomeDesc}
                        onChange={(e) => setNewIncomeDesc(e.target.value)}
                        required
                        style={{ fontSize: '13.5px', padding: '0 12px', height: '40px' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                        Monto del Ingreso (COP) *
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '12px', fontSize: '14px', color: '#64748b', fontWeight: '800', pointerEvents: 'none' }}>$</span>
                        <input 
                          type="text" 
                          className="input-control" 
                          value={formatNumberWithDots(newIncomeAmount)}
                          onChange={(e) => setNewIncomeAmount(parseFormattedNumber(e.target.value))}
                          required
                          style={{ fontSize: '16px', fontWeight: '800', padding: '0 12px 0 28px', height: '40px', color: '#059669' }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#1e293b' }}>
                        Método de Pago Recibido *
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setNewIncomePaymentMethod('Efectivo')}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: newIncomePaymentMethod === 'Efectivo' ? '2px solid #10b981' : '1px solid #cbd5e1',
                            background: newIncomePaymentMethod === 'Efectivo' ? '#ecfdf5' : '#f8fafc',
                            color: newIncomePaymentMethod === 'Efectivo' ? '#047857' : '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontWeight: '800',
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>💵</span> Efectivo
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewIncomePaymentMethod('Transferencia')}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: newIncomePaymentMethod === 'Transferencia' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: newIncomePaymentMethod === 'Transferencia' ? '#eff6ff' : '#f8fafc',
                            color: newIncomePaymentMethod === 'Transferencia' ? '#1e40af' : '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontWeight: '800',
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>📲</span> Transferencia
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer" style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddIncomeModal(false)} 
                      disabled={addIncomeSubmitting}
                      style={{ padding: '8px 16px', fontSize: '12.5px' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-success" 
                      disabled={addIncomeSubmitting}
                      style={{ 
                        padding: '8px 18px', 
                        fontSize: '12.5px', 
                        fontWeight: '800',
                        opacity: addIncomeSubmitting ? 0.65 : 1,
                        cursor: addIncomeSubmitting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {addIncomeSubmitting ? '⏳ Asentando Ingreso...' : '✓ Asentar Ingreso'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: AGREGAR PRODUCTO (DISEÑO COMPACTO Y RESPONSIVO) */}
      {/* ================================================================= */}
      {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <form 
            className="modal-card animate-fade-in" 
            onSubmit={handleCreateProduct}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '560px', 
              width: '94%', 
              maxHeight: 'calc(100vh - 28px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '20px', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
            }}
          >
            {/* Header */}
            <div className="modal-header" style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  boxShadow: '0 3px 8px rgba(220, 38, 38, 0.3)'
                }}>
                  🥩
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    Agregar Nuevo Producto / Corte
                  </h3>
                  <p style={{ fontSize: '11.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Crea un nuevo corte para el inventario y tienda virtual
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddProductModal(false)}
                style={{ 
                  border: 'none', 
                  background: '#e2e8f0', 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  fontSize: '13px', 
                  cursor: 'pointer', 
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="modal-body" style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '11px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
              {/* Nombre */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', marginBottom: '3px' }}>
                  Nombre del Corte / Producto *
                </label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Ej. Punta de Anca Madurada, Chorizo Criollo" 
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                  style={{ fontSize: '13.5px', padding: '0 12px', height: '38px' }}
                />
              </div>

              {/* Fila 2: Foto y Unidad de Medida (2 Columnas) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '12px', alignItems: 'start' }}>
                {/* Foto */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Foto del Corte</span>
                    {uploadingProdFoto && <span style={{ fontSize: '10px', color: '#2563eb' }}>Subiendo...</span>}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      border: '1.5px dashed #cbd5e1',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {newProdFoto ? (
                        <img src={newProdFoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '18px' }}>🥩</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <label 
                          className="btn btn-secondary" 
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '11px', 
                            cursor: 'pointer', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            flex: 1,
                            justifyContent: 'center'
                          }}
                        >
                          <span>📷</span> Foto
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={handleProductFotoChange}
                          />
                        </label>
                        {newProdFoto && (
                          <button 
                            type="button" 
                            className="btn btn-danger" 
                            style={{ padding: '4px 6px', fontSize: '10.5px', borderRadius: '6px' }}
                            onClick={() => setNewProdFoto('')}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <input 
                        type="text" 
                        className="input-control" 
                        placeholder="O pega URL (https://...)" 
                        value={newProdFoto.startsWith('data:') ? '' : newProdFoto}
                        onChange={(e) => setNewProdFoto(e.target.value)}
                        style={{ fontSize: '10.5px', height: '24px', padding: '0 6px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Unidad de Medida */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', marginBottom: '3px' }}>
                    Unidad de Medida *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {[
                      { id: 'kg', label: '🥩 kg', sub: 'Kilo' },
                      { id: 'lb', label: '⚖️ lb', sub: 'Libra' },
                      { id: 'und', label: '📦 und', sub: 'Unidad' }
                    ].map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setNewProdUnit(u.id)}
                        style={{
                          padding: '6px 2px',
                          borderRadius: '8px',
                          border: newProdUnit === u.id ? '2px solid #dc2626' : '1px solid #cbd5e1',
                          background: newProdUnit === u.id ? '#fef2f2' : '#ffffff',
                          color: newProdUnit === u.id ? '#991b1b' : '#334155',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '1px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <strong style={{ fontSize: '11.5px' }}>{u.label}</strong>
                        <span style={{ fontSize: '9px', color: '#64748b' }}>{u.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fila 3: Categoría y Precio (2 Columnas) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', marginBottom: '3px' }}>
                    Categoría *
                  </label>
                  <select 
                    className="input-control"
                    value={newProdCategory}
                    onChange={(e) => {
                      setNewProdCategory(e.target.value)
                      if (e.target.value === 'Embutidos') {
                        setNewProdUnit('und')
                      }
                    }}
                    style={{ fontSize: '12.5px', fontWeight: '600', height: '38px' }}
                  >
                    {['Carnes Rojas', 'Pollos', 'Embutidos', 'Cerdo', 'Otras'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', marginBottom: '3px' }}>
                    Precio Venta ($ {getPriceUnitLabel(newProdUnit)}) *
                  </label>
                  <input 
                    type="text" 
                    className="input-control" 
                    placeholder={newProdUnit === 'und' ? 'Ej. 4.000' : 'Ej. 28.000'} 
                    value={formatNumberWithDots(newProdPrice)}
                    onChange={(e) => setNewProdPrice(parseFormattedNumber(e.target.value))}
                    required
                    style={{ fontSize: '14.5px', fontWeight: '800', padding: '0 12px', height: '38px', color: '#dc2626' }}
                  />
                </div>
              </div>

              {/* Fila 4: Descripción Breve */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', marginBottom: '3px' }}>
                  Descripción Breve
                </label>
                <textarea 
                  className="input-control" 
                  placeholder="Ej. Corte suave y jugoso, ideal para asados y parrilla..." 
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  style={{ minHeight: '38px', height: '38px', fontFamily: 'inherit', resize: 'vertical', fontSize: '12px', padding: '6px 10px', lineHeight: 1.3 }}
                />
              </div>

              {/* Fila 5: Stock Inicial y Límite Mínimo (2 Columnas) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', marginBottom: '3px' }}>
                    Stock Inicial ({newProdUnit === 'und' ? 'unidades' : newProdUnit === 'lb' ? 'lb' : 'kg'}) *
                  </label>
                  <input 
                    type="number" 
                    step={newProdUnit === 'und' ? '1' : 'any'}
                    min="0"
                    className="input-control" 
                    placeholder={newProdUnit === 'und' ? 'Ej. 20' : 'Ej. 40'} 
                    value={newProdStock || ''}
                    onChange={(e) => setNewProdStock(newProdUnit === 'und' ? Math.round(Number(e.target.value)) : Number(e.target.value))}
                    style={{ fontSize: '13px', fontWeight: '700', padding: '0 12px', height: '38px' }}
                  />
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px', color: '#1e293b', marginBottom: '3px' }}>
                    Límite Mínimo ({newProdUnit === 'und' ? 'unidades' : newProdUnit === 'lb' ? 'lb' : 'kg'})
                  </label>
                  <input 
                    type="number" 
                    step={newProdUnit === 'und' ? '1' : 'any'}
                    min="0"
                    className="input-control" 
                    value={newProdLimitMin || ''}
                    onChange={(e) => setNewProdLimitMin(newProdUnit === 'und' ? Math.round(Number(e.target.value)) : Number(e.target.value))}
                    style={{ fontSize: '13px', fontWeight: '700', padding: '0 12px', height: '38px' }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer" style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowAddProductModal(false)} 
                disabled={addProductSubmitting}
                style={{ padding: '8px 16px', fontSize: '12.5px' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={addProductSubmitting || uploadingProdFoto}
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '12.5px', 
                  fontWeight: '800', 
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
                  boxShadow: '0 3px 10px rgba(220, 38, 38, 0.3)',
                  opacity: (addProductSubmitting || uploadingProdFoto) ? 0.65 : 1,
                  cursor: (addProductSubmitting || uploadingProdFoto) ? 'not-allowed' : 'pointer'
                }}
              >
                {addProductSubmitting ? '⏳ Guardando Producto...' : (uploadingProdFoto ? '⏳ Subiendo Foto...' : '✓ Guardar Producto')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: CIERRE DE CAJA (ARQUEO Y RECIBO DIGITAL) */}
      {/* ================================================================= */}
      {showCierreModal && cierreResult && (
        <div className="modal-overlay" onClick={() => setShowCierreModal(false)}>
          <div 
            className="modal-card animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '460px', width: '92%', maxHeight: 'calc(100vh - 28px)', display: 'flex', flexDirection: 'column', borderRadius: '20px', overflow: 'hidden' }}
          >
            <div className="modal-header" style={{ padding: '16px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                }}>
                  🧾
                </div>
                <div>
                  <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    Comprobante de Cierre de Caja
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Resumen financiero y balance oficial del turno
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCierreModal(false)}
                style={{ 
                  border: 'none', 
                  background: '#e2e8f0', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  fontSize: '14px', 
                  cursor: 'pointer', 
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '18px 22px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
              <div className="receipt-wrapper" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px' }}>
                <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>EL BUEN CORTE</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SOFTWARE DE GESTIÓN INTELIGENTE</div>
                  <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '800', marginTop: '2px' }}>CIERRE DE TURNO OFICIAL</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Fecha:</span>
                    <strong>{cierreResult.fecha}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Hora:</span>
                    <strong>{cierreResult.hora}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Operador:</span>
                    <strong>{currentUser?.nombre || 'Administrador'}</strong>
                  </div>

                  <div style={{ margin: '8px 0', borderTop: '1px dashed #e2e8f0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>(+) Base Apertura:</span>
                    <strong>{formatCOP(cierreResult.baseApertura)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#059669' }}>(+) Ventas del Turno ({cierreResult.numVentas}):</span>
                    <strong style={{ color: '#059669' }}>{formatCOP(cierreResult.ingresosTotales)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#dc2626' }}>(-) Egresos del Turno ({cierreResult.numEgresos}):</span>
                    <strong style={{ color: '#dc2626' }}>-{formatCOP(cierreResult.egresosTotales)}</strong>
                  </div>

                  <div style={{ margin: '8px 0', borderTop: '2px solid #0f172a', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>(=) Saldo Final en Caja:</span>
                    <strong style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>{formatCOP(cierreResult.totalEfectivo)}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '11.5px', color: '#64748b' }}>
                  <div style={{ fontWeight: '800', color: '#059669' }}>✓ ¡CAJA CUADRADA EXITOSAMENTE!</div>
                  <div style={{ marginTop: '2px' }}>El turno anterior ha quedado cerrado en el sistema.</div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => {
                  setShowCierreModal(false)
                  const newBase = prompt('Ingrese la Base de Apertura para el nuevo turno:', '300000')
                  if (newBase !== null) {
                    handleOpenCaja(Number(newBase) || 300000)
                  }
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                <StoreIcon style={{ width: '18px', height: '18px' }} /> Abrir Nuevo Turno de Caja
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-secondary">{selectedProductDetail.categoria || 'Carnes'}</span>
                    {Number(selectedProductDetail.stock) > 0 ? (
                      <span className="badge badge-success">Disponible: {selectedProductDetail.stock} kg</span>
                    ) : (
                      <span className="badge badge-danger">Agotado</span>
                    )}
                  </div>

                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626' }}>
                    {formatCOP(selectedProductDetail.precioVenta)} <span style={{ fontSize: '13px', color: '#64748b' }}>/ kg</span>
                  </div>

                  <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>
                    {selectedProductDetail.descripcion || 'Corte fresco de primera calidad, preparado y almacenado bajo estrictos controles sanitarios para conservar toda su jugosidad y textura.'}
                  </p>

                  {Number(selectedProductDetail.stock) > 0 && (
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Cantidad a agregar (kg):</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="number"
                          min="1"
                          max={Number(selectedProductDetail.stock)}
                          step="any"
                          className="input-control"
                          value={detailModalQty}
                          onChange={(e) => setDetailModalQty(Math.max(1, Math.min(Number(selectedProductDetail.stock), Number(e.target.value))))}
                          style={{ width: '100px', fontWeight: '700' }}
                        />
                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                          Subtotal: <strong>{formatCOP(selectedProductDetail.precioVenta * (detailModalQty || 1))}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          handleAddToCart(selectedProductDetail, Number(detailModalQty) || 1);
                          setSelectedProductDetail(null);
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                      >
                        <ShoppingCartIcon style={{ width: 18, height: 18 }} />
                        Agregar al Carrito ({detailModalQty || 1} kg)
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
                    {formatCOP(item.precioVenta)} / kg
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
                      <span className="tienda-stepper-val" style={{ fontSize: '12px' }}>{item.cantidad} kg</span>
                      <button
                        type="button"
                        className="tienda-stepper-btn"
                        style={{ width: '22px', height: '22px', fontSize: '13px' }}
                        disabled={item.cantidad >= item.stockMax}
                        onClick={() => handleUpdateCartQty(item.id, item.cantidad + 1)}
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
      {/* 💳 MODAL: REALIZAR PEDIDO (CHECKOUT) */}
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

              {/* Resumen de Productos */}
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
                  <span>Total Liquidado:</span>
                  <span style={{ color: '#dc2626' }}>{formatCOP(cartTotalPrice)}</span>
                </div>
              </div>

              {/* Formulario de Datos del Cliente */}
              <div className="form-group">
                <label className="form-label">Nombre del Cliente / Negocio *</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Ej. Restaurante Don Elías / María Gómez"
                  value={checkoutForm.cliente}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, cliente: e.target.value })}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ej. 322 206 7870"
                    value={checkoutForm.telefono}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, telefono: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Método de Pago Preferido</label>
                  <select
                    className="input-control"
                    value={checkoutForm.metodoPago}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, metodoPago: e.target.value })}
                  >
                    <option value="Efectivo">💵 Efectivo al Entregar</option>
                    <option value="Transferencia">📲 Transferencia Nequi / Daviplata</option>
                    <option value="Tarjeta">💳 Datáfono / Tarjeta</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dirección de Entrega / Sede</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Ej. Calle 45 # 12-34 o 'Recoger en Tienda'"
                  value={checkoutForm.direccion}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, direccion: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notas o Instrucciones para el Carnicero (Opcional)</label>
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
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto' }}>
                ✓
              </div>
            </div>

            <div className="modal-body" style={{ paddingTop: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                ¡Pedido Realizado con Éxito!
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '16px' }}>
                Tu orden ha sido registrada en el sistema y descontada del inventario de forma segura.
              </p>

              {/* Recibo digital */}
              <div className="order-success-receipt" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Código de Pedido:</span>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#dc2626' }}>{orderSuccessData.id}</div>
                  </div>
                  <span className="badge badge-pending">Estado: Pendiente</span>
                </div>

                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  <div><strong>Cliente:</strong> {orderSuccessData.cliente}</div>
                  <div><strong>Fecha:</strong> {orderSuccessData.fecha}</div>
                  {orderSuccessData.clienteInfo?.metodoPago && (
                    <div><strong>Método de Pago:</strong> {orderSuccessData.clienteInfo.metodoPago}</div>
                  )}
                  {orderSuccessData.clienteInfo?.direccion && (
                    <div><strong>Dirección:</strong> {orderSuccessData.clienteInfo.direccion}</div>
                  )}
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>
                    Detalle de Cortes:
                  </div>
                  {orderSuccessData.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                      <span>{item.cantidad} kg × {item.nombre}</span>
                      <strong>{formatCOP(item.precio * item.cantidad)}</strong>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '15px', fontWeight: '900' }}>
                    <span>Total Pagado / Por Cobrar:</span>
                    <span style={{ color: '#dc2626' }}>{formatCOP(orderSuccessData.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setOrderSuccessData(null)}
              >
                Seguir Comprando
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  setOrderSuccessData(null);
                  setActiveTab('pedidos');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ClipboardIcon style={{ width: 16, height: 16 }} />
                Ver en Gestión de Pedidos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 📋 MODAL: DETALLE Y PREPARACIÓN DE PEDIDO (PARA EL CARNICERO) */}
      {/* ================================================================= */}
      {selectedOrderDetail && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetail(null)}>
          <div 
            className="modal-card animate-fade-in" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '560px', 
              width: '94%', 
              maxHeight: 'calc(100vh - 28px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '22px', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.28)'
            }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: '16px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                }}>
                  🥩
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                      Pedido #{selectedOrderDetail.id}
                    </h3>
                    <span className={`badge ${
                      selectedOrderDetail.estado === 'Pendiente' ? 'badge-pending' : 
                      selectedOrderDetail.estado === 'Entregado' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {selectedOrderDetail.estado}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Fecha: {selectedOrderDetail.fecha}
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setSelectedOrderDetail(null)}
                style={{ 
                  border: 'none', 
                  background: '#e2e8f0', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  fontSize: '14px', 
                  cursor: 'pointer', 
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '16px', flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
              
              {/* Info del Cliente */}
              <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px 18px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.4px' }}>
                  👤 Datos del Cliente & Entrega
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#0f172a' }}>
                    {selectedOrderDetail.cliente}
                  </div>
                  {selectedOrderDetail.telefono && (
                    <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📞 {selectedOrderDetail.telefono}</span>
                      <a 
                        href={`https://wa.me/${selectedOrderDetail.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#22c55e',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  )}
                  {selectedOrderDetail.direccion && (
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      📍 <strong>Dirección:</strong> {selectedOrderDetail.direccion}
                    </div>
                  )}
                  {selectedOrderDetail.metodoPago && (
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      💳 <strong>Método de pago:</strong> {selectedOrderDetail.metodoPago}
                    </div>
                  )}
                  {selectedOrderDetail.notas && (
                    <div style={{ fontSize: '13px', color: '#b45309', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fef3c7', marginTop: '4px' }}>
                      📝 <strong>Notas / Indicaciones del cliente:</strong> {selectedOrderDetail.notas}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Cortes a Preparar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    🥩 Cortes a Preparar y Despachar ({selectedOrderDetail.items?.length || 0})
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Pesar y empaquetar según solicitud
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '2px' }}>
                  {selectedOrderDetail.items?.map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: '#ffffff', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          fontWeight: '900', 
                          fontSize: '13.5px', 
                          padding: '5px 12px', 
                          borderRadius: '8px',
                          border: '1px solid #fecaca'
                        }}>
                          {item.cantidad} kg
                        </span>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '14.5px', color: '#0f172a' }}>
                            {item.nombre}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {formatCOP(item.precio || item.precioVenta || 0)} / kg
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '900', fontSize: '15px', color: '#dc2626' }}>
                          {formatCOP((item.precio || item.precioVenta || 0) * item.cantidad)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total General */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                padding: '14px 18px', 
                borderRadius: '14px', 
                border: '1px solid #e2e8f0', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Total a Cobrar:
                </span>
                <strong style={{ fontSize: '22px', fontWeight: '900', color: '#dc2626' }}>
                  {formatCOP(selectedOrderDetail.total)}
                </strong>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setSelectedOrderDetail(null)}
                style={{ padding: '9px 18px', borderRadius: '10px' }}
              >
                Cerrar
              </button>

              {selectedOrderDetail.estado === 'Pendiente' && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '9px 20px', 
                    borderRadius: '10px', 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    borderColor: '#059669', 
                    color: '#ffffff', 
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => {
                    const order = selectedOrderDetail
                    setSelectedOrderDetail(null)
                    handleOpenChargeOrderModal(order)
                  }}
                >
                  💳 Cobrar & Entregar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// Componente de Login con selector de modo SuperAdmin / Sistema POS
function LoginView({
  loginUsername, setLoginUsername,
  loginPassword, setLoginPassword,
  handleLogin,
  authLoading, authError, setAuthError,
  showPassword, setShowPassword
}) {
  const [loginMode, setLoginMode] = useState('regular') // 'regular' | 'superadmin'
  const [showLogin, setShowLogin] = useState(false)

  if (!showLogin) {
    return (
      <div className="auth-wrapper" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #451a03 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div style={{ zIndex: 1, textAlign: 'center', color: 'white', maxWidth: '600px', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🥩</div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.03em' }}>El Buen Corte</h1>
          <p style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '40px', lineHeight: '1.6' }}>
            Bienvenido al Sistema de Gestión POS y Control Administrativo. 
            Administra tus ventas, inventario y usuarios desde una sola plataforma.
          </p>
          <button 
            onClick={() => setShowLogin(true)}
            className="btn btn-primary"
            style={{ padding: '16px 40px', fontSize: '18px', borderRadius: '50px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', boxShadow: '0 10px 25px rgba(217,119,6,0.4)' }}
          >
            Ingresar al Sistema
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Lado Izquierdo: Branding & Beneficios */}
        <div className="auth-banner" style={{
          background: loginMode === 'superadmin' 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #78350f 100%)' 
            : undefined
        }}>
          <div className="auth-banner-overlay" />
          <div className="auth-brand">
            <div className="auth-brand-logo">{loginMode === 'superadmin' ? '👑' : '🥩'}</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em' }}>
                {loginMode === 'superadmin' ? 'Consola SuperAdmin' : 'El Buen Corte'}
              </div>
              <div style={{ fontSize: '11px', color: loginMode === 'superadmin' ? '#fbbf24' : '#fb7185', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {loginMode === 'superadmin' ? 'Portal de Gestión SaaS & Usuarios' : 'Sistema POS & Gestión PostgreSQL'}
              </div>
            </div>
          </div>

          <div className="auth-banner-content">
            <h2 className="auth-banner-title">
              {loginMode === 'superadmin' 
                ? 'Control Maestro y Administración Global' 
                : 'Control y Seguridad Total para tu Negocio'}
            </h2>
            <p className="auth-banner-desc">
              {loginMode === 'superadmin'
                ? 'Accede a la consola ejecutiva independiente para registrar clientes, activar/bloquear usuarios y restablecer contraseñas.'
                : 'Accede al sistema de gestión inteligente con encriptación JWT y persistencia en base de datos.'}
            </p>

            <div className="auth-feature-list">
              {loginMode === 'superadmin' ? (
                <>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><CrownIcon /></div>
                    <span>Módulo 100% independiente del sistema de tienda</span>
                  </div>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><UserCheckIcon /></div>
                    <span>Bloqueo y activación instantánea de cuentas</span>
                  </div>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><KeyIcon /></div>
                    <span>Recuperación y reseteo rápido de contraseñas</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><ShieldCheckIcon /></div>
                    <span>Autenticación BcryptJS & Encriptación JWT</span>
                  </div>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><StoreIcon /></div>
                    <span>Control de Arqueo, Caja y Aperturas de Turno</span>
                  </div>
                  <div className="auth-feature-item">
                    <div className="auth-feature-icon"><ScaleIcon /></div>
                    <span>Calculadora Inteligente de Desposte de Res</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#94a3b8' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            Servidor PostgreSQL Conectado
          </div>
        </div>

        {/* Lado Derecho: Formulario de Login */}
        <div className="auth-form-container">
          <div>
            {loginMode === 'superadmin' ? (
              <div style={{ marginBottom: '16px' }}>
                <span className="superadmin-hero-badge">
                  <CrownIcon style={{ width: 13, height: 13 }} /> ACCESO EXCLUSIVO SUPERADMIN
                </span>
                <h3 className="auth-form-title" style={{ marginTop: '8px' }}>Portal SuperAdmin</h3>
                <p className="auth-form-subtitle">Ingresa con tus credenciales maestras de propietario</p>
              </div>
            ) : (
              <div className="auth-form-header">
                <h3 className="auth-form-title">Iniciar Sesión</h3>
                <p className="auth-form-subtitle">Ingresa tus credenciales autorizadas para acceder al sistema POS</p>
              </div>
            )}

            {authError && (
              <div className="auth-alert-error">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e, loginMode)}>
              <div className="form-group">
                <label className="form-label">Nombre de Usuario (Nik)</label>
                <div className="input-with-icon">
                  <span className="input-icon-left"><MailIcon /></span>
                  <input
                    type="text"
                    required
                    className="input-control input-control-padded"
                    placeholder={loginMode === 'superadmin' ? 'ej. superadmin' : 'ej. usuario123'}
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="input-with-icon">
                  <span className="input-icon-left"><LockIcon /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-control input-control-padded input-control-padded-right"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {loginMode === 'superadmin' ? (
                <button
                  type="submit"
                  className="btn"
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                  disabled={authLoading}
                >
                  <CrownIcon style={{ width: 16, height: 16 }} />
                  {authLoading ? 'Verificando credenciales...' : 'Acceder al Portal SuperAdmin'}
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px', padding: '12px', fontSize: '15px' }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Verificando...' : 'Ingresar al Sistema POS'}
                </button>
              )}
            </form>

            {/* Alternador de Modo de Login */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              {loginMode === 'regular' ? (
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    ¿Eres el propietario o Super Administrador?
                  </p>
                  <button
                    type="button"
                    className="login-mode-switch-btn btn-mode-to-superadmin"
                    onClick={() => {
                      setLoginMode('superadmin')
                      setLoginUsername('')
                      setLoginPassword('')
                      if (setAuthError) setAuthError('')
                    }}
                  >
                    <CrownIcon style={{ width: '15px', height: '15px', color: '#b45309' }} />
                    Ingresar como SuperAdmin (Portal Maestro)
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    className="login-mode-switch-btn btn-mode-to-regular"
                    onClick={() => {
                      setLoginMode('regular')
                      setLoginUsername('')
                      setLoginPassword('')
                      if (setAuthError) setAuthError('')
                    }}
                  >
                    ← Volver al Acceso Regular del Sistema POS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PORTAL SUPERADMIN INDEPENDIENTE (PÁGINA EXCLUSIVA 100% FUERA DEL SISTEMA POS)
// ============================================================================
function SuperAdminPortal({
  currentUser,
  handleLogout,
  API_BASE,
  getAuthHeaders
}) {
  const [usersList, setUsersList] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userActionSuccess, setUserActionSuccess] = useState('')
  const [userActionError, setUserActionError] = useState('')

  // Form states: Registrar Nuevo Consumidor / Usuario
  const [regModalOpen, setRegModalOpen] = useState(false)
  const [regNombre, setRegNombre] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRol, setRegRol] = useState('admin')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  // Filters & Search
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')

  // Modal: Editar Usuario
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [editUserId, setEditUserId] = useState(null)
  const [editUserNombre, setEditUserNombre] = useState('')
  const [editUserEmail, setEditUserEmail] = useState('')
  const [editUserUsername, setEditUserUsername] = useState('')
  const [editUserRol, setEditUserRol] = useState('admin')
  const [editUserActivo, setEditUserActivo] = useState(true)
  const [editUserLoading, setEditUserLoading] = useState(false)
  const [editUserError, setEditUserError] = useState('')

  // Modal: Restablecer / Recuperar Contraseña
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetUserId, setResetUserId] = useState(null)
  const [resetUserName, setResetUserName] = useState('')
  const [resetUserEmail, setResetUserEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(true)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [copiedNotification, setCopiedNotification] = useState(false)

  // Generador de Contraseña Segura
  const generatePass = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
    let pass = ''
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pass
  }

  // Cargar lista de usuarios
  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const res = await fetch(`${API_BASE}/users`, {
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error('Error al cargar lista de usuarios')
      const data = await res.json()
      setUsersList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setUserActionError('No se pudo cargar la lista de usuarios desde PostgreSQL.')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const notifySuccess = (msg) => {
    setUserActionSuccess(msg)
    setUserActionError('')
    setTimeout(() => setUserActionSuccess(''), 5000)
  }

  const notifyError = (msg) => {
    setUserActionError(msg)
    setUserActionSuccess('')
    setTimeout(() => setUserActionError(''), 6000)
  }

  // Registrar nuevo usuario
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegLoading(true)
    setUserActionError('')
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          nombre: regNombre,
          email: regEmail,
          username: regUsername,
          password: regPassword,
          rol: regRol,
          activo: true
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar usuario')
      notifySuccess(`¡Usuario "${data.user.nombre}" registrado exitosamente como ${data.user.rol.toUpperCase()}!`)
      setRegNombre('')
      setRegEmail('')
      setRegPassword('')
      setRegRol('admin')
      setShowRegPassword(false)
      setRegModalOpen(false) // Close modal on success
      fetchUsers()
    } catch (err) {
      notifyError(err.message)
    } finally {
      setRegLoading(false)
    }
  }

  // Bloquear o Activar usuario
  const handleToggleStatus = async (user) => {
    const actionText = user.activo ? 'bloquear y suspender el acceso de' : 'reactivar el acceso de'
    if (!window.confirm(`¿Estás seguro de que deseas ${actionText} a "${user.nombre}"?`)) return
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al alternar estado')
      notifySuccess(data.message)
      fetchUsers()
    } catch (err) {
      notifyError(err.message)
    }
  }

  // Abrir Modal de Restablecer / Recuperar Contraseña
  const openResetPasswordModal = (user) => {
    setResetUserId(user.id)
    setResetUserName(user.nombre)
    setResetUserEmail(user.email)
    const newPass = generatePass()
    setResetPassword(newPass)
    setShowResetPassword(true)
    setResetError('')
    setCopiedNotification(false)
    setResetModalOpen(true)
  }

  // Guardar nueva contraseña restablecida
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    if (!resetPassword || resetPassword.length < 6) {
      setResetError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setResetLoading(true)
    setResetError('')
    try {
      const res = await fetch(`${API_BASE}/users/${resetUserId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ password: resetPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al restablecer contraseña')
      setResetModalOpen(false)
      notifySuccess(`¡Contraseña restablecida con éxito para "${resetUserName}"! Nueva clave: ${resetPassword}`)
    } catch (err) {
      setResetError(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  // Copiar contraseña generada al portapapeles
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(resetPassword)
    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 2500)
  }

  // Abrir Modal de Edición
  const openEditModal = (user) => {
    setEditUserId(user.id)
    setEditUserNombre(user.nombre)
    setEditUserEmail(user.email || '')
    setEditUserUsername(user.username || '')
    setEditUserRol(user.rol)
    setEditUserActivo(user.activo !== false)
    setEditUserError('')
    setEditUserModalOpen(true)
  }

  // Guardar Edición de Usuario
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault()
    setEditUserLoading(true)
    setEditUserError('')
    try {
      const res = await fetch(`${API_BASE}/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          nombre: editUserNombre,
          email: editUserEmail,
          username: editUserUsername,
          rol: editUserRol,
          activo: editUserActivo
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario')
      setEditUserModalOpen(false)
      notifySuccess(`¡Usuario "${data.user.nombre}" actualizado correctamente!`)
      fetchUsers()
    } catch (err) {
      setEditUserError(err.message)
    } finally {
      setEditUserLoading(false)
    }
  }

  // Eliminar Usuario
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`⚠️ ¿ELIMINAR DEFINITIVAMENTE al usuario "${user.nombre}" (${user.email})?\nEsta acción no se puede deshacer.`)) {
      return
    }
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario')
      notifySuccess(`Usuario "${user.nombre}" eliminado del sistema.`)
      fetchUsers()
    } catch (err) {
      notifyError(err.message)
    }
  }

  // Filtrar Usuarios
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = !userSearchQuery ||
      user.nombre?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())

    const matchesRole = userRoleFilter === 'all' || user.rol === userRoleFilter

    let matchesStatus = true
    if (userStatusFilter === 'active') matchesStatus = user.activo !== false
    if (userStatusFilter === 'blocked') matchesStatus = user.activo === false

    return matchesSearch && matchesRole && matchesStatus
  })

  // Contadores KPI
  const countTotal = usersList.length
  const countActive = usersList.filter(u => u.activo !== false).length
  const countBlocked = usersList.filter(u => u.activo === false).length
  const countConsumers = usersList.filter(u => u.rol === 'consumidor').length
  const countStaff = usersList.filter(u => u.rol === 'admin' || u.rol === 'cajero').length

  return (
    <div className="superadmin-standalone-wrapper animate-fade-in">
      {/* Cabecera Exclusiva SuperAdmin */}
      <header className="superadmin-standalone-header">
        <div className="superadmin-standalone-brand">
          <div className="superadmin-standalone-logo">👑</div>
          <div className="superadmin-standalone-title-block">
            <div className="superadmin-standalone-title">
              El Buen Corte <span className="superadmin-pill-tag">CONSOLA MASTER</span>
            </div>
            <div className="superadmin-standalone-subtitle">
              Portal Ejecutivo de Administración y Gestión de Usuarios
            </div>
          </div>
        </div>

        <div className="superadmin-standalone-actions">
          {/* Perfil del SuperAdmin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '6px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="user-avatar-circle avatar-superadmin" style={{ width: 32, height: 32, fontSize: 12 }}>
              👑
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {currentUser?.nombre || 'Super Administrador'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {currentUser?.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchUsers}
            disabled={usersLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            title="Refrescar usuarios"
          >
            <RefreshIcon className={usersLoading ? 'animate-spin' : ''} style={{ width: 15, height: 15 }} />
            Refrescar
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', color: '#ef4444' }}
            title="Cerrar Sesión"
          >
            <LogOutIcon style={{ width: 15, height: 15 }} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="superadmin-standalone-container">
        {/* Banner Hero */}
        <div className="superadmin-hero-banner">
          <div className="superadmin-hero-content">
            <span className="superadmin-hero-badge">
              <CrownIcon style={{ width: 13, height: 13 }} /> CONTROL GLOBAL DE USUARIOS & CONSUMIDORES
            </span>
            <h1 className="superadmin-hero-title">Centro de Gestión de Plataforma</h1>
            <p className="superadmin-hero-desc">
              Administra todas las cuentas de consumidores, administradores y cajeros. Da de alta nuevos usuarios con generador de claves seguras, bloquea o activa accesos en 1 clic y recupera contraseñas extraviadas al instante.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => setRegModalOpen(true)}
              style={{ padding: '12px 24px', fontSize: '15px' }}
            >
              <PlusIcon style={{ width: 18, height: 18 }} />
              Nuevo Consumidor / Usuario
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {userActionSuccess && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '14px 20px',
            borderRadius: '14px',
            marginBottom: '24px',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
          }}>
            <CheckIcon style={{ width: 20, height: 20, color: '#059669', flexShrink: 0 }} />
            <span>{userActionSuccess}</span>
          </div>
        )}

        {userActionError && (
          <div className="auth-alert-error" style={{ marginBottom: '24px', padding: '14px 20px', fontSize: '14px' }}>
            ⚠️ {userActionError}
          </div>
        )}

        {/* Tarjetas KPI de Estado de Usuarios */}
        <div className="superadmin-kpis">
          <div className="superadmin-kpi-card">
            <div className="superadmin-kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <UsersIcon />
            </div>
            <div>
              <div className="superadmin-kpi-val">{countTotal}</div>
              <div className="superadmin-kpi-title">Total Cuentas Registradas</div>
            </div>
          </div>

          <div className="superadmin-kpi-card">
            <div className="superadmin-kpi-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <UserCheckIcon />
            </div>
            <div>
              <div className="superadmin-kpi-val" style={{ color: '#059669' }}>{countActive}</div>
              <div className="superadmin-kpi-title">Usuarios Activos</div>
            </div>
          </div>

          <div className="superadmin-kpi-card">
            <div className="superadmin-kpi-icon-wrapper" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <UserXIcon />
            </div>
            <div>
              <div className="superadmin-kpi-val" style={{ color: countBlocked > 0 ? '#dc2626' : '#64748b' }}>{countBlocked}</div>
              <div className="superadmin-kpi-title">Usuarios Bloqueados</div>
            </div>
          </div>

          <div className="superadmin-kpi-card">
            <div className="superadmin-kpi-icon-wrapper" style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}>
              <UserIcon />
            </div>
            <div>
              <div className="superadmin-kpi-val">{countConsumers}</div>
              <div className="superadmin-kpi-title">Consumidores / Clientes ({countStaff} Operadores)</div>
            </div>
          </div>
        </div>

        {/* Directorio de Usuarios y Control (Full width) */}
        <div style={{ width: '100%' }}>
          <div className="card" style={{ borderRadius: '18px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', margin: 0 }}>
                <UsersIcon style={{ width: 18, height: 18, color: '#4f46e5' }} /> Directorio y Control de Usuarios ({filteredUsers.length})
              </div>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => setRegModalOpen(true)}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <PlusIcon style={{ width: 14, height: 14 }} /> Nuevo
              </button>
            </div>

            <div className="card-body" style={{ padding: '22px' }}>
              {/* Barra de Búsqueda y Filtros */}
              <div className="superadmin-toolbar">
                <div className="superadmin-search-box">
                  <span className="search-icon"><SearchIcon /></span>
                  <input
                    type="text"
                    className="superadmin-search-input"
                    placeholder="Buscar por nombre o correo electrónico..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>

                <div className="superadmin-filter-group">
                  <select
                    className="input-control"
                    style={{ width: 'auto', minWidth: '150px', padding: '8px 12px' }}
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                  >
                    <option value="all">🔍 Todos los Roles</option>
                    <option value="consumidor">👥 Consumidores</option>
                    <option value="cajero">🛒 Cajeros</option>
                    <option value="admin">🏢 Administradores</option>
                    <option value="superadmin">👑 SuperAdmins</option>
                  </select>

                  <select
                    className="input-control"
                    style={{ width: 'auto', minWidth: '150px', padding: '8px 12px' }}
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                  >
                    <option value="all">⚡ Todos los Estados</option>
                    <option value="active">🟢 Solo Activos</option>
                    <option value="blocked">🔴 Solo Bloqueados</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Usuarios */}
              {usersLoading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
                  <RefreshIcon className="animate-spin" style={{ width: 28, height: 28, margin: '0 auto 10px' }} />
                  Cargando directorio de usuarios...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
                  No se encontraron usuarios con los criterios de búsqueda seleccionados.
                </div>
              ) : (
                <div className="superadmin-table-container">
                  <table className="superadmin-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Usuario / Consumidor</th>
                        <th>Rol</th>
                        <th>Sede / Tenant</th>
                        <th>Estado</th>
                        <th>Registro</th>
                        <th style={{ textAlign: 'right' }}>Acciones Maestras</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => {
                        const isCurrent = u.id === currentUser?.id
                        const isBlocked = u.activo === false

                        let roleBadge = 'role-badge-consumidor'
                        let roleIcon = '👥'
                        let roleText = 'Consumidor'
                        let avatarClass = 'avatar-consumidor'

                        if (u.rol === 'superadmin') {
                          roleBadge = 'role-badge-superadmin'
                          roleIcon = '👑'
                          roleText = 'SuperAdmin'
                          avatarClass = 'avatar-superadmin'
                        } else if (u.rol === 'admin') {
                          roleBadge = 'role-badge-admin'
                          roleIcon = '🏢'
                          roleText = 'Administrador'
                          avatarClass = 'avatar-admin'
                        } else if (u.rol === 'cajero') {
                          roleBadge = 'role-badge-cajero'
                          roleIcon = '🛒'
                          roleText = 'Cajero'
                          avatarClass = 'avatar-cajero'
                        }

                        return (
                          <tr key={u.id} style={{ opacity: isBlocked ? 0.75 : 1, backgroundColor: isBlocked ? '#fffafa' : undefined }}>
                            <td style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>
                              #{u.id}
                            </td>

                            <td>
                              <div className="superadmin-user-cell">
                                <div className={`user-avatar-circle ${avatarClass}`} style={{ width: 42, height: 42, fontSize: 16 }}>
                                  {u.rol === 'superadmin' ? '👑' : (u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U')}
                                </div>
                                <div className="superadmin-user-info">
                                  <div className="superadmin-user-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {u.nombre}
                                    {isCurrent && (
                                      <span className="superadmin-pill-tag">
                                        TÚ
                                      </span>
                                    )}
                                  </div>
                                  <div className="superadmin-user-email">
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className={`role-badge ${roleBadge}`}>
                                <span>{roleIcon}</span> {roleText}
                              </span>
                            </td>

                            <td>
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '700', 
                                color: u.rol === 'superadmin' ? '#7c3aed' : (u.tenant_id ? '#2563eb' : '#64748b'), 
                                background: u.rol === 'superadmin' ? '#f5f3ff' : (u.tenant_id ? '#eff6ff' : '#f1f5f9'), 
                                padding: '3px 9px', 
                                borderRadius: '6px',
                                border: `1px solid ${u.rol === 'superadmin' ? '#ddd6fe' : (u.tenant_id ? '#bfdbfe' : '#e2e8f0')}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {u.rol === 'superadmin' ? '👑 Global' : (u.tenant_id ? `🏢 Sede #${u.tenant_id}` : '—')}
                              </span>
                            </td>

                            <td>
                              {isBlocked ? (
                                <span className="status-pill status-pill-blocked" title="El usuario no puede iniciar sesión">
                                  <span className="status-dot-blocked" /> Bloqueado
                                </span>
                              ) : (
                                <span className="status-pill status-pill-active" title="Cuenta activa">
                                  <span className="status-dot-active" /> Activo
                                </span>
                              )}
                            </td>

                            <td style={{ fontSize: '12px', color: '#64748b' }}>
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Reciente'}
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                {/* Botón Recuperar / Restablecer Contraseña */}
                                <button
                                  type="button"
                                  className="superadmin-action-btn"
                                  title="Recuperar / Restablecer Contraseña"
                                  onClick={() => openResetPasswordModal(u)}
                                >
                                  <KeyIcon style={{ width: 16, height: 16, color: '#f59e0b' }} />
                                </button>

                                {/* Botón Bloquear / Activar */}
                                <button
                                  type="button"
                                  className={`superadmin-action-btn ${isBlocked ? 'superadmin-action-btn-primary' : 'superadmin-action-btn-danger'}`}
                                  title={isCurrent ? 'No puedes bloquear tu propia cuenta' : (isBlocked ? 'Activar Usuario' : 'Bloquear Usuario')}
                                  disabled={isCurrent}
                                  onClick={() => handleToggleStatus(u)}
                                >
                                  {isBlocked ? <UserCheckIcon style={{ width: 16, height: 16, color: '#10b981' }} /> : <UserXIcon style={{ width: 16, height: 16, color: '#ef4444' }} />}
                                </button>

                                {/* Botón Editar Datos */}
                                <button
                                  type="button"
                                  className="superadmin-action-btn"
                                  title="Editar Nombre, Correo o Rol"
                                  onClick={() => openEditModal(u)}
                                >
                                  <PencilIcon style={{ width: 16, height: 16, color: '#3b82f6' }} />
                                </button>

                                {/* Botón Eliminar Usuario */}
                                <button
                                  type="button"
                                  className="superadmin-action-btn superadmin-action-btn-danger"
                                  title={isCurrent ? 'No puedes eliminar tu propia cuenta' : 'Eliminar Usuario'}
                                  disabled={isCurrent}
                                  onClick={() => handleDeleteUser(u)}
                                  style={isCurrent ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                  <TrashIcon style={{ width: 16, height: 16, color: isCurrent ? '#94a3b8' : '#ef4444' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================================================================= */}
      {/* MODAL: REGISTRAR NUEVO CONSUMIDOR / USUARIO */}
      {/* ================================================================= */}
      {regModalOpen && (
        <div className="superadmin-modal-backdrop" onClick={() => setRegModalOpen(false)}>
          <div className="superadmin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <div className="superadmin-modal-title">
                <PlusIcon style={{ width: 18, height: 18, color: '#f59e0b' }} />
                Registrar Nuevo Consumidor / Usuario
              </div>
              <button
                type="button"
                className="superadmin-modal-close"
                onClick={() => setRegModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="superadmin-modal-body">
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                  Crea credenciales para que los consumidores o el personal del negocio puedan utilizar el sistema.
                </p>

                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="Ej. Distribuciones Carnes del Valle"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de Usuario (Nik)</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="ej. carniceria1"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    className="input-control"
                    placeholder="cliente@dominio.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Contraseña Inicial</label>
                    <button
                      type="button"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        borderRadius: '8px',
                        background: '#fef3c7',
                        color: '#d97706',
                        border: '1px solid #fde68a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#fde68a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#fef3c7'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      onClick={() => {
                        const p = generatePass()
                        setRegPassword(p)
                        setShowRegPassword(true)
                      }}
                    >
                      🎲 Generar Segura
                    </button>
                  </div>
                  <div className="input-with-icon">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="input-control input-control-padded-right"
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Rol del Usuario</label>
                  <select
                    className="input-control"
                    value={regRol}
                    onChange={(e) => setRegRol(e.target.value)}
                  >
                    <option value="admin">🏢 Administrador (Gestión de Tienda e Inventario)</option>
                    <option value="superadmin">👑 Super Administrador (Control Total)</option>
                  </select>
                </div>
              </div>

              <div className="superadmin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRegModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={regLoading}
                >
                  {regLoading ? 'Registrando...' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: RECUPERAR / RESTABLECER CONTRASEÑA */}
      {/* ================================================================= */}
      {resetModalOpen && (
        <div className="superadmin-modal-backdrop" onClick={() => setResetModalOpen(false)}>
          <div className="superadmin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <div className="superadmin-modal-title">
                <KeyIcon style={{ width: 18, height: 18, color: '#f59e0b' }} />
                Recuperar Contraseña de Usuario
              </div>
              <button
                type="button"
                className="superadmin-modal-close"
                onClick={() => setResetModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="superadmin-modal-body">
                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', marginBottom: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{resetUserName}</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>{resetUserEmail}</div>
                </div>

                {resetError && (
                  <div className="auth-alert-error" style={{ marginBottom: '16px' }}>
                    ⚠️ {resetError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Nueva Contraseña Asignada</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '6px' }}
                        onClick={() => {
                          const p = generatePass()
                          setResetPassword(p)
                        }}
                      >
                        🎲 Generar Otra
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '6px', color: copiedNotification ? '#059669' : undefined }}
                        onClick={handleCopyPassword}
                      >
                        <CopyIcon style={{ width: 12, height: 12, marginRight: 4 }} />
                        {copiedNotification ? '¡Copiada!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <div className="input-with-icon">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="input-control input-control-padded-right"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      tabIndex={-1}
                    >
                      {showResetPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', marginBottom: 0, lineHeight: 1.4 }}>
                    Puedes copiar esta contraseña y enviársela directamente a tu cliente por WhatsApp o correo. Al guardar, quedará inmediatamente activa.
                  </p>
                </div>
              </div>

              <div className="superadmin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setResetModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Guardando...' : 'Asignar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: EDITAR USUARIO */}
      {/* ================================================================= */}
      {editUserModalOpen && (
        <div className="superadmin-modal-backdrop" onClick={() => setEditUserModalOpen(false)}>
          <div className="superadmin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="superadmin-modal-header">
              <div className="superadmin-modal-title">
                <PencilIcon style={{ width: 18, height: 18, color: '#f59e0b' }} />
                Editar Usuario #{editUserId}
              </div>
              <button
                type="button"
                className="superadmin-modal-close"
                onClick={() => setEditUserModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit}>
              <div className="superadmin-modal-body">
                {editUserError && (
                  <div className="auth-alert-error" style={{ marginBottom: '16px' }}>
                    ⚠️ {editUserError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    value={editUserNombre}
                    onChange={(e) => setEditUserNombre(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre de Usuario (Nik)</label>
                  <input
                    type="text"
                    className="input-control"
                    value={editUserUsername}
                    onChange={(e) => setEditUserUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    required
                    className="input-control"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rol de Acceso</label>
                  <select
                    className="input-control"
                    value={editUserRol}
                    onChange={(e) => setEditUserRol(e.target.value)}
                  >
                    <option value="admin">🏢 Administrador (Gestión de Tienda)</option>
                    <option value="superadmin">👑 Super Administrador (Control Total)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Estado de la Cuenta</label>
                  <select
                    className="input-control"
                    value={editUserActivo ? 'true' : 'false'}
                    onChange={(e) => setEditUserActivo(e.target.value === 'true')}
                  >
                    <option value="true">🟢 Activo (Puede ingresar al sistema)</option>
                    <option value="false">🔴 Bloqueado (Acceso suspendido)</option>
                  </select>
                </div>
              </div>

              <div className="superadmin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditUserModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editUserLoading}
                >
                  {editUserLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App


