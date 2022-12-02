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
var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            //Initialize Memory
            _Memory = new TSOS.Memory();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            _MemoryManager = new TSOS.MemoryManager();
            //Initialize PCB Controller
            _PCBController = new TSOS.ProcessController();
            _PCBController.init();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        static updateMemory() {
            var memoryDisplay = document.getElementById('memoryTable');
            var memoryIndex = 0;
            for (let i = 0; i < 32; i++) {
                for (let j = 1; j < 9; j++) {
                    memoryDisplay.rows[i].cells[j].innerHTML = _MemoryAccessor.getMemory(memoryIndex);
                    // if(_MemoryAccessor.getValueAtAddr(memoryIndex) == undefined){
                    //     memoryDisplay.rows[i].cells[j].innerHTML = '00';
                    // }
                    memoryIndex += 1;
                }
            }
        }
        static updateCPUDisplay() {
            var table = document.getElementById('cpuTable');
            table.rows[1].cells[0].innerHTML = _CPU.PC.toString();
            table.rows[1].cells[1].innerHTML = _CPU.currentInstruction.toString();
            table.rows[1].cells[2].innerHTML = _CPU.Acc.toString();
            table.rows[1].cells[3].innerHTML = _CPU.Xreg.toString();
            table.rows[1].cells[4].innerHTML = _CPU.Yreg.toString();
            table.rows[1].cells[5].innerHTML = _CPU.Zflag.toString();
        }
        static updatePcbDisplay() {
            let table = document.getElementById("tablePcb");
            let newTbody = document.createElement('tbody');
            table.style.display = 'block';
            table.style.height = '208px';
            // Add rows for each process to tbody
            let row;
            for (let i = 0; i < _PCBController.ResidentQueue.getSize(); i++) {
                let tempPCB = _PCBController.ResidentQueue.dequeue();
                row = newTbody.insertRow(-1);
                // PCB info
                row.insertCell(-1).innerHTML = tempPCB.pid.toString();
                row.insertCell(-1).innerHTML = tempPCB.state.toLocaleUpperCase();
                row.insertCell(-1).innerHTML = tempPCB.startMem.toString(16);
                row.insertCell(-1).innerHTML = tempPCB.priority.toString(16);
                row.insertCell(-1).innerHTML = tempPCB.pc.toString(16);
                row.insertCell(-1).innerHTML = tempPCB.acc.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = tempPCB.xreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = tempPCB.yreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = tempPCB.zflag.toString(16);
                _PCBController.ResidentQueue.enqueue(tempPCB);
                alert(_PCBController.ResidentQueue.isEmpty());
            }
            table.replaceChild(newTbody, table.firstChild);
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map