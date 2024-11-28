export function setCookie(name, value, days) { 
    var expires = ""; 
    if (days) { 
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); 
        expires = "; expires=" + date.toUTCString(); 
    } 
    console.log(name + "=" + (value || "") + expires + "; path=/");
    document.cookie = name + "=" + (value || "") + expires + "; path=/"; 
    console.log(document.cookie);
}
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}
