#!/usr/bin/env pwsh
# TolingCode Skill Publish Script (PowerShell)
# Usage: .\publish-skill.ps1 <skill-name> [version]

param(
    [Parameter(Mandatory=$true)]
    [string]$SkillName,
    
    [string]$Version = (Get-Date -Format "yyyy.MM.dd"),
    
    [string]$ServerHost = "iZwz91qi4kjnj5l58gbhj5Z",
    [string]$ServerUser = "root",
    [string]$SkillSource = "C:\Users\Administrator\.openclaw\workspace\skills"
)

Write-Host "📦 Publishing $SkillName@$Version" -ForegroundColor Blue
Write-Host ""

# 1. Check source exists
$sourcePath = Join-Path $SkillSource $SkillName
if (!(Test-Path $sourcePath)) {
    Write-Host "❌ Skill not found: $sourcePath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Source: $sourcePath" -ForegroundColor Green

# 2. Create tar.gz
$tarFile = "$SkillName-$Version.tar.gz"
Write-Host "📦 Creating $tarFile..." -ForegroundColor Yellow
tar -czf $tarFile -C $SkillSource $SkillName

if (!(Test-Path $tarFile)) {
    Write-Host "❌ Failed to create tarball" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Created: $tarFile ($(Get-Item $tarFile).Length bytes)" -ForegroundColor Green

# 3. Upload to server
Write-Host "📤 Uploading to server..." -ForegroundColor Yellow
scp $tarFile "${ServerUser}@${ServerHost}:/var/www/toling.me/packages/skills/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Uploaded to /var/www/toling.me/packages/skills/" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next step: Update registry.json on server" -ForegroundColor Yellow
Write-Host ""
Write-Host "SSH to server and run:" -ForegroundColor Gray
Write-Host @"
cat >> /var/www/toling.me/registry.json << 'EOF'
{
  "skills": {
    "$SkillName": {
      "description": "$SkillName skill",
      "latestVersion": "$Version",
      "versions": {
        "$Version": {
          "publishedAt": "$(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")"
        }
      }
    }
  },
  "apps": {}
}
EOF
"@

Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
