#!/bin/bash

# Configuración
PEM_FILE="mypem.pem"
REMOTE_USER="bitnami"
REMOTE_HOST="35.175.124.217"
DEPLOY_DIR="/home/bitnami/backend-convenios"
ARTIFACT_NAME="backend-deploy.zip"

echo "📦 Empaquetando aplicación..."
# Crear el zip excluyendo node_modules, logs, archivos de git y llaves pem
zip -r $ARTIFACT_NAME . -x "node_modules/*" "logs/*" ".git/*" ".env" "*.pem" "*.zip" "*.bat" "full_spec.json" "*.sh"

echo "🚀 Subiendo archivo al servidor..."
scp -i $PEM_FILE $ARTIFACT_NAME $REMOTE_USER@$REMOTE_HOST:~

echo "✅ Transferencia completada."
echo "Próximos pasos manuales:"
echo "1. ssh -i $PEM_FILE $REMOTE_USER@$REMOTE_HOST"
echo "2. unzip $ARTIFACT_NAME -d $DEPLOY_DIR"
echo "3. cd $DEPLOY_DIR && npm install"
echo "4. pm2 restart all || pm2 start src/server.js --name 'backend-convenios'"
