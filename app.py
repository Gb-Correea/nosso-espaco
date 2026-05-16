import os
import json
import socket
import threading
import webbrowser
from datetime import datetime
from functools import wraps
from flask import (Flask, render_template, request, jsonify,
                   send_from_directory, session, redirect, url_for)
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'nosso-espaco-chave-secreta-2024')
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_FILE  = os.path.join(BASE_DIR, 'data', 'config.json')
PHOTOS_DIR = os.path.join(BASE_DIR, 'static', 'media', 'photos')
VIDEOS_DIR = os.path.join(BASE_DIR, 'static', 'media', 'videos')
MUSIC_DIR  = os.path.join(BASE_DIR, 'static', 'media', 'music')

ALLOWED_PHOTOS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'}
ALLOWED_VIDEOS = {'mp4', 'webm', 'mov', 'avi'}
ALLOWED_MUSIC  = {'mp3', 'wav', 'ogg', 'flac', 'm4a'}

# Altere aqui ou defina SITE_PASSWORD como variável de ambiente
SITE_PASSWORD = os.environ.get('SITE_PASSWORD', 'nossoamor2024')

# ─── Auth ─────────────────────────────────────────────────────────────────────

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('authenticated'):
            return redirect(url_for('login'))
        return fn(*args, **kwargs)
    return wrapper

# ─── Helpers ─────────────────────────────────────────────────────────────────

def allowed_file(filename, allowed_set):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_set

def load_config():
    if not os.path.exists(DATA_FILE):
        return get_default_config()
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_config(config):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

def get_default_config():
    return {
        "couple_names": ["Amor", "Vida"],
        "start_date": "2024-01-01",
        "carousel_interval": 5000,
        "animation_speed": 1200,
        "autoplay_music": False,
        "shuffle_media": False,
        "theme": "dark_rose",
        "messages": [
            "Cada momento ao seu lado é um presente 💕",
            "Você é o lar que sempre procurei 🌹",
            "Com você, até o silêncio é lindo ✨",
            "Meu coração tem seu nome gravado 💝",
            "Você transforma meus dias comuns em extraordinários 🌸",
            "Cada sorriso seu é meu lugar favorito no mundo 💫",
            "Obrigado por existir e fazer parte da minha vida 🦋",
            "Te amar é a coisa mais natural que já senti 💖"
        ],
        "timeline": [
            {"date": "2024-01-01", "title": "Nosso primeiro encontro", "emoji": "💕"},
            {"date": "2024-02-14", "title": "Primeiro Dia dos Namorados", "emoji": "🌹"},
            {"date": "2024-06-01", "title": "6 meses juntos", "emoji": "🎉"}
        ]
    }

def scan_media():
    photos = [f for f in sorted(os.listdir(PHOTOS_DIR)) if allowed_file(f, ALLOWED_PHOTOS)]
    videos = [f for f in sorted(os.listdir(VIDEOS_DIR)) if allowed_file(f, ALLOWED_VIDEOS)]
    music  = [f for f in sorted(os.listdir(MUSIC_DIR))  if allowed_file(f, ALLOWED_MUSIC)]
    return photos, videos, music

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]; s.close(); return ip
    except:
        return "127.0.0.1"

# ─── Login / Logout ───────────────────────────────────────────────────────────

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if request.form.get('senha', '') == SITE_PASSWORD:
            session['authenticated'] = True
            return redirect(url_for('index'))
        error = 'Senha incorreta 💔'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# ─── Rotas protegidas ─────────────────────────────────────────────────────────

@app.route('/')
@require_auth
def index():
    config = load_config()
    photos, videos, music = scan_media()
    return render_template('index.html', config=config,
        photos=photos, videos=videos, music=music, local_ip=get_local_ip())

@app.route('/admin')
@require_auth
def admin():
    config = load_config()
    photos, videos, music = scan_media()
    return render_template('admin.html', config=config,
                           photos=photos, videos=videos, music=music)

@app.route('/api/config', methods=['GET'])
@require_auth
def get_config():
    config = load_config()
    photos, videos, music = scan_media()
    config.update({'photos': photos, 'videos': videos, 'music': music})
    return jsonify(config)

@app.route('/api/config', methods=['POST'])
@require_auth
def update_config():
    data = request.json; config = load_config()
    for key in ['couple_names','start_date','carousel_interval','animation_speed',
                'autoplay_music','shuffle_media','theme','messages','timeline']:
        if key in data: config[key] = data[key]
    save_config(config)
    return jsonify({"status": "ok"})

def _upload(request, folder, allowed):
    if 'file' not in request.files: return jsonify({"error": "No file"}), 400
    file = request.files['file']
    if file and allowed_file(file.filename, allowed):
        filename = secure_filename(file.filename)
        base, ext = os.path.splitext(filename); c = 1
        while os.path.exists(os.path.join(folder, filename)):
            filename = f"{base}_{c}{ext}"; c += 1
        file.save(os.path.join(folder, filename))
        return jsonify({"status": "ok", "filename": filename})
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/upload/photo',  methods=['POST']) 
@require_auth
def upload_photo():  return _upload(request, PHOTOS_DIR, ALLOWED_PHOTOS)

@app.route('/api/upload/video',  methods=['POST'])
@require_auth
def upload_video():  return _upload(request, VIDEOS_DIR, ALLOWED_VIDEOS)

@app.route('/api/upload/music',  methods=['POST'])
@require_auth
def upload_music():  return _upload(request, MUSIC_DIR,  ALLOWED_MUSIC)

def _delete(folder, filename):
    path = os.path.join(folder, secure_filename(filename))
    if os.path.exists(path): os.remove(path)
    return jsonify({"status": "ok"})

@app.route('/api/delete/photo/<filename>', methods=['DELETE'])
@require_auth
def delete_photo(filename): return _delete(PHOTOS_DIR, filename)

@app.route('/api/delete/video/<filename>', methods=['DELETE'])
@require_auth
def delete_video(filename): return _delete(VIDEOS_DIR, filename)

@app.route('/api/delete/music/<filename>',  methods=['DELETE'])
@require_auth
def delete_music(filename):  return _delete(MUSIC_DIR,  filename)

@app.route('/api/days-together')
@require_auth
def days_together():
    config = load_config()
    try:
        start = datetime.strptime(config['start_date'], '%Y-%m-%d')
        return jsonify({"days": (datetime.now() - start).days})
    except:
        return jsonify({"days": 0})

@app.route('/static/media/photos/<filename>')
@require_auth
def serve_photo(filename): return send_from_directory(PHOTOS_DIR, filename)

@app.route('/static/media/videos/<filename>')
@require_auth
def serve_video(filename): return send_from_directory(VIDEOS_DIR, filename)

@app.route('/static/media/music/<filename>')
@require_auth
def serve_music(filename):  return send_from_directory(MUSIC_DIR,  filename)

# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    local_ip = get_local_ip()
    print(f"\n{'='*55}")
    print("  💕  Nosso Espaço — Iniciando...")
    print(f"{'='*55}")
    print(f"  🖥️  Local:   http://localhost:{port}")
    print(f"  📱  Celular: http://{local_ip}:{port}")
    print(f"  ⚙️  Admin:   http://localhost:{port}/admin")
    print(f"  🔒  Senha:   {SITE_PASSWORD}")
    print(f"{'='*55}\n")
    threading.Thread(target=lambda: (__import__('time').sleep(1.2),
        webbrowser.open(f"http://localhost:{port}")), daemon=True).start()
    app.run(host='0.0.0.0', port=port, debug=False)
