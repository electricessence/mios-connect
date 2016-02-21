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

///<reference path="../typings/main/ambient/node/node.d.ts"/>

import Type from '../node_modules/typescript-dotnet/source/System/Types'
import Integer from '../node_modules/typescript-dotnet/source/System/Integer'
import {format} from '../node_modules/typescript-dotnet/source/System/Text/Utility'
import ArgumentNullException from '../node_modules/typescript-dotnet/source/System/Exceptions/ArgumentNullException'
import QueryBuilder from '../node_modules/typescript-dotnet/source/System/Uri/QueryBuilder'


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
			export const ROOM_ID:string = "room"; // Integer
			export const SCENE_ID:string = "scene"; // Integer
			export const SERVICE_ID:string = "serviceId"; // Integer
			export const UDN:string = "UDN"; // String
			export const VALUE:string = "Value"; // String
			export const VARIABLE_NAME:string = "Variable"; // String

			export const LOAD_TIME:string = "LoadTime";
			export const DATA_VERSION:string = "DataVersion";
			export const TIMEOUT:string = "timeout";
			export const MINIMUM_DELAY:string = "minimumdelay";

		}

		Object.freeze(ParamNames);

		export module IDs
		{
			export const USER_DATA:string = "user_data";
		}

		Object.freeze(IDs);

		export module OutputFormats {
			export const XML:string = "xml";
		}

		Object.freeze(OutputFormats);

	}

	Object.freeze(Query);

}

function queryFromTuples(...params:String[][]):QueryBuilder {
	var query = new QueryBuilder({});
	for(var t of params)
		query.addByKeyValue(t[0],t[1]);
	return query;
}

export default class BasicMiosEngine
{
	protected httpPrefix:string;


	userData(
		outputFormat:string = Luup.Query.OutputFormats.XML,
		loadTime?:string,
		dataVersion?:string,
		timeout?:string,
		minimumDelay?:string):string
	{
		// http://ip_address:3480/data_request?id=user_data&output_format=xml

		var query = queryFromTuples(
			[Luup.Query.ParamNames.ID, Luup.Query.IDs.USER_DATA],
			[Luup.Query.ParamNames.OUTPUT_FORMAT, outputFormat],
			[Luup.Query.ParamNames.LOAD_TIME, loadTime],
			[Luup.Query.ParamNames.DATA_VERSION, dataVersion],
			[Luup.Query.ParamNames.TIMEOUT, timeout],
			[Luup.Query.ParamNames.MINIMUM_DELAY, minimumDelay]
		);

		return '';
		//HttpConnection.HttpGetString(HttpPrefix, Combine(
		//	LuupId("user_data"),
		//	LuupOutputFormat(outputFormat),
		//	LuupParam("LoadTime", loadTime),
		//	LuupParam("DataVersion", dataVersion),
		//	LuupParam("timeout", timeout),
		//	LuupParam("minimumdelay", minimumDelay)));
	}

	/*
	public string Luup_UserData2(string outputFormat = null, string loadTime = null, string dataVersion = null, string timeout = null, string minimumDelay = null)
		{
			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("user_data2"),
				LuupOutputFormat(outputFormat),
				LuupParam("LoadTime", loadTime),
				LuupParam("DataVersion", dataVersion),
				LuupParam("timeout", timeout),
				LuupParam("minimumdelay", minimumDelay)));
		}

	public string Luup_Status(string outputFormat = null, string loadTime = null, string dataVersion = null, string timeout = null, string minimumDelay = null)
		{
			// http://ip_address:3480/data_request?id=status&output_format=xml

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("status"),
				LuupOutputFormat(outputFormat),
				LuupParam("LoadTime", loadTime),
				LuupParam("DataVersion", dataVersion),
				LuupParam("timeout", timeout),
				LuupParam("minimumdelay", minimumDelay)));
		}

	public string Luup_StatusWithUdn(string udn, string outputFormat)
		{
			// http://ip_address:3480/data_request?id=status&output_format=xml&UDN=uuid:4d494342-5342-5645-0002-000000000002

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("status"),
				LuupOutputFormat(outputFormat),
				LuupUdn(udn)));
		}

	public string Luup_Status(UInt32 deviceNum, string outputFormat = null, string loadTime = null, string dataVersion = null, string timeout = null, string minimumDelay = null)
		{
			// http://ip_address:3480/data_request?id=status&output_format=xml&DeviceNum=6

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("status"),
				LuupOutputFormat(outputFormat),
				LuupDeviceNum(deviceNum),
				LuupParam("loadtime", loadTime),
				LuupParam("dataversion", dataVersion),
				LuupParam("timeout", timeout),
				LuupParam("minimumdelay", minimumDelay)));
		}

	public string Luup_SData(string outputFormat = null, string loadTime = null, string dataVersion = null, string timeout = null, string minimumDelay = null)
		{
			// http://ip_address:3480/data_request?id=sdata
			// http://ip_address:3480/data_request?id=sdata&output_format=xml

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("sdata"),
				LuupOutputFormat(outputFormat),
				LuupParam("loadtime", loadTime),
				LuupParam("dataversion", dataVersion),
				LuupParam("timeout", timeout),
				LuupParam("minimumdelay", minimumDelay)));
		}

	public string Luup_Actions(UInt32 deviceNum, string outputFormat = null)
		{
			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("actions"),
				LuupOutputFormat(outputFormat),
				LuupDeviceNum(deviceNum)));
		}

	public string Luup_DeviceRename(UInt32 device, string newName, UInt32 newRoom)
		{
			// http://ip_address:3480/data_request?id=device&action=rename&device=5&name=Chandalier&room=3
			return Luup_DeviceRename(device, newName, newRoom.ToString(CultureInfo.InvariantCulture));
		}

	public string Luup_DeviceRename(UInt32 device, string newName, string newRoom = null)
		{
			// http://ip_address:3480/data_request?id=device&action=rename&device=5&name=Chandalier&room=Garage

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("device"),
				LuupAction("rename"),
				LuupDevice(device),
				LuupName(newName),
				LuupParam("room", newRoom)));
		}

	public string Luup_DeviceDelete(UInt32 device)
		{
			// http://ip_address:3480/data_request?id=device&action=delete&device=5

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("device"),
				LuupAction("delete"),
				LuupDevice(device)));
		}

	public string Luup_SceneRecord()
		{
			// http://ip_address:3480/data_request?id=scene&action=record

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("record")));
		}

	public string Luup_ScenePause(UInt32 seconds)
		{
			// http://ip_address:3480/data_request?id=scene&action=pause&seconds=y

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("pause"),
				LuupParam("seconds", seconds.ToString(CultureInfo.InvariantCulture))));
		}

	public string Luup_SceneStopRecord()
		{
			// http://ip_address:3480/data_request?id=scene&action=stoprecord

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("stoprecord")));
		}

	public string Luup_SceneListRecord()
		{
			// http://ip_address:3480/data_request?id=scene&action=listrecord

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("listrecord")));
		}

	public string Luup_SceneDeleteRecord(UInt32 number)
		{
			// http://ip_address:3480/data_request?id=scene&action=deleterecord&number=x

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("deleterecord"),
				LuupParam("number", number.ToString(CultureInfo.InvariantCulture))));
		}

	public string Luup_SceneSaveRecord(string name, string room)
		{
			// http://ip_address:3480/data_request?id=scene&action=saverecord&name=whatever&room=X

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("saverecord"),
				LuupName(name),
				LuupRoom(room)));
		}

	public string Luup_SceneRename(UInt32 sceneId, string name, string room)
		{
			// http://ip_address:3480/data_request?id=scene&action=rename&scene=5&name=Chandalier&room=Garage

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("rename"),
				LuupScene(sceneId),
				LuupName(name),
				LuupRoom(room)));
		}

	public string Luup_SceneDelete(UInt32 sceneId)
		{
			// http://ip_address:3480/data_request?id=scene&action=delete&scene=5

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("delete"),
				LuupScene(sceneId)));
		}

	public string Luup_SceneCreate(string json)
		{
			// http://ip_address:3480/data_request?id=scene&action=create&json=

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("create"),
				LuupParam("json", json)));
		}

	public string Luup_SceneList(UInt32 sceneId)
		{
			// http://ip_address:3480/data_request?id=scene&action=list&scene=5

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("scene"),
				LuupAction("list"),
				LuupScene(sceneId)));
		}

	public string Luup_RoomCreate(string name)
		{
			// http://ip_address:3480/data_request?id=room&action=create&name=Kitchen

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("room"),
				LuupAction("create"),
				LuupName(name)));
		}

	public string Luup_RoomRename(UInt32 room, string name)
		{
			// http://ip_address:3480/data_request?id=room&action=rename&room=5&name=Garage

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("room"),
				LuupAction("rename"),
				LuupRoom(room),
				LuupName(name)));
		}

	public string Luup_RoomDelete(UInt32 room)
		{
			// http://ip_address:3480/data_request?id=room&action=delete&room=5

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("room"),
				LuupAction("create"),
				LuupRoom(room)));
		}

	public string Luup_File(string filename)
		{
			// http://ip_address:3480/data_request?id=file&parameters=D_BinaryLight1.xml

			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("file"),
				LuupParam("parameters", filename)));
		}

	public string Luup_RunLua(string code)
		{
			return
			HttpConnection.HttpGetString(HttpPrefix, Combine(
				LuupId("action"),
				LuupServiceId("urn:micasaverde-com:serviceId:HomeAutomationGateway1"),
				LuupAction("RunLua"),
				LuupParam("Code", code)));
		}

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