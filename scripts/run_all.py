import subprocess
import sys
import os
import time

def run_all():
    print("=" * 60)
    print("Starting SagarMitra Marine Intelligence Platform...")
    print("=" * 60)

    # Start backend
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=os.getcwd())
    print("[✓] Backend service initiated on http://localhost:8000")

    # Start frontend
    frontend_cmd = ["npm", "run", "dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=os.path.join(os.getcwd(), "frontend"), shell=True)
    print("[✓] Frontend service initiated on http://localhost:3000")

    print("\nSagarMitra is live!")
    print("• Web Dashboard: http://localhost:3000")
    print("• Backend API & Docs: http://localhost:8000/docs")
    print("Press Ctrl+C to terminate all services.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("SagarMitra stopped.")

if __name__ == "__main__":
    run_all()
