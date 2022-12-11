var TSOS;
(function (TSOS) {
    class DSDD {
        constructor() {
        }
        createEmptyDataset() {
            let set = ["0", "0", "0", "0"];
            let i = 0;
            while (i < 64) {
                set.push("--");
                i++;
            }
            return set;
        }
        createAddr(t, s, b) {
            return t + ":" + s + ":" + b;
        }
        getTSB(addr) {
            alert(addr);
            let t = addr[0];
            let s = addr[2];
            let b = addr[4];
            return [t, s, b];
        }
        createDataArray(data) {
            let set = data.split(" ");
            return set;
        }
        format() {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        let addr = i + ":" + j + ":" + k;
                        let dataset = this.createEmptyDataset();
                        sessionStorage.setItem(addr, dataset.join(" "));
                        TSOS.Control.updateHardDisk(addr, sessionStorage.getItem(addr));
                    }
                }
            }
        }
        create(filename) {
            let hexArray = TSOS.Utils.stringToHexArray(filename);
            let fileblock = this.findEmptyBlock();
            let writeblock = this.findEmptyBlock();
            if (fileblock === "" || writeblock === "") {
                _Kernel.krnTrace("No space availible. Please delete before continuing to add.");
            }
            else {
                let filedata = this.updateData(hexArray, writeblock, "1");
                sessionStorage.setItem(fileblock, filedata.join(" "));
                TSOS.Control.updateHardDisk(fileblock, filedata.join(" "));
                let writedata = this.updateData([], '*:*:*', "1");
                sessionStorage.setItem(writeblock, writedata.join(" "));
                TSOS.Control.updateHardDisk(writeblock, writedata.join(" "));
            }
        }
        updateData(hexArray, writeaddr, allocation) {
            let newData = this.createEmptyDataset();
            let tsb = this.getTSB(writeaddr);
            newData[0] = tsb[0];
            newData[1] = tsb[1];
            newData[2] = tsb[2];
            newData[3] = allocation;
            if (hexArray.length != 0) {
                for (let i = 0; i < hexArray.length; i++) {
                    newData[i + 4] = hexArray[i];
                }
            }
            return newData;
        }
        findEmptyBlock() {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        let addr = this.createAddr(i, j, k);
                        let block = sessionStorage.getItem(addr).split(" ");
                        if (block[3] === "0") {
                            // This is only temporary, otherwise the next find would overwrite this one during a create.
                            sessionStorage.setItem(addr, this.updateData([], "*.*.*", "1").join(" "));
                            return addr;
                        }
                        else if (block[3] === "1" && i === 3 && j === 7 && k === 7) {
                            return "";
                        }
                    }
                }
            }
        }
    }
    TSOS.DSDD = DSDD;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=DSDD.js.map