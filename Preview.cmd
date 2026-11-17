@echo off
cd /d "%~dp0"
echo Opening Dharshan's portfolio. Keep this window open while previewing.
start "" "http://127.0.0.1:8088"
python -m http.server 8088 --bind 127.0.0.1
