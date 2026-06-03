@echo off
echo Building Pixulse Cloud Streamer EXE...
pyinstaller --noconfirm --onedir --windowed --name "PixulseStreamer" --add-data "C:\Users\HP\Desktop\Pixulse-Cloud\Pixulse-Cloud\.venv\Lib\site-packages\customtkinter;customtkinter\" "streamer_dashboard.py"
echo Build Complete! Check the 'dist' folder for PixulseStreamer.exe
pause
