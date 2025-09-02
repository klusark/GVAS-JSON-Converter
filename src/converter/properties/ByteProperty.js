const {getStringByteSize} = require("../sav-writer");

class ByteProperty {

    constructor(name, savReader) {
        this.name = name;
        this.type = "ByteProperty";
        this.unknown = savReader.readInt32(); // contains UNKNOWN
        this.unknown2 = savReader.readInt32();

        this.subtype = savReader.readString();

        this.hasGuid = savReader.readBoolean();
        if (this.hasGuid) {
            this.guid = savReader.readGuid();
        }

        this.subtype2 = null;

        if (this.unknown != 1) {
            this.subtype2 = savReader.readString();
        } else {
            this.value = savReader.readByte();
        }
    }

    getByteSize() {
        let size =  getStringByteSize(this.name) +
            getStringByteSize(this.subtype) + 26 + this.unknown +
            (this.hasGuid ? 16 : 0);

        /*if (this.subtype2) {
            size += getStringByteSize(this.subtype2);
        }*/
        return size;
    }

    write(savWriter) {
        savWriter.writeString(this.name);
        savWriter.writeString(this.type);
        savWriter.writeInt32(this.unknown);
        savWriter.writeInt32(this.unknown2);
        savWriter.writeString(this.subtype);

        savWriter.writeBoolean(this.hasGuid);
        if (this.hasGuid) {
            savWriter.writeGuid(this.guid);
        }

        //savWriter.writeByte(this.value);

        if (this.subtype2) {
            savWriter.writeString(this.subtype2);
        } else {
            savWriter.writeByte(this.value);
        }
    }

    // backwards compatibility
    toBytes() {
        const SavWriter = require("../sav-writer");
        const savWriter = new SavWriter(this.getByteSize());
        this.write(savWriter);
        return savWriter.array;
    }
}

module.exports = ByteProperty;
