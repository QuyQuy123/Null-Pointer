FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DATABASE_URL=sqlite:////data/nhip_vien.db

WORKDIR /app

COPY pyproject.toml README.md ./
COPY app ./app

RUN mkdir -p /data
RUN pip install --no-cache-dir .

EXPOSE 8000
VOLUME ["/data"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
