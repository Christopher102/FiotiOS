
var TSOS;
(function (TSOS) {
    class Memory {
        constructor() {
            this.memory = [];
        }
        init() {
            this.memory = new Array(_defaultMemorySize); 
            for (let i = 0; i < _defaultMemorySize; i++) {
                this.memory[i] = 0;
            }
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
