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
var Luup = require('./Luup');
// Http Luup Request methods
// http://wiki.micasaverde.com/index.php/Luup_Requests
//function queryFromTuples(params:[string,Primitive][]):QueryBuilder
//{
//	var query = new QueryBuilder({});
//	for(var t of params)
//	{
//		query.addByKeyValue(t[0], t[1]);
//	}
//	return query;
//}
class DeviceServiceModule {
    constructor(_connector, deviceNumber, serviceId) {
        this._connector = _connector;
        this.deviceNumber = deviceNumber;
        this.serviceId = serviceId;
        Object.freeze(this);
    }
    action(action, params) {
        // http://ip_address:3480/data_request?id=action&output_format=xml&DeviceNum=6&serviceId=urn:upnp-org:serviceId:SwitchPower1&action=SetTarget&newTargetValue=1	params = this.initParams(params);
        params[Luup.Query.ParamNames.SERVICE_ID] = this.serviceId;
        params[Luup.Query.ParamNames.OUTPUT_FORMAT] = Luup.Query.OutputFormats.XML;
        return this._connector.requestByIdAndAction(Luup.Query.IDs.ACTION, action, params);
    }
    initParams() {
        var params = {};
        params[Luup.Query.ParamNames.SERVICE_ID] = this.serviceId;
        params[Luup.Query.ParamNames.DEVICE_NUM] = this.deviceNumber;
        return params;
    }
    setVariable(name, value) {
        // http://ip_address:3480/data_request?id=variableset&DeviceNum=6&serviceId=urn:micasaverde-com:serviceId:DoorLock1&Variable=Status&Value=1
        var params = this.initParams();
        params[Luup.Query.ParamNames.VARIABLE_NAME] = name;
        params[Luup.Query.ParamNames.VALUE] = value;
        return this._connector.requestById(Luup.Query.IDs.VARIABLE_SET, params);
    }
    getVariable(name) {
        // http://ip_address:3480/data_request?id=variableget&DeviceNum=6&serviceId=urn:micasaverde-com:serviceId:DoorLock1&Variable=Status
        var params = this.initParams();
        params[Luup.Query.ParamNames.VARIABLE_NAME] = name;
        return this._connector.requestById(Luup.Query.IDs.VARIABLE_GET, params);
    }
}
class DeviceModule {
    constructor(_connector, deviceNumber) {
        this._connector = _connector;
        this.deviceNumber = deviceNumber;
        Object.freeze(this);
    }
    service(id) {
        return new DeviceServiceModule(this._connector, this.deviceNumber, id);
    }
    initParams(params) {
        params = params ? shallowCopy_1.default(params) : {};
        params[Luup.Query.ParamNames.DEVICE_NUM] = this.deviceNumber;
        return params;
    }
    status(params) {
        return this._connector.requestById(Luup.Query.IDs.STATUS, this.initParams(params));
    }
    actions(params) {
        return this._connector.requestById(Luup.Query.IDs.ACTIONS, this.initParams(params));
    }
    action(action, params) {
        // http://ip_address:3480/data_request?id=device&action=delete&device=5
        return this._connector.requestByIdAndAction(Luup.Query.IDs.DEVICE, action, this.initParams(params));
    }
    rename(newName, newRoom) {
        const NEW_NAME = 'newName';
        if (!newName)
            throw new ArgumentException_1.default(NEW_NAME, 'cannot be null or empty');
        if (/\s+/.test(newName))
            throw new ArgumentException_1.default(NEW_NAME, 'cannot be pure whitespace');
        var params = {};
        params[Luup.Query.ParamNames.NAME] = newName;
        if (newRoom)
            params[Luup.Query.ParamNames.ROOM] = newRoom;
        return this.action(Luup.Query.Actions.RENAME, params);
    }
    'delete'() {
        // http://ip_address:3480/data_request?id=device&action=delete&device=5
        return this.action(Luup.Query.Actions.DELETE);
    }
}
class SceneRecordModule {
    constructor(_sceneModule) {
        this._sceneModule = _sceneModule;
    }
    start() {
        // http://ip_address:3480/data_request?id=scene&action=record
        return this._sceneModule.action(Luup.Query.Actions.RECORD);
    }
    pause(seconds) {
        // http://ip_address:3480/data_request?id=scene&action=pause&seconds=y
        return this._sceneModule.action(Luup.Query.Actions.PAUSE, { seconds: seconds });
    }
    stop() {
        // http://ip_address:3480/data_request?id=scene&action=stoprecord
        return this._sceneModule.action(Luup.Query.Actions.STOP_RECORD);
    }
    list() {
        // http://ip_address:3480/data_request?id=scene&action=listrecord
        return this._sceneModule.action(Luup.Query.Actions.LIST_RECORD);
    }
    'delete'(recording) {
        // http://ip_address:3480/data_request?id=scene&action=deleterecord&number=x
        Integer_1.default.assert(recording);
        return this._sceneModule.action(Luup.Query.Actions.DELETE_RECORD, { number: recording });
    }
    save(name, room) {
        // http://ip_address:3480/data_request?id=scene&action=deleterecord
        var params = {};
        params[Luup.Query.ParamNames.NAME] = name;
        if (room)
            params[Luup.Query.ParamNames.ROOM] = room;
        return this._sceneModule.action(Luup.Query.Actions.SAVE_RECORD, params);
    }
}
class SceneModule {
    constructor(_connector) {
        this._connector = _connector;
    }
    get record() {
        var _ = this, r = _._record;
        if (!r)
            _._record = r = new SceneRecordModule(this);
        return r;
    }
    action(action, params) {
        return this._connector.requestByIdAndAction(Luup.Query.IDs.SCENE, action, params);
    }
    rename(sceneId, name, room) {
        // http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandelier&room=Garage
        Integer_1.default.assert(sceneId);
        var params = {};
        params[Luup.Query.ParamNames.SCENE_ID] = sceneId;
        params[Luup.Query.ParamNames.NAME] = name;
        if (room)
            params[Luup.Query.ParamNames.ROOM] = room;
        return this.action(Luup.Query.Actions.RENAME, params);
    }
    'delete'(sceneId) {
        // http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandelier&room=Garage
        Integer_1.default.assert(sceneId);
        var params = {};
        params[Luup.Query.ParamNames.SCENE_ID] = sceneId;
        return this.action(Luup.Query.Actions.DELETE, params);
    }
    create(json) {
        // http://ip_address:3480/data_request?id=scene&action=create&json=
        return this.action(Luup.Query.Actions.CREATE, { json: json });
    }
    list(sceneId) {
        Integer_1.default.assert(sceneId);
        // http://ip_address:3480/data_request?id=scene&action=list&scene=5
        var params = {};
        params[Luup.Query.ParamNames.SCENE_ID] = sceneId;
        return this.action(Luup.Query.Actions.LIST, params);
    }
    run(sceneNum) {
        Integer_1.default.assert(sceneNum);
        // http://ip_address:3480/data_request?id=action&serviceId=urn:micasaverde-com:serviceId:HomeAutomationGateway1&action=RunScene&SceneNum=
        var params = {};
        params[Luup.Query.ParamNames.SCENE_NUM] = sceneNum;
        params[Luup.Query.ParamNames.SERVICE_ID] = ServiceID.HOME_AUTOMATION_GATEWAY;
        return this._connector.requestByIdAndAction(Luup.Query.IDs.ACTION, Luup.Query.Actions.RUN_SCENE, params);
    }
}
class RoomModule {
    constructor(_connector) {
        this._connector = _connector;
    }
    action(action, params) {
        // http://ip_address:3480/data_request?id=device&action=delete&device=5
        params = params ? shallowCopy_1.default(params) : {};
        return this._connector.requestByIdAndAction(Luup.Query.IDs.ROOM, action, params);
    }
    create(name) {
        // http://ip_address:3480/data_request?id=room&action=create&name=Kitchen
        var params = {};
        params[Luup.Query.ParamNames.NAME] = name;
        return this.action(Luup.Query.Actions.CREATE, params);
    }
    rename(room, name) {
        // http://ip_address:3480/data_request?id=room&action=rename&room=5&name=Garage
        var params = {};
        params[Luup.Query.ParamNames.ROOM] = room;
        params[Luup.Query.ParamNames.NAME] = name;
        return this.action(Luup.Query.Actions.RENAME, params);
    }
    'delete'(room) {
        // http://ip_address:3480/data_request?id=room&action=delete&room=5
        var params = {};
        params[Luup.Query.ParamNames.ROOM] = room;
        return this.action(Luup.Query.Actions.DELETE, params);
    }
}
class Connector {
    constructor(baseUri) {
        this.baseUri = baseUri;
        var _ = this;
        _._baseUri = Uri_1.default.from(baseUri);
        _._defaultParams
            = QueryBuilder_1.default.init(Luup.Query.translateParamNames(_._baseUri.queryParams));
        _._baseUri.query = '';
        _._baseUri.queryParams = {};
    }
    device(deviceNumber) {
        Integer_1.default.assert(deviceNumber);
        return new DeviceModule(this, deviceNumber);
    }
    get scene() {
        var _ = this, s = _._scene;
        if (!s)
            _._scene = s = new SceneModule(_);
        return s;
    }
    get room() {
        var _ = this, r = _._room;
        if (!r)
            _._room = r = new RoomModule(_);
        return r;
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
exports.Connector = Connector;
//# sourceMappingURL=Connector.js.map