var Query;
(function (Query) {
    Query.OK = "OK";
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
        ParamNames.SCENE_NUM = "SceneNum"; // Integer
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
        IDs.VARIABLE_GET = "variableget";
        IDs.VARIABLE_SET = "variableset";
        IDs.FIND_DEVICE = "finddevice";
        IDs.RELOAD = "reload";
        IDs.ALIVE = "alive";
        IDs.RESYNC = "resync";
        IDs.INVOKE = "invoke";
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
        Actions.RUN_SCENE = "RunScene";
        Actions.RUN_LUA = "RunLua";
    })(Actions = Query.Actions || (Query.Actions = {}));
    Object.freeze(IDs);
    var OutputFormats;
    (function (OutputFormats) {
        OutputFormats.XML = "xml";
        OutputFormats.JSON = "json";
    })(OutputFormats = Query.OutputFormats || (Query.OutputFormats = {}));
    Object.freeze(OutputFormats);
})(Query = exports.Query || (exports.Query = {}));
Object.freeze(Query);
//# sourceMappingURL=Luup.js.map