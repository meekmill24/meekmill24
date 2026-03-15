import { LucideIcon } from 'lucide-react'

interface BalanceCardProps {
  label: string
  amount: string | number
  currency?: string
  icon?: LucideIcon
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

const variants = {
  default: 'bg-purple-50 border-purple-200',
  primary: 'bg-purple-50 border-purple-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-amber-50 border-amber-200',
  danger: 'bg-red-50 border-red-200',
}

const textVariants = {
  default: 'text-purple-700',
  primary: 'text-purple-700',
  success: 'text-green-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
}

const iconVariants = {
  default: 'bg-purple-100 text-purple-600',
  primary: 'bg-purple-100 text-purple-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-red-100 text-red-600',
}

export function BalanceCard({
  label,
  amount,
  currency = 'USD',
  icon: Icon,
  variant = 'default',
}: BalanceCardProps) {
  return (
    <div className={`rounded-2xl border-2 p-5 ${variants[variant]}`}>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm text-gray-600'>{label}</p>
          <p className={`text-2xl font-bold mt-2 ${textVariants[variant]}`}>
            ${typeof amount === 'number' ? amount.toFixed(2) : amount}
          </p>
          <p className='text-xs text-gray-500 mt-1'>{currency}</p>
        </div>
        {Icon && (
          <div className={`rounded-full p-3 ${iconVariants[variant]}`}>
            <Icon className='w-5 h-5' />
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  variant?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan'
}

const statVariants = {
  blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
  green: 'bg-gradient-to-br from-green-400 to-green-600',
  purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
  orange: 'bg-gradient-to-br from-orange-400 to-orange-600',
  red: 'bg-gradient-to-br from-red-400 to-red-600',
  cyan: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
}

export function StatCard({
  icon: Icon,
  label,
  value,
  variant = 'blue',
}: StatCardProps) {
  return (
    <div className={`rounded-3xl p-6 text-white ${statVariants[variant]} shadow-lg`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium opacity-90'>{label}</p>
          <p className='text-3xl font-bold mt-1'>{value}</p>
        </div>
        <div className='opacity-20'>
          <Icon className='w-12 h-12' />
        </div>
      </div>
    </div>
  )
}

interface TransactionItemProps {
  icon: LucideIcon
  title: string
  timestamp: string
  amount: number
  variant?: 'positive' | 'negative' | 'neutral'
  iconBg?: string
}

const iconBgVariants = {
  positive: 'bg-green-100',
  negative: 'bg-red-100',
  neutral: 'bg-orange-100',
}

const iconColorVariants = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-orange-600',
}

export function TransactionItem({
  icon: Icon,
  title,
  timestamp,
  amount,
  variant = 'neutral',
  iconBg,
}: TransactionItemProps) {
  const isPositive = variant === 'positive'
  return (
    <div className='flex items-center gap-3 py-3'>
      <div className={`rounded-full p-2 ${iconBg || iconBgVariants[variant]}`}>
        <Icon className={`w-5 h-5 ${iconColorVariants[variant]}`} />
      </div>
      <div className='flex-1'>
        <p className='font-semibold text-sm text-foreground'>{title}</p>
        <p className='text-xs text-muted-foreground'>{timestamp}</p>
      </div>
      <p className={`font-bold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : '-'}${Math.abs(amount).toFixed(2)}
      </p>
    </div>
  )
}
