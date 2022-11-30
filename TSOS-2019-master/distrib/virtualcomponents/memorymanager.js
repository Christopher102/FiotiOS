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
        }
        loadSegment(valuelist) {
            let startMem = 0;
            let endMem = 0;
            //  checking segments by checking PID number
            switch (globalPIDCount % 3) {
                case 0:
                    startMem = 0;
                    endMem = 255;
                    break;
                case 1:
                    startMem = 256;
                    endMem = 511;
                    break;
                case 2:
                    startMem = 512;
                    endMem = 767;
                    break;
                default:
                    alert("You managed to break a mod. Congrats.");
                    _Kernel.krnTrapError("GLOBAL PID MEMORY ERROR: OUT OF RANGE MOD");
                    break;
            }
            this.clearMemorySegment(startMem, endMem);
            switch (startMem) {
                case startMem = 0:
                    for (let i = 0; i < valuelist.length; i++) {
                        _MemoryAccessor.setMemory(valuelist[i], i);
                    }
                    this.segments[0] = 1;
                    break;
                case startMem = 256:
                    for (let i = 0; i < valuelist.length; i++) {
                        _MemoryAccessor.setMemory(valuelist[i], i + 256);
                    }
                    this.segments[1] = 1;
                    break;
                case startMem = 512:
                    for (let i = 0; i < valuelist.length; i++) {
                        _MemoryAccessor.setMemory(valuelist[i], i + 512);
                    }
                    this.segments[2] = 1;
                    break;
                default:
                    alert("ERROR: START VALUE NOT 0, 256, or 712");
                    break;
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memorymanager.js.map