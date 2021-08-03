const serviceWorkerFileName = 'service-worker.js';
const swInstalledEvent = 'installed';
const staticCachePrefix = 'blazor-cache-v';
const updateAlertMessage = '有可用更新. 重新加载页面以启用.';
const blazorAssembly = 'NewCngalWebSite.Shared';
const blazorInstallMethod = 'PWAInstallable';

window.updateAvailable = new Promise(function (resolve, reject) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(serviceWorkerFileName)
            .then(function (registration) {
                console.log('成功注册，上下文是：', registration.scope);
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    installingWorker.onstatechange = () => {
                        switch (installingWorker.state) {
                            case swInstalledEvent:
                                if (navigator.serviceWorker.controller) {
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                                break;
                            default:
                        }
                    };
                };
            })
            .catch(error =>
                console.log('服务工作进程注册失败，错误是：', error));
    }
});

window['updateAvailable']
    .then(isAvailable => {
        if (isAvailable) {
            alert(updateAlertMessage);
        }
    });

function showAddToHomeScreen() {
    DotNet.invokeMethodAsync(blazorAssembly, blazorInstallMethod)
        .then(function () { }, function (er) { setTimeout(showAddToHomeScreen, 1000); });
}

window.BlazorPWA = {
    installPWA: function () {
        if (window.PWADeferredPrompt) {
            window.PWADeferredPrompt.prompt();
            window.PWADeferredPrompt.userChoice
                .then(function (choiceResult) {
                    window.PWADeferredPrompt = null;
                });
        }
    }
};

window.addEventListener('beforeinstallprompt', function (e) {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    window.PWADeferredPrompt = e;

    showAddToHomeScreen();
});
