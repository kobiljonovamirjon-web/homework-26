# APEX MOTORS — 3D

Запуск: распаковать ZIP и открыть index.html (Chrome/Edge/Firefox/Safari). Интернет не нужен.

В каталоге только настоящие 3D-модели (.glb):
- Mercedes-AMG G 63 (hoanghuycptqt, GitHub, некоммерческое/учебное использование)
- Mercedes-AMG SL 63 (автор в источнике не указан)
- Mercedes-Benz C 63 AMG, 2008 (Ddiaz Design, CC BY-NC-SA 4.0)
- Porsche 911 Turbo S (992), 2021 (Ddiaz Design, CC BY-NC-SA 4.0)
- Porsche 911 Turbo (930), 1975 (Karol Miklas, CC BY 4.0)
- BMW M8 Competition Coupe, BMW M5 F90 (Outlaw Games, CC BY-NC 4.0), BMW X6 M Competition (vecarz, CC BY 4.0)

Убраны блочные машины, построенные кодом (Mercedes S 500, Porsche Cayenne / Panamera / Taycan): настоящих моделей для них нет. Код построения остаётся в models.js.
У SL 63 и C 63 краска «запечена» в текстуры, поэтому смена цвета для них недоступна.
Цвета кузова у остальных машин заменяются в шейдере (BODY_TEXELS в script.js): красится только кузов, стёкла и пластик остаются как есть.

ВАЖНО: лицензия CC BY-NC запрещает коммерческое использование. Для публичного сайта продаж замените модели M8 и M5 на модели с лицензией CC BY / CC0 или купленные.

Как добавить машину: получите .glb, сожмите текстуры
  npx @gltf-transform/cli optimize in.glb out.glb --compress false --texture-compress webp --texture-size 1024
закодируйте в base64 и добавьте в glb-data.js: window.GLB["Название"]="...";
добавьте запись в SPEC (models.js: длина и ширина в метрах) и карточку в data (script.js). Модель должна смотреть носом по оси Z. Или пришлите .glb — подключу.
