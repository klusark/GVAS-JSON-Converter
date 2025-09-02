class StructProperty {
    static padding = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    type = "StructProperty";

    constructor(name, savReader) {
        this.name = name;
        const contentSize = savReader.readUInt32();
        savReader.skipBytes(4); // padding
        this.subtype = savReader.readString();

        this.guid = savReader.readBytes(16);
        savReader.skipBytes(1);

        const contentEndPosition = savReader.offset + contentSize;

        if (this.subtype === "Guid") {
            this.value = savReader.readBytes(16);
            return this;
        }

        if (this.subtype === "DateTime") {
            this.value = savReader.readInt64();
            return this;
        }

        if (this.subtype === "Vector2D") {
            this.value = "(" + savReader.readFloat64() + "/" + savReader.readFloat64() + ")";
            return this;
        }

        if (this.subtype === "Quat") {
            let x = savReader.dataView.getFloat64(savReader.offset, true);
            let ix = savReader.readInt64();
            let y = savReader.dataView.getFloat64(savReader.offset, true);
            let iy = savReader.readInt64();
            let z = savReader.dataView.getFloat64(savReader.offset, true);
            let iz = savReader.readInt64();
            let w = savReader.dataView.getFloat64(savReader.offset, true);
            let iw = savReader.readInt64();
            this.value = {x:x, y:y, z:z, w:w, ix:ix, iy:iy, iz:iz, iw:iw};
            return this;
        }

        if (this.subtype === "Vector") {
            let x = savReader.readFloat64();
            let y = savReader.readFloat64();
            let z = savReader.readFloat64();
            this.value = {x:x, y:y, z:z};
            return this;
        }

        if (this.subtype === "LinearColor") {
            this.value = savReader.readBytes(16);
            return this;
        }

        if (this.subtype === "Rotator") {
            this.value = savReader.readBytes(24);
            return this;
        }

        this.value = [];

        while (savReader.offset < contentEndPosition) {
            this.value.push(savReader.readProperty(true));
        }
    }

    toBytes() {
        const {writeString, writeUint32, writeInt64, writeFloat64, writeBytes} = require("../value-writer");
        const {assignPrototype} = require("../converter");

        if (this.subtype === "Guid") {
            return new Uint8Array([
                ...writeString(this.name),
                ...writeString(this.type),
                ...writeUint32(16),
                ...StructProperty.padding,
                ...writeString("Guid"),
                ...writeBytes(this.guid + "00"),
                ...writeBytes(this.value)
            ]);
        }

        if (this.subtype === "DateTime") {
            return new Uint8Array([
                ...writeString(this.name),
                ...writeString(this.type),
                ...writeUint32(8),
                ...StructProperty.padding,
                ...writeString("DateTime"),
                ...writeBytes(this.guid + "00"),
                ...writeInt64(this.value)
            ]);
        }

        if (this.subtype === "Vector2D") {
            const vector = this.value.slice(1, -1).split("/");
            const x = vector[0];
            const y = vector[1];

            return new Uint8Array([
                ...writeString(this.name),
                ...writeString(this.type),
                ...writeUint32(16),
                ...StructProperty.padding,
                ...writeString("Vector2D"),
                ...writeBytes(this.guid + "00"),
                ...writeFloat64(x),
                ...writeFloat64(y)
            ]);
        }

        if (this.subtype === "Vector") {
            return new Uint8Array([
                ...writeString(this.name),
                ...writeString(this.type),
                ...writeUint32(24),
                ...StructProperty.padding,
                ...writeString("Vector"),
                ...writeBytes(this.guid + "00"),
                ...writeFloat64(this.value.x),
                ...writeFloat64(this.value.y),
                ...writeFloat64(this.value.z)
            ]);
        }

        if (this.subtype === "Quat") {
            return new Uint8Array([
                ...writeString(this.name),
                ...writeString(this.type),
                ...writeUint32(32),
                ...StructProperty.padding,
                ...writeString("Quat"),
                ...writeBytes(this.guid + "00"),
                ...writeInt64(this.value.ix),
                ...writeInt64(this.value.iy),
                ...writeInt64(this.value.iz),
                ...writeInt64(this.value.iw)
            ]);
        }

        if (this.subtype === "LinearColor") {
            return new Uint8Array([
                ...writeString(this.name),
                ...writeString(this.type),
                ...writeUint32(16),
                ...StructProperty.padding,
                ...writeString("LinearColor"),
                ...writeBytes(this.guid + "00"),
                ...writeBytes(this.value)
            ]);
        }

        if (this.subtype === "Rotator") {
            return new Uint8Array([
                ...writeString(this.name),
                ...writeString(this.type),
                ...writeUint32(24),
                ...StructProperty.padding,
                ...writeString("Rotator"),
                ...writeBytes(this.guid + "00"),
                ...writeBytes(this.value)
            ]);
        }

        let contentBytes = new Uint8Array(0);

        for (let i = 0; i < this.value.length; i++) {

            if (Array.isArray(this.value[i])) {

                for (let j = 0; j < this.value[i].length; j++) {
                    contentBytes = new Uint8Array([...contentBytes, ...assignPrototype(this.value[i][j]).toBytes()]);
                }

            } else {
                contentBytes = new Uint8Array([...contentBytes, ...assignPrototype(this.value[i]).toBytes()]);
            }
        }

        return new Uint8Array([
            ...writeString(this.name),
            ...writeString(this.type),
            ...writeUint32(contentBytes.length),
            ...StructProperty.padding,
            ...writeString(this.subtype),
            ...writeBytes(this.guid + "00"),
            ...contentBytes
        ]);
    }
}

module.exports = StructProperty;
