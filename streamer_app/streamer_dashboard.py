import customtkinter as ctk
import subprocess
import threading
import os
import sys
import webbrowser

# Elegant, Minimalist, Classy UI Settings
APP_TITLE = "Pixulse Cloud | Streamer"
BG_COLOR = "#0B0C10"       # Deep obsidian black
FRAME_BG = "#13151A"       # Subtle elevation color
ACCENT_COLOR = "#45A29E"   # Elegant muted teal/cyan
TEXT_COLOR = "#FFFFFF"     # Crisp White
MUTED_TEXT = "#6B7280"     # Elegant gray for secondary text

# Correct production URL
STREAM_URL = "https://pixulse-signalling.onrender.com/streamer.html?room=game-1"

class InputEngineDashboard(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Configure window
        self.title(APP_TITLE)
        self.geometry("750x550")
        self.configure(fg_color=BG_COLOR)
        
        # Setup Theme
        ctk.set_appearance_mode("dark")
        
        # Grid layout
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        self.input_process = None
        
        # Determine paths
        if getattr(sys, 'frozen', False):
            self.base_dir = os.path.dirname(sys.executable)
            self.webrtc_dir = os.path.normpath(os.path.join(self.base_dir, "webrtc_gamestreaming"))
            icon_path = os.path.join(self.base_dir, "icon.ico")
        else:
            self.base_dir = os.path.dirname(os.path.abspath(__file__))
            self.webrtc_dir = os.path.normpath(os.path.join(self.base_dir, "..", "webrtc_gamestreaming"))
            icon_path = os.path.join(self.base_dir, "icon.ico")
            
        # Set Application Icon
        if os.path.exists(icon_path):
            self.iconbitmap(icon_path)

        
        self.create_widgets()
        self.check_node_installed()
        
    def create_widgets(self):
        # --- Top Header ---
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, padx=35, pady=(35, 10), sticky="ew")
        header_frame.grid_columnconfigure(0, weight=1)
        
        title_label = ctk.CTkLabel(
            header_frame, 
            text="PIXULSE STREAMER", 
            font=ctk.CTkFont(family="Helvetica", size=24, weight="bold"),
            text_color=TEXT_COLOR,
            anchor="w"
        )
        title_label.grid(row=0, column=0, sticky="w")
        
        subtitle_label = ctk.CTkLabel(
            header_frame,
            text="Remote Input Controller",
            font=ctk.CTkFont(family="Helvetica", size=13),
            text_color=MUTED_TEXT,
            anchor="w"
        )
        subtitle_label.grid(row=1, column=0, sticky="w")
        
        # --- Control Center Card ---
        control_card = ctk.CTkFrame(self, fg_color=FRAME_BG, corner_radius=12)
        control_card.grid(row=1, column=0, padx=35, pady=15, sticky="nsew")
        control_card.grid_columnconfigure(1, weight=1)
        control_card.grid_rowconfigure(0, weight=1)
        
        # Left Side: Status & Buttons
        action_frame = ctk.CTkFrame(control_card, fg_color="transparent")
        action_frame.grid(row=0, column=0, padx=30, pady=30, sticky="ns")
        
        self.status_label = ctk.CTkLabel(
            action_frame, 
            text="● Offline", 
            font=ctk.CTkFont(family="Helvetica", size=15),
            text_color="#EF4444" # Elegant Red
        )
        self.status_label.pack(anchor="center", pady=(20, 30))
        
        self.btn_toggle = ctk.CTkButton(
            action_frame, 
            text="Start Engine", 
            font=ctk.CTkFont(family="Helvetica", size=14, weight="bold"),
            fg_color=ACCENT_COLOR, 
            text_color="#000000",
            hover_color="#66FCF1",
            corner_radius=6,
            height=42,
            width=200,
            command=self.toggle_engine
        )
        self.btn_toggle.pack(anchor="center", pady=10)
        
        self.btn_browser = ctk.CTkButton(
            action_frame, 
            text="Open Stream Page", 
            font=ctk.CTkFont(family="Helvetica", size=14),
            fg_color="transparent", 
            text_color=TEXT_COLOR,
            border_color="#374151",
            border_width=1,
            hover_color="#1F2937",
            corner_radius=6,
            height=42,
            width=200,
            command=self.open_browser
        )
        self.btn_browser.pack(anchor="center", pady=10)
        
        # Right Side: Minimalist Terminal
        term_frame = ctk.CTkFrame(control_card, fg_color="#0B0C10", corner_radius=8, border_width=1, border_color="#1F2937")
        term_frame.grid(row=0, column=1, padx=(0, 30), pady=30, sticky="nsew")
        term_frame.grid_columnconfigure(0, weight=1)
        term_frame.grid_rowconfigure(0, weight=1)
        
        self.console = ctk.CTkTextbox(
            term_frame, 
            wrap="word", 
            font=ctk.CTkFont(family="Consolas", size=12),
            fg_color="transparent",
            text_color=MUTED_TEXT,
        )
        self.console.grid(row=0, column=0, padx=15, pady=15, sticky="nsew")
        
        self.log_message("System initialized.")
        
        # --- Footer ---
        footer_label = ctk.CTkLabel(
            self,
            text="Pixulse Cloud © 2026",
            font=ctk.CTkFont(family="Helvetica", size=11),
            text_color="#4B5563"
        )
        footer_label.grid(row=2, column=0, pady=(0, 15))

    def log_message(self, message, prefix="[SYSTEM]"):
        self.console.insert("end", f"{prefix} {message}\n")
        self.console.see("end")
        
    def check_node_installed(self):
        try:
            result = subprocess.run(["node", "-v"], capture_output=True, text=True, check=False)
            if result.returncode == 0:
                self.log_message(f"Runtime verified: Node.js {result.stdout.strip()}")
            else:
                self.log_message("Runtime warning: Node.js not found in PATH.", "[WARN]")
                self.btn_toggle.configure(state="disabled", text="Node.js Missing", fg_color="#374151")
        except FileNotFoundError:
            self.log_message("Runtime error: Node.js is not installed.", "[ERROR]")
            self.log_message("Please download from https://nodejs.org", "[ERROR]")
            self.btn_toggle.configure(state="disabled", text="Node.js Missing", fg_color="#374151")
        
    def read_process_output(self, process):
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                self.log_message(output.strip(), prefix="> ")
                
    def toggle_engine(self):
        if self.input_process is None:
            self.start_engine()
        else:
            self.stop_engine()

    def start_engine(self):
        if not os.path.exists(self.webrtc_dir):
            self.log_message(f"Directory missing: {self.webrtc_dir}", "[ERROR]")
            return
            
        self.log_message("Starting input agent...")
        
        try:
            startupinfo = None
            if os.name == 'nt':
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                
            self.input_process = subprocess.Popen(
                "npm run input-agent", 
                cwd=self.webrtc_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=True,
                startupinfo=startupinfo
            )
            
            threading.Thread(target=self.read_process_output, args=(self.input_process,), daemon=True).start()
            
            # Update UI
            self.status_label.configure(text="● Online", text_color=ACCENT_COLOR)
            self.btn_toggle.configure(text="Stop Engine", fg_color="transparent", border_width=1, border_color="#EF4444", text_color="#EF4444", hover_color="#450a0a")
            
        except Exception as e:
            self.log_message(f"Failed to start: {str(e)}", "[ERROR]")

    def stop_engine(self):
        if self.input_process:
            self.log_message("Stopping input agent...")
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(self.input_process.pid)], capture_output=True)
            self.input_process = None
            
            # Update UI
            self.status_label.configure(text="● Offline", text_color="#EF4444")
            self.btn_toggle.configure(text="Start Engine", fg_color=ACCENT_COLOR, border_width=0, text_color="#000000", hover_color="#66FCF1")
            self.log_message("Agent stopped.")
            
    def open_browser(self):
        self.log_message(f"Opening stream page: {STREAM_URL}")
        webbrowser.open(STREAM_URL)
            
    def on_closing(self):
        self.stop_engine()
        self.destroy()

if __name__ == "__main__":
    app = InputEngineDashboard()
    app.protocol("WM_DELETE_WINDOW", app.on_closing)
    app.mainloop()
