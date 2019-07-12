export var S = {
    z(zz, n){while(zz.length < n){zz = "0" + zz} return zz},
    toBinaryArray(decimal){
    	return [
            (decimal & 128) >> 7,
            (decimal & 64) >> 6,
            (decimal & 32) >> 5,
            (decimal & 16) >> 4,
            (decimal & 8) >> 3,
            (decimal & 4) >> 2,
            (decimal & 2) >> 1,
            decimal & 1
        ]
    },
    init(HD,C){
        this.color1 = document.body.classList.contains('dark') ? '#283300' : '#FFF';
        this.color2 = document.body.classList.contains('dark') ? '#7B8637' : '#000';
        this.w = HD?640:64;
        this.h = HD?320:32;
        this.C = C
        this.vfframe = 0
        this.skipped = 0
        escreen.width = this.w
        escreen.height = this.h
        this.display = escreen.getContext("2d");
        this.renderer = HD?this.HDrenderer:this.SDrenderer;
    },
    cleanScreen:Array.apply(null, Array(2048)).map(Number.prototype.valueOf,0),
    clear(){
        S.pixels = S.cleanScreen.slice(0)
    },
    antiBlinker(){
        if(this.C.antiblink){
            if(this.C.antiblink == 2 && this.skipped > 1 && !this.vfframe){
                this.skipped = this.skipped == 2 ? 0 : this.skipped - 1;
                return true
            }
            if(this.vfframe){
                this.skipped++
                return true
            } else {
                this.skipped = 0;
            }
        }
        return false
    },
    HDrenderer(){
        if(S.antiBlinker()) return
        S.display.fillStyle = S.color2;
        S.display.fillRect(0,0,640,320)
        S.display.fillStyle = S.color1;
        for(let i=0,l=S.pixels.length;i<l;i++){
            if(S.pixels[i]){
                let x = i % 64 * 10
                let y = Math.floor(i/64) * 10
                S.display.fillRect(x,y,10,10)
            }
        }
    },
    SDrenderer(){
        if(S.antiBlinker()) return
        const w = [255,255,255,255]
        const b = [0,0,0,255]
        const frame = S.display.createImageData(64,32); //x,y,w,h
        const pxls = [].concat.apply([],S.pixels.map(e=>e?w:b));
        frame.data.set(new Uint8ClampedArray(pxls));
        S.display.putImageData(frame,0,0);
    },
    drawC8(x, y, values){
        values = Array.from(values)
        let xo = 0;//offsets
        let yo = 0;//offsets
        let vf = 0;
        for(let z=0,zl=values.length;z<zl;z++){
            let yc = (y + yo)
            let pxline = this.toBinaryArray(values[z])
            for(let j=0,jl=pxline.length;j<jl;j++){
                let xc = x + xo
                let i = yc *64 + xc
                if(xc>=64||yc>=32){
                    break;
                }
                let prevPX = S.pixels[i];
                let anewPX = prevPX ^ pxline[j];
                S.pixels[i] = anewPX
                if (prevPX != anewPX && anewPX === 0){
                    vf = 1
                }
                xo += 1
            }
            y += 1
            xo = 0
        }
        this.vfframe = vf
        return vf;
    },
    gameoverstr:"0x532,1x5,0x2,1x4,0x2,1x2,0,1x2,0,1x5,0x40,1,0x6,1,0x2,1,0x2,1,0,1,0,1,0,1,0x44,1,0,\
1x3,0x2,1,0x2,1,0x2,1,0,1,0,1,0,1,0x44,1,0x3,1,0,1x6,0,1,0x3,1,0,1x3,0x42,1,0x2,1x2,0,1,0x3,1x2,0,1,\
0x2,1x2,0,1x2,0x43,1,0x2,1x2,0,1,0x3,1x2,0,1,0x2,1x2,0,1x2,0x43,1x5,0,1,0x3,1x2,0,1,0x2,1x2,0,1x5,\
0x104,1x5,0,1,0x4,1,0,1x5,0,1x5,0x40,1,0x3,1,0,1,0x4,1,0,1,0x5,1,0x3,1,0x40,1,0x2,1x2,0,1,0x3,1x2,0,\
1,0x5,1x5,0x40,1,0x2,1x2,0,1,0x3,1x2,0,1x3,0x3,1,0x2,1,0x41,1,0x2,1x2,0,1x2,0x2,1x2,0,1x2,0x4,1x2,0,\
1x2,0x40,1,0x2,1x2,0x2,1,0x2,1,0x2,1x2,0x4,1x2,0x2,1,0x40,1x5,0x3,1x2,0x3,1x5,0,1x2,0x2,1,0x595",
    parseGameOver(){
        let pieces = S.gameoverstr.split(",");
        let pixels = []
        for(let piece of pieces){
            if(piece.length == 1){
                pixels.push(parseInt(piece))
            } else {
                let tmp = piece.split("x");
                for(let i=0;i<tmp[1];i++){
                    pixels.push(parseInt(tmp[0]));
                }
            }
        }
        S.gameOverArr = pixels;
    },
    gameover(){
        S.pixels = this.gameOverArr
    }
}
window.replayPixelSate = (e) => {S.pixels = e.target.getAttribute('data-screen').split(',').map(Number); S.renderer()}
S.parseGameOver()
