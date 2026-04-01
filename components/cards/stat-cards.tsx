import { LucideIcon } from 'lucide-react'

interface BalanceCardProps {
  label: string
  amount: string | number
  currency?: string
  icon?: LucideIcon
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  variant?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan'
}

export function StatCard({
  icon: Icon,
  label,
  value,
  variant = 'blue',
}: StatCardProps) {
  const glowColors = {
    blue: 'shadow-cyan-500/10 border-cyan-500/20',
    green: 'shadow-emerald-500/10 border-emerald-500/20',
    purple: 'shadow-purple-500/10 border-purple-500/20',
    orange: 'shadow-orange-500/10 border-orange-500/20',
    red: 'shadow-red-500/10 border-red-500/20',
    cyan: 'shadow-cyan-400/10 border-cyan-400/20',
  }

  const iconColors = {
    blue: 'text-cyan-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    cyan: 'text-cyan-300',
  }

  return (
    <div className={`glass-dark rounded-[32px] p-7 border ${glowColors[variant]} shadow-2xl group transition-all duration-500 hover:translate-y-[-4px]`}>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <p className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic'>{label}</p>
          <p className='text-3xl font-black text-white italic tracking-tighter'>{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all ${iconColors[variant]}`}>
          <Icon className='w-7 h-7' />
        </div>
      </div>
    </div>
  )
}

export function BalanceCard({
  label,
  amount,
  currency = 'USD',
  icon: Icon,
  variant = 'default',
}: BalanceCardProps) {
  return (
    <div className="glass-dark rounded-[40px] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[60px] translate-x-10 translate-y-[-10px]" />
      <div className='flex items-start justify-between relative z-10'>
        <div className='space-y-4'>
          <div className='space-y-1'>
            <p className='text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 italic'>{label}</p>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-black text-white italic tracking-tighter'>
                ${typeof amount === 'number' ? amount.toFixed(2) : amount}
              </span>
              <span className='text-[10px] font-black text-zinc-600 uppercase tracking-widest'>{currency}</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Protocol Active</span>
          </div>
        </div>
        {Icon && (
          <div className='w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-cyan-500/30 transition-all duration-700'>
            <Icon className='w-8 h-8 text-cyan-400' />
          </div>
        )}
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
      <div className={`rounded-full p-2 bg-white/5 border border-white/5`}>
        <Icon className={`w-5 h-5 text-cyan-400`} />
      </div>
      <div className='flex-1'>
        <p className='font-black uppercase tracking-widest text-[#8px] text-white italic'>{title}</p>
        <p className='text-[8px] text-zinc-600 font-bold uppercase tracking-widest'>{timestamp}</p>
      </div>
      <p className={`font-black text-sm italic ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '+' : '-'}${Math.abs(amount).toFixed(2)}
      </p>
    </div>
  )
}
