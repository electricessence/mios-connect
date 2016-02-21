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

// Http Luup Request methods
// http://wiki.micasaverde.com/index.php/Luup_Requests

module Luup
{
	export module Query
	{
		export module ParamNames
		{
			export const ACTION:string = "action"; // String
			export const DEVICE:string = "device"; // Integer
			export const DEVICE_NUM:string = "DeviceNum"; // Integer
			export const ID:string = "id"; // String
			export const NAME:string = "name"; // String
			export const OUTPUT_FORMAT:string = "output_format"; // String
			export const ROOM:string = "room"; // Integer
			export const SCENE_ID:string = "scene"; // Integer
			export const SERVICE_ID:string = "serviceId"; // Integer
			export const UDN:string = "UDN"; // String
			export const VALUE:string = "Value"; // String
			export const VARIABLE_NAME:string = "Variable"; // String
			export const CODE:string = "Code"; // String

			export const LOAD_TIME:string = "LoadTime";
			export const DATA_VERSION:string = "DataVersion";
			export const TIMEOUT:string = "timeout";
			export const MINIMUM_DELAY:string = "minimumdelay";

		}

		Object.freeze(ParamNames);

		export function translateParamName(from:string):string
		{
			var fromLC = from.toLowerCase();
			for(var key of Object.keys(ParamNames))
			{
				if(key.toLowerCase()==fromLC) return key;
			}

			return from;
		}

		export function translateParamNames(from:IUriComponentMap):IUriComponentMap
		{
			var result:IUriComponentMap = {};

			for(var key of Object.keys(from))
			{
				result[translateParamName(key)] = from[key];
			}

			return result;
		}


		export module IDs
		{
			export const USER_DATA:string = "user_data";
			export const USER_DATA2:string = "user_data2";
			export const STATUS:string = "status";
			export const S_DATA:string = "sdata";
			export const ACTIONS:string = "actions";
			export const ACTION:string = "action";
			export const DEVICE:string = "device";
			export const SCENE:string = "scene";
			export const ROOM:string = "room";
			export const FILE:string = "file";

		}

		export module Actions
		{
			export const CREATE:string = "create";
			export const RENAME:string = "rename";
			export const DELETE:string = "delete";
			export const LIST:string = "list";

			export const RECORD:string = "record";
			export const PAUSE:string = "pause";
			export const STOP_RECORD:string = "stoprecord";
			export const LIST_RECORD:string = "listrecord";
			export const DELETE_RECORD:string = "deleterecord";
			export const SAVE_RECORD:string = "saverecord";

			export const RUN_LUA:string = "RunLua";
		}

		Object.freeze(IDs);

		export module OutputFormats
		{
			export const XML:string = "xml";
		}

		Object.freeze(OutputFormats);

	}

	Object.freeze(Query);

}

//function queryFromTuples(params:[string,Primitive][]):QueryBuilder
//{
//	var query = new QueryBuilder({});
//	for(var t of params)
//	{
//		query.addByKeyValue(t[0], t[1]);
//	}
//	return query;
//}


interface ILuupRequestBase extends IUriComponentMap
{
	outputFormat?:string
}

interface ILuupRequestParams extends ILuupRequestBase
{
	loadTime?:string,
	dataVersion?:string,
	timeout?:number,
	minimumDelay?:number
}

interface ILuupRequestById extends IUriComponentMap
{
	id:string;
}

export default class BasicMiosEngine
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

	request(params:ILuupRequestById):Promise<string>
	{
		// http://ip_address:3480/data_request?id=user_data2&output_format=xml
		var _ = this;
		var newUri = this._baseUri.toMap();
		var defaultParams = QueryBuilder.init(_._defaultParams.toMap());
		defaultParams.importMap(Luup.Query.translateParamNames(params));
		newUri.query = defaultParams.toString();

		return WebRequest.get(newUri.toString())
			.then(response=>response.content);
	}

	requestById(id:string, params?:IUriComponentMap):Promise<string>
	{
		if(!id) throw new ArgumentNullException(Luup.Query.ParamNames.ID);

		var p:ILuupRequestById = params ? copy(params) : {};
		p.id = id;

		return this.request(p);
	}


	userData(params?:ILuupRequestParams):Promise<string>
	{
		return this.requestById(Luup.Query.IDs.USER_DATA, params);
	}

	userData2(params?:ILuupRequestParams):Promise<string>
	{
		return this.requestById(Luup.Query.IDs.USER_DATA2, params);
	}

	status(params?:ILuupRequestParams):Promise<string>
	{
		return this.requestById(Luup.Query.IDs.STATUS, params);
	}

	sData(params?:ILuupRequestParams):Promise<string>
	{
		// http://ip_address:3480/data_request?id=sdata
		// http://ip_address:3480/data_request?id=sdata&output_format=xml

		return this.requestById(Luup.Query.IDs.S_DATA, params);
	}

	statusWithUdn(udn:string, params?:ILuupRequestBase):Promise<string>
	{
		params = params ? copy(params) : {};
		params[Luup.Query.ParamNames.UDN] = udn;
		return this.requestById(Luup.Query.IDs.STATUS, params);
	}

	deviceStatus(deviceNum:number, params?:ILuupRequestParams):Promise<string>
	{

		Integer.assert(deviceNum);
		params = params ? copy(params) : {};
		params[Luup.Query.ParamNames.DEVICE_NUM] = deviceNum;
		return this.requestById(Luup.Query.IDs.STATUS, params);
	}

	deviceActions(deviceNum:number, params?:ILuupRequestBase):Promise<string>
	{
		Integer.assert(deviceNum);
		params = params ? copy(params) : {};
		params[Luup.Query.ParamNames.DEVICE_NUM] = deviceNum;
		return this.requestById(Luup.Query.IDs.ACTIONS, params);
	}

	deviceAction(action:string, deviceNum:number, params?:IUriComponentMap):Promise<string>
	{
		// http://ip_address:3480/data_request?id=device&action=delete&device=5
		Integer.assert(deviceNum);

		var params:IUriComponentMap = params ? copy(params) : {};
		params[Luup.Query.ParamNames.ACTION] = action;
		params[Luup.Query.ParamNames.DEVICE] = deviceNum;

		return this.requestById(Luup.Query.IDs.DEVICE, params);
	}

	deviceRename(
		deviceNum:number,
		newName:string,
		newRoom?:string|number):Promise<string>
	{
		Integer.assert(deviceNum);
		const NEW_NAME = 'newName';
		if(!newName) throw new ArgumentException(NEW_NAME, 'cannot be null or empty');
		if(/\s+/.test(newName)) throw new ArgumentException(NEW_NAME, 'cannot be pure whitespace');

		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.NAME] = newName;
		if(newRoom) params[Luup.Query.ParamNames.ROOM] = newRoom;

		return this.deviceAction(Luup.Query.Actions.RENAME, deviceNum, params);
	}

	deviceDelete(deviceNum:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=device&action=delete&device=5
		Integer.assert(deviceNum);

		return this.deviceAction(Luup.Query.Actions.DELETE, deviceNum);
	}


	sceneAction(action:string, params?:IUriComponentMap):Promise<string>
	{
		// http://ip_address:3480/data_request?id=device&action=delete&device=5

		var params:IUriComponentMap = params ? copy(params) : {};
		params[Luup.Query.ParamNames.ACTION] = action;

		return this.requestById(Luup.Query.IDs.SCENE, params);
	}

	sceneRecord():Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=record
		return this.sceneAction(Luup.Query.Actions.RECORD);
	}


	scenePauseRecord(seconds:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=pause&seconds=y
		return this.sceneAction(Luup.Query.Actions.PAUSE, {seconds: seconds});
	}

	sceneStopRecord():Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=stoprecord
		return this.sceneAction(Luup.Query.Actions.STOP_RECORD);
	}

	sceneListRecord():Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=listrecord
		return this.sceneAction(Luup.Query.Actions.LIST_RECORD);
	}

	sceneDeleteRecord(recording:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=deleterecord&number=x
		Integer.assert(recording);

		return this.sceneAction(Luup.Query.Actions.DELETE_RECORD, {number:recording});
	}

	sceneSaveRecord(name:string, room?:string|number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=deleterecord

		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.NAME] = name;
		if(room) params[Luup.Query.ParamNames.ROOM] = room;

		return this.sceneAction(Luup.Query.Actions.SAVE_RECORD, params);
	}

	sceneRename(sceneId:number, name:string, room?:string|number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandelier&room=Garage
		Integer.assert(sceneId);

		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SCENE_ID] = sceneId;
		params[Luup.Query.ParamNames.NAME] = name;
		if(room) params[Luup.Query.ParamNames.ROOM] = room;

		return this.sceneAction(Luup.Query.Actions.RENAME, params);
	}

	sceneDelete(sceneId:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandelier&room=Garage
		Integer.assert(sceneId);

		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SCENE_ID] = sceneId;

		return this.sceneAction(Luup.Query.Actions.DELETE, params);
	}

	sceneCreate(json:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=create&json=

		return this.sceneAction(Luup.Query.Actions.CREATE, {json:json});
	}

	sceneList(sceneId:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=scene&action=list&scene=5
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SCENE_ID] = sceneId;

		return this.sceneAction(Luup.Query.Actions.LIST, params);
	}

	roomAction(action:string, params?:IUriComponentMap):Promise<string>
	{
		// http://ip_address:3480/data_request?id=device&action=delete&device=5

		var params:IUriComponentMap = params ? copy(params) : {};
		params[Luup.Query.ParamNames.ACTION] = action;

		return this.requestById(Luup.Query.IDs.ROOM, params);
	}

	roomCreate(name:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=room&action=create&name=Kitchen
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.NAME] = name;

		return this.sceneAction(Luup.Query.Actions.CREATE, params);
	}

	roomRename(room:number,name:string):Promise<string>
	{
		// http://ip_address:3480/data_request?id=room&action=rename&room=5&name=Garage
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.ROOM] = room;
		params[Luup.Query.ParamNames.NAME] = name;

		return this.sceneAction(Luup.Query.Actions.RENAME, params);
	}

	roomDelete(room:number):Promise<string>
	{
		// http://ip_address:3480/data_request?id=room&action=delete&room=5
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.ROOM] = room;

		return this.sceneAction(Luup.Query.Actions.DELETE, params);
	}

	file(filename:string):Promise<string> {
		// http://ip_address:3480/data_request?id=file&parameters=D_BinaryLight1.xml

		return this.requestById(Luup.Query.IDs.FILE, {parameters:filename});
	}

	runLua(code:string):Promise<string> {
		// http://ip_address:3480/data_request?id=file&parameters=D_BinaryLight1.xml
		var params:IUriComponentMap = {};
		params[Luup.Query.ParamNames.SERVICE_ID] = "urn:micasaverde-com:serviceId:HomeAutomationGateway1";
		params[Luup.Query.ParamNames.ACTION] = Luup.Query.Actions.RUN_LUA;
		params[Luup.Query.ParamNames.CODE] = code;


		return this.requestById(Luup.Query.IDs.ACTION, params);
	}


	/*


	public string Luup_CallAction(UInt32 deviceNum, string serviceId, string action, params string[] parameters)
		{
			// http://ip_address:3480/data_request?id=action&output_format=xml&DeviceNum=6&serviceId=urn:upnp-org:serviceId:SwitchPower1&action=SetTarget&newTargetValue=1

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("action"),
				LuupOutputFormat("xml"),
				LuupDeviceNum(deviceNum),
				LuupServiceId(serviceId),
				LuupAction(action),
				Combine(parameters)));
		}

	public string Luup_RunScene(UInt32 sceneId)
		{
			// http://ip_address:3480/data_request?id=action&serviceId=urn:micasaverde-com:serviceId:HomeAutomationGateway1&action=RunScene&SceneNum=

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("action"),
				LuupServiceId("urn:micasaverde-com:serviceId:HomeAutomationGateway1"),
				LuupAction("RunScene"),
				LuupParam("SceneNum", sceneId.ToString(CultureInfo.InvariantCulture))));
		}

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

	public string Luup_VariableSet(UInt32 deviceNum, string serviceId, string varName, string value)
		{
			// http://ip_address:3480/data_request?id=variableset&DeviceNum=6&serviceId=urn:micasaverde-com:serviceId:DoorLock1&Variable=Status&Value=1

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("variableset"),
				LuupDeviceNum(deviceNum),
				LuupServiceId(serviceId),
				LuupVariable(varName),
				LuupValue(value)));
		}

	public string Luup_VariableGet(UInt32 deviceNum, string serviceId, string varName)
		{
			// http://ip_address:3480/data_request?id=variableget&DeviceNum=6&serviceId=urn:micasaverde-com:serviceId:DoorLock1&Variable=Status

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("variableget"),
				LuupDeviceNum(deviceNum),
				LuupServiceId(serviceId),
				LuupVariable(varName)));
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