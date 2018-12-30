export var K = {
    pressed: new Set(),
    lastKey: 0,
    isPressed: function(key){
        return this.pressed.has(key)
    },
    keyPressEvent: function(key){
        this.pressed.add(key)
        if(this.waiter){
            this.waiter(key);
            this.waiter = false
        }
        this.lastKey = key
    },
    keyReleaseEvent: function(key){
        this.pressed.delete(key)
    },
    init: function(C){
        this.C = C;
        for(let btn of controls.children){
            btn.addEventListener('mousedown',e=>{K.keyPressEvent(parseInt(e.target.innerText,16))})
            btn.addEventListener('mouseup',e=>{K.keyReleaseEvent(parseInt(e.target.innerText,16))})
        }
        window.K = K
    },
    waiter: false,
    waitForNextKey: function(){
        return new Promise((rs,rj)=>{
            if(K.pressed.size > 0 && K.C.btnSticking){
                rs(K.lastKey)
            } else {
                this.waiter = rs;
            }
        })
    }
}
