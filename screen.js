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
    init:function(){
        escreen.width = 64;
        escreen.height = 32;
        this.display = escreen.getContext("2d");
        S.pixels = Array.apply(null, Array(2048)).map(Number.prototype.valueOf,0),
        window.S = S;
    },
    clear:function(){
        S.init();
        S.display.fillRect(0, 0, 64, 32)
    },
    renderer:function(){
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
                    console.log("Pixel buffer overflow!",i,yc,x,y,xo,yo,values)
                    break;
                }
                let prevPX = S.pixels[i];
                let anewPX = prevPX ^ parseInt(pixel);
                S.pixels[i] = anewPX
                if (prevPX != anewPX){
                    vf = 1
                }
                xo += 1
            }
            y += 1
            xo = 0
        }
        return vf;
    }
}
window.replayPixelSate = (e) => {S.pixels = e.target.getAttribute('data-screen').split(',').map(Number); S.renderer()}
