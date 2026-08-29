param(
    [Parameter(Mandatory = $true)] [string]$AdminToken,
    [string]$OutputDirectory = "."
)

$ErrorActionPreference = "Stop"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$profile = Join-Path $env:TEMP ("sawrly-theme-cdp-" + [Guid]::NewGuid().ToString("N"))
$port = 9337

function Send-Cdp {
    param(
        [System.Net.WebSockets.ClientWebSocket]$Socket,
        [int]$Id,
        [string]$Method,
        [hashtable]$Params = @{}
    )
    $request = @{ id = $Id; method = $Method; params = $Params } | ConvertTo-Json -Depth 12 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($request)
    $segment = [ArraySegment[byte]]::new($bytes)
    [void]$Socket.SendAsync($segment, [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    while ($true) {
        $stream = [IO.MemoryStream]::new()
        do {
            $buffer = New-Object byte[] 65536
            $received = $Socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).GetAwaiter().GetResult()
            $stream.Write($buffer, 0, $received.Count)
        } while (-not $received.EndOfMessage)
        $text = [Text.Encoding]::UTF8.GetString($stream.ToArray())
        $stream.Dispose()
        $message = $text | ConvertFrom-Json
        if ($message.id -eq $Id) { return $message }
    }
}

$process = Start-Process -FilePath $chrome -WindowStyle Hidden -PassThru -ArgumentList @(
    "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-cache",
    "--remote-debugging-port=$port", "--user-data-dir=$profile", "about:blank"
)

try {
    $version = $null
    for ($attempt = 0; $attempt -lt 30 -and $null -eq $version; $attempt++) {
        Start-Sleep -Milliseconds 250
        try { $version = Invoke-RestMethod "http://127.0.0.1:$port/json/version" } catch {}
    }
    if ($null -eq $version) { throw "Chrome DevTools did not start" }

    $tab = Invoke-RestMethod -Method Put "http://127.0.0.1:$port/json/new?about:blank"
    $socket = [System.Net.WebSockets.ClientWebSocket]::new()
    [void]$socket.ConnectAsync([Uri]$tab.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()

    [void](Send-Cdp $socket 1 "Network.enable")
    [void](Send-Cdp $socket 2 "Network.setCookie" @{
        name = "admin_token"; value = $AdminToken; domain = "sawrly.com";
        path = "/"; secure = $true; httpOnly = $true; sameSite = "Lax"
    })
    [void](Send-Cdp $socket 3 "Page.enable")

    $viewports = @(
        @{ width = 1920; height = 1080; name = "1920x1080" },
        @{ width = 1440; height = 900; name = "1440x900" },
        @{ width = 1366; height = 768; name = "1366x768" },
        @{ width = 1280; height = 720; name = "1280x720" }
    )

    $id = 10
    foreach ($viewport in $viewports) {
        [void](Send-Cdp $socket ($id++) "Emulation.setDeviceMetricsOverride" @{
            width = $viewport.width; height = $viewport.height; deviceScaleFactor = 1; mobile = $false
        })
        [void](Send-Cdp $socket ($id++) "Page.navigate" @{ url = "https://sawrly.com/admin/theme-settings" })
        Start-Sleep -Seconds 7
        $metrics = Send-Cdp $socket ($id++) "Runtime.evaluate" @{
            returnByValue = $true
            expression = @"
(() => {
  const phone = document.querySelector('.theme-preview-phone');
  const preview = document.querySelector('.theme-studio-preview-column');
  const actions = document.querySelector('.theme-preview-actions');
  const editor = document.querySelector('.theme-studio-editor-column');
  const rect = (node) => node ? ({top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height}) : null;
  return {url: location.href, viewport: {width: innerWidth, height: innerHeight}, phone: rect(phone), preview: rect(preview), actions: rect(actions), editor: rect(editor), horizontalOverflow: document.documentElement.scrollWidth > innerWidth};
})()
"@
        }
        $value = $metrics.result.result.value
        $value | ConvertTo-Json -Compress | Write-Output
        if ($viewport.name -eq "1366x768") {
            $quickShot = Send-Cdp $socket ($id++) "Page.captureScreenshot" @{ format = "png"; fromSurface = $true; captureBeyondViewport = $false }
            $quickPath = Join-Path $OutputDirectory "theme-studio-1366x768-quick.png"
            [IO.File]::WriteAllBytes($quickPath, [Convert]::FromBase64String($quickShot.result.data))
            $sticky = Send-Cdp $socket ($id++) "Runtime.evaluate" @{
                returnByValue = $true
                expression = @"
(() => {
  const editor = document.querySelector('.theme-studio-editor-column');
  const preview = document.querySelector('.theme-studio-preview-column');
  const before = preview.getBoundingClientRect().top;
  document.querySelectorAll('.theme-studio-tab')[4]?.click();
  return new Promise(resolve => setTimeout(() => {
    editor.scrollTop = Math.min(600, editor.scrollHeight - editor.clientHeight);
    requestAnimationFrame(() => resolve({before, after: preview.getBoundingClientRect().top, editorScrollTop: editor.scrollTop, editorScrollRange: editor.scrollHeight - editor.clientHeight}));
  }, 800));
})()
"@
                awaitPromise = $true
            }
            @{ sticky = $sticky.result.result.value } | ConvertTo-Json -Compress | Write-Output
        }
        $shot = Send-Cdp $socket ($id++) "Page.captureScreenshot" @{ format = "png"; fromSurface = $true; captureBeyondViewport = $false }
        $path = Join-Path $OutputDirectory ("theme-studio-" + $viewport.name + ".png")
        [IO.File]::WriteAllBytes($path, [Convert]::FromBase64String($shot.result.data))
    }
    $socket.Dispose()
}
finally {
    if ($process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force }
}
