/*
MIT License (MIT)

Copyright (c) 2016 Oren Ferrari
Adapted from work by K Ercan Turkarslan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
///<reference path="../typings/main.d.ts"/>
///<reference path="../node_modules/typescript-dotnet/source/System/Uri/IUri.d.ts"/>
///<reference path="../node_modules/typescript-dotnet/source/System/Uri/IUriComponentFormattable.d.ts"/>
var Uri_1 = require('../node_modules/typescript-dotnet/source/System/Uri/Uri');
var QueryBuilder_1 = require('../node_modules/typescript-dotnet/source/System/Uri/QueryBuilder');
var WebRequest = require('web-request');
var shallowCopy_1 = require('../node_modules/typescript-dotnet/source/System/Utility/shallowCopy');
var ArgumentException_1 = require('../node_modules/typescript-dotnet/source/System/Exceptions/ArgumentException');
var ArgumentNullException_1 = require('../node_modules/typescript-dotnet/source/System/Exceptions/ArgumentNullException');
var Integer_1 = require('../node_modules/typescript-dotnet/source/System/Integer');
var ServiceID = require('./ServiceIDs');
// Http Luup Request methods
// http://wiki.micasaverde.com/index.php/Luup_Requests
var Luup;
(function (Luup) {
    var Query;
    (function (Query) {
        var ParamNames;
        (function (ParamNames) {
            ParamNames.ACTION = "action"; // String
            ParamNames.DEVICE = "device"; // Integer
            ParamNames.DEVICE_NUM = "DeviceNum"; // Integer
            ParamNames.ID = "id"; // String
            ParamNames.NAME = "name"; // String
            ParamNames.OUTPUT_FORMAT = "output_format"; // String
            ParamNames.ROOM = "room"; // Integer
            ParamNames.SCENE_ID = "scene"; // Integer
            ParamNames.SERVICE_ID = "serviceId"; // Integer
            ParamNames.UDN = "UDN"; // String
            ParamNames.VALUE = "Value"; // String
            ParamNames.VARIABLE_NAME = "Variable"; // String
            ParamNames.CODE = "Code"; // String
            ParamNames.LOAD_TIME = "LoadTime";
            ParamNames.DATA_VERSION = "DataVersion";
            ParamNames.TIMEOUT = "timeout";
            ParamNames.MINIMUM_DELAY = "minimumdelay";
        })(ParamNames = Query.ParamNames || (Query.ParamNames = {}));
        Object.freeze(ParamNames);
        function translateParamName(from) {
            var fromLC = from.toLowerCase();
            for (var key of Object.keys(ParamNames)) {
                if (key.toLowerCase() == fromLC)
                    return key;
            }
            return from;
        }
        Query.translateParamName = translateParamName;
        function translateParamNames(from) {
            var result = {};
            for (var key of Object.keys(from)) {
                result[translateParamName(key)] = from[key];
            }
            return result;
        }
        Query.translateParamNames = translateParamNames;
        var IDs;
        (function (IDs) {
            IDs.USER_DATA = "user_data";
            IDs.USER_DATA2 = "user_data2";
            IDs.STATUS = "status";
            IDs.S_DATA = "sdata";
            IDs.ACTIONS = "actions";
            IDs.ACTION = "action";
            IDs.DEVICE = "device";
            IDs.SCENE = "scene";
            IDs.ROOM = "room";
            IDs.FILE = "file";
        })(IDs = Query.IDs || (Query.IDs = {}));
        var Actions;
        (function (Actions) {
            Actions.CREATE = "create";
            Actions.RENAME = "rename";
            Actions.DELETE = "delete";
            Actions.LIST = "list";
            Actions.RECORD = "record";
            Actions.PAUSE = "pause";
            Actions.STOP_RECORD = "stoprecord";
            Actions.LIST_RECORD = "listrecord";
            Actions.DELETE_RECORD = "deleterecord";
            Actions.SAVE_RECORD = "saverecord";
            Actions.RUN_LUA = "RunLua";
        })(Actions = Query.Actions || (Query.Actions = {}));
        Object.freeze(IDs);
        var OutputFormats;
        (function (OutputFormats) {
            OutputFormats.XML = "xml";
        })(OutputFormats = Query.OutputFormats || (Query.OutputFormats = {}));
        Object.freeze(OutputFormats);
    })(Query = Luup.Query || (Luup.Query = {}));
    Object.freeze(Query);
})(Luup || (Luup = {}));
class BasicMiosEngine {
    constructor(baseUri) {
        this.baseUri = baseUri;
        var _ = this;
        _._baseUri = Uri_1.default.from(baseUri);
        _._defaultParams
            = QueryBuilder_1.default.init(Luup.Query.translateParamNames(_._baseUri.queryParams));
        _._baseUri.query = '';
        _._baseUri.queryParams = {};
    }
    request(params) {
        // http://ip_address:3480/data_request?id=user_data2&output_format=xml
        var _ = this;
        var newUri = _._baseUri.updateQuery(QueryBuilder_1.default
            .init(_._defaultParams)
            .importQuery(Luup.Query.translateParamNames(params))
            .toMap());
        return WebRequest.get(newUri.toString())
            .then(response => response.content);
    }
    requestById(id, params) {
        if (!id)
            throw new ArgumentNullException_1.default(Luup.Query.ParamNames.ID);
        var p = params ? shallowCopy_1.default(params) : {};
        p.id = id;
        return this.request(p);
    }
    requestByIdAndAction(id, action, params) {
        if (!id)
            throw new ArgumentNullException_1.default(Luup.Query.ParamNames.ID);
        if (!action)
            throw new ArgumentNullException_1.default(Luup.Query.ParamNames.ACTION);
        var p = params ? shallowCopy_1.default(params) : {};
        p.id = id;
        p.action = action;
        return this.request(p);
    }
    userData(params) {
        return this.requestById(Luup.Query.IDs.USER_DATA, params);
    }
    userData2(params) {
        return this.requestById(Luup.Query.IDs.USER_DATA2, params);
    }
    status(params) {
        return this.requestById(Luup.Query.IDs.STATUS, params);
    }
    sData(params) {
        // http://ip_address:3480/data_request?id=sdata
        // http://ip_address:3480/data_request?id=sdata&output_format=xml
        return this.requestById(Luup.Query.IDs.S_DATA, params);
    }
    statusWithUdn(udn, params) {
        params = params ? shallowCopy_1.default(params) : {};
        params[Luup.Query.ParamNames.UDN] = udn;
        return this.requestById(Luup.Query.IDs.STATUS, params);
    }
    deviceStatus(deviceNum, params) {
        Integer_1.default.assert(deviceNum);
        params = params ? shallowCopy_1.default(params) : {};
        params[Luup.Query.ParamNames.DEVICE_NUM] = deviceNum;
        return this.requestById(Luup.Query.IDs.STATUS, params);
    }
    deviceActions(deviceNum, params) {
        Integer_1.default.assert(deviceNum);
        params = params ? shallowCopy_1.default(params) : {};
        params[Luup.Query.ParamNames.DEVICE_NUM] = deviceNum;
        return this.requestById(Luup.Query.IDs.ACTIONS, params);
    }
    deviceAction(action, deviceNum, params) {
        // http://ip_address:3480/data_request?id=device&action=delete&device=5
        Integer_1.default.assert(deviceNum);
        var params = params ? shallowCopy_1.default(params) : {};
        params[Luup.Query.ParamNames.DEVICE] = deviceNum;
        return this.requestByIdAndAction(Luup.Query.IDs.DEVICE, action, params);
    }
    deviceRename(deviceNum, newName, newRoom) {
        Integer_1.default.assert(deviceNum);
        const NEW_NAME = 'newName';
        if (!newName)
            throw new ArgumentException_1.default(NEW_NAME, 'cannot be null or empty');
        if (/\s+/.test(newName))
            throw new ArgumentException_1.default(NEW_NAME, 'cannot be pure whitespace');
        var params = {};
        params[Luup.Query.ParamNames.NAME] = newName;
        if (newRoom)
            params[Luup.Query.ParamNames.ROOM] = newRoom;
        return this.deviceAction(Luup.Query.Actions.RENAME, deviceNum, params);
    }
    deviceDelete(deviceNum) {
        // http://ip_address:3480/data_request?id=device&action=delete&device=5
        Integer_1.default.assert(deviceNum);
        return this.deviceAction(Luup.Query.Actions.DELETE, deviceNum);
    }
    sceneAction(action, params) {
        // http://ip_address:3480/data_request?id=device&action=delete&device=5
        return this.requestByIdAndAction(Luup.Query.IDs.SCENE, action, params);
    }
    sceneRecord() {
        // http://ip_address:3480/data_request?id=scene&action=record
        return this.sceneAction(Luup.Query.Actions.RECORD);
    }
    scenePauseRecord(seconds) {
        // http://ip_address:3480/data_request?id=scene&action=pause&seconds=y
        return this.sceneAction(Luup.Query.Actions.PAUSE, { seconds: seconds });
    }
    sceneStopRecord() {
        // http://ip_address:3480/data_request?id=scene&action=stoprecord
        return this.sceneAction(Luup.Query.Actions.STOP_RECORD);
    }
    sceneListRecord() {
        // http://ip_address:3480/data_request?id=scene&action=listrecord
        return this.sceneAction(Luup.Query.Actions.LIST_RECORD);
    }
    sceneDeleteRecord(recording) {
        // http://ip_address:3480/data_request?id=scene&action=deleterecord&number=x
        Integer_1.default.assert(recording);
        return this.sceneAction(Luup.Query.Actions.DELETE_RECORD, { number: recording });
    }
    sceneSaveRecord(name, room) {
        // http://ip_address:3480/data_request?id=scene&action=deleterecord
        var params = {};
        params[Luup.Query.ParamNames.NAME] = name;
        if (room)
            params[Luup.Query.ParamNames.ROOM] = room;
        return this.sceneAction(Luup.Query.Actions.SAVE_RECORD, params);
    }
    sceneRename(sceneId, name, room) {
        // http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandelier&room=Garage
        Integer_1.default.assert(sceneId);
        var params = {};
        params[Luup.Query.ParamNames.SCENE_ID] = sceneId;
        params[Luup.Query.ParamNames.NAME] = name;
        if (room)
            params[Luup.Query.ParamNames.ROOM] = room;
        return this.sceneAction(Luup.Query.Actions.RENAME, params);
    }
    sceneDelete(sceneId) {
        // http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandelier&room=Garage
        Integer_1.default.assert(sceneId);
        var params = {};
        params[Luup.Query.ParamNames.SCENE_ID] = sceneId;
        return this.sceneAction(Luup.Query.Actions.DELETE, params);
    }
    sceneCreate(json) {
        // http://ip_address:3480/data_request?id=scene&action=create&json=
        return this.sceneAction(Luup.Query.Actions.CREATE, { json: json });
    }
    sceneList(sceneId) {
        // http://ip_address:3480/data_request?id=scene&action=list&scene=5
        var params = {};
        params[Luup.Query.ParamNames.SCENE_ID] = sceneId;
        return this.sceneAction(Luup.Query.Actions.LIST, params);
    }
    roomAction(action, params) {
        // http://ip_address:3480/data_request?id=device&action=delete&device=5
        var params = params ? shallowCopy_1.default(params) : {};
        return this.requestByIdAndAction(Luup.Query.IDs.ROOM, action, params);
    }
    roomCreate(name) {
        // http://ip_address:3480/data_request?id=room&action=create&name=Kitchen
        var params = {};
        params[Luup.Query.ParamNames.NAME] = name;
        return this.sceneAction(Luup.Query.Actions.CREATE, params);
    }
    roomRename(room, name) {
        // http://ip_address:3480/data_request?id=room&action=rename&room=5&name=Garage
        var params = {};
        params[Luup.Query.ParamNames.ROOM] = room;
        params[Luup.Query.ParamNames.NAME] = name;
        return this.sceneAction(Luup.Query.Actions.RENAME, params);
    }
    roomDelete(room) {
        // http://ip_address:3480/data_request?id=room&action=delete&room=5
        var params = {};
        params[Luup.Query.ParamNames.ROOM] = room;
        return this.sceneAction(Luup.Query.Actions.DELETE, params);
    }
    file(filename) {
        // http://ip_address:3480/data_request?id=file&parameters=D_BinaryLight1.xml
        return this.requestById(Luup.Query.IDs.FILE, { parameters: filename });
    }
    runLua(code) {
        // http://ip_address:3480/data_request?id=file&parameters=D_BinaryLight1.xml
        var params = {};
        params[Luup.Query.ParamNames.SERVICE_ID] = ServiceID.HOME_AUTOMATION_GATEWAY;
        params[Luup.Query.ParamNames.CODE] = code;
        return this.requestByIdAndAction(Luup.Query.IDs.ACTION, Luup.Query.Actions.RUN_LUA, params);
    }
}
exports.BasicMiosEngine = BasicMiosEngine;
//# sourceMappingURL=BasicMiosEngine.js.map