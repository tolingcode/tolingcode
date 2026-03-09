# 发布技能到本地 registry 服务器
param(
    [string]$Path = "./skills/gigacloud-warehouse",
    [string]$Type = "skills",
    [string]$Name = "gigacloud-warehouse",
    [string]$Version = "2026.03.08",
    [string]$RegistryUrl = "http://localhost:3000/api/registry"
)

$absPath = Resolve-Path $Path
$tarballPath = "$Path\$Name-$Version.tgz"

Write-Host "`n📦 打包 $Name@$Version..." -ForegroundColor Blue

# 创建 tarball
npm pack $absPath --pack-destination $Path | Out-Null

if (!(Test-Path $tarballPath)) {
    Write-Host "❌ 打包失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 打包完成：$tarballPath" -ForegroundColor Green

# 读取 package.json
$pkgJson = Get-Content "$absPath\package.json" -Raw | ConvertFrom-Json

# 上传到 registry
Write-Host "`n📤 上传到 registry..." -ForegroundColor Blue

$form = @{
    package = Get-Item $tarballPath
    name = $Name
    version = $Version
    type = $Type
}

try {
    $response = Invoke-RestMethod -Uri "$RegistryUrl/publish" -Method Post -Form $form
    
    if ($response.success) {
        Write-Host "✅ 发布成功！" -ForegroundColor Green
        Write-Host "   包名：$Name" -ForegroundColor Gray
        Write-Host "   版本：$Version" -ForegroundColor Gray
        Write-Host "   类型：$Type" -ForegroundColor Gray
        Write-Host "   下载：$RegistryUrl/$Type/$Name" -ForegroundColor Gray
    } else {
        Write-Host "❌ 发布失败：$($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 上传失败：$($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 清理 tarball
Remove-Item $tarballPath -Force
Write-Host "`n🎉 完成！" -ForegroundColor Green
