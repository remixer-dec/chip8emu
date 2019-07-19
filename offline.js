export function init(){
    offlinebtn.addEventListener('click',()=>{
        swmodal.classList.remove('hidden')
        swmodalbg.classList.remove('hidden')
        getUsedData()
    })
    let closemodal = ()=>{
        swmodal.classList.add('hidden')
        swmodalbg.classList.add('hidden')
    }
    swmodalbg.addEventListener('click',closemodal)
    let checkROMS = worker => worker.active.postMessage({ action: 'check' });
    let cacheROMS = worker => worker.postMessage({ action: 'cacheROMS' });
    let cacheEROMS = worker => worker.postMessage({ action: 'cacheEXTROMS', roms:Object.values(window.ROMS).filter(r=>r.e === 1).map(f=>'https://mir3z.github.io/chip8-emu/roms/'+f.file).concat(['https://mir3z.github.io/chip8-emu/roms/roms.json'])})
    let cleanSW = worker => worker.postMessage({ action: 'clean' });
    let updateReady = worker => worker.postMessage({ action: 'refresh' });
    let getUsedData = () => {
        let quotas = (d)=>{
            infodata.setAttribute('data-no',Math.floor(d.usage/1000)+"KB");
        }
        if(navigator.storage && 'estimate' in navigator.storage){
            navigator.storage.estimate().then(quotas)
        } else {
            if('storageQuota' in navigator){
                navigator.storageQuota.queryInfo("temporary").then(quotas);
            } else {
                if(navigator.webkitTemporaryStorage){
                    navigator.webkitTemporaryStorage.queryUsageAndQuota((d)=>{
                        navigator.webkitPersistentStorage.queryUsageAndQuota(d2=>{
                            quotas({usage:d+d2})
                        })
                    })
                }
            }
        }
    }
    if('serviceWorker' in navigator && location.protocol === 'https:'){
        navigator.serviceWorker.addEventListener('message', function(event){
            let c = JSON.parse(event.data)
            if(c[0]){
                cacheromsbtn.classList.add("hidden")
                romoffline.className="yup";
            }
            if(c[1]){
                cacheeromsbtn.classList.add("hidden")
                eromoffline.className="yup";
            }
        })
        navigator.serviceWorker.register('./sw.js').then(reg=>{
            if((reg.active && reg.active.state == "activated") || reg.installing || reg.waiting){
                emuoffline.className = "yup"
                setTimeout(checkROMS,3000,reg)
                cacheromsbtn.classList.remove("hidden")
                cacheeromsbtn.classList.remove("hidden")
                cacheromsbtn.addEventListener('click',()=>{
                    cacheROMS(reg.active);
                    cacheromsbtn.remove();
                    romoffline.className="yup";
                    setTimeout(getUsedData,2000);
                });
                cacheeromsbtn.addEventListener('click',()=>{
                    cacheEROMS(reg.active);
                    cacheeromsbtn.remove();
                    eromoffline.className="yup";
                    setTimeout(getUsedData,4000);
                });
                clearswbtn.addEventListener('click',()=>{
                    cleanSW(reg.active)
                    alert("Succesfully cleaned app's cache.")
                    localStorage.clear()
                    reg.unregister();
                    setTimeout(getUsedData,1000)
                    window.getUsedData = getUsedData
                    emuoffline.className = "nope"
                    romoffline.className = "nope"
                    eromoffline.className = "nope"
                })
            }
            if(navigator.storage && navigator.storage.persist){
                navigator.storage.persisted().then(persistent=>{
                    if(persistent){
                        moredata.className = "yup"
                        xstoragebtn.classList.add("hidden")
                    } else {
                        xstoragebtn.addEventListener('click',()=>{
                             navigator.storage.persist().then(granted => {
                                 if(granted){
                                     moredata.className = "yup"
                                     xstoragebtn.classList.add("hidden")
                                 } else {
                                     alert("Unable to get permissions!");
                                 }
                             })
                        })
                    }
                });
            }
            getUsedData()

            if (!navigator.serviceWorker.controller) {
                return;
            }

            if (reg.waiting) {
                updateReady(reg.waiting);
                return;
            }
            if (reg.installing) {
                return;
            }

            reg.addEventListener('updatefound', ()=>{
                let rfr = (w)=>{
                    w.addEventListener('statechange', ()=>{
                        if(w.state === 'installed'){
                            updateReady(w)
                        }
                    })
                }
                rfr(reg.installing)
            })
        }).catch(e=>console.error('Unable to register serviceWorker!',e))
        let refreshing
        navigator.serviceWorker.addEventListener('controllerchange', ()=>{
            if (refreshing) return;
            window.location.reload();
            refreshing = true;
        });
    }
}
