$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Android = Join-Path $Root "android"
$Overrides = Join-Path $Root "capacitor-overrides/android"

if (!(Test-Path $Android)) {
  throw "A pasta android ainda nao existe. Rode primeiro: npm run android:add"
}

$MainPackage = Join-Path $Android "app/src/main/java/br/com/nexiofinanceiro/app"
$Values = Join-Path $Android "app/src/main/res/values"
$ValuesNight = Join-Path $Android "app/src/main/res/values-night"
$Drawable = Join-Path $Android "app/src/main/res/drawable"
$Manifest = Join-Path $Android "app/src/main/AndroidManifest.xml"

New-Item -ItemType Directory -Force -Path $MainPackage, $Values, $ValuesNight, $Drawable | Out-Null

Copy-Item -LiteralPath (Join-Path $Overrides "MainActivity.java") -Destination (Join-Path $MainPackage "MainActivity.java") -Force
Copy-Item -LiteralPath (Join-Path $Overrides "AndroidManifest.xml") -Destination $Manifest -Force
Copy-Item -LiteralPath (Join-Path $Overrides "res/values/strings.xml") -Destination (Join-Path $Values "strings.xml") -Force
Copy-Item -LiteralPath (Join-Path $Overrides "res/values/colors.xml") -Destination (Join-Path $Values "colors.xml") -Force
Copy-Item -LiteralPath (Join-Path $Overrides "res/values/styles.xml") -Destination (Join-Path $Values "styles.xml") -Force
Copy-Item -LiteralPath (Join-Path $Overrides "res/values-night/styles.xml") -Destination (Join-Path $ValuesNight "styles.xml") -Force

$SplashSource = Join-Path $Root "assets/splash.png"
if (Test-Path $SplashSource) {
  Copy-Item -LiteralPath $SplashSource -Destination (Join-Path $Drawable "splash.png") -Force
}

$SplashIconSource = Join-Path $Root "assets/splash-icon.png"
if (Test-Path $SplashIconSource) {
  Copy-Item -LiteralPath $SplashIconSource -Destination (Join-Path $Drawable "splash_icon.png") -Force
}

$Variables = Join-Path $Android "variables.gradle"
if (Test-Path $Variables) {
  $content = Get-Content -LiteralPath $Variables -Raw
  $content = $content.TrimStart([char]0xFEFF)
  $content = [regex]::Replace($content, "compileSdkVersion\s*=\s*\d+", "compileSdkVersion = 36")
  $content = [regex]::Replace($content, "targetSdkVersion\s*=\s*\d+", "targetSdkVersion = 36")
  $content = [regex]::Replace($content, "minSdkVersion\s*=\s*\d+", "minSdkVersion = 24")
  $aliases = @(
    "androidxAppCompatVersion = androidAppCompatVersion",
    "androidxCoordinatorLayoutVersion = androidXCoordinatorLayoutVersion",
    "androidxCoreVersion = androidXCoreVersion",
    "androidxFragmentVersion = androidXFragmentVersion",
    "androidxWebkitVersion = androidXWebkitVersion",
    "androidxJunitVersion = androidXJunitVersion",
    "androidxEspressoCoreVersion = androidXEspressoCoreVersion"
  )
  foreach ($alias in $aliases) {
    $aliasName = $alias.Split(" = ")[0]
    if ($content -notmatch "(?m)^\s*$([regex]::Escape($aliasName))\s*=") {
      $content = $content -replace "(?m)^(\s*cordovaAndroidVersion\s*=.*)$", "    $alias`r`n`$1"
    }
  }
  if ($content -notmatch "(?m)^\s*androidXAppCompatVersion\s*=") {
    $content = $content -replace "(?m)^(\s*androidxAppCompatVersion\s*=.*)$", "`$1`r`n    androidXAppCompatVersion = androidAppCompatVersion"
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false
  [System.IO.File]::WriteAllText($Variables, $content, $utf8NoBom)
}

Write-Host "Ajustes Android do Nexio aplicados."
