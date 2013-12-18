/**
 * Tieba Service Caller
 * @file options.js
 * @author zhangwanlong@baidu.com
 * @date 2013/10/25
 * @brief options page
 *
 **/

defaultConfig = {
	"config": {
		"service" :[
			{ "service": "forum", "method": "getBtxInfoByName", "param": "forum_name" },
			{ "service": "forum", "method": "getFidByFname", "param": "query_words[]" },
			{ "service": "forum", "method": "getFnameByFid", "param": "forum_id[]" },
			{ "type": "separator" },
			{ "service": "user", "method": "getUserData", "param": "user_id" },
			{ "service": "user", "method": "getUserDataExByUname", "param": "user_name" },
			{ "service": "user", "method": "getMyFavorForum", "param": "user_id" },
			{ "type": "separator" },
			{ "service": "perm", "method": "getForumMemberInfo", "param": "forum_id" },
			{ "service": "perm", "method": "getBawuList", "param": "forum_id" },
			{ "service": "perm", "method": "tmpGetUserBawuList", "param": "user_id" }
		],
		"domain": "http://service.tieba.baidu.com"
	}
};

function getConfig()
{
	chrome.storage.local.get("config", function(data){
		service = data.config["service"];
		domain = data.config["domain"];
		showConfig();
	});
}

function showConfig()
{
	document.querySelector("#domain").value = domain;
	var config_html = "<tr><td>Service</td><td>Method</td><td>Parameter</td><td>Operation</td></tr>";
	for(var i in service){
		var service_name = service[i]["service"];
		var method = service[i]["method"];
		var param = service[i]["param"];
		if (typeof service[i]["type"] != "undefined"){
			if ( service[i]["type"] == "separator"){
				config_html += "<tr><td>----</td><td></td><td></td><td>"+generateButton(i)+"</tr>";
				continue;
			}
		}
		config_html += "<tr><td>"+service_name+"</td><td>"+method+"</td><td>"+param+"<td>"+generateButton(i)+"</td></tr>";
	}
	document.querySelector("#get").innerHTML = config_html;
	for(var i in service){
		addButtonListener(i);
	}
	generateContextMenu();
}

function generateButton(i)
{
	return "<button id=\"up_"+i+"\">Up</button><button id=\"down_"+i+"\">Down</button><button id=\"del_"+i+"\">Del</button>";
}

function addButtonListener(i)
{
	document.querySelector("#up_"+i).addEventListener("click", opClickHandler);
	document.querySelector("#down_"+i).addEventListener("click", opClickHandler);
	document.querySelector("#del_"+i).addEventListener("click", opClickHandler);
}

function generateContextMenu()
{
	var contexts = ["selection"];
	chrome.contextMenus.removeAll();
	// create parent
	chrome.contextMenus.create({
		"title": "Tieba_Service::call",
		"id": "parent",
		"contexts": contexts
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
					"id": "separator"+i,
					"parentId": "parent",
					"contexts": contexts
				},
				function(){
					alert(chrome.runtime.lastError.message);
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

function setService()
{
	var config = {"config":{"domain":domain,"service":service}}
	chrome.storage.local.set(config, function(){
		getConfig();
	});
}

function setDomain()
{
	new_domain = document.querySelector("#domain").value;
	
	var config = {"config":{"domain":new_domain,"service":service}};
	chrome.storage.local.set(config, function(){
		getConfig();
	});
}

function setDefault()
{
	chrome.storage.local.set(defaultConfig, function(){
		getConfig();
	});
}

function addSeparator()
{
	service.push({ "type": "separator" });
	setService();
}

function addService()
{
	var service_name = document.querySelector("#service").value;
	var method = document.querySelector("#method").value;
	var param = document.querySelector("#param").value;
	service.push({ "service": service_name, "method": method, "param": param });
	setService();
}

function deleteService(i)
{
	delete service[i];
	setService();
}

function moveUp(i)
{
	swap(i, i-1);
}

function moveDown(i)
{
	swap(i, i+1);
}

function swap(i, j)
{
	if(i<0||i>=service.length||j<0||j>=service.length){
		return;
	}
	var temp = service[i];
	service[i] = service[j];
	service[j] = temp;
	setService();
}

function opClickHandler(e)
{
	var targetId = e.target.id;
	var idArr = targetId.split("_");
	var op = idArr[0];
	var id = parseInt(idArr[1]);
	
	if(op=="up"){
		moveUp(id);
	}
	else if(op=="down"){
		moveDown(id);
	}
	else if(op=="del"){
		deleteService(id);
	}
}

document.addEventListener("DOMContentLoaded", getConfig);
document.querySelector("#set_domain").addEventListener("click", setDomain);
document.querySelector("#set_default").addEventListener("click", setDefault);
document.querySelector("#add_sep").addEventListener("click", addSeparator);
document.querySelector("#add_service").addEventListener("click", addService);
