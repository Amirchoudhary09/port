<#
  Regenerates the generated images from their sources. Needs Chrome or Edge, nothing else.

    tools/og-card.html  ->  img/og.jpg            1200x630 card shown when the link is shared
    favicon.svg         ->  img/icon-32.png, img/icon-192.png, img/icon-512.png, img/apple-touch-icon.png

  Usage:  powershell -ExecutionPolicy Bypass -File tools/make-assets.ps1
#>
$ErrorActionPreference = 'Stop'
$root  = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$tools = Join-Path $root 'tools'
$img   = Join-Path $root 'img'
$tmp   = Join-Path $env:TEMP 'portfolio-assets'
New-Item -ItemType Directory -Force $tmp | Out-Null

$chrome = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw 'Chrome or Edge not found - install one of them, or point $chrome at your browser.' }

$base = '--headless=new --disable-gpu --no-sandbox --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=8000'

function Run-Chrome([string]$argLine, [string]$stdout) {
  $p = Start-Process -FilePath $chrome -ArgumentList "$base $argLine" -Wait -PassThru -NoNewWindow `
         -RedirectStandardOutput $stdout -RedirectStandardError (Join-Path $tmp 'chrome-stderr.txt')
  if ($p.ExitCode -ne 0) { throw "Chrome exited with $($p.ExitCode) - see $tmp\chrome-stderr.txt" }
}

function Shot([string]$url, [int]$w, [int]$h, [string]$bg, [string]$out) {
  Run-Chrome "--window-size=$w,$h --default-background-color=$bg --screenshot=`"$out`" `"$url`"" (Join-Path $tmp 'shot.txt')
  Write-Host ("  {0,-28} {1,6:n0} bytes" -f (Split-Path -Leaf $out), (Get-Item $out).Length)
}

$fileUrl = { param($p) 'file:///' + ($p -replace '\\', '/') }

Write-Host 'icons from favicon.svg'
# the SVG is inlined into a throwaway page, so nothing has to finish loading before the screenshot
$svg = Get-Content (Join-Path $root 'favicon.svg') -Raw
function IconPage([int]$size) {
  $p = Join-Path $tmp "icon-$size.html"
  $s = $svg -replace '<svg ', "<svg width=`"$size`" height=`"$size`" "
  "<!doctype html><meta charset=`"utf-8`"><style>html,body{margin:0;background:transparent;overflow:hidden}svg{display:block}</style>$s" |
    Set-Content -Path $p -Encoding UTF8
  & $fileUrl $p
}
Shot (IconPage 32)  32  32  '00000000' (Join-Path $img 'icon-32.png')
Shot (IconPage 192) 192 192 '05060aff' (Join-Path $img 'icon-192.png')
Shot (IconPage 512) 512 512 '05060aff' (Join-Path $img 'icon-512.png')
Shot (IconPage 180) 180 180 '05060aff' (Join-Path $img 'apple-touch-icon.png')

Write-Host 'share card from tools/og-card.html'
$png = Join-Path $tmp 'og.png'
Shot (& $fileUrl (Join-Path $tools 'og-card.html')) 1200 630 '05060aff' $png

# PNG -> JPEG through a canvas: WhatsApp skips previews over ~300 KB, JPEG keeps it well under
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($png))
$page = Join-Path $tmp 'og-to-jpg.html'
@"
<!doctype html><meta charset="utf-8"><img id="i" src="data:image/png;base64,$b64">
<script>
addEventListener('load', () => {
  const i = document.getElementById('i'), c = document.createElement('canvas');
  c.width = i.naturalWidth; c.height = i.naturalHeight;
  c.getContext('2d').drawImage(i, 0, 0);
  document.body.textContent = 'JPG:' + c.toDataURL('image/jpeg', .88).split(',')[1];
});
</script>
"@ | Set-Content -Path $page -Encoding UTF8
$dom = Join-Path $tmp 'og-dom.txt'
Run-Chrome "--dump-dom `"$(& $fileUrl $page)`"" $dom
$m = [regex]::Match((Get-Content $dom -Raw), 'JPG:([A-Za-z0-9+/=]+)')
if (-not $m.Success) { throw 'could not read the JPEG back out of Chrome' }
$jpg = Join-Path $img 'og.jpg'
[IO.File]::WriteAllBytes($jpg, [Convert]::FromBase64String($m.Groups[1].Value))
Write-Host ("  {0,-28} {1,6:n0} bytes" -f 'og.jpg', (Get-Item $jpg).Length)
Write-Host 'done'
