FROM python:3.12-slim

WORKDIR /app

# Installer dépendances système pour SNMP
RUN apt-get update && apt-get install -y \
    snmp \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers
COPY requirements.txt .
COPY agent.py .

# Installer packages Python
RUN pip install --no-cache-dir -r requirements.txt

ENV TERM=xterm

CMD ["python", "agent.py"]
