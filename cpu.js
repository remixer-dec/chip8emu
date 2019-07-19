var C,S,R,M,D,K
var skipNext = false;
export var CPU = {
    init(r,c,s,m,d,k){
        //makes all the required parts accessible for the CPU
        C=c; S=s; R=r; M=m; D=d; K=k;
    },
    jumpTo(addr, memorize){
        if(C.damode == 1){
            if(M.pointer != addr){
                if(memorize){
                    M.stack.push(M.pointer);
                }
                M.pointer = addr;
            } else {
                if(C.gameover && !C.exmode){
                    S.gameover()
                    S.renderer()
                    if(C.gameover == 2){
                        M.pauseFlag = true;
                        return setTimeout(_=>resetbtn.click(),1000)
                    }
                }
                M.pauseFlag = true;
            }
        } else {
            M.pointer+=2;
        }
    },
    jumpBack(){
        if(C.damode == 1){
            M.pointer = M.stack.pop();
        }
        M.pointer +=2
    },
    opcodeExecutor(opcode){
        let ret = false
        let op0 = opcode >> 12 & 0xF
        let opX = opcode >> 8 & 0xF
        let opY = opcode >> 4 & 0xF
        let opN = opcode & 0xF
        let opNN = opcode & 0xFF
        let opNNN = opcode & 0xFFF
        if(skipNext && C.damode > 0){
            skipNext = false;
            M.pointer+=2;
            return C.dbgmode < 2?D.getOpcodeDescription(0):ret;
        }
        if(M.stepbystep){
            M.pauseFlag = true;
        }
        if(C.dbgmode < 2){
            ret = D.getOpcodeDescription(opcode,op0,opNNN,opNN,opN,opX,opY)
        }
        switch(opcode){
            case 0x00E0:
                S.clear()
                M.pointer+=2
                return ret;
            case 0x00EE:
                CPU.jumpBack();
                return ret;
            default:
                switch(op0){
                    case 0x0:
                        M.pointer+=2;
                        return ret;
                    case 0x1:
                        CPU.jumpTo(opNNN);
                        return ret;
                    case 0x2:
                        CPU.jumpTo(opNNN, true);
                        return ret;
                    case 0x3:
                        if(R.getReg(opX) == opNN){
                            skipNext = true;
                        }
                        M.pointer+=2;
                        return ret;
                    case 0x4:
                        if(R.getReg(opX) != opNN){
                            skipNext = true;
                        }
                        M.pointer+=2;
                        return ret;
                    case 0x5:
                        if(R.getReg(opX) == R.getReg(opY)){
                            skipNext = true;
                        }
                        M.pointer+=2;
                        return ret;
                    case 0x6:
                        R.setReg(opX,opNN);
                        M.pointer+=2;
                        return ret;
                    case 0x7:
                        R.setReg(opX, R.getReg(opX) + opNN)
                        M.pointer+=2;
                        return ret;
                    case 0x8:
                        switch(opN){
                            case 0x0:
                                R.setReg(opX, R.getReg(opY));
                                M.pointer+=2;
                                return ret;
                            case 0x1:
                                R.setReg(opX, R.getReg(opX) | R.getReg(opY));
                                M.pointer+=2;
                                return ret;
                            case 0x2:
                                R.setReg(opX, R.getReg(opX) & R.getReg(opY));
                                M.pointer+=2;
                                return ret;
                            case 0x3:
                                R.setReg(opX, R.getReg(opX) ^ R.getReg(opY));
                                M.pointer+=2;
                                return ret;
                            case 0x4:
                                let sum = R.getReg(opX) + R.getReg(opY)
                                R.setReg(15,(sum>0xFF)?1:0)
                                R.setReg(opX, sum);
                                M.pointer+=2;
                                return ret;
                            case 0x5:
                                R.setReg(15,R.getReg(opY)>R.getReg(opX)?0:1)
                                R.setReg(opX, R.getReg(opX) - R.getReg(opY));
                                M.pointer+=2;
                                return ret;
                            case 0x6:
                                if(C.altImp){
                                    R.setReg(15,R.getReg(opY) & 0x1)
                                    R.setReg(opX, R.getReg(opY) >> 1)
                                } else {
                                    R.setReg(15, R.getReg(opX) & 0x1)
                                    R.setReg(opX, R.getReg(opX) >> 1);
                                }
                                M.pointer+=2;
                                return ret;
                            case 0x7:
                                R.setReg(15,R.getReg(opX)>R.getReg(opY)?0:1)
                                R.setReg(opX, R.getReg(opY) - R.getReg(opX));
                                M.pointer+=2;
                                return ret;
                            case 0xE:
                                if(C.altImp){
                                    R.setReg(15,R.getReg(opY) >> 7)
                                    R.setReg(opX, R.getReg(opY) << 1)
                                } else {
                                    R.setReg(15, R.getReg(opX) >> 7)
                                    R.setReg(opX, R.getReg(opX) << 1);
                                }
                                M.pointer+=2;
                                return ret;
                        }
                    case 0x9:
                        if(R.getReg(opX) != R.getReg(opY)){
                            skipNext = true;
                        }
                        M.pointer+=2;
                        return ret;
                    case 0xA:
                        R.setReg(16, opNNN);
                        M.pointer+=2;
                        return ret;
                    case 0xB:
                        CPU.jumpTo(opNNN + R.getReg(0));
                        return ret;
                    case 0xC:
                        let RAND = RNG();
                        R.setReg(opX, RAND & opNN);
                        M.pointer+=2;
                        return ret;
                    case 0xD:
                        R.setReg(15,S.drawC8(R.getReg(opX), R.getReg(opY), M.RAM.slice(R.getReg(16),R.getReg(16)+opN)))
                        if(C.opPerCycle < 1000){
                            S.renderer()
                        } else {
                            M.drawFlag++;
                        }
                        M.pointer+=2;
                        return ret;
                    case 0xE:
                        switch(opNN){
                            case 0x9E:
                                if(K.isPressed(R.getReg(opX))){
                                    skipNext = true
                                }
                                M.pointer+=2
                            return ret;
                            case 0xA1:
                                if(!K.isPressed(R.getReg(opX))){
                                    skipNext = true
                                }
                                M.pointer+=2
                            return ret;
                        }
                    case 0xF:
                        switch (opNN) {
                            case 0x0A:
                                K.waitForNextKey().then(nextKey=>{R.setReg(opX,nextKey);M.pointer+=2;M.pauseFlag = false})
                                M.pauseFlag = true
                            return ret;
                            case 0x07:
                                R.setReg(opX,M.dtimer)
                                M.pointer+=2
                            return ret;
                            case 0x15:
                                M.dtimer = R.getReg(opX)
                                M.pointer+=2
                            return ret;
                            case 0x18:
                                M.stimer = R.getReg(opX)
                                M.pointer+=2
                            return ret;
                            case 0x1E:
                                R.setReg(16,R.getReg(16) + R.getReg(opX));
                                M.pointer+=2
                            return ret;
                            case 0x29:
                                R.setReg(16,0x50+R.getReg(opX)*5)
                                M.pointer+=2
                            return ret;
                            case 0x33:
                                let ireg = R.getReg(16)
                                let xreg = R.getReg(opX)
                                M.RAM[ireg] = xreg / 100 >> 0
                                M.RAM[ireg+1] = xreg / 10 % 10 >> 0
                                M.RAM[ireg+2] = xreg % 100 % 10 >> 0
                                //R.setReg(16,ireg+3)
                                M.pointer+=2
                            return ret;
                            case 0x55:
                                let j;
                                let ptr = R.getReg(16)
                                for(j=0;j<=opX;j++){
                                    M.RAM[ptr+j] = R.getReg(j)
                                }
                                if(C.altImp){
                                    R.setReg(16,ptr+j)
                                }
                                M.pointer+=2
                            return ret;
                            case 0x65:
                                let u
                                let xptr = R.getReg(16)
                                for(u=0;u<=opX;u++){
                                    R.setReg(u,M.RAM[xptr+u])
                                }
                                if(C.altImp){
                                    R.setReg(16,xptr+u)
                                }
                                M.pointer+=2
                            return ret;
                            default:
                                M.pointer+=2
                            return ret;
                        }
                    default:
                        M.pointer+=2;
                        return ret;
                }
        }
    }
}
