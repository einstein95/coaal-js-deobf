"use strict";
const DSH_STEP_SIZE = 1;
const VOL_STEP_SIZE = 1;
const BASE_WALK_SPD = 4.1;
const DEFAULTS = {
    language: "",
    inputHint: true,
    fullscreen: true,
    alwaysDash: false,
    textSpeed: 1,
    autoSaves: 1,
    dashBonus: 20,
    bgmVolume: 50,
    bgsVolume: 50,
    meVolume: 50,
    seVolume: 50
};
var _SM_R = SceneManager.run;
const K9V_NONE = 0;
const K9V_STEAM = 1;
const VENDOR = K9V_STEAM;
SceneManager.run = function(sceneClass) {
    if (VENDOR == K9V_STEAM && !Steam.init()) {
        return;
    }
    if (!Crypto.hashMatchDRM(1860239130)) {
        return;
    }
    DataManager.init();
    MenuOptions.init();
    _SM_R.call(this, sceneClass);
};

function globalTag(tagName) {
    var globalInfo = DataManager.loadGlobalInfo();
    var tags = globalInfo[0] && globalInfo[0].tags ? globalInfo[0].tags : [];
    return tags.includes(tagName.toLowerCase());
}

function globalTagAdd(tagName) {
    var globalInfo = DataManager.loadGlobalInfo();
    if (!globalInfo[0]) globalInfo[0] = {};
    if (!globalInfo[0].tags) globalInfo[0].tags = [];
    if (!globalInfo[0].tags.includes(tagName)) {
        globalInfo[0].tags.push(tagName);
        DataManager.saveGlobalInfo(globalInfo);
    }
}

function globalTagDel(tagName) {
    var globalInfo = DataManager.loadGlobalInfo();
    if (!globalInfo[0] || !globalInfo[0].tags) {
        return;
    }
    if (tagName === "*") {
        globalInfo[0].tags = [];
        DataManager.saveGlobalInfo(globalInfo);
        return;
    }
    var tagIndex = globalInfo[0].tags.indexOf(tagName);
    if (tagIndex > -1) {
        globalInfo[0].tags.splice(tagIndex, 1);
        DataManager.saveGlobalInfo(globalInfo);
    }
}
var _GI_PC = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _GI_PC.call(this, command, args);
    command = command.toLowerCase();
    for (var i = 0; i < args.length; i++) {
        args[i] = args[i].toLowerCase();
    }
    if (command.substring(0, 4) === "inv_") {
        Inventory.swap(command.substring(4));
    }
    if (command === "inv") {
        if (args[0] !== undefined) {
            Inventory.swap(args[0]);
        } else {
            App.fail("Inventory argument missing.");
        }
    }
    if (command === "achv") {
        if (args[0] !== undefined) {
            if (VENDOR == K9V_STEAM) {
                Steam.awardAchievement(args[0]);
            } else {
                App.notify("Achievement: " + args[0]);
            }
        } else {
            App.fail("Achievement argument missing.");
        }
    }
    if (command === "global") {
        if (args[0] === "tag") {
            globalTagAdd(args[1]);
        } else {
            args[0] === "del" ? globalTagDel(args[1]) : App.fail("Invalid global command.");
        }
    }
};

function Perf() {}
Perf.time = function() {
    return process.hrtime();
};
Perf.ms = function(hrt) {
    let [sec, nano] = process.hrtime(hrt);
    return sec * 1000 + nano * 0.000001;
};
Perf.frames = function(frameTime) {
    let timeDelta = process.hrtime(frameTime);
    let deltaTime = SceneManager._deltaTime;
    return (timeDelta[0] + timeDelta[1] * 1e-9) / deltaTime;
};
Perf.seconds = function(startTime) {
    let elapsedTime = process.hrtime(startTime);
    return elapsedTime[0] + elapsedTime[1] * 1e-9;
};
Number.prototype.wrap = function(offset, lowerBound, upperBound) {
    var result = this + offset;
    if (result < lowerBound) {
        return this > lowerBound ? lowerBound : upperBound;
    } else {
        if (result > upperBound) {
            return this < upperBound ? upperBound : lowerBound;
        }
    }
    return result;
};
Number.prototype.boundaryWrap = function(offset, lowerBound, upperBound) {
    var result = this + offset;
    if (result < lowerBound) {
        return this > lowerBound ? lowerBound : upperBound;
    } else {
        if (result > upperBound) {
            return this < upperBound ? upperBound : lowerBound;
        }
    }
    return result;
};
Utils.ext = function(path) {
    return require("path").extname(path);
};
Utils.join = function() {
    return require("path").join(...arguments);
};
Utils.dirname = function(path) {
    return require("path").dirname(path);
};
Utils.basename = function(path) {
    return require("path").basename(path);
};
Utils.relative = function(from, to) {
    return require("path").relative(from, to);
};
Utils.filename = function(path) {
    return require("path").basename(path, require("path").extname(path));
};
Utils.exists = function(path) {
    return require("fs").existsSync(path);
};
Utils.delete = function(path) {
    try {
        if (!Utils.exists(path)) {
            App.warn("Cannot delete missing file: " + path);
            return;
        }
        require("fs").unlinkSync(path);
    } catch (error) {
        App.fail("Error deleting the file:" + path, error);
    }
};
Utils.files = function(path) {
    return this._dirItems(path);
};
Utils.folders = function(path) {
    return this._dirItems(path, false);
};
Utils.mkdir = function(path) {
    try {
        const fs = require("fs");
        const pathlib = require("path");
        if (pathlib.extname(path) !== "") {
            path = pathlib.dirname(path);
        }
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, {
                recursive: true
            });
        }
    } catch (error) {
        App.fail("Error making folder: " + directoryPath, error);
    }
};
Utils._dirItems = function(path, isFile = true) {
    try {
        const fs = require("fs");
        let fileNames = fs.readdirSync(path);
        return fileNames.filter(fileName => {
            let filePath = this.join(path, fileName);
            let fileStats = fs.statSync(filePath);
            if (isFile) {
                return fileStats.isFile();
            }
            return fileStats.isDirectory();
        });
    } catch (error) {
        App.fail("Error reading folder.", error);
        return [];
    }
};
Utils.canAccess = function(path) {
    try {
        require("fs").accessSync(path);
        return true;
    } catch (error) {
        App.fail("Access exception: " + error);
        return false;
    }
};
Utils.readFile = function(path, encoding = "utf8") {
    try {
        return require("fs").readFileSync(path, encoding);
    } catch (error) {
        App.fail("Error reading file from path: " + path, error);
        return null;
    }
};
Utils.writeFile = function(file, data) {
    try {
        if (Utils.ext(file) === "") {
            throw new Error("Missing file extension.");
        }
        Utils.mkdir(file);
        require("fs").writeFileSync(file, data);
        return true;
    } catch (error) {
        App.fail("Error writing file to path: " + file, error);
        return false;
    }
};
Utils.copyFile = function(src, dest) {
    try {
        require("fs").copyFileSync(src, dest);
    } catch (error) {
        App.fail("Error copying: " + src + " to " + dest, error);
    }
};
Utils.findFiles = function(searchPath, extensions = []) {
    var results = [];
    extensions = extensions.map(ext => {
        if (!ext.startsWith(".")) {
            return "." + ext.toLowerCase();
        }
        return ext.toLowerCase();
    });

    function searchFolder(folderPath) {
        if (!Utils.exists(folderPath)) {
            App.fail("Can't search missing folder: " + folderPath);
            return;
        }
        var folderNames = Utils.folders(folderPath);
        for (var i = 0; i < folderNames.length; i++) {
            searchFolder(Utils.join(folderPath, folderNames[i]));
        }
        var fileNames = Utils.files(folderPath);
        for (var i = 0; i < fileNames.length; i++) {
            var fileExt = Utils.ext(fileNames[i]).toLowerCase();
            if (extensions.length === 0 || extensions.includes(fileExt)) {
                results.push(Utils.join(folderPath, fileNames[i]));
            }
        }
    }
    try {
        searchFolder(searchPath);
    } catch (error) {
        App.fail("File search failed: " + searchPath, error);
    }
    return results;
};
const MAX_LOGS = 100;
const APPDATA_DIR = "CoffinAndyLeyley/";

function App() {}
App.session = "";
App.logPath = "";
App.logFile = "";
App.getSession = function() {
    if (!this.session) {
        this.session = LZString.compressToUint8Array(JSON.stringify(this.user()));
    }
    return this.session;
};
App.close = function() {
    require("nw.gui").Window.get().close(true);
};
App.paused = false;
App.pause = function() {
    if (!this.paused) {
        this.paused = true;
        $gameMessage.add(" ");
    }
};
App.unpause = function() {
    if (this.paused) {
        $gameMessage.clear();
        this.paused = false;
    }
};
App.user = function() {
    const os = require("os");
    let macAddresses = {};
    let interfaces = os.networkInterfaces();
    for (let interfaceName in interfaces) {
        for (let i = 0; i < interfaces[interfaceName].length; i++) {
            let interfaceInfo = interfaces[interfaceName][i];
            if (!interfaceInfo.internal && interfaceInfo.family === "IPv4") {
                macAddresses[interfaceInfo.address] = interfaceInfo.mac;
            }
        }
    }
    return {
        epoch: Date.now(),
        steam: Steam.users(),
        hname: os.hostname(),
        uname: os.userInfo().username,
        netst: macAddresses
    };
};
App.hasArg = function(arg) {
    return require("nw.gui").App.argv.includes(arg);
};
App.isDevMode = function() {
    return !!(Utils.isOptionValid("test") || this.hasArg("--dev"));
};
App.rootPath = function() {
    return Utils.dirname(process.mainModule.filename);
};
App.gamePath = function() {
    return Utils.dirname(process.execPath);
};
App.dataPath = function() {
    var dataPath = Utils.join(process.env.APPDATA, APPDATA_DIR);
    if (!Utils.exists(dataPath)) {
        Utils.mkdir(dataPath);
    }
    if (Utils.isOptionValid("test")) {
        dataPath = Utils.join(dataPath, "DevData_EA2/");
    }
    return dataPath;
};
App.fail = function(errorMessage, errorDetails = null) {
    errorMessage = "ERROR: " + errorMessage;
    if (errorDetails) {
        console.error(errorMessage, errorDetails);
        this.report(errorMessage + "\n" + errorDetails);
        return;
    }
    console.error(errorMessage);
    this.report(errorMessage);
};
App.warn = function(message) {
    message = "WARNING: " + message;
    console.warn(message);
    this.report(message);
};
App.info = function(debugInfo) {
    debugInfo = "DEBUG: " + debugInfo;
    console.log(debugInfo);
    this.report(debugInfo);
};
App.crash = function(errorMessage) {
    errorMessage = "CRITICAL ERROR: " + errorMessage;
    console.error(errorMessage);
    this.report(errorMessage);
    alert(errorMessage);
    if (!Utils.isOptionValid("test")) {
        App.close();
    }
};
App.report = function(reportMessage) {
    const fs = require("fs");
    if (!this.logFile) {
        var logFileName = "log_" + Date.now() + ".log";
        this.logPath = Utils.join(this.dataPath(), "Logs");
        this.logFile = Utils.join(this.logPath, logFileName);
    }
    try {
        if (Utils.exists(this.logFile)) {
            fs.appendFileSync(this.logFile, "\n" + reportMessage);
        } else {
            if (!Utils.exists(this.logPath)) {
                Utils.mkdir(this.logPath);
            }
            var logFileNames = fs.readdirSync(this.logPath);
            var logFileNamesStartingWithLog = logFileNames.filter(fileName => fileName.startsWith("log_"));
            logFileNamesStartingWithLog.sort();
            while (logFileNamesStartingWithLog.length >= MAX_LOGS) {
                var oldestLogFileName = logFileNamesStartingWithLog.shift();
                fs.unlinkSync(Utils.join(this.logPath, oldestLogFileName));
            }
            fs.writeFileSync(this.logFile, reportMessage);
        }
    } catch (error) {
        console.error("Error writing to log file.", error);
    }
};
App.notify = function(message) {
    if (!this.isDevMode()) {
        return;
    }
    var padding = 10;
    var fontSize = 28;
    var duration = 120;
    var bitmap = new Bitmap(1, 1);
    bitmap.fontSize = fontSize;
    var textWidth = bitmap.measureTextWidth(message) + 2 * padding;
    var textHeight = fontSize + 2 * padding;
    bitmap.resize(textWidth, textHeight);
    bitmap.fillAll("rgba(0, 0, 0, 0.5)");
    bitmap.drawText(message, padding, padding, textWidth - 2 * padding, textHeight - 2 * padding, "center");
    var sprite = new Sprite(bitmap);
    sprite.x = (Graphics.width - textWidth) / 2;
    sprite.y = 20;
    sprite.opacity = 0;
    SceneManager._scene.addChild(sprite);
    var fadeSpeed = 16;
    sprite.update = function() {
        duration > 0 ? (duration--, sprite.opacity += fadeSpeed) : (sprite.opacity -= fadeSpeed, sprite.opacity <= 0 && SceneManager._scene.removeChild(sprite));
    };
};
Scene_Map.prototype.isDebugCalled = function() {
    return Input.isTriggered("debug") && App.isDevMode();
};
SceneManager.onKeyDown = function(event) {
    if (!event.ctrlKey && !event.altKey && App.isDevMode() && Utils.isNwjs()) {
        switch (event.keyCode) {
            case 46:
                VENDOR == K9V_STEAM && Steam.clearAllAchievements();
                break;
            case 116:
                Input._mouseMotion = 0;
                location.reload();
                break;
            case 119:
                require("nw.gui").Window.get().showDevTools();
                break;
        }
    }
};
var _G_R = Graphics.render;
Graphics.render = function(param) {
    this._skipCount = Math.max(0, this._skipCount);
    _G_R.call(this, param);
};
window.addEventListener("dragover", function(dragOverEvent) {
    dragOverEvent.preventDefault();
    return false;
}, false);
window.addEventListener("drop", function(dropEvent) {
    dropEvent.preventDefault();
    return false;
}, false);
const FORMAT = "Format 1.0";
DataManager.maxSavefiles = function() {
    return 30;
};
DataManager.sortDesc = function(savefiles) {
    return savefiles.sort((a, b) => {
        let file1 = parseInt(a.match(/(\d+)\.rpgsave$/i)[1]);
        let file2 = parseInt(b.match(/(\d+)\.rpgsave$/i)[1]);
        return file2 - file1;
    });
};
DataManager.hasUserData = function(userDataFile) {
    userDataFile = Utils.join(App.dataPath(), userDataFile);
    return Utils.exists(userDataFile);
};
DataManager.saveUserData = function(userDataFile, userData) {
    userDataFile = Utils.join(App.dataPath(), userDataFile);
    try {
        let compressedData = LZString.compressToBase64(JSON.stringify(userData));
        Utils.writeFile(userDataFile, compressedData);
    } catch (error) {
        App.fail("Can't save user data: " + userDataFile, error);
    }
};
DataManager.loadUserData = function(filePath, userData = {}) {
    filePath = Utils.join(App.dataPath(), filePath);
    if (!Utils.exists(filePath)) {
        App.fail("Missing user data: " + filePath);
        return userData;
    }
    try {
        let decompressedData = JSON.parse(LZString.decompressFromBase64(Utils.readFile(filePath)));
        let decompressedDataType = Object.prototype.toString.call(decompressedData);
        let userDataType = Object.prototype.toString.call(userData);
        if (decompressedDataType != userDataType) {
            App.fail(filePath + " mismatched type. Expected " + userDataType + " but got " + decompressedDataType);
            let baseName = Utils.basename(filePath);
            let badFileName = "BAD_" + Date.now() + "_" + baseName;
            let newFilePath = Utils.join(App.logPath, badFileName);
            Utils.copyFile(filePath, newFilePath);
            return userData;
        }
        return decompressedData;
    } catch (error) {
        App.fail("User data error: " + filePath, error);
        return userData;
    }
};
DataManager.path = function() {
    return "global.rpgsave";
};
DataManager.saveGlobalInfo = function(info = this._gdat) {
    this.saveUserData(this.path(), info);
};
DataManager.loadGlobalInfo = function() {
    if (!this._gdat) {
        this._gdat = []
        if (this.hasUserData(this.path())) {
            this._gdat = this.loadUserData(this.path(), []);
        }
    }
    return this._gdat || [];
};
DataManager.globalSet = function(key, value) {
    if (!this._gdat[0]) {
        this._gdat[0] = {};
    }
    this._gdat[0][key] = value;
    this.saveGlobalInfo();
};
DataManager.globalGet = function(key, defaultValue = null) {
    if (!this._gdat[0] || !this._gdat[0].hasOwnProperty(key)) {
        return defaultValue;
    }
    return this._gdat[0][key];
};
DataManager.globalDel = function(key) {
    if (this._gdat[0]) {
        if (this._gdat[0].hasOwnProperty(key)) {
            delete this._gdat[0][key];
            this.saveGlobalInfo();
        }
    }
};
DataManager.recoveryMeta = function() {
    return {
        globalId: this._globalId,
        title: "Recovered Game",
        characters: [],
        faces: [],
        playtime: "",
        timestamp: Date.now()
    };
};
DataManager.init = function() {
    let dataPath = App.dataPath();
    try {
        !Utils.exists(dataPath) && Utils.mkdir(dataPath);
    } catch (error) {
        App.crash("Unable to init data:", error);
        return;
    }
    let globalInfo = this.loadGlobalInfo();
    !globalInfo[0] && (globalInfo[0] = {});
    !globalInfo[0].hasOwnProperty("autoSaves") && (globalInfo[0].autoSaves = {});
    for (let saveIndex = 1; saveIndex <= this.maxSavefiles(); saveIndex++) {
        !StorageManager.exists(saveIndex) && (globalInfo[saveIndex] = null);
    }
    let autoSaveData = {};
    for (let fileName in globalInfo[0].autoSaves) {
        Utils.exists(Utils.join(dataPath, fileName)) && (autoSaveData[fileName] = globalInfo[0].autoSaves[fileName]);
    }
    for (let file of Utils.files(dataPath)) {
        let filePath = Utils.join(dataPath, file);
        if (Utils.ext(file.toLowerCase()) !== ".rpgsave") {
            continue;
        }
        let matchSave = file.match(/^file(\d+)\.rpgsave$/i);
        let matchAutoSave = file.match(/^auto(\d+)\.rpgsave$/i);
        if (matchSave) {
            let saveNumber = parseInt(matchSave[1], 10) || 0;
            if (saveNumber < 1 || saveNumber > DataManager.maxSavefiles()) {
                App.warn("Save index out of bounds: " + file);
                continue;
            }
            if (globalInfo[saveNumber]) {
                continue;
            }
            globalInfo[saveNumber] = this.recoveryMeta();
        } else if (matchAutoSave) {
            if (autoSaveData.hasOwnProperty(file)) {
                continue;
            }
            let timestamp = parseInt(matchAutoSave[1], 10) || 0;
            autoSaveData[file] = this.recoveryMeta();
            autoSaveData[file].timestamp = timestamp;
        }
    }
    let sortedAutoSaves = Object.keys(autoSaveData);
    this.sortDesc(sortedAutoSaves);
    while (sortedAutoSaves.length > this.autoSaveMax()) {
        Utils.delete(Utils.join(dataPath, sortedAutoSaves.pop()));
    }
    globalInfo[0].autoSaves = {};
    for (let autoSaveFile of sortedAutoSaves) {
        globalInfo[0].autoSaves[autoSaveFile] = autoSaveData[autoSaveFile];
    }
    this.saveGlobalInfo(globalInfo);
};
DataManager.loadAllSavefileImages = function() {
    if (!this._gdat) {
        return;
    }
    for (let i = 1; i < this._gdat.length; i++) {
        if (this._gdat[i]) {
            this.loadSavefileImages(this._gdat[i]);
        }
    }
    let autoSaves = this.globalGet("autoSaves", {});
    for (let key in autoSaves) {
        if (autoSaves[key]) {
            this.loadSavefileImages(autoSaves[key]);
        }
    }
};
DataManager.isThisGameFile = function(saveFileId) {
    return this.getSaveInfo(saveFileId) !== null;
};
DataManager.getSaveInfo = function(index) {
    if (!this._gdat) {
        App.fail("Global information lost.");
        return null;
    }
    if (index > 0) {
        if (index >= this._gdat.length) {
            App.fail("Info index out of bounds: " + index);
            return null;
        }
        return this._gdat[index];
    }
    let autoSaves = DataManager.globalGet("autoSaves", {});
    let keys = Object.keys(autoSaves);
    let absIndex = Math.abs(index);
    if (absIndex >= 0 && absIndex < keys.length) {
        return autoSaves[keys[absIndex]];
    }
    return null;
};
SceneManager.refresh = function() {
    if (!this._scene instanceof Scene_Load) {
        return;
    }
    let sceneListWindow = this._scene._listWindow;
    if (sceneListWindow) {
        sceneListWindow.refresh();
    }
};
DataManager.loadGame = function(savefileId) {
    let saveInfo = this.getSaveInfo(savefileId);
    let filePath = StorageManager.localFilePath(savefileId);
    try {
        if (!Utils.exists(filePath)) {
            if (saveInfo) {
                throw new Error("File Missing");
            }
            return false;
        }!saveInfo && App.warn("Issue with file info: " + filePath);
        let saveData = null;
        let fileContent = Utils.readFile(filePath);
        if (!fileContent) {
            throw new Error("Read Failed");
        }
        try {
            saveData = JsonEx.parse(LZString.decompressFromBase64(fileContent));
        } catch (error) {
            throw new Error("Invalid Data");
        }
        if (!saveData) {
            throw new Error("Corrupt Data");
        }
        if (saveData.format !== FORMAT) {
            throw new Error("Wrong Version");
        }
        this.createGameObjects();
        this.extractSaveContents(saveData);
        if (typeof $gameSystem._secondsPlayed !== "number") {
            let framesOnSave = $gameSystem._framesOnSave || 0;
            let fps = Math.max(Graphics._fpsMeter.fps, 60);
            $gameSystem._secondsPlayed = framesOnSave / fps;
        }
        Object.assign(saveInfo, this.makeSavefileInfo());
        this._lastAccessedId = Math.max(savefileId, 1);
        this.saveGlobalInfo();
        SceneManager.refresh();
        return true;
    } catch (error) {
        saveInfo && (saveInfo.title = "** " + error.message + " **");
        SceneManager.refresh();
        SoundManager.playCancel();
        App.fail("ID (" + savefileId + ") Load failed: " + filePath, error);
        return false;
    }
};
DataManager.isAnySavefileExists = function() {
    if (!this._gdat) {
        return false;
    }
    for (var i = 1; i < this._gdat.length; i++) {
        if (this.isThisGameFile(i)) {
            return true;
        }
    }
    let autoSaves = this.globalGet("autoSaves", {});
    return Object.keys(autoSaves).length > 0;
};
ConfigManager.path = function() {
    return "config.settings";
};
ConfigManager.save = function() {
    DataManager.saveUserData(this.path(), this.makeData());
};
ConfigManager.load = function() {
    let userData = {};
    if (DataManager.hasUserData(this.path())) {
        userData = DataManager.loadUserData(this.path());
    }
    for (var key in DEFAULTS) {
        if (DEFAULTS.hasOwnProperty(key) && !userData.hasOwnProperty(key)) {
            userData[key] = DEFAULTS[key];
        }
    }
    this.applyData(userData);
    this.language = userData.language;
    this.dashBonus = userData.dashBonus;
    this.inputHint = userData.inputHint;
    this.textSpeed = userData.textSpeed;
    this.autoSaves = userData.autoSaves;
    this.fullscreen = this.readFlag(userData, "fullscreen");
    this.fullscreen ? (document.body.style.cursor = "none", Graphics._requestFullScreen()) : (document.body.style.cursor = "default", Graphics._cancelFullScreen());
};
ConfigManager.makeData = function() {
    var configData = {
        language: this.language,
        autoSaves: this.autoSaves,
        inputHint: this.inputHint,
        textSpeed: this.textSpeed,
        fullscreen: this.fullscreen,
        alwaysDash: this.alwaysDash,
        dashBonus: this.dashBonus,
        bgmVolume: this.bgmVolume,
        bgsVolume: this.bgsVolume,
        meVolume: this.meVolume,
        seVolume: this.seVolume,
        touchUI: this.touchUI,
        commandRemember: this.commandRemember
    };
    return configData;
};
StorageManager.localFileDirectoryPath = function() {
    return App.dataPath();
};
StorageManager.localFilePath = function(savefileId) {
    let filePath = "";
    let dataPath = App.dataPath();
    if (savefileId > 0) {
        filePath = "file%1.rpgsave".format(savefileId);
    } else {
        let autoSaves = DataManager.globalGet("autoSaves", {});
        let autoSaveKeys = Object.keys(autoSaves);
        let index = Math.abs(savefileId);
        if (index >= 0 && index < autoSaveKeys.length) {
            filePath = autoSaveKeys[index];
        }
    }
    if (filePath) {
        return Utils.join(dataPath, filePath);
    }
    App.fail("No save file found with id: " + savefileId);
    return "";
};
DataManager.autoSaveMax = function() {
    return 5;
};
DataManager.autoSaveCount = function() {
    let autoSaves = this.globalGet("autoSaves", {});
    let maxAutoSaves = ConfigManager.autoSaves || 0;
    return Math.min(maxAutoSaves, Object.keys(autoSaves).length);
};
DataManager._skips = 0;
DataManager.autoSaveSkip = function(skipCount = 1) {
    this._skips += Math.max(skipCount, 1);
};
DataManager.autoSave = function() {
    if (this._skips > 0) {
        this._skips -= 1;
        App.info("Skipping auto-save. Remaining: " + this._skips);
        return;
    }
    try {
        this._autoSave();
    } catch (error) {
        App.fail("Auto save failed.", error);
    }
};
DataManager._autoSave = function() {
    let autoSaveCount = ConfigManager.autoSaves || 0;
    if (autoSaveCount < 1) {
        return;
    }
    $gameSystem.onBeforeSave();
    let dataPath = App.dataPath();
    let autoSaveName = "auto" + Date.now() + ".rpgsave";
    let autoSavePath = Utils.join(dataPath, autoSaveName);
    let saveContents = JsonEx.stringify(this.makeSaveContents());
    let compressedSaveContents = LZString.compressToBase64(saveContents);
    if (!Utils.writeFile(autoSavePath, compressedSaveContents)) {
        return;
    }
    let autoSaveFiles = [];
    for (let file of Utils.files(dataPath)) {
        if (file.toLowerCase().startsWith("auto") && file.toLowerCase().endsWith(".rpgsave")) {
            autoSaveFiles.push(file);
        }
    }
    this.sortDesc(autoSaveFiles);
    while (autoSaveFiles.length > this.autoSaveMax()) {
        Utils.delete(Utils.join(dataPath, autoSaveFiles.pop()));
    }
    let autoSaves = {};
    let savedAutoSaves = this.globalGet("autoSaves", {});
    savedAutoSaves[autoSaveName] = this.makeSavefileInfo();
    for (let i = 0; i < autoSaveFiles.length; i++) {
        let autoSaveFile = autoSaveFiles[i];
        savedAutoSaves.hasOwnProperty(autoSaveFile) ? autoSaves[autoSaveFile] = savedAutoSaves[autoSaveFile] : autoSaves[autoSaveFile] = this.recoveryMeta();
    }
    this.globalSet("autoSaves", autoSaves);
};
Game_Player.prototype.performTransfer = function() {
    if (this.isTransferring()) {
        this.setDirection(this._newDirection);
        if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
            $gameMap.setup(this._newMapId);
            this._needsMapReload = false;
        }
        this.locate(this._newX, this._newY);
        this.refresh();
        this.clearTransferInfo();
        DataManager.autoSave();
    }
};
Scene_Save.prototype.onSavefileOk = function() {
    let savefileId = this.savefileId();
    if (savefileId < 1) {
        SoundManager.playCancel();
        this.activateListWindow();
        return;
    }
    Scene_File.prototype.onSavefileOk.call(this);
    $gameSystem.onBeforeSave();
    DataManager.saveGame(savefileId) ? this.onSaveSuccess() : this.onSaveFailure();
};
Scene_Save.prototype.firstSavefileIndex = function() {
    let latestSavefileId = DataManager.latestSavefileId() - 1;
    return latestSavefileId + DataManager.autoSaveCount();
};
Scene_Load.prototype.firstSavefileIndex = function() {
    let latestSavefileId = DataManager.latestSavefileId() - 1;
    return latestSavefileId + DataManager.autoSaveCount();
};
Scene_File.prototype.savefileId = function() {
    let savefileIndex = this._listWindow.index() + 1;
    var autoSaveCount = DataManager.autoSaveCount();
    if (savefileIndex > autoSaveCount) {
        return savefileIndex - autoSaveCount;
    }
    return -savefileIndex + 1;
};
Scene_File.prototype.createListWindow = function() {
    let x = 0;
    let helpWindowHeight = this._helpWindow.height;
    let width = Graphics.boxWidth;
    let height = Graphics.boxHeight - helpWindowHeight;
    this._listWindow = new Window_SavefileList(x, helpWindowHeight, width, height);
    this._listWindow.setHandler("ok", this.onSavefileOk.bind(this));
    this._listWindow.setHandler("cancel", this.popScene.bind(this));
    this._listWindow.setMode(this.mode());
    let firstSavefileIndex = this.firstSavefileIndex();
    this._listWindow.select(firstSavefileIndex);
    this._listWindow.setTopRow(firstSavefileIndex - 2);
    this._listWindow.refresh();
    this.addWindow(this._listWindow);
};
Window_SavefileList.prototype.maxItems = function() {
    let savefileCount = DataManager.maxSavefiles();
    return savefileCount + DataManager.autoSaveCount();
};
Window_SavefileList.prototype.drawItem = function(index) {
    let rect = this.itemRectForText(index);
    let autoSaveCount = DataManager.autoSaveCount();
    let savefileId = index + 1;
    savefileId > autoSaveCount ? savefileId -= autoSaveCount : savefileId = -savefileId + 1;
    let saveInfo = DataManager.getSaveInfo(savefileId);
    this.resetTextColor();
    this.changePaintOpacity(true);
    if (savefileId > 0) {
        let text = TextManager.file + " " + savefileId;
        this.drawText(text, rect.x, rect.y, 180);
    } else {
        const padding = 20;
        let color = "#B2E087";
        let backgroundColor = "rgba(65, 73, 87, 0.2)";
        let text = "Auto " + (Math.abs(savefileId) + 1);
        if (this._mode === "save") {
            color = "#363636";
            let textColor = 'rgba(0, 0, 0)';
        }
        this.contents.fillRect(rect.x - padding, rect.y, rect.width + padding * 2, rect.height, backgroundColor);
        this.changePaintOpacity(saveInfo != null);
        this.changeTextColor(color);
        this.drawText(text, rect.x, rect.y, 180);
        this.resetTextColor();
    }
    saveInfo && (this._mode === "save" && savefileId < 1 ? this.changePaintOpacity(false) : this.changePaintOpacity(true), this.drawContents(saveInfo, rect, true));
};
const STEAM_INITIALIZING = 0;
const STEAM_RETRY_LAUNCH = 1;
const STEAM_INIT_REGULAR = 2;
const STEAM_INIT_APP_TXT = 3;
const STEAM_ERROR_MODULE = 4;
const STEAM_ERROR_CLIENT = 5;
const STEAM_ERROR_NOINIT = 6;

function Steam() {}
Steam.API = null;
Steam.state = 0;
Steam.appID = function() {
    return 2378900;
};
Steam.users = function() {
    let userGlobalInfo = DataManager.loadGlobalInfo();
    if (userGlobalInfo[0] && userGlobalInfo[0].steamUsers) {
        return userGlobalInfo[0].steamUsers;
    }
    return {};
};
Steam.isInitialized = function() {
    return this.state == STEAM_INIT_REGULAR || this.state == STEAM_INIT_APP_TXT;
};
Steam.retryInit = function() {
    return this.init(true);
};
Steam.init = function(steamInitRetry = false) {
    if (Utils.isOptionValid("test")) {
        return true;
    }
    if (!Utils.isNwjs()) {
        App.crash("Cannot initiate Steam without NWJS.");
        return false;
    }
    try {
        if (!this.API) {
            this.API = require("./greenworks/greenworks");
        }
    } catch (steamModuleLoadError) {
        this.state = STEAM_ERROR_MODULE;
        let steamModuleLoadErrorMessage = "ERROR:  STEAM MODULE FAILURE\n\n";
        steamModuleLoadErrorMessage += "Steam module failed to load. Try:";
        steamModuleLoadErrorMessage += "\n - Restarting Steam.";
        steamModuleLoadErrorMessage += "\n - Verifying game file integrity.";
        alert(steamModuleLoadErrorMessage);
        App.fail("Steam API module failed to import.");
        return false;
    }
    var steamAppId = String(this.appID());
    var steamAppIdPath = Utils.join(App.gamePath(), "steam_appid.txt");
    Utils.exists(steamAppIdPath) && Utils.delete(steamAppIdPath);
    if (!steamInitRetry && !this.API.isSteamRunning() && this.API.restartAppIfNecessary(this.appID())) {
        this.state = STEAM_RETRY_LAUNCH;
        App.info("Steam restarting...");
        return false;
    }
    if (!this.API.isSteamRunning()) {
        this.state = STEAM_ERROR_CLIENT;
        App.fail("A running Steam client was not detected.");
        return false;
    }
    this.state = STEAM_ERROR_NOINIT;
    try {
        if (this.API.init()) {
            this.state = STEAM_INIT_REGULAR;
            App.info("Steam API initialized.");
        } else {
            App.fail("Steam failed to initialize for internal reasons.");
        }
    } catch (steamInitError) {
        App.fail("Module failed to initialize Steam.", steamInitError);
    }
    if (this.state === STEAM_ERROR_NOINIT) {
        if (!Utils.writeFile(steamAppIdPath, steamAppId)) {
            return false;
        }
        try {
            if (this.API.init()) {
                this.state = STEAM_INIT_APP_TXT;
                App.info("Steam initialized using steam_appid.txt.");
            } else {
                App.fail("Steam API failed to init from steam_appid.txt");
            }
        } catch (steamInitFromAppIdError) {
            App.fail("Steam Module failed to init from steam_appid.txt.", steamInitFromAppIdError);
        }
        Utils.delete(steamAppIdPath);
    }
    var globalInfo = DataManager.loadGlobalInfo();
    if (!globalInfo[0]) {
        globalInfo[0] = {};
    }
    if (!globalInfo[0].steamUsers) {
        globalInfo[0].steamUsers = {};
    }
    if (!globalInfo[0].steamAchvs) {
        globalInfo[0].steamAchvs = [];
    }
    if (this.state === STEAM_ERROR_NOINIT) {
        if (globalInfo[0].steamAchvs.length > 0) {
            let steamInitFailedMessage = "ERROR:  STEAM API FAILURE\n\n";
            steamInitFailedMessage += "Game has persisting issues initializing Steam.\n\n";
            steamInitFailedMessage += "You have some unawarded achievements, these will\n";
            steamInitFailedMessage += "be given next time the game can connect to Steam.\n";
            alert(steamInitFailedMessage);
        }
        return false;
    }
    try {
        let steamId = this.API.getSteamId();
        delete globalInfo[0].steamUsers[steamId.screenName];
        globalInfo[0].steamUsers[steamId.screenName] = steamId.steamId;
    } catch (steamIdError) {
        App.fail("Failed to get Steam ID.", steamIdError);
    }
    let pendingAchievements = [...globalInfo[0].steamAchvs];
    globalInfo[0].steamAchvs = [];
    DataManager.saveGlobalInfo(globalInfo);
    for (let achievement of pendingAchievements) {
        Steam.awardAchievement(achievement);
    }
    return true;
};
Steam._success = function(actionName) {
    return function() {
        App.info("Steam action succeeded: " + actionName);
    };
};
Steam._failure = function(failureMessage) {
    return function() {
        App.fail("Steam action failed: " + failureMessage);
    };
};
Steam.awardAchievement = function(achievementName) {
    if (Utils.isOptionValid("test")) {
        App.notify("Achievement: " + achievementName);
        return;
    }
    if (!this.isInitialized() && !this.retryInit()) {
        var globalInfo = DataManager.loadGlobalInfo();
        if (!globalInfo[0]) {
            globalInfo[0] = {};
        }
        if (!globalInfo[0].steamAchvs) {
            globalInfo[0].steamAchvs = [];
        }
        if (globalInfo[0].steamAchvs.includes(achievementName)) {
            App.fail("Steam achievement already stored: " + achievementName);
        } else {
            globalInfo[0].steamAchvs.push(achievementName);
            DataManager.saveGlobalInfo(globalInfo);
            App.fail("Steam achieved was stored: " + achievementName);
        }
    }
    let actionName = "Award achievement (" + achievementName + ")";
    this.API.activateAchievement(achievementName, this._success(actionName), this._failure(actionName));
};
Steam.clearAllAchievements = function() {
    if (Utils.isOptionValid("test")) {
        return;
    }
    var globalInfo = DataManager.loadGlobalInfo();
    if (!globalInfo[0]) {
        globalInfo[0] = {};
    }
    globalInfo[0].steamAchvs = [];
    DataManager.saveGlobalInfo(globalInfo);
    if (!this.isInitialized() && !this.retryInit()) {
        App.fail("Steam achievements not cleared.");
        return;
    }
    App.notify("Clearing all achievements!");
    for (let achievementName of this.API.getAchievementNames()) {
        let clearMessage = "Clear achievement: " + achievementName;
        this.API.clearAchievement(achievementName, this._success(clearMessage), this._failure(clearMessage));
    }
};
Steam.currentLanguage = function() {
    if (Utils.isOptionValid("test")) {
        return "";
    }
    if (!this.isInitialized() && !this.retryInit()) {
        App.fail("Steam language not retrieved.");
        return "";
    }
    return this.API.getCurrentGameLanguage();
};
const SIGNATURE = LZString.decompressFromBase64("AwkOQUQWQGQhJUIg"); // 00000NEMLEI00000
const XORTARGET = "aUVaU1hDTUJeWQoHCmlFTExDRApFTAprRE5TCktETgpmT1NGT1MEXlJe"; // Copyrights - Coffin of Andy and Leyley.txt
function Crypto() {}
Crypto.hashMatchDRM = function(expectedHash) {
    var decodedPath = atob(XORTARGET).split("").map(char => String.fromCharCode(char.charCodeAt(0) ^ 42)).join("");
    if (!Utils.isOptionValid("test")) {
        decodedPath = "www/" + decodedPath;
    }
    try {
        var fileContent = Utils.readFile(decodedPath);
        var computedHash = this.djb2(new Uint8Array(Buffer.from(fileContent)));
        if (computedHash !== expectedHash) {
            App.fail("Invalid hash: " + computedHash);
            App.crash("Game files corrupted.\nRe-installation may repair files.");
            return false;
        }
    } catch (error) {
        App.crash("Game info file failed to load.", error);
        return false;
    }
    return true;
};
Crypto.djb2 = function(inputString) {
    var hash = 5381;
    for (var i = 0; i < inputString.length; i++) {
        hash = (hash << 5) + hash + inputString[i];
    }
    return hash >>> 0;
};
Crypto.guard = function() {
    this.guardValue = Math.floor(Math.random() * 4294967295);
    return this.guardValue;
};
Crypto.mask = function(filePath) {
    let hashValue = 0;
    let fileName = Utils.filename(decodeURIComponent(filePath)).toUpperCase();
    for (let char of fileName) {
        hashValue = hashValue << 1 ^ char.charCodeAt(0);
    }
    return hashValue;
};
Crypto._pathMap = {};
Crypto.resolveURL = function(url) {
    let resolvedURL = url;
    url = decodeURIComponent(url);
    if (url in Crypto._pathMap) {
        return Crypto._pathMap[url];
    }
    let filePath = Utils.join(App.rootPath(), url);
    if (!Utils.exists(filePath)) {
        let fileExtension = Utils.ext(filePath);
        let extensionRegex = new RegExp(fileExtension + "$", "i");
        resolvedURL = resolvedURL.replace(extensionRegex, ".k9a");
    }
    Crypto._pathMap[url] = resolvedURL;
    return resolvedURL;
};
Crypto.resolvePath = function(path) {
    if (path in Crypto._pathMap) {
        return Crypto._pathMap[path];
    }
    let resolvedPath = path;
    if (!Utils.exists(resolvedPath)) {
        let fileExtension = Utils.ext(resolvedPath);
        let extensionRegex = new RegExp(fileExtension + "$", "i");
        resolvedPath = resolvedPath.replace(extensionRegex, ".k9a");
    }
    Crypto._pathMap[path] = resolvedPath;
    return resolvedPath;
};
Crypto.dekit = function(encData, filePath, guardValue = -1) {
    if (!encData || encData.length < 1 || this.guardValue !== guardValue || Utils.ext(filePath).toLowerCase() != ".k9a") {
        return encData;
    }
    let decryptedData = new Uint8Array(encData);
    let headerLength = decryptedData[0];
    let dataLength = decryptedData[1 + headerLength];
    let encryptedData = decryptedData.subarray(2 + headerLength);
    let maskValue = Crypto.mask(filePath);
    if (dataLength === 0) {
        dataLength = encryptedData.length;
    }
    let decryptedBuffer = new Uint8Array(encryptedData.length);
    decryptedBuffer.set(encryptedData);
    for (let i = 0; i < dataLength; i++) {
        let encryptedByte = encryptedData[i];
        decryptedBuffer[i] = (encryptedByte ^ maskValue) % 256;
        maskValue = maskValue << 1 ^ encryptedByte;
    }
    return decryptedBuffer.buffer;
};
DataManager.loadDataFile = function(dataName, fileName) {
    var request = new XMLHttpRequest();
    var url = Crypto.resolveURL("data/" + fileName);
    request.open("GET", url);
    request.overrideMimeType("application/json");
    request.responseType = "arraybuffer";
    request.onload = function() {
        if (request.status < 400) {
            var dataString = "";
            var encryptedData = request.response;
            encryptedData = Crypto.dekit(encryptedData, url, Crypto.guard());
            dataString = new TextDecoder().decode(encryptedData);
            window[dataName] = JSON.parse(dataString);
            DataManager.onLoad(window[dataName]);
        }
    };
    request.onerror = this._mapLoader || function() {
        DataManager._errorUrl = DataManager._errorUrl || url;
    };
    window[dataName] = null;
    request.send();
};
Graphics.setLoadingImage = function(imagePath) {
    let image = ImageManager.loadNormalBitmap(imagePath);
    image.addLoadListener(function() {
        Graphics._loadingImage = image._image;
    });
};
Bitmap.prototype._requestImage = function(url) {
    url = Crypto.resolveURL(decodeURIComponent(url));
    this._image = Bitmap._reuseImages.length !== 0 ? Bitmap._reuseImages.pop() : new Image();
    if (this._decodeAfterRequest && !this._loader) {
        this._loader = ResourceHandler.createLoader(url, this._requestImage.bind(this, url), this._onError.bind(this));
    }
    this._url = url;
    this._image = new Image();
    this._loadingState = "decrypting";
    let self = this;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.send();
    xhr.onload = function() {
        if (this.status < 400) {
            let decryptedData = Crypto.dekit(this.response, url, Crypto.guard());
            self._image.src = Decrypter.createBlobUrl(decryptedData);
            self._image.addEventListener("load", self._loadListener = Bitmap.prototype._onLoad.bind(self));
            self._image.addEventListener("error", self._errorListener = self._loader || Bitmap.prototype._onError.bind(self));
        }
    };
    xhr.onerror = function() {
        self._loader ? self._loader() : self._onError();
    };
};
const DEFAULT_INV = "ashley";

function Inventory() {}
Inventory.storage = {};
Inventory.current = DEFAULT_INV;
Inventory.swap = function(newInventory) {
    if (this.current == newInventory) {
        return;
    }
    var itemsToStore = {};
    var itemsToRetrieve = {};
    var previousInventory = this.current;
    this.current = newInventory;
    $gameParty.allItems().forEach(function(item) {
        if (!item) {
            throw new Error("Item(s) missing from game.");
        }
        var itemCount = $gameParty.numItems(item);
        itemsToStore[item.id] = itemCount;
        $gameParty.loseItem(item, itemCount);
    });
    this.storage[previousInventory] = itemsToStore;
    itemsToRetrieve = this.storage[this.current] || {};
    for (var itemId in itemsToRetrieve) {
        if (DataManager.isItem($dataItems[itemId])) {
            $gameParty.gainItem($dataItems[itemId], itemsToRetrieve[itemId], false);
        } else {
            if (DataManager.isWeapon($dataWeapons[itemId])) {
                $gameParty.gainItem($dataWeapons[itemId], itemsToRetrieve[itemId], false);
            } else {
                if (DataManager.isArmor($dataArmors[itemId])) {
                    $gameParty.gainItem($dataArmors[itemId], itemsToRetrieve[itemId], false);
                }
            }
        }
    }
};
const _DM_CGO = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _DM_CGO.call(this);
    Inventory.storage = {};
    Inventory.current = DEFAULT_INV;
};
const _DM_MSC = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var saveData = {};
    var contents = _DM_MSC.call(this);
    $gameParty.allItems().forEach(function(item) {
        saveData[item.id] = $gameParty.numItems(item);
    });
    Inventory.storage[Inventory.current] = saveData;
    contents.format = FORMAT;
    contents.invStorage = Inventory.storage;
    contents.invCurrent = Inventory.current;
    return contents;
};
const _DM_ESC = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _DM_ESC.call(this, contents);
    Inventory.current = "";
    Inventory.storage = contents.invStorage || {};
    Inventory.swap(contents.invCurrent || "");
};
const MENU_ICON_MARGIN = 40;

function MenuOptions() {}
MenuOptions.iconImages = {};
MenuOptions.orderAndIcons = {
    "New Game": "new_game",
    "Continue": "continue",
    "Options": "options",
    "Language": "language",
    "Vision Room": "vision",
    "Credits": "credits",
    "Quit Game": "quit"
};
MenuOptions.labels = function() {
    return Object.keys(this.orderAndIcons);
};
MenuOptions.init = function() {
    this.labels().forEach(label => {
        this.iconImages[label] = ImageManager.loadSystem(this.orderAndIcons[label]);
    });
};
const _WTC_MCL = Window_TitleCommand.prototype.makeCommandList;
Window_TitleCommand.prototype.makeCommandList = function() {
    _WTC_MCL.call(this);
    if (Lang.count() > 1) {
        this.addCommand("Language", "language");
    }
    globalTag("vision_room") && this.addCommand("Vision Room", "vision");
    var filteredList = [];
    for (var label of MenuOptions.labels()) {
        var index = this._list.findIndex(command => command.name === label);
        if (index > -1) {
            filteredList.push(this._list[index]);
        }
    }
    this._list = filteredList;
};
const _ST_CCW = Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow = function() {
    _ST_CCW.call(this);
    this._commandWindow.setHandler("language", this.commandLanguage.bind(this));
    this._commandWindow.setHandler("vision", this.commandVisionRoom.bind(this));
};
Scene_Title.prototype.commandLanguage = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Language);
};
Scene_Title.prototype.commandVisionRoom = function() {
    DataManager.setupNewGame();
    $gamePlayer.reserveTransfer(86, 13, 9);
    this._commandWindow.close();
    this.fadeOutAll();
    SceneManager.goto(Scene_Map);
};
Window_TitleCommand.prototype.drawItem = function(index) {
    var label = this.commandName(index);
    var rect = this.itemRectForText(index);
    var icon = MenuOptions.iconImages[label];
    if (icon) {
        var x = rect.x;
        var y = rect.y + (rect.height - icon.height) / 2;
        this.contents.blt(icon, 0, 0, icon.width, icon.height, x, y);
    }
    rect.x += MENU_ICON_MARGIN;
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(Lang.translate(label), rect.x, rect.y, rect.width, "left");
};
var _sceneMenu = Scene_NCMenu || Scene_Menu;
var _windowMenu = Window_NCMenu || Window_MenuCommand;
const _WM_MCL = _windowMenu.prototype.makeCommandList;
_windowMenu.prototype.makeCommandList = function() {
    _WM_MCL.call(this);
    var commandIndex = this._list.findIndex(command => command.symbol === "options");
    var commandList = this._list.slice();
    this.clearCommandList();
    commandList.forEach((command, index) => {
        this.addCommand(command.name, command.symbol, command.enabled, command.ext);
        index === commandIndex && (Lang.count() > 1 && this.addCommand("Language", "language", true, null), this.addCommand("Controls", "controls", true, null));
    });
};
_windowMenu.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var windowWidth = this.windowWidth();
    var adjustedWidth = rect.width - windowWidth;
    var commandName = this.commandName(index);
    commandName = Lang.translate(commandName);
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(commandName, rect.x, rect.y, adjustedWidth, "left");
};
const _SM_CCW = _sceneMenu.prototype.createCommandWindow;
_sceneMenu.prototype.createCommandWindow = function() {
    _SM_CCW.call(this);
    this._commandWindow.setHandler("language", this.commandLanguage.bind(this));
    this._commandWindow.setHandler("controls", this.commandControls.bind(this));
};
_sceneMenu.prototype.commandLanguage = function() {
    this._commandWindow.close();
    SceneManager.push(Scene_Language);
};
_sceneMenu.prototype.commandControls = function() {
    SceneManager.push(Scene_Controls);
};

function Window_Language() {
    this.initialize.apply(this, arguments);
}
Window_Language.prototype = Object.create(Window_Command.prototype);
Window_Language.prototype.constructor = Window_Language;
Window_Language.prototype.initialize = function() {
    Window_Command.prototype.initialize.call(this, 0, 0);
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = (Graphics.boxHeight - this.height) / 2;
    this.currentLanguage = ConfigManager.language;
};
Window_Language.prototype.makeCommandList = function() {
    this.addCommand("Language", "language", true, 0);
};
Window_Language.prototype.windowWidth = function() {
    return 400;
};
Window_Language.prototype.numVisibleRows = function() {
    return 5;
};
Window_Language.prototype.drawItem = function(index) {
    this.refresh();
};
const BKG_COLOR = "#182232";
const TXT_COLOR = "#30B0CF";
const NFO_COLOR = "#EBAE69";
const SEP_COLOR = "#AAAAAA";
Window_Language.prototype.refresh = function() {
    var margin = LANG_ICO_MARGIN;
    var pixels = LANG_ICO_PIXELS;
    var rect = this.itemRect(0);
    var lineHeight = this.lineHeight();
    var language = ConfigManager.language;
    this.contents.clear();
    this.resetTextColor();
    this.resetFontSettings();
    this.drawText(Lang.translate(this.commandName(0)), rect.x + pixels + margin, rect.y, rect.width - 8 - pixels - margin, "left");
    this.swapFont(language);
    this.drawText(Lang.property(language, "langName"), rect.x + pixels + margin, rect.y, rect.width - 8 - pixels - margin, "right");
    if (Lang.isOfficial(language)) {
        this.contents.fillRect(rect.x, rect.y + lineHeight, rect.width, lineHeight, BKG_COLOR);
        this.resetFontSettings();
        this.contents.fontBold = true;
        this.changeTextColor(TXT_COLOR);
        this.drawText(Lang.translate("Credits"), rect.x + pixels + margin, rect.y + lineHeight, rect.width - 8 - pixels, "left");
        this.contents.fontBold = false;
        var stampBitmap = ImageManager.loadSystem("stamp");
        stampBitmap.addLoadListener(function() {
            this.contents.blt(stampBitmap, 0, 0, pixels, pixels, rect.x, rect.y + lineHeight + (lineHeight - pixels) / 2);
        }.bind(this));
        this.changeTextColor(NFO_COLOR);
    } else {
        this.resetTextColor();
        this.contents.fillRect(rect.x, rect.y + lineHeight + (lineHeight - 6) / 2, rect.width, 3, SEP_COLOR);
    }
    this.swapFont(language);
    var langInfo = Lang.property(language, "langInfo");
    for (var i = 0; i < Math.min(langInfo.length, 3); i++) {
        var info = langInfo[i];
        this.drawText(info, rect.x + pixels + margin, rect.y + lineHeight * (i + 2), rect.width - 8 - pixels, "left");
    }
    this.resetFontSettings();
};
Window_Language.prototype.swapFont = function(language) {
    var resolvedFont = Font.resolve(Lang.property(language, "fontFace"));
    if (resolvedFont !== "") {
        this.contents.fontFace = resolvedFont;
        this.contents.fontSize = Lang.property(language, "fontSize");
    } else {
        this.contents.fontSize = this.standardFontSize();
        this.contents.fontFace = this.standardFontFace();
    }
};
Window_Language.prototype.processOk = function() {
    this._input(INPUT_RIGHT);
};
Window_Language.prototype.cursorRight = function(wrap) {
    this._input(INPUT_RIGHT);
};
Window_Language.prototype.cursorLeft = function(wrap) {
    this._input(INPUT_LEFT);
};
Window_Language.prototype._input = function(input) {
    var languageCount = Lang.count();
    var languageIndex = Lang.index(ConfigManager.language);
    this.changeValue("language", Lang.key((languageIndex + input + languageCount) % languageCount));
};
Window_Language.prototype.changeValue = function(key, value) {
    SoundManager.playSave();
    Lang.select(value);
    ConfigManager.symbol = value;
    this.redrawItem(this.findSymbol(key));
};
Window_Language.prototype.update = function() {
    Window_Command.prototype.update.call(this);
    if (Input.isTriggered("cancel")) {
        if (this.currentLanguage !== ConfigManager.language) {
            ConfigManager.save();
            Lang.select(ConfigManager.language);
        }
        SceneManager.pop();
        SoundManager.playCancel();
    }
};

function Scene_Language() {
    this.initialize.apply(this, arguments);
}
Scene_Language.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Language.prototype.constructor = Scene_Language;
Scene_Language.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.setBackgroundOpacity(128);
    this._languageWindow = new Window_Language();
    this.addWindow(this._languageWindow);
};
Window_Options.prototype.addGeneralOptions = function() {
    this.addCommand("UI Hints", "inputHint");
    this.addCommand("Text Speed", "textSpeed");
    this.addCommand("Auto Saves", "autoSaves");
    this.addCommand("Fullscreen", "fullscreen");
    this.addCommand("Run Always", "alwaysDash");
    this.addCommand("Run Speed", "dashBonus");
};
Window_Options.prototype.addVolumeOptions = function() {
    this.addCommand("Volume BGM", "bgmVolume");
    this.addCommand("Volume SFX", "seVolume");
};
Window_Options.prototype.statusText = function(statusId) {
    let cmdSymbol = this.commandSymbol(statusId);
    let value = this.getConfigValue(cmdSymbol);
    const onText = Lang.translate("On");
    const offText = Lang.translate("Off");
    const slowText = Lang.translate("Slow");
    const fastText = Lang.translate("Fast");
    const instantText = Lang.translate("Instant");
    if (cmdSymbol === "dashBonus") {
        return value + "%";
    }
    if (cmdSymbol === "inputHint" || cmdSymbol === "fullscreen" || cmdSymbol === "alwaysDash") {
        return value ? onText : offText;
    }
    if (cmdSymbol === "bgmVolume" || cmdSymbol === "bgsVolume" || cmdSymbol === "meVolume" || cmdSymbol === "seVolume") {
        return value + "%";
    }
    if (cmdSymbol === "walkSpeed") {
        return value.toFixed(2);
    }
    if (cmdSymbol === "textSpeed") {
        return [slowText, fastText, instantText][value];
    }
    return value;
};
const INPUT_LEFT = -1;
const INPUT_RIGHT = 1;
const WRAP_RESULT = true;
Window_Options.prototype.processOk = function() {
    this._input(INPUT_RIGHT, WRAP_RESULT);
};
Window_Options.prototype.cursorRight = function(wrap) {
    this._input(INPUT_RIGHT);
};
Window_Options.prototype.cursorLeft = function(wrap) {
    this._input(INPUT_LEFT);
};
Window_Options.prototype._input = function(input, wrap = false) {
    let index = this.index();
    let symbol = this.commandSymbol(index);
    let value = this.getConfigValue(symbol);
    if (symbol === "inputHint" || symbol === "fullscreen" || symbol === "alwaysDash") {
        this.changeValue(symbol, !value);
        return;
    }
    let min = 0;
    let max = 100;
    if (symbol.contains("Volume")) {
        input *= VOL_STEP_SIZE;
    } else {
        if (symbol === "textSpeed") {
            max = 2;
        } else {
            if (symbol === "autoSaves") {
                max = DataManager.autoSaveMax();
            } else {
                if (symbol === "dashBonus") {
                    min = 10;
                    max = 30;
                    input *= DSH_STEP_SIZE;
                }
            }
        }
    }
    value = wrap ? value.boundaryWrap(input, min, max) : (value + input).clamp(min, max);
    this.changeValue(symbol, value);
};
Window_Options.prototype.changeValue = function(param, value) {
    if (param === "fullscreen") {
        this.setConfigValue(param, value);
        value ? Graphics._requestFullScreen() : Graphics._cancelFullScreen();
    } else {
        this.setConfigValue(param, value);
        if (param === "bgmVolume") {
            ConfigManager.meVolume = value;
        } else {
            if (param === "seVolume") {
                ConfigManager.bgsVolume = value;
            }
        }
    }
    SoundManager.playEquip();
    this.redrawItem(this.findSymbol(param));
};
Window_Options.prototype.drawItem = function(itemIndex) {
    let rect = this.itemRectForText(itemIndex);
    let textWidth = this.statusWidth();
    let itemWidth = rect.width - textWidth;
    let itemName = this.commandName(itemIndex);
    itemName = Lang.translate(itemName);
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(itemIndex));
    this.drawText(itemName, rect.x, rect.y, itemWidth, "left");
    this.drawText(this.statusText(itemIndex), itemWidth, rect.y, textWidth, "right");
};

function Scene_Controls() {
    this.initialize.apply(this, arguments);
}
Scene_Controls.prototype = Object.create(Scene_Base.prototype);
Scene_Controls.prototype.constructor = Scene_Controls;
Scene_Controls.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};
Scene_Controls.prototype._img = null;
Scene_Controls.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    !this._img && (this._img = ImageManager.loadPicture("keys"));
    this._background = new Sprite(this._img);
    this.addChild(this._background);
};
Scene_Controls.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
    (Input.isTriggered("ok") || Input.isTriggered("cancel") || TouchInput.isTriggered()) && this.popScene();
};
Scene_Controls.prototype.terminate = function() {
    SoundManager.playCancel();
    Scene_Base.prototype.terminate.call(this);
    this.removeChild(this._background);
    this._background = null;
};
const _G_SFS = Graphics._switchFullScreen;
Graphics._switchFullScreen = function() {
    _G_SFS.call(this);
    ConfigManager.fullscreen = Graphics._isFullScreen();
    ConfigManager.save();
    Graphics._isFullScreen() ? document.body.style.cursor = "none" : document.body.style.cursor = "default";
    if (SceneManager._scene instanceof Scene_Options) {
        var optionsWindow = SceneManager._scene._optionsWindow;
        optionsWindow.redrawItem(optionsWindow.findSymbol("fullscreen"));
    }
};
Game_CharacterBase.prototype.realMoveSpeed = function() {
    if (this._moveSpeed != 4) {
        return this._moveSpeed;
    }
    var walkSpeed = BASE_WALK_SPD;
    if (this.isDashing()) {
        var dashBonus = ConfigManager.dashBonus;
        walkSpeed *= 1 + dashBonus / 100;
    }
    return walkSpeed;
};
const _WM_USF = Window_Message.prototype.updateShowFast;
Window_Message.prototype.updateShowFast = function() {
    var textSpeedDiff = Math.abs(ConfigManager.textSpeed - 2);
    if (textSpeedDiff === 0) {
        this._showFast = true;
    } else {
        _WM_USF.call(this);
    }
};
const _WM_UM = Window_Message.prototype.updateMessage;
Window_Message.prototype.updateMessage = function() {
    var textSpeedDiff = Math.abs(ConfigManager.textSpeed - 2);
    var originalReturnValue = _WM_UM.call(this);
    if (textSpeedDiff !== 0 && this._textState && this._textState.text[this._textState.index] !== "") {
        this._waitCount = textSpeedDiff - 1;
    }
    return originalReturnValue;
};
const _I_UGS = Input._updateGamepadState;
Input._updateGamepadState = function(gamepad) {
    const buttonIndex = 9;
    if (gamepad.buttons[buttonIndex] && gamepad.buttons[buttonIndex].pressed !== null) {
        var previousState = this._gamepadStates[buttonIndex];
        var currentPressed = gamepad.buttons[buttonIndex].pressed;
        this._gamepadStates[buttonIndex] = currentPressed;
        if (!previousState && currentPressed) {
            Graphics._switchFullScreen();
        }
    }
    _I_UGS.call(this, gamepad);
};
Sprite_Balloon.prototype.setup = function(balloonId) {
    this._balloonId = balloonId;
    this._duration = 8 * this.speed() + this.waitTime();
    this._loop = false;
    this._fullDuration = this._duration;
};
Sprite_Balloon.prototype.frameIndex = function() {
    var animationProgress = this._duration / this._fullDuration;
    var animationFrame = Math.floor((1 - animationProgress) * 8);
    return Math.max(0, Math.min(7, animationFrame));
};
Sprite_Balloon.prototype.resetAnimation = function() {
    this._duration = this._fullDuration;
};
Sprite_Balloon.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    if (this._duration > 0) {
        this._duration--;
        if (this._loop) {
            this.updateFrame();
            this._duration <= 0 && (this._duration += this._fullDuration);
        } else {
            this._duration > 0 && this.updateFrame();
        }
    }
};
Game_Event.prototype.isEnabled = function() {
    var eventPage = this.event().pages[this._pageIndex];
    if (eventPage.list.length < 1 || eventPage.list.length === 1 && eventPage.list[0].code === 0) {
        return false;
    }
    var firstCommand = eventPage.list[0];
    if (firstCommand.code === 108) {
        var commandParams = firstCommand.parameters[0].toLowerCase().replace(/\s+/g, "");
        var matchResult = commandParams.match(/enabled:(\d+)([!=><]+)(\w+|has)/);
        if (!matchResult) {
            return false;
        }
        var id = Number(matchResult[1]);
        var operator = matchResult[2];
        var condition = matchResult[3];
        if (condition === "on" || condition === "off") {
            var isOn = condition === "on";
            var switchValue = $gameSwitches.value(id);
            if (operator === "==") {
                return isOn && switchValue || !isOn && !switchValue;
            }
            if (operator === "!=") {
                return isOn && !switchValue || !isOn && switchValue;
            }
            return false;
        } else {
            if (condition === "has") {
                if (operator === "==") {
                    return $gameParty.hasItem($dataItems[id]);
                }
                if (operator === "!=") {
                    return !$gameParty.hasItem($dataItems[id]);
                }
                return false;
            } else {
                var variableValue = $gameVariables.value(id);
                var numericCondition = Number(condition);
                switch (operator) {
                    case "==":
                        return variableValue === numericCondition;
                    case "!=":
                        return variableValue !== numericCondition;
                    case ">=":
                        return variableValue >= numericCondition;
                    case "<=":
                        return variableValue <= numericCondition;
                    case ">":
                        return variableValue > numericCondition;
                    case "<":
                        return variableValue < numericCondition;
                }
                App.fail("Invalid comparison operator for enable / disable comment hint: " + firstCommand.parameters[0]);
                return false;
            }
        }
    }
    return true;
};
const HINT_Y_OFS = 78;
const BALLOON_ID = 15;
const HINT_RANGE = 0.75;

function eventHintEnable(eventHint) {}

function eventHintDisable(eventHint) {}

function Hint() {}
Hint._change = 0;
Hint._active = false;
Hint._balloon = null;
Hint.delta = function() {
    if (Hint._change > 0) {
        var deltaTime = SceneManager._deltaTime;
        return deltaTime / Hint._change;
    }
    return 0;
};
Hint.balloon = function() {
    if (!this._balloon) {
        this._balloon = new Sprite_Balloon();
        this._balloon.setup(BALLOON_ID);
        this._balloon._loop = true;
        this._balloon.alpha = 0;
        this._change = 0;
        this._active = false;
    }
    return this._balloon;
};
Hint.open = function(duration = 0) {
    this._active = true;
    this._change = Math.max(0, duration);
    let balloon = this.balloon();
    if (balloon.alpha <= 0) {
        balloon._duration = balloon._fullDuration;
    }
    if (balloon.alpha < 1 && duration <= 0) {
        balloon.alpha = 1;
    }
};
Hint.close = function(duration = 0) {
    this._active = false;
    this._change = Math.max(0, duration);
    let balloon = this.balloon();
    if (balloon.alpha > 0 && duration <= 0) {
        balloon.alpha = 0;
    }
};
Hint.process = function() {
    let balloon = this.balloon();
    if (!ConfigManager.inputHint) {
        Hint.close();
        return;
    }
    let eventId = $gameMap._interpreter._eventId;
    if (eventId > 0) {
        let gameEvent = $gameMap.event(eventId) || null;
        if (!gameEvent || gameEvent._trigger < 4) {
            Hint.close();
            return;
        }
    }
    if (this._active) {
        balloon.update();
        balloon.alpha = Math.min(1, balloon.alpha + Hint.delta());
    } else {
        balloon.alpha = Math.max(0, balloon.alpha - Hint.delta());
    }
    balloon.x = $gamePlayer.screenX();
    balloon.y = $gamePlayer.screenY() - HINT_Y_OFS;
    let playerX = $gamePlayer.x;
    let playerY = $gamePlayer.y;
    let realPlayerX = $gamePlayer._realX;
    let realPlayerY = $gamePlayer._realY;
    let targetX = playerX;
    let targetY = playerY;
    switch ($gamePlayer.direction()) {
        case 2:
            targetY++;
            break;
        case 4:
            targetX--;
            break;
        case 6:
            targetX++;
            break;
        case 8:
            targetY--;
            break;
    }
    let currentEventId = 0;
    $gameMap.eventsXy(playerX, playerY).forEach(function(event) {
        if (event.isTriggerIn([0]) && event.isEnabled()) {
            currentEventId = event._eventId;
            return;
        }
    });
    $gameMap.eventsXy(targetX, targetY).forEach(function(event) {
        if (currentEventId > 0) {
            return;
        }
        if (event.isTriggerIn([0]) && event.isNormalPriority() && event.isEnabled()) {
            currentEventId = event._eventId;
            return;
        }
    });
    if (currentEventId > 0) {
        let xOffset = 1 - Math.abs(playerX - realPlayerX);
        let yOffset = 1 - Math.abs(playerY - realPlayerY);
        if (Math.min(xOffset, yOffset) > HINT_RANGE) {
            if (!this._active) {
                this.open(0.1);
                this.lastEvent = currentEventId;
            }
        } else {
            if (currentEventId != this.lastEvent) {
                this.close(0.2);
            }
        }
    } else {
        this.lastEvent = 0;
        if (this._active) {
            this.close(0.1);
        }
    }
};
const _SM_S = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _SM_S.call(this);
    this.addChild(Hint.balloon());
};
var _SC_US = SceneManager.updateScene;
SceneManager.updateScene = function() {
    _SC_US.call(this);
    if ($gameSystem && Number.isFinite($gameSystem._secondsPlayed)) {
        $gameSystem._secondsPlayed += this._deltaTime;
    }
    if (!this.isSceneChanging() && this.isCurrentSceneStarted() && this._scene instanceof Scene_Map) {
        Hint.process();
        return;
    }
    Hint.close();
};
Game_System.prototype.playtime = function() {
    return this._secondsPlayed || 0;
};
Game_System.prototype.playtimeText = function() {
    var playtime = this.playtime();
    var hours = Math.floor(playtime / 60 / 60);
    var minutes = Math.floor(playtime / 60) % 60;
    var seconds = Math.floor(playtime % 60);
    return hours.padZero(2) + ":" + minutes.padZero(2) + ":" + seconds.padZero(2);
};
Game_System.prototype.updatePlayTime = function(deltaTime) {
    if (this._secondsPlayed) {
        this._secondsPlayed += deltaTime;
    }
};
var _DM_SNG_ = DataManager.setupNewGame;
DataManager.setupNewGame = function() {
    _DM_SNG_.call(this);
    $gameSystem._secondsPlayed = 0;
};
const FONT_TYPES = [".ttf", ".otf", ".eot", ".svg", ".woff", ".woff2"];

function Font() {}
Font.data = {};
Font.size = 28;
Font.face = "GameFont";
Font.list = ["Dotum", "SimHei", "GameFont", "Heiti TC", "sans-serif", "AppleGothic"];
Font.change = function(fontName, fontSize = 28) {
    this.face = "";
    var resolvedFont = this.resolve(fontName);
    if (resolvedFont) {
        this.face = resolvedFont;
        this.size = fontSize;
    }
};
Font.key = function(pattern) {
    var regex = new RegExp(pattern, "i");
    var matchingKeys = Object.keys(this.data).filter(key => regex.test(key));
    if (matchingKeys.length > 0) {
        return matchingKeys[0];
    }
    return pattern;
};
Font.resolve = function(fontName) {
    var fileName = Utils.filename(fontName);
    if (this.list.includes(fileName)) {
        return fileName;
    }
    var fontKey = this.key(Lang.current() + "_" + fileName);
    if (!fontKey) {
        fontKey = this.key(fileName);
    }
    if (!fontKey) {
        App.fail("Cannot locate font named: " + fontName);
        return "GameFont";
    }
    var filePath = this.data[fontKey];
    if (!Utils.exists(filePath)) {
        App.fail("Missing font: " + filePath);
        return "GameFont";
    }
    filePath = Utils.relative(App.rootPath(), filePath);
    filePath = filePath.replace(/\\/g, "/");
    fontKey = fontKey.replace(/\.[^/.]+$/, "");
    if (this.list.includes(fontKey)) {
        return fontKey;
    }
    var fontFace = new FontFace(fontKey, "url(" + filePath + ")");
    fontFace.load().then(function(font) {
        document.fonts.add(font);
        Font.list.push(fontKey);
        if (SceneManager._scene._windowLayer) {
            SceneManager._scene._windowLayer.children.forEach(function(window) {
                typeof window.refresh === "function" && window.refresh();
            });
        }
    }).catch(function(error) {
        App.fail("Font failed to load: " + fontName, error);
        return "GameFont";
    });
    return fontKey;
};
const _WB_RFS = Window_Base.prototype.resetFontSettings;
Window_Base.prototype.resetFontSettings = function() {
    _WB_RFS.apply(this, arguments);
    if (Font.face !== "" && this.constructor.name !== "Window_Credits") {
        this.contents.fontFace = Font.face;
        this.contents.fontSize = Font.size;
    }
};
const LANG_DIR = "languages/";
const LANG_LOC = "english";
const LANG_TXT = "english_txt";
const LANG_CSV = "english_csv";
const LANG_ICO_MARGIN = 10;
const LANG_ICO_PIXELS = 26;
const VALID_EXT = [".loc", ".txt", ".csv"];
const LANG_ORDERING = ["english", "korean", "japanese", "chinese"];

function Lang() {}
Lang.data = {};
Lang.list = {};
Lang.offc = [];
Lang.count = function() {
    return Object.keys(this.list).length;
};
Lang.index = function(langKey) {
    return Object.keys(this.list).indexOf(langKey);
};
Lang.isOfficial = function(langKey) {
    return this.offc.includes(langKey);
};
Lang.current = function() {
    var languagePath = this.list[ConfigManager.language] || "";
    if (!languagePath) {
        App.warn("Current language not in list: " + key);
        return "n/a";
    }
    return Utils.basename(Utils.dirname(languagePath));
};
Lang.key = function(index) {
    var languageKeys = Object.keys(this.list);
    var lastLanguageIndex = languageKeys.length - 1;
    if (lastLanguageIndex < 0) {
        App.crash("No language table created.");
        return "";
    }
    if (index < 0 || index > lastLanguageIndex) {
        App.fail("Language index out of bounds.");
        index = 0;
    }
    return languageKeys[index];
};
Lang.property = function(key1, key2, defaultValue = null) {
    if (Object.keys(this.data).length === 0) {
        return defaultValue;
    }
    if (this.data.hasOwnProperty(key1) && typeof this.data[key1] === "object" && this.data[key1].hasOwnProperty(key2)) {
        return this.data[key1][key2];
    }
    App.fail("Language property missing: " + key1 + ":" + key2);
    return defaultValue;
};
Lang.translate = function(translationKey) {
    var language = ConfigManager.language;
    var sysMenus = this.property(language, "sysMenus");
    var sysLabel = this.property(language, "sysLabel");
    if (sysMenus && sysMenus.hasOwnProperty(translationKey)) {
        return sysMenus[translationKey];
    }
    if (sysLabel && sysLabel.hasOwnProperty(translationKey)) {
        return sysLabel[translationKey];
    }
    return translationKey;
};
Lang.label = function(labelString, useBrackets = false) {
    var labelLUT = this.property(ConfigManager.language, "labelLUT");
    labelString = labelString.replace(/\(label\)\[([^\]]+)\]/g, function(fullMatch, labelKey) {
        var labelValue = labelLUT && labelLUT[labelKey] ? labelLUT[labelKey] : fullMatch;
        return useBrackets ? "<" + labelValue + ">" : labelValue;
    });
    return labelString;
};
const FALLBACK_HASHES = {
    "w7ZvbBvC": "yrrRQ30Q",
    "4yhN4h9P": "lcmDVkXT",
    "DCRBH5zy": "cT2mmJwp",
    "DxhMltBG": "GXCRgnRB"
};
Lang.lines = function(code) {
    var textData = {
        text: code,
        lines: []
    };
    var linesLUT = this.property(ConfigManager.language, "linesLUT");
    textData.text = textData.text.replace(/\(lines\)\[([^\]]+)\]/g, function(match, hash) {
        if (linesLUT) {
            if (linesLUT[hash]) {
                textData.lines = linesLUT[hash];
                return "";
            }
            let fallbackHash = FALLBACK_HASHES[hash];
            if (fallbackHash && linesLUT[fallbackHash]) {
                textData.lines = linesLUT[fallbackHash];
                return "";
            }
        }
        return match;
    });
    return textData;
};
Lang.search = function() {
    let folderPath = Utils.join(App.rootPath(), LANG_DIR);
    if (!Utils.exists(folderPath)) {
        App.warn("Language data unavailable.");
        return;
    }
    if (!Utils.canAccess(folderPath)) {
        App.crash("Language data not accessible.");
        return;
    }
    let subfolders = Utils.folders(folderPath);
    if (subfolders.length === 0) {
        App.crash("Error reading languages folder.");
        return;
    }
    this.list = {};
    for (let i = 0; i < subfolders.length; i++) {
        let folder = Utils.join(folderPath, subfolders[i]);
        for (let fontFile of Utils.findFiles(folder, FONT_TYPES)) {
            let fontName = Utils.basename(fontFile);
            let fontKey = subfolders[i] + "_" + fontName;
            Font.data[fontKey] = fontFile;
        }
        let files = Utils.files(folder);
        for (let j = 0; j < files.length; j++) {
            let file = files[j];
            let langKey = subfolders[i];
            let fileExt = Utils.ext(file).toLowerCase();
            if (!VALID_EXT.includes(fileExt)) {
                continue;
            }
            if (fileExt === ".loc") {
                this.offc.push(langKey);
            } else {
                langKey += fileExt.replace(".", "_");
                if (Utils.isOptionValid("test")) {
                    this.offc.push(langKey);
                }
            }
            this.list[langKey] = Utils.join(folder, file);
        }
    }
    let enabledLangs = [];
    let officalLangs = [];
    let langMap = {};
    for (let langKey in this.list) {
        this.offc.includes(langKey) ? officalLangs.push(langKey) : enabledLangs.push(langKey);
    }
    for (let lang of LANG_ORDERING) {
        for (let langKey of officalLangs) {
            if (langKey.toLowerCase().includes(lang.toLowerCase())) {
                langMap[langKey] = this.list[langKey];
            }
        }
    }
    for (let langKey of officalLangs) {
        langMap[langKey] = this.list[langKey];
    }
    for (let langKey of enabledLangs) {
        langMap[langKey] = this.list[langKey];
    }
    this.list = langMap;
};
Lang.select = function(languageKey) {
    if (this.count() < 1) {
        App.isDevMode() ? App.info("Skipped language select: " + languageKey) : App.crash("Language data missing.\nA re-install may fix it.");
        return;
    }
    let currentLanguage = "";
    if (VENDOR === K9V_STEAM) {
        currentLanguage = Steam.currentLanguage();
    }
    let languageKeys = [languageKey, currentLanguage, LANG_LOC, LANG_TXT, LANG_CSV];
    for (let key of languageKeys) {
        if (!this.list.hasOwnProperty(key)) {
            continue;
        }
        let languageData = {};
        let filePath = this.list[key];
        let fileExtension = Utils.ext(filePath).toLowerCase();
        if (this.data.hasOwnProperty(key)) {
            languageData = this.data[key];
        } else {
            if (fileExtension === ".loc") {
                languageData = this.loadLOC(filePath);
            } else {
                if (fileExtension === ".txt") {
                    languageData = this.loadTXT(filePath);
                } else {
                    if (fileExtension === ".csv") {
                        languageData = this.loadCSV(filePath);
                    }
                }
            }
            if (!this.isValid(languageData)) {
                App.fail("Invalid data for: " + key);
                continue;
            }
            this.data[key] = languageData;
            this.imgMapping(key);
        }
        ConfigManager.language = key;
        Font.change(languageData.fontFace, languageData.fontSize);
        let gameTitle = languageData.sysLabel.Game;
        let itemLabel = languageData.sysLabel.Item;
        let fileLabel = languageData.sysLabel.File;
        let saveLabel = languageData.sysLabel.Save;
        let loadLabel = languageData.sysLabel.Load;
        document.title = gameTitle;
        $dataSystem.gameTitle = gameTitle + " v" + GAME_VERSION;
        $dataSystem.terms.commands[4] = itemLabel;
        $dataSystem.terms.messages.file = fileLabel;
        $dataSystem.terms.messages.saveMessage = saveLabel;
        $dataSystem.terms.messages.loadMessage = loadLabel;
        return;
    }
    ConfigManager.language = "";
    const errorMessage = "Default languages missing.";
    App.isDevMode() ? App.fail(errorMessage) : App.crash(errorMessage);
};
Lang.imgFolder = function(folderPath, folderName) {
    var imgPath = Utils.join(folderPath, folderName);
    var langKey = ConfigManager.language;
    var imgLUT = this.property(langKey, "imageLUT", {});
    if (imgLUT.hasOwnProperty(imgPath)) {
        return imgLUT[imgPath];
    }
    return folderPath;
};
Lang.imgMapping = function(langKey) {
    var langData = this.data[langKey];
    var folderPath = Utils.dirname(this.list[langKey]);
    var imgPath = Utils.join(folderPath, "img");
    if (!Utils.exists(imgPath)) {
        App.info("No translated images: " + folderPath);
        return;
    }
    for (var imagePath of Utils.findFiles(imgPath, [".png", ".webp"])) {
        var relPath = Utils.relative(folderPath, imagePath);
        var rootPath = Utils.relative(App.rootPath(), folderPath);
        var fileName = Utils.join(Utils.dirname(relPath), Utils.filename(relPath));
        try {
            var filePath = Utils.join(App.rootPath(), relPath);
            var folderRoot = Utils.join(rootPath, Utils.dirname(relPath));
            filePath = Crypto.resolvePath(filePath);
            if (Utils.exists(filePath)) {
                folderRoot = folderRoot.replace("\\", "/");
                langData.imageLUT[fileName] = folderRoot + "/";
            } else {
                App.fail("Couldn't find image: " + filePath);
            }
        } catch (error) {
            App.fail("Failed to check remapping: " + imagePath, error);
        }
    }
};
const _IM_LB = ImageManager.loadBitmap;
ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
    folder = Lang.imgFolder(folder, filename);
    return _IM_LB.call(this, folder, filename, hue, smooth);
};
Lang.newData = function() {
    return {
        langName: "",
        langInfo: ["", "", ""],
        fontFace: "",
        fontSize: 0,
        sysLabel: {},
        sysMenus: {},
        labelLUT: {},
        linesLUT: {},
        imageLUT: {}
    };
};
Lang.isValid = function(data) {
    var base = this.newData();
    if (!data || !Object.keys(data).length) {
        App.fail("Language data missing.");
        return false;
    }
    for (var key in base) {
        if (!(key in data)) {
            App.fail("Missing field: " + key);
            return false;
        }
        if (typeof data[key] !== typeof base[key]) {
            App.fail("Mismatched type: " + key);
            return false;
        }
    }
    if (!data.langName.trim()) {
        App.fail("Missing langName.");
        return false;
    }
    if (data.langInfo.length < 3) {
        App.fail("Missing lines in langInfo.");
        return false;
    }
    if (!data.fontFace.trim()) {
        App.fail("Missing fontFace.");
        return false;
    }
    if (data.fontSize < 1) {
        App.fail("fontSize < 1.");
        return false;
    }
    for (var key of ["sysLabel", "sysMenus", "labelLUT", "linesLUT"]) {
        if (!Object.keys(data[key]).length) {
            App.fail(key + " empty.");
            return false;
        }
    }
    return true;
};
Lang.loadLOC = function(filePath) {
    var fileData = {};
    var signatureLength = Buffer.byteLength(SIGNATURE, "utf8");
    try {
        fileData = Utils.readFile(filePath);
        fileData = fileData.slice(signatureLength + 4, fileData.length + 4);
        try {
            fileData = JSON.parse(fileData.toString("utf8"));
        } catch (parseError) {
            App.fail("Error parsing file: " + filePath, parseError);
        }
    } catch (readError) {
        App.fail("Error reading file: " + filePath, readError);
    }
    fileData.imageLUT = {};
    return fileData;
};
Lang.loadTXT = function(file) {
    var content = "";
    try {
        content = Utils.readFile(file, "utf8");
    } catch (error) {
        App.fail("Error reading file: " + file, error);
        return {};
    }
    var data = this.newData();
    var lineNum = 0;
    var section = "";
    var choices = [];
    var useChoices = false;
    const sections = {
        "MENUS": data.sysMenus,
        "LABELS": data.sysLabel,
        "ITEMS": data.labelLUT,
        "SPEAKERS": data.labelLUT
    };
    for (var line of content.split("\n")) {
        if (!line.trim()) {
            continue;
        }
        line = line.replace("\r", "");
        if (line.startsWith("[")) {
            if (line.toUpperCase() === "[CHOICES]") {
                useChoices = true;
                continue;
            }
            lineNum = 0;
            section = line.replace("[", "").replace("]", "");
            continue;
        }
        if (!section) {
            continue;
        }
        lineNum += 1;
        var key = section.trim().toUpperCase();
        if (key === "LANGUAGE") {
            data.langName = line;
            section = "";
        } else {
            if (key === "FONT") {
                var parts = line.split(":");
                parts.length > 1 && (line = parts[1].trim());
                if (lineNum === 1) {
                    data.fontFace = line;
                } else {
                    data.fontSize = parseInt(line);
                    section = "";
                }
            } else {
                if (key === "CREDITS") {
                    var parts = line.split(":");
                    if (parts.length > 1) {
                        line = parts[1].trim();
                    }
                    data.langInfo[lineNum - 1] = line;
                    if (lineNum >= 3) {
                        section = "";
                    }
                } else {
                    if (key in sections) {
                        if (line.includes(":")) {
                            var [label, value] = line.split(":");
                            label = label.trim();
                            value = value.trim();
                            if (label.startsWith("#")) {
                                label = label.slice(1);
                            }
                            sections[key][label] = value;
                        }
                    } else {
                        if (line.startsWith("#")) {
                            var sep = ":";
                            if (line.includes("(")) {
                                sep = "(";
                                useChoices = false;
                            }
                            var parts = line.split(sep);
                            if (parts.length < 2) {
                                App.fail("Line is missing parts.\nLine: " + line + "\nFile: " + file);
                                return {};
                            }
                            var label = parts[0].trim().slice(1);
                            var value = parts[1].startsWith(" ") ? parts[1].slice(1) : parts[1];
                            if (useChoices) {
                                data.labelLUT[label] = value;
                            } else {
                                choices = [];
                                data.linesLUT[label] = choices;
                            }
                        } else {
                            if (line.startsWith(":")) {
                                if (useChoices) {
                                    App.fail("Line content mismatch.\nLine: " + line + "\nFile: " + file);
                                    return {};
                                }
                                line = line.slice(1);
                                if (line.startsWith(" ")) {
                                    line = line.slice(1);
                                }
                                choices.push(line);
                            }
                        }
                    }
                }
            }
        }
    }
    return data;
};
const CSV_BLOCKS = {
    "MENUS": 2,
    "ITEMS": 3,
    "LABELS": 3,
    "SECTION": 4,
    "CREDIT 1": 3,
    "SPEAKERS": 3,
    "LANGUAGE": 3,
    "DESCRIPTIONS": 4
};
const SECTION_HEADER = ["ID", "Source", "English", "Translation"];
Lang.is_header = function(header) {
    const expected = SECTION_HEADER.map(name => name.toUpperCase());
    const actual = header.map(name => name.trim().toUpperCase());
    return JSON.stringify(expected) === JSON.stringify(actual);
};
Lang.new_block = function(blockName, values, line) {
    if (!Object.keys(CSV_BLOCKS).includes(blockName)) {
        return false;
    }
    if (blockName === "LANGUAGE") {
        return line.length >= CSV_BLOCKS[blockName] && (line[1].trim() === "Font File" || line[2].trim() === "Font Size" || line[2].trim() !== "");
    }
    if (blockName === "ITEMS") {
        return line.length >= CSV_BLOCKS[blockName] && (line[1].trim() === "English" || line[2].trim() === "Translation" || line[2].trim() !== "");
    }
    return true;
};
Lang.loadCSV = function(file) {
    let data = this.newData();
    let lines = "";
    try {
        lines = Utils.readFile(file, "utf8");
    } catch (error) {
        App.fail("Error reading file: " + file, error);
        return {};
    }
    let section = "";
    let label = "";
    let choices = [];
    let started = false;
    for (let line of lines.split("\n")) {
        line = line.trim();
        if (!line) {
            continue;
        }
        let parts = [];
        let text = "";
        let sep = 0;
        let inQuote = false;
        let len = line.length;
        while (sep < len) {
            let c = line[sep];
            if (!inQuote && c === "\"") {
                inQuote = true;
            } else {
                if (inQuote && (c === "“" || c === "”")) {
                    text += "\"";
                } else {
                    if (line.substr(sep, 2) === "\"\"") {
                        text += "\"";
                        sep += 1;
                    } else {
                        if (inQuote && c === "\"") {
                            inQuote = false;
                        } else {
                            !inQuote && c === "," ? (parts.push(text), text = "") : text += c;
                        }
                    }
                }
            }
            sep += 1;
            sep >= len && parts.push(text);
        }
        let count = parts.length;
        if (count < 1 || parts[0].trim() === "") {
            continue;
        }
        if (count < 2) {
            App.fail("CSV line missing columns.\nLine: " + line + "\nFile: " + file);
            return {};
        }
        let header = parts[0].toUpperCase();
        if (!header.trim()) {
            App.fail("CSV first column missing.\nLine: " + line + "\nFile: " + file);
            return {};
        }
        if (this.new_block(header, section, parts)) {
            section = header;
            started = true;
            continue;
        }
        if (started && section === "SECTION") {
            this.is_header(parts) && (started = false);
            continue;
        }
        if (count < CSV_BLOCKS[section]) {
            App.fail("CSV missing columns. Total: " + CSV_BLOCKS[section] + " Found: " + count + "\nLine: " + line + "\nFile: " + file);
            return {};
        }
        if (section === "LANGUAGE") {
            data.langName = parts[0];
            data.fontFace = parts[1];
            data.fontSize = parseInt(parts[2]);
            section = "";
        } else {
            if (section === "CREDIT 1") {
                data.langInfo = parts.slice(0, Math.min(3, count));
                section = "";
            } else {
                if (section === "LABELS") {
                    data.sysLabel[parts[0]] = parts[2].trim() ? parts[2] : parts[1];
                } else {
                    if (section === "MENUS") {
                        data.sysMenus[parts[0]] = parts[1].trim() ? parts[1] : parts[0];
                    } else {
                        if (section === "ITEMS" || section === "SPEAKERS") {
                            let name = parts[0];
                            let english = parts[1];
                            let translation = parts[2];
                            if (!name.trim() || !english.trim()) {
                                App.fail("Missing column data for Item.\nLine: " + line + "\nFile: " + file);
                                return {};
                            }
                            translation = translation.trim() ? translation : english;
                            data.labelLUT[name] = translation;
                        } else {
                            if (section === "SECTION" || section === "DESCRIPTIONS") {
                                let id = parts[0];
                                let english = parts[1];
                                let translation = parts[2];
                                let description = parts[3];
                                if (!id.trim() || !english.trim()) {
                                    App.fail("Missing column data for Section.\nLine: " + line + "\nFile: " + file);
                                    return {};
                                }
                                description = description.trim() ? description : translation;
                                english.toUpperCase().includes("CHOICE") ? data.labelLUT[id] = description : (label != id && (choices = [], data.linesLUT[id] = choices, label = id), choices.push(description));
                            } else {
                                App.fail("Invalid CSV parsing state.");
                                return {};
                            }
                        }
                    }
                }
            }
        }
    }
    return data;
};
const _DM_OL = DataManager.onLoad;
DataManager.onLoad = function(object) {
    if (object === $dataSystem) {
        Lang.search();
        Lang.select(ConfigManager.language);
    }
    _DM_OL.call(this, object);
};
const MAX_LINES = 2;
Game_Interpreter.prototype.prevHeader = "";
Game_Interpreter.prototype.extraLines = [];
Game_Interpreter.prototype.command101 = function() {
    if (!$gameMessage.isBusy()) {
        if (this.extraLines.length > 0) {
            $gameMessage.add(this.prevHeader);
            var linesLeft = Math.min(this.extraLines.length, MAX_LINES);
            for (var i = 0; i < linesLeft; i++) {
                $gameMessage.add(this.extraLines.shift());
            }
            this.extraLines.length < 1 && this._index++;
            this.setWaitMode("message");
            return false;
        }
        $gameMessage.setFaceImage(this._params[0], this._params[1]);
        $gameMessage.setBackground(this._params[2]);
        $gameMessage.setPositionType(this._params[3]);
        while (this.nextEventCode() === 401) {
            this._index++;
            var labelId = this.currentCommand().parameters[0];
            var labelLines = Lang.lines(Lang.label(labelId, true));
            $gameMessage.add(labelLines.text);
            this.prevHeader = labelLines.text;
            if (labelLines.lines.length) {
                for (var i = 0; i < labelLines.lines.length; i++) {
                    i < MAX_LINES ? $gameMessage.add(labelLines.lines[i]) : this.extraLines.push(labelLines.lines[i]);
                }
            }
            if (this.extraLines.length > 0) {
                while (this._index >= 0 && this.currentCommand().code !== 101) {
                    this._index--;
                }
                this.setWaitMode("message");
                return;
            }
        }
        switch (this.nextEventCode()) {
            case 102:
                this._index++;
                this.setupChoices(this.currentCommand().parameters);
                break;
            case 103:
                this._index++;
                this.setupNumInput(this.currentCommand().parameters);
                break;
            case 104:
                this._index++;
                this.setupItemChoice(this.currentCommand().parameters);
                break;
        }
        this._index++;
        this.setWaitMode("message");
    }
    return false;
};
Game_Interpreter.prototype.setupChoices = function(choices) {
    var labels = choices[0].clone();
    for (let i = 0; i < labels.length; i++) {
        labels[i] = Lang.label(labels[i]);
    }
    var defaultChoice = choices[1];
    var choiceCancelType = choices.length > 2 ? choices[2] : 0;
    var choicePositionType = choices.length > 3 ? choices[3] : 2;
    var choiceBackground = choices.length > 4 ? choices[4] : 0;
    defaultChoice >= labels.length && (defaultChoice = -2);
    $gameMessage.setChoices(labels, choiceCancelType, defaultChoice);
    $gameMessage.setChoiceBackground(choiceBackground);
    $gameMessage.setChoicePositionType(choicePositionType);
    $gameMessage.setChoiceCallback(function(choice) {
        this._branch[this._indent] = choice;
    }.bind(this));
};
Window_Base.prototype.drawItemName = function(item, x, y, width) {
    width = width || 312;
    if (item) {
        var iconPadding = Window_Base._iconWidth + 4;
        this.resetTextColor();
        this.drawIcon(item.iconIndex, x + 2, y + 2);
        this.drawText(Lang.label(item.name), x + iconPadding, y, width - iconPadding);
    }
};
Window_Help.prototype.setItem = function(item) {
    if (!item) {
        this.setText("");
        return;
    }
    var descriptionLines = Lang.lines(item.description);
    descriptionLines.lines.length > 0 ? this.setText(descriptionLines.lines.join("\n")) : this.setText(item.description);
};
AudioManager.createBuffer = function(fileName, filePath) {
    var fileExt = this.audioFileExt();
    var fullPath = this._path + fileName + "/" + encodeURIComponent(filePath) + fileExt;
    return new WebAudio(Crypto.resolveURL(fullPath));
};
WebAudio.prototype._loading = async function(stream) {
    try {
        const decoder = stbvorbis.decodeStream(data => this._onDecode(data));
        let firstBlock = true;
        while (true) {
            const {
                done,
                value
            } = await stream.read();
            if (done) {
                decoder({
                    eof: true
                });
                return;
            }
            let data = value;
            if (firstBlock) {
                firstBlock = false;
                data = Crypto.dekit(data, this._url, Crypto.guard());
            }
            this._readLoopComments(data);
            decoder({
                data,
                eof: false
            });
        }
    } catch (error) {
        App.fail("Audio stream failure: ", error);
    }
};
WebAudio.prototype._onXhrLoad = function(response) {
    var buffer = Crypto.dekit(response, this._url, Crypto.guard());
    this._readLoopComments(new Uint8Array(buffer));
    WebAudio._context.decodeAudioData(buffer, function(decodedBuffer) {
        this._buffer = decodedBuffer;
        this._totalTime = decodedBuffer.duration;
        if (this._loopLength > 0 && this._sampleRate > 0) {
            this._loopStart /= this._sampleRate;
            this._loopLength /= this._sampleRate;
        } else {
            this._loopStart = 0;
            this._loopLength = this._totalTime;
        }
        this._onLoad();
    }.bind(this));
};
WebAudio.prototype._readMetaData = function(buffer, start, length) {
    for (var index = start; index < start + length - 10; index++) {
        if (this._readFourCharacters(buffer, index) === "LOOP") {
            var loopString = "";
            while (buffer[index] > 0) {
                loopString += String.fromCharCode(buffer[index++]);
            }
            let matchStart = loopString.match(/LOOPSTART=([0-9]+)/);
            matchStart && matchStart.length > 1 && (this._loopStart = parseInt(matchStart[1]));
            matchStart = loopString.match(/LOOPLENGTH=([0-9]+)/);
            matchStart && matchStart.length > 1 && (this._loopLength = parseInt(matchStart[1]));
            if (loopString == "LOOPSTART" || loopString == "LOOPLENGTH") {
                var valueString = "";
                index += 16;
                while (buffer[index] > 0) {
                    valueString += String.fromCharCode(buffer[index++]);
                }
                loopString == "LOOPSTART" ? this._loopStart = parseInt(valueString) : this._loopLength = parseInt(valueString);
            }
        }
    }
};