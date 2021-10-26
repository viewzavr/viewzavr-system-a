// (c) viewzavr project. MIT license.
// purpose: object and XML mutual conversion

export function setup(vz, m) {
	vz.register_feature_set({
		xml_lang, create_from_xml, obj_xml
	})
}

export function xml_lang(env) {
	if (env == env.vz)
		create_from_xml( env );
	else
		obj_xml( env );
}

export function create_from_xml(env) {
	var vz = env.vz;

	env.createFromXml = function(xml_text, _existingObj, parent, desiredName, html_fallback, manual = false) {
		var dump = xmltext2dump(vz, xml_text, html_fallback, manual);
		return vz.createSyncFromDump(dump, _existingObj, parent, desiredName);
	}

	vz.createFromXmlNow = function(xml_text, _existingObj, parent, desiredName, html_fallback = true, manual = false) {
		var dump = xmltext2dump(vz, xml_text, html_fallback, manual);
		var res = vz.createSyncFromDumpNow(dump, _existingObj, parent, desiredName);
		res.feature( "obj_xml");
		res.protectChildren();
		return res;
	}
}

export function obj_xml(obj) {
	var vz = obj.vz;
	obj.protectChildren = function() {
		for (let c of obj.ns.children)
			c.protected = true;
	}

	// restores object children and params. Object type is not modified.
	obj.restoreFromXml = function(xml_text, html_fallback = false, manual = true) {
		var dump = xmltext2dump(vz, xml_text, html_fallback, manual);

		let res = obj.restoreFromDump(dump, manual);
		if (dump.desired_name && obj.ns?.parent)
			obj.ns.parent.ns.renameChild(obj.ns.name, dump.desired_name);
		return res;
	}

	// restores object children. object type and params not modified.
	obj.childrenFromXml = function(xml_text, html_fallback = false, manual = true) {
		xml_text = "<something>" + xml_text + "</something>";
		var dump = xmltext2dump(vz, xml_text, html_fallback, manual);
		var res = obj.restoreFromDump(dump);
		//if () obj.protectChildren();
		return res;
	}

	obj.dumpToXml = function() {
		var dump = obj.dump(true);
		return dump2xml(dump, obj.ns.name);
	}

}

/////////////////////////////////////////
function xmltext2dump(vz, xml_text, html_fallback = false, default_manual = true) {

	var parser = new DOMParser();
	//var v2 = "<group>" + xml_text + "</group>";
	var v2 = xml_text;
	var doc = parser.parseFromString(v2, "text/xml");

	if (doc?.body?.firstChild?.nodeName === "parsererror") {
		console.error("restoreFromXml: parse error", doc?.body?.firstChild);

		console.error("text was", xml_text);
		throw {
			msg: "restoreFromXml: parse error",
			details: doc?.body?.firstChild.outerHTML,
		};
		return;
	}

	// вызывается когда во вьюзавре нету заказанного в xmlrecord типа
	// dump - проект записи dump, ее можно модифицировать
	// xml - dom node обрабатываемый
	var fallback_fn = function(dump, xmlrecord) {


		if (xmlrecord.nodeName === "parsererror") {
			console.error("restoreFromXml: parse error 2", xmlrecord.innerText)
			console.error("text was", xml_text)
			throw {
				msg: "restoreFromXml: parse error 2",
				details: xmlrecord.outerHTML
			}
			return false;
		}

		if (html_fallback) {
			dump.type = "guinodehtml";

			//dump.params["text"] = xmlrecord.outerHTML;
			var s = xmlrecord.outerHTML.replace(/>.+$/ms, ">");
			if (xmlrecord.innerHTML.indexOf("<") < 0)
				s += xmlrecord.innerHTML; // а то textContent тащит вложенные тексты
			//if (xmlrecord.textContent) s += xmlrecord.textContent;
			s += `</${xmlrecord.nodeName}>`
			dump.params["text"] = s;
			dump.params["textisinternal"] = true; // надо уметь в дампе опции параметрам ставить

			//dump.params["text"] = `<${xmlrecord.nodeName}>${xmlrecord.textContent ? xmlrecord.textContent : ''}</${xmlrecord.nodeName}>`;
			return true;
		}

		// случай params_for - когда назначаются параметры встроенному объекту
		// т.е. такому  который создается программно
		if (xmlrecord.nodeName == "params_for") {
			dump.manual = false;
			return true;
		}

		console.error("restoreFromXml: unknown type, skipping", xmlrecord);
		//throw {msg:`restoreFromXml: unknown type, skipping`, details: xmlrecord.nodeName}
		throw {
			msg: `restoreFromXml: unknown type, skipping`,
			details: `<xmp>${xmlrecord.outerHTML}</xmp>`
		}

		return false; // неизвестные узлы не обрабатываем..
	}

	var newnode = doc.children[0];
	var dump = xml2dump_with_fallback(newnode, vz, fallback_fn, default_manual);

	// R-CHANGE-OBJ-NAME-GUI
	if (newnode.getAttribute("id")) dump.desired_name = newnode.getAttribute("id");

	return dump;
}



//////////////////////////////////////////
// xml это node element
// @idea может быть проще уже функцию ТПУ вызывать, а не default_manual передавать
// тогда можно обойтись без fallback_fn - пусть там проверяют тип сами
function xml2dump_with_fallback(xml, vz, fallback_fn, default_manual = true) {
	var res = {
		params: {},
		children: {}
	};

	// если не manual то все-равно их надо создавать (пока так считается)
	if (default_manual) res.manual = true;
	else res.forcecreate = true;

	if (xml.nodeType != 1) return res;

	res.type = xml.nodeName;

	if (!vz.getTypeInfo(res.type)) {
		if (fallback_fn)
			if (!fallback_fn(res, xml)) return;
		// нету там такого типа - но у нас фаллбек
		//res.type = "guinodehtml";
		//res.params["text"] = xml.outerHTML;
	}


	// @todo это должно переехать в dump
	let auto_links_count = 0;
	if (xml.attributes.length) // element with attributes  ..
		for (var i = 0; i < xml.attributes.length; i++) {
			let pname = xml.attributes[i].name;
			if (pname === "id") continue;

			let pvalue = xml.attributes[i].nodeValue;

			if (pname.endsWith("_link")) { // ссылка

				let link = {
					type: "link",
					params: {
						"tied_to_parent": true,
						"from": pvalue,
						"to": `->${pname.substring(0,pname.length-5)}`
						//"to":`.->${pname.substring(1)}`

					},
					forcecreate: true
				}

				let cid = `link_${auto_links_count++}`;
				res.children[cid] = link;
				continue;
			}


			if (pname.endsWith("_link_to")) { // ссылка на - управляем то бишь. это сделано взамин link_dual, типа так веселее комбинировать, можно только link_to сделать.

				var manual = false;
				if (pvalue.endsWith("@manual")) {
					pvalue = pvalue.split("@manual")[0].trim();
					manual = true;
				}

				let link = {
					type: "link",
					params: {
						"tied_to_parent": true,
						"to": pvalue,
						"from": `->${pname.substring(0,pname.length-8)}`,
						"manual_mode": manual
						//"to":`.->${pname.substring(1)}`

					},
					forcecreate: true
				}

				let cid = `link_${auto_links_count++}`;
				res.children[cid] = link;
				continue;
			}

			////// немного треша - больше негде
			if (pvalue === "false") // булеаны
				pvalue = false;
			else if (pvalue === "true")
				pvalue = true;
			//else if (pvalue.length && pvalue[0] == "[") // массивы
			//	 pvalue = JSON.parse( pvalue );
			// update оказалось что есть строки начинающиеся с [
			// короче надо точно что-то делать

			// todo надо разбораться. на самом деле тут - я думаю - надо делать принудительный JSON.stringify всегда
			// а строковые вещи - размещать с суффиксом _str или типа того.	
			// но пока такого хватит.

			res.params[pname] = pvalue;
		}

	let counter = 0;
	for (var n = xml.firstChild; n; n = n.nextSibling) {
		if (n.nodeType == 1) {
			let c = xml2dump_with_fallback(n, vz, fallback_fn, default_manual);
			if (!c) continue;

			/////////// вычисление имени дитятки
			//let cid = n.getAttribute('id') || `${c.type}_${counter.toString()}`;

			let cid = n.getAttribute("id");

			if (!cid) {
				let topts = vz.getTypeOptions(c.type);
				if (topts && topts.name) cid = topts.name;
				if (!cid)
					cid = `${c.type}`;
			}
			if (res.children[cid]) // если имя занято то добавим локальный счетчик дитев
				cid = cid + `_${counter}`;

			res.children[cid] = c;
			counter++;
		}

	}

	return res;
}


function dump2xml(dump, id = null, padding = " ") {

	var h = dump.params || {};
	var keys = Object.keys(h);

	var tag = dump.type || 'params_for';

	var result = `<${tag} `;

	if (id) result += `id=\"${id}\" `

	var attrs = "";

	keys.forEach(function(name) {
		var s = h[name];

		if (typeof(s) === "string") s = s.replaceAll("\"", "&quot;");
		var v = JSON.stringify(s)
		if (v[0] != "\"") v = `\"${v}\"`;
		attrs += `${name}=${v} `;
	});

	// надо экранировать <> в аттрубитах, правило xml
	attrs = attrs.replaceAll("<", "&lt;").replaceAll(">", "&gt;")

	result += attrs + ">";

	var c = dump.children || {};
	var ckeys = Object.keys(c);

	ckeys.forEach(function(name) {
		let cobj = c[name];
		result += "\n" + dump2xml(cobj, name, padding);
		/*
		if (cobj.type == "link") {

			result += `\n  ${objvarname}.linkParam( '${cobj.params.to}','${cobj.params.from}' )`;
		}
		else
			result += "\n" + json2js_v2( name, objvarname + "_" + name, objvarname, c[name],padding);
		*/
	});

	result += `\n</${tag}>`

	return result.split("\n").map(s => padding + s).join("\n");
}