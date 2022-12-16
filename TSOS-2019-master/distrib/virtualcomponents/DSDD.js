var TSOS;
(function (TSOS) {
    class DSDD extends TSOS.DeviceDriver {
        constructor() {
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
        createFile(filename) {
            // Gets a new empty file block, and sets it's allocation to 1.
            let newBlockAddr = this.findEmptyBlock(0);
            this.setAllocated(newBlockAddr, "01");
            // Gets a new empty data block, and sets it's allocation to 1.
            let dataBlockAddr = this.findEmptyBlock(1);
            this.setAllocated(dataBlockAddr, "01");
            // Sets the next values for the newBlockAddr to connect it to the dataBlockAddr
            this.setNext(newBlockAddr, dataBlockAddr);
            //Converts the filename into a hex array
            let hexFilename = TSOS.Utils.stringToHexArray(filename);
            // Sets the filename data to the newBlockAddr
            this.setData(newBlockAddr, hexFilename);
            this.setData(dataBlockAddr, []);
            //Updates visuals
            this.updateVisuals(newBlockAddr);
            this.updateVisuals(dataBlockAddr);
            // This should complete file creation. Next is writing
        }
        writeInSwapBlock(filename, data) {
            try {
                //Get the addr for the file block
                let fileAddr = this.filenameSearch(filename);
                //First, check if the data is too big for one block
                let dataLength = data.length;
                // if(dataLength > 60){
                //     //Get the original datablock
                //     let dataAddr = this.getNext(fileAddr);
                //     this.writeMultiples(dataAddr, data);
                // } else {
                // Get data addr using fileAddr
                let dataAddr = this.getNext(fileAddr);
                // Set data in dataAddr
                this.setData(dataAddr, data);
                this.updateVisuals(dataAddr);
            }
            catch (e) {
                alert(" ERROR IN WRITESWAPBLOCK " + e);
            }
        }
        writeMultiples(addr, data) {
            try {
                // Get first 60 values to go in existing block
                let firstSixty = data.slice(0, 61);
                // Get next 60 to go into next block
                let restArray = data.slice(61, data.length);
                // Check if rest array  > 60
                if (restArray.length > 60) {
                    //Get new block
                    let newBlock = this.findEmptyBlock();
                    // Set next on prev to new block
                    this.setNext(addr, newBlock);
                    // Set allocated on prev to 01
                    this.setAllocated(addr, "01");
                    // Set data on prev to firstSixty
                    this.setData(addr, firstSixty);
                    // Call again to cycle through and repeat
                    this.writeMultiples(newBlock, restArray);
                }
                else {
                    //Get new block
                    let newBlock = this.findEmptyBlock();
                    // Set next on previous block to new block
                    this.setNext(addr, newBlock);
                    // Set allocated on prev to 01
                    this.setAllocated(addr, "01");
                    // Set data on prev to firstSixty
                    this.setData(addr, firstSixty);
                    // Set allocated on new block to 01
                    this.setAllocated(newBlock, "01");
                    // Set data on new block to restArray
                    this.setData(newBlock, restArray);
                }
            }
            catch (e) {
                alert(" ERROR WHEN WRITING MUTLIPLES " + e);
            }
        }
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
        writeIntoBlock(filename, data) {
            //Get the addr for the file block
            let fileAddr = this.filenameSearch(filename);
            //Convert string to data hex
            let dataArray = TSOS.Utils.stringToHexArray(data);
            //First, check if the data is too big for one block
            let dataLength = data.length;
            if (dataLength > 4000) {
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
        listFiles() {
            let list = [];
            for (let j = 0; j < 8; j++) {
                for (let k = 0; k < 8; k++) {
                    let addr = this.createAddr(0, j, k);
                    let data = sessionStorage.getItem(addr).split(" ");
                    if (this.getNext(addr) === "00:00:00") {
                        //ignore
                    }
                    else {
                        list.push(this.getFileName(data).join(""));
                    }
                }
            }
            return list;
        }
        getFileName(data) {
            let nameArray = [];
            for (let i = 4; i < data.indexOf("00"); i++) {
                nameArray.push(String.fromCharCode(parseInt(data[i], 16)));
            }
            return nameArray;
        }
        deleteFile(filename) {
            try {
                // This is just to call a possibly recursive function
                let fileAddr = this.filenameSearch(filename);
                this.deleteBlock(fileAddr);
            }
            catch (e) {
                alert("DELETE ERROR " + e);
            }
        }
        deleteBlock(addr) {
            try {
                // Get the address for the next included block.
                let dataAddr = this.getNext(addr);
                //Check if that blocks also got a block
                let secondaryAddr = this.getNext(dataAddr);
                if (secondaryAddr === "00:00:00") {
                    // Clear both filename and data storage
                    sessionStorage.setItem(addr, this.emptyDataset.join(" "));
                    sessionStorage.setItem(dataAddr, this.emptyDataset.join(" "));
                    // Update visuals
                    // this.updateVisuals(addr);
                    // this.updateVisuals(dataAddr);
                }
                else {
                    // Clear the first filename storage
                    sessionStorage.setItem(addr, this.emptyDataset.join(" "));
                    // Update visuals
                    this.updateVisuals(addr);
                    // Ooo la la ain't this a bit of fancy recursion? nice.
                    this.deleteBlock(dataAddr);
                }
            }
            catch (e) {
                alert("DELETE BLOCK ERROR " + e);
            }
        }
        renameFile(filename, newname) {
            //Get file address
            let fileAddr = this.filenameSearch(filename);
            // Converrt new name to hex
            let newNameHex = TSOS.Utils.stringToHexArray(newname);
            // Set file name in data
            this.setData(fileAddr, newNameHex);
            // Update visuals
            this.updateVisuals(fileAddr);
        }
        copyFile(filename) {
            //Find the file
            let originalFileAddr = this.filenameSearch(filename);
            let originalDataAddr = this.getNext(originalFileAddr);
            let originalDataData = this.getData(originalDataAddr);
            this.createFile(filename + 1);
            this.writeInSwapBlock(filename + 1, originalDataData);
        }
        createAddr(t, s, b) {
            return t + ":" + s + ":" + b;
        }
        breakdownAddr(addr) {
            return [addr[0], addr[2], addr[4]];
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
        setAllocated(addr, value) {
            // gets block, sets it's third data byte as 1;
            let blockData = sessionStorage.getItem(addr).split(" ");
            blockData[3] = value;
            // Set value again
            sessionStorage.setItem(addr, blockData.join(" "));
        }
        getNext(addr) {
            try {
                // gets the block
                let newblockData = sessionStorage.getItem(addr);
                if (newblockData === null) {
                    return this.createAddr("00", "00", "00");
                }
                else {
                    let blockData = newblockData.split(" ");
                    // sets t based on blocks first data value
                    let t = blockData[0];
                    // sets s based on blocks second data value
                    let s = blockData[1];
                    // sets b based on blocks third data value
                    let b = blockData[2];
                    // returns a created addr of the three previously set values
                    return this.createAddr(t, s, b);
                }
            }
            catch (error) {
                alert("ERROR IN GET NEXT " + error);
            }
        }
        setNext(addr, nextAddr) {
            // gets the block
            let blockData = sessionStorage.getItem(addr).split(" ");
            // breaks down the addr to be assigned into it's tsb values
            let brokenAddr = this.breakdownAddr(nextAddr);
            //assigns the first 3 bytes to the next tsb values
            blockData[0] = brokenAddr[0];
            blockData[1] = brokenAddr[1];
            blockData[2] = brokenAddr[2];
            // sets it in the sessionstorage
            sessionStorage.setItem(addr, blockData.join(" "));
            this.updateVisuals(addr);
        }
        getData(addr) {
            try {
                //Honestly, this really doesn't need to be a function. But it cuts down on overt complexities. So I feel better about it.
                let dataBlock = sessionStorage.getItem(addr).split(" ");
                // Slices out the unneeded first 4 bits. For a read, this should be fine. Otherwise, just call sessionStorage.get, as it'll just give you the entire dataset
                return dataBlock.slice(4);
            }
            catch (e) {
                alert("FAILURE RETRIEVING DATA " + e);
            }
        }
        setData(addr, dataset) {
            // Gets the block data
            let blockData = sessionStorage.getItem(addr).split(" ");
            // Takes the values from the dataset, and sets the corresponding values in the block offset by 4 indexes
            for (let i = 0; i < dataset.length; i++) {
                blockData[i + 4] = dataset[i];
            }
            // Re-sets it back into storage
            sessionStorage.setItem(addr, blockData.join(" "));
        }
        initializeBlocks() {
            // Loops through every single block, setting all to the empty dataset described in the constructor
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        let track = i;
                        let sector = j;
                        let block = k;
                        let addr = this.createAddr(track, sector, block);
                        sessionStorage.setItem(addr, this.emptyDataset.join(" "));
                        this.updateVisuals(addr);
                    }
                }
            }
        }
        updateVisuals(addr) {
            TSOS.Control.updateHardDisk(addr, sessionStorage.getItem(addr));
        }
    }
    TSOS.DSDD = DSDD;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=DSDD.js.map