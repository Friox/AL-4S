function convertHMS(time) {
    let success = true
    let sec = [ 1, 60, 3600 ]
    let times = time.split(':')
    let ms = 0
    if (times.length >= 1 && times.length <= 3) {
        for (let i = times.length - 1, idx = 0; i >= 0; i--, idx++) {
            const temp = parseInt(times[i])
            if (!isNaN(temp)) {
                // 정상일때
                if (temp >=0 && temp <= ((i != 2) ? 59 : 60)) ms += temp * sec[idx] * 1000
                else {
                    success = false
                    break
                }
            } else {
                success = false
                break
            }
        }
    } else {
        // 잘못된 형식
        success = false
    }
    return ms
}

function convertMSAll(ms) {
    // 시간, 분, 초를 계산합니다.
    ms /= 1000
    const hours = Math.floor(ms / 3600);
    const minutes = Math.floor((ms % 3600) / 60);
    const secs = ms % 60;

    // 결과 문자열을 '시:분:초' 형식으로 만듭니다. 각 항목이 한 자리 숫자일 경우, 앞에 '0'을 붙입니다.
    let result = [
        hours.toString().padStart(2, '0'), 
        minutes.toString().padStart(2, '0'), 
        secs.toString().padStart(2, '0')
    ].join(':');
    

    return result;
}

function convertSec(value) {
    // value = Math.floor(value / 1000)
    // 시간, 분, 초를 계산합니다.
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const secs = value % 60;

    // 결과 배열을 초기화합니다.
    let resultParts = [];

    // 시간이 있을 경우만 시간을 결과 배열에 추가합니다.
    if (hours > 0) {
        resultParts.push(hours.toString().padStart(2, '0'));
    }

    // 분은 무조건 결과 배열에 추가합니다. 시간이 없더라도 분을 표시합니다.
    resultParts.push(minutes.toString().padStart(2, '0'));

    // 초는 항상 결과 배열에 추가합니다.
    resultParts.push(secs.toString().padStart(2, '0'));

    // 결과 문자열을 반환합니다.
    return resultParts.join(':');
}

module.exports = { convertSec }