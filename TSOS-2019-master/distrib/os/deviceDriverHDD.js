var TSOS;
(function (TSOS) {
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnDiskDriverEntry;
            this.isr = this.krnDeviceDriverRequest;
            this.emptyDataset = [];
            for (let i = 0; i < 61; i++) {
                this.emptyDataset.push("00");
            }
        }
        krnDiskDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnDeviceDriverRequest() {
        }
        // FRONT END CALLS. ALL THE BELOW FUNCTIONS CAN BE CALLED BY OTHER PROGRAMS
        createFile(filename) {
            //Gets an empty File block
            let fileBlock = this.findEmptyBlock(0);
            let dataBlock = this.findEmptyBlock(1);
            let filenameArray = TSOS.Utils.stringToHexArray(filename);
            let fileData = this.createDataArray(fileBlock, 1, filenameArray);
            let dataData = this.createDataArray(dataBlock, 1, this.emptyDataset);
            this.setData(fileBlock, fileData);
            this.setData(dataBlock, dataData);
            TSOS.Control.updateHardDisk(fileBlock, this.getData(fileBlock).join(" "));
            TSOS.Control.updateHardDisk(dataBlock, this.getData(dataBlock).join(" "));
        }
        readFromBlockUsingFilename(filename) {
            let fileAddr = this.filenameSearch(filename);
            let dataAddr = this.getNext(fileAddr);
            // Check to see if this uses more than one data addr
            let secondaryAddr = this.getNext(dataAddr);
            if (secondaryAddr === "00:00:00") {
                // No secondary data, thank god
                // Get ONLY the data from the session storage. Simpler, easier to manipulate. and I don't have to cry about the first 4 bits.
                let dataBlock = this.getData(dataAddr);
                let storedString = TSOS.Utils.stringFromHexArray(dataBlock);
                _Console.putText(storedString);
            }
            else {
                // Calls recursive function
                let dataBlock = this.getData(dataAddr);
                this.readFromBlockUsingAddr(secondaryAddr, dataBlock);
            }
        }
        filenameSearch(filename) {
            // Convert filename to hex
            let hexFilename = TSOS.Utils.stringToHexArray(filename);
            // Search through all blocks. Slow? Yes. But simple? Absolutely. Power vs. Complexity tradeoff. Please don't take off points :)
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        // Sets tsb for each addr. I just prefer writing it out this way
                        let track = i;
                        let sector = j;
                        let block = k;
                        let addr = this.createAddr(track, sector, block);
                        //Check allocated bit first. It'll speed things up SLIGHTLY.
                        if (!this.checkAllocated(addr)) {
                            // Set default return to false
                            let isEqual = false;
                            // Get block data for the given addr
                            let blockData = sessionStorage.getItem(addr).split(" ");
                            // Loops through each item beyond the 4 base bits, checking to see if each item is equal to the indexically (not a word) equivalent value in the hexFileName
                            for (let i = 0; i < hexFilename.length; i++) {
                                // Checking if equal
                                if (blockData[i + 4] === hexFilename[i]) {
                                    isEqual = true;
                                }
                                else {
                                    isEqual = false;
                                }
                            }
                            // If equal, return true; Else, keep going loser.
                            if (isEqual === true) {
                                return addr;
                            }
                        }
                    }
                }
            }
        }
        writeIntoBlock(filename, data) {
            //Get the addr for the file block
            let fileAddr = this.filenameSearch(filename);
            //Convert string to data hex
            let dataArray = TSOS.Utils.stringToHexArray(data);
            //First, check if the data is too big for one block
            let dataLength = data.length;
            if (dataLength > 60) {
                //Get the original datablock
                //Split data at the 60th index
                //Assign first 60 values to the original datablock
                //Get a new empty block
                // Update the next for the first fileblock
                // Write extra data to new empty block
            }
            else {
                // Get data addr using fileAddr
                let dataAddr = this.getNext(fileAddr);
                // Set data in dataAddr
                this.setData(dataAddr, dataArray);
                this.updateVisuals(dataAddr);
            }
            // Next is read block
        }
        readFromBlockUsingAddr(addr, previousOutcomes) {
            // Gets and checks for the next address in line. 
            let nextAddr = this.getNext(addr);
            if (nextAddr === "00:00:00") {
                // Gets the data block for the original addr
                let dataBlock = this.getData(addr);
                previousOutcomes.concat(dataBlock);
                let output = TSOS.Utils.stringFromHexArray(previousOutcomes);
                _Console.putText(output);
            }
            else {
                // Again, sneaky little bit of recursion. Hopefully this saves me
                let dataBlock = this.getData(addr);
                previousOutcomes.concat(dataBlock);
                this.readFromBlockUsingAddr(nextAddr, previousOutcomes);
            }
        }
        // BACK END. USED BY DEVICE DRIVER FOR ABSTRACTION PURPOSES
        findEmptyBlock(trackSet = 0) {
            for (let j = 0; j < 8; j++) {
                for (let k = 0; k < 8; k++) {
                    // Checks each track / sector / block combo for the allocated bit, and when finding an unallocated spot, return it's addr
                    let track = trackSet;
                    let sector = j;
                    let block = k;
                    // Creates an addr from those three values
                    let addr = this.createAddr(track, sector, block);
                    // If unallocated, it'll return that addr
                    if (this.checkAllocated(addr)) {
                        return addr;
                    }
                }
            }
        }
        checkAllocated(addr) {
            let blockData = sessionStorage.getItem(addr).split(" ");
            if (blockData[3] === "00") {
                return true;
            }
            else {
                return false;
            }
        }
        createAddr(t, s, b) {
            return t + ":" + s + ":" + b;
        }
        breakdownAddr(addr) {
            return [addr[0], addr[2], addr[4]];
        }
        createDataArray(addr, allocated, data) {
            let addrArray = this.breakdownAddr(addr);
            let newData = addrArray[0] + " " + addrArray[1] + " " + addrArray[2] + " " + allocated + " " + data.join(" ");
            return newData.split(" ");
        }
        setData(addr, data) {
            let oldData = sessionStorage.getItem(addr).split(" ");
            for (let i = 0; i < data.length; i++) {
                oldData[i] = data[i];
            }
            sessionStorage.setItem(addr, oldData.join(" "));
        }
        getData(addr) {
            return sessionStorage.getItem(addr).split(" ");
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverHDD.js.map