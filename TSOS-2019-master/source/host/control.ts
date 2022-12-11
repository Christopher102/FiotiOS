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

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            //Initialize Memory
            _Memory = new Memory();
            _MemoryAccessor = new MemoryAccessor();
            _MemoryManager = new MemoryManager();

            //Initialize PCB Controller

            _PCBController = new ProcessController();
            _PCBController.init();

            // Initialize PCB Scheduler
            _CPUScheduler = new cpuScheduler();

            //Initialize Hard Disk
            this.startHardDisk();
            _Disk = new HDD();
            _DSDD = new DSDD();

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

        //Updates memory tables seperated by PID. Have to do PID % 3 first, before passing. -1 will update all of the tables.
        public static updateMemory(PID){
            let table = 'memoryTable'
            let memoryIndex = 0;
            switch(PID){
                case 0:
                    table = 'memoryTable'
                    memoryIndex = 0;
                    this.updateMemTable(table, memoryIndex);
                    break;
                case 1:
                    table = 'memoryTable2'
                    memoryIndex = 256;
                    this.updateMemTable(table, memoryIndex);
                    break;
                case 2:
                    table = 'memoryTable3'
                    memoryIndex = 512;
                    this.updateMemTable(table, memoryIndex);
                    break;
                case -1:
                    for(let i = 0; i < 3; i ++){
                        var indexList = [0, 256, 512]
                        if(i > 1){
                            table = table + i;
                        }
                        memoryIndex = indexList[i];
                        this.updateMemTable(table, memoryIndex);
                    }
                    break;
            }
        }

        // Supporter function to UpdateMemory. This does the heavy lifting, and will ensure all elements are up to date
        public static updateMemTable(table, memoryIndex){
            var memoryDisplay: HTMLTableElement = <HTMLTableElement> document.getElementById(table);
            for(let i = 0; i < 32; i++){
                for(let j = 1; j < 9; j++){
                    memoryDisplay.rows[i].cells[j].innerHTML = _MemoryAccessor.getMemory(memoryIndex);
                    memoryIndex += 1;
                }
            }
        }

        //Updates the CPU display. Simple.
        public static updateCPUDisplay(){
            var table = <HTMLTableElement>document.getElementById('cpuTable');
            table.rows[1].cells[0].innerHTML = _CPU.PC.toString();
            table.rows[1].cells[1].innerHTML = _CPU.currentInstruction.toString();
            table.rows[1].cells[2].innerHTML = _CPU.Acc.toString();
            table.rows[1].cells[3].innerHTML = _CPU.Xreg.toString();
            table.rows[1].cells[4].innerHTML = _CPU.Yreg.toString();
            table.rows[1].cells[5].innerHTML = _CPU.Zflag.toString();
        }

        //Creates a new Tbody by adding onto the old one and replacing the first child. 
        static createPcbDisplay() {
            let table = <HTMLTableElement>document.getElementById("tablePcb");
            let newTbody = <HTMLTableSectionElement>document.createElement('tbody');
            table.style.display = 'block';
            table.style.height = '208px';
            // Add rows for each process to tbody
            let row: HTMLTableRowElement;
            for (let i = 0; i < _PCBController.ResidentQueue.getSize(); i++) {
                let tempPCB: TSOS.PCB = _PCBController.ResidentQueue.dequeue();
                row = <HTMLTableRowElement>newTbody.insertRow(-1);
                row.id = tempPCB.pid.toString();
                // PCB info
                row.insertCell(-1).innerHTML = tempPCB.pid.toString();
                row.insertCell(-1).innerHTML = tempPCB.state.toLocaleUpperCase();
                row.insertCell(-1).innerHTML = tempPCB.startMem.toString(16);
                row.insertCell(-1).innerHTML = tempPCB.priority.toString(16);
                row.insertCell(-1).innerHTML = tempPCB.pc.toString(16);
                row.insertCell(-1).innerHTML = tempPCB.acc.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = tempPCB.xreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = tempPCB.yreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = tempPCB.zflag.toString(16)
                _PCBController.ResidentQueue.enqueue(tempPCB);
            }
            table.replaceChild(newTbody, table.firstChild);

        }

        //Updates PCB display using PID number.
        // This one function working to update the PCB display made me so incredibly happy I started tearing up. It's such a simple solution for what was a massive annoyance. I hate HTML so much
        public static updatePCBDisplay(pcb : TSOS.PCB){
            if(pcb === null){
                let table = <HTMLTableElement>document.getElementById("tablePcb");
                table.replaceChild(document.createElement('tbody'), table.firstChild);
                
            } else {
                let row = <HTMLTableRowElement>document.querySelector('#tablePcb tr[id="' + pcb.pid + '"]');
                row.cells[1].innerHTML = pcb.state.toLocaleUpperCase();
                row.cells[4].innerHTML = pcb.pc.toString();
                row.cells[5].innerHTML = pcb.acc.toString(16);
                row.cells[6].innerHTML = pcb.xreg.toString(16);
                row.cells[7].innerHTML = pcb.yreg.toString(16);
                row.cells[8].innerHTML = pcb.zflag.toString(16);
            }

        }


        //This is used to initialize the HTML hard disk table. I'm lazy, and have no intention of manually creating those rows.
        public static startHardDisk(){
            let table = <HTMLTableElement>document.getElementById('tableHD');
            for(let i =0; i < 4; i++){
                for(let j = 0; j < 8; j++){
                   for(let k = 0; k < 8; k++){
                      let row = <HTMLTableRowElement>table.insertRow(-1);
                      row.id = i + ":" + j + ":" + k;
                      row.insertCell(-1).innerHTML = i.toString() + ":" + j.toString() + ":" + k.toString();
                      row.insertCell(-1).innerHTML = '&nbsp';
                      row.insertCell(-1).innerHTML = '&nbsp';
                      row.insertCell(-1).innerHTML = '&nbsp';
                      row.insertCell(-1).innerHTML = '&nbsp';
                      row.insertCell(-1).innerHTML = '&nbsp';
                   }
                }
             }
        }

        //Updates the hard disk in HTML. Feel like I need to create a better method.
        public static updateHardDisk(track, sector, block, next, Data: string){
            let row = <HTMLTableRowElement>document.querySelector('#tableHD tr[id="' + track + ":" + sector + ":" + block + '"]');
            row.cells[1].innerHTML = next;
            if(Data != _DSDD.emptyDataSet){
                row.cells[2].innerHTML = "1";   
            } else {
                row.cells[2].innerHTML = "0";   
            }
            row.cells[3].innerHTML = Data;
        }
    }
}
