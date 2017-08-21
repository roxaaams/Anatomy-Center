export const intervalToAsync = (func: Function, interval: Number = 50): Promise =>
    new Promise((accept: Function) => {
        const timer = setInterval(() => {
            const ret = func();
            if (ret) {
                clearInterval(timer);
                accept(ret);
            }
        }, interval);
    });
