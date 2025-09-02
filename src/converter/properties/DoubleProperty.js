const {getStringByteSize} = require("../sav-writer");

class DoubleProperty {
    static SIZE_EIGHT = [0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

    constructor(name, savReader) {
        this.name = name;
        this.type = "DoubleProperty";
        savReader.skipBytes(8); // contains value size

        this.hasGuid = savReader.readBoolean();
        if (this.hasGuid) {
            this.guid = savReader.readGuid();
        }

        this.value = savReader.readInt64();
    }

    getByteSize() {
        return getStringByteSize(this.name) + getStringByteSize(this.type) + 17 + (this.hasGuid ? 16 : 0);
    }

    write(savWriter) {
        savWriter.writeString(this.name);
        savWriter.writeString(this.type);
        savWriter.writeArray(DoubleProperty.SIZE_EIGHT);

        savWriter.writeBoolean(this.hasGuid);
        if (this.hasGuid) {
            savWriter.writeGuid(this.guid);
        }

        savWriter.writeInt64(this.value);
    }

    // backwards compatibility
    toBytes() {
        const SavWriter = require("../sav-writer");
        const savWriter = new SavWriter(this.getByteSize());
        this.write(savWriter);
        return savWriter.array;
    }
}

module.exports = DoubleProperty;
