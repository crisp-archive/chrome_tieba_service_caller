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
			{ "service": "forum", "method": "getBtxInfoByName", "param": "forum_name" },
			{ "service": "forum", "method": "getBtxInfo", "param": "forum_id" },
			{ "type": "separator" },
			{ "service": "user", "method": "getUserData", "param": "user_id" },
			{ "service": "user", "method": "getUserDataExByUname", "param": "user_name" },
			{ "service": "user", "method": "getMyFavorForum", "param": "user_id" },
			{ "type": "separator" },
			{ "service": "perm", "method": "getForumMemberInfo", "param": "forum_id" },
			{ "service": "perm", "method": "getBawuList", "param": "forum_id" },
			{ "service": "perm", "method": "getUserBawuForum", "param": "user_id" }
		],
		"domain": "http://service.tieba.baidu.com",
		"format": "json"
	}
};

function getConfig(info, callback)
{
	chrome.storage.local.get("config", function(data){
		service = data.config["service"];
		domain = data.config["domain"];
		format = data.config["format"];
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
		var strTime = realTime.getFullYear()+"-"+(realTime.getMonth()+1)+"-"+realTime.getDate()+" "+realTime.getHours()+":"+realTime.getMinutes()+":"+realTime.getSeconds();
		alert(strTime);
		return;
	}
	else if(menuId=="long2ip"){
		alert(long2ip(parseInt(input)));
		return;
	}
	else if(menuId=="ip2long"){
		alert(ip2long(input));
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
		param += "="+input;
		var url = domain+"/service/"+service_name+"?method="+method+"&"+param+"&format="+format+"&ie=utf-8";
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

function long2ip(i){
	return (Math.floor(i/(256*256*256))) + "." +
	(Math.floor(i%(256*256*256)/(256*256))) + "." +
	(Math.floor(i%(256*256)/256)) + "." +
	(Math.floor(i%256));
}

function ip2long(ip)
{
	var numbers = ip.split(".");
	return parseInt(numbers[0])*256*256*256 +
	parseInt(numbers[1])*256*256 +
	parseInt(numbers[2])*256 +
	parseInt(numbers[3]);
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
		"title": "timestamp2time",
		"parentId": "parent",
		"id": "timestamp",
		"contexts": contexts
	});
	// long to ip
	chrome.contextMenus.create({
		"title": "long2ip",
		"parentId": "parent",
		"id": "long2ip",
		"contexts": contexts
	});
	// ip to long
	chrome.contextMenus.create({
		"title": "ip2long",
		"parentId": "parent",
		"id": "ip2long",
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

