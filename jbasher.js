const fs = require("fs");
const ansi = require("m.easyansi");
const file = fs.readFileSync("test.jb2","utf8").replace(/^\s+/gm,"").split(/[[:blank:]]{3,}/gm).join("").split("\n");

const defaultState = {type:null,item:null,isConstant:true}; // this wont work for some reason. nodejs why are you like this :'c
var vars = {
    "that": {
        type:null,
        item:null,
        isConstant:true,
    }
};

var whileLayers = [];
var spawn;
function throwError(number,im=-1){
    console.log(
        `${ansi.colorTextMode(31)}!! ERROR ${number > 0 ? "IN FILE" : "IN INTERPRETER"}: ${ansi.colorTextMode(33)}${[
            "JAVASCRIPT ERROR",
            "TYPE MISMATCH",
            "VARIABLE IS NON-EXISTANT",
            "TEMP VARIABLE IS CLEARED",
            "NO MATCHING STATEMENT"
        ][Math.abs(number)]} ${ansi.resetModes()} \n\n` +

        (im != -1?
        `At line ${im+1}: \n${file[im]}`
        :
        `Line wasn't found.`)
    )
    process.exit();
}


function detectType(itemtemp){
   // console.log("DETECT TYPE: ",itemtemp)
    let item = itemtemp.toString();
    if(item.match(/[0-9]+/g) != null){
        return "number"
    }
    if(item.match(/[A-z]+/g)!= null && item.includes("\"")){
        return "string";
    }
    if(item.match(/[A-z]+/g) != null && !item.includes("\"")){
        return "variable"
    }
    return "undefined"
}
function detectTypeExcludeVariable(itemtemp){
// console.log("DETECT TYPE: ",itemtemp)
    let item = itemtemp.toString();
    if(item.match(/[0-9]+/g) != null){
        return "number"
    }
    if(item.match(/[A-z]+/g)!= null && item.includes("\"")){

        return "string";
    }
    if(item.match(/[A-z]+/g) != null && !item.includes("\"")){
        return vars[item].type
    }
    return "undefined"
}
function transformToUsable(item,keepQuotes=false){
    if(detectType(item) == "variable"){
        let usableItemTemp = vars[item]["item"];
        if(item == "that"){
            vars["that"] = {type:null,item:null,isConstant:true};
        }
        return usableItemTemp;
    } 
    if(detectType(item) == "string"){
        if(keepQuotes){
            return item;
        }
        return item.split("\"").join("");
    }
    if(detectType(item) == "number"){
        return parseInt(item);
    }
    return item;
}

for(let i = 0; i < file.length; i++){
    command = file[i];
    args = [];
    //console.log(command.match(/^create variable \"?[0-9A-z]+\"? with type \w+$/gmi))
    if(command.match(/^create \"?[0-9A-z]+\"? with type \w+$/gmi) != null){
        let name = command.split("create ")[1].split(" with")[0];
        if(detectType(name) != "variable"){
            throwError(1,i)
        }
        let type = command.split("with type ")[1];
        vars[name] = {type:type,item:null,isConstant:false};
    }
    if(command.match(/^spawn \"?[0-9A-z]+\"?$/g)){
        let item = command.split(/^spawn /g)[1];
        let type = detectTypeExcludeVariable(item)
        vars.that.type = type;
        vars.that.item = transformToUsable(item);
    }
    if(command.match(/^set \"?[0-9A-z]+\"? to \"?[0-9A-z]+\"?$/g) != null){
        let item = command.split("set ")[1].split(" to")[0];
        let variableToSet = command.split(/^set \"?[0-9A-z]+\"? to /g)[1];
        if(item == "that" && vars[item].type == null){
            throwError(3,i);
        }
        if(detectType(variableToSet) != "variable"){
            throwError(1,i);
        }
        if((detectType(item) != vars[variableToSet].type && detectType(item) != "variable")){
            throwError(1,i);
        }
        //console.log(variableToSet)
        itemUsable = transformToUsable(item);
        vars[variableToSet]["item"] = itemUsable;
    }
    if(command.match(/add \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null){
        let first = command.split("add ")[1].split(" by")[0];
        let second = command.split("by ")[1];
        if(detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number"){
            throwError(1,i);
        }
        let mathed = transformToUsable(first) + transformToUsable(second);
        vars.that.type = "number";
        vars.that.item = mathed;
    }
    if(command.match(/subtract \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null){
        let first = command.split("subtract ")[1].split(" by")[0];
        let second = command.split("by ")[1];
        if(detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number"){
            throwError(1,i);
        }
        let mathed = transformToUsable(first) - transformToUsable(second);
        vars.that.type = "number";
        vars.that.item = mathed;
    }
    if(command.match(/multiply \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null){
        let first = command.split("multiply ")[1].split(" by")[0];
        let second = command.split("by ")[1];
        if(detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number"){
            throwError(1,i);
        }
        let mathed = transformToUsable(first) * transformToUsable(second);
        vars.that.type = "number";
        vars.that.item = mathed;
    }
    if(command.match(/divide \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null){
        let first = command.split("divide ")[1].split(" by")[0];
        let second = command.split("by ")[1];
        if(detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number"){
            throwError(1,i);
        }
        let mathed = transformToUsable(first) / transformToUsable(second);
        vars.that.type = "number";
        vars.that.item = mathed;
    }
    if(command.match(/modulo \"?[0-9A-z]+\"? by \"?[0-9A-z]+\"?$/g) != null){
        let first = command.split("modulo ")[1].split(" by")[0];
        let second = command.split("by ")[1];
        if(detectTypeExcludeVariable(first) != "number" || detectTypeExcludeVariable(second) != "number"){
            throwError(1,i);
        }
        let mathed = transformToUsable(first) % transformToUsable(second);
        vars.that.type = "number";
        vars.that.item = mathed;
    }
    if(command.match(/if \"?[0-9A-z]+\"?\s(\>\=?|\<\=?|\!\=|\=\=)\s\"?[0-9A-z]+\"?$/g) != null){
        let compare1 = command.split("if ")[1].split(/\s(\>\=?|\<\=?|\!\=|\=\=)/g)[0];
        let compare2 = command.split(/(\>\=?|\<\=?|\!\=|\=\=)\s/g)[2];
        let comparator = command.match(/(\>\=?|\<\=?|\!\=|\=\=)/g)[0];
        //console.log(compare1,compare2)
        let layers = 0;
        let j = i+1;
        for(; file[j] != "endif" && layers == 0; j++){
            
            if(file[j].split(" ")[0] == "if"){
                layers += 1;
            }
            if(file[j] == "endif" && layers != 0){
                layers -= 1;
            }
        }
        if(eval(`!(${transformToUsable(compare1,true)}${comparator}${transformToUsable(compare2,true)})`)){
            i = j;
            continue;
        }
    }
    if(command.match(/^while \"?[0-9A-z]+\"?\s(\>\=?|\<\=?|\!?\=)\s\"?[0-9A-z]+\"?$/g) != null){
        let compare1 = command.split("while ")[1].split(/\s(\>\=?|\<\=?|\!?\=)\s/g)[0];
        let compare2 = command.split(/(\>\=?|\<\=?|\!?\=)\s/g)[2];
        let comparator = command.match(/(\>\=?|\<\=?|\!?\=)/g)[0];
        //console.log("while",compare1,compare2)
        let layers = 0;
        let j = i+1;
        for(; file[j] != "endwhile" && layers == 0; j++){
            
            if(file[j].split(" ")[0] == "while"){
                layers += 1;
            }
            if(file[j] == "endwhile" && layers != 0){
                layers -= 1;
            }
        }
        if(whileLayers[whileLayers.length-1] != [i,j]){
            whileLayers.push([i,j])
        }
        
        if(eval(`!(${transformToUsable(compare1)}${comparator}${transformToUsable(compare2)})`)){
            i = j;
            whileLayers.pop();
            continue;
        }
    }
    if(command.match(/^endwhile$/g) != null){
        if(whileLayers.length == 0){
            throwError(4,i)
        }
        i = whileLayers[whileLayers.length-1][0]-1;
        //console.log(file[i])
        continue;
    }
    if(command.match(/^get type of \"?[0-9A-z]+\"?$/g) != null){
        let item = command.split("get type of ")[1];
        vars.that.type = "string";
        vars.that.item = detectTypeExcludeVariable(item);
    }
    if(command.match(/^output(\stype)?\s\"?[0-9A-z\s]+\"?$/g) != null){
        if(command.includes("output type")){
            console.log(detectType(command.split("output type ")[1]))
        }else{
            let item = command.split(/^output /)[1]
            console.log(transformToUsable(item))
        }

    }
    
}

console.log(vars);