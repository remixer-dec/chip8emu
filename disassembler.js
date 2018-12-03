import {R} from './registers.js'
import {S} from './screen.js'
var pointer = 512;
var stack = [];
var mode = parseInt(damode.value)
var skipNext = false;
var rom = false
damode.addEventListener('change', (e) => {mode = parseInt(e.originalTarget.value)});
export function visualize(hexrom){
    rom = hexrom;
    S.init();
    S.clear();
    let o4b = "";
    let output = "";
    let i = 0;

    pointer = 512;
    stack = [];
    while(pointer < 512 + hexrom.length){
        o4b = hexrom.substr(pointer - 512, 4);
        output += getReadableInstruction(pointer, o4b);
        pointer+=4;
        i++;
        if(i == 1190){
            output += "<h1>LOOP</h1>";
            break
        }
    }
    opcodeview.innerHTML = output;
}
function getReadableInstruction(addr, instr){
    return `0x${adrNormalizer(addr,2)} | ${instr} | ${opcodeExecutor(instr)[2]} <b data-screen="${S.pixels}" onmouseover="replayPixelSate(event)">[S]</b><b data-state="${R.getState()}" onmouseover="replayRegState(event)">[R]</b><br>`;
}

function adrNormalizer(decval, zeroes){
    let q = ((decval - 0x200) / 2 + 0x200).toString(16);
    while(q.length<zeroes){
        q = "0" + q;
    }
    return q.toUpperCase()
}
function reg(regID){
    return `<u t="reg${regID}" h="${R.getReg(regID)}"></u>`;
}
function jumpTo(addr, memorize){
    if(mode == 1){
        let setaddr = (addr - 0x200) / 2 + 0x200 - 4;
        if((pointer - 0x200) / 2 + 0x200 != addr){
            if(memorize){
                stack.push(pointer);
            }
            pointer = setaddr;
        } else {
            console.log(`END`);
        }
    }
}
function jumpBack(){
    pointer = stack.pop();
}
function opcodeExecutor(opcode){
    let op0 = parseInt("0x" + opcode[0])
    let opX = parseInt("0x" + opcode[1])
    let opY = parseInt("0x" + opcode[2])
    let opN = parseInt("0x" + opcode[3])
    let opNN = parseInt("0x" + opcode[2] +opcode[3])
    let opNNN = parseInt("0x" + opcode[1] + opcode[2] + opcode[3])
    if(skipNext && mode > 0){
        skipNext = false;
        return ["???","UNKN","*SKIPPED*"];
    }
    switch(opcode){
        case "00E0":
            return ["00E0","Display","Clears the screen"]
        case "00EE":
            //jumpBack();
            return ["00EE","Flow","Returns from a subroutine"]
        default:
            switch(opcode[0]){
                case '0':
                    return ["0NNN","Call","Calls RCA 1802 programm at adress 0x"+opNNN.toString(16)]
                case '1':
                    jumpTo(opNNN);
                    return ["1NNN","Flow","Jumps to adress 0x"+opNNN.toString(16)]
                case '2':
                    //jumpTo(opNNN, true);
                    return ["2NNN","Flow","Calls subroutine at 0x"+opNNN.toString(16)]
                case '3':
                    if(R.getReg(opX) == opNN){
                        skipNext = true;
                    }
                    return ["3XNN","Cond",`Skips the next instruction if ${reg(opX)} == ${opNN}. `]
                case '4':
                    if(R.getReg(opX) != opNN){
                        skipNext = true;
                    }
                    return ["4XNN","Cond",`Skips the next instruction if ${reg(opX)} != ${opNN}. `]
                case '5':
                    if(R.getReg(opX) == R.getReg(opY)){
                        skipNext = true;
                    }
                    return ["5XY0","Cond",`Skips the next instruction if ${reg(opX)} == ${reg(opY)}. `]
                case '6':
                    R.setReg(opX,opNN);
                    return ["6XNN","Const",`Sets reg${opX} = ${opNN}`]
                case '7':
                    R.setReg(opX, R.getReg(opX) + opNN);
                    return ["7XNN","Const",`Sets ${reg(opX)} += ${opNN}`]
                case '8':
                    switch(opcode[3]){
                        case '0':
                            R.setReg(opX, R.getReg(opY));
                            return ["8XY0","Assign",`Sets ${reg(opX)} = ${reg(opY)}`]
                        case '1':
                            R.setReg(opX, R.getReg(opX) | R.getReg(opY));
                            return ["8XY1","BitOp",`Sets ${reg(opX)} to ${reg(opX)} OR ${reg(opY)}`]
                        case '2':
                            R.setReg(opX, R.getReg(opX) & R.getReg(opY));
                            return ["8XY2","BitOp",`Sets ${reg(opX)} to ${reg(opX)} AND ${reg(opY)}`]
                        case '3':
                            R.setReg(opX, R.getReg(opX) ^ R.getReg(opY));
                            return ["8XY3","BitOp",`Sets ${reg(opX)} to ${reg(opX)} XOR ${reg(opY)}`]
                        case '4':
                            R.setReg(opX, R.getReg(opX) + R.getReg(opY));
                            return ["8XY4","Math",`Sets ${reg(opX)} += ${reg(opY)}`]
                        case '5':
                            R.setReg(opX, R.getReg(opX) - R.getReg(opY));
                            return ["8XY5","Math",`Sets ${reg(opX)} -= ${reg(opY)}`]
                        case '6':
                            R.setReg(opX, R.getReg(opX) >> 1);
                            return ["8XY6","BitOp",`Shifts ${reg(opX)} to the right by 1`]
                        case '7':
                            R.setReg(opX, R.getReg(opY) - R.getReg(opX));
                            return ["8XY7","Const",`Sets ${reg(opX)} = ${reg(opY)} - ${reg(opX)}`]
                        case 'E':
                            R.setReg(opX, R.getReg(opX) << 1);
                            return ["8XYE","BitOp",`Shifts ${reg(opX)} to the left by 1`]
                    }
                case '9':
                    if(R.getReg(opX) != R.getReg(opY)){
                        skipNext = true;
                    }
                    return ["9XY0","Cond",`Skips the next instruction if ${reg(opX)} != ${reg(opY)}.`]
                case 'A':
                    R.setReg(16, opNNN);
                    return ["ANNN","MEM",`Sets regI to adress 0x${opNNN.toString(16)}`]
                case 'B':
                    jumpTo(opNN + R.getReg(0));
                    return ["BNNN","Flow",`Jumps to the adress ${opNNN.toString(16)} + reg0`]
                case 'C':
                    let RAND = RNG();
                    R.setReg(opX, RAND & opNN);
                    return ["CXNN","Rand",`Sets ${reg(opX)} = (${RAND}) e.g. random(0,255) & ${opNN}`]
                case 'D':
                    S.drawC8(R.getReg(opX), R.getReg(opY), rom.substr((R.getReg(16) - 512) * 2, 2 * opN))
                    S.renderer();
                    return ["DXYN","Disp",`Renders a sprite at ${reg(opX)} and ${reg(opY)} with ${opN}px of height and 8 of width from memory regI`];
                default:
                    return ["F000","UNK","NOT IMPLEMENTED"]

            }
    }
}
