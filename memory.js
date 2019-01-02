export var M = {
    init:function(ram){
        this.pointer = 0x200
        this.stack = []
        this.pauseFlag = false
        this.stopFlag = false
        this.drawFlag = 0
        this.dtimer = 0
        this.stimer = 0
        this.RAM = ram
        this.stepbystep = false
    },
    initOnce:function(R,S){
        stopemu.addEventListener('click', (e) => {M.stopFlag = true})
        stepbtn.addEventListener('click', (e) => {M.stepbystep = true; M.pauseFlag = false;})
        plpbtn.addEventListener('click', (e) => {M.stepbystep = !M.stepbystep; M.pauseFlag = false;})
        resetbtn.addEventListener('click', (e) => {R.reset();S.clear();M.init(M.RAM)})
        this.init(false)
    }
}
