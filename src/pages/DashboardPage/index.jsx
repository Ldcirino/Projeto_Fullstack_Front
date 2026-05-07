import { useState, useEffect } from 'react'
import { api } from "../../config/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
 
export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
 
  async function load() {
    setLoading(true); setErr('')
    try {
      const res = await api.getDashboard()
      setData(res.totais || res)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  useEffect(() => { load() }, [])
 
  const stats = [
    {
      label: 'Produtos cadastrados',
      value: data?.produtos ?? '--',
      icon: '📦',
      color: 'var(--blue)',
      bg: 'var(--blue-dim)',
    },
    {
      label: 'Produtos ativos',
      value: data?.produtos_ativos ?? '--',
      icon: '✅',
      color: 'var(--accent)',
      bg: 'var(--accent-dim)',
    },
    {
      label: 'Vendas registradas',
      value: data?.vendas ?? '--',
      icon: '🛒',
      color: 'var(--amber)',
      bg: 'var(--amber-dim)',
    },
    {
      label: 'Unidades em estoque',
      value: data?.estoque_total ?? '--',
      icon: '🏪',
      color: 'var(--blue)',
      bg: 'var(--blue-dim)',
    },
    {
      label: 'Faturamento total',
      value: data?.faturamento != null ? `R$ ${Number(data.faturamento).toFixed(2)}` : '--',
      icon: '💰',
      color: 'var(--accent)',
      bg: 'var(--accent-dim)',
      wide: true,
    },
  ]
 
  return (
    <div className="page-content">
      <div className="topbar" style={{ marginLeft: '-36px', marginRight: '-36px', paddingLeft: '36px', width: 'calc(100% + 72px)' }}>
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-sub">Visão geral do seu mini mercado</div>
        </div>
        <div className="topbar-spacer" />
        <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
          {loading ? <><span className="spinner" /> Atualizando</> : '↻ Atualizar'}
        </button>
      </div>
 
      <div style={{ height: 32 }} />
 
      {err && <div className="alert alert-error mb-4">{err}</div>}
 
      {/* Stats grid */}
      <div className="grid grid-auto" style={{ marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div className="stat-card" key={i} style={{ gridColumn: s.wide ? 'span 2' : undefined }}>
            <div
              className="stat-icon"
              style={{ background: s.bg, fontSize: 18 }}
            >
              {s.icon}
            </div>
            <div className="stat-value" style={{ color: s.color }}>
              {loading ? <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} /> : s.value}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
 
      {/* Info cards */}
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Saúde do Estoque
          </h3>
          {data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StockBar
                label="Produtos ativos"
                value={data.produtos_ativos}
                total={data.produtos}
                color="var(--accent)"
              />
              <StockBar
                label="Produtos inativos"
                value={data.produtos - data.produtos_ativos}
                total={data.produtos}
                color="var(--red)"
              />
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: 13 }}>Carregando...</div>
          )}
        </div>
 
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Resumo de Vendas
          </h3>
          {data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow label="Total de vendas" value={data.vendas} />
              <InfoRow label="Unidades em estoque" value={data.estoque_total} />
              <InfoRow
                label="Ticket médio"
                value={data.vendas > 0 ? `R$ ${(data.faturamento / data.vendas).toFixed(2)}` : 'R$ 0,00'}
              />
              <InfoRow
                label="Faturamento total"
                value={`R$ ${Number(data.faturamento).toFixed(2)}`}
                highlight
              />
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: 13 }}>Carregando...</div>
          )}
        </div>
      </div>
    </div>
  )
}
 
function StockBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color }}>{value} <span style={{ color: 'var(--text-dim)' }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}
 
function InfoRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 12px', borderRadius: 8,
      background: highlight ? 'var(--accent-dim)' : 'var(--surface2)',
      border: highlight ? '1px solid var(--border-accent)' : '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
        color: highlight ? 'var(--accent)' : 'var(--text)',
      }}>{value}</span>
    </div>
  )
}