/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        constructor() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "Mapping function to find out where you are!");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellSuprise, "suprise", "A special suprise!");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellThrow, "throw", "- Throws a very nice error BSOD");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- load whats in the Input textbox");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - sets the status of the system.");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<string> - runs PCB by PID");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "Clears all memory and queues");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "Runs all programs in resident queue");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "Formats the hard disk");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<string> - Creates a file on the hard disk");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<string> <string> - Writes to a file on the hard disk");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<string> - Reads a file on the hard disk");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<string> - Deletes a file on the hard disk");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellRename, "rename", "<string> - Renames a file on the hard disk");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellList, "ls", "Lists all files on the disk");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate() {
            let now = new Date();
            _StdOut.putText("Currently it is " + now.getDate + " at " + now.getTime);
        }
        shellWhereAmI() {
            _StdOut.putText("Dude. Do I look like a map? Figure it out.");
        }
        shellSuprise() {
            /// Make it so button appears, leading to rick roll
        }
        shellThrow(args) {
            // Throws a kernel error
            _Kernel.krnTrapError("TEST ERROR - MANUAL THROW");
            TSOS.Control.hostBtnHaltOS_click(true);
        }
        //Updates status
        shellStatus(args) {
            let statusHtml = document.getElementById("status");
            statusHtml.innerHTML = args.join(" ");
        }
        shellLoad() {
            //Grabs text from Input
            let isValid = true;
            let text = document.getElementById("taProgramInput").value.trim();
            let validChars = ['A', 'B', 'C', 'D', 'E', 'F', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' '];
            for (let i = 0; i < text.length; i++) {
                let char = text[i];
                if (validChars.indexOf(char) == -1) {
                    isValid = false;
                    break;
                }
            }
            // Splits into multiple values
            let textArray = text.split(" ");
            for (let i = 0; i < textArray.length; i++) {
                if (textArray[i].length > 2) {
                    isValid = false;
                    break;
                }
            }
            if (!isValid) {
                _Kernel.krnTrace("Error: Invalid input");
            }
            if (isValid) {
                // Loads into memory and creates the PCB. Had to wrap it in one in order to support rool in / roll out
                _MemoryManager.loadSegment(textArray);
                //Display PCB
                TSOS.Control.createPcbDisplay();
                _Console.putText("PCB Generated Successfully! PID: " + globalPIDCount);
                if (globalPIDCount < 4) {
                    TSOS.Control.updateMemory(globalPIDCount % 3);
                }
                // Increases pid counter
                globalPIDCount += 1;
                //Updates visual memory
            }
        }
        shellRun(args) {
            try {
                // I really need to be more creative in my nomenclature, but this works. It's just sending in the grabbed PCB from the ProcessController using it's PID.
                let runPCB = _PCBController.grabResidentByPID(args[0]);
                _CPU.runPCB(runPCB);
            }
            catch (e) {
                _Kernel.krnTrace("Error: No PCB by that PID");
                _CPU.isExecuting = false;
            }
        }
        //Clears all memory points, PCBs, and queues.
        shellClearMem() {
            _Kernel.krnTrace("COMMAND HEARD LOUD AND CLEAR: CLEARING MEMORY");
            _MemoryManager.clearMemory();
            _Kernel.krnTrace("CLEARING QUEUES");
            _PCBController.emptyQueues();
            _Kernel.krnTrace("UPDATING DISPLAYS");
            TSOS.Control.updateMemory(-1);
            TSOS.Control.updatePCBDisplay(null);
        }
        //Runs all PCBs in resident.
        shellRunAll() {
            _PCBController.moveAllToReady();
            _CPU.runPCB(_PCBController.requestNewPCB());
        }
        //Formats hard disk
        shellFormat() {
            _DSDD.format();
            _Console.putText("Formatted Disk Drive");
        }
        // Creates a file on hard disk
        shellCreate(args) {
            _DSDD.create(args[0]);
        }
        // Writes to a file on the hard disk
        shellWrite(args) {
            _DSDD.writeFile(args[0], args[1]);
        }
        // Reads a file on the hard disk
        shellRead(args) {
            _DSDD.readFile(args[0]);
        }
        //Deletes a file on hard disk
        shellDelete(args) {
            _DSDD.deleteFile(args[0]);
        }
        // Renaming a file on the hard disk
        shellRename(args) {
            _DSDD.renameFile(args[0], args[1]);
        }
        shellList() {
            _Console.putText("Current Files: ");
            _Console.advanceLine();
            let list = _DSDD.listFiles();
            for (let i = 0; i < list.length; i++) {
                _Console.putText(list[i]);
                _Console.advanceLine();
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map