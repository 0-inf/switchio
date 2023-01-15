function EventManager(Screen, Client) {

    const KeyCodeList = {
        ' ': 0, '1': 1, '2': 2, '3': 3, '4': 4,
        '5': 5, '6': 6, '7': 7, '8': 8,
        'ArrowUp': 9, 'ArrowDown': 10, 'ArrowRight': 11, 'ArrowLeft': 12,
        'w': 9, 's': 10, 'd': 11, 'a': 12,
        // shift + (1-9) 키보드 위쪽의 숫자키가 이모지 사용버튼
        'Shift': 13, '!':14, '@':15, '#':16, '$':17, '%':18, '^':19, '&':20, '*':21
    }

    window.addEventListener('resize', function () {
        Screen.Resize();
    });

    window.addEventListener('keydown', function (e) {
        if (e.key in KeyCodeList) {
            Client.PressedKeys[KeyCodeList[e.key]] = 1;
        }
    });

    window.addEventListener('keyup', function (e) {
        if (e.key in KeyCodeList) {
            Client.PressedKeys[KeyCodeList[e.key]] = 0;
        }
    });

    Screen.UIelement.addEventListener('mousemove', function (e) {
        Screen.mouseX = e.offsetX / Screen.scale - window.XfixStart;
        Screen.mouseY = e.offsetY / Screen.scale - window.YfixStart;
    });

    Screen.UIelement.addEventListener('click', function (e) {
        Screen.mouseClick = true;
    });
    
}