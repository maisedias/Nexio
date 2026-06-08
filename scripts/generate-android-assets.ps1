$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$Root = Split-Path -Parent $PSScriptRoot
$Assets = Join-Path $Root "assets"
$AndroidWeb = Join-Path $Root "android-web"
$SymbolPath = Join-Path $Assets "nexio-symbol.png"
$AppLogoPath = Join-Path $Assets "nexio-app-logo.png"
$DarkLogoPath = Join-Path $Assets "nexio-logo-dark-transparent.png"
$LightLogoPath = Join-Path $Assets "nexio-logo-light-transparent.png"

if (!(Test-Path $SymbolPath)) {
  throw "Logo simbolo nao encontrado em $SymbolPath"
}

New-Item -ItemType Directory -Force -Path $Assets | Out-Null
New-Item -ItemType Directory -Force -Path $AndroidWeb | Out-Null

function New-BitmapCanvas {
  param(
    [int]$Size,
    [string]$ColorHex
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($ColorHex))

  return @{
    Bitmap = $bitmap
    Graphics = $graphics
  }
}

function Draw-ContainedImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Image,
    [int]$CanvasSize,
    [double]$MaxWidth,
    [double]$MaxHeight,
    [double]$CenterY
  )

  $scale = [Math]::Min($MaxWidth / $Image.Width, $MaxHeight / $Image.Height)
  $width = [int]($Image.Width * $scale)
  $height = [int]($Image.Height * $scale)
  $x = [int](($CanvasSize - $width) / 2)
  $y = [int](($CanvasSize * $CenterY) - ($height / 2))
  $Graphics.DrawImage($Image, $x, $y, $width, $height)
}

function Save-IconAsset {
  param(
    [int]$Size,
    [string]$Path
  )

  $canvas = New-BitmapCanvas -Size $Size -ColorHex "#EEF7FF"
  $logoSource = if (Test-Path $AppLogoPath) { $AppLogoPath } else { $SymbolPath }
  $logo = [System.Drawing.Image]::FromFile($logoSource)
  Draw-ContainedImage -Graphics $canvas.Graphics -Image $logo -CanvasSize $Size -MaxWidth ($Size * 0.92) -MaxHeight ($Size * 0.84) -CenterY 0.5

  $canvas.Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $logo.Dispose()
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

function Save-SplashAsset {
  param(
    [string]$Path,
    [string]$Background,
    [string]$TextColor
  )

  $size = 2732
  $canvas = New-BitmapCanvas -Size $size -ColorHex $Background
  if (Test-Path $AppLogoPath) {
    $logo = [System.Drawing.Image]::FromFile($AppLogoPath)
    Draw-ContainedImage -Graphics $canvas.Graphics -Image $logo -CanvasSize $size -MaxWidth 1850 -MaxHeight 1480 -CenterY 0.48
  } else {
    $logo = [System.Drawing.Image]::FromFile($SymbolPath)
    Draw-ContainedImage -Graphics $canvas.Graphics -Image $logo -CanvasSize $size -MaxWidth 860 -MaxHeight 1260 -CenterY 0.42

    $font = New-Object System.Drawing.Font "Arial", 118, ([System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($TextColor))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF 0, 1840, $size, 180
    $canvas.Graphics.DrawString("Nexio Financeiro", $font, $brush, $rect, $format)
    $font.Dispose()
    $brush.Dispose()
    $format.Dispose()
  }

  $canvas.Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $logo.Dispose()
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

Save-IconAsset -Size 1024 -Path (Join-Path $Assets "icon-only.png")
Save-IconAsset -Size 1024 -Path (Join-Path $Assets "icon-foreground.png")
Save-IconAsset -Size 512 -Path (Join-Path $Assets "play-store-icon-512.png")

$background = New-BitmapCanvas -Size 1024 -ColorHex "#121c18"
$background.Bitmap.Save((Join-Path $Assets "icon-background.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$background.Graphics.Dispose()
$background.Bitmap.Dispose()

if (Test-Path $LightLogoPath) {
  Save-SplashAsset -Path (Join-Path $Assets "splash.png") -Background "#EEF7FF" -TextColor "#111b24"
}

if (Test-Path $DarkLogoPath) {
  Save-SplashAsset -Path (Join-Path $Assets "splash-dark.png") -Background "#EEF7FF" -TextColor "#111b24"
}

if (Test-Path $AppLogoPath) {
  Copy-Item -LiteralPath $AppLogoPath -Destination (Join-Path $AndroidWeb "nexio-logo.png") -Force
} elseif (Test-Path $DarkLogoPath) {
  Copy-Item -LiteralPath $DarkLogoPath -Destination (Join-Path $AndroidWeb "nexio-logo.png") -Force
}

Write-Host "Assets Android gerados em assets/ e android-web/."
