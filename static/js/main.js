var tool = new Tool({
    debug: !/github\.io$/.test(window.location.hostname)
}, Settings, Storage, Dom, Options);
