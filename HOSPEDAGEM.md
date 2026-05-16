# 💕 Nosso Espaço — Guia de Hospedagem na Internet

> Deixe o site acessível de qualquer lugar, com senha, de graça.

---

## O que foi alterado no app.py

✅ **Proteção por senha** — ninguém entra sem saber a senha  
✅ **Senha configurável** — mude sem editar código  
✅ **Sessão segura** — login dura até o navegador fechar  
✅ **Botão "Sair"** — no rodapé da página principal  
✅ **Todos os arquivos de mídia protegidos** — mesmo fotos/vídeos/músicas precisam de login  

---

## 🔒 Mudar a senha

A senha padrão é: **`nossoamor2024`**

### Localmente (rodar no PC)

Abra `app.py` e procure esta linha:
```python
SITE_PASSWORD = os.environ.get('SITE_PASSWORD', 'nossoamor2024')
```
Mude `nossoamor2024` pela senha que quiser. Pronto.

### Na hospedagem (Railway / Render)
Configure a variável de ambiente `SITE_PASSWORD` com sua senha — explicado abaixo.

---

## 🚀 Opção 1 — Railway (recomendado, mais fácil)

**Railway** é gratuito para projetos pequenos e muito simples de usar.

### Passo a passo

**1. Criar conta**
- Acesse [railway.app](https://railway.app) → clique em **Start a New Project**
- Faça login com sua conta do **GitHub**

**2. Subir o projeto no GitHub**
- Vá em [github.com](https://github.com) → **New repository**
- Nome: `nosso-espaco` (pode ser privado 🔒)
- **Não** inicialize com README
- Copie o link do repositório

**3. Enviar os arquivos**

No terminal, dentro da pasta `nosso_espaco_deploy`:
```bash
git init
git add .
git commit -m "Nosso Espaço 💕"
git remote add origin https://github.com/SEU_USUARIO/nosso-espaco.git
git push -u origin main
```

**4. Conectar ao Railway**
- No Railway: **New Project → Deploy from GitHub repo**
- Selecione o repositório `nosso-espaco`
- Railway detecta Flask automaticamente ✨

**5. Configurar a senha (variável de ambiente)**
- No Railway, vá em **Variables** (menu do projeto)
- Clique em **New Variable**:
  - Nome: `SITE_PASSWORD`
  - Valor: `suasenhasecreta123`
- Clique em **Add** → projeto será reiniciado automaticamente

**6. Pegar o link público**
- No Railway, clique em **Settings → Networking → Generate Domain**
- Você terá algo como: `nosso-espaco-production.up.railway.app`
- Compartilhe esse link com sua pessoa! 💕

---

## 🚀 Opção 2 — Render

**Render** também é gratuito (pode demorar ~30s para abrir após inatividade).

### Passo a passo

**1.** Suba o projeto no GitHub (igual ao passo 2 e 3 acima)

**2.** Acesse [render.com](https://render.com) → **New → Web Service**

**3.** Conecte seu GitHub e selecione o repositório

**4.** Configure:
   - **Environment:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`

**5.** Em **Environment Variables**, adicione:
   - `SITE_PASSWORD` = `suasenhasecreta`
   - `SECRET_KEY` = qualquer texto aleatório longo

**6.** Clique em **Create Web Service**

---

## 💻 Rodar localmente (no seu PC)

Para usar só na rede Wi-Fi de casa:

```bash
# 1. Instalar dependências
pip install flask werkzeug

# 2. Rodar
python app.py
```

O terminal mostrará o link para celular, ex:  
`📱 Celular: http://192.168.1.10:5000`

Para mudar a senha localmente, edite `app.py` linha:
```python
SITE_PASSWORD = os.environ.get('SITE_PASSWORD', 'suanova senha aqui')
```

---

## 📸 Adicionar fotos/vídeos/músicas na nuvem

Como a hospedagem gratuita **não salva arquivos enviados pelo upload** (eles somem ao reiniciar), a forma ideal é:

1. Adicionar as mídias nas pastas **antes** de subir pro GitHub:
   - `static/media/photos/` → suas fotos
   - `static/media/videos/` → seus vídeos
   - `static/media/music/`  → suas músicas

2. Fazer commit e push — elas ficam salvas junto com o código

```bash
git add static/media/
git commit -m "Adicionando nossas fotos 💕"
git push
```

> ⚠️ **Atenção:** o GitHub tem limite de 100MB por arquivo. Para vídeos grandes, use o Git LFS ou hospede em outro lugar.

---

## 🔐 Resumo de segurança

| O que protege | Como |
|---|---|
| Página principal | Requer login com senha |
| Painel admin | Requer login com senha |
| Fotos, vídeos, músicas | Requer login com senha |
| Senha configurável | Variável de ambiente `SITE_PASSWORD` |
| Sessão segura | `SECRET_KEY` criptografado |

---

Feito com 💕 — só vocês dois têm acesso.
