// input: target object, code
// effect: a collection of objects is generated from code and attached as children to target object
// ideas: probably do not attach them as children for a while? (but Viewzavr likes children..)
// this is inspired and follows https://github.com/XcluDev/Xclu/blob/master/builtin_modules/Window/Window/help.md
// feature: allow code to be javascript that generates code


export default function setup(vz, m) {
  vz.register_feature("simple-denis-lang",simple_denis_lang);
  vz.register_feature("tree-items",tree_items);
}

export function simple_denis_lang(env) {
  // для vz
  if (env.vz == env)
    env.createFromText = function(opts, code) {
      var dummy_obj = env.vz.createObj();
      var res = parse(dummy_obj, code);
      var c1 = dummy_obj.ns.getChildren()[0];

      if (opts?.parent)
        opts.parent.ns.appendChild(c1, opts.name || c1.ns.name, true);
      else
        dummy_obj.ns.forgetChild(c1);

      dummy_obj.remove();
      return c1;
    }
  else
    // для объектов..
    env.createChildrenFromTxt = function(opts, code) {
      return parse(env, code);
    }

}

///////////////////

export function parse(obj, code) {
  if (code.startsWith("//js2")) {
    try {
      var f = new Function("obj", "parse", code);
      f(obj, function(cod) {
        return parse_txt(obj, cod);
      });
      return;
    } catch (err) {
      console.error("SIMPLE_DENIS_LANG: error in your code 3", err);
      return;
    }
  }

  return parse1(obj, code);
}


// feature: allow code to be javascript that generates code
export function parse1(obj, code) {
  if (code.startsWith("//js")) {
    try {
      var f = new Function("obj", code);
      code = f(obj);
    } catch (err) {
      console.error("SIMPLE_DENIS_LANG: error in your code", err);
      return;
    }
    //code = eval( code );
  }

  return parse_txt_and_extra_js(obj, code);
}

// feature: post-eval js after text
// дык может уже просто, ну как бы, типа, js да и все.. пусть вызывает parse-функцию да и все, не?
// и добавляет какие хочет вещи.. а не вот это вот огородостроение..
// просто интересно.. мы заменяем одно на другое да и все.. ну типа..
// история такая, надо понимать - вот текст и все. а другое дело что js возвращает текст, а третье дело - что js вызывает парсе сам
// т.е. это вот некая история про цепочку. надо осознать. возможно это я реально лишнее делаю
export function parse_txt_and_extra_js(obj, code) {

  var parts = code.split(/#+ \.js/);

  //console.log("qq",parts);

  if (parts[1]) {

    var res = parse_txt(obj, parts[0]);
    try {
      console.log("gonna eval", parts[1]);
      var f = new Function("obj", parts[1]);
      f(obj);
    } catch (err) {
      console.error("SIMPLE_DENIS_LANG: error in your code 2", err);
      return res;
    }
    return res;
  } else {
    return parse_txt(obj, code);
  }
}

export function parse_txt(obj, code) {
  //console.log("parsing code=",code );
  var lines = code.split("\n").filter(line => trim(line).length > 0 && line[0] != "#");

  var indents = lines.map(function(line) {
    var count = 0;
    while (count < line.length && line[count] == " ") count++;
    return count;
  });

  var config = obj.dump();
  /*
  var g = obj.ns.getChildByName("generated");
  if (g) g.remove();
  g = obj.vz.createObj({name:"generated",parent:obj});
  */
  //obj.shadow.removeChildren(); //getChildren().slice().forEach( function(c) { c.remove(); });
  obj.ns.removeChildren();


  var g = obj;

  //var tree = { children: [] };

  //  debugger;
  add_children_to_tree(g, 0);

  //  obj.vz.createSyncFromDump( config,obj );

  function add_children_to_tree(node, index) {
    var children_indent = indents[index];
    for (var i = index; i < indents.length;) {
      var c_ind = indents[i];
      if (c_ind == children_indent) {
        var child = generate_object(lines[i].substring(c_ind), node);
        //node.children.push( child );
        var next_ind = indents[i + 1] || -1;
        if (next_ind > c_ind)
          i = add_children_to_tree(child, i + 1);
        else
          i++;
      } else
        return i;
    }
    return i;
  }

  function generate_object(line, parent) {
    console.log("generate object: line=", line);

    /*
    var parts = line.match( /^\S+.*$/ );
    var name = line[0];
    var args = line[1];
    var subargs = args.split(/\s+/);
    var eigenvalue*/

    var arr = line.split(/\s+/);
    var type = arr[0];
    var params = {};

    // тут переделать надо, не по пробелам разбивать а похитрее
    // let attributes = html.match(/[\w-]+="[^"]*"/g); console.log(attributes);
    // https://stackoverflow.com/questions/56585907/javascript-split-the-html-attributes-and-value

    for (var j = 1; j < arr.length; j++) {
      var parts = arr[j].split("=");
      if (parts.length >= 2) {
        params[parts[0]] = parts[1];
      } else
      if (j == 1) {
        params.value = parts[0]; // собственное значение
      }
    }
    var name = params["name"] || type;
    //console.log("params=",params );

    var ftype = type;
    var tp = obj.vz.getTypeInfo(ftype);
    var use_html = false;
    if (!tp) {
      use_html = true;
      ftype = "guinode-html.js";
      params["text"] = `<${ftype}/>`;
    }
    /*
    if (!tp) ftype = "gui2d-"+type;
    tp = obj.vz.getTypeInfo(ftype);
    if (!tp) ftype = "gui3-"+type;
    */

    var newopts = {
      type: ftype,
      name: name,
      parent: parent
    };
    //if (parent === g) newopts.parent_tree = "shadow"; // hehe
    var newobj = obj.vz.createObjByType(newopts);

    for (var k in params) {
      newobj.setParam(k, params[k]);
    }

    if (use_html) {
      for (var k in params) {
        newobj.dom.setAttribute(k, params[k]);
      }
    }

    return newobj;
  }

}

// https://stackoverflow.com/a/1418083
function trim(s) {
  //  return ( s || '' ).replace( /^\s+|\s+$/g, '' ); 
  return s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}

/////////////////////////////

export function tree_items( env ) {
  env.tree_items = () => { return get_tree_items(env) };
}

function get_tree_items(obj) {
  var names = {};
  var txt = "";
  obj.ns.traverse(function(co) {
    names[co.ns.name] = co;
    var nama = co.ns.name.replace(/[^a-zA-Z0-9_]/, "_");
    names[nama] = co;
  });
  return names;
}

