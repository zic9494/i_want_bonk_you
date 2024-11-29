export function smoothScroll(target, duration){
    var target = document.querySelector(target)
    var TargetPosition = target.getBoundingClientRect().top + window.pageYOffset - document.querySelector('.navbar').offsetHeight
    // 目標捲動位置 = 目標頂端垂直位置 + 目前畫面所在位置 - 導行列所佔據的位置
    var startPosition = window.pageXOffset
    var distance = TargetPosition - startPosition
    var startTime = null

    function animation(currentTime){
        if (startTime == null)startTime = currentTime
        var timeElapsed = currentTime - startTime
    }

} 