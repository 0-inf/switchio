function RenderingManager(Screen, Client) {

    Screen.BGctx.imageSmoothingEnabled = false;
    Screen.UIctx.imageSmoothingEnabled = false;
    const image = {};
    LoadImage(Screen.BGctx, image);

    Screen.Resize = function () {
        if (window.innerWidth * 9 < window.innerHeight * 16) {
            Screen.scale = window.innerWidth / 1600 * 0.8;
        } else {
            Screen.scale = window.innerHeight / 900 * 0.8;
        }
        window.XfixStart = (window.innerWidth - Screen.scale * 1600) * 0.5 / Screen.scale;
        window.YfixStart = (window.innerHeight - Screen.scale * 900) * 0.5 / Screen.scale;
        Screen.BGelement.width = window.innerWidth; Screen.BGelement.height = window.innerHeight;
        Screen.UIelement.width = window.innerWidth; Screen.UIelement.height = window.innerHeight;
        Screen.BGctx.scale(Screen.scale, Screen.scale);
        Screen.UIctx.scale(Screen.scale, Screen.scale);
        Screen.BGupDateNeed = true;
    }

    Screen.Create = function (ScreenName) {

        this.name = ScreenName;
        this.ScreenData = { // 새로운 화면 만들때 여기다가 추가해주면 됨 fillColor나 strokeColor 없으면 fillColor/strokeColor: false 로 하기
                            // 버튼이 단색이 아닌 이미지라면 fillColor를 "iamge" 로 하고 storkeColor를 이미지 오브젝트로, textData는 false로 하기
            "alert": function () {
                for (i = 0; i < Screen.AlertData.length; i++) {
                    drawText(Screen.UIctx, 800, i * 100 + 100, 55, 0, `rgba(0, 0, 0, ${1 / 30 * Screen.AlertData[i][1]})`, false, false, Screen.AlertData[i][0], "center");
                }
            },
            "foreveryone": function () {
                Screen.control = {};
                Screen.control.mode = 0; // 0 : emoji, 1 : switch
                drawCircle(Screen.UIctx, 120-window.XfixStart, 780-YfixStart,100, "rgba(200,200,200,0.5)", "rgb(128,128,128)", 5);
                drawCircle(Screen.UIctx, 1480-window.XfixStart, 780-YfixStart,100, "rgba(200,200,200,0.5)", "rgb(128,128,128)", 5);
                if(Screen.control.mode === 0) {
                    Screen.UIctx.drawImage(image.switchButton, 45 + window.XfixStart, 45+window.YfixStart, 50, 50);
                    Screen.emoji.show = 1;
                }else{
                    Screen.UIctx.drawImage(image.emoji[2], 45 + window.XfixStart, 45+window.YfixStart, 50, 50);
                }
                if(Screen.mouseClick){
                    if(Math.abs(Screen.mouseX - 45) < 25 && Math.abs(Screen.mouseY - 45) < 25){
                        Screen.control.mode = 1 - Screen.control.mode;
                        Screen.mouseClick = false;
                    }
                    if(Math.sqrt(Math.pow((Screen.mouseX - 120),2) + Math.pow((Screen.mouseY-780),2)) < 100){
                        drawCircle(Screen.UIctx, Screen.mouseX + window.XfixStart, Screen.mouseY + window.YfixStart, 30, "rgb(128,128,128)", "rgb(128,128,128)", 5);
                        if(Math.sqrt(Math.pow((Screen.mouseX - 120),2) + Math.pow((Screen.mouseY-780),2)) > 30){
                            let angle = (Math.atan2(Screen.mouseY-780, Screen.mouseX - 120)*180)/Math.PI;
                            if(angle > -67.5 && angle < 67.5){
                                Client.PressedKeys[11] = 1;
                            }else{
                                Client.PressedKeys[11] = 0;
                            }
                            if(angle > 157.5 && angle < -157.5){
                                Client.PressedKeys[12] = 1;
                            }else{
                                Client.PressedKeys[12] = 0;
                            }
                            if(angle > 22.5 && angle < 157.5){
                                Client.PressedKeys[9] = 1;
                            }else{
                                Client.PressedKeys[9] = 0;
                            }
                            if(angle > -157.5 && angle < -22.5){
                                Client.PressedKeys[10] = 1;
                            }else{
                                Client.PressedKeys[10] = 0;
                            }
                        }
                    }else{
                        drawCircle(Screen.UIctx, 120, 780, 30, "rgb(128,128,128)", "rgb(128,128,128)", 5);
                    }
                    if(Math.sqrt(Math.pow((Screen.mouseX - 1480),2) + Math.pow((Screen.mouseY-780),2)) < 100){
                        drawCircle(Screen.UIctx, Screen.mouseX + window.XfixStart, Screen.mouseY + window.YfixStart, 30, "rgb(128,128,128)", "rgb(128,128,128)", 5);
                    }else{
                        drawCircle(Screen.UIctx, 1480, 780, 30, "rgb(128,128,128)", "rgb(128,128,128)", 5);
                    }
                }
            },
            "agreement": function () {
                drawRoundedRect(Screen.BGctx, 800, 450, 1500, 840, "#9f9f9f", "#7f7f7f", 8, 10);
                drawText(Screen.BGctx, 800, 100, 55, 0, "#000000", false, false, "이 웹사이트는 소리재생과 쿠키의 생성,삭제를 합니다.\n원치 않으시다면 이 웹사이트를 나가주세요.\n소리는 언제든지 설정에서 변경가능합니다.\n확인을 누르면 소리가 재생됩니다.\nWe play sound, creates and deletes cookies.\n If you don't want, please leave this website.\n sound can be changed in settings at any time.\nIf you click 'OK',website will play sound.", "center");
                Button("ok", 400, 800, 200, 100, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [60, 0, [[223, 223, 223], [231, 231, 231]], false, "OK", "center"]);
                Button("no", 1200, 800, 200, 100, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [60, 0, [[223, 223, 223], [231, 231, 231]], false, "NO", "center"]);
            },
            "welcomeback": function () {
                drawRoundedRect(Screen.BGctx, 800, 450, 1500, 840, "#9f9f9f", "#7f7f7f", 8, 10);
                drawText(Screen.BGctx, 800, 200, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Hello there? We met recently, right?\nI think this crumpled data is yours.\nI've restored your settings.\nClick 'OK' and Enjoy!!" : "최근에 접속하신 기록이 있군요\n저어기 한쪽 구석에 있는 데이터가 당신것이였어요\n그때 당신의 설정을 복원했어요\n'확인'을 누르고 다시 시작하세요!", "center");
                Button("ok", 800, 800, 400, 100, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [60, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "OK" : "확인", "center"]);
            },
            "title": function() { 
                Screen.BGctx.drawImage(image.title, 300+window.XfixStart, 20+window.YfixStart , 1000, 300);
                drawCircle(Screen.BGctx, 300, 520, 200, "#7f7f7f1A", false, false);
                drawCircle(Screen.BGctx, 300, 520, 120, "#7f7f7f1A", false, false);
                drawCircle(Screen.BGctx, 300, 520, 80, "#7f7f7f1A", false, false);
                drawCircle(Screen.BGctx, 500, 600, 250, "#7fdfff33", false, false);
                drawCircle(Screen.BGctx, 500, 600, 180, "#7fdfff33", false, false);
                drawCircle(Screen.BGctx, 500, 600, 80, "#7fdfff33", false, false);
                drawCircle(Screen.BGctx, 600, 740, 120, "#ff7f7f4D", false, false);
                drawCircle(Screen.BGctx, 600, 740, 60, "#ff7f7f4D", false, false);
                drawCircle(Screen.BGctx, 600, 740, 40, "#ff7f7f4D", false, false);
                Button("help", 1530, 840, 100, 100, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [80, 0, [[223, 223, 223], [231, 231, 231]], false, "?", "center"]);
                Button("credit", 1410, 840, 100, 100, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [80, 0, [[223, 223, 223], [231, 231, 231]], false, "C", "center"]);
                Button("setting", 800, 700, 600, 100, [[255, 183, 179], [225, 127, 127]], [8, [255, 127, 127], [195, 73, 79]], [60, 0, [[127, 127, 127], [223, 223, 223]], false, (Client.Settings.Language === 0) ? "SETTING" : "설정", "center"]);
                Button("start", 800, 500, 600, 100, [[187, 255, 255], [127, 223, 255]], [8, [127, 223, 255], [63, 167, 199]], [60, 0, [[127, 127, 127], [223, 223, 223]], false, (Client.Settings.Language === 0) ? "START" : "게임시작", "center"]);
            },
            "help": function () {
                drawRoundedRect(Screen.BGctx, 800, 500, 400, 700, "#9f9f9f", "#7f7f7f", 8, 10);
                drawRoundedRect(Screen.BGctx, 300, 500, 400, 700, "#9f9f9f", "#7f7f7f", 8, 10);
                drawRoundedRect(Screen.BGctx, 1300, 500, 400, 700, "#9f9f9f", "#7f7f7f", 8, 10);
                // Run away from tagger!!
                drawCircle(Screen.BGctx,280,300, 80,"#ffb6b4");
                drawCircle(Screen.BGctx,280,300, 70,'rgb(202,166,254)');
                drawText(Screen.BGctx, 280, 300, 80, 0, "#000000", false, false, "1", "center");
                drawText(Screen.BGctx, 300, 500, 40, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Avoid tagger!\nWatch out for\nplayer with\nred borders." : "술래를 피하세요!\n테두리가 빨간\n플레이어는\n피하는게 좋을겁니다", "center");
                // Use dash
                drawCircle(Screen.BGctx,720,400, 50,'rgb(202,166,254,0.2)');
                drawCircle(Screen.BGctx,760,350, 60,'rgb(202,166,254,0.4)');
                drawCircle(Screen.BGctx,820,300, 70,'rgb(202,166,254,0.6)');
                drawCircle(Screen.BGctx,870,250, 80,'rgb(202,166,254)');
                drawText(Screen.BGctx, 800, 500, 40, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Use Dash!\nYou can Dash\nPress Spacebar\nIt must be\nUseful":"돌진을 사용하세요!\n스페이스바를\n눌러보세요\n이건 반드시\n유용할겁니다", "center");
                // switch tagger
                drawCircle(Screen.BGctx,1240,350, 160,"rgb(252,255,176,0.5)");
                drawCircle(Screen.BGctx,1240,350, 80,"rgb(202,166,254)");
                drawText(Screen.BGctx, 1240, 350, 80, 0, "#000000", false, false, "1", "center");
                drawCircle(Screen.BGctx,1400,300, 80,"#ffb6b4");
                drawCircle(Screen.BGctx,1400,300, 70,'rgb(190,233,180)');
                drawText(Screen.BGctx, 1400, 300, 80, 0, "#000000", false, false, "2", "center");
                drawText(Screen.BGctx, 1300, 500, 40, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Switch tagger!\nYou can switch\ntagger with\nnumber keys\nmake other\nBe a Tagger!" : "술래를 바꿔보세요\n술래에게 잡히기전\n다른 사람의 번호로\n숫자키를 눌러\n다른 사람을\n술래로 만드세요!", "center");

                drawText(Screen.BGctx, 800, 60, 80, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "HOW TO PLAY" : "게임방법", "center");
                Button("back", 150, 60, 200, 80, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "BACK" : "뒤로가기", "center"]);
            },
            "credit": function () {
                drawRoundedRect(Screen.BGctx, 800, 280, 1200, 200, "rgba(159,159,159,0.7)", "rgb(127,127,127)", 3, 10);
                drawRoundedRect(Screen.BGctx, 800, 520, 1200, 200, "rgba(159,159,159,0.7)", "rgb(127,127,127)", 3, 10);
                drawRoundedRect(Screen.BGctx, 800, 760, 1200, 200, "rgba(159,159,159,0.7)", "rgb(127,127,127)", 3, 10);
                drawText(Screen.BGctx, 800, 60, 80, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "CREDIT" : "개발자들", "center");
                drawText(Screen.BGctx, 280, 280, 50, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Programing" : "프로그래밍", "left");
                drawText(Screen.BGctx, 280, 520, 50, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Music" : "음악", "left");
                drawText(Screen.BGctx, 280, 760, 50, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Special Thanks" : "감사한 분들", "left");
                drawText(Screen.BGctx, 1000, 242, 50, 0, "#000000", false, false, "Seol7523\nMossygoldcoin", "center");
                drawText(Screen.BGctx, 1000, 482, 50, 0, "#000000", false, false, "swITchover\nby H", "center");
                drawText(Screen.BGctx, 1000, 760, 50, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "ysw421&Testers" : "ysw421&테스터분들", "center");
                Button("github_Seol7523", 1345, 235, 70, 70, "image", image.github, false);
                Button("github_Mossygoldcoin", 1345, 325, 70, 70, "image", image.github, false);
                Button("soundcloud_H", 1345, 520, 70, 70, "image", image.soundcloud, false);
                Button("back", 150, 60, 200, 80, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "BACK" : "뒤로가기", "center"]);
            },
            "setting": function () {
                drawRoundedRect(Screen.BGctx, 400, 350, 760, 100, "rgba(159,159,159,0.7)", "rgb(127,127,127)", 3, 10);
                drawRoundedRect(Screen.BGctx, 1200, 350, 760, 100, "rgba(159,159,159,0.7)", "rgb(127,127,127)", 3, 10);
                drawText(Screen.BGctx, 800, 60, 100, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "SETTING" : "설정", "center");
                drawText(Screen.BGctx, 20, 250, 80, 0, "#000000", false, false, (Client.Settings.Language === 0) ? " - Sound Settings" : " - 소리설정", "left");
                drawText(Screen.BGctx, 60, 350, 60, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "BGM : " : "배경음:", "left");
                drawText(Screen.BGctx, 860, 350, 60, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "EFFECT : " : "효과음:", "left");
                drawText(Screen.BGctx, 20, 500, 80, 0, "#000000", false, false, (Client.Settings.Language === 0) ? " - Language : " : " - 언어설정 : ", "left");
                Button("back", 150, 60, 200, 80, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "BACK" : "뒤로가기", "center"]);
                Button("english", 1200, 500, 600, 100, [[187, 255, 255], [127, 223, 255]], [8, [127, 223, 255], [63, 167, 199]], [60, 0, [[127, 127, 127], [223, 223, 223]], false, "To ENGLISH", "center"]);
                Button("korean", 1200, 500, 600, 100, [[255, 183, 179], [225, 127, 127]], [8, [255, 127, 127], [195, 73, 79]], [60, 0, [[127, 127, 127], [223, 223, 223]], false, "한글로 변경", "center"]);
                if (Client.Settings.Language) {
                    Screen.UI.setting.english.show = true;
                    Screen.UI.setting.korean.show = false;
                } else {
                    Screen.UI.setting.english.show = false;
                    Screen.UI.setting.korean.show = true;
                }
                RangeSlider("soundSlider", Screen.UI.Element.sound_slider, 400, 90, `translate(-${Screen.scale * 480}px, -${Screen.scale * 140}px)`);
                RangeSlider("effectSlider", Screen.UI.Element.effect_slider, 400, 90, `translate(${Screen.scale * 375}px, -${Screen.scale * 140}px)`);
            },
            "matching": function () {
                Button("back", 150, 60, 200, 80, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "BACK" : "뒤로가기", "center"]);
                Button("quickStart", 400, 370, 680, 100, [[186,255,255],[127,223,255]], [8, [127,223,255],[64, 168, 198]], [60, 0, [[127, 127, 127],[223,223,223]], false, (Client.Settings.Language === 0) ? "QUICK START" : "빠른 매칭", "center"]);
                Button("newRoom", 1200 , 370, 680, 100, [[186,255,255],[127,223,255]], [8, [127,223,255],[64, 168, 198]], [60, 0, [[127, 127, 127],[223,223,223]], false, (Client.Settings.Language === 0) ? "NEW ROOM" : "방만들기", "center"]);
                Button("joinRoom", 400, 570, 680, 100, [[255,182,180],[255,127,127]], [8, [255,127,127],[194,73,78]], [60, 0, [[127, 127, 127],[223,223,223]], false, (Client.Settings.Language === 0) ? "JOIN ROOM" : "방참여하기", "center"]);
                InputBox("name_input", Screen.UI.Element.name_input, 800, 90, 45, (Client.Settings.Language === 0) ? "Enter your name(1~15)" : "닉네임 입력(1~15)", `translate(-50%, -${315 * Screen.scale}px)`);
                InputBox("id_input", Screen.UI.Element.id_input, 680, 100, 50, (Client.Settings.Language === 0) ? "Enter Room ID" : "방 ID 입력", `translate(${60 * Screen.scale}px, 0px)`);
                InputBox("password_input", Screen.UI.Element.password_input, 680, 100, 50, (Client.Settings.Language === 0) ? "Enter Room password" : "방 비밀번호 입력", `translate(${60 * Screen.scale}px, ${110 * Screen.scale}px)`);
            },
            "loading": function () {
                drawText(Screen.BGctx, 800, 200, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Loading..." : "로딩중...", "center");
            },
            "newroom_select": function () {
                Button("back", 150, 60, 200, 80, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "BACK" : "뒤로가기", "center"]);
                Button("make", 800, 760, 800, 100, [[186,255,255],[127,223,255]], [8, [127,223,255],[64, 168, 198]], [48, 0, [[127, 127, 127],[223,223,223]], false, (Client.Settings.Language === 0) ? "Make New Room!" : "방 만들기", "center"]);
                drawText(Screen.BGctx, 800, 400, 60, 0, "rgb(127,127,127)", false, false, (Client.Settings.Language === 0) ? "Room Type" : "방 종류", "right");
                drawText(Screen.BGctx, 800, 100, 70, 0, "rgb(127,127,127)", false, false, (Client.Settings.Language === 0) ? "Make new Room" : "방 만들기", "center");
                InputBox('room_key_input',Screen.UI.Element.room_key_input, 600, 81, 54, (Client.Settings.Language === 0) ? "Key : Num,00~9999" : "숫자, 1~4자리", `translate(16%, 100%)`);
                if(Screen.UI.Element.room_key_input.customprivate) {
                    Screen.UI.Element.room_key_input.style.display = "inline";
                    Button("global", 1200, 400, 600, 100, [[186,255,255],[127,223,255]], [8, [127,223,255],[64, 168, 198]], [48, 0, [[127, 127, 127],[223,223,223]], false, (Client.Settings.Language === 0) ? "To Global" : "공개방전환", "center"]);
                    drawText(Screen.BGctx, 800, 600, 60, 0, "rgb(127,127,127)", false, false, (Client.Settings.Language === 0) ? "Room Key : " : "비밀번호 : ", "right");
                }else{
                    Screen.UI.Element.room_key_input.style.display = "none";
                    Button("private", 1200, 400, 600, 100, [[255,182,180],[255,127,127]], [8, [255,127,127],[194,73,78]], [48, 0, [[127, 127, 127],[223,223,223]], false, (Client.Settings.Language === 0) ? "To Private" : "비밀방전환", "center"]);
                }
            },
            "ready": function () {
                drawLine(Screen.BGctx,200,130,200,770, "rgb(0,0,0)", 8);
                drawLine(Screen.BGctx,200,130,1400,130, "rgb(0,0,0)", 8);
                drawLine(Screen.BGctx,200,770,1400,770, "rgb(0,0,0)", 8);
                drawLine(Screen.BGctx,1400,130,1400,770, "rgb(0,0,0)", 8);
                drawLine(Screen.BGctx,800,130,800,770, "rgb(0,0,0)", 8);
                drawLine(Screen.BGctx,200,290,1400,290, "rgb(0,0,0)", 8);
                drawLine(Screen.BGctx,200,450,1400,450, "rgb(0,0,0)", 8);
                drawLine(Screen.BGctx,200,610,1400,610, "rgb(0,0,0)", 8);
                for (i = 0; i < 8; i++) {
                    if(Client.Room.PlayerIds[i] !== 0) {
                        drawCircle(Screen.BGctx, 280 + 600*(i%2), parseInt(i/2) *160 + 220 , 60, Client.PlayerColors[i]);
                        drawText(Screen.BGctx, 280 + 600*(i%2), parseInt(i/2) *160 + 220, 60, 0, "#000000", false, false,i+1+'', "center");
                        drawLine(Screen.BGctx, 350 + 600 * (i%2), parseInt(i/2) *160 + 160, 350 + 600 * (i%2), parseInt(i/2) *160 + 280, Client.PlayerColors[i], 8);
                        if(Client.Room.PlayerIds[i] === Client.Id) {
                            drawText(Screen.BGctx, 360 + 600*(i%2), parseInt(i/2) * 160 + 200, 30, 0, "#000000", false, false, (Client.Settings.Language === 0) ? '(You)' : "(당신)", "left");
                            drawText(Screen.BGctx, 360 + 600*(i%2), parseInt(i/2) * 160 + 240, 36, 0, "#000000", false, false, Client.Room.PlayerNames[i], "left");
                        }else if(Client.Room.PlayerIds[i] === Client.Room.OwnerId) {
                            drawText(Screen.BGctx, 360 + 600*(i%2), parseInt(i/2) * 160 + 200, 30, 0, "#000000", false, false, (Client.Settings.Language === 0) ? '(Owner)' : "방장", "left");
                            drawText(Screen.BGctx, 360 + 600*(i%2), parseInt(i/2) * 160 + 240, 36, 0, "#000000", false, false, Client.Room.PlayerNames[i], "left");
                        }else{
                            drawText(Screen.BGctx, 360 + 600*(i%2), parseInt(i/2) * 160 + 220, 36, 0, "#000000", false, false, Client.Room.PlayerNames[i], "left");
                        };
                    };
                    if(Client.Room.PlayerJoinAnimation[i] !== 0){
                        drawRect(Screen.BGctx, 200 + 600*(i%2), parseInt(i/2) *160 + 130, 600, 160, Client.PlayerColors[i], Client.Room.PlayerJoinAnimation[i]/30);
                        Client.Room.PlayerJoinAnimation[i]--;
                    }
                }
                let x = Screen.mouseX;
                let y = Screen.mouseY;
                if(x > 200 && x < 1400 && y> 130 && y < 770 && Client.Room.OwnerId === Client.Id){
                    let c;
                    let mode;
                    let active = ((x > 640 && x < 800) || (x > 1240 && x < 1400));
                    if((parseInt((y - 130) / 80) % 2) === 0){
                        c = "rgba(127,223,255,0.5)";
                        mode = "Pass";
                    }else{
                        c = "rgba(255, 182, 180,0.5)";
                        mode = 'Kick';
                    }
                    let block_x = parseInt((x - 200) / 600);
                    let block_y = parseInt((y - 130) / 160);
                    let block_num = block_y * 2 + block_x;
                    if(Client.Room.PlayerIds[block_num] !== 0 && Client.Room.PlayerIds[block_num] !== Client.Id){
                        if(active){
                            drawText(Screen.UIctx, block_x * 600 + 720, block_y * 160 + 210 + (mode === "Kick" ? 40 : -40), 36, 0 , "#000000", false, false, mode, "center");
                            let grad = Screen.UIctx.createLinearGradient(block_x * 600 + 200, block_y * 160 + 130, block_x * 600 + 800, block_y * 160 + 130);
                            grad.addColorStop(1, c);
                            grad.addColorStop(0, "rgba(255,255,255,0.5)");
                            drawRect(Screen.UIctx, block_x * 600 + 200, block_y * 160 + 130, 600, 160, grad);
                            if(Screen.mouseClick){
                                switch (mode) {
                                    case "Pass":
                                        Screen.socket.emit("pass owner", Client.Room.PlayerIds[block_num]);
                                        ScreenName.mouseClick = false;
                                        break;
                                    case "Kick":
                                        Screen.socket.emit("kick user", Client.Room.PlayerIds[block_num], parseInt((parseInt(Client.RoomId, 16) / 9196)) - 17534);
                                        ScreenName.mouseClick = false;
                                        break;
                                }
                            }                            
                        }else{
                            drawRect(Screen.UIctx, block_x * 600 + 640, block_y * 160 + 130, 160, 80, "rgba(127,223,255,0.5)");
                            drawRect(Screen.UIctx, block_x * 600 + 640, block_y * 160 + 210, 160, 80 , "rgba(255, 182, 180,0.5)");
                            drawText(Screen.UIctx, block_x * 600 + 720, block_y * 160 + 250, 36, 0 , "#000000", false, false, 'Kick', "center");
                            drawText(Screen.UIctx, block_x * 600 + 720, block_y * 160 + 170, 36, 0 , "#000000", false, false, 'Pass', "center");
                            drawLine(Screen.UIctx, block_x * 600 + 640, block_y * 160 + 130, block_x * 600 + 640, block_y * 160 + 290, "rgb(127,127,127)", 4);
                            drawLine(Screen.UIctx, block_x * 600 + 640, block_y * 160 + 210, block_x * 600 + 800, block_y * 160 + 210, "rgb(127,127,127)", 4);
                        }
                    }
                }
                // 맵 선택
                const mapType = (Client.Settings.Language === 0) ? ["Random", "OpenField", "Forest", "Stadium", "House"][Client.Room.MapId] : ["랜덤", "공터", "숲", "경기장", "집"][Client.Room.MapId];
                drawText(Screen.UIctx, 800, 60, 36, 0, "#000000", false, false, ((Client.Room.OwnerId === Client.Id) ? "" : (Client.Settings.Language === 0) ? "Map : " : "맵 : ") + mapType, "center");
                if (Client.Room.OwnerId === Client.Id) {
                    Button("mapLeft", 600, 60, 100, 100, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, "◀", "center"]);
                    Button("mapRight", 1000, 60, 100, 100, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, "▶", "center"]);
                }
                Button("idcopy", 1300, 60, 400, 80, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "COPY ID" : "ID 복사", "center"]);
                Button("back", 150, 60, 200, 80, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "BACK" : "뒤로가기", "center"]);
                (Client.Room.OwnerId === Client.Id) ? Button("start", 1200, 830, 300, 80, [[187, 255, 255], [127, 223, 255]], [8, [127, 223, 255], [63, 167, 199]], [48, 0, [[127, 127, 127], [223, 223, 223]], false, (Client.Settings.Language === 0) ? "START" : "게임시작", "center"]):null;
            },
            "ingame": function () {
                drawRect(Screen.BGctx, 0, 0, 1600, 900, "#baffff");
                const CameraNum = Client.Room.PlayerIds.indexOf(Client.Camera);
                const MyX = Client.Room.PlayerXs[CameraNum] * 0.001; // 타일 하나당 좌표 1
                const MyY = Client.Room.PlayerYs[CameraNum] * 0.001;
                const MySightRange = Client.Room.PlayerSightRanges[CameraNum] * 0.1
                const TileSize = 1600 / MySightRange; // 화면에서 보이는 타일의 픽셀크기.
                // 격자무늬
                for (i = 1; i < Client.Room.MapWidth; i += 2) {
                    drawLine(Screen.BGctx, (i - MyX) * TileSize + 800, 0, (i - MyX) * TileSize + 800, 900, '#FFFFFF', 4);
                    drawLine(Screen.BGctx, 0, (i - MyY) * TileSize + 450, 1600, (i - MyY) * TileSize + 450, '#FFFFFF', 4);
                }
                // 오브젝트
                let MyXIndex = Math.floor(MyX); // 플레이어가 밟고 있는 타일의 map에서의 index
                let MyYIndex = Math.floor(MyY);
                for (let i = Math.max(0, MyXIndex - Math.ceil(MySightRange * 0.5)); i < Math.min(MyXIndex + Math.ceil(MySightRange * 0.5) + 1, Client.Room.MapWidth); i++) {
                    for (let j = Math.max(0, MyYIndex - Math.ceil(MySightRange * 0.28125)); j < Math.min(MyYIndex + Math.ceil(MySightRange * 0.28125) + 1, Client.Room.MapHeight); j++) {
                        if (Client.Room.Map[j][i] === 1) {
                            drawRect(Screen.BGctx, (i - MyX) * TileSize + 800, (j - MyY) * TileSize + 450, TileSize, TileSize, "#4e9918", (Math.abs(MyXIndex - i) + Math.abs(MyYIndex - j) < 4 && Math.abs(MyXIndex - i) < 3 && Math.abs(MyYIndex - j) < 3) ? 0.6 : 1);
                        } else if (Client.Room.Map[j][i] === 2) {
                            drawRect(Screen.BGctx, (i - MyX) * TileSize + 800, (j - MyY) * TileSize + 450, TileSize, TileSize, "#7f7f7f");
                        } else {
                            let num = Client.Room.Map[j][i] - 2;
                            Screen.BGctx.drawImage(image.tile.table[0], (num % 8 * 256), parseInt(num / 8) * 256, 256, 256, ((i - MyX) * TileSize + 800) + window.XfixStart, ((j - MyY) * TileSize + 450) + window.YfixStart, TileSize, TileSize);
                        }
                    }
                }
                // 자기장
                const WallWidth = (Math.max(0, Client.Room.ElapsTime - 10000)) * 0.00015 // 10초 후 줄어듬. 6.666초당 1타일
                drawRect(Screen.BGctx, 0, 0, Math.max((WallWidth - MyX) * TileSize + 800,0), 900, '#ffb6b4');
                drawRect(Screen.BGctx, 1600, 0, Math.min((Client.Room.MapWidth - WallWidth - MyX) * TileSize - 800,0), 900, '#ffb6b4');
                drawRect(Screen.BGctx, 0, 0, 1600, Math.max((WallWidth - MyY) * TileSize + 450,0), '#ffb6b4');
                drawRect(Screen.BGctx, 0, 900, 1600, Math.min((Client.Room.MapHeight - WallWidth - MyY) * TileSize - 450,0), '#ffb6b4');
                // 플레이어
                for (let i = 0; i < 8; i++) {
                    if (Client.Room.PlayerLiveStates[i] === 0) { continue; }
                    const PlayerX = Client.Room.PlayerXs[i] * 0.001;
                    const PlayerY = Client.Room.PlayerYs[i] * 0.001;
                    for (j = 0; j < Client.Room.Skill.Boost[i].length; j++) { // 스킬 효과를 먼저 렌더링 하는 이유는 스킬은 플레이어 위치에 상관없이 보여야 하기 때문이다.
                        const BoostData = Client.Room.Skill.Boost[i][j];
                        Screen.BGctx.globalAlpha = (1000 - Client.Room.ElapsTime + BoostData[2]) / 2000;
                        drawCircle(Screen.BGctx, (BoostData[0] * 0.001 - MyX) * TileSize + 800, (BoostData[1] * 0.001 - MyY) * TileSize + 450, TileSize * 0.4, Client.PlayerColors[i]);
                        Screen.BGctx.globalAlpha = 1;
                    }
                    if (Client.Room.Skill.Switch[i] !== 0) {
                        Screen.BGctx.globalAlpha = (1000 - Client.Room.ElapsTime + Client.Room.Skill.Switch[i]) / 2000;
                        drawCircle(Screen.BGctx, (PlayerX - MyX) * TileSize + 800, (PlayerY - MyY) * TileSize + 450, TileSize, Client.PlayerColors[Client.Room.PlayerIds.indexOf(Client.Room.Skill.SwitchTarget[i])]);
                        Screen.BGctx.globalAlpha = 1;
                    }
                    if (MyX - PlayerX <= MySightRange * -0.5 - 0.4 || MySightRange * 0.5 + 0.4 <= MyX - PlayerX || MyY - PlayerY <= MySightRange * -0.28125 - 0.4 || MySightRange * 0.28125 + 0.4 <= MyY - PlayerY) { continue; }
                    // 투명화 확인
                    let PlayerInvisible = false;
                    let PlayerXIndex = Math.floor(PlayerX);
                    let PlayerYIndex = Math.floor(PlayerY);
                    if (Client.Room.Map[PlayerYIndex][PlayerXIndex] === 1) {
                        function mapCheck(X, Y) { if (PlayerYIndex + Y < 0 || Client.Room.MapWidth <= PlayerYIndex + Y || PlayerXIndex + X < 0 || Client.Room.MapHeight <= PlayerXIndex + X) { return false; } else { return Client.Room.Map[PlayerYIndex + Y][PlayerXIndex + X] === 1; } }
                        let AboveY; let BelowY;
                        mapCheck(-1, 0) ? (
                            (mapCheck(0, -1) && mapCheck(-1, -1)) ? AboveY = 0 : AboveY = 0.4,
                            (mapCheck(0, 1) && mapCheck(-1, 1)) ? BelowY = 1 : BelowY = 0.6,
                            (PlayerXIndex <= PlayerX && PlayerX <= PlayerXIndex + 0.6 && PlayerYIndex + AboveY <= PlayerY && PlayerY <= PlayerYIndex + BelowY) ? PlayerInvisible = true : null
                        ) : null;
                        (mapCheck(1, 0) && !PlayerInvisible) ? (
                            (mapCheck(0, -1) && mapCheck(1, -1)) ? AboveY = 0 : AboveY = 0.4,
                            (mapCheck(0, 1) && mapCheck(1, 1)) ? BelowY = 1 : BelowY = 0.6,
                            (PlayerXIndex + 0.4 <= PlayerX && PlayerX <= PlayerXIndex + 1 && PlayerYIndex + AboveY <= PlayerY && PlayerY <= PlayerYIndex + BelowY) ? PlayerInvisible = true : null
                        ) : null;
                        !PlayerInvisible ? (
                            (mapCheck(0, -1)) ? (
                                AboveY = 0,
                                (mapCheck(-1, 0) && ((PlayerX - PlayerXIndex) ** 2 + (PlayerY - PlayerYIndex) ** 2 >= 0.16) && PlayerX <= PlayerXIndex + 0.6 && PlayerY <= PlayerYIndex + 0.6) ? PlayerInvisible = true : null,
                                (mapCheck(1, 0) && ((PlayerXIndex + 1 - PlayerX) ** 2 + (PlayerY - PlayerYIndex) ** 2 >= 0.16) && PlayerXIndex + 0.4 <= PlayerX && PlayerY <= PlayerYIndex + 0.6) ? PlayerInvisible = true : null
                            ) : AboveY = 0.4,
                            (mapCheck(0, 1) && !PlayerInvisible) ? (
                                BelowY = 1,
                                (mapCheck(-1, 0) && ((PlayerX - PlayerXIndex) ** 2 + (PlayerYIndex + 1 - PlayerY) ** 2 >= 0.16) && PlayerX <= PlayerXIndex + 0.6 && PlayerYIndex + 0.4 <= PlayerY) ? PlayerInvisible = true : null,
                                (mapCheck(1, 0) && ((PlayerXIndex + 1 - PlayerX) ** 2 + (PlayerYIndex + 1 - PlayerY) ** 2 >= 0.16) && PlayerXIndex + 0.4 <= PlayerX && PlayerYIndex + 0.4 <= PlayerY) ? PlayerInvisible = true : null
                            ) : BelowY = 0.6,
                            (PlayerXIndex + 0.4 <= PlayerX && PlayerX <= PlayerXIndex + 0.6 && PlayerYIndex + AboveY <= PlayerY && PlayerY <= PlayerYIndex + BelowY) ? PlayerInvisible = true : null
                        ) : null
                    }
                    if (PlayerInvisible) {
                        if (i === CameraNum) {
                            Screen.BGctx.globalAlpha = 0.6;
                        } else {
                            if (Math.abs(MyXIndex - PlayerXIndex) + Math.abs(MyYIndex - PlayerYIndex) < 4 && Math.abs(MyXIndex - PlayerXIndex) < 3 && Math.abs(MyYIndex - PlayerYIndex) < 3) {
                                Screen.BGctx.globalAlpha = 0.6;
                            } else {
                                Screen.BGctx.globalAlpha = 0;
                            }
                        }
                    }
                    const RenderingX = (PlayerX - MyX) * TileSize + 800;
                    const RenderingY = (PlayerY - MyY) * TileSize + 450;
                    if(Client.Room.emoji[i]){
                        let renderSize;
                        if(Client.Room.emoji[i][1] < 20){
                            renderSize = (-0.4 * (Client.Room.emoji[i][1]- 15) * (Client.Room.emoji[i][1] - 15) + 90) * 0.6;
                        }else if(Client.Room.emoji[i][1] > 40){
                            renderSize = (-0.4 * (Client.Room.emoji[i][1] - 45) * (Client.Room.emoji[i][1] - 45) + 90) * 0.6;
                        }else{
                            renderSize = 80 * 0.6;
                        }
                        if (PlayerInvisible) {
                            if (i === CameraNum) {
                                Screen.UIctx.globalAlpha = 0.6;
                            } else {
                                if (Math.abs(MyXIndex - PlayerXIndex) + Math.abs(MyYIndex - PlayerYIndex) < 4 && Math.abs(MyXIndex - PlayerXIndex) < 3 && Math.abs(MyYIndex - PlayerYIndex) < 3) {
                                    Screen.UIctx.globalAlpha = 0.6;
                                } else {
                                    Screen.UIctx.globalAlpha = 0;
                                }
                            }
                        }
                        Screen.UIctx.drawImage(image.emoji[Client.Room.emoji[i][0]], RenderingX - renderSize + window.XfixStart, RenderingY - 90 - renderSize + window.YfixStart, 2 * renderSize, 2 * renderSize);
                        if(Client.Room.emoji[i][1] > 0){
                            Client.Room.emoji[i][1] -= 1;
                        }else{
                            Client.Room.emoji[i] = false;
                        }
                    };
                    if (Client.Room.PlayerIds[i] === Client.Room.TaggerId) {
                        drawCircle(Screen.BGctx, RenderingX, RenderingY, TileSize * 0.4, "#ffb6b4");
                        drawCircle(Screen.BGctx, RenderingX, RenderingY, TileSize * 0.32, Client.PlayerColors[i]);
                    } else {
                        drawCircle(Screen.BGctx, RenderingX, RenderingY, TileSize * 0.4, Client.PlayerColors[i]);
                    }
                    if (i === Client.RoomNum) {
                        drawText(Screen.BGctx, 800, 450, TileSize * 0.3, 0, false, "#000000", TileSize * 0.03, (Client.Settings.Language === 0) ? "You" : "당신", "center");
                    } else {
                        drawText(Screen.BGctx, RenderingX, RenderingY, TileSize * 0.5, 0, false, "#000000", TileSize * 0.03, `${i + 1}`, "center");
                    }
                    Screen.BGctx.globalAlpha = 1;
                }
                // UI
                // 생존자 목록
                let PlayerUIY = 5;
                for (i = 0; i < 8; i++) {
                    if (Client.Room.PlayerLiveStates[i] === 0) { continue; }
                    const multiple = Client.Room.TaggerChangeEffect[i]; // 432(이름최대너비) + 8(맨 오른쪽 공백) + 50(원) = 490
                    PlayerUIY += 25 * multiple;
                    Screen.UIctx.globalAlpha = 0.6 * multiple;
                    drawRoundedRect(Screen.UIctx, 1600 - (964 * multiple + 16) * 0.25, PlayerUIY, (964 * multiple + 16) * 0.5, 50 * multiple, Client.PlayerColors[i], false, false, 25 * multiple);
                    drawText(Screen.UIctx, 1592 - 432 * multiple, PlayerUIY, 36 * multiple, 0, "#000000", false, false, Client.Room.PlayerNames[i], "left");
                    Screen.UIctx.globalAlpha = 1;
                    const MiCharX = 1592 - 457 * multiple
                    drawCircle(Screen.UIctx, MiCharX, PlayerUIY, 20 * multiple, (Client.Room.PlayerIds[i] === Client.Room.TaggerId) ? "#ffb6b4" : Client.PlayerColors[i]);
                    (Client.Room.PlayerIds[i] === Client.Room.TaggerId) ? drawCircle(Screen.UIctx, MiCharX, PlayerUIY, 16 * multiple, Client.PlayerColors[i]) : null;
                    drawText(Screen.UIctx, MiCharX, PlayerUIY, 25 * multiple, 0, "#000000", false, false, `${i + 1}`, "center");
                    PlayerUIY -= 25 * multiple;
                    PlayerUIY += 50 * multiple + 5;
                }
                drawText(Screen.UIctx, 1590, PlayerUIY+50, 50, 0, "#000000", false, false, (Client.Settings.Language === 0) ? `Alive : ${Client.Room.LivePlayerCount}` : `생존 : ${Client.Room.LivePlayerCount}`, "right");
                if (CameraNum === Client.RoomNum) {
                    Screen.UIctx.globalAlpha = (600 - Client.Skill.BoostCooltime) / 1200 + ((Client.Skill.BoostCooltime) ? 0 : 0.5);
                    Screen.UIctx.drawImage(image.boostButton, 1380 + window.XfixStart, 790+window.YfixStart, 100, 100);
                    Screen.UIctx.globalAlpha = (150 - Client.Skill.SwitchCooltime) / 300 + ((Client.Skill.SwitchCooltime) ? 0 : 0.5);
                    Screen.UIctx.drawImage(image.switchButton, 1490 + window.XfixStart, 790+window.YfixStart, 100, 100);
                    Screen.UIctx.globalAlpha = 1;
                    (Client.Skill.BoostCooltime !== 0) ? drawText(Screen.UIctx, 1430, 840, 40, 0, "#000000", false, false, `${Math.ceil(Client.Skill.BoostCooltime / 30)}`, "center"):null;
                    (Client.Skill.SwitchCooltime !== 0) ? drawText(Screen.UIctx, 1540, 840, 40, 0, "#000000", false, false, `${Math.ceil(Client.Skill.SwitchCooltime / 30)}`, "center"):null;
                }
                Screen.BGctx.clearRect(0,0,1600+(window.XfixStart)*2,window.YfixStart);
                Screen.BGctx.clearRect(0,900+window.YfixStart,1600+(window.XfixStart)*2,window.YfixStart);
                Screen.BGctx.clearRect(0,0,window.XfixStart,900+(window.YfixStart)*2);
                Screen.BGctx.clearRect(1600+window.XfixStart,0,window.XfixStart,900+(window.YfixStart)*2);
                // 이모지 사용창
                if(Screen.emoji.show){
                    Screen.UIctx.globalAlpha = 0.8;
                    drawCircle(Screen.UIctx, 800, 450, 300, false, "#000000", 10);
                    drawLine(Screen.UIctx, 800, 150, 800, 750, "#000000", 10);
                    drawLine(Screen.UIctx, 500, 450, 1100, 450, "#000000", 10);
                    drawLine(Screen.UIctx, 588, 238, 1012, 662, "#000000", 10);
                    drawLine(Screen.UIctx, 588, 662, 1012, 238, "#000000", 10);
                    Screen.UIctx.drawImage(image.emoji[1], 816+window.XfixStart, 206+window.YfixStart, 120, 120);
                    Screen.UIctx.drawImage(image.emoji[2], 924+window.XfixStart, 314+window.YfixStart, 120, 120);
                    Screen.UIctx.drawImage(image.emoji[3], 924+window.XfixStart, 466+window.YfixStart, 120, 120);
                    Screen.UIctx.drawImage(image.emoji[4], 816+window.XfixStart, 574+window.YfixStart, 120, 120);
                    Screen.UIctx.drawImage(image.emoji[5], 664+window.XfixStart, 574+window.YfixStart, 120, 120);
                    Screen.UIctx.drawImage(image.emoji[6], 556+window.XfixStart, 466+window.YfixStart, 120, 120);
                    Screen.UIctx.drawImage(image.emoji[7], 556+window.XfixStart, 314+window.YfixStart, 120, 120);
                    Screen.UIctx.drawImage(image.emoji[8], 664+window.XfixStart, 206+window.YfixStart, 120, 120);
                    drawText(Screen.UIctx, 952, 82, 60, 0, "#000000", false, false, "1", "center");
                    drawText(Screen.UIctx, 1168, 298, 60, 0, "#000000", false, false, "2", "center");
                    drawText(Screen.UIctx, 1168, 602, 60, 0, "#000000", false, false, "3", "center");
                    drawText(Screen.UIctx, 952, 818, 60, 0, "#000000", false, false, "4", "center");
                    drawText(Screen.UIctx, 648, 818, 60, 0, "#000000", false, false, "5", "center");
                    drawText(Screen.UIctx, 432, 602, 60, 0, "#000000", false, false, "6", "center");
                    drawText(Screen.UIctx, 432, 298, 60, 0, "#000000", false, false, "7", "center");
                    drawText(Screen.UIctx, 648, 82, 60, 0, "#000000", false, false, "8", "center");
                }
            },
            "result": function () {
                drawRect(Screen.BGctx, 0, 0, 1600, 900, "#ffffff", 1);
                // 사용자 눈에 보이는 부분
                drawText(Screen.BGctx, 800, 100, 80, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Result" : "결과", "center");
                drawText(Screen.BGctx, 10, 150, 50, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Winner" : "우승자", "left");
                if (Client.Room.WinnerNames.length === 1) {
                    drawCircle(Screen.BGctx, 150, 500, 100, Client.PlayerColors[Client.Room.WinnerNums[0]]);
                    drawText(Screen.BGctx, 150, 500, 125, 0, false, "#000000", 7.5, `${Client.Room.WinnerNums[0] + 1}`, "center");
                    drawText(Screen.BGctx, 150, 650, 40, 0, "#000000", false, false, Client.Room.WinnerNames[0], "center");
                } else {
                    drawCircle(Screen.BGctx, 150, 300, 75, Client.PlayerColors[Client.Room.WinnerNums[0]]);
                    drawCircle(Screen.BGctx, 150, 600, 75, Client.PlayerColors[Client.Room.WinnerNums[1]]);
                    drawText(Screen.BGctx, 150, 300, 90, 0, false, "#000000", 7.5, `${Client.Room.WinnerNums[0] + 1}`, "center");
                    drawText(Screen.BGctx, 150, 600, 90, 0, false, "#000000", 7.5, `${Client.Room.WinnerNums[1] + 1}`, "center");
                    drawText(Screen.BGctx, 150, 400, 40, 0, "#000000", false, false, Client.Room.WinnerNames[0], "center");
                    drawText(Screen.BGctx, 150, 700, 40, 0, "#000000", false, false, Client.Room.WinnerNames[1], "center");
                }
                drawText(Screen.BGctx, 400, 150, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Stats" : "상세정보", "left");
                drawText(Screen.BGctx, 400, 200, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Name" : "이름", "left");
                drawText(Screen.BGctx, 900, 200, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Kill" : "킬 수", "left");
                drawText(Screen.BGctx, 1300, 200, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Switch" : "스위치", "left");
                result_draw_y = 260;
                for (i = 0; i < 8; i++) {
                    if (Client.Room.PlayerIds[i] !== 0){
                        drawText(Screen.BGctx, 400, result_draw_y, 50, 0, "#000000", false, false, `${i + 1}. ${Client.Room.PlayerNames[i]}`, "left");
                        drawText(Screen.BGctx, 900, result_draw_y, 50, 0, "#000000", false, false, `${Client.Room.PlayerGameStats[i][0]}`, "left");
                        drawText(Screen.BGctx, 1300, result_draw_y, 50, 0, "#000000", false, false, `${Client.Room.PlayerGameStats[i][1]}/${Client.Room.PlayerGameStats[i][2]}(${Math.round(Client.Room.PlayerGameStats[i][1] / (Client.Room.PlayerGameStats[i][2] == 0 ? 1 : Client.Room.PlayerGameStats[i][2]) * 100)}%)`, "left");
                        result_draw_y += 50
                    }
                }
                Button("save", 400, 800, 400, 80, [[159, 159, 159], [127, 127, 127]], [8, [127, 127, 127], [103, 103, 103]], [48, 0, [[223, 223, 223], [231, 231, 231]], false, (Client.Settings.Language === 0) ? "Screenshot" : "스크린샷", "center"]);
                drawText(Screen.BGctx, 1600, 800, 30, 0, "#7f7f7f", false, false, (Client.Settings.Language === 0) ? `You'll automatically move to the ready room in ${Math.ceil((Client.Room.ResultTime - Date.now() + 5000) * 0.001)}` : `${Math.ceil((Client.Room.ResultTime - Date.now() + 5000) * 0.001)}초 후 자동으로 나가집니다.`, "right");
                if (Client.Room.ResultTime + 5000 <= Date.now()) { Screen.Now.Delete(); Screen.Now = new Screen.Create("ready"); }
            }
        }[ScreenName];
        Screen.UI[ScreenName] = {};
        this.Draw;

        this.Draw = function () {
            Screen.BGctx.globalAlpha = 1;
            Screen.UIctx.globalAlpha = 1;
            this.ScreenData();
        }

        this.Delete = function () {
            Screen.UI[ScreenName] = {};
            const Elements = Object.keys(Screen.UI.Element);
            for (i = 0; i < Elements.length; i++) {
                (Screen.UI.Element[Elements[i]].screen === ScreenName) ? Screen.UI.Element[Elements[i]].style.display = "none":null;
            }
        }

        function Button (name, x, y, width, height, fillColor, strokeData, textData, sizeChange = true) {

            if (Screen.UI[ScreenName][name]) { // 이미 생성되어있음
                const button = Screen.UI[ScreenName][name];
                if (!button.show) { return; }
                if (checkTouch(Screen.mouseX, Screen.mouseY, button.x, button.y, button.constWidth, button.constHeight)) {
                    if (Screen.mouseClick) {
                        button.click = true;
                    }
                    if (sizeChange) {
                        button.width += (button.constWidth * 1.1 - button.width) * 0.2;
                        button.height += (button.constHeight * 1.1 - button.height) * 0.2;
                    }
                    if (!button.image) {
                        if (button.constFillColor2) { button.fillColor = button.fillColor.map(function (value, index) { return (button.constFillColor2[index] - value) * 0.2 + value; }); }
                        if (button.constStrokeColor2) { button.strokeColor = button.strokeColor.map(function (value, index) { return (button.constStrokeColor2[index] - value) * 0.2 + value; }); }
                        if (button.text) {
                            (sizeChange) ? button.text.size += (button.text.constSize * 1.1 - button.text.size) * 0.2:null;
                            if (button.text.constFillColor2) { button.text.fillColor = button.text.fillColor.map(function (value, index) { return (button.text.constFillColor2[index] - value) * 0.2 + value; }); }
                            if (button.text.constStrokeColor2) { button.text.strokeColor = button.text.strokeColor.map(function (value, index) { return (button.text.constStrokeColor2[index] - value) * 0.2 + value; }); }
                        }
                    }
                } else {
                    if (sizeChange) {
                        button.width += (button.constWidth - button.width) * 0.2;
                        button.height += (button.constHeight - button.height) * 0.2;
                    }
                    if (!button.image) {
                        if (button.constFillColor1) { button.fillColor = button.fillColor.map(function (value, index) { return (button.constFillColor1[index] - value) * 0.2 + value; }); }
                        if (button.constStrokeColor1) { button.strokeColor = button.strokeColor.map(function (value, index) { return (button.constStrokeColor1[index] - value) * 0.2 + value; }); }
                        if (button.text) {
                            (sizeChange) ? button.text.size += (button.text.constSize - button.text.size) * 0.2:null;
                            if (button.text.constFillColor1) { button.text.fillColor = button.text.fillColor.map(function (value, index) { return (button.text.constFillColor1[index] - value) * 0.2 + value; }); }
                            if (button.text.constStrokeColor1) { button.text.strokeColor = button.text.strokeColor.map(function (value, index) { return (button.text.constStrokeColor1[index] - value) * 0.2 + value; }); }
                        }
                    }
                }
                if (button.image) {
                    Screen.UIctx.drawImage(button.image, button.x - button.width * 0.5 + window.XfixStart, button.y - button.height * 0.5 + window.YfixStart, button.width, button.height);
                } else {
                    drawButton(Screen.UIctx, button);
                }

            } else { // 최초 생성
                Screen.UI[ScreenName][name] = {};
                const button = Screen.UI[ScreenName][name];
                button.show = true;
                button.click = false;
                button.x = x; button.y = y;
                button.constWidth = width; button.width = width;
                button.constHeight = height; button.height = height;
                if (fillColor === "image") {
                    button.image = strokeData;
                } else {
                    (fillColor) ? (button.constFillColor1 = fillColor[0], button.constFillColor2 = fillColor[1], button.fillColor = fillColor[0]):null;
                    (strokeData) ? (button.strokeWidth = strokeData[0], button.constStrokeColor1 = strokeData[1], button.constStrokeColor2 = strokeData[2], button.strokeColor = strokeData[1]):null;
                    if (textData) {
                        button.text = {};
                        const text = button.text;
                        text.x = x; text.y = y;
                        text.constSize = textData[0]; text.size = textData[0]; text.rotate = textData[1];
                        (textData[2]) ? (text.constFillColor1 = textData[2][0], text.constFillColor2 = textData[2][1], text.fillColor = textData[2][0]):null;
                        (textData[3]) ? (text.strokeWidth = textData[3][0], text.constStrokeColor1 = textData[3][1], text.constStrokeColor2 = textData[3][2], text.strokeColor = textData[3][1]):null;
                        text.message = textData[4]; text.align = textData[5];
                    }
                }
                
            }
        }

        function InputBox (name, element, width, height, fontSize, placeholder, transform) {

            if (Screen.UI[ScreenName][name]) { // update
                element.style.width = width * Screen.scale + 'px';
                element.style.height = height * Screen.scale + 'px';
                element.style.fontSize = fontSize * Screen.scale + 'px';
                element.placeholder = placeholder;
                element.style.transform = transform;

            } else { // create
                Screen.UI[ScreenName][name] = true;
                element.screen = ScreenName;
                element.focus();
                element.style.display = "inline";
            }

        }

        function RangeSlider (name, element, width, height, transform) {

            if (Screen.UI[ScreenName][name]) {
                element.style.width = width * Screen.scale + 'px';
                element.style.height = height * Screen.scale + 'px';
                element.style.transform = transform;

            } else {
                Screen.UI[ScreenName][name] = true;
                element.screen = ScreenName;
                element.style.display = 'block';
            }
            
        }

    }

}


function drawText(ctx, x, y, size, rotate, fillColor, strokeColor, strokeWidth, message, align, fix=true) {
    if(fix){
        x+= window.XfixStart;
        y+= window.YfixStart;
    }
    ctx.save();
    ctx.beginPath();
    ctx.font = size + "px 'yg-jalnan'";
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    if (rotate) {
        ctx.rotate(rotate * Math.PI / 180);
    }
    const messages = message.split("\n");
    if (fillColor) {
        ctx.fillStyle = fillColor;
        for (line = 0; line < messages.length; line++) {
            ctx.fillText(messages[line], x, y + line * size * 1.6);
        }
    }
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        for (line = 0; line < messages.length; line++) {
            ctx.strokeText(messages[line], x, y + line * size * 1.6);
        }
    }
    ctx.restore();
}

function drawButton(ctx, button) {
    let fillColor = false;
    if (button.fillColor) {
        fillColor = `rgb(${button.fillColor[0]},${button.fillColor[1]},${button.fillColor[2]})`;
    }
    let strokeColor = false;
    if (button.strokeColor) {
        strokeColor = `rgb(${button.strokeColor[0]},${button.strokeColor[1]},${button.strokeColor[2]})`;
    }
    drawRoundedRect(ctx, button.x, button.y, button.width, button.height, fillColor, strokeColor, button.strokeWidth, 10);
    if ("text" in button) { // 버튼안에 텍스트
        let textFillColor = false;
        if (button.text.fillColor) {
            textFillColor = `rgb(${button.text.fillColor[0]},${button.text.fillColor[1]},${button.text.fillColor[2]})`;
        }
        let textStrokeColor = false;
        if (button.text.strokeColor) {
            textStrokeColor = `rgb(${button.text.strokeColor[0]},${button.text.strokeColor[1]},${button.text.strokeColor[2]})`;
        }
        drawText(ctx, button.x , button.y, button.text.size, button.text.rotate, textFillColor, textStrokeColor, button.text.strokeWidth, button.text.message, button.text.align);
    }
}

function drawLine(ctx, x1, y1, x2, y2, color, lineWidth, fix=true) {
    if(fix){
        x1+= window.XfixStart;
        y1+= window.YfixStart;
        x2+= window.XfixStart;
        y2+= window.YfixStart;
    }
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

function drawRect(ctx, x, y, w, h, color, globalAlpha = 1, fix=true) {
    if(fix){
        x+= window.XfixStart;
        y+= window.YfixStart;
    }
    ctx.save();
    ctx.globalAlpha = globalAlpha;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

function drawRoundedRect(ctx, x, y, width, height, fillColor, strokeColor, strokeWidth, arcRadius, fix=true) {
    if(fix){
        x+= window.XfixStart;
        y+= window.YfixStart;
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - width * 0.5 + 10, y - height * 0.5);
    ctx.lineTo(x + width * 0.5 - 10, y - height * 0.5);
    ctx.arcTo(x + width * 0.5, y - height * 0.5, x + width * 0.5, y + height * 0.5, arcRadius);
    ctx.lineTo(x + width * 0.5, y + height * 0.5 - 10);
    ctx.arcTo(x + width * 0.5, y + height * 0.5, x - width * 0.5, y + height * 0.5, arcRadius);
    ctx.lineTo(x - width * 0.5 + 10, y + height * 0.5);
    ctx.arcTo(x - width * 0.5, y + height * 0.5, x - width * 0.5, y - height * 0.5, arcRadius);
    ctx.lineTo(x - width * 0.5, y - height * 0.5 + 10);
    ctx.arcTo(x - width * 0.5, y - height * 0.5, x + width * 0.5, y - height * 0.5, arcRadius);
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }
    ctx.restore();
}

function checkTouch(mouseX, mouseY, rectX, rectY, rectWidth, rectHeight) {
    const relMouseX = mouseX - rectX;
    const relMouseY = mouseY - rectY;
    if (relMouseX >= rectWidth * -0.5 && relMouseX <= rectWidth * 0.5 && relMouseY >= rectHeight * -0.5 && relMouseY <= rectHeight * 0.5) {
        return true;
    } else {
        return false;
    }
}

function LoadImage(ctx, image){
    image.title = new Image();
    image.title.src = "./image/swITchIO_title.png";
    image.boostButton = new Image();
    image.boostButton.src = "./image/boost_button.png";
    image.dashButton = new Image();
    image.dashButton.src = "./image/dash_button.png";
    image.switchButton = new Image();
    image.switchButton.src = "./image/switch_button.png";
    image.github = new Image();
    image.github.src = "./image/github_icon.png";
    image.soundcloud = new Image();
    image.soundcloud.src = "./image/SoundCloud.png";
    image.emoji = [];
    image.emoji[1] = new Image();
    image.emoji[1].src = "./emoji/angry.png";
    image.emoji[2] = new Image();
    image.emoji[2].src = "./emoji/emoji.png";
    image.emoji[3] = new Image();
    image.emoji[3].src = "./emoji/hands.png";
    image.emoji[4] = new Image();
    image.emoji[4].src = "./emoji/like.png";
    image.emoji[5] = new Image();
    image.emoji[5].src = "./emoji/party.png";
    image.emoji[6] = new Image();
    image.emoji[6].src = "./emoji/sad.png";
    image.emoji[7] = new Image();
    image.emoji[7].src = "./emoji/scared.png";
    image.emoji[8] = new Image();
    image.emoji[8].src = "./emoji/thinking.png";
    image.tile = {};
    image.tile.table = [];
    image.tile.table[0] = new Image();
    image.tile.table[0].src = "./image/tile/table.png";
    /*
    ctx.drawImage(image.tile.table[0], 0, 0);
    for(i = 0; i < 45; i++) {
        image.tile.table[i] = ctx.getImageData(i % 8 * 256, parseInt(i / 8) * 256, 256, 256);
    }**/
}

function drawCircle(ctx, x, y, r, fill, strokeColor, strokeWidth, fix=true){
    if(fix){
        x+= window.XfixStart;
        y+= window.YfixStart;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }
    ctx.restore();
}