/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "", downBuffer = [""], upBuffer = [], tabBuffer = []) {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.downBuffer = downBuffer;
            this.upBuffer = upBuffer;
            this.tabBuffer = tabBuffer;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        clearLine() {
            // Gets the character width
            let charWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            // Sets the x pos back by the width
            this.currentXPosition -= charWidth;
            // Clears out the character. The + 5 is honestly wonky, and may cause issues? But it's currently midnight. I'm listening to Rare Americans. I'm 4 redbulls deep. I'm happy it even works.
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, charWidth, this.currentYPosition + 5);
            // Drops the entire buffer
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
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.upBuffer.push(this.buffer);
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) {
                    // Backspace function call
                    this.backspace();
                }
                else if (chr === String.fromCharCode(9)) {
                    // Tab function call
                    this.tabBuffer = this.tab();
                    this.putText('\n');
                    this.putText(this.tabBuffer.join(" "));
                    this.putText('\n');
                    _OsShell.putPrompt();
                    this.putText(this.buffer);
                }
                else if (chr === 'upArrow') {
                    this.up();
                }
                else if (chr === "downArrow") {
                    this.down();
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
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                if (this.currentXPosition + offset > _XDisplaySize) {
                    let neededspace = (this.currentXPosition + offset) - _XDisplaySize;
                    let numberofcharacters = Math.floor(neededspace / _DefaultFontSize);
                    let tempbuffer = [];
                    for (let i = 0; i < numberofcharacters; i++) {
                        tempbuffer.push(this.buffer.charAt(this.buffer.length - 1));
                    }
                    this.advanceLine();
                    let tempstring = tempbuffer.join("");
                    this.putText(tempstring);
                }
                else {
                    this.currentXPosition = this.currentXPosition + offset;
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
            if (this.currentYPosition > _YDisplaySize) {
                // Okay so after 10+ hours of working on this, I have this
                let canvasContext = _Canvas.getContext("2d");
                //Grabs the entire canvas space. Honestly, I could do the math to exactly grab the piece we need, but this is easier to read.
                let snapshot = canvasContext.getImageData(0, 0, 1000, 500);
                //Clears the screen
                this.clearScreen();
                // Places the image data back at the coords x = 0 and y = the font size times two into the negative, which would bring it higher than the canvas displays.
                canvasContext.putImageData(snapshot, 0, -this.currentFontSize * 2);
                // Resets the position of the cursor at the bottom. The + 1 may become an issue down the line, but for now? I call this a victory.
                this.currentXPosition = 0;
                this.currentYPosition = _YDisplaySize - this.currentFontSize;
            }
        }
        backspace() {
            // Gets the character width
            let charWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(this.buffer.length - 1));
            // Sets the x pos back by the width
            this.currentXPosition -= charWidth;
            // Clears out the character. The + 5 is honestly wonky, and may cause issues? But it's currently midnight. I'm listening to Rare Americans. I'm 4 redbulls deep. I'm happy it even works.
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, charWidth, this.currentYPosition + 5);
            // Drops char from buffer
            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
        }
        up() {
            if (this.upBuffer.length > 0) {
                let cmd = this.upBuffer.pop();
                if (this.buffer != "" && this.downBuffer.length > 0) {
                    this.downBuffer.push(this.buffer);
                }
                this.clearLine();
                this.buffer = cmd;
                this.putText(cmd);
            }
            else {
                this.clearLine();
                this.buffer = "";
                this.putText("");
            }
        }
        down() {
            if (this.downBuffer.length > 0) {
                let bufferCmd = this.downBuffer.pop();
                this.upBuffer.push(bufferCmd);
                this.clearLine();
                this.buffer = bufferCmd;
                this.putText(bufferCmd);
            }
            else {
                this.clearLine();
                this.buffer = "";
                this.putText("");
            }
        }
        tab() {
            let possibleCommands = [];
            let tempBuffer = this.buffer;
            if (this.buffer.length > 0) {
                for (let i = 0; i < _OsShell.commandList.length; i++) {
                    if (_OsShell.commandList[i].command.indexOf(tempBuffer) === 0) {
                        possibleCommands.push(_OsShell.commandList[i].command);
                    }
                }
                return possibleCommands;
            }
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map