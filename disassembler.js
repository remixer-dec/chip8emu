import {R} from './registers.js'
import {S} from './screen.js'
import {K} from './keyboard.js'
import {C} from './config.js'
import {D} from './debug.js'
import {M} from './memory.js'

var skipNext = false;
C.init();
C.initEvents();
K.init(C);
M.initOnce();
D.init(R);
export function visualize(MEMORY){
    M.init(MEMORY)
    S.init();
    S.clear();
    R.reset();

    let fulloutput = "";
    let i = 0, h = 0;
    opcodeview.innerHTML = "";

    function* executor(){
        while(M.pointer < M.RAM.length){
            let opcode = M.RAM[M.pointer] << 8 | M.RAM[M.pointer + 1];
            let output = '';
            if(M.dtimer>0){
                M.dtimer--;
            }
            if(M.stimer>0){
                M.stimer--;
            }
            if(C.dbgmode < 2){
                output = getReadableInstruction(M.pointer, opcode);
            } else {
                opcodeExecutor(opcode);
                if(C.exmode==0){
                    yield;
                    continue;
                }
            }
            i++;
            if(i == 8290 && C.exmode == 1){
                output += "<h1>LOOP</h1>";
                break;
            }
            if(C.exmode == 0) {
                if(C.dbgmode < 2){
                    opcodeview.innerHTML += output;
                    opwrapper.scrollTop = 9999999
                    h++
                    if(h>16){
                        opcodeview.firstChild.remove()
                    }
                }
                yield output
            } else {
                fulloutput += output;
            }
        }
        if(C.exmode == 1 && C.dbgmode < 2) opcodeview.innerHTML = fulloutput;
        return;
    }
    let e = executor()
    function rafik(){
            for(let z=0;z<C.opPerCycle;z++){
                if(!M.pauseFlag){
                    e.next()
                }
                if(M.drawFlag && C.opPerCycle/1000 == M.drawFlag){
                    M.drawFlag = 0
                    S.renderer()
                    break
                }
            }
            if(!e.done && !M.stopFlag){
                setTimeout(requestAnimationFrame,C.delay,rafik)
            }
    }
    rafik()
}
function getReadableInstruction(addr, instr){
    let states = C.dbgmode == 0 ? `<b data-screen="${S.pixels}" onmouseover="replayPixelSate(event)">[S]</b><b data-state="${R.getState()}" onmouseover="replayRegState(event)">[R]</b>`:"";
    return `<div>0x${D.adrNormalizer(addr,2)} | ${instr.toString(16)} | ${opcodeExecutor(instr)[2]} ${states}</div>`;
}
function jumpTo(addr, memorize){
    if(C.damode == 1){
        if(M.pointer != addr){
            if(memorize){
                M.stack.push(M.pointer);
            }
            M.pointer = addr;
        } else {
            M.stopFlag = true;
            S.gameover()
            S.renderer()
        }
    } else {
        M.pointer+=2;
    }
}
function jumpBack(){
    M.pointer = M.stack.pop();
    M.pointer +=2
}
function opcodeExecutor(opcode){
    let op0 = opcode >> 12 & 0xF
    let opX = opcode >> 8 & 0xF
    let opY = opcode >> 4 & 0xF
    let opN = opcode & 0xF
    let opNN = opcode & 0xFF
    let opNNN = opcode & 0xFFF
    if(skipNext && C.damode > 0){
        skipNext = false;
        M.pointer+=2;
        return ["???","UNKN","*SKIPPED*"];
    }
    if(M.stepbystep){
        M.pauseFlag = true;
    }
    switch(opcode){
        case 0x00E0:
            S.clear()
            M.pointer+=2
            return ["00E0","Display","Clears the screen"]
        case 0x00EE:
            jumpBack();
            return ["00EE","Flow","Returns from a subroutine"]
        default:
            switch(op0){
                case 0x0:
                    M.pointer+=2;
                    return ["0NNN","Call","Calls RCA 1802 programm at adress 0x"+opNNN.toString(16)]
                case 0x1:
                    jumpTo(opNNN);
                    return ["1NNN","Flow","Jumps to adress 0x"+opNNN.toString(16)]
                case 0x2:
                    jumpTo(opNNN, true);
                    return ["2NNN","Flow","Calls subroutine at 0x"+opNNN.toString(16)]
                case 0x3:
                    if(R.getReg(opX) == opNN){
                        skipNext = true;
                    }
                    M.pointer+=2;
                    return ["3XNN","Cond",`Skips the next instruction if ${D.reg(opX)} == ${opNN}. `]
                case 0x4:
                    if(R.getReg(opX) != opNN){
                        skipNext = true;
                    }
                    M.pointer+=2;
                    return ["4XNN","Cond",`Skips the next instruction if ${D.reg(opX)} != ${opNN}. `]
                case 0x5:
                    if(R.getReg(opX) == R.getReg(opY)){
                        skipNext = true;
                    }
                    M.pointer+=2;
                    return ["5XY0","Cond",`Skips the next instruction if ${D.reg(opX)} == ${D.reg(opY)}. `]
                case 0x6:
                    R.setReg(opX,opNN);
                    M.pointer+=2;
                    return ["6XNN","Const",`Sets reg${opX} = ${opNN}`]
                case 0x7:
                    R.setReg(opX, R.getReg(opX) + opNN)
                    M.pointer+=2;
                    return ["7XNN","Const",`Sets ${D.reg(opX)} += ${opNN}`]
                case 0x8:
                    switch(opN){
                        case 0x0:
                            R.setReg(opX, R.getReg(opY));
                            M.pointer+=2;
                            return ["8XY0","Assign",`Sets ${D.reg(opX)} = ${D.reg(opY)}`]
                        case 0x1:
                            R.setReg(opX, R.getReg(opX) | R.getReg(opY));
                            M.pointer+=2;
                            return ["8XY1","BitOp",`Sets ${D.reg(opX)} to ${D.reg(opX)} OR ${D.reg(opY)}`]
                        case 0x2:
                            R.setReg(opX, R.getReg(opX) & R.getReg(opY));
                            M.pointer+=2;
                            return ["8XY2","BitOp",`Sets ${D.reg(opX)} to ${D.reg(opX)} AND ${D.reg(opY)}`]
                        case 0x3:
                            R.setReg(opX, R.getReg(opX) ^ R.getReg(opY));
                            M.pointer+=2;
                            return ["8XY3","BitOp",`Sets ${D.reg(opX)} to ${D.reg(opX)} XOR ${D.reg(opY)}`]
                        case 0x4:
                            let sum = R.getReg(opX) + R.getReg(opY)
                            R.setReg(15,(sum>0xFF)?1:0)
                            R.setReg(opX, sum);
                            M.pointer+=2;
                            return ["8XY4","Math",`Sets ${D.reg(opX)} += ${D.reg(opY)}`]
                        case 0x5:
                            R.setReg(15,R.getReg(opY)>R.getReg(opX)?0:1)
                            R.setReg(opX, R.getReg(opX) - R.getReg(opY));
                            M.pointer+=2;
                            return ["8XY5","Math",`Sets ${D.reg(opX)} -= ${D.reg(opY)}`]
                        case 0x6:
                            R.setReg(15, R.getReg(opX) & 0x1)
                            R.setReg(opX, R.getReg(opX) >> 1);
                            M.pointer+=2;
                            return ["8XY6","BitOp",`Shifts ${D.reg(opX)} to the right by 1`]
                        case 0x7:
                            R.setReg(15,R.getReg(opX)>R.getReg(opY)?0:1)
                            R.setReg(opX, R.getReg(opY) - R.getReg(opX));
                            M.pointer+=2;
                            return ["8XY7","Const",`Sets ${D.reg(opX)} = ${D.reg(opY)} - ${D.reg(opX)}`]
                        case 0xE:
                            R.setReg(15, R.getReg(opX) >> 7)
                            R.setReg(opX, R.getReg(opX) << 1);
                            M.pointer+=2;
                            return ["8XYE","BitOp",`Shifts ${D.reg(opX)} to the left by 1`]
                    }
                case 0x9:
                    if(R.getReg(opX) != R.getReg(opY)){
                        skipNext = true;
                    }
                    M.pointer+=2;
                    return ["9XY0","Cond",`Skips the next instruction if ${D.reg(opX)} != ${D.reg(opY)}.`]
                case 0xA:
                    R.setReg(16, opNNN);
                    M.pointer+=2;
                    return ["ANNN","MEM",`Sets regI to adress 0x${opNNN.toString(16)}`]
                case 0xB:
                    jumpTo(opNN + R.getReg(0));
                    return ["BNNN","Flow",`Jumps to the adress ${opNNN.toString(16)} + ${D.reg(0)}`]
                case 0xC:
                    let RAND = RNG();
                    R.setReg(opX, RAND & opNN);
                    M.pointer+=2;
                    return ["CXNN","Rand",`Sets ${D.reg(opX)} = ${RAND&opNN} e.g. random(${RAND}) & ${opNN}`]
                case 0xD:
                    R.setReg(15,S.drawC8(R.getReg(opX), R.getReg(opY), M.RAM.slice(R.getReg(16),R.getReg(16)+opN)))
                    if(C.opPerCycle < 1000){
                        S.renderer()
                    } else {
                        M.drawFlag++;
                    }
                    //console.log(M.pointer,'x',R.getReg(opX),'y',R.getReg(opY),opN,R.getReg(16),M.RAM.slice(R.getReg(16),R.getReg(16)+opN));
                    M.pointer+=2;
                    return ["DXYN","Disp",`Renders a sprite at ${D.reg(opX)} and ${D.reg(opY)} with ${opN}px of h and 8 of w from memory ${D.reg(16)}`];
                case 0xE:
                    switch(opNN){
                        case 0x9E:
                            if(K.isPressed(R.getReg(opX))){
                                skipNext = true
                            }
                            M.pointer+=2
                        return ["EX9E","KeyOp",`Skips the next instruction if the key stored in ${D.reg(opX)} is pressed.`]
                        case 0xA1:
                            if(!K.isPressed(R.getReg(opX))){
                                skipNext = true
                            }
                            M.pointer+=2
                        return ["EXA1","KeyOp",`Skips the next instruction if the key stored in ${D.reg(opX)} isn't pressed.`]
                    }
                case 0xF:
                    switch (opNN) {
                        case 0x0A:
                            K.waitForNextKey().then(nextKey=>{R.setReg(opX,nextKey);M.pointer+=2;M.pauseFlag = false})
                            M.pauseFlag = true
                        return ["FX0A","KeyOp",`A key press is awaited, and then stored in ${D.reg(opX)}. (Blocking Operation)`]
                        case 0x07:
                            R.setReg(opX,M.dtimer)
                            M.pointer+=2
                            console.log(M.dtimer)
                        return ["FX07","Timer",`Sets ${D.reg(opX)} to the value of the delay timer. `]
                        case 0x15:
                            M.dtimer = R.getReg(opX)
                            M.pointer+=2
                            console.log(M.dtimer)
                        return ["FX07","Timer",`Sets the delay timer to ${D.reg(opX)}`]
                        case 0x18:
                            M.stimer = R.getReg(opX)
                            M.pointer+=2
                            console.log(M.dtimer)
                        return ["FX07","Timer",`Sets the sound timer to ${D.reg(opX)}`]
                        case 0x1E:
                            R.setReg(16,R.getReg(16) + R.getReg(opX));
                            M.pointer+=2
                        return ["FX1E","MEM",`Adds ${D.reg(opX)} to ${D.reg(16)}`]
                        case 0x29:
                            R.setReg(16,0x50+R.getReg(opX)*5)
                            M.pointer+=2
                        return ["FX1E","MEM",`Sets I to the location of the sprite for the character in VX.`]
                        case 0x33:
                            let ireg = R.getReg(16)
                            let xreg = R.getReg(opX)
                            M.RAM[ireg] = xreg / 100 >> 0
                            M.RAM[ireg+1] = xreg / 10 % 10 >> 0
                            M.RAM[ireg+2] = xreg % 100 % 10 >> 0
                            //R.setReg(16,ireg+3)
                            M.pointer+=2
                        return ["FX1E","MEM",`Sets memory at I,I+1,i+2 to VX.`]
                        case 0x55:
                            let ptr = R.getReg(16)
                            for(let u=0;u<=opX;u++){
                                M.RAM[ptr+u] = R.getReg(u)
                            }
                            M.pointer+=2
                        return ["FX55","MEM",`Dumps all registers from 0 to X to memory ${D.reg(16)}`]
                        case 0x65:
                            let xptr = R.getReg(16)
                            for(let u=0;u<=opX;u++){
                                R.setReg(u,M.RAM[xptr+u])
                            }
                            M.pointer+=2
                        return ["FX65","MEM",`Loads all registers from 0 to x from memory ${D.reg(16)}`]
                        default:
                            M.pointer+=2
                        return ["F000","UNK","<u style='color:red'>F UNKNOWN OPCODE</u>"]
                    }
                default:
                    M.pointer+=2;
                    return ["F000","UNK","<u style='color:red'>UNKNOWN OPCODE</u>"]
            }
    }
}
