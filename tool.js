function tool(){

    // min ~ (max - 1) 사이의 정수 하나를 반환함
    this.getRandomNum = function(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }
}

module.exports = tool;