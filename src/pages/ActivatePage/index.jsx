import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from "../../config/api";

export default function ActivatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [celular, setCelular] = useState(location.state?.celular || '')
  const [codigo, setCodigo] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setErr(''); setOk(''); setLoading(true)
    try {
      const data = await api.activate({ celular, codigo })
      setOk(data.mensagem || 'Conta ativada!')
      setTimeout(() => navigate('/login'), 1600)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Tech<span>Stock</span></div>
        <div className="auth-step">Passo 2 de 3</div>
        <h1 className="auth-title">Ativar conta</h1>
        <p className="auth-sub">Digite o código de 4 dígitos enviado ao seu WhatsApp.</p>

        <div className="code-dots">
          {[1, 2, 3, 4].map(n => (
            <div className="code-dot" key={n}>{n}</div>
          ))}
        </div>

        <form className="form-grid" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">WhatsApp (DDI)</label>
            <input className="input" value={celular} onChange={e => setCelular(e.target.value)} placeholder="+5511999999999" required />
          </div>
          <div className="form-group">
            <label className="form-label">Código de 4 dígitos</label>
            <input
              className="input"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="1234"
              maxLength={4}
              required
            />
          </div>

          {err && <div className="alert alert-error">{err}</div>}
          {ok && <div className="alert alert-success">{ok}</div>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Ativando...</> : 'Ativar conta'}
          </button>
        </form>

        <div className="auth-switch">
          Não recebeu o código? <Link to="/register">Reenviar</Link>
        </div>
      </div>
    </div>
  )
}