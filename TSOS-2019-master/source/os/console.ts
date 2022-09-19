/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public commandBuffer = [],
                    public commandIndex = 0,
                    public upBuffer = [],
                    public downBuffer = []
                    ) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            this.buffer = "";
        }

        public clearLine(): void {
            // Gets the character width
            let charWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            // Sets the x pos back by the width
            this.currentXPosition -= charWidth;
            // Clears out the character. The + 5 is honestly wonky, and may cause issues? But it's currently midnight. I'm listening to Rare Americans. I'm 4 redbulls deep. I'm happy it even works.
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, charWidth, this.currentYPosition + 5);
            // Drops the entire buffer
            this.buffer = "";
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
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
                } else if (chr === String.fromCharCode(9)){
                    // Tab function call
                    this.tab();
                } else if (chr === 'upArrow'){
                    this.up();
                }
                else if (chr === "downArrow"){
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

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
           // Checks for a newline character
            if(text == "\n"){
                this.advanceLine();
            }
            else if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;

            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;
            
           if(this.currentYPosition > _yDisplaySize){

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
                this.currentYPosition = _yDisplaySize - this.currentFontSize + 1;
                
            }

            }
    
        

        public backspace() {
            // Gets the character width
            let charWidth = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(this.buffer.length - 1));
            // Sets the x pos back by the width
            this.currentXPosition -= charWidth;
            // Clears out the character. The + 5 is honestly wonky, and may cause issues? But it's currently midnight. I'm listening to Rare Americans. I'm 4 redbulls deep. I'm happy it even works.
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, charWidth, this.currentYPosition + 5);
            // Drops char from buffer
            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
        }

        public tab(){
            let possibleCommands = [];
            let commandList = _OsShell.commandList;
            for(let i = 0; i < commandList.length + 1; i++){
                if(commandList[i].command.indexOf(this.buffer) === 0){
                    this.buffer = commandList[i];
                }
            }
        }

        public up(){
            if(this.upBuffer.length > 0){
                    let bufferCmd = this.upBuffer.pop(); 
                    this.clearLine();
                    this.buffer = bufferCmd;
                    this.putText(bufferCmd);
            }
        }

        public down(){
            if(this.downBuffer.length > 0){
                let bufferCmd = this.downBuffer.pop();
                this.upBuffer.push(bufferCmd);
                this.clearLine();
                this.buffer = bufferCmd;
                this.putText(bufferCmd)
            } else {
                this.clearLine();
                this.buffer = "";
                this.putText("");
            }
        }
    }
 }
