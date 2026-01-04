# Script para rodar o projeto Dieta

Write-Host "🚀 Iniciando projeto Dieta..." -ForegroundColor Green

# Iniciar backend
Write-Host "`n📦 Iniciando Backend na porta 3001..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\backend'; npm run start:dev"

# Aguardar alguns segundos para o backend iniciar
Start-Sleep -Seconds 5

# Iniciar frontend
Write-Host "`n🎨 Iniciando Frontend na porta 3005..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\frontend'; npx next dev -p 3005"

Write-Host "`n✅ Projeto iniciado!" -ForegroundColor Green
Write-Host "📍 Frontend: http://localhost:3005" -ForegroundColor Yellow
Write-Host "📍 Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "📍 API Docs: http://localhost:3001/api/docs" -ForegroundColor Yellow
