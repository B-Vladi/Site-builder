/*
 * Copyright (c) Site builder.
 * Source: https://github.com/B-Vladi/Site-builder
 * Author: Vlad Kurkin, b-vladi@cs-console.ru.
 */

importClass(java.io.File);

var CONFIG = JSON.parse(project.getProperty('CONFIG.TEXT'));

function runTarget(project, name, properties) {
	for (var propertyName in properties) {
		if (properties.hasOwnProperty(propertyName)) {
			project.setProperty(propertyName, properties[propertyName]);
		}
	}

	project.getTargets().get(name).execute();
}

if (CONFIG.hasOwnProperty('baseDir')) {
	project.setBaseDir(new File(basedir, CONFIG.baseDir));
}

if (!CONFIG.hasOwnProperty('compile')) {
	CONFIG.compile = true;
}

project.setProperty('source.dir', CONFIG.sourceDir);
project.setProperty('destination.dir', CONFIG.destinationDir);

if (CONFIG.cleanDir !== false) {
	var cleanDir = project.createTask('delete');

	cleanDir.setDir(new File(project.getBaseDir(), CONFIG.destinationDir));
	cleanDir.execute();
}

for (var fileName in CONFIG.files) {
	if (CONFIG.files.hasOwnProperty(fileName)) {
		var fileData = CONFIG.files[fileName];

		runTarget(project, 'concat', {
			'file.name': fileName,
			'includes': fileData.hasOwnProperty('includes') ? fileData.includes.join(',') : '',
			'excludes': fileData.hasOwnProperty('excludes') ? fileData.excludes.join(',') : ''
		});

		if (!(fileData.compile === false && CONFIG.compile === false)) {
			runTarget(project, 'compile', {
				'file.name': fileName
			});
		}

		if (CONFIG.gZipped !== false) {
			runTarget(project, 'gZipped', {
				'file.name': fileName
			});
		}
	}
}