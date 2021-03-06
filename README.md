# Site builder 1.0 #
https://github.com/B-Vladi/Site-builder/

Платформо-независимый инструмент пакетного преобразования ресурсов проекта.

## Лицензия
MIT: https://github.com/appendto/amplify/blob/master/MIT-LICENSE.txt

## Документация
### Установка.
Сборщик основан на базе ANT-а, поэтому в системе должны присутствовать следующие программные продукты:

* Java: http://www.java.com/
* ANT: http://ant.apache.org/ (не ниже 8.2.4)

Процесс установки сборщика в систему отсутствует, достаточно просто скопировать его файлы.

### Настройка.
Основной конфигурационный файл сборщика имеет формат JSON, и описывает модули, учавствующие в сборке проекта.

	{
		"moduleName": { // Имя модуля
			"configs": [], // Конфигурация модуля. Массив строк или JSON-объектов.
				// Строки воспринимаются как абсолютные пути к конфигурационным файлам модуля, либо относительно этого файла.
				// Если конфигурационный файл модуля имеет формат JSON, его код может быть указан в этом массиве в виде JSON объекта.
			"depends": [] // Массив имён модулей (строк), которые должны быть выполнены до этого модуля.
				// Порядок выполнения зависимых модулей соответствует порядку их имён в этом массиве.
		}
	}

Путь к основному конфигурационному файлу указывается в параметре запуска сборщика в виде свойства с именем config:

	-Dconfig=path/to/main/config.json

Если это свойство не было указано, стандартный ввод будет ожидать указания пути. Все относительные пути указываются от того файла конфигурации, в котором он определён.
Модули реализуют собственную логику обработки своих конфигурационных файлов, поэтому их структура описана отдельно в каждом конкретном модуле.

### Запуск.
Если в систему устанавливается утилита ANT стандартным способом, запуск может быть выполнен командой ant:

	ant path/to/build.xml -Dconfig=path/to/main/config.json

или с явным указанием имени параметра:

	ant -buildfile=path/to/build.xml -Dconfig=path/to/main/config.json

Здесь так же указан путь к сценарию сборки ANT, которым является файл сборщика build.xml.
В случае, когда ANT не зарегистрирован в системе, запуск необходимо производить командой java с явным указанием пути к исполняющему файлу ANT:

	java -jar path/to/ant.jar -buildfile=path/to/build.xml -Dconfig=path/to/main/config.json

Если версия Java меньше 7, необходимо указать пути к файлам классов из папки lib:

	ant -lib=builder/lib/ -buildfile=path/to/build.xml -Dconfig=path/to/main/config.json


или для Java:

	java -classpath=builder/lib/bsf.jar;builder/lib/commons-logging-1.1.1.jar;builder/lib/rhino.jar -jar path/to/ant.jar  -buildfile=path/to/build.xml -Dconfig=path/to/main/config.json

Подробнее о запуске ANT описано здесь: http://ant.apache.org/manual/runninglist.html

По-умолчанию сборщик запускаеп все модули, указанные в общем конфигурационном файле (цель build). Тем не менее имеется возможность явно указать имена выполняемых модулей:

	ant path/to/build.xml -Dconfig=path/to/main/config.json "First Module" "Second Module" "..."

Другими словами: в сценарии запуска ANT (build.xml) динамически создаются цели с именами, соответствующими именам модулей, которые указаны в общем конфигурационном файле. В данном случае здесь перечислены имена целей, которые будут выполнены ANT-ом.

Так же существует цель с именем "Run module", при выполнении которой будет выдан запрос на ввод имени модуля:

	ant path/to/build.xml -Dconfig=path/to/main/config.json "Run module"

Зависимые модули в любом случае будут выполнены как описано выше.

## Модули
### JSCompressor
Компрессор JavaScript-файлов. Возможности (в порядке выполнения):

* Конкатенация.
* Компиляция. Используется Google Closure Compiler: https://developers.google.com/closure/compiler/.
* GZip-сжатие. Исходные файлы не заменяются. Сжатые файлы располагаются рядом с результирующими файлами с расширением "gz".

Конфигурационный файл модуля в формате JSON:

	{
		"baseDir": "", // Базовая дирректория для всех путей.
		"sourceDir": "", // Путь к папке исходных JavaScript-файлов. Обязательный параметр.
		"destinationDir": "", // Путь к папке скомпилированных JavaScript-файлов. Очищается при запуске модуля. Обязательный параметр.
		"compile": "simple", // Тип компиляции. Возможные значения: 'simple', 'advanced', 'whitespace', false. Если указано значение false - компиляции не происходит.
		"warning": "default", // Уровень детализации сообщений об ошибках (https://developers.google.com/closure/compiler/docs/error-ref#warn). Возможные значения: 'default', 'quiet', 'verbose'.
		"fileExterns": "modules/JSCompressor/externs.js", // Путь к файлу исключений (https://developers.google.com/closure/compiler/docs/api-tutorial3#externs).
		"gZipped": true, // Флаг, указывающий на необходимость GZip-сжатия скомпилированных файлов.
		"files": { // Список результирующих файлов.
			"path": { // Путь к результирующему файлу в папке "destinationDir", которое будет содержать в себе весь исходный код исходных файлов, указанных в параметре "includes". Если необходимых дирректорий не существует, они будут созданны.
				"compile": CONFIG.compile, // Тип компиляции для конкретного результирующего файла.
				"includes": ["*"] // Массив путей к файлам, которые будут объединены в результирующий. Подробное описание формата значений описано здесь: http://ant.apache.org/manual/using.html#path.
				"excludes": [] // Массив путей к файлам, которые не будут объединены в результирующий. Так же можно указывать по маске.
			}
		}
	}

### CSSCompressor
Компрессор CSS-файлов. Возможности (в порядке выполнения):

* Конкатенация.
* Компиляция. Используется YUI Compressor: http://developer.yahoo.com/yui/compressor/.
* GZip-сжатие. Исходные файлы не заменяются. Сжатые файлы располагаются рядом с результирующими файлами с расширением "gz".

Конфигурационный файл модуля в формате JSON:

	{
		"baseDir": "", // Базовая дирректория для всех путей.
		"sourceDir": "", // Путь к папке исходных JavaScript-файлов. Обязательный параметр.
		"destinationDir": "", // Путь к папке скомпилированных JavaScript-файлов. Очищается при запуске модуля. Обязательный параметр.
		"compile": true, // Флаг, указывающий на необходимость компиляции.
		"gZipped": true, // Флаг, указывающий на необходимость GZip-сжатия скомпилированных файлов.
		"files": { // Список результирующих файлов.
			"path": { // Путь к результирующему файлу в папке "destinationDir", которое будет содержать в себе весь исходный код исходных файлов, указанных в параметре "includes". Если необходимых дирректорий не существует, они будут созданны.
				"compile": CONFIG.compile, // Флаг компиляции для конкретного результирующего файла.
				"includes": ["*"] // Массив путей к файлам, которые будут объединены в результирующий. Подробное описание формата значений описано здесь: http://ant.apache.org/manual/using.html#path.
				"excludes": [] // Массив путей к файлам, которые не будут объединены в результирующий. Так же можно указывать по маске.
			}
		}
	}

### JSDocToolkit
Генератор документации JavaScript-файлов на основе JSDoc Toolkit 2.4.0: http://code.google.com/p/jsdoc-toolkit/.
Большинство параметров соответствуют опциям командной строки: http://code.google.com/p/jsdoc-toolkit/wiki/CommandlineOptions

Конфигурационный файл модуля в формате JSON:

	{
		"baseDir": "", // Базовая дирректория для поиска исходных файлов.
		"configFile": "", // Путь к конфигурационному файлу в формате JSON. Параметр -c (--conf). Если указан этот параметр, остальные игнорируются.
		"outputDir": "", // Путь к папке генерируемой документации. Параметр -d (--directory).
		"template": "jsdoc", // Имя шаблона документации. Параметр -t (--template).
		"encoding": "UTF-8", // Кодировка исходных файлов. Параметр -e (--encoding).
		"extension": "js", // Расширение исходных файлов. Параметр -x (--ext).
		"isUndocumentedFunctions": false, // Параметр -a (--allfunctions).
		"isSuppressSourceOut": false, // Параметр -s (--suppress).
		"isUnderscoredFunctions": false, // Параметр -A.
		"isPrivate": false, // Параметр -p (--private).
		"isVerbose": false, // Параметр -v (--verbose).
		"logFile": "", // Параметр -o (--out).
		"arguments": {} // Объект аргументов, передаваемых в текущий используемый JSDoc-шаблон.
		"includes": [], // Массив путей к файлам, на основе которых будет генерироваться документация. Подробное описание формата значений описано здесь: http://ant.apache.org/manual/using.html#path.
		"excludes": [], // Массив путей к файлам, которые будут исключены из генерации. Так же можно указывать по маске.
	}

### JSHint
Валидатор JavaScript-файлов на основе JSHint: http://www.jshint.com/, а так же ANT-задачи: https://github.com/philmander/ant-jshint.


Конфигурационный файл модуля в формате JSON:

	{
		"baseDir": "", // Базовая дирректория для поиска исходных файлов.
		"optionsFile": "", // Путь к файлу опций JSHint. Соответствует одноимённому параметру ANT-задачи.
		"reportFile": "", // Путь отчёта. Соответствует одноимённому параметру ANT-задачи.
		"options": {}, // Объект опций JSHint.
		"fail": true, // Флаг, указывающий на необходимость остановки дальнейшего выполнения модуля. Соответствует одноимённому параметру ANT-задачи.
		"includes": [], // Массив путей к файлам, которые будут учавствовать в валидации. Подробное описание формата значений описано здесь: http://ant.apache.org/manual/using.html#path.
		"excludes": [], // Массив путей к файлам, которые будут исключены из валидации. Так же можно указывать по маске.
	}