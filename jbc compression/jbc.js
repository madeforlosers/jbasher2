const fs = require("fs");

t = [["create ", "C"], ["with ", "@"], ["type ", "#"], ["spawn ", "$"], ["set ", "%"], ["to ", "^"], ["add ", "&"], ["by ", "*"], ["subtract ", "("], ["multiply ", "],"], ["divide ", "-"], ["modulo ", "N"], ["if ", "_"], ["endif", "+"], ["ask ", "["], ["for ", "]"], ["input", "\\"], ["get ", "{"], ["item ", "}"], ["from ", "|"], ["at ", ";"], ["length ", "'"], ["of ", ":"], ["turn ", "M"], ["into ", ","], ["case ", "."], ["location ", "/"], ["inside ", "B"], ["parse ", "V"], ["as ", "?"], ["int", "`"], ["char", "~"], ["while ", "Q"], ["endwhile", "W"], ["repeat ", "E"], ["an ", "R"], ["amount ", "T"], ["times", "Y"], ["output ", "U"], ["inline ", "I"], ["random ", "O"], ["number", "P"], ["between ", "A"], ["and ", "S"], ["push ", "D"], ["change ", "F"], ["in ", "G"], ["index ", "H"]]


var file = fs.readFileSync("in.jb2", "utf8").split("\n").map(x => x.trim()).join("\n")

var state=(process.argv[2]=="decompress")
console.log(state)
for (j of t) {
    file = file.split(j[state*1]).join(j[!state*1])
}
fs.writeFileSync("out.jb2c", file, { flag: "w+" });