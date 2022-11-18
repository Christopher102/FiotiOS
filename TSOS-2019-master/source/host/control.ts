/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            //Display Buttons and hide other buttons
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).removeAttribute("hidden");
            (<HTMLButtonElement>document.getElementById("btnReset")).removeAttribute("hidden");
            (<HTMLButtonElement>document.getElementById("startButton")).hidden = true;
            (document.getElementById("mainRow")).removeAttribute("hidden");
            (document.getElementById("secondaryRow")).removeAttribute("hidden");

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // memory Initalizing
            _Memory = new TSOS.Memory();
            _MemoryAccessor = new memoryAccessor;
            _Memory.init();
            // Dispatcher and Scheduler
            _CpuScheduler = new TSOS.CpuScheduler(6);
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static updateMemory(){
            var memoryDisplay: HTMLTableElement = <HTMLTableElement> document.getElementById('memoryTable');
            var memoryIndex = 0;
            for(let i = 0; i < 32; i++){
                for(let j = 1; j < 9; j++){
                    memoryDisplay.rows[i].cells[j].innerHTML = _MemoryAccessor.getValueAtAddr(memoryIndex);
                    memoryIndex += 1;
                }
            }
        }

        static updateCpuDisplay() {
            let table = <HTMLTableElement>document.getElementById('cpuTable');
            let newTbody = <HTMLTableSectionElement>document.createElement('tbody');
            let row;
            row = <HTMLTableRowElement>newTbody.insertRow(-1);
            row.insertCell(-1).innerHTML = _CPU.PC.toString();
            row.insertCell(-1).innerHTML = _CPU.currentInstruction.toString();
            row.insertCell(-1).innerHTML = _CPU.Acc.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _CPU.Xreg.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _CPU.Yreg.toString(16).toLocaleUpperCase();
            row.insertCell(-1).innerHTML = _CPU.Zflag.toString(16);
            table.replaceChild(newTbody, table.firstChild);


        }

        static updatePcbDisplay() {
            let table = <HTMLTableElement>document.getElementById("tablePcb");
            let newTbody = <HTMLTableSectionElement>document.createElement('tbody');
            table.style.display = 'block';
            table.style.height = '208px';
            // Add rows for each process to tbody
            let row;
            for (let i = 0; i < _ResidentQueue.length; i++) {
                row = <HTMLTableRowElement>newTbody.insertRow(-1);
                // PCB info
                row.insertCell(-1).innerHTML = _ResidentQueue[i].pid;
                row.insertCell(-1).innerHTML = _ResidentQueue[i].state.toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentQueue[i].state == 'terminated' ? '--' : _ResidentQueue[i].baseAddr;
                row.insertCell(-1).innerHTML = _ResidentQueue[i].prio;
                row.insertCell(-1).innerHTML = _ResidentQueue[i].pc;
                row.insertCell(-1).innerHTML = _ResidentQueue[i].acc.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentQueue[i].xreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentQueue[i].yreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentQueue[i].zflag.toString(16);
            }
            table.replaceChild(newTbody, table.firstChild);

        }
    }
}
