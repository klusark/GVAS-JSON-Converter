const {getStringByteSize} = require("../sav-writer");

class TextProperty {
    static PADDING = [0x00, 0x00, 0x00, 0x00];

    constructor(name, savReader) {
        this.name = name;
        this.type = "TextProperty";
        this.contentSize = savReader.readUInt32();
        this.padding = savReader.readUInt32();

        this.flags = savReader.readUInt32();
        this.unnk = savReader.readByte();
        this.variant = savReader.readByte();


        if (this.variant === 0) {
            this.value = savReader.readString();
            this.value2 = savReader.readString();
        } else if (this.variant === 3) {
            this.value = savReader.readBytes(this.contentSize-5);
        } else if (this.variant === 11) {
            this.value = savReader.readString();
            this.value2 = savReader.readString();
        } else {
            console.warn("Unsupported TextProperty variant: " + this.variant);
        }
    }

    getByteSize() {
        let size = getStringByteSize(this.name) +
            getStringByteSize(this.type) + 4 + 4 + 4 + 1 + 1;
        if (this.variant === 0) {
            size += getStringByteSize(this.value) + getStringByteSize(this.value2);
        } else if (this.variant === 3) {
            let hexstr = this.value.match(/../g).map((byte) => parseInt(byte, 16));
            size += hexstr.length;
        } else if (this.variant === 11) {
            size += getStringByteSize(this.value) + getStringByteSize(this.value2);
        }
        return size;
    }

    write(savWriter) {
        savWriter.writeString(this.name);
        savWriter.writeString(this.type);

        savWriter.writeUInt32(this.contentSize);
        savWriter.writeUInt32(this.padding);

        savWriter.writeUInt32(this.flags);

        savWriter.writeByte(this.unnk);
        savWriter.writeByte(this.variant);

        if (this.variant === 0) {
            savWriter.writeString(this.value);
            savWriter.writeString(this.value2);
        } else if (this.variant === 3) {
            savWriter.writeBytes(this.value);
        } else if (this.variant === 11) {
            savWriter.writeString(this.value);
            savWriter.writeString(this.value2);
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

module.exports = TextProperty;



