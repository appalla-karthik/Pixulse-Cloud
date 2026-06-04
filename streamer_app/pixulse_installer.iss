[Setup]
AppName=Pixulse Streamer
AppVersion=1.1
AppPublisher=Pixulse Cloud
DefaultDirName={autopf}\PixulseStreamer
DefaultGroupName=Pixulse Streamer
OutputDir=.\InstallerOutput
OutputBaseFilename=PixulseStreamer_Setup
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\PixulseStreamer.exe

[Files]
; Copy the icon
Source: "icon.ico"; DestDir: "{app}"; Flags: ignoreversion

; Copy the main Python Executable and all its DLLs/Dependencies
Source: "dist\PixulseStreamer\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; Copy the Node.js WebRTC gamestreaming folder (excluding unnecessary dev files if any, but we'll take all for safety)
Source: "..\webrtc_gamestreaming\*"; DestDir: "{app}\webrtc_gamestreaming"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Create Desktop Shortcut
Name: "{autodesktop}\Pixulse Streamer"; Filename: "{app}\PixulseStreamer.exe"; Tasks: desktopicon

; Create Start Menu Shortcut
Name: "{group}\Pixulse Streamer"; Filename: "{app}\PixulseStreamer.exe"
Name: "{group}\Uninstall Pixulse Streamer"; Filename: "{uninstallexe}"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional icons:"

[Run]
; Option to launch after installation
Filename: "{app}\PixulseStreamer.exe"; Description: "Launch Pixulse Streamer now"; Flags: nowait postinstall skipifsilent
