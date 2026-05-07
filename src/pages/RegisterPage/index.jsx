import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from "../../config/api";

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState({ name: '', cnpj: '', email: '', celular: '', password: '' })

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr(''); setOk(''); setLoading(true)
    try {
      const data = await api.register(form)
      setOk(data.mensagem || 'Cadastro realizado! Verifique seu WhatsApp.')
      setTimeout(() => navigate('/activate', { state: { celular: form.celular } }), 1800)
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
        <div className="auth-step">Passo 1 de 3</div>
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-sub">Cadastre seu mini mercado para começar a gerenciar estoque e vendas.</p>

        <form className="form-grid" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Nome do Mini Mercado</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Mini Mercado Estrela" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CNPJ</label>
              <input className="input" value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0001-00" required />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp (DDI)</label>
              <input className="input" value={form.celular} onChange={set('celular')} placeholder="+5511999999999" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="mercado@email.com" required />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" required />
          </div>

          {err && <div className="alert alert-error">{err}</div>}
          {ok && <div className="alert alert-success">{ok}</div>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Cadastrando...</> : 'Criar conta'}
          </button>
        </form>

        <div className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  )
}