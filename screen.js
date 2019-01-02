export var S = {
    z:(zz, n) => {while(zz.length < n){zz = "0" + zz} return zz},
    toBinaryArray:(decimal) => {
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
    init:function(HD){
        this.w = HD?640:64;
        this.h = HD?320:32;
        escreen.width = this.w
        escreen.height = this.h
        this.display = escreen.getContext("2d");
        this.renderer = HD?this.HDrenderer:this.SDrenderer;
    },
    cleanScreen:Array.apply(null, Array(2048)).map(Number.prototype.valueOf,0),
    clear:function(){
        S.pixels = S.cleanScreen.slice(0)
    },
    HDrenderer:function(){
        let white = '#FFF'
        let black = '#000'
        S.display.fillStyle = black;
        S.display.fillRect(0,0,640,320)
        S.display.fillStyle = white;
        for(let i=0,l=S.pixels.length;i<l;i++){
            if(S.pixels[i]){
                let x = i % 64 * 10
                let y = Math.floor(i/64) * 10
                S.display.fillRect(x,y,10,10)
            }
        }
    },
    SDrenderer:function(){
        const frame = S.display.createImageData(64,32); //x,y,w,h
        const pxls = [].concat.apply([],S.pixels.map(e=>e?[255,255,255,255]:[0,0,0,255]));
        frame.data.set(new Uint8ClampedArray(pxls));
        S.display.putImageData(frame,0,0);
    },
    drawC8(x, y, values){
        values = Array.from(values)
        let xo = 0;//offsets
        let yo = 0;//offsets
        let vf = 0;
        for(let line of values){
            let yc = (y + yo) *64
            let pxline = this.toBinaryArray(line)
            for(let pixel of pxline){
                let i = yc + (x + xo)
                if(i>=2048){
                    break;
                }
                let prevPX = S.pixels[i];
                let anewPX = prevPX ^ parseInt(pixel);
                S.pixels[i] = anewPX
                if (prevPX != anewPX && anewPX === 0){
                    vf = 1
                }
                xo += 1
            }
            y += 1
            xo = 0
        }
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
    gameover:function(){
        S.pixels = this.gameOverArr
    }
}
window.replayPixelSate = (e) => {S.pixels = e.target.getAttribute('data-screen').split(',').map(Number); S.renderer()}
S.parseGameOver()
