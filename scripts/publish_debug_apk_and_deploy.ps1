param(
    [string]$Server = "192.168.50.150",
    [Parameter(Mandatory = $true)]
    [string]$User,
    [int]$Port = 22,
    [string]$RemotePath = "/mnt/disk-extra/hostingdata/cmnp2kdic001a4hr2yofnyk76/sawrly.com/public",
    [string]$IdentityFile = "",
    [string]$ApkNamePrefix = "sawrly",
    [ValidateSet("debug", "profile")]
    [string]$BuildMode = "debug",
    [switch]$SkipApkBuild,
    [switch]$SkipWebDeploy
)

$ErrorActionPreference = "Stop"

function Invoke-LoggedStep([string]$Name, [scriptblock]$Step) {
    Write-Host ""
    Write-Host "==> $Name"
    & $Step
}

$webRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$workspaceRoot = Split-Path -Parent $webRoot
$mobileRoot = Join-Path $workspaceRoot "sawrly-mobile"
$mobilePubspec = Join-Path $mobileRoot "pubspec.yaml"

if (-not (Test-Path $mobilePubspec)) {
    throw "Could not find pubspec.yaml at $mobilePubspec"
}

$pubspecText = Get-Content -LiteralPath $mobilePubspec -Raw
$versionMatch = [Regex]::Match($pubspecText, "(?m)^\s*version:\s*([^\s]+)\s*$")
if (-not $versionMatch.Success) {
    throw "Could not parse 'version:' from $mobilePubspec"
}

$mobileVersion = $versionMatch.Groups[1].Value.Trim()

$apkSource = Join-Path $mobileRoot "build\app\outputs\flutter-apk\app-$BuildMode.apk"
$downloadsDir = Join-Path $webRoot "public\downloads"
$apkTargetName = ""
$apkTarget = $null

if (-not $SkipApkBuild) {
    Invoke-LoggedStep "Building Android $BuildMode APK ($mobileVersion)" {
        Push-Location $mobileRoot
        try {
            flutter pub get
            flutter build apk --$BuildMode
        }
        finally {
            Pop-Location
        }
    }
}

if (-not (Test-Path $apkSource)) {
    throw "APK was not found: $apkSource"
}

Invoke-LoggedStep "Copying APK into sawrly-web/public/downloads" {
    New-Item -ItemType Directory -Force -Path $downloadsDir | Out-Null
    $existing = Get-ChildItem -LiteralPath $downloadsDir -File -ErrorAction SilentlyContinue
    $pattern = "^$([Regex]::Escape($ApkNamePrefix))-(\d+)\.apk$"
    $max = 0
    foreach ($file in $existing) {
        $match = [Regex]::Match($file.Name, $pattern)
        if ($match.Success) {
            $n = [int]$match.Groups[1].Value
            if ($n -gt $max) { $max = $n }
        }
    }
    $next = $max + 1
    $script:apkTargetName = "$ApkNamePrefix-$($next.ToString('00')).apk"
    $script:apkTarget = Join-Path $downloadsDir $script:apkTargetName
    Copy-Item -LiteralPath $apkSource -Destination $script:apkTarget -Force
}

$sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $apkTarget).Hash
Write-Host ""
Write-Host "APK: $apkTargetName"
Write-Host "MODE: $BuildMode"
Write-Host "VERSION: $mobileVersion"
Write-Host "SHA256: $sha256"

if (-not $SkipWebDeploy) {
    Invoke-LoggedStep "Deploying sawrly-web (includes APK in /downloads)" {
        $deployScript = Join-Path $webRoot "scripts\deploy_sawrly.ps1"
        if (-not (Test-Path $deployScript)) {
            throw "Deploy script not found: $deployScript"
        }

        & powershell -ExecutionPolicy Bypass -File $deployScript `
            -Server $Server `
            -User $User `
            -Port $Port `
            -RemotePath $RemotePath `
            -IdentityFile $IdentityFile
    }
}

Write-Host ""
Write-Host "Public URL: https://sawrly.com/downloads/$apkTargetName"
