export var K = {
    pressed: new Set(),
    lastKey: 0,
    isPressed(key){
        return this.pressed.has(key)
    },
    parseKey(keyEvent){
        return parseInt(keyEvent.target.innerText,16)
    },
    keyPressEvent(keyEvent,key){
        key = key || K.parseKey(keyEvent)
        if(K.kbmode){
            return K.setKBTarget(key,keyEvent)
        }
        K.pressed.add(key)
        if(K.waiter){
            K.waiter(key);
            K.waiter = false
        }
        K.lastKey = key
    },
    keyReleaseEvent(keyEvent,key){
        key = key || K.parseKey(keyEvent)
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
        K.binds = localStorage['c8-keybinds'] ? JSON.parse(localStorage['c8-keybinds']) : K.binds
        K.btns = controls.querySelectorAll('button')
        for(let k in K.binds){
            let v = K.binds[k]
            for(let btn in btns){
                if(btn == v){
                    btns[btn].setAttribute('data-key',k)
                }
            }
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
    },
    binds:{},
    kbmode:0,
    setKeyBindMode(){
        controls.classList.toggle('keybind')
        K.kbmode = !(K.kbmode)
        if(!K.kbmode){
            let selectedKey = controls.querySelector('.keybind')
            if(selectedKey){
                selectedKey.classList.remove('keybind')
            }
            localStorage['c8-keybinds'] = JSON.stringify(K.binds)
        }
    },
    setKBTarget(key,keyEvent){
        var kbs = document.getElementsByClassName('keybind')
        if(kbs.length>1) kbs[1].classList.remove('keybind')
        keyEvent.target.classList.add('keybind')
    },
    keyboardInputListener(keyEvent){
        if(!(K.kbmode)){
            if(K.binds[keyEvent.key]){
                K.keyPressEvent(0,K.binds[keyEvent.key])
                keyEvent.preventDefault()
            }
        } else{
            if(keyEvent.key == 'Escape'){
                return K.setKeyBindMode()
            }
            var selectedKey = controls.querySelector('.keybind')
            if(selectedKey){
                var emuKey = K.parseKey({target:selectedKey});
                //if key is already used
                if(K.binds[keyEvent.key]){
                    let prevKeyBtn = controls.querySelector('button[data-key="'+event.key+'"]')
                    if(prevKeyBtn){
                        prevKeyBtn.setAttribute('data-key','');
                    }
                }
                var prev = Object.keys(K.binds).find(key => K.binds[key] === emuKey)
                if(prev){
                    delete K.binds[prev]
                }
                //add binding
                K.binds[keyEvent.key] = emuKey
                selectedKey.setAttribute('data-key',keyEvent.key)
                selectedKey.classList.remove('keybind')
            }
        }
    },
    keyboardUpListener(keyEvent){
        if(K.binds[keyEvent.key]){
            K.keyReleaseEvent(0,K.binds[keyEvent.key])
        }
    }
}
window.addEventListener('keydown',K.keyboardInputListener);
window.addEventListener('keyup',K.keyboardUpListener);
keybindbtn.addEventListener('click',K.setKeyBindMode)
window.K = K
