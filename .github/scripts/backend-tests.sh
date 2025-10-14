#!/usr/bin/env bash
set -euxo pipefail

echo "🧪 Starting Backend Tests..."
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"

# Garantir que estamos no diretório backend
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: package.json not found. Are we in the backend directory?"
    exit 1
fi

# Instalar dependências se necessário
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing backend dependencies..."
    npm ci || npm install --legacy-peer-deps
fi

# Executar testes unitários com cobertura
echo "🎯 Running unit tests with coverage..."
npm run test

echo "✅ Backend tests completed successfully!"