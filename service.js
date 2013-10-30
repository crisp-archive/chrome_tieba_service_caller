/**
 * Tieba Service Caller
 * @file service.js
 * @author zhangwanlong@baidu.com
 * @date 2013/10/25
 * @brief service caller
 *
 **/

defaultConfig = {
	"config": {
		"service" :[
			{ "service": "forum", "method": "getForumInfoByName", "param": "forum_name" },
			{ "service": "forum", "method": "getFidByFname", "param": "query_words[]" },
			{ "service": "forum", "method": "getFnameByFid", "param": "forum_id[]" },
			{ "type": "separator" },
			{ "service": "user", "method": "getUidByUnames", "param": "user_name[]" },
			{ "service": "user", "method": "getUnameByUids", "param": "user_id" },
			{ "service": "user", "method": "getUserData", "param": "user_id" },
			{ "type": "separator" },
			{ "service": "perm", "method": "getBawuList", "param": "forum_id" },
			{ "service": "perm", "method": "getUserManagerList", "param": "user_id" }
		],
		"domain": "http://service.tieba.baidu.com"
	}
};

function getConfig(info, callback)
{
	chrome.storage.local.get("config", function(data){
		service = data.config["service"];
		domain = data.config["domain"];
		callback(info);
	});
}

function parseQuery(info)
{
	var service_name = "";
	var method = "";
	var params = "";
	var input = info.selectionText;
	var menuId = info.menuItemId;
	if(input.length == 0 || menuId == "parent"){
		return;
	}
	if(menuId=="goto"){
		chrome.tabs.create({
			"url": "http://tieba.baidu.com/f?ie=utf-8&kw="+input
		});
		return;
	}
	else if(menuId=="timestamp"){
		var realTime = new Date(input*1000);
		alert(realTime);
		return;
	}
	else{
		for(var i in service){
			if(typeof service[i]["type"] == "undefined"){
				if(service[i]["method"]==menuId){
					service_name = service[i]["service"];
					method = service[i]["method"];
					param = service[i]["param"];
					break;
				}
			}
			else{
				continue;
			}
		}
		var ie = "";
		param += "="+input;
		if( /.*[\u4e00-\u9fa5]+.*$/.test(param) ){
			ie = "&ie=utf-8";
		}
		var url = domain+"/service/"+service_name+"?method="+method+"&"+param+ie+"&format=json";
		chrome.tabs.create({
			"url": url
		});
	}
}

function onClickHandler(info, tab)
{
	getConfig(info, parseQuery);
}

function callService()
{
}

function generateContextMenu()
{
	var contexts = ["selection"];
	chrome.contextMenus.removeAll();
	// create parent
	chrome.contextMenus.create({
		"title": "Tieba_Service::call",
		"id": "parent",
		"contexts":contexts
	});
	// go to
	chrome.contextMenus.create({
		"title": "goto",
		"parentId": "parent",
		"id": "goto",
		"contexts": contexts
	});
	// timestamp to time
	chrome.contextMenus.create({
		"title": "convert timestamp",
		"parentId": "parent",
		"id": "timestamp",
		"contexts": contexts
	});
	chrome.contextMenus.create({
		"type": "separator",
		"parentId": "parent",
		"id": "separator_sys",
		"contexts": contexts
	});
	for(var i in service){
		if ( typeof service[i]["type"] != "undefined" ){
			if (service[i]["type"] == "separator")
			{
				chrome.contextMenus.create({
					"type": "separator",
					"parentId": "parent",
					"id": "separator"+i,
					"contexts": contexts
				});
				continue;
			}
		}
		chrome.contextMenus.create({
			"title": service[i]["method"],
			"id": service[i]["method"],
			"parentId": "parent",
			"contexts": contexts
		});
	}
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.runtime.onInstalled.addListener(function(){
	service = defaultConfig["config"]["service"];
	generateContextMenu();
	chrome.storage.local.set(defaultConfig);
});

chrome.browserAction.onClicked.addListener(function(){
	chrome.tabs.create({
		url: "options.html"
	});
});
