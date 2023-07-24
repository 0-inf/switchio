$(function () { // 창이 모두 로드된후 실행
    console.log("==========<WARNING>==========");
    console.log("지금 이 창을 연 이유가 무엇인가요? 당신이 지금 무엇을 하려는지 확실하게 인지하고 있나요?");
    console.log("예, 맞습니다. 당신은 이 게임의 중요한 값들을 변경할 수 있습니다.");
    console.log("당연하게도 전 그 행위를 권장하지 않습니다. 그래서 코드도 다 난독화를 했죠.");
    console.log("아마 당신은 이 게임을 진행하는 동안 이 창을 닫으시는 것이 좋을 것 같습니다.");
    console.log("만약 당신이 값을 조작하는 것을 저희 운영진에게 들킨다면 기대하세요^^");
    // 변수 선언
    const socket = io();
    const Screen = {}; // 화면 관련 변수들
    Screen.socket = socket;
    Screen.scale = 1;
    Screen.mouseX = 0;
    Screen.mouseY = 0;
    Screen.mouseClick = false;
    Screen.BGelement = document.getElementById("background");
    Screen.UIelement = document.getElementById("ui");
    Screen.BGctx = Screen.BGelement.getContext('2d');
    Screen.UIctx = Screen.UIelement.getContext('2d');
    Screen.Sounds = {};
    Screen.Sounds.BGM = new Audio('sound\\bgm\\swITchover.mp3');
    Screen.Sounds.BGM.loop = true;
    Screen.emoji = {};
    Screen.emoji.show = 0;
    Screen.emoji.what = 0;
    Screen.emoji.clicked = 0;
    Screen.UI = {};
    Screen.UI.Element = {};
    Screen.UI.Element.name_input = document.getElementById("name_input");
    Screen.UI.Element.id_input = document.getElementById("id_input");
    Screen.UI.Element.room_key_input = document.getElementById("room_key_input");
    Screen.UI.Element.password_input = document.getElementById("password_input");
    Screen.UI.Element.sound_slider = document.getElementById("sound_range");
    Screen.UI.Element.effect_slider = document.getElementById("effect_range");
    Screen.Now = {};
    Screen.Now.Draw = function () { };
    Screen.Alert = {};
    Screen.Alert.Draw = function () { };
    Screen.AlertData = [];
    const Client = {}; // 플레이어에 관련된 정보들
    Client.RoomId = 0;
    Client.Room = {}; // 플레이가 들어가있는 방에 관련된 정보들
    Client.Room.Skill = {};
    Client.PressedKeys = new Uint8Array(22);
    Client.PlayerColors = ['rgb(202,166,254)','rgb(190,233,180)',
    'rgb(252,255,176)','rgb(252,198,247)','rgb(255,185,0)',
    'rgb(121,255,206)','rgb(220,145,70)','rgb(174,205,255)',];
    Client.Settings = {};
    Client.Settings.Language = 0; // 0 : 영어, 1 : 한국어
    Client.dev = false;
    setInterval(function () {
        if (Screen.Now.name === "ingame") { IngameLoop(); }
        Screen.BGctx.clearRect(0, 0, 1600 + (window.XfixStart * 2), 900 + (window.YfixStart * 2));
        Screen.UIctx.clearRect(0, 0, 1600 + (window.XfixStart * 2), 900 + (window.YfixStart * 2));
        Screen.Now.Draw();
        Screen.Alert.Draw();
        for (i = 0; i < Screen.AlertData.length; i++) {
            Screen.AlertData[i][1]--;
            if (Screen.AlertData[i][1] === 0) {
                Screen.AlertData.splice(i, 1);
            }
        }
        UIexecute(); Screen.mouseClick = false;
    }, 33);

    // 파일 불러오기
    $.getScript("script/RenderingManager.js", function(){ RenderingManager(Screen, Client); }).done($.getScript("script/EventManager.js", function(){ EventManager(Screen, Client); }).done(main()));


    function main() {

        socket.on('connected', function (PlayerId) {
            Client.Id = PlayerId;
            Screen.Resize();
            Screen.Alert = new Screen.Create("alert");
            if("AppInventor" in window) {
                Client.Settings.App = true;
                let appset = window.AppInventor.getWebViewString();
                if(appset.substr(0,3) === 'set'){
                    Client.Settings.Language = parseInt(appset.substr(3,1));
                    Screen.UI.Element.sound_slider.value = parseInt(appset.substr(4,3));
                    Screen.Sounds.BGM.volume = parseInt(appset.substr(4,3))/100;
                    Screen.Now = new Screen.Create('welcomeback');
                }else{
                    Screen.Now = new Screen.Create("agreement");
                }
            }else{
                Client.Settings.App = false;
                if(window.localStorage.getItem("settings") !== null || window.localStorage.getItem('sound') !== null) {
                    if(window.localStorage.getItem('settings') !== null) {
                        Client.Settings.Language = parseInt(window.localStorage.getItem("settings").substring(0, 1));
                    };
                    if(window.localStorage.getItem("sound") !== null){
                        Screen.Sounds.BGM.volume = parseInt(window.localStorage.getItem("sound"))*0.01;
                        Screen.UI.Element.sound_slider.value = parseInt(window.localStorage.getItem("sound"));
                    }
                    Screen.Now = new Screen.Create("welcomeback");
                } else {
                    Screen.Now = new Screen.Create("agreement");
                };
                if(window.localStorage.getItem("MANAGER_CHECK") !== null){
                    socket.emit('manager_check', window.localStorage.getItem("MANAGER_CHECK"));
                }
            }
        });

        socket.on("YouAreDev",function(){
            Client.dev = true;
        })

        socket.on('no room', function (reason) {
            Screen.Now.Delete(); Screen.Now = new Screen.Create("matching");
            if (reason === 0) {
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "The room does not exist." : "해당 방이 존재하지 않습니다.", 30]);
            } else if (reason === 1) {
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "The room is full." : "해당방의 빈자리가 없습니다.", 30]);
            } else if (reason === 2) {
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "Password is different." : "비밀번호가 다릅니다.", 30]);
            } else if (reason === 3) {
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "Server is full." : "서버의 수용력 한계입니다.", 30]);
            } else {
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "Server Error" : "서버 에러!!", 30]);
            }
        });
    
        socket.on('join room', function (RoomId, PlayerIds, PlayerCount, PlayerNames, OwnerId, MapId, Playing) {
            Client.RoomId = RoomId;
            Client.Room.PlayerIds = new Uint16Array(PlayerIds);
            Client.RoomNum = Client.Room.PlayerIds.indexOf(Client.Id);
            Client.Name = PlayerNames[Client.RoomNum];
            Client.Room.PlayerCount = PlayerCount;
            Client.Room.PlayerNames = PlayerNames;
            for(i = 0; i < 8; i++){
                if(Client.Room.PlayerIds[i] !== 0){
                    if(Client.Room.PlayerNames[i].slice(0,5) === "[개발자]"){
                        Client.Room.PlayerNames[i] = Client.Room.PlayerNames[i].replace("[개발자]",(Client.Settings.Language === 0) ? "[DEV]" : "[개발자]");
                    }
                }
            };
            Client.Room.OwnerId = OwnerId;
            Client.Room.Playing = Playing;
            Client.Room.PlayerJoinAnimation = [0,0,0,0,0,0,0,0];
            Client.Room.MapId = MapId; // 0: 랜덤, 나머지숫자: 그 id의 맵을 플레이
            if (!Playing) {
                Client.Room.PlayerJoinAnimation[Client.RoomNum] = 30;
                Screen.Now = new Screen.Create("ready");
            }else{
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "You will participate after the game that was already played." : "이미 진행중인 게임이 끝나면 참가합니다.", 30]);
            }
        });

        socket.on('user join', function (PlayerId, PlayerName, PlayerNum) {
            Client.Room.PlayerCount++;
            Client.Room.PlayerIds[PlayerNum] = PlayerId;
            if(PlayerName.slice(0,5) === "[개발자]"){
                Client.Room.PlayerNames[PlayerNum] = PlayerName.replace("[개발자]",(Client.Settings.Language === 0) ? "[DEV]" : "[개발자]");
            }else{
                Client.Room.PlayerNames[PlayerNum] = PlayerName;
            }
            if (!Client.Room.Playing) {
                Client.Room.PlayerJoinAnimation[PlayerNum] = 30;
            }
        });

        socket.on('user exit', function (PlayerId) {
            const PlayerNum = Client.Room.PlayerIds.indexOf(PlayerId);
            Screen.AlertData.unshift([Client.Room.PlayerNames[PlayerNum] + ((Client.Settings.Language === 0) ? " left." : "가 나갔습니다."), 30]);
            Client.Room.PlayerCount--;
            Client.Room.PlayerIds[PlayerNum] = 0;
            Client.Room.PlayerNames[PlayerNum] = undefined;
            if (Client.Room.Playing && Client.Room.PlayerLiveStates[PlayerNum]) {
                Client.Room.LivePlayerCount--;
                Client.Room.PlayerLiveStates[PlayerNum] = 0;
            } else {
                Client.Room.PlayerJoinAnimation[PlayerNum] = 30;
            }
        });

        socket.on('pass owner', function (PlayerId) {
            Client.Room.OwnerId = PlayerId;
            if(PlayerId === Client.Id){
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "You became the owner" : "당신이 방장이 되었습니다.", 30]);
            }
        });

        socket.on('kicked', function () {
            socket.emit("kicked ok");
            Screen.Now.Delete(); Screen.Now = new Screen.Create("matching");
            Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "You were kicked from the room" : "방에서 추방당하셨습니다.", 30]);
        });

        socket.on('map change', function (MapId) {
            Client.Room.MapId = MapId;
        });

        socket.on('start game', function (PlayerLiveStates, LiveCount, PlayerXs, PlayerYs, PlayerSightRanges, TaggerId, Map) {
            if(Client.Settings.App){
                Screen.Control = new Screen.Create("control");
            }
            if (!Client.Room.Playing) {
                Client.Room.Playing = 1;
                Client.Camera = Client.Id;
                Client.Skill = {};
                Client.Skill.Boost = 0; // 플레이어 부스트 사용여부. 틱마다 1 줄어듬.(술래는 2 줄어듬) (Boost > 0): 사용중. 값 = 남은 진행시간, (Boost <= 0): 사용안하는중.
                Client.Skill.BoostCooltime = 0; // 플레이어 남은 부스트쿨타임. 틱마다 1 줄어듬.
                Client.Skill.SwitchCooltime = 0;
                Client.Skill = {};
                Client.Skill.Boost = 0; // 플레이어 부스트 사용여부. 틱마다 1 줄어듬.(술래는 2 줄어듬) (Boost > 0): 사용중. 값 = 남은 진행시간, (Boost <= 0): 사용안하는중.
                Client.Skill.BoostCooltime = 0; // 플레이어 남은 부스트쿨타임. 틱마다 1 줄어듬.
                Client.Skill.SwitchCooltime = 0;
            } else {
                Client.Camera = TaggerId;
            }
            Client.Room.LivePlayerCount = LiveCount; // 도중참가와 관전대비
            Client.Room.PlayerLiveStates = new Uint8Array(PlayerLiveStates); // 도중참가와 관전대비
            Client.Room.PlayerXs = new Uint16Array(PlayerXs);
            Client.Room.PlayerYs = new Uint16Array(PlayerYs);
            Client.Room.PlayerSightRanges = new Uint8Array(PlayerSightRanges);
            Client.Room.Skill.Boost = [[], [], [], [], [], [], [], []]; // 부스트 사용시 사용자 이전 위치. (잔상효과를 위함임.) 빈 배열이면 부스트 사용 안한것
            Client.Room.Skill.Switch = new Array(0, 0, 0, 0, 0, 0, 0, 0); // 술래변경 사용시간 (0 = 사용안함)
            Client.Room.Skill.SwitchTarget = new Uint8Array(8); // 술래변경 타겟id
            Client.Room.TaggerId = TaggerId;
            Client.Room.TaggerChangeEffect = [1, 1, 1, 1, 1, 1, 1, 1]; // 술래변경시 생존자 창에 뜨는 모션
            Client.Room.MapWidth = Map[0].length;
            Client.Room.MapHeight = Map.length;
            Client.Room.Map = Map;
            Client.PressedKeys = new Uint8Array(22);
            Client.Room.ElapsTime = 0; // 게임 진행경과시간
            Client.Room.emoji = [false, false, false, false, false, false, false, false];
            Screen.Now.Delete(); Screen.Now = new Screen.Create("ingame");
        })

        socket.on('client update', function (PlayerXs, PlayerYs, PlayerBoosts, PlayerSightRanges, ElapsTime, Map) {
            Client.Room.PlayerXs = new Uint16Array(PlayerXs);
            Client.Room.PlayerYs = new Uint16Array(PlayerYs);
            const PlayerBoost = new Uint8Array(PlayerBoosts);
            if (Client.Room.Skill.SwitchTarget !== undefined) { // start game 보다 client update 가 먼저 실행됐을때를 방지
                for (i = 0; i < 8; i++) {
                    if (!Client.Room.PlayerLiveStates[i]) { continue; }
                    if (PlayerBoost[i]) {
                        const BoostLength = Client.Room.Skill.Boost[i].length - 1;
                        if (BoostLength > -1) {
                            if (Client.Room.PlayerXs[i] === Client.Room.Skill.Boost[i][BoostLength][0] && Client.Room.PlayerYs[i] === Client.Room.Skill.Boost[i][BoostLength][1]) { // 전이랑 같은 위치인지 확인 (서버에서 보내는 client udpate가 30틱보다 많아서)
                                continue;
                            }
                        }
                        Client.Room.Skill.Boost[i].push([Client.Room.PlayerXs[i], Client.Room.PlayerYs[i], ElapsTime]);
                    }
                }
            }
            Client.Room.PlayerSightRanges = new Uint8Array(PlayerSightRanges);
            Client.Room.ElapsTime = ElapsTime;
            Client.Room.Map = Map;
        })

        socket.on('change challenge', function (PlayerId, TargetId) {
            const PlayerNum = Client.Room.PlayerIds.indexOf(PlayerId);
            Client.Room.Skill.Switch[PlayerNum] = Client.Room.ElapsTime;
            Client.Room.Skill.SwitchTarget[PlayerNum] = TargetId;
        });
        
        socket.on('change tagger', function (PlayerId) {
            if (Client.Id === PlayerId) {
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "You are now the tagger." : "술래가 되셨습니다.", 30]);
            } else if (Client.Id === Client.Room.TaggerId) {
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "You are no longer the tagger." : "술래를 박탈당하셨습니다.", 30]);
            }
            Client.Room.TaggerId = PlayerId;
            if (!Client.Room.PlayerLiveStates[Client.RoomNum]) { // 관전자들 카메라 바뀐 술래에 집중
                Client.Camera = PlayerId;
            }
        })

        socket.on('player out', function (PlayerId) {
            const PlayerNum = Client.Room.PlayerIds.indexOf(PlayerId);
            Client.Room.LivePlayerCount--;
            Client.Room.PlayerLiveStates[PlayerNum] = 0;
            if (Client.Id === PlayerId) {
                Client.Camera = Client.Room.TaggerId;
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "You have been tagged out." : "술래한테 잡혔습니다.", 30]);
                if(Client.Settings.App){
                    Screen.Control.Delete();
                }
            } else {
                Screen.AlertData.unshift([Client.Room.PlayerNames[PlayerNum] + ((Client.Settings.Language === 0) ? " out!" : " 아웃!"), 30]);
            }
        })
      
        socket.on('emoji',function(PlayerId, Emoji){
            const PlayerNum = Client.Room.PlayerIds.indexOf(PlayerId);
            Client.Room.emoji[PlayerNum] = [Emoji, 60];
        });

        socket.on('game over', function (WinnerIndexs, PlayerGameStats) {
            Client.Room.Playing = 0;
            Client.Room.WinnerNums = WinnerIndexs;
            Client.Room.WinnerNames = [];
            Client.Room.PlayerGameStats = PlayerGameStats;
            Client.Room.WinnerNames.push(Client.Room.PlayerNames[WinnerIndexs[0]]);
            if (WinnerIndexs.length > 1) {
                Client.Room.WinnerNames.push(Client.Room.PlayerNames[WinnerIndexs[1]]);
            }
            Client.Room.ResultTime = Date.now();
            Screen.Now.Delete(); Screen.Now = new Screen.Create("result");
        })
    }

    function IngameLoop() {
        if (Client.Room.PlayerLiveStates[Client.RoomNum]) { // 플레이어 조종
            if (Client.PressedKeys[0] && Client.Skill.BoostCooltime === 0) { Client.Skill.Boost = 30; Client.Skill.BoostCooltime = 600; } // 점멸 사용
            let Speed = 58;
            let DiaSpeed = 41;
            if (Client.Skill.Boost > 0) { Speed = 174; DiaSpeed = 123; Client.Skill.Boost--; }
            else if (Client.Skill.BoostCooltime > 0) { Client.Skill.BoostCooltime -= (Client.Room.TaggerId === Client.Id) ? 2 : 1; (Client.Skill.BoostCooltime < 0) ? Client.Skill.BoostCooltime = 0:null; }
            let PlayerDx = 0;
            let PlayerDy = 0;
            if (Client.PressedKeys[9]) { PlayerDy -= 1; }
            if (Client.PressedKeys[10]) { PlayerDy += 1; }
            if (Client.PressedKeys[11]) { PlayerDx += 1; }
            if (Client.PressedKeys[12]) { PlayerDx -= 1; }
            if (PlayerDx !== 0 && PlayerDy !== 0) { PlayerDx *= DiaSpeed; PlayerDy *= DiaSpeed; } // 대각선 이동
            else if (PlayerDx !== 0 || PlayerDy !== 0) { PlayerDx *= Speed; PlayerDy *= Speed; } // 직선 이동
            if (Client.Skill.SwitchCooltime === 0) {
                for (i = 0; i < 8; i++) {
                    if (Client.PressedKeys[i + 1]) {
                        if (Client.Room.PlayerLiveStates[i] === 1 && Client.Id !== Client.Room.TaggerId && Client.RoomNum !== i && Client.Room.TaggerId !== Client.Room.PlayerIds[i]) {
                            socket.emit('change challenge', Client.Room.PlayerIds[i]);
                            Client.Skill.SwitchCooltime = 150;
                            break;
                        }
                    }
                }
            }
            if(Client.PressedKeys[13] && !Screen.emoji.clicked) {
                Screen.emoji.show = 1
                if(Client.PressedKeys[14]){
                    Screen.emoji.what = 1;
                    Screen.emoji.clicked = 1;
                }else if(Client.PressedKeys[15]){
                    Screen.emoji.what = 2;
                    Screen.emoji.clicked = 1;
                }else if(Client.PressedKeys[16]){
                    Screen.emoji.what = 3;
                    Screen.emoji.clicked = 1;
                }else if(Client.PressedKeys[17]){
                    Screen.emoji.what = 4;
                    Screen.emoji.clicked = 1;
                }else if(Client.PressedKeys[18]){
                    Screen.emoji.what = 5;
                    Screen.emoji.clicked = 1;
                }else if(Client.PressedKeys[19]){
                    Screen.emoji.what = 6;
                    Screen.emoji.clicked = 1;
                }else if(Client.PressedKeys[20]){
                    Screen.emoji.what = 7;
                    Screen.emoji.clicked = 1;
                }else if(Client.PressedKeys[21]){
                    Screen.emoji.what = 8;
                    Screen.emoji.clicked = 1;
                }
            }else{
                Screen.emoji.show = 0;
            }
            if (Client.Skill.SwitchCooltime > 0) { Client.Skill.SwitchCooltime -= (Client.Room.TaggerId === Client.Id) ? 2 : 1; (Client.Skill.SwitchCooltime < 0) ? Client.Skill.SwitchCooltime = 0:null; }
            socket.emit('client update', PlayerDx, PlayerDy, (Client.Skill.Boost > 0) ? 1 : 0);
            if(Screen.emoji.what){
                socket.emit('emoji', Screen.emoji.what);
                Screen.emoji.what = 0;
                Client.PressedKeys[13] = 0;
                Client.PressedKeys[14] = 0;
                Client.PressedKeys[15] = 0;
                Client.PressedKeys[16] = 0;
                Client.PressedKeys[17] = 0;
                Client.PressedKeys[18] = 0;
                Client.PressedKeys[19] = 0;
                Client.PressedKeys[20] = 0;
                Client.PressedKeys[21] = 0;
            }
            if(Screen.emoji.clicked){
                if(!Client.PressedKeys[13]){
                    Screen.emoji.clicked = 0;
                }
            }
        }

        for (i = 0; i < 8; i++) {
            function DeleteBoost() { // 스킬 효과 조정
                if (Client.Room.Skill.Boost[i].length === 0) { return; }
                if (Client.Room.Skill.Boost[i][0][2] + 1000 <= Client.Room.ElapsTime) {
                    Client.Room.Skill.Boost[i].splice(0, 1);
                    DeleteBoost();
                }
            }
            DeleteBoost();
            if (Client.Room.Skill.Switch[i] + 1000 <= Client.Room.ElapsTime) { Client.Room.Skill.Switch[i] = 0; }
            // 생존자 창에 뜨는 술래변경시 모션
            if (Client.Room.PlayerIds.indexOf(Client.Room.TaggerId) === i) {
                Client.Room.TaggerChangeEffect[i] += (1.1 - Client.Room.TaggerChangeEffect[i]) * 0.2;
            } else {
                Client.Room.TaggerChangeEffect[i] += (1 - Client.Room.TaggerChangeEffect[i]) * 0.2;
            }
        }
    }

    function UIexecute() {

        if (Screen.Now.name === "agreement") {
            UIcheck(Screen.UI.agreement.ok, function () {
                Screen.Now.Delete();
                Screen.Now = new Screen.Create("title");
                Screen.Sounds.BGM.volume = 0.5;
                Screen.UI.Element.sound_slider.value = 50;
                Screen.Sounds.BGM.currentTime = 0;
                Screen.Sounds.BGM.play();
            });
            UIcheck(Screen.UI.agreement.no, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("title"); Screen.Sounds.BGM.volume = 0; Screen.UI.Element.sound_slider.value = 0; Screen.Sounds.BGM.currentTime = 0; Screen.Sounds.BGM.play();});
        } else if(Screen.Now.name === "welcomeback"){
            UIcheck(Screen.UI.welcomeback.ok, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("title"); Screen.Sounds.BGM.currentTime = 0; Screen.Sounds.BGM.play();});
        }else if (Screen.Now.name === "title") {
            if(Client.Settings.App) {
                window.AppInventor.setWebViewString("sound"+String(Screen.UI.Element.sound_slider.value).padStart(3, "0"));
            }else{
                if(window.localStorage.getItem("sound") === null) {
                    window.localStorage.setItem("sound", Screen.UI.Element.sound_slider.value);
                }
            }
            UIcheck(Screen.UI.title.help, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("help"); });
            UIcheck(Screen.UI.title.credit, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("credit"); });
            UIcheck(Screen.UI.title.setting, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("setting"); });
            UIcheck(Screen.UI.title.start, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("matching"); });
        } else if (Screen.Now.name === "help") {
            UIcheck(Screen.UI.help.back, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("title"); });
        } else if (Screen.Now.name === "credit") {
            UIcheck(Screen.UI.credit.back, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("title"); });
            UIcheck(Screen.UI.credit.github_Seol7523, function () {
                if(Client.Settings.App) {
                    window.AppInventor.setWebViewString("Seol7523");
                }else{
                    window.open('https://github.com/Seol7523', '_blank');
                };
            })
            UIcheck(Screen.UI.credit.github_Mossygoldcoin, function () {
                if(Client.Settings.App) {
                    window.AppInventor.setWebViewString("Mossygoldcoin");
                }else{
                    window.open('https://github.com/Mossygoldcoin', '_blank');
                };
            })
            UIcheck(Screen.UI.credit.soundcloud_H, function () {
                if(Client.Settings.App) {
                    window.AppInventor.setWebViewString("H");
                }else{
                    window.open('https://soundcloud.com/hraver/switchover', '_blank');
                };
            })
        } else if (Screen.Now.name === "setting") {
            Screen.Sounds.BGM.volume = Screen.UI.Element.sound_slider.value*0.01;
            if(Client.Settings.App) {
                window.AppInventor.setWebViewString("sound"+String(Screen.UI.Element.sound_slider.value).padStart(3, "0"));
            }else{
                window.localStorage.setItem("sound", Screen.UI.Element.sound_slider.value);
            }
            UIcheck(Screen.UI.setting.back, function () {
                Screen.Now.Delete(); 
                Screen.Now = new Screen.Create("title"); 
            });
            UIcheck(Screen.UI.setting.korean, function () {
                Screen.Now.Delete();
                Screen.Now = new Screen.Create("setting"); // 있어야 뒤로가기 버튼이 잘 변함
                Client.Settings.Language = 1;
                if(Client.Settings.App){
                    window.AppInventor.setWebViewString("lan1");
                }else{
                    window.localStorage.setItem('settings',1);
                };
            });
            UIcheck(Screen.UI.setting.english, function () {
                Screen.Now.Delete();
                Screen.Now = new Screen.Create("setting");
                Client.Settings.Language = 0;
                if(Client.Settings.App){
                    window.AppInventor.setWebViewString("lan0");
                }else{
                    window.localStorage.setItem('settings',0);
                };
            });
        } else if (Screen.Now.name === "matching") {
            UIcheck(Screen.UI.matching.back, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("title"); });
            Screen.BGctx.font = "36px 'Do Hyeon'";
            UIcheck(Screen.UI.matching.quickStart, function () {
                if(Client.dev && Screen.UI.Element.name_input.value.slice(0,5) !== "[개발자]"){
                    Screen.UI.Element.name_input.value = "[개발자]"+Screen.UI.Element.name_input.value;
                };
                if (NameCheck(Screen.UI.Element.name_input.value)) {
                    socket.emit('join room', {newRoom: false, roomId: "auto", name: Screen.UI.Element.name_input.value, password: 0, device: Client.Settings.App});
                    Screen.Now.Delete(); Screen.Now = new Screen.Create("loading");
                }
            });
            UIcheck(Screen.UI.matching.newRoom, function(){
                if(Client.dev && Screen.UI.Element.name_input.value.slice(0,5) !== "[개발자]"){
                    Screen.UI.Element.name_input.value = "[개발자]"+Screen.UI.Element.name_input.value;
                };
                if (NameCheck(Screen.UI.Element.name_input.value)) {
                    Screen.Now.Delete(); Screen.Now = new Screen.Create("newroom_select");
                }
            });
            UIcheck(Screen.UI.matching.joinRoom, function(){
                if(Client.dev && Screen.UI.Element.name_input.value.slice(0,5) !== "[개발자]"){
                    Screen.UI.Element.name_input.value = "[개발자]"+Screen.UI.Element.name_input.value;
                };
                if (NameCheck(Screen.UI.Element.name_input.value)) {
                    const targetroomid = parseInt((parseInt(Screen.UI.Element.id_input.value, 16) / 9196)) - 17534;
                    if (isNaN(targetroomid)) {
                        Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "The ID is not correct." : "올바르지 않은 ID입니다.", 30]);
                    } else if (targetroomid < 1 || 65535 < targetroomid) {
                        Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "The ID is not correct." : "올바르지 않은 ID입니다.", 30]);
                    } else {
                        const roomkey = Screen.UI.Element.password_input.value; // 문자열 (숫자써도 문자열)
                        socket.emit('join room', {newRoom: false, roomId: targetroomid, name: Screen.UI.Element.name_input.value, password: (roomkey) ? roomkey.length * 10000 + parseInt(roomkey) : 0, device: Client.Settings.App});
                        Screen.Now.Delete(); Screen.Now = new Screen.Create("loading");
                    }
                }
            });
        } else if(Screen.Now.name === "newroom_select"){
            UIcheck(Screen.UI.newroom_select.back, function(){
                Screen.Now.Delete();
                Screen.Now = new Screen.Create("matching");
            });
            UIcheck(Screen.UI.newroom_select.global,function(){
                Screen.UI.Element.room_key_input.customprivate = false;
            });
            UIcheck(Screen.UI.newroom_select.private,function(){
                Screen.UI.Element.room_key_input.customprivate = true;
            });
            UIcheck(Screen.UI.newroom_select.make,function(){
                if(Screen.UI.Element.room_key_input.customprivate){
                    const roomkey = Screen.UI.Element.room_key_input.value; // 문자열 (숫자써도 문자열)
                    if (isNaN(roomkey)) {
                        Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "password must be number." : "비밀번호는 숫자여야 합니다.", 30]);
                        return;
                    } else if (roomkey.length < 1 || 4 < roomkey.length) {
                        Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "password length must be 1~4" : "비밀번호의 길이는 1~4 여야합니다.", 30]);
                        return;
                    } else {
                        socket.emit('join room', {newRoom: true, roomId: "auto", name: Screen.UI.Element.name_input.value, password: roomkey.length * 10000 + parseInt(roomkey), device: Client.Settings.App});
                    }
                }else{
                    socket.emit('join room', {newRoom: true, roomId: "auto", name: Screen.UI.Element.name_input.value, password: 0, device: Client.Settings.App});
                }
                Screen.Now.Delete(); Screen.Now = new Screen.Create("loading");
            })
        } else if (Screen.Now.name === "ready") {
            UIcheck(Screen.UI.ready.back, function () { Screen.Now.Delete(); Screen.Now = new Screen.Create("matching"); socket.emit('exit room'); });
            UIcheck(Screen.UI.ready.idcopy, function() {
                let copytext = document.createElement('textarea');
                copytext.value = (((Number(Client.RoomId) + 17534) * 9196) + Math.floor(Math.random() * 3602)).toString(16);
                document.body.appendChild(copytext);
                copytext.select();
                document.execCommand('copy');
                document.body.removeChild(copytext);
                Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "Room ID copied" : "ID를복사했습니다.", 30]);
            })
            UIcheck(Screen.UI.ready.mapLeft, function () {
                socket.emit('map change', -1);
            })
            UIcheck(Screen.UI.ready.mapRight, function () {
                socket.emit('map change', 1);
            })
            UIcheck(Screen.UI.ready.start, function () {
                if (Client.Room.PlayerCount > 2) {
                    socket.emit("start game");
                } else {
                    Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "We need 3 players" : "최소한 3명의 플레이어가 필요합니다.", 30]);
                }
            });
        } else if (Screen.Now.name === "result") {
            UIcheck(Screen.UI.result.save, function(){
                const tmpcanvas = document.createElement('canvas');
                tmpcanvas.width = 1600;
                tmpcanvas.height = 900;
                const tmpctx = tmpcanvas.getContext('2d');
                drawRect(tmpctx, 0, 0, 1600, 900, "#ffffff", 1, fix=false);
                image_title = new Image();
                image_title.src = "./image/swITchIO_title.png";
                tmpctx.drawImage(image_title, 1250, 800, 300, 90);
                // 사용자 눈에 보이는 부분
                drawText(tmpctx, 800, 100, 80, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Result" : "결과", "center", fix=false);
                drawText(tmpctx, 10, 150, 50, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Winner" : "우승자", "left", fix=false);
                if (Client.Room.WinnerNames.length === 1) {
                    drawCircle(tmpctx, 150, 500, 100, Client.PlayerColors[Client.Room.WinnerNums[0]], false, 0,fix=false);
                    drawText(tmpctx, 150, 500, 125, 0, false, "#000000", 7.5, `${Client.Room.WinnerNums[0] + 1}`, "center", fix=false);
                    drawText(tmpctx, 150, 650, 40, 0, "#000000", false, false, Client.Room.WinnerNames[0], "center", fix=false);
                } else {
                    drawCircle(tmpctx, 150, 300, 75, Client.PlayerColors[Client.Room.WinnerNums[0]], false, 0, fix=false);
                    drawCircle(tmpctx, 150, 600, 75, Client.PlayerColors[Client.Room.WinnerNums[1]], false, 0, fix=false);
                    drawText(tmpctx, 150, 300, 90, 0, false, "#000000", 7.5, `${Client.Room.WinnerNums[0] + 1}`, "center", fix=false);
                    drawText(tmpctx, 150, 600, 90, 0, false, "#000000", 7.5, `${Client.Room.WinnerNums[1] + 1}`, "center", fix=false);
                    drawText(tmpctx, 150, 400, 40, 0, "#000000", false, false, Client.Room.WinnerNames[0], "center", fix=false);
                    drawText(tmpctx, 150, 700, 40, 0, "#000000", false, false, Client.Room.WinnerNames[1], "center", fix=false);
                }
                drawText(tmpctx, 400, 150, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Stats" : "상세정보", "left", fix=false);
                drawText(tmpctx, 400, 200, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Name" : "이름", "left", fix=false);
                drawText(tmpctx, 900, 200, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Kill" : "킬 수", "left", fix=false);
                drawText(tmpctx, 1300, 200, 55, 0, "#000000", false, false, (Client.Settings.Language === 0) ? "Switch" : "스위치", "left", fix=false);
                result_draw_y = 260;
                for (i = 0; i < 8; i++) {
                    if (Client.Room.PlayerIds[i] !== 0){
                        drawText(tmpctx, 400, result_draw_y, 50, 0, "#000000", false, false, `${i + 1}. ${Client.Room.PlayerNames[i]}`, "left", fix=false);
                        drawText(tmpctx, 900, result_draw_y, 50, 0, "#000000", false, false, `${Client.Room.PlayerGameStats[i][0]}`, "left", fix=false);
                        drawText(tmpctx, 1300, result_draw_y, 50, 0, "#000000", false, false, `${Client.Room.PlayerGameStats[i][1]}/${Client.Room.PlayerGameStats[i][2]}(${Math.round(Client.Room.PlayerGameStats[i][1] / (Client.Room.PlayerGameStats[i][2] == 0 ? 1 : Client.Room.PlayerGameStats[i][2]) * 100)}%)`, "left", fix=false);
                        result_draw_y += 50
                    }
                }
                const image = tmpcanvas.toDataURL("image/png");
                const link = document.createElement('a');
                link.href = image;
                link.download = `result.png`;
                link.click();
                tmpcanvas.remove();
            })
        }

        function NameCheck (PlayerName) {
            if(Client.dev){
                if (PlayerName.length < 1 || 15 < PlayerName.length) {
                    Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "Enter name(1~15 length)" : "이름은 1~15글자입니다.", 30]);
                    return false;
                } else if (Screen.BGctx.measureText(PlayerName).width < 10 || 432 < Screen.BGctx.measureText(PlayerName).width) {
                    Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "Name is too wide." : "이름이 너무 넓습니다.", 30]);
                    return false;
                }
                return true;
            }else{
                if (PlayerName.length < 1 || 15 < PlayerName.length) {
                    Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "Enter name(1~15 length)" : "이름은 1~15글자입니다.", 30]);
                    return false;
                } else if (Screen.BGctx.measureText(PlayerName).width < 10 || 432 < Screen.BGctx.measureText(PlayerName).width) {
                    Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "Name is too wide." : "이름이 너무 넓습니다.", 30]);
                    return false;
                } else if (PlayerName.includes("[개발자]")) {
                    Screen.AlertData.unshift([(Client.Settings.Language === 0) ? "The name is not allowed." : "허용되지 않는 이름입니다.", 30]);
                    return false;
                }
                return true;
            }
        }

        function UIcheck (data, execute) {
            if (data) {
                if (data.click) {
                    execute();
                    data.click = false;
                }
            }
        }

    }

});
