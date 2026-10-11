# Делает PNG-картинки сайта из HTML-шаблонов: скриншот в Chrome без окна (режим headless).
#   assets/og-image.png, og-image-ro.png, og-image-en.png — превью ссылки 1200×630
#   assets/apple-touch-icon.png — иконка для iPhone 180×180
# Нужен запущенный локальный сервер: python -m http.server 8000
# Запуск из папки проекта:  powershell -File tools/build_images.ps1

$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base   = 'http://localhost:8000/tools'
$out    = (Resolve-Path "$PSScriptRoot\..\assets").Path

function Shot($url, $file, $w, $h) {
  # --virtual-time-budget — дать странице 4 секунды (виртуального времени) догрузить шрифты
  & $chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
    "--window-size=$w,$h" --virtual-time-budget=4000 "--screenshot=$out\$file" $url 2>$null | Out-Null
  Write-Output ("{0}: {1:N0} KB" -f $file, ((Get-Item "$out\$file").Length / 1KB))
}

Shot "$base/og-template.html?lang=ru" 'og-image.png'    1200 630
Shot "$base/og-template.html?lang=ro" 'og-image-ro.png' 1200 630
Shot "$base/og-template.html?lang=en" 'og-image-en.png' 1200 630
Shot "$base/icon-template.html"       'apple-touch-icon.png' 180 180
