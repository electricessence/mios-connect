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

import Uri from '../node_modules/typescript-dotnet/source/System/Uri/Uri'
import QueryBuilder from '../node_modules/typescript-dotnet/source/System/Uri/QueryBuilder'
import * as WebRequest from 'web-request';
import copy from '../node_modules/typescript-dotnet/source/System/Utility/shallowCopy'
import ArgumentException from '../node_modules/typescript-dotnet/source/System/Exceptions/ArgumentException'
import ArgumentNullException from '../node_modules/typescript-dotnet/source/System/Exceptions/ArgumentNullException'
import Integer from '../node_modules/typescript-dotnet/source/System/Integer'
import * as ServiceID from './ServiceIDs';
import * as Luup from './Luup';

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


class DeviceServiceModule
{

	constructor(private _connector:Connector, public deviceNumber:number, public serviceId:string)
	{
		Object.freeze(this);
	}


	action(action:string, params?:IUriComponentMap):Promise<string>
	{
		// http://ip_address:3480/data_request?id=action&output_format=xml&DeviceNum=6&serviceId=urn:upnp-org:serviceId:SwitchPower1&action=SetTarget&newTargetValue=1	params = this.initParams(params);
		params[Luup.Query.ParamNames.SERVICE_ID] = this.serviceId;
		params[Luup.Query.ParamNames.OUTPUT_FORMAT] = Luup.Query.OutputFormats.XML;

		return this._connector.requestByIdAndAction(
			Luup.Query.IDs.ACTION,
			action,
			params);
	}


	private initParams():IUriComponentMap
	{
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SERVICE_ID] = this.serviceId;
		params[Luup.Query.ParamNames.DEVICE_NUM] = this.deviceNumber;
		return params;
	}

	setVariable(name:string, value:Primitive):Promise<string>
	{
		// http://ip_address:3480/data_request?id=variableset&DeviceNum=6&serviceId=urn:micasaverde-com:serviceId:DoorLock1&Variable=Status&Value=1
		var params:IUriComponentMap = this.initParams();
		params[Luup.Query.ParamNames.VARIABLE_NAME] = name;
		params[Luup.Query.ParamNames.VALUE] = value;

		return this._connector.requestById(
			Luup.Query.IDs.VARIABLE_SET,
			params);
	}

	getVariable(name:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=variableget&DeviceNum=6&serviceId=urn:micasaverde-com:serviceId:DoorLock1&Variable=Status
		var params:IUriComponentMap = this.initParams();
		params[Luup.Query.ParamNames.VARIABLE_NAME] = name;

		return this._connector.requestById(
			Luup.Query.IDs.VARIABLE_GET,
			params);

	}

}


export interface IDeviceServiceModule extends DeviceServiceModule
{}


class DeviceModule
{

	constructor(private _connector:Connector, public deviceNumber:number)
	{
		Object.freeze(this);
	}

	service(id:string):IDeviceServiceModule
	{
		return new DeviceServiceModule(this._connector, this.deviceNumber, id);
	}

	private initParams(params?:IUriComponentMap):IUriComponentMap
	{
		params = params ? copy(params) : {};
		params[Luup.Query.ParamNames.DEVICE_NUM] = this.deviceNumber;
		return params;
	}

	status(params?:Luup.IRequestParams):Promise<string>
	{
		return this._connector.requestById(
			Luup.Query.IDs.STATUS,
			this.initParams(params));
	}

	actions(params?:Luup.IRequestBase):Promise<string>
	{
		return this._connector.requestById(
			Luup.Query.IDs.ACTIONS,
			this.initParams(params));
	}

	action(action:string, params?:IUriComponentMap):Promise<string>
	{
		// http://ip_address:3480/data_request?id=device&action=delete&device=5
		return this._connector.requestByIdAndAction(
			Luup.Query.IDs.DEVICE,
			action,
			this.initParams(params));
	}

	rename(
		newName:string,
		newRoom?:string|number):Promise<string>
	{
		const NEW_NAME = 'newName';
		if(!newName) throw new ArgumentException(NEW_NAME, 'cannot be null or empty');
		if(/\s+/.test(newName)) throw new ArgumentException(NEW_NAME, 'cannot be pure whitespace');

		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.NAME] = newName;
		if(newRoom) params[Luup.Query.ParamNames.ROOM] = newRoom;

		return this.action(Luup.Query.Actions.RENAME, params);
	}

	'delete'():Promise<string>
	{
		// http://ip_address:3480/data_request?id=device&action=delete&device=5
		return this.action(Luup.Query.Actions.DELETE);
	}

}

export interface IDeviceModule extends DeviceModule
{}

class SceneRecordModule
{

	constructor(private _sceneModule:SceneModule)
	{

	}


	start():Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=record
		return this._sceneModule.action(Luup.Query.Actions.RECORD);
	}


	pause(seconds:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=pause&seconds=y
		return this._sceneModule.action(Luup.Query.Actions.PAUSE, {seconds: seconds});
	}

	stop():Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=stoprecord
		return this._sceneModule.action(Luup.Query.Actions.STOP_RECORD);
	}

	list():Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=listrecord
		return this._sceneModule.action(Luup.Query.Actions.LIST_RECORD);
	}

	'delete'(recording:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=deleterecord&number=x
		Integer.assert(recording);

		return this._sceneModule.action(Luup.Query.Actions.DELETE_RECORD, {number: recording});
	}

	save(name:string, room?:string|number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=deleterecord

		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.NAME] = name;
		if(room) params[Luup.Query.ParamNames.ROOM] = room;

		return this._sceneModule.action(Luup.Query.Actions.SAVE_RECORD, params);
	}


}

export interface ISceneRecordModule extends SceneRecordModule
{}

class SceneModule
{

	constructor(private _connector:Connector)
	{
	}

	private _record:SceneRecordModule;
	get record():ISceneRecordModule
	{
		var _ = this, r = _._record;
		if(!r) _._record = r = new SceneRecordModule(this);
		return r;
	}


	action(action:string, params?:IUriComponentMap):Promise<string>
	{
		return this._connector.requestByIdAndAction(Luup.Query.IDs.SCENE, action, params);
	}

	rename(sceneId:number, name:string, room?:string|number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandelier&room=Garage
		Integer.assert(sceneId);

		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SCENE_ID] = sceneId;
		params[Luup.Query.ParamNames.NAME] = name;
		if(room) params[Luup.Query.ParamNames.ROOM] = room;

		return this.action(Luup.Query.Actions.RENAME, params);
	}

	'delete'(sceneId:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandelier&room=Garage
		Integer.assert(sceneId);

		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SCENE_ID] = sceneId;

		return this.action(Luup.Query.Actions.DELETE, params);
	}

	create(json:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=create&json=

		return this.action(Luup.Query.Actions.CREATE, {json: json});
	}

	list(sceneId:number):Promise<string>
	{
		Integer.assert(sceneId);

		// http://ip_address:3480/data_request?id=scene&action=list&scene=5
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SCENE_ID] = sceneId;

		return this.action(Luup.Query.Actions.LIST, params);
	}

	run(sceneNum:number):Promise<string>
	{
		Integer.assert(sceneNum);

		// http://ip_address:3480/data_request?id=action&serviceId=urn:micasaverde-com:serviceId:HomeAutomationGateway1&action=RunScene&SceneNum=
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SCENE_NUM] = sceneNum;
		params[Luup.Query.ParamNames.SERVICE_ID] = ServiceID.HOME_AUTOMATION_GATEWAY;
		return this._connector.requestByIdAndAction(Luup.Query.IDs.ACTION, Luup.Query.Actions.RUN_SCENE, params);
	}

}

export interface ISceneModule extends SceneModule
{}


class RoomModule
{

	constructor(private _connector:Connector)
	{
	}


	action(action:string, params?:IUriComponentMap):Promise<string>
	{
		// http://ip_address:3480/data_request?id=device&action=delete&device=5

		params = params ? copy(params) : {};

		return this._connector.requestByIdAndAction(Luup.Query.IDs.ROOM, action, params);
	}

	create(name:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=room&action=create&name=Kitchen
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.NAME] = name;

		return this.action(Luup.Query.Actions.CREATE, params);
	}

	rename(room:number, name:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=room&action=rename&room=5&name=Garage
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.ROOM] = room;
		params[Luup.Query.ParamNames.NAME] = name;

		return this.action(Luup.Query.Actions.RENAME, params);
	}

	'delete'(room:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=room&action=delete&room=5
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.ROOM] = room;

		return this.action(Luup.Query.Actions.DELETE, params);
	}


}

export interface IRoomModule extends RoomModule
{}


export default class Connector
{
	protected _baseUri:Uri;
	protected _defaultParams:QueryBuilder;

	constructor(protected baseUri:string|IUri)
	{
		var _ = this;
		_._baseUri = Uri.from(baseUri);
		_._defaultParams
			= QueryBuilder.init(Luup.Query.translateParamNames(_._baseUri.queryParams));
		_._baseUri.query = '';
		_._baseUri.queryParams = {};
	}

	device(deviceNumber:number):IDeviceModule
	{
		Integer.assert(deviceNumber);

		return new DeviceModule(this, deviceNumber);
	}

	private _scene:SceneModule;
	get scene():ISceneModule
	{
		var _ = this, s = _._scene;
		if(!s) _._scene = s = new SceneModule(_);
		return s;
	}

	private _room:RoomModule;
	get room():IRoomModule
	{
		var _ = this, r = _._room;
		if(!r) _._room = r = new RoomModule(_);
		return r;
	}

	request(params:Luup.IRequestById):Promise<string>
	{
		// http://ip_address:3480/data_request?id=user_data2&output_format=xml
		var _ = this;

		var newUri = _._baseUri.updateQuery(
			QueryBuilder
				.init(_._defaultParams)
				.importQuery(Luup.Query.translateParamNames(params))
				.toMap()
		);

		return WebRequest.get(newUri.toString())
			.then(response=>response.content);
	}

	requestById(id:string, params?:IUriComponentMap):Promise<string>
	{
		if(!id) throw new ArgumentNullException(Luup.Query.ParamNames.ID);

		var p:Luup.IRequestById = params ? copy(params) : {};
		p.id = id;

		return this.request(p);
	}


	requestByIdAndAction(id:string, action:string, params?:IUriComponentMap):Promise<string>
	{
		if(!id) throw new ArgumentNullException(Luup.Query.ParamNames.ID);
		if(!action) throw new ArgumentNullException(Luup.Query.ParamNames.ACTION);

		var p:Luup.IRequestByIdAndAction = params ? copy(params) : {};
		p.id = id;
		p.action = action;
		return this.request(p);
	}

	userData(params?:Luup.IRequestParams):Promise<string>
	{
		return this.requestById(Luup.Query.IDs.USER_DATA, params);
	}

	userData2(params?:Luup.IRequestParams):Promise<string>
	{
		return this.requestById(Luup.Query.IDs.USER_DATA2, params);
	}

	status(params?:Luup.IRequestParams):Promise<string>
	{
		return this.requestById(Luup.Query.IDs.STATUS, params);
	}

	sData(params?:Luup.IRequestParams):Promise<string>
	{
		// http://ip_address:3480/data_request?id=sdata
		// http://ip_address:3480/data_request?id=sdata&output_format=xml

		return this.requestById(Luup.Query.IDs.S_DATA, params);
	}

	statusWithUdn(udn:string, params?:Luup.IRequestBase):Promise<string>
	{
		params = params ? copy(params) : {};
		params[Luup.Query.ParamNames.UDN] = udn;
		return this.requestById(Luup.Query.IDs.STATUS, params);
	}

	file(filename:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=file&parameters=D_BinaryLight1.xml

		return this.requestById(Luup.Query.IDs.FILE, {parameters: filename});
	}

	runLua(code:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=file&parameters=D_BinaryLight1.xml
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SERVICE_ID] = ServiceID.HOME_AUTOMATION_GATEWAY;
		params[Luup.Query.ParamNames.CODE] = code;

		return this.requestByIdAndAction(
			Luup.Query.IDs.ACTION,
			Luup.Query.Actions.RUN_LUA,
			params);
	}


	/*




	public string Luup_InstallPlugin(UInt32 pluginNum)
		{
			// http://ip_address:3480/data_request?id=action&serviceId=urn:micasaverde-com:serviceId:HomeAutomationGateway1&action=CreatePlugin&PluginNum=

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("action"),
				LuupServiceId("urn:micasaverde-com:serviceId:HomeAutomationGateway1"),
				LuupAction("CreatePlugin"),
				LuupParam("PluginNum", pluginNum.ToString(CultureInfo.InvariantCulture))));
		}


	public string Luup_Reload()
		{
			// http://ip_address:3480/data_request?id=reload

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("reload")));
		}

	public Boolean Luup_Alive()
		{
			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("alive"))) == "OK";
		}

	public string Luup_FindDeviceByAltId(UInt32 altid)
		{
			// http://ip_address:3480/data_request?id=finddevice&devid=6

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("finddevice"),
				LuupParam("devid", altid.ToString(CultureInfo.InvariantCulture))));
		}

	public string Luup_FindDevice(UInt32 deviceNum)
		{
			// http://ip_address:3480/data_request?id=finddevice&devnum=6

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("finddevice"),
				LuupParam("devnum", deviceNum.ToString(CultureInfo.InvariantCulture))));
		}

	public Boolean Luup_Resync()
		{
			return HttpConnection.HttpGetString(HttpPrefix, Combine(
					LuupId("resync"))) == "OK";
		}

	public string Luup_WGet(string url, UInt32 timeout, string username = null, string password = null)
		{
			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("wget"),
				LuupParam("url", url),
				(username != null) ? LuupParam("username", username) : null,
				(password != null) ? LuupParam("password", password) : null,
				LuupParam("timeout", timeout.ToString(CultureInfo.InvariantCulture))));
		}

	public string Luup_IPRequests()
		{
			// http://ip_address:3480/data_request?id=iprequests

			return HttpConnection.HttpGetString(HttpPrefix,
				LuupId("iprequests"));
		}

	public string Luup_IPRequests(Int32 timeout)
		{
			// http://ip_address:3480/data_request?id=iprequests&timeout=3600

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("iprequests"),
				LuupParam("timeout", timeout.ToString(CultureInfo.InvariantCulture))));
		}

	public string Luup_LiveEnergyUsage()
		{
			return HttpConnection.HttpGetString(HttpPrefix,
				LuupId("live_energy_usage"));
		}

	public string Luup_JobStatus(UInt32 job, string plugin = null)
		{
			// http://ip_address:3480/data_request?id=jobstatus&job=13
			// http://ip_address:3480/data_request?id=jobstatus&job=6&plugin=zwave

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("jobstatus"),
				LuupParam("job", job.ToString(CultureInfo.InvariantCulture)),
				LuupParam("plugin", plugin)));
		}

	public string Luup_Invoke()
		{
			// http://ip_address:3480/data_request?id=invoke

			return
			HttpConnection.HttpGetString(HttpPrefix,
				LuupId("invoke"));
		}

	public string Luup_Invoke(UInt32 deviceNum)
		{
			// http://ip_address:3480/data_request?id=invoke&DeviceNum=6

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("invoke"),
				LuupDeviceNum(deviceNum)));
		}

	public string Luup_Invoke(string udn)
		{
			// http://ip_address:3480/data_request?id=invoke&UDN=uuid:4d494342-5342-5645-0002-000000000002

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("invoke"),
				LuupUdn(udn)));
		}

	public string Luup_UpdatePlugin(UInt32 pluginId)
		{
			// http://ip_address:3480/data_request?id=update_plugin&Plugin=Plugin_ID

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("update_plugin"),
				LuupParam("Plugin", pluginId.ToString(CultureInfo.InvariantCulture))));
		}

			#endregion

			#region Constructor(s)
	public BasicMiosEngine(string httpPrefix)
		{
			HttpPrefix = httpPrefix;
		}
			#endregion
	}*/
}