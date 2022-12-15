var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
            this.segments = [-1, -1, -1];
            this.startMem = 0;
            this.endMem = 255;
        }
        clearMemory() {
            _Memory.memorySet.fill("00");
        }
        clearMemorySegment(start, endval) {
            for (let i = start; i < endval + 1; i++) {
                _Memory.memorySet[i] = "00";
            }
            switch (start) {
                case 0:
                    this.segments[0] = -1;
                    break;
                case 256:
                    this.segments[1] = -1;
                    break;
                case 512:
                    this.segments[2] = -1;
                    break;
            }
        }
        checkEmptySegment() {
            let segmentIndex = this.segments.findIndex(i => i === -1);
            return segmentIndex;
        }
        loadSegment(valuelist) {
            let segmentSelection = this.checkEmptySegment();
            let startMem = 0;
            let endMem = 0;
            let segmentIndex = 0;
            switch (segmentSelection) {
                case 0:
                    startMem = 0;
                    endMem = 255;
                    segmentIndex = 0;
                    break;
                case 1:
                    startMem = 256;
                    endMem = 511;
                    segmentIndex = 1;
                    break;
                case 2:
                    startMem = 512;
                    endMem = 767;
                    segmentIndex = 2;
                    break;
                case -1:
                    startMem = 0;
                    endMem = 0;
                    break;
                default:
                    break;
            }
            if (segmentSelection === -1) {
                //Roll out into HDD. Something Something Useful Comment
                _PCBController.newPCB(globalPIDCount, startMem, endMem, "HDD");
                _Swapper.setHDD("~" + globalPIDCount, valuelist);
            }
            else {
                for (let i = 0; i < valuelist.length; i++) {
                    _Memory.memorySet[i + startMem] = valuelist[i];
                }
                _PCBController.newPCB(globalPIDCount, startMem, endMem);
                this.segments[segmentIndex] = globalPIDCount;
            }
        }
        readByte(location) {
            if (location > _CPU.workingPCB.endMem || location < _CPU.workingPCB.startMem) {
                _Kernel.krnTrapError("ERROR: OUT OF BOUNDS MEMORY ACCESS");
                _Kernel.krnTrace("READBYTE: " + location);
            }
            else {
                return _MemoryAccessor.getMemory(location);
            }
        }
        writeByte(location, value) {
            if (location > _CPU.workingPCB.endMem || location < _CPU.workingPCB.startMem) {
                _Kernel.krnTrapError("ERROR: OUT OF BOUNDS MEMORY ACCESS");
                _Kernel.krnTrace("WRITEBYTE: " + location + " " + value);
            }
            else {
                return _MemoryAccessor.setMemory(value, location);
            }
        }
        read(pcb, addr) {
            if (pcb.startMem + addr > _CPU.workingPCB.endMem || pcb.endMem + addr < _CPU.workingPCB.startMem) {
                _Kernel.krnTrace("OUT OF BOUNDS READ " + addr + " " + pcb.pid + " " + pcb.startMem + " " + pcb.endMem);
            }
            else {
                return _MemoryAccessor.getMemory(pcb.startMem + addr);
            }
        }
        getSegmentAndClear(PCB) {
            let storedMemory = [];
            for (let i = 0; i < 256; i++) {
                let value = _MemoryManager.read(PCB, i);
                storedMemory.push(value);
            }
            this.clearMemorySegment(PCB.startMem, PCB.endMem);
            return storedMemory;
        }
        loadIntoMemorySegment(valuelist) {
            let segmentSelection = this.checkEmptySegment();
            let startMem = 0;
            let endMem = 0;
            let segmentIndex = 0;
            switch (segmentSelection) {
                case 0:
                    startMem = 0;
                    endMem = 255;
                    segmentIndex = 0;
                    this.segments[segmentIndex] = 1;
                    break;
                case 1:
                    startMem = 256;
                    endMem = 511;
                    segmentIndex = 1;
                    this.segments[segmentIndex] = 1;
                    break;
                case 2:
                    startMem = 512;
                    endMem = 767;
                    segmentIndex = 2;
                    this.segments[segmentIndex] = 1;
                    break;
                case -1:
                    startMem = 0;
                    endMem = 0;
                    break;
                default:
                    break;
            }
            for (let i = 0; i < valuelist.length; i++) {
                _Memory.memorySet[i + startMem] = valuelist[i];
            }
            return [startMem, endMem];
        }
        getSegment(memorySegment) {
            let memoryArray = [];
            switch (memorySegment) {
                case 0:
                    for (let i = 0; i < 256; i++) {
                        memoryArray.push(_MemoryAccessor.getMemory(i));
                    }
                    TSOS.Control.updateMemory(memorySegment);
                    return memoryArray;
                case 1:
                    for (let i = 256; i < 512; i++) {
                        memoryArray.push(_MemoryAccessor.getMemory(i));
                    }
                    TSOS.Control.updateMemory(memorySegment);
                    return memoryArray;
                case 2:
                    for (let i = 0; i < 768; i++) {
                        memoryArray.push(_MemoryAccessor.getMemory(i));
                    }
                    TSOS.Control.updateMemory(memorySegment);
                    return memoryArray;
            }
        }
        clearBySegment(memorySegment) {
            switch (memorySegment) {
                case 0:
                    for (let i = 0; i < 256; i++) {
                        _MemoryAccessor.setMemory("00", i);
                    }
                    this.segments[memorySegment] = -1;
                    TSOS.Control.updateMemory(memorySegment);
                    break;
                case 1:
                    for (let i = 256; i < 512; i++) {
                        _MemoryAccessor.setMemory("00", i);
                    }
                    this.segments[memorySegment] = -1;
                    TSOS.Control.updateMemory(memorySegment);
                    break;
                case 2:
                    for (let i = 0; i < 768; i++) {
                        _MemoryAccessor.setMemory("00", i);
                    }
                    this.segments[memorySegment] = -1;
                    TSOS.Control.updateMemory(memorySegment);
                    break;
            }
        }
        loadbySegment(memorySegment, data) {
            try {
                switch (memorySegment) {
                    case 0:
                        for (let i = 0; i < data.length; i++) {
                            _Memory.memorySet[i] = data[i];
                        }
                        this.segments[memorySegment] = 1;
                        TSOS.Control.updateMemory(memorySegment);
                        break;
                    case 1:
                        for (let i = 256; i < data.length; i++) {
                            _Memory.memorySet[i] = data[i - 256];
                        }
                        this.segments[memorySegment] = 1;
                        TSOS.Control.updateMemory(memorySegment);
                        break;
                    case 2:
                        for (let i = 512; i < data.length; i++) {
                            _Memory.memorySet[i] = data[i - 512];
                        }
                        this.segments[memorySegment] = 1;
                        TSOS.Control.updateMemory(memorySegment);
                        break;
                    default:
                        _Kernel.krnTrace("Error: Mem Segment not caught");
                        break;
                }
            }
            catch (e) {
                _Kernel.krnTrace("ERROR IN LOAD BY SEGMENT " + e);
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memorymanager.js.map