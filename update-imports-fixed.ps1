# Update imports script for component reorganization

Write-Host "Updating component imports..." -ForegroundColor Cyan

$replacements = @{
    '@/components/titlebar' = '@/components/layout'
    '@/components/footer' = '@/components/layout'
    '@/components/blog-card' = '@/components/blog'
    '@/components/blog-comments' = '@/components/blog'
    '@/components/blog-content-processor' = '@/components/blog'
    '@/components/blog-list' = '@/components/blog'
    '@/components/blog-meta' = '@/components/blog'
    '@/components/blog-post-content' = '@/components/blog'
    '@/components/blog-reactions' = '@/components/blog'
    '@/components/brand-logo' = '@/components/shared'
    '@/components/contact-form' = '@/components/shared'
    '@/components/project-card' = '@/components/shared'
    '@/components/skill-card' = '@/components/shared'
    '@/components/theme-provider' = '@/components/shared'
    '@/components/userLocationInfo' = '@/components/shared'
    '@/components/attachment-gallery-modal' = '@/components/media'
    '@/components/custom-audio-player' = '@/components/media'
    '@/components/custom-video-player' = '@/components/media'
    '@/components/link-preview-card' = '@/components/media'
}

$files = Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse | Where-Object { $_.FullName -notmatch 'node_modules' }

$updatedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content.Replace($old, $new)
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $relativePath = $file.FullName.Replace((Get-Location).Path, '.')
        Write-Host "  Updated: $relativePath" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host ""
Write-Host "Updated $updatedCount files" -ForegroundColor Green
Write-Host "Done!" -ForegroundColor Cyan
