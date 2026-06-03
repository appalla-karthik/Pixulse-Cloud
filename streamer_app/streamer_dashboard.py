import customtkinter as ctk
import subprocess
import threading
import os
import sys

# Constants for a sleek, professional Cyber-Tech UI
APP_TITLE = "Pixulse Cloud - Input Engine Controller"
BG_COLOR = "#0D0D12"       # Deep tech black
FRAME_BG = "#15151E"       # Slightly lighter for contrast
ACCENT_COLOR = "#00E5FF"   # Neon Cyan (No Pink)
TEXT_COLOR = "#FFFFFF"     # White
MUTED_TEXT = "#8B8B99"     # Grayed out text

class InputEngineDashboard(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        # Configure window
        self.title(APP_TITLE)
        self.geometry("700x500")
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
        else:
            self.base_dir = os.path.dirname(os.path.abspath(__file__))
            
        self.webrtc_dir = os.path.normpath(os.path.join(self.base_dir, "..", "webrtc_gamestreaming"))
        
        self.create_widgets()
        
    def create_widgets(self):
        # --- Top Header ---
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, padx=30, pady=(30, 10), sticky="ew")
        header_frame.grid_columnconfigure(0, weight=1)
        
        title_label = ctk.CTkLabel(
            header_frame, 
            text="PIXULSE INPUT ENGINE", 
            font=ctk.CTkFont(family="Segoe UI Black", size=28, weight="bold"),
            text_color=TEXT_COLOR,
            anchor="w"
        )
        title_label.grid(row=0, column=0, sticky="w")
        
        subtitle_label = ctk.CTkLabel(
            header_frame,
            text="Production-Grade Remote Input Handler",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color=MUTED_TEXT,
            anchor="w"
        )
        subtitle_label.grid(row=1, column=0, sticky="w")
        
        # --- Control Center Card ---
        control_card = ctk.CTkFrame(self, fg_color=FRAME_BG, corner_radius=15, border_width=1, border_color="#2A2A35")
        control_card.grid(row=1, column=0, padx=30, pady=10, sticky="nsew")
        control_card.grid_columnconfigure(1, weight=1)
        control_card.grid_rowconfigure(0, weight=1)
        
        # Left Side: Status & Button
        action_frame = ctk.CTkFrame(control_card, fg_color="transparent")
        action_frame.grid(row=0, column=0, padx=30, pady=30, sticky="ns")
        
        self.status_label = ctk.CTkLabel(
            action_frame, 
            text="STATUS: OFFLINE", 
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color="#FF4C4C" # Red for offline
        )
        self.status_label.pack(anchor="center", pady=(20, 10))
        
        self.btn_toggle = ctk.CTkButton(
            action_frame, 
            text="INITIALIZE ENGINE", 
            font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold"),
            fg_color=ACCENT_COLOR, 
            text_color=BG_COLOR,
            hover_color="#00B3CC",
            corner_radius=8,
            height=50,
            width=220,
            command=self.toggle_engine
        )
        self.btn_toggle.pack(anchor="center", pady=10)
        
        # Right Side: Live Terminal Output
        term_frame = ctk.CTkFrame(control_card, fg_color="#08080C", corner_radius=8)
        term_frame.grid(row=0, column=1, padx=(0, 30), pady=30, sticky="nsew")
        term_frame.grid_columnconfigure(0, weight=1)
        term_frame.grid_rowconfigure(0, weight=1)
        
        self.console = ctk.CTkTextbox(
            term_frame, 
            wrap="word", 
            font=ctk.CTkFont(family="Consolas", size=12),
            fg_color="transparent",
            text_color="#00FF9D", # Terminal green/cyan
        )
        self.console.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        
        self.log_message("System initialized. Awaiting user input...", "[SYSTEM]")
        
        # --- Footer ---
        footer_label = ctk.CTkLabel(
            self,
            text="Pixulse Cloud Streaming Architecture v1.0",
            font=ctk.CTkFont(family="Segoe UI", size=10),
            text_color=MUTED_TEXT
        )
        footer_label.grid(row=2, column=0, pady=(0, 15))

    def log_message(self, message, prefix="[INFO]"):
        self.console.insert("end", f"{prefix} {message}\n")
        self.console.see("end")
        
    def read_process_output(self, process):
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                self.log_message(output.strip(), prefix="[NODE]")
                
    def toggle_engine(self):
        if self.input_process is None:
            self.start_engine()
        else:
            self.stop_engine()

    def start_engine(self):
        if not os.path.exists(self.webrtc_dir):
            self.log_message(f"ERROR: Target directory missing -> {self.webrtc_dir}", "[SYS]")
            return
            
        self.log_message("Establishing secure connection to Input Agent...", "[SYS]")
        
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
            self.status_label.configure(text="STATUS: ONLINE", text_color=ACCENT_COLOR)
            self.btn_toggle.configure(text="TERMINATE ENGINE", fg_color="#FF4C4C", text_color="#FFFFFF", hover_color="#CC0000")
            
        except Exception as e:
            self.log_message(f"Boot failure: {str(e)}", "[ERROR]")

    def stop_engine(self):
        if self.input_process:
            self.log_message("Terminating Input Agent connection...", "[SYS]")
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(self.input_process.pid)], capture_output=True)
            self.input_process = None
            
            # Update UI
            self.status_label.configure(text="STATUS: OFFLINE", text_color="#FF4C4C")
            self.btn_toggle.configure(text="INITIALIZE ENGINE", fg_color=ACCENT_COLOR, text_color=BG_COLOR, hover_color="#00B3CC")
            self.log_message("Connection severed successfully.", "[SYS]")
            
    def on_closing(self):
        self.stop_engine()
        self.destroy()

if __name__ == "__main__":
    app = InputEngineDashboard()
    app.protocol("WM_DELETE_WINDOW", app.on_closing)
    app.mainloop()
