var TSOS;
(function (TSOS) {
    class HDD {
        constructor() {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        sessionStorage.setItem(i + ":" + j + ":" + k, "");
                    }
                }
            }
        }
    }
    TSOS.HDD = HDD;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=harddisk.js.map