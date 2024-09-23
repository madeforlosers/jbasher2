const fs = require("fs");
const ansi = require("m.easyansi");
const prompt = require("prompt-sync")();
const file = fs.readFileSync("test.jb2", "utf8").split("\n").map(x => x.trim());
const defaultState = { type: null, item: null, isConstant: true }; // this wont work for some reason. nodejs why are you like this :'c
var vars = {
    "that": {
        type: null,
        item: null,
        isConstant: true,
    }
};
var whileLayers = [];
var ifLayers = 0;
function throwError(number, im = -1) {
    console.log(
        `${ansi.colorTextMode(31)}!! ERROR ${number > 0 ? "IN FILE" : "IN INTERPRETER"}: ${ansi.colorTextMode(33)}${[
            "JAVASCRIPT ERROR",
            "TYPE MISMATCH",
            "VARIABLE IS NON-EXISTANT",
            "TEMP VARIABLE IS CLEARED",
            "NO MATCHING STATEMENT",
            "NUMBER OUT OF BOUNDS FOR COMMAND",
            "UNKNOWN VARIABLE TYPE",
            "VARIABLE DOES NOT EXIST",
            "CANNOT DETERMINE TYPE OF VARIABLE",
            "TRIED TO ESCAPE BOUNDS OF FILE",
            "DIVIDE BY 0",
        ][Math.abs(number)]} ${ansi.resetModes()} \n\n` +
        (im != -1 ?
            `At line ${im + 1}: \n${file[im]}`
            :
            `Line wasn't found.`)
    );
    process.exit();
}
function detectType(itemtemp) {
    let item = itemtemp.toString();
    if (item.match(/[0-9]+/g) != null) {
        return "number";
    }
    if (item.match(/[A-z\s\/\\]+/g) != null && item.includes("\"")) {
        return "string";
    }
    if (item.match(/[A-z]+/g) != null && !item.includes("\"")) {
        return "variable";
    }
    throwError(-8);
    return "undefined";
}
function detectTypeExcludeVariable(itemtemp) {
    let item = itemtemp.toString();
    if (item.match(/[0-9]+/g) != null) {
        return "number";
    }
    if (item.match(/[A-z]+/g) != null && item.includes("\"")) {
        return "string";
    }
    if (item.match(/[A-z]+/g) != null && !item.includes("\"")) {
        return vars[item].type;
    }
    throwError(-8);
    return "undefined";
}
function transformToUsable(item, keepQuotes = false, dontcleartemp = false) {
    if (detectType(item) == "variable") {
        let usableItemTemp = vars[item].item;
        if (item == "that" && !dontcleartemp) {
            vars.that = { type: null, item: null, isConstant: true };
        }
        return usableItemTemp;
    }
    if (detectType(item) == "string") {
        if (keepQuotes) {
            return item;
        }
        return item.split("\"").join("");
    }
    if (detectType(item) == "number") {
        return parseInt(item);
    }
    return item;
}
for (let i = 0; i < file.length; i++) {
    try {
        if (i >= file.length) {
            throwError(-9);
        }
        command = file[i];
        args = [];
        if (command.match(/^create \"?[0-9A-z]+\"? with type \w+$/gmi) != null) {
            let name = command.split("create ")[1].split(" with")[0];
            if (detectType(name) != "variable") {
                throwError(1, i);
            }
            let type = command.split("with type ")[1];
            if (!["number", "string"].includes(type)) {
                throwError(6, i);
            }
            vars[name] = { type: type, item: null, isConstant: false };
        }
        if (command.match(/^spawn \"?[0-9A-z]+\"?$/g)) {
            let item = command.split(/^spawn /g)[1];
            let type = detectTypeExcludeVariable(item);
            vars.that.type = type;
            vars.that.item = transformToUsable(item);
        }
        if (command.match(/^set \"?[0-9A-z\s\/\\]+\"? to \"?[0-9A-z]+\"?$/g) != null) {
            let item = command.split("set ")[1].split(" to")[0];
            let variableToSet = command.split(/^set \"?[0-9A-z\s\/\\]+\"? to /g)[1];
            if (item == "that" && vars[item].type == null) {
                throwError(3, i);
            }
            if (detectType(variableToSet) != "variable") {
                throwError(1, i);
            }
            if (vars[variableToSet] == undefined) {
                throwError(7, i);
            }
            if ((detectType(item) != vars[variableToSet].type && detectType(item) != "variable")) {
                throwError(1, i);
            }
            itemUsable = transformToUsable(item);
            vars[variableToSet].item = itemUsable;
        }
        if (command.match(/add \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null) {
            let first = command.split("add ")[1].split(" by")[0];
            let second = command.split("by ")[1];
            if (detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number") {
                throwError(1, i);
            }
            let mathed = transformToUsable(first, false, true) + transformToUsable(second, false, true);
            vars.that.type = "number";
            vars.that.item = mathed;
        }
        if (command.match(/subtract \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null) {
            let first = command.split("subtract ")[1].split(" by")[0];
            let second = command.split("by ")[1];
            if (detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number") {
                throwError(1, i);
            }
            let mathed = transformToUsable(first) - transformToUsable(second);
            vars.that.type = "number";
            vars.that.item = mathed;
        }
        if (command.match(/multiply \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null) {
            let first = command.split("multiply ")[1].split(" by")[0];
            let second = command.split("by ")[1];
            if (detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number") {
                throwError(1, i);
            }
            let mathed = transformToUsable(first) * transformToUsable(second);
            vars.that.type = "number";
            vars.that.item = mathed;
        }
        if (command.match(/divide \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null) {
            let first = command.split("divide ")[1].split(" by")[0];
            let second = command.split("by ")[1];
            if (detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number") {
                throwError(1, i);
            }
            if (transformToUsable(second, false, true) == 0) {
                throwError(10, i)
            }
            let mathed = transformToUsable(first) / transformToUsable(second);
            vars.that.type = "number";
            vars.that.item = mathed;
        }
        if (command.match(/modulo \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null) {
            let first = command.split("modulo ")[1].split(" by")[0];
            let second = command.split("by ")[1];
            if (detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number") {
                throwError(1, i);
            }
            let mathed = transformToUsable(first) % transformToUsable(second);
            vars.that.type = "number";
            vars.that.item = mathed;
        }
        if (command.match(/if \"?[0-9A-z]+\"?\s(\>\=?|\<\=?|\!\=|\=\=)\s\"?[0-9A-z]+\"?$/g) != null) {
            let compare1 = command.split("if ")[1].split(/\s(\>\=?|\<\=?|\!\=|\=\=)/g)[0];
            let compare2 = command.split(/(\>\=?|\<\=?|\!\=|\=\=)\s/g)[2];
            let comparator = command.match(/(\>\=?|\<\=?|\!\=|\=\=)/g)[0];
            let layers = 0;
            let j = i + 1;
            for (; file[j] != "endif" || layers != 0; j++) {
                if (j >= file.length) {
                    throwError(4, i);
                }
                if (file[j].split(" ")[0] == "if") {
                    layers += 1;
                }
                if (file[j] == "endif" && layers != 0) {
                    layers -= 1;
                }
            }
            if (eval(`!(${transformToUsable(compare1, true)}${comparator}${transformToUsable(compare2, true)})`)) {
                i = j;
                continue;
            } else {
                ifLayers++;
            }
        }
        if (command.match(/^ask for input$/g) != null) {
            vars.that.type = "string";
            vars.that.item = prompt(">");
        }
        if (command.match(/^get item from \"?[0-9A-z]+\"? at \"?[0-9A-z]+\"?$/g) != null) {
            let v = transformToUsable(command.split("get item from ")[1].split(" at ")[0], false, true);
            let at = transformToUsable(command.split(" at ")[1], false, true);
            if (typeof v != "string") {
                throwError(1, i);
            }
            if (typeof at != "number") {
                throwError(1, i);
            }
            vars.that.type = "string";
            vars.that.item = v[at];
        }
        if (command.match(/^get length of \"?[0-9A-z]+\"?$/g) != null) {
            let v = command.split("get length of ")[1];
            if (detectTypeExcludeVariable(v) != "string") {
                throwError(1, i);
            }
            vars.that.type = "number";
            vars.that.item = vars[v]["item"].length;
        }
        if (command.match(/^turn \"?[0-9A-z]+\"? into (upper|lower)case$/g) != null) {
            let v = transformToUsable(command.split("turn ")[1].split(" into")[0], false, true);
            let result = command.split("into ")[1];
            if (typeof v != "string") {
                throwError(1, i);
            }
            vars.that.type = "string";
            vars.that.item = result == "uppercase" ? v.toUpperCase() : v.toLowerCase();
        }
        if (command.match(/^get case of \"?[0-9A-z]+\"?$/g) != null) {
            let v = transformToUsable(command.split("get case of ")[1], false, true);
            if (typeof v != "string") {
                throwError(1, i);
            }
            vars.that.type = "string";
            if (v == v.toUpperCase()) {
                vars.that.item = "uppercase";
            } else if (v == v.toLowerCase()) {
                vars.that.item = "lowercase";
            } else {
                vars.that.item = "mixed";
            }
        }
        if (command.match(/^get location of \"?[0-9A-z]+\"? inside \"?[0-9A-z]+\"?$/g) != null) {
            let it = transformToUsable(command.split("location of ")[1].split(" inside")[0], false, true);
            let ins = transformToUsable(command.split("inside ")[1], false, true);
            if (typeof ins != "string") {
                throwError(1, i);
            }
            vars.that.type = "number";
            vars.that.item = ins.indexOf(it);
        }
        if (command.match(/^parse \"?[0-9A-z]+\"? as int$/g) != null) {
            let toInt = command.split("parse ")[1].split(" as int")[0];
            vars.that.type = "number";
            vars.that.item = parseInt(transformToUsable(toInt, false, true));
        }
        if (command.match(/^while \"?[0-9A-z]+\"?\s(\>\=?|\<\=?|\!\=|\=\=)\s\"?[0-9A-z]+\"?$/g) != null) {
            let compare1 = command.split("while ")[1].split(/\s(\>\=?|\<\=?|\!\=|\=\=)\s/g)[0];
            let compare2 = command.split(/(\>\=?|\<\=?|\!\=|\=\=)\s/g)[2];
            let comparator = command.match(/(\>\=?|\<\=?|\!\=|\=\=)/g)[0];
            let layers = 0;
            let j = i + 1;
            for (; file[j] != "endwhile" || layers != 0; j++) {
                if (j >= file.length) {
                    throwError(4, i);
                }
                if (file[j].split(" ")[0] == "while") {
                    layers += 1;
                }
                if (file[j] == "endwhile" && layers != 0) {
                    layers -= 1;
                }
            }
            if (whileLayers.length < 1 || whileLayers[whileLayers.length - 1][0] != i) {
                whileLayers.push([i, j]);
            }
            if (eval(`!(${transformToUsable(compare1)}${comparator}${transformToUsable(compare2)})`)) {
                i = j;
                whileLayers.pop();
                continue;
            }
        }
        if (command.match(/^endwhile$/g) != null) {
            if (whileLayers.length == 0) {
                throwError(4, i);
            }
            i = whileLayers[whileLayers.length - 1][0] - 1;
            continue;
        }
        if (command.match(/^get type of \"?[0-9A-z]+\"?$/g) != null) {
            let item = command.split("get type of ")[1];
            vars.that.type = "string";
            vars.that.item = `"${detectTypeExcludeVariable(item)}"`;
        }
        if (command.match(/^repeat \"?.+\"? an \"?[0-9A-z]+\"? amount of times$/g) != null) {
            let string = command.split(/^repeat\s/g)[1].split(/\san\s/g)[0];
            let amount = command.split(/an\s/g)[1].split(/\samount of times$/g)[0];
            if (transformToUsable(amount, false, true) < 0) {
                throwError(5, i);
            }
            vars.that.type = "string";
            vars.that.item = transformToUsable(string, false, true).repeat(transformToUsable(amount, false, true));
        }
        if (command.match(/^output\s((type|inline)\s)?\"?[0-9A-z\s]+\"?$/g) != null) {
            if (command.match(/^output type\s/g) != null) {
                console.log(detectTypeExcludeVariable(command.split(/^output type\s/g)[1]));
            } else if (command.match(/^output inline\s/g) != null) {
                let item = command.split(/^output inline\s/g)[1];
                process.stdout.write(transformToUsable(item));
            } else {
                let item = command.split(/^output /)[1];
                console.log(transformToUsable(item));
            }
        }
    } catch (e) {
        console.log(vars);
        console.log(e);
        throwError(0, i);
    }
}