# -*- mode: python ; coding: utf-8 -*-
# nosso_espaco.spec — PyInstaller build file
# Run: pyinstaller nosso_espaco.spec

import os
from PyInstaller.utils.hooks import collect_data_files

block_cipher = None

# Collect Flask/Jinja2 templates and static files
added_files = [
    ('templates', 'templates'),
    ('static',    'static'),
    ('data',      'data'),
]

a = Analysis(
    ['app.py'],
    pathex=['.'],
    binaries=[],
    datas=added_files,
    hiddenimports=[
        'flask',
        'werkzeug',
        'werkzeug.serving',
        'werkzeug.utils',
        'jinja2',
        'jinja2.ext',
        'click',
        'itsdangerous',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='NossoEspaco',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,       # Set False to hide terminal window on Windows
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    # icon='static/icon.ico',  # Uncomment and add icon.ico to use custom icon
)
