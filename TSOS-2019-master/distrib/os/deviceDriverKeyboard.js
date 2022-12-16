/* ----------------------------------
   DeviceDriverKeyboard.ts
   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DeviceDriverKeyboard extends TSOS.DeviceDriver {
        constructor() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
        krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            var isCtrl = params[2];
            // Custom objects in JS are kinda nuts. I had no idea you could just straight map values like this, and it makes this so much less complicated. Did not want to write 50+ switch / case statements
            var shiftedSpecial = {
                48: ')',
                49: '!',
                50: '@',
                51: '#',
                52: '$',
                53: '%',
                54: '^',
                55: '&',
                56: '*',
                57: '(',
                192: '~',
                173: '_',
                61: '+',
                219: '{',
                221: '}',
                220: '|',
                59: ':',
                222: '"',
                188: '<',
                190: '>',
                191: '?'
            };
            var specialChars = {
                192: '`',
                173: '-',
                61: '=',
                219: '[',
                221: ']',
                220: '\\',
                59: ';',
                222: "'",
                188: ',',
                190: '.',
                191: '/'
            };
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
                // Handles regular special characters
            }
            else if (keyCode in specialChars) {
                _KernelInputQueue.enqueue(specialChars[keyCode]);
                // Everything else beyond this point
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) || // digits
                (keyCode == 32) || // space
                (keyCode == 13) || // enter
                (keyCode == 8) || //Backspace
                (keyCode == 9) //Tab
            ) {
                if (isShifted === true) {
                    _KernelInputQueue.enqueue(shiftedSpecial[keyCode]);
                }
                else {
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            }
            else if (keyCode == 38 && !isShifted) {
                chr = "upArrow";
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 40) {
                chr = "downArrow";
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverKeyboard.js.map