var TSOS;
(function (TSOS) {
    class Memory {
        constructor() {
            // See? This is why I do the grand reset. This one line does what my previous code did over 6.
            this.memorySet = new Array(_DefaultMemorySize).fill("00");
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map