import { useState, useEffect } from 'react'
import { api } from "../../config/api";
 
export default function SalesPage() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [productId, setProductId] = useState('')
  const [quantidade, setQuantidade] = useState('')
 
  async function loadData() {
    setLoading(true); setErr('')
    try {
      const [prodRes, salesRes] = await Promise.all([
        api.getProducts(),
        api.getSales(),
      ])
      setProducts((prodRes.produtos || []).filter(p => p.status === 'Ativo'))
      setSales(salesRes.vendas || [])
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }
 
  useEffect(() => { loadData() }, [])
 
  async function onSubmit(e) {
    e.preventDefault()
    setFormLoading(true); setOk(''); setErr('')
    try {
      if (!productId || !quantidade) throw new Error('Selecione produto e quantidade.')
      const qty = Number(quantidade)
      if (qty <= 0) throw new Error('Quantidade deve ser maior que zero.')
 
      await api.createSale({ produtoId: Number(productId), quantidade: qty })
      setOk('Venda registrada com sucesso!')
      setProductId(''); setQuantidade('')
      await loadData()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setFormLoading(false)
    }
  }
 
  const selectedProduct = products.find(p => p.id === Number(productId))
 
  // Compute totals
  const totalRevenue = sales.reduce((sum, s) => sum + s.price_at_sale * s.quantity, 0)
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0)
 
  return (
    <div className="page-content">
      {/* Topbar */}
      <div className="topbar" style={{ marginLeft: '-36px', marginRight: '-36px', paddingLeft: '36px', width: 'calc(100% + 72px)' }}>
        <div>
          <div className="topbar-title">Vendas</div>
          <div className="topbar-sub">Registre vendas e acompanhe o histórico</div>
        </div>
        <div className="topbar-spacer" />
        <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
          {loading ? <><span className="spinner" /> Carregando</> : '↻ Atualizar'}
        </button>
      </div>
 
      <div style={{ height: 32 }} />
 
      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        {/* Register sale form */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            Registrar venda
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
            Selecione o produto e informe a quantidade vendida.
          </p>
 
          <form className="form-grid" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Produto</label>
              <select className="input" value={productId} onChange={e => setProductId(e.target.value)} required>
                <option value="">Selecione um produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — R$ {Number(p.price).toFixed(2)} ({p.quantity} em estoque)
                  </option>
                ))}
              </select>
            </div>
 
            {selectedProduct && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                display: 'flex', gap: 16, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Preço: <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>R$ {Number(selectedProduct.price).toFixed(2)}</strong>
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Estoque: <strong style={{ color: selectedProduct.quantity <= 5 ? 'var(--red)' : 'var(--text)', fontFamily: 'var(--font-mono)' }}>{selectedProduct.quantity}</strong>
                </span>
              </div>
            )}
 
            <div className="form-group">
              <label className="form-label">Quantidade</label>
              <input
                className="input"
                type="number"
                min="1"
                max={selectedProduct?.quantity}
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                placeholder="1"
                required
              />
            </div>
 
            {selectedProduct && quantidade && Number(quantidade) > 0 && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total da venda: </span>
                <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  R$ {(Number(selectedProduct.price) * Number(quantidade)).toFixed(2)}
                </strong>
              </div>
            )}
 
            {err && <div className="alert alert-error">{err}</div>}
            {ok && <div className="alert alert-success">{ok}</div>}
 
            <button className="btn btn-primary btn-full" type="submit" disabled={formLoading || products.length === 0}>
              {formLoading
                ? <><span className="spinner" /> Registrando...</>
                : products.length === 0 ? 'Nenhum produto ativo' : 'Registrar venda'
              }
            </button>
          </form>
        </div>
 
        {/* Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--accent-dim)', fontSize: 18 }}>💰</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>
              R$ {totalRevenue.toFixed(2)}
            </div>
            <div className="stat-label">Faturamento total</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--blue-dim)', fontSize: 18 }}>🛒</div>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{sales.length}</div>
            <div className="stat-label">Vendas realizadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--amber-dim)', fontSize: 18 }}>📦</div>
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{totalUnits}</div>
            <div className="stat-label">Unidades vendidas</div>
          </div>
        </div>
      </div>
 
      {/* Sales history table */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Histórico de vendas</h2>
      </div>
 
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preço unit.</th>
              <th>Total</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32 }}>
                <span className="spinner" style={{ width: 20, height: 20 }} />
              </td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                Nenhuma venda registrada ainda.
              </td></tr>
            ) : sales.map(s => (
              <tr key={s.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: 12 }}>#{s.id}</td>
                <td style={{ fontWeight: 500 }}>{s.produto?.name ?? '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{s.quantity}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>R$ {Number(s.price_at_sale).toFixed(2)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                  R$ {(s.price_at_sale * s.quantity).toFixed(2)}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {new Date(s.created_at).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}