# Portfolio Website Cleanup Script
# This script removes unused packages and cleans up the codebase

Write-Host "🧹 Starting Portfolio Website Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "❌ node_modules not found. Please run 'npm install' first." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Removing unused packages..." -ForegroundColor Yellow
Write-Host ""

# Array of packages to remove
$packagesToRemove = @(
    "motion",
    "@shadcn/ui",
    "@tiptap/extension-table",
    "@tiptap/extension-table-cell",
    "@tiptap/extension-table-header",
    "@tiptap/extension-table-row",
    "@tiptap/extension-task-item",
    "@tiptap/extension-task-list",
    "@tiptap/extension-text-align",
    "@tiptap/extension-paragraph"
)

# Remove packages
foreach ($package in $packagesToRemove) {
    Write-Host "  Removing $package..." -ForegroundColor Gray
    npm uninstall $package 2>&1 | Out-Null
}

Write-Host ""
Write-Host "✅ Unused packages removed!" -ForegroundColor Green
Write-Host ""

# Clean npm cache
Write-Host "🗑️  Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "✅ Cache cleaned!" -ForegroundColor Green
Write-Host ""

# Reinstall dependencies
Write-Host "📥 Reinstalling dependencies to ensure clean state..." -ForegroundColor Yellow
npm install
Write-Host ""

# Run build to check for errors
Write-Host "🔨 Running build to verify everything works..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful! No broken imports." -ForegroundColor Green
} else {
    Write-Host "⚠️  Build had issues. Please check the output above." -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Cleanup complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor White
Write-Host "  - Removed $($packagesToRemove.Count) unused packages" -ForegroundColor Gray
Write-Host "  - Cleaned npm cache" -ForegroundColor Gray
Write-Host "  - Reinstalled dependencies" -ForegroundColor Gray
Write-Host "  - Verified build" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 See CLEANUP_REPORT.md for detailed information" -ForegroundColor Cyan
