import React from 'react'
import { 
  Check, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Mail, 
  BarChart3, 
  ClipboardList, 
  Crown, 
  Wallet, 
  Scale, 
  Package, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  TrendingUp, 
  Trash2, 
  Plus, 
  Home, 
  DollarSign,
  Store,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Search,
  Key,
  Pencil,
  Users,
  RefreshCw,
  UserCheck,
  UserX,
  Copy,
  Menu,
  X,
  ShoppingCart,
  Tag,
  ChevronLeft,
  ChevronRight,
  Star,
  SlidersHorizontal,
  ShoppingBag,
  Bell
} from 'lucide-react'

// WhatsAppIcon keeps custom SVG as Lucide does not include it
export function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24z" />
    </svg>
  )
}

export function CheckIcon({ className = "h-5 w-5" }) {
  return <Check className={className} strokeWidth={2.5} />
}

export function ShieldCheckIcon({ className = "h-5 w-5" }) {
  return <ShieldCheck className={className} strokeWidth={1.8} />
}

export function ClockIcon({ className = "h-5 w-5" }) {
  return <Clock className={className} strokeWidth={1.8} />
}

export function MapPinIcon({ className = "h-5 w-5" }) {
  return <MapPin className={className} strokeWidth={1.8} />
}

export function MailIcon({ className = "h-5 w-5" }) {
  return <Mail className={className} strokeWidth={1.8} />
}

export function ChartIcon({ className = "h-5 w-5" }) {
  return <BarChart3 className={className} strokeWidth={1.8} />
}

export function ClipboardIcon({ className = "h-5 w-5" }) {
  return <ClipboardList className={className} strokeWidth={1.8} />
}

export function CrownIcon({ className = "h-5 w-5" }) {
  return <Crown className={className} strokeWidth={1.8} />
}

export function WalletIcon({ className = "h-5 w-5" }) {
  return <Wallet className={className} strokeWidth={1.8} />
}

export function ScaleIcon({ className = "h-5 w-5" }) {
  return <Scale className={className} strokeWidth={1.8} />
}

export function BoxIcon({ className = "h-5 w-5" }) {
  return <Package className={className} strokeWidth={1.8} />
}

export function SparklesIcon({ className = "h-5 w-5" }) {
  return <Sparkles className={className} strokeWidth={1.8} />
}

export function BoltIcon({ className = "h-5 w-5" }) {
  return <Zap className={className} strokeWidth={1.8} />
}

export function ArrowRightIcon({ className = "h-5 w-5" }) {
  return <ArrowRight className={className} strokeWidth={2} />
}

export function TrendingUpIcon({ className = "h-5 w-5" }) {
  return <TrendingUp className={className} strokeWidth={1.8} />
}

export function TrashIcon({ className = "h-5 w-5" }) {
  return <Trash2 className={className} strokeWidth={1.8} />
}

export function PlusIcon({ className = "h-5 w-5" }) {
  return <Plus className={className} strokeWidth={2} />
}

export function HomeIcon({ className = "h-5 w-5" }) {
  return <Home className={className} strokeWidth={1.8} />
}

export function DollarIcon({ className = "h-5 w-5" }) {
  return <DollarSign className={className} strokeWidth={1.8} />
}

export function StoreIcon({ className = "h-5 w-5" }) {
  return <Store className={className} strokeWidth={1.8} />
}

export function LockIcon({ className = "h-5 w-5" }) {
  return <Lock className={className} strokeWidth={1.8} />
}

export function UserIcon({ className = "h-5 w-5" }) {
  return <User className={className} strokeWidth={1.8} />
}

export function EyeIcon({ className = "h-5 w-5" }) {
  return <Eye className={className} strokeWidth={1.8} />
}

export function EyeOffIcon({ className = "h-5 w-5" }) {
  return <EyeOff className={className} strokeWidth={1.8} />
}

export function LogOutIcon({ className = "h-5 w-5" }) {
  return <LogOut className={className} strokeWidth={1.8} />
}

export function SearchIcon({ className = "h-5 w-5" }) {
  return <Search className={className} strokeWidth={1.8} />
}

export function KeyIcon({ className = "h-5 w-5" }) {
  return <Key className={className} strokeWidth={1.8} />
}

export function PencilIcon({ className = "h-5 w-5" }) {
  return <Pencil className={className} strokeWidth={1.8} />
}

export function UsersIcon({ className = "h-5 w-5" }) {
  return <Users className={className} strokeWidth={1.8} />
}

export function RefreshIcon({ className = "h-5 w-5" }) {
  return <RefreshCw className={className} strokeWidth={1.8} />
}

export function UserCheckIcon({ className = "h-5 w-5" }) {
  return <UserCheck className={className} strokeWidth={1.8} />
}

export function UserXIcon({ className = "h-5 w-5" }) {
  return <UserX className={className} strokeWidth={1.8} />
}

export function CopyIcon({ className = "h-5 w-5" }) {
  return <Copy className={className} strokeWidth={1.8} />
}

export function MenuIcon({ className = "h-5 w-5" }) {
  return <Menu className={className} strokeWidth={2} />
}

export function CloseIcon({ className = "h-5 w-5" }) {
  return <X className={className} strokeWidth={2} />
}

export function ShoppingCartIcon({ className = "h-5 w-5" }) {
  return <ShoppingCart className={className} strokeWidth={1.8} />
}

export function TagIcon({ className = "h-5 w-5" }) {
  return <Tag className={className} strokeWidth={1.8} />
}

export function ChevronLeftIcon({ className = "h-5 w-5" }) {
  return <ChevronLeft className={className} strokeWidth={2.2} />
}

export function ChevronRightIcon({ className = "h-5 w-5" }) {
  return <ChevronRight className={className} strokeWidth={2.2} />
}

export function StarIcon({ className = "h-5 w-5" }) {
  return <Star className={className} strokeWidth={1.8} />
}

export function SlidersIcon({ className = "h-5 w-5" }) {
  return <SlidersHorizontal className={className} strokeWidth={1.8} />
}

export function ShoppingBagIcon({ className = "h-5 w-5" }) {
  return <ShoppingBag className={className} strokeWidth={1.8} />
}

export function InfoIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

export function PhoneIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

export function GlobeIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

export function InstagramIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export function FacebookIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export function BellIcon({ className = "h-5 w-5" }) {
  return <Bell className={className} strokeWidth={1.8} />
}

// 🥩 Logo Oficial del Negocio (Mismo vector del favicon)
export function BrandLogoSvg({ className = "w-6 h-6", style = {} }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 32 32" 
      className={className} 
      style={style}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="#160d0b" />
      <path d="M9 19c0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 6-7 6-7-2.1-7-6z" fill="#dc2626" />
      <circle cx="13.5" cy="18" r="2.2" fill="#f3e9dc" />
      <path d="M16 5c1.5 1.5 1.5 3 .6 4.2M19 6c1 1.3 1 2.6.2 3.6" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// 🥩 Marca de agua para fondos de cards, dashboards y estados vacíos
export function BrandWatermark({ size = 140, opacity = 0.12, style = {}, className = "" }) {
  return (
    <div 
      className={`brand-watermark-wrapper ${className}`}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: opacity,
        zIndex: 0,
        ...style
      }}
      aria-hidden="true"
    >
      <img 
        src="/icon-192.png" 
        alt="" 
        width={size} 
        height={size}
        style={{ objectFit: 'contain', filter: 'grayscale(100%) opacity(0.8) drop-shadow(0px 0px 4px rgba(0,0,0,0.1))' }}
      />
    </div>
  )
}

// 🥩 Contenedor estandarizado de estado vacío con identidad y marca de agua
export function EmptyState({ 
  icon = "🥩", 
  title = "No hay registros", 
  subtitle = "Todo está al día o no se encontraron elementos en esta sección.",
  actionButton = null,
  compact = false
}) {
  return (
    <div className={`app-empty-state ${compact ? 'compact' : ''}`}>
      <BrandWatermark size={compact ? 90 : 140} opacity={0.04} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-8deg)' }} />
      <div className="empty-state-icon-badge">
        <span>{icon}</span>
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-subtitle">{subtitle}</p>
      {actionButton && (
        <div className="empty-state-actions">
          {actionButton}
        </div>
      )}
    </div>
  )
}
