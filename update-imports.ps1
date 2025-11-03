# Update imports script for component reorganization

Write-Host "🔄 Updating component imports..." -ForegroundColor Cyan

$replacements = @{
    'from "@/components/titlebar"' = 'from "@/components/layout"'
    "from '@/components/titlebar'" = "from '@/components/layout'"
    'from "@/components/footer"' = 'from "@/components/layout"'
    "from '@/components/footer'" = "from '@/components/layout'"
    'from "@/components/blog-card"' = 'from "@/components/blog"'
    "from '@/components/blog-card'" = "from '@/components/blog'"
    'from "@/components/blog-comments"' = 'from "@/components/blog"'
    "from '@/components/blog-comments'" = "from '@/components/blog'"
    'from "@/components/blog-content-processor"' = 'from "@/components/blog"'
    "from '@/components/blog-content-processor'" = "from '@/components/blog'"
    'from "@/components/blog-list"' = 'from "@/components/blog"'
    "from '@/components/blog-list'" = "from '@/components/blog'"
    'from "@/components/blog-meta"' = 'from "@/components/blog"'
    "from '@/components/blog-meta'" = "from '@/components/blog'"
    'from "@/components/blog-post-content"' = 'from "@/components/blog"'
    "from '@/components/blog-post-content'" = "from '@/components/blog'"
    'from "@/components/blog-reactions"' = 'from "@/components/blog"'
    "from '@/components/blog-reactions'" = "from '@/components/blog'"
    'from "@/components/brand-logo"' = 'from "@/components/shared"'
    "from '@/components/brand-logo'" = "from '@/components/shared'"
    'from "@/components/contact-form"' = 'from "@/components/shared"'
    "from '@/components/contact-form'" = "from '@/components/shared'"
    'from "@/components/project-card"' = 'from "@/components/shared"'
    "from '@/components/project-card'" = "from '@/components/shared'"
    'from "@/components/skill-card"' = 'from "@/components/shared"'
    "from '@/components/skill-card'" = "from '@/components/shared'"
    'from "@/components/theme-provider"' = 'from "@/components/shared"'
    "from '@/components/theme-provider'" = "from '@/components/shared'"
    'from "@/components/userLocationInfo"' = 'from "@/components/shared"'
    "from '@/components/userLocationInfo'" = "from '@/components/shared'"
    'from "@/components/attachment-gallery-modal"' = 'from "@/components/media"'
    "from '@/components/attachment-gallery-modal'" = "from '@/components/media'"
    'from "@/components/custom-audio-player"' = 'from "@/components/media"'
    "from '@/components/custom-audio-player'" = "from '@/components/media'"
    'from "@/components/custom-video-player"' = 'from "@/components/media"'
    "from '@/components/custom-video-player'" = "from '@/components/media'"
    'from "@/components/link-preview-card"' = 'from "@/components/media"'
    "from '@/components/link-preview-card'" = "from '@/components/media'"
}

$files = Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse -Exclude node_modules

$updatedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content -replace [regex]::Escape($old), $new
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✓ Updated: $($file.FullName.Replace((Get-Location).Path + '\', ''))" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host ""
Write-Host "Updated $updatedCount files" -ForegroundColor Green
Write-Host "Component reorganization complete!" -ForegroundColor Cyan
