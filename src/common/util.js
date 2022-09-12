export const randomInt = ({ max, min }) => (
    Math.floor(Math.random() * max) + min
);

export const setLoadAllCallback = (elements, callback) => {
    let count = 0;
    for (var i = 0; i < elements.length; ++i) {
        elements[i].onload = function () {
            ++count;
            if (count == elements.length) {
                callback(elements);
            }
        };
    }
};

export const getTime = function () {
    return new Date().getTime();
}

export const isSmartPhone = () => {
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        return true;
    } else {
        return false;
    }
}