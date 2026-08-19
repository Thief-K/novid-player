# setup-mpv.ps1
# 自动检测或下载 Windows 64 位 MPV 可执行程序至 src-tauri/binaries 目录

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$binariesDir = Join-Path $projectRoot "src-tauri\binaries"

if (-not (Test-Path $binariesDir)) {
    New-Item -ItemType Directory -Path $binariesDir -Force | Out-Null
}

$mpvTarget = Join-Path $binariesDir "mpv.exe"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   NovaPlayer - MPV 引擎依赖检测与配置程序" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. 检查当前 binaries 目录是否已有 mpv.exe
if (Test-Path $mpvTarget) {
    Write-Host "[OK] 已检测到 MPV 引擎文件: $mpvTarget" -ForegroundColor Green
    exit 0
}

# 2. 检查系统 PATH 是否已安装 mpv
$sysMpv = Get-Command mpv -ErrorAction SilentlyContinue
if ($sysMpv) {
    Write-Host "[INFO] 在系统 PATH 中找到 mpv: $($sysMpv.Source)" -ForegroundColor Yellow
    Write-Host "[INFO] 正在复制到工程目录: $mpvTarget ..."
    Copy-Item $sysMpv.Source -Destination $mpvTarget
    Write-Host "[OK] MPV 配置完成!" -ForegroundColor Green
    exit 0
}

# 3. 自动从 GitHub / SourceForge 下载经过测试的 MPV Windows 64位构建版
Write-Host "[DOWNLOAD] 未检测到 MPV，准备自动下载 Windows x64 便携版 MPV..." -ForegroundColor Yellow

$downloadUrls = @(
    "https://github.com/shinchiro/mpv-winbuild-cmake/releases/download/20241229/mpv-x86_64-v3-20241229-git-822e176.7z",
    "https://github.com/zhongfly/mpv-winbuild/releases/download/2024-12-29-37ea816/mpv-x86_64-v3-20241229-git-37ea816.7z",
    "https://sourceforge.net/projects/mpv-player-windows/files/64bit/mpv-x86_64-20241229-git-822e176.7z/download"
)

$zipPath = Join-Path $env:TEMP "mpv-download.7z"
$extractedPath = Join-Path $env:TEMP "mpv-extracted"

$downloaded = $false
foreach ($url in $downloadUrls) {
    try {
        Write-Host "正在从 $url 下载..."
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing -TimeoutSec 60
        $downloaded = $true
        break
    } catch {
        Write-Warning "下载失败: $_. 尝试下一个下载源..."
    }
}

if ($downloaded -and (Test-Path $zipPath)) {
    try {
        Write-Host "正在解压 MPV 组件..."
        # 尝试使用 7z 或 tar 解压
        if (Get-Command 7z -ErrorAction SilentlyContinue) {
            7z x -y -o"$extractedPath" "$zipPath" | Out-Null
        } elseif (Get-Command tar -ErrorAction SilentlyContinue) {
            if (-not (Test-Path $extractedPath)) { New-Item -ItemType Directory -Path $extractedPath -Force | Out-Null }
            tar -xf "$zipPath" -C "$extractedPath"
        }

        $foundMpv = Get-ChildItem -Path $extractedPath -Filter "mpv.exe" -Recurse | Select-Object -First 1
        if ($foundMpv) {
            Copy-Item $foundMpv.FullName -Destination $mpvTarget
            Write-Host "[OK] MPV 已成功配置至: $mpvTarget" -ForegroundColor Green
            # 清理临时文件
            Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
            Remove-Item $extractedPath -Recurse -Force -ErrorAction SilentlyContinue
            exit 0
        }
    } catch {
        Write-Warning "自动解压失败: $_"
    }
}

Write-Host "--------------------------------------------------" -ForegroundColor Yellow
Write-Host "【手动配置说明】若由于网络原因下载受限，您可以：" -ForegroundColor Yellow
Write-Host "1. 前往 https://mpv.io/installation/ 或 https://github.com/shinchiro/mpv-winbuild-cmake/releases 下载 Windows 64-bit mpv.exe" -ForegroundColor Yellow
Write-Host "2. 将解压出来的 mpv.exe 直接放入项目目录：" -ForegroundColor Yellow
Write-Host "   $binariesDir\mpv.exe" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Yellow
