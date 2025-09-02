const fs = require("fs");
const { convertSavToJson, convertJsonToSav } = require("../../src/converter/converter");

const path = "./tests/converter/whole-files/";

function isEqualBytes(bytes1,bytes2) {
    if (bytes1.length !== bytes2.length) {
        return false;
    }
    for (let i = 0; i < bytes1.length; i++) {
        if (bytes1[i] !== bytes2[i]) {
            return false;
        }
    }
    return true;
}

test.each(fs.readdirSync(path))("%s", (name) => {

    const savArray = new Uint8Array(fs.readFileSync(path + name));
    const jsonString = convertSavToJson(savArray.buffer);
    const resultSavArray = convertJsonToSav(jsonString);
    const jsonString2 = convertSavToJson(resultSavArray.buffer);

    expect(jsonString).toEqual(jsonString2);

    expect(isEqualBytes(savArray, resultSavArray)).toEqual(true);
});
