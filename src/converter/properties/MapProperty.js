const NoneProperty = require("./NoneProperty");

class MapProperty {
    static padding = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    type = "MapProperty";

    constructor(name, savReader, inStruct) {
        this.name = name;
        const contentSize = savReader.readUInt32(); // contentSize
        const padding = savReader.readUInt32(); // padding
        this.keyType = savReader.readString();
        this.valueType = savReader.readString();
        const bit = savReader.readBoolean();

        const tempMap = new Map();
        const padding2 = savReader.readUInt32(); // padding
        const contentCount = savReader.readUInt32();


        for (let i = 0; i < contentCount; i++) {

            let currentKey = null;
            let currentValue = null;

            switch (this.keyType) {
                case "StructProperty":
                    if (savReader.saveGameVersion == 3 && (inStruct || this.valueType == "ObjectProperty")) {
                        this.weirdFormat = true
                        currentKey = [];
                        let prop = null;

                        while (!(prop instanceof NoneProperty)) {
                            prop = savReader.readProperty();
                            currentKey.push(prop);
                        }
                        break;
                    } else {
                        currentKey = savReader.readBytes(16);
                    }
                    break;

                case "IntProperty":
                    currentKey = savReader.readInt32();
                    break;

                case "StrProperty":
                    currentKey = savReader.readString();
                    break;
                case "NameProperty":
                    currentKey = savReader.readString();
                    break;
                case "ByteProperty":
                    currentKey = savReader.readString();
                    break;
                default:
                    throw new Error("Key Type not implemented: " + this.keyType);
            }

            switch (this.valueType) {

                case "StructProperty":
                    currentValue = [];
                    let prop = null;

                    while (!(prop instanceof NoneProperty)) {
                        prop = savReader.readProperty();
                        currentValue.push(prop);
                    }
                    break;

                case "IntProperty":
                    currentValue = savReader.readInt32();
                    break;

                case "FloatProperty":
                    currentValue = savReader.readFloat32();
                    break;

                case "BoolProperty":
                    currentValue = savReader.readBoolean();
                    break;

                case "StrProperty":
                    currentValue = savReader.readString();
                    break;

                case "DoubleProperty":
                    currentValue = savReader.readInt64();
                    break;

                case "ObjectProperty":
                    currentValue = savReader.readString();
                    break;

                default:
                    throw new Error("Value Type not implemented: " + this.valueType);
            }

            tempMap.set(currentKey, currentValue);

        }

        this.value = Array.from(tempMap.entries());
    }

    toBytes() {
        const {writeBytes, writeInt32, writeFloat32, writeString, writeUint32, writeInt64} = require("../value-writer");
        const {assignPrototype} = require("../converter");

        let byteArrayContent = new Uint8Array(0);

        const tempMap = new Map(this.value);

        let toConcat = [];

        for (let [currentKey, currentValue] of tempMap) {

            switch (this.keyType) {
                case "StructProperty":
                    if (this.weirdFormat) {
                        for (let i = 0; i < currentKey.length; i++) {
                            toConcat.push(assignPrototype(currentKey[i]).toBytes());
                            //byteArrayContent = new Uint8Array([...byteArrayContent, ...assignPrototype(currentValue[i]).toBytes()]);
                        }
                    break;
                    } else {
                        toConcat.push(writeBytes(currentKey));
                    }
                    //byteArrayContent = new Uint8Array([...byteArrayContent, ...writeBytes(currentKey)]);
                    break;

                case "IntProperty":
                    toConcat.push(writeInt32(currentKey));
                    //byteArrayContent = new Uint8Array([...byteArrayContent, ...writeInt32(currentKey)]);
                    break;

                case "StrProperty":
                    toConcat.push(writeString(currentKey));
                    //byteArrayContent = new Uint8Array([...byteArrayContent, ...writeString(currentKey)]);
                    break;

                case "NameProperty":
                    toConcat.push(writeString(currentKey));
                    //byteArrayContent = new Uint8Array([...byteArrayContent, ...writeString(currentKey)]);
                    break;

                case "ByteProperty":
                    toConcat.push(writeString(currentKey));
                    //byteArrayContent = new Uint8Array([...byteArrayContent, ...writeString(currentKey)]);
                    break;

                default:
                    throw new Error("Key Type not implemented: " + this.keyType);
            }

            switch (this.valueType) {

                case "StructProperty":
                    for (let i = 0; i < currentValue.length; i++) {
                        toConcat.push(assignPrototype(currentValue[i]).toBytes());
                        //byteArrayContent = new Uint8Array([...byteArrayContent, ...assignPrototype(currentValue[i]).toBytes()]);
                    }
                    break;

                case "IntProperty":
                    toConcat.push(writeInt32(currentValue));
                    //byteArrayContent = new Uint8Array([...byteArrayContent, ...writeInt32(currentValue)]);
                    break;

                case "FloatProperty":
                    toConcat.push(writeFloat32(currentValue));
                    //byteArrayContent = new Uint8Array([...byteArrayContent, ...writeFloat32(currentValue)]);
                    break;

                case "StrProperty":
                    toConcat.push(writeString(currentValue));
                    //byteArrayContent = new Uint8Array([...byteArrayContent, ...writeString(currentValue)]);
                    break;

                case "BoolProperty":
                    if (currentValue === true) {
                        toConcat.push(new Uint8Array([0x01]));
                        //byteArrayContent = new Uint8Array([...byteArrayContent, 0x01]);
                    } else {
                        toConcat.push(new Uint8Array([0x00]));
                        //byteArrayContent = new Uint8Array([...byteArrayContent, 0x00]);
                    }
                    break;

                case "DoubleProperty":
                    toConcat.push(writeInt64(currentValue));
                    break;

                case "ObjectProperty":
                    toConcat.push(writeString(currentValue));
                    break;

                default:
                    throw new Error("Value Type not implemented: " + this.valueType);
            }

        }

        let totalLength = 0;
        toConcat.forEach(arr => {
            totalLength += arr.length;
        });
        byteArrayContent = new Uint8Array(totalLength);

        let offset = 0;
        toConcat.forEach(arr => {
            byteArrayContent.set(arr, offset);
            offset += arr.length;
        });

        return new Uint8Array([
            ...writeString(this.name),
            ...writeString(this.type),
            ...writeUint32(4 + 4 + byteArrayContent.length),
            ...MapProperty.padding,
            ...writeString(this.keyType),
            ...writeString(this.valueType),
            ...MapProperty.padding,
            0x00,
            ...writeUint32(tempMap.size),
            ...byteArrayContent
        ]);
    }
}

module.exports = MapProperty;
