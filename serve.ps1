# Minimal HTTP file server in PowerShell
$root = "C:\Users\prana\.gemini\antigravity\scratch\pranav-portfolio"
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving on http://localhost:$port  (Ctrl+C to stop)"

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.webp' = 'image/webp'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.mp4'  = 'video/mp4'
  '.webm' = 'video/webm'
  '.woff2'= 'font/woff2'
  '.woff' = 'font/woff'
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $path = $req.Url.LocalPath
    if ($path -eq '/' -or [string]::IsNullOrWhiteSpace($path)) { $path = '/index.html' }
    $rel = $path.TrimStart('/')
    $file = Join-Path $root ($rel -replace '/', '\')

    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
      
      # Add browser cache header for static media only, no-cache for code
      if ($ext -match '\.(png|jpg|jpeg|gif|webp|svg|woff2|woff)$') {
        $res.Headers.Add("Cache-Control", "public, max-age=86400")
      } else {
        $res.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
        $res.Headers.Add("Pragma", "no-cache")
        $res.Headers.Add("Expires", "0")
      }

      $bytes = [System.IO.File]::ReadAllBytes($file)
      $res.ContentLength64 = $bytes.Length
      if ($req.HttpMethod -ne 'HEAD') {
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } else {
      $res.StatusCode = 404
      $body = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
      $res.ContentLength64 = $body.Length
      if ($req.HttpMethod -ne 'HEAD') {
        $res.OutputStream.Write($body, 0, $body.Length)
      }
    }
    $res.OutputStream.Close()
  } catch {
    # continue on client disconnects
  }
}
