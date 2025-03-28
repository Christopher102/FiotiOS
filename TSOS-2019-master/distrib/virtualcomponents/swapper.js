var TSOS;
(function (TSOS) {
    class Swapper {
        constructor() {
            this.outPCB = null;
            this.inPCB = null;
        }
        // This is my roll-in-roll-out
        swap(oldPCB) {
            this.outPCB = oldPCB;
            this.inPCB = _PCBController.ReadyQueue.popTail();
            try {
                // Get Memory Array
                let memoryArray = this.getMemoryForSwap(this.outPCB);
                // Get HDD Array
                let hddArray = this.getHDDForSwap(this.inPCB);
                // Get Memory min and max to set
                let memoryStart = this.outPCB.startMem;
                let memoryEnd = this.outPCB.endMem;
                // write Memory Array to HDD
                let filename = "~" + this.outPCB.pid;
                let previousfilename = "~" + this.inPCB.pid;
                _DSDD.deleteFile(previousfilename);
                this.setHDD(filename, memoryArray);
                // write HDD Array to Memory
                let memorySeg = this.getMemorySeg(memoryStart);
                _MemoryManager.loadbySegment(memorySeg, hddArray);
                //Update InPCB location value
                this.inPCB.location = "MEM";
                // Update InPCB memory values
                this.inPCB.startMem = memoryStart;
                this.inPCB.endMem = memoryEnd;
                // Update OutPCB location value
                this.outPCB.location = "HDD";
                // Update OutPCB memory values
                this.outPCB.startMem = -1;
                this.outPCB.endMem = -1;
                // Update visuals(?)
                TSOS.Control.updatePCBDisplay(this.outPCB);
                TSOS.Control.updatePCBDisplay(this.inPCB);
                _PCBController.ReadyQueue.enqueue(this.inPCB);
                _PCBController.ReadyQueue.enqueue(this.outPCB);
            }
            catch (e) {
                _Kernel.krnTrace("Swap Error");
            }
        }
        setHDD(filename, memoryArray) {
            try {
                _DSDD.createFile(filename);
                _DSDD.writeInSwapBlock(filename, memoryArray);
            }
            catch (error) {
                _Kernel.krnTrace("Error in setHDD " + error);
            }
        }
        getMemorySeg(memoryStart) {
            try {
                let memorySeg = 0;
                switch (memoryStart) {
                    case 0:
                        memorySeg = 0;
                        break;
                    case 256:
                        memorySeg = 1;
                        break;
                    case 512:
                        memorySeg = 2;
                        break;
                }
                return memorySeg;
            }
            catch (e) {
                _Kernel.krnTrace("Segment Get Error " + e);
            }
        }
        getMemoryForSwap(pcb) {
            try {
                // Get the memory segment for this PCB
                let memorySeg = this.getMemorySeg(pcb.startMem);
                // Get the entirety of the memory
                let memoryArray = _MemoryManager.getSegment(memorySeg);
                // Clear that segment of memory
                //_MemoryManager.clearBySegment(memorySeg);
                //Cry
                //Waaah Waah Wahh Stop Fucking Crying
                // Update visuals(?)
                TSOS.Control.updateMemory(memorySeg);
                //Return Array containing memory
                return memoryArray;
            }
            catch (e) {
                _Kernel.krnTrace(" Memory Get Swap Error " + e);
            }
        }
        getHDDForSwap(pcb) {
            try {
                // Get the swap file's location in the HDD
                let filename = "~" + pcb.pid;
                let fileAddr = _DSDD.filenameSearch(filename);
                // Get the data files location in the HDD
                let dataAddr = _DSDD.getNext(fileAddr);
                //Check for more than one data local.
                let secondaryAddr = _DSDD.getNext(dataAddr);
                // if(secondaryAddr !== "00:00:00"){
                //     // Get the data itself
                //     let dataArray = this.getMoreThanOneDataFile(secondaryAddr, _DSDD.getData(dataAddr));
                //     // Empty the hdd blocks
                //     _DSDD.deleteFile(filename);
                //     //cry
                //     // Update visuals(?)
                //     //return the data
                //     return dataArray;
                // } else {
                let dataArray = _DSDD.getData(dataAddr);
                // Empty the hdd blocks
                _DSDD.deleteFile(filename);
                //cry
                // Update visuals(?)
                //return the data
                return dataArray;
                //}
            }
            catch (e) {
                _Kernel.krnTrace("HDD Get error " + e);
            }
        }
        getMoreThanOneDataFile(addr, dataArray) {
            try {
                let nextAddr = _DSDD.getNext(addr);
                if (nextAddr === "00:00:00") {
                    dataArray.concat(_DSDD.getData(addr));
                    return dataArray;
                }
                else {
                    dataArray.concat(_DSDD.getData(addr));
                    return dataArray;
                }
            }
            catch (e) {
                _Kernel.krnTrace("ERROR IN GETTING MORE THAN ONE DATAFILE" + e);
            }
        }
        swapFromHDD(pcb) {
            // Get HDD Array
            let hddArray = this.getHDDForSwap(pcb);
            //Find an empty segment
            let memorySeg = _MemoryManager.checkEmptySegment();
            // Get Memory min and max to set
            let memoryStart = 0;
            let memoryEnd = 255;
            switch (memorySeg) {
                case 0:
                    memoryStart = 0;
                    memoryEnd = 255;
                    _MemoryManager.segments[0] = 1;
                case 1:
                    memoryStart = 256;
                    memoryEnd = 511;
                    _MemoryManager.segments[1] = 1;
                case 2:
                    memoryStart = 512;
                    memoryEnd = 767;
                    _MemoryManager.segments[2] = 1;
                default:
                    _Kernel.krnTrace("Error: Mem Segment not caught");
            }
            // write Memory Array to HDD
            // write HDD Array to Memory
            _MemoryManager.loadbySegment(memorySeg, hddArray);
            pcb.startMem = memoryStart;
            pcb.endMem = memoryEnd;
            pcb.location = "MEM";
            return pcb;
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map