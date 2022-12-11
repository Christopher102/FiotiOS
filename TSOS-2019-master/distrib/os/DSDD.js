var TSOS;
(function (TSOS) {
    class DSDD {
        constructor() {
        }
        getAddr(string) {
            let t = string[0];
            let s = string[1];
            let b = string[2];
            return t + ":" + s + ":" + b;
        }
        format() {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 8; j++) {
                    for (let k = 0; k < 8; k++) {
                        sessionStorage.setItem(i + ":" + j + ":" + k, "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -");
                        TSOS.Control.updateHardDisk(i, j, k, "0,0,0", sessionStorage.getItem(i + ":" + j + ":" + k));
                    }
                }
            }
        }
    }
    TSOS.DSDD = DSDD;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=DSDD.js.map