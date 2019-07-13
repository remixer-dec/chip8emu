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
        key = key || ((key === 0) ? 0 : (K.lastMDownKey = K.parseKey(keyEvent)))
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
        key = key || ((key === 0) ? 0 : K.parseKey(keyEvent))
        K.pressed.delete(key)
    },
    init(C){
        this.C = C;
        for(let btn of controls.children){
            btn.addEventListener('mousedown',K.keyPressEvent)
            btn.addEventListener('mouseup',K.keyReleaseEvent)
            btn.addEventListener('touchstart',K.keyPressEvent)
            btn.addEventListener('touchend',K.keyReleaseEvent)
            window.addEventListener('mouseup',K.outsideUpEvent)
            window.addEventListener('touchend',K.outsideUpEvent)
        }
        K.binds = localStorage['c8-keybinds'] ? JSON.parse(localStorage['c8-keybinds']) : K.binds
        let btns = controls.querySelectorAll('button')
        for(let k in K.binds){
            let v = K.binds[k]
            for(let btn in btns){
                if(btns[btn].innerText == v.toString(16).toUpperCase()){
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
            if(keyEvent.key in K.binds){
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
                if(keyEvent.key in K.binds){
                    let prevKeyBtn = controls.querySelector('button[data-key="'+keyEvent.key+'"]')
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
        if(keyEvent.key in K.binds){
            K.keyReleaseEvent(0,K.binds[keyEvent.key])
        }
    },
    lastMDownKey:0,
    outsideUpEvent(){//if click is released outside of button area
        if(K.lastMDownKey){
            K.keyReleaseEvent(0,K.lastMDownKey)
        }
    }
}
window.addEventListener('keydown',K.keyboardInputListener);
window.addEventListener('keyup',K.keyboardUpListener);
keybindbtn.addEventListener('click',K.setKeyBindMode)
window.K = K
