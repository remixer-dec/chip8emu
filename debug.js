export var D = {
    init(R,C,S){
        this.R = R;
        this.C = C;
        this.S = S;
    },
    adrNormalizer(decval, zeroes){
        let q = decval.toString(16);
        while(q.length<zeroes){
            q = "0" + q;
        }
        return q.toUpperCase()
    },
    reg(regID){
        let regX = regID.toString(16).toUpperCase();
        regX = regX === '10' ? 'I': regX
        return `<u t="v${regX}" h="${this.R.getReg(regID)}"></u>`;
    },
    getReadableInstruction(addr, instr, opcodeData){
        let rstate = this.R.getState();
        if(this.C.regmode){
            this.R.visualizeState(rstate)
        }
        let states = this.C.dbgmode == 0 ? `<b data-screen="${this.S.pixels}" onmouseover="replayPixelSate(event)">[S]</b><b data-state="${rstate}" onmouseover="replayRegState(event)">[R]</b>`:"";
        return `<div>0x${D.adrNormalizer(addr,2)} | ${D.adrNormalizer(instr,4)} | ${opcodeData[2]} ${states}</div>`;
    },
    getOpcodeDescription(opcode,op0,opNNN,opNN,opN,opX,opY){
        switch(opcode){
            case 0x0000:
                return ["0000","SKIP","*SKIPPED*"]
            case 0x00E0:
                return ["00E0","Display","Clears the screen"]
            case 0x00EE:
                return ["00EE","Flow","Returns from a subroutine"]
            default:
                switch(op0){
                    case 0x0:
                        return ["0NNN","Call","Calls RCA 1802 programm at adress 0x"+opNNN.toString(16)]
                    case 0x1:
                        return ["1NNN","Flow","Jumps to adress 0x"+opNNN.toString(16)]
                    case 0x2:
                        return ["2NNN","Flow","Calls subroutine at 0x"+opNNN.toString(16)]
                    case 0x3:
                        return ["3XNN","Cond",`Skips the next instruction if ${D.reg(opX)} == ${opNN}. `]
                    case 0x4:
                        return ["4XNN","Cond",`Skips the next instruction if ${D.reg(opX)} != ${opNN}. `]
                    case 0x5:
                        return ["5XY0","Cond",`Skips the next instruction if ${D.reg(opX)} == ${D.reg(opY)}. `]
                    case 0x6:
                        return ["6XNN","Const",`Sets ${D.reg(opX)} = ${opNN}`]
                    case 0x7:
                        return ["7XNN","Const",`Sets ${D.reg(opX)} += ${opNN}`]
                    case 0x8:
                        switch(opN){
                            case 0x0:
                                return ["8XY0","Assign",`Sets ${D.reg(opX)} = ${D.reg(opY)}`]
                            case 0x1:
                                return ["8XY1","BitOp",`Sets ${D.reg(opX)} to ${D.reg(opX)} OR ${D.reg(opY)}`]
                            case 0x2:
                                return ["8XY2","BitOp",`Sets ${D.reg(opX)} to ${D.reg(opX)} AND ${D.reg(opY)}`]
                            case 0x3:
                                return ["8XY3","BitOp",`Sets ${D.reg(opX)} to ${D.reg(opX)} XOR ${D.reg(opY)}`]
                            case 0x4:
                                return ["8XY4","Math",`Sets ${D.reg(opX)} += ${D.reg(opY)}`]
                            case 0x5:
                                return ["8XY5","Math",`Sets ${D.reg(opX)} -= ${D.reg(opY)}`]
                            case 0x6:
                                return ["8XY6","BitOp",`Shifts ${D.reg(opX)} to the right by 1`]
                            case 0x7:
                                return ["8XY7","Const",`Sets ${D.reg(opX)} = ${D.reg(opY)} - ${D.reg(opX)}`]
                            case 0xE:
                                return ["8XYE","BitOp",`Shifts ${D.reg(opX)} to the left by 1`]
                        }
                    case 0x9:
                        return ["9XY0","Cond",`Skips the next instruction if ${D.reg(opX)} != ${D.reg(opY)}.`]
                    case 0xA:
                        return ["ANNN","MEM",`Sets vI to adress 0x${opNNN.toString(16)}`]
                    case 0xB:
                        return ["BNNN","Flow",`Jumps to the adress ${opNNN.toString(16)} + ${D.reg(0)}`]
                    case 0xC:
                        return ["CXNN","Rand",`Sets ${D.reg(opX)} =  random(0,255) & ${opNN}`]
                    case 0xD:
                        return ["DXYN","Disp",`Renders a sprite at ${D.reg(opX)} and ${D.reg(opY)} with ${opN}px of h and 8 of w from memory ${D.reg(16)}`];
                    case 0xE:
                        switch(opNN){
                            case 0x9E:
                            return ["EX9E","KeyOp",`Skips the next instruction if the key stored in ${D.reg(opX)} is pressed.`]
                            case 0xA1:
                            return ["EXA1","KeyOp",`Skips the next instruction if the key stored in ${D.reg(opX)} isn't pressed.`]
                        }
                    case 0xF:
                        switch (opNN) {
                            case 0x0A:
                            return ["FX0A","KeyOp",`A key press is awaited, and then stored in ${D.reg(opX)}. (Blocking Operation)`]
                            case 0x07:
                            return ["FX07","Timer",`Sets ${D.reg(opX)} to the value of the delay timer. `]
                            case 0x15:
                            return ["FX07","Timer",`Sets the delay timer to ${D.reg(opX)}`]
                            case 0x18:
                            return ["FX07","Timer",`Sets the sound timer to ${D.reg(opX)}`]
                            case 0x1E:
                            return ["FX1E","MEM",`Adds ${D.reg(opX)} to ${D.reg(16)}`]
                            case 0x29:
                            return ["FX1E","MEM",`Sets I to the location of the sprite for the character in VX.`]
                            case 0x33:
                            return ["FX1E","MEM",`Sets memory at I,I+1,i+2 to VX.`]
                            case 0x55:
                            return ["FX55","MEM",`Dumps all registers from 0 to X to memory ${D.reg(16)}`]
                            case 0x65:
                            return ["FX65","MEM",`Loads all registers from 0 to x from memory ${D.reg(16)}`]
                            default:
                            return ["F000","UNK","<u style='color:red'>F UNKNOWN OPCODE</u>"]
                        }
                    default:
                        return ["F000","UNK","<u style='color:red'>UNKNOWN OPCODE</u>"]
                }
        }
    }
}
