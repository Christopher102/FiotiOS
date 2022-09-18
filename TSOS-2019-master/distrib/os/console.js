/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "", 
        // This holds a string of all the console entries. Was gonna do an array but holy crap arrays suck in TS, never doing a pop / push array ever again. No thank you.
        consoleString = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.consoleString = consoleString;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            this.buffer = "";
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    this.consoleString += this.buffer + "\n";
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    // Backspace function call
                    alert("BACKSPACING");
                    this.backspace();
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        putText(text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            // Checks for a newline character
            let stringtext = String(text);
            if (text == "\n") {
                this.advanceLine();
            }
            else if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
                if (stringtext.length > 1) {
                    this.consoleString += text + "\n";
                }
            }
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition > _yDisplaySize) {
                /*let yDisplayDifference = this.currentYPosition - _yDisplaySize;
                let yFontDifference = Math.round(yDisplayDifference / this.currentFontSize);

                this.clearScreen();
                this.resetXY();
                let splitString = this.consoleString.split('\n')
                for(let i = yFontDifference; i < splitString.length + 1; i++){
                    this.putText(splitString[i]);
                    this.putText('\n');
                    splitString
                }*/
                let canvasContext = _Canvas.getContext("2d");
                let snapshot = canvasContext.getImageData(0, 0, 1000, 500);
                this.clearScreen();
                canvasContext.putImageData(snapshot, 0, -this.currentFontSize * 2);
                this.currentXPosition = 0;
                this.currentYPosition = _yDisplaySize - this.currentFontSize + 1;
            }
        }
        backspace() {
            //Remove the last character and create a substring
            var textString = this.buffer.substring(0, this.buffer.length - 1);
            this.putText(textString);
            //Move context / cursor over by one
            let xDifference = _DrawingContext.measureText(this.currentFont, this.currentFontSize, textString);
            this.currentXPosition = this.currentXPosition - xDifference;
            //Prevent from going off screen
            if (this.currentXPosition < 0) {
                this.currentXPosition = 0;
            }
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map