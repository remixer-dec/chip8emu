export var K = {
    pressed: new Set(),
    lastKey: 0,
    isPressed(key){
        return this.pressed.has(key)
    },
    parseKey(keyEvent){
        return parseInt(keyEvent.target.innerText,16)
    },
    keyPressEvent(keyEvent){
        let key = K.parseKey(keyEvent)
        K.pressed.add(key)
        if(K.waiter){
            K.waiter(key);
            K.waiter = false
        }
        K.lastKey = key
    },
    keyReleaseEvent(keyEvent){
        let key = K.parseKey(keyEvent)
        K.pressed.delete(key)
    },
    init(C){
        this.C = C;
        for(let btn of controls.children){
            btn.addEventListener('mousedown',K.keyPressEvent)
            btn.addEventListener('mouseup',K.keyReleaseEvent)
            btn.addEventListener('touchstart',K.keyPressEvent)
            btn.addEventListener('touchend',K.keyReleaseEvent)
        }
    },
    waiter: false,
    waitForNextKey(){
        return new Promise((rs,rj)=>{
            if(K.pressed.size > 0 && K.C.btnSticking){
                rs(K.lastKey)
            } else {
                this.waiter = rs;
            }
        })
    }
}
