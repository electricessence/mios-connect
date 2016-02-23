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
		export const SCENE_NUM:string = "SceneNum"; // Integer
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

		export const VARIABLE_GET:string = "variableget";
		export const VARIABLE_SET:string = "variableset";

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

		export const RUN_SCENE:string = "RunScene";
		export const RUN_LUA:string = "RunLua";
	}

	Object.freeze(IDs);

	export module OutputFormats
	{
		export const XML:string = "xml";
		export const JSON:string = "json";
	}

	Object.freeze(OutputFormats);

}

Object.freeze(Query);

export interface IRequestBase extends IUriComponentMap
{
	outputFormat?:string
}

export interface IRequestParams extends IRequestBase
{
	loadTime?:string,
	dataVersion?:string,
	timeout?:number,
	minimumDelay?:number
}

export interface IRequestById extends IUriComponentMap
{
	id:string;
}

export interface IRequestByIdAndAction extends IRequestById
{
	action:string;
}
