script.js - основной скрипт для фронтэнда
index.js - сервер на node.js
out.png - изображение поля 
field.json - хранит состояние поля
fieldChanges.json - хранит последние изменения
html2canvas - библеотека для отрисовки таблицы на канвасе
package.json - файл с описанием проекта node js

При запуске фронтэнда(клиентской части) из файловой системы передача изображения верхнего поля на сервер невозможна из-за ошибки tainted canvas, лучше запускать из локального сервера к примеру sublime server или любого другого. Ошибка tainted canvas происхоить т.к js из соображений безопасности помечает файловую сиситему как сторонний ресурс и не дает экспортировать элемент canvas, при запуске с локального сервера такой проблемы не возникает.