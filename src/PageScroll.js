export function smoothScroll(target, duration){
    var target = document.querySelector(target)
    var TargetPosition = target.getBoundingClientRect().top + window.pageYOffset - document.querySelector('.navbar').offsetHeight
    // 目標捲動位置 = 目標頂端垂直位置 + 目前畫面所在位置 - 導行列所佔據的位置
    var startPosition = window.pageYOffset
    var distance = TargetPosition - startPosition
    var startTime = null
    
    function animation(currentTime){
        if (startTime === null)startTime = currentTime
        var timeElapsed = currentTime - startTime
        var run = ease(timeElapsed, startPosition, distance, duration)
        window.scrollTo(0, run)
        if (timeElapsed < duration) requestAnimationFrame(animation)
    }
    //緩慢移動的函式
    function ease(NowTime, StartTime, distance, during){
        NowTime = NowTime/(during/2) //找到動畫總時間的中點，用於分隔加速段與減速段
        if (NowTime<1)return distance / 2 * NowTime * NowTime + StartTime
        //處於加速段，回傳二次緩動方程式所計算出的距離變化
        NowTime--
        return -distance / 2 * (NowTime * (NowTime -2) - 1) + StartTime
        //減速段的緩動方程式函數
    }
    requestAnimationFrame(animation)
}
export function Generate_Game_Page(){
    
}