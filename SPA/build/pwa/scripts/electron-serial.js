window.isElectron = window && window.process && window.process.type;

if (window.isElectron) {
	return;
	window.nodeRequire = require;
	delete window.require;
	delete window.exports;
	delete window.module;

	const { ipcRenderer } = window.nodeRequire("electron");
	console.log("Waiting for serial messages");

	ipcRenderer.on("asynchronous-serial-message", (evt, data) => {
		try {
			main.alerts.emit("serial", "receive", data);
		} catch (e) {}
	});
}
