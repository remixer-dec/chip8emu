export var S = {
    z:(zz, n) => {while(zz.length < n){zz = "0" + zz} return zz},
    init:function(){
        escreen.width = 64;
        escreen.height = 32;
        this.display = escreen.getContext("2d");
        S.pixels = [] = Array.apply(null, Array(2048)).map(Number.prototype.valueOf,0),
        window.S = S;
    },
    clear:function(){
        S.init();
        S.display.fillRect(0, 0, 64, 32)
    },
    renderer:function(){
        for(let i=0; i<2048; i++){
            let y = Math.floor(i / 64)
            let x = i - y * 64;
            S.drawPixel(x, y, S.pixels[i]);
        }
    },
    drawPixel:function(x, y, invert=false){
        let id = S.display.createImageData(1, 1);
        let d = id.data;
        let c = invert? 255 : 0
        d[0] = c;
        d[1] = c;
        d[2] = c;
        d[3] = 255;
        S.display.putImageData(id, x, y);
    },
    drawC8(x, y, values){
        values = values.match(/../g).map(e => S.z(parseInt("0x" + e).toString(2), 8))
        let xo = 0;//offsets
        let yo = 0;//offsets
        for(let line of values){
            let yc = (y + yo) *64
            //console.log(parseInt(line,2))
            for(let pixel of line){
                let i = yc + (x + xo)
                S.pixels[i] = S.pixels[i] ^ parseInt(pixel);
                xo += 1
            }
            y += 1
            xo = 0
        }
    }
}
window.replayPixelSate = (e) => {S.pixels = e.target.getAttribute('data-screen').split(',').map(Number); S.renderer()}
