.PHONY: install dev dev-backend dev-frontend test demo-data

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

demo-data:
	cd backend && python -m scripts.make_demo_data

dev-backend:
	cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

dev:
	@echo "Starting SagarMitra (Backend + Frontend)..."
	python -m scripts.run_all

test:
	cd backend && pytest -v
