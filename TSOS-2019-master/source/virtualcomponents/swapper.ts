module TSOS{
    export class Swapper{
        outPCB: TSOS.PCB;
        inPCB : TSOS.PCB;
        constructor(){
            this.outPCB = null;
            this.inPCB = null;

        }


        public swap(oldPCB: TSOS.PCB){
            this.outPCB = oldPCB;
            this.inPCB = _PCBController.ReadyQueue.popTail();
            try{
            // Get Memory Array
            let memoryArray = this.getMemoryForSwap(this.outPCB);
            // Get HDD Array
            let hddArray =  this.getHDDForSwap(this.inPCB);
            // Get Memory min and max to set
            let memoryStart = this.outPCB.startMem;
            let memoryEnd = this.outPCB.endMem;
            // write Memory Array to HDD
            let filename = "~" + this.outPCB.pid
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
            } catch(e){
                alert("HEY, YOU GOT IT WRONG IN SWAP");
            }

        }

        public setHDD(filename, memoryArray){
            try {
                _DSDD.createFile(filename);
                _DSDD.writeInSwapBlock(filename, memoryArray);
            } catch (error) {
                alert("ERROR IN THE SET HDD BOZO");
            }
        }

        public getMemorySeg(memoryStart){
            try {
                let memorySeg = 0;
                switch(memoryStart){
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
            } catch (e) {
                alert("Segment Get Error")
            }

        }

        public getMemoryForSwap(pcb: TSOS.PCB){
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
            } catch (e) {
             alert(" Memory Get Swap Error " + e);   
            }

        }

        public getHDDForSwap(pcb: TSOS.PCB){
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
            //     //Waaah wahh wahhh stop fucking crying
            //     // Update visuals(?)
            //     //return the data
            //     return dataArray;
            // } else {
                let dataArray = _DSDD.getData(dataAddr);
                // Empty the hdd blocks
                _DSDD.deleteFile(filename);
                //cry
                //Waaah wahh wahhh stop fucking crying
                // Update visuals(?)
                //return the data
                return dataArray;
            //}
            } catch (e) {
                alert("HDD Get error " + e);
            }
        }

        public getMoreThanOneDataFile(addr: string, dataArray: Array<string>){
            try{
            let nextAddr = _DSDD.getNext(addr);
            if(nextAddr === "00:00:00"){
                dataArray.concat(_DSDD.getData(addr));
                return dataArray;
            } else {
                dataArray.concat(_DSDD.getData(addr));
                return dataArray;
            }
        } catch(e){
            alert("ERROR IN GETTING MORE THAN ONE DATAFILE" + e);
        }
        }


        public swapFromHDD(pcb: TSOS.PCB){
               // Get HDD Array
               let hddArray =  this.getHDDForSwap(pcb);
               // Get Memory min and max to set
               let memoryStart = this.outPCB.startMem;
               let memoryEnd = this.outPCB.endMem;
               // write Memory Array to HDD
               // write HDD Array to Memory
               let memorySeg = this.getMemorySeg(memoryStart);
               _MemoryManager.loadbySegment(memorySeg, hddArray);
               pcb.startMem = memoryStart;
               pcb.endMem = memoryEnd;
               pcb.location = "MEM";
               _CPU.runPCB(pcb);
        }
    }
}