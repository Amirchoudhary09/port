<#
  Zero-dependency static server for this portfolio.
  Uses a raw TcpListener, so it needs no Node, no Python and no admin rights.
  Usage:  powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 5173]
#>
param([int]$Port = 5173)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.js'='text/javascript; charset=utf-8'; '.json'='application/json; charset=utf-8';
  '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg';
  '.gif'='image/gif'; '.ico'='image/x-icon'; '.webp'='image/webp';
  '.woff'='font/woff'; '.woff2'='font/woff2'; '.txt'='text/plain; charset=utf-8';
  '.md'='text/markdown; charset=utf-8'
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "serving $root  ->  http://localhost:$Port/"

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $stream.ReadTimeout = 3000

    # read the request head
    $buf = New-Object byte[] 8192
    $n = $stream.Read($buf, 0, $buf.Length)
    if ($n -le 0) { $client.Close(); continue }
    $head = [Text.Encoding]::ASCII.GetString($buf, 0, $n)
    $line = ($head -split "`r`n")[0]
    $parts = $line -split ' '
    if ($parts.Count -lt 2) { $client.Close(); continue }

    $url = [Uri]::UnescapeDataString(($parts[1] -split '\?')[0])
    if ($url -eq '/' -or $url -eq '') { $url = '/index.html' }

    # resolve inside the project root only
    $path = Join-Path $root ($url.TrimStart('/') -replace '/', '\')
    $full = [IO.Path]::GetFullPath($path)

    if ($full.StartsWith($root, 'OrdinalIgnoreCase') -and (Test-Path $full -PathType Leaf)) {
      $body = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
      $status = '200 OK'
    } else {
      $body = [Text.Encoding]::UTF8.GetBytes("404 - $url")
      $ct = 'text/plain; charset=utf-8'
      $status = '404 Not Found'
    }

    $hdr = "HTTP/1.1 $status`r`nContent-Type: $ct`r`nContent-Length: $($body.Length)`r`n" +
           "Cache-Control: no-store`r`nConnection: close`r`n`r`n"
    $hb = [Text.Encoding]::ASCII.GetBytes($hdr)
    $stream.Write($hb, 0, $hb.Length)
    $stream.Write($body, 0, $body.Length)
    $stream.Flush()
    Write-Host "$status  $url"
  } catch {
    Write-Host "err: $($_.Exception.Message)"
  } finally {
    $client.Close()
  }
}
