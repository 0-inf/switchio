$(function () {
    window.customscale = 1;
    window.customKeyList = [];
    window.customAlert = [];
    // 내부 함수
    function windowResize(width, height) {
        width_go = (width * 0.8) / 800;
        height_go = (height * 0.8) / 450;
        if (width_go > height_go) {
            window.customscale = height_go;
        } else {
            window.customscale = width_go;
        }
        background.width = 800 * window.customscale;
        background.height = 450 * window.customscale;
        screen.width = 800 * window.customscale;
        screen.height = 450 * window.customscale;
        ui_screen.width = 800 * window.customscale;
        ui_screen.height = 450 * window.customscale;
        ui_screen_2.width = 800 * window.customscale;
        ui_screen_2.height = 450 * window.customscale;
        bg_ctx.scale(window.customscale, window.customscale);
        de_ctx.scale(window.customscale, window.customscale);
        ui_ctx.scale(window.customscale, window.customscale);
        ui_ctx_2.scale(window.customscale, window.customscale);
        if (CLIENTDATA.client.status == 'ingame') {
            ingamescreen.drawUI();
        } else if (CLIENTDATA.client.status == 'matching') {
            matchingscreen.update_input();
        } else if (CLIENTDATA.client.status == 'ready') {
            readyscreen.update_layout();
        } else if (CLIENTDATA.client.status == 'newroom_select') {
            newroom_select.update_input();
        } else if (CLIENTDATA.client.status == 'setting'){
            settingscreen.sound_slider_update();
        }
    }
    function mouseupdate(e) {
        const x = e.offsetX / window.customscale;
        const y = e.offsetY / window.customscale;
        window.customMouseX = x;
        window.customMouseY = y;
    };
    function mouseclickupdate(e) {
        const x = e.offsetX / window.customscale;
        const y = e.offsetY / window.customscale;
        window.customMouseClickX = x;
        window.customMouseClickY = y;
        window.customMouseClick = true;
    };
    let CLIENTDATA = {
        client: {
            id: null,
            status: null
        },
        readyroom: {},
        ingameroom: {
            playerXlist: [],
            playerYlist: [],
            cam: undefined,
            TaggerId: undefined
        }
    };
    const ColorData = {
        0: 'rgb(202,166,254)',
        1: 'rgb(190,233,180)',
        2: 'rgb(252,255,176)',
        3: 'rgb(252,198,247)',
        4: 'rgb(255,185,0)',
        5: 'rgb(121,255,206)',
        6: 'rgb(220,145,70)',
        7: 'rgb(174,205,255)',
        10: 'rgba(202,166,254,0.5)',
        11: 'rgba(190,233,180,0.5)',
        12: 'rgba(252,255,176,0.5)',
        13: 'rgba(252,198,247,0.5)',
        14: 'rgba(255,185,0,0.5)',
        15: 'rgba(121,255,206,0.5)',
        16: 'rgba(220,145,70,0.5)',
        17: 'rgba(174,205,255,0.5)',
    };
    const KeyCodeList = {
        1: 49,
        2: 50,
        3: 51,
        4: 52,
        5: 53,
        6: 54,
        7: 55,
        8: 56,
        'ArrowLeft': 37,
        'ArrowRight': 39,
        'ArrowUp': 38,
        'ArrowDown': 40,
        ' ': 32,
        'w': 38,
        'a': 37,
        's': 40,
        'd': 39,
    }
    let bgm = new Audio('sound\\H-0921demo1mp3.mp3');
    bgm.loop = true;
    bgm.volume = 0.5;
    window.button_effect = new Audio('sound\\Wood Tap.mp3');
    window.button_effect.volume = 0.5;
    let connect_effect = new Audio('sound\\Connect.mp3');
    connect_effect.volume = 0.5;
    let disconnect_effect = new Audio('sound\\Disconnect.mp3');
    disconnect_effect.volume = 0.5;
    let Start_effect = new Audio('sound\\Boom Cloud.mp3');
    Start_effect.volume = 0.5;
    let dash_effect = new Audio('sound\\High Whoosh.mp3');
    dash_effect.volume = 0.5;
    let cooltime_effect = new Audio('sound\\Collect.mp3');
    cooltime_effect.volume = 0.5;

    let socket = io();
    let background = document.getElementById("background");
    let screen = document.getElementById("screen");
    let ui_screen = document.getElementById("ui_screen");
    let ui_screen_2 = document.getElementById("ui_screen_2");
    let bg_ctx = background.getContext('2d');
    let de_ctx = screen.getContext('2d');
    let ui_ctx = ui_screen.getContext('2d');
    let ui_ctx_2 = ui_screen_2.getContext('2d');
    let mainLoop = function () { };
    let interval = setInterval(function () {
        mainLoop();
    }, 33);
    window.addEventListener('resize', function () {
        windowResize(window.innerWidth, window.innerHeight);
    });
    ui_screen.addEventListener('mousemove', function (e) {
        mouseupdate(e);
    });
    ui_screen.addEventListener('click', function (e) {
        mouseclickupdate(e);
    });
    window.addEventListener('keydown', function (e) {
        if (e.key in KeyCodeList && window.customKeyList.indexOf(KeyCodeList[e.key]) == -1 && CLIENTDATA.client.status == 'ingame') {
            if (CLIENTDATA.client.playing[0] === 1 && KeyCodeList[e.key] > 48 && KeyCodeList[e.key] < 57) {
                ingamescreen.trychange(KeyCodeList[e.key] - 48);
            }
            window.customKeyList.push(KeyCodeList[e.key]);
        }
    });
    window.addEventListener('keyup', function (e) {
        if (e.key in KeyCodeList) {
            while (window.customKeyList.indexOf(KeyCodeList[e.key]) !== -1) {
                window.customKeyList.splice(window.customKeyList.indexOf(KeyCodeList[e.key]), 1);
            }
        }
    });

    // 서버와 처음 연결되었을때
    socket.on('connected', function (myId) {
        CLIENTDATA.client.id = myId;
        windowResize(window.innerWidth, window.innerHeight);
        agreementscreen.initialize();
    });

    // 입력한 id의 방이 존재하지 않을때
    socket.on('no room', function (reason) {
        waitserver.destroy();
        if (reason == 0) {
            window.customAlert.push(["The room does not exist.", 30]);
        } else if (reason == 1) {
            window.customAlert.push(["The room is full.", 30]);
        } else if (reason == 2) {
            window.customAlert.push(["Password is different.", 30]);
        } else if (reason == 3) {
            window.customAlert.push(["Server is full.", 30]);
        } else {
            window.customAlert.push(["Server Error", 30]);
        }
        matchingscreen.initialize();
    });

    // 어떤 방에 접속했을때 그 방의 정보를 받는 이벤트
    socket.on('join room', function (RoomId, Players, Counts, Names, Owner, Playing) { // 이금화: Playing 이 0 이면 대기중인 방이고 1 이면 게임중인 방
        CLIENTDATA.readyroom.roomid = ((Number(RoomId) + 17534) * 9196) + Math.floor(Math.random() * 3602);
        CLIENTDATA.readyroom.roomid = CLIENTDATA.readyroom.roomid.toString(16);
        CLIENTDATA.readyroom.players = new Int16Array(Players);
        CLIENTDATA.readyroom.counts = Counts;
        CLIENTDATA.readyroom.names = Names;
        CLIENTDATA.readyroom.owner = Owner;
        CLIENTDATA.client.playing = [0,Playing];
        (Playing === 0) ? readyscreen.initialize():null;
    });

    // 클라이언트가 있는 방에 새로운 사람이 들어왔을때
    socket.on('user join', function (newplayer, name, num) {
        CLIENTDATA.readyroom.counts++;
        CLIENTDATA.readyroom.players[num] = newplayer;
        CLIENTDATA.readyroom.names[num] = name;
        if(CLIENTDATA.client.playing[0] === 0){
            readyscreen.update_layout();
            connect_effect.currentTime = 0;
            connect_effect.play();
        }
    });

    // 클라이언트가 있는 방에서 유저가 나갔을때 이벤트(게임중이 아님)
    socket.on('user exit', function (id) {
        CLIENTDATA.readyroom.counts--;
        let num = CLIENTDATA.readyroom.players.indexOf(id);
        CLIENTDATA.readyroom.players[num] = 0;
        CLIENTDATA.readyroom.names[num] = undefined;
        if (CLIENTDATA.client.status == "ready") {
            readyscreen.destroy();
            disconnect_effect.currentTime = 0;
            disconnect_effect.play();
            readyscreen.initialize();
        }
    });

    // 대기방의 방장을 넘기는 경우 발생하는 이벤트
    socket.on('pass owner', function (id) {
        CLIENTDATA.readyroom.owner = id;
        if (CLIENTDATA.client.status == 'ready') {
            readyscreen.destroy();
            if (id == CLIENTDATA.client.id) {
                window.customAlert.push(['You became the owner.', 30]);
            }
            readyscreen.initialize();
        }
    });

    // 클라이언트가 방장에 의해서 강제 퇴장당했을때 발생하는 이벤트
    socket.on('kicked', function () {
        socket.emit("kicked ok");
        window.customAlert.push(['You were kicked from the room.', 30]);
        readyscreen.destroy();
        matchingscreen.initialize();
    });

    // 인게임에서 다른 사람들의 데이터를 받고 수정
    socket.on('client update', function (newXs, newYs, newBoosts, time) {
        let newBoost = new Uint8Array(newBoosts);
        for (let i = 0; i < 8; i++) {
            (newBoost[i] == 1 && (CLIENTDATA.ingameroom.boost[i][0] == 0)) ? CLIENTDATA.ingameroom.boost[i][0] = [CLIENTDATA.ingameroom.playerXlist[i], CLIENTDATA.ingameroom.playerYlist[i]] : null;
        }
        CLIENTDATA.ingameroom.playerXlist = new Int16Array(newXs);
        CLIENTDATA.ingameroom.playerYlist = new Int16Array(newYs);
        CLIENTDATA.ingameroom.time = time;
    });

    // 게임이 시작될때 이벤트
    socket.on('start game', function (PlayerX, PlayerY, TaggerId, map) {
        (CLIENTDATA.client.playing[1] === 0) ? CLIENTDATA.client.playing[0] = 1:null;
        CLIENTDATA.ingameroom.map = map;
        CLIENTDATA.ingameroom.playerXlist = new Int16Array(PlayerX);
        CLIENTDATA.ingameroom.playerYlist = new Int16Array(PlayerY);
        CLIENTDATA.ingameroom.TaggerId = TaggerId;
        if (CLIENTDATA.client.playing[0] === 1) {
            Start_effect.currentTime = 0;
            Start_effect.play();
            CLIENTDATA.ingameroom.cam = CLIENTDATA.client.id;
        } else {
            CLIENTDATA.ingameroom.cam = CLIENTDATA.ingameroom.TaggerId;
        }
        CLIENTDATA.ingameroom.players = [0, 0, 0, 0, 0, 0, 0, 0];
        CLIENTDATA.ingameroom.names = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
        for (let i = 0; i < 8; i++) {
            if (CLIENTDATA.client.playing[0] === 0 && CLIENTDATA.readyroom.players[i] === CLIENTDATA.client.id) { continue; }
            CLIENTDATA.ingameroom.players[i] = CLIENTDATA.readyroom.players[i];
            CLIENTDATA.ingameroom.names[i] = CLIENTDATA.readyroom.names[i];
        }
        CLIENTDATA.ingameroom.time = 0;
        CLIENTDATA.ingameroom.counts = CLIENTDATA.readyroom.counts;
        CLIENTDATA.ingameroom.boost = [[0, 10], [0, 10], [0, 10], [0, 10], [0, 10], [0, 10], [0, 10], [0, 10]];
        CLIENTDATA.ingameroom.switch = [[false, 10], [false, 10], [false, 10], [false, 10], [false, 10], [false, 10], [false, 10], [false, 10]];
        (CLIENTDATA.client.playing[0] === 1) ? readyscreen.destroy():null;
        ingamescreen.initialize();
    });

    // 어떤 플레이어가 술래를 바꾸려고 했을때 이벤트
    socket.on('change challenge', function (playerID, targetID) {
        let num = CLIENTDATA.ingameroom.players.indexOf(playerID);
        CLIENTDATA.ingameroom.switch[num][0] = [playerID, targetID];
        CLIENTDATA.ingameroom.switch[num][1] = 10;
    });

    // 술래가 바뀌었을때 이벤트
    socket.on('change tagger', function (newTaggerID) {
        if (CLIENTDATA.ingameroom.TaggerId == CLIENTDATA.client.id) {
            window.customAlert.push(['You are no longer the tagger.', 30]);
        } else if (newTaggerID == CLIENTDATA.client.id) {
            window.customAlert.push(['You are now the tagger.', 30]);
        }
        CLIENTDATA.ingameroom.TaggerId = newTaggerID;
        if (CLIENTDATA.ingameroom.players.indexOf(CLIENTDATA.client.id) == -1) {
            CLIENTDATA.ingameroom.cam = CLIENTDATA.ingameroom.TaggerId;
        }
        ingamescreen.drawUI();
    });

    // 게임중인 플레이어가 아웃되었을때 이벤트
    socket.on('player out', function (outplayerID) {
        let num = CLIENTDATA.ingameroom.players.indexOf(outplayerID);
        CLIENTDATA.ingameroom.players[num] = 0;
        CLIENTDATA.ingameroom.counts--;
        if (outplayerID == CLIENTDATA.client.id) {
            CLIENTDATA.ingameroom.cam = CLIENTDATA.ingameroom.TaggerId;
            ingamescreen.playing = false;
            window.customAlert.push(['You have been tagged out.', 30]);
        } else {
            window.customAlert.push([CLIENTDATA.readyroom.names[num] + ' out!', 30]);
        }
        ingamescreen.drawUI();
    });

    // 인게임 상황에서 어떤 플레이어가 강제종료(창을 닫음)했을때 내보내는 이벤트
    socket.on('playing user exit', function (playerId) {
        let num = CLIENTDATA.readyroom.players.indexOf(playerId);
        window.customAlert.push([CLIENTDATA.readyroom.names[num] + ' exit!', 30]);
        CLIENTDATA.ingameroom.players[num] = 0;
        CLIENTDATA.ingameroom.counts--;
        CLIENTDATA.readyroom.counts--;
        CLIENTDATA.readyroom.players[num] = 0;
        CLIENTDATA.readyroom.names[num] = undefined;
        ingamescreen.drawUI();
    });

    // 인게임에서 생존자가 2명 이하일때 게임이 종료되었을때 이벤트
    socket.on('game over', function (winners) {
        CLIENTDATA.client.playing[1] = 0;
        ingamescreen.playing = false;
        ingamescreen.destroy();
        resultscreen.initialize(winners);
    });

    socket.on('check password', function (password) {
        check_password.initialize(password);
    });

    socket.on('get booster', function () {
        if (CLIENTDATA.client.status === 'ingame') {
            ingamescreen.cooltime.dash = 0;
        }
    })

    // 음악 재생 확인 화면 코드
    let agreementscreen = new(function(){
        let agree = this;
        agree.okbutton = new ButtonObject();
        agree.okbutton.click = function(){
            agreementscreen.destroy();
            bgm.currentTime = 0;
            bgm.volume = 0.5;
            window.button_effect.volume = 0.5;
            connect_effect.volume = 0.5;
            bgm.play();
            titlescreen.initialize();
        }
        agree.nobutton = new ButtonObject();
        agree.nobutton.click = function(){
            agreementscreen.destroy();
            bgm.currentTime = 0;
            bgm.volume = 0;
            window.button_effect.volume = 0;
            connect_effect.volume = 0;
            disconnect_effect.volume = 0;
            Start_effect.volume = 0;
            dash_effect.volume = 0;
            cooltime_effect.volume = 0;
            bgm.play();
            titlescreen.initialize();
        }
        agree.thiswebsite = new TextObject();
        agree.youcan = new TextObject();
        agree.ifyou = new TextObject();

        agree.initialize = function(){
            agree.okbutton.initialize(ui_screen,ui_ctx,{
                text:{
                    x: 200,
                    y: 400,
                    size: 30,
                    sizeData: "30",
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "OK",
                    color: {fill: undefined, stroke: undefined},
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button:{
                    alive: true,
                    num: {my: 1, max:2},
                    x: 200,
                    y: 400,
                    width: 100,
                    height: 50,
                    positionData: {width: 100, height: 50},
                    lineWidth: 4,
                    color: {fill: undefined, stroke: undefined},
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            agree.nobutton.initialize(ui_screen,ui_ctx,{
                text:{
                    x: 600,
                    y: 400,
                    size: 30,
                    sizeData: "30",
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "NO",
                    color: {fill: undefined, stroke: undefined},
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button:{
                    alive: true,
                    num: {my: 2, max:2},
                    x: 600,
                    y: 400,
                    width: 100,
                    height: 50,
                    positionData: {width: 100, height: 50},
                    lineWidth: 4,
                    color: {fill: undefined, stroke: undefined},
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            agree.thiswebsite.initialize(ui_screen,ui_ctx,{
                text:{
                    x: 400,
                    y: 100,
                    size: 30,
                    sizeData: "30",
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "This website plays sound.(bgm,effect)",
                    color: {fill: undefined, stroke: undefined},
                    colorData: {
                        default: { fill: "#000000", stroke: undefined },
                        mouseover: { fill: "#000000", stroke: undefined }
                    }
                }
            })
            agree.youcan.initialize(ui_screen,ui_ctx,{
                text:{
                    x: 400,
                    y: 150,
                    size: 30,
                    sizeData: "30",
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "You can turn off/on sound in the setting menu.",
                    color: {fill: undefined, stroke: undefined},
                    colorData: {
                        default: { fill: "#000000", stroke: undefined },
                        mouseover: { fill: "#000000", stroke: undefined }
                    }
                }
            });
            agree.ifyou.initialize(ui_screen,ui_ctx,{
                text:{
                    x: 400,
                    y: 200,
                    size: 30,
                    sizeData: "30",
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "If you click 'OK', game will play music.",
                    color: {fill: undefined, stroke: undefined},
                    colorData: {
                        default: { fill: "#000000", stroke: undefined },
                        mouseover: { fill: "#000000", stroke: undefined }
                    }
                }
            });
            mainLoop = agree.loop;
            CLIENTDATA.client.status = "agreement";
        }

        agree.loop = function(){
            bg_ctx.clearRect(0,0,800,450);
            de_ctx.clearRect(0,0,800,450);
            ui_ctx.clearRect(0,0,800,450);
            ui_ctx_2.clearRect(0,0,800,450);
            roundedRect(ui_ctx, 400 , 225 , 750 , 420 , "#9f9f9f" , "rgb(127,127,127)");
            agree.okbutton.draw.call(agree.okbutton);
            agree.nobutton.draw.call(agree.nobutton);
            agree.thiswebsite.draw.call(agree.thiswebsite);
            agree.youcan.draw.call(agree.youcan);
            agree.ifyou.draw.call(agree.ifyou);
        }

        agree.destroy = function(){
            mainLoop = undefined;
            agree.okbutton.destroy();
            agree.nobutton.destroy();
        }
    })();

    // 타이틀 화면 코드
    let titlescreen = new (function () {
        let title = this;
        title.animation_count = 0;
        title.animation_d = 1;
        title.animation_before = 0;
        title.animation_before_which = [1, 2, 3];
        title.startbutton = new ButtonObject();
        title.startbutton.click = function () {
            titlescreen.destroy();
            matchingscreen.initialize();
        };
        title.settingbutton = new ButtonObject();
        title.settingbutton.click = function () {
            titlescreen.destroy();
            settingscreen.initialize();
        };
        title.informationbutton = new ButtonObject();
        title.informationbutton.click = function () {
            titlescreen.destroy();
            infoscreen.initialize();
        };
        title.creditbutton = new ButtonObject();
        title.creditbutton.click = function () {
            titlescreen.destroy();
            creditscreen.initialize();
        };
        title.initialize = function () {
            window.customAlert = [];
            window.customMouseClick = false;
            CLIENTDATA.client.status = "title";
            title.titleimage = new Image();
            title.titleimage.src = "image\\swITchIO_title.png";
            title.titleimage.onload = function () {
                bg_ctx.drawImage(title.titleimage, 150+window.XfixStart, 10+window.YfixStart, 500, 150)
            };
            ingamescreen.dashbutton = new Image();
            ingamescreen.dashbutton.src = "image\\dash_button.png";
            ingamescreen.switchbutton = new Image();
            ingamescreen.switchbutton.src = "image\\switch_button.png";
            title.informationbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 765,
                    y: 420,
                    size: "40",
                    sizeData: 40,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "?",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 3, max: 4 },
                    x: 765,
                    y: 420,
                    width: 50,
                    height: 50,
                    positionData: { width: 50, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            title.startbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 250,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "START",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 1, max: 4 },
                    x: 400,
                    y: 250,
                    width: 300,
                    height: 50,
                    positionData: { width: 300, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#baffff", stroke: "#7fdfff" },
                        mouseover: { fill: "#7fdfff", stroke: "#40a8c6" }
                    }
                }
            });
            title.settingbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 350,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "SETTING",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 2, max: 4 },
                    x: 400,
                    y: 350,
                    width: 300,
                    height: 50,
                    positionData: { width: 300, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#ffb6b4", stroke: "#ff7f7f" },
                        mouseover: { fill: "#ff7f7f", stroke: "#c2494e" }
                    }
                }
            });
            title.creditbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 705,
                    y: 420,
                    size: "40",
                    sizeData: 40,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "C",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 4, max: 4 },
                    x: 705,
                    y: 420,
                    width: 50,
                    height: 50,
                    positionData: { width: 50, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            mainLoop = title.loop;
        };

        title.loop = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            title.startbutton.draw.call(title.startbutton);
            title.settingbutton.draw.call(title.settingbutton);
            title.informationbutton.draw.call(title.informationbutton);
            title.creditbutton.draw.call(title.creditbutton);
            bg_ctx.drawImage(title.titleimage, 150+window.XfixStart, 10+window.YfixStart, 500, 150)
            drawCircle(bg_ctx, 150, 260, 70, "rgba(127,127,127,0.7)");
            drawCircle(bg_ctx, 250, 300, 80, "rgba(127,223,255,0.5)");
            drawCircle(bg_ctx, 300, 370, 60, "rgba(255,127,127,0.2)");
            drawCircle(de_ctx, 150, 260, 60 + ((title.animation_before_which.indexOf(1)) ? title.animation_before : title.animation_count), "rgba(127,127,127,0.7)");
            drawCircle(de_ctx, 250, 300, 100 - ((title.animation_before_which.indexOf(2) == -1) ? title.animation_before : title.animation_count), "rgba(127,223,255,0.5)");
            drawCircle(de_ctx, 300, 370, 50 + ((title.animation_before_which.indexOf(3) == -1) ? title.animation_before : title.animation_count) * 0.8, "rgba(255,127,127,0.2)");
            if (title.animation_count == title.animation_before && title.animation_before_which != [1, 2, 3]) {
                title.animation_before_which = [1, 2, 3];
            };
            title.animation_count += title.animation_d;
            if (title.animation_count == 30) {
                title.animation_d *= -1;
            }
            if (title.animation_count == 0) {
                title.animation_d *= -1;
            }
            DrawcustomAlert(ui_ctx);
        };

        title.destroy = function () {
            bg_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            title.startbutton.destroy();
            title.settingbutton.destroy();
        };

    })();

    // 매칭 화면(어떤 방에 들어갈지 고르는 화면) 코드
    let matchingscreen = new (function () {
        let matching = this;
        matching.quickstartbutton = new ButtonObject();
        matching.quickstartbutton.click = function () {
            waitserver.initialize('q');
        };
        matching.newroombutton = new ButtonObject();
        matching.newroombutton.click = function () {
            matching.destroy();
            newroom_select.initialize(false);
        };
        matching.joinroombutton = new ButtonObject();
        matching.joinroombutton.click = function () {
            matching.destroy();
            let targetroomid = parseInt((parseInt(matchingscreen.id_input.value, 16) / 9196)) - 17534;
            if (!isNaN(targetroomid) && (targetroomid < 0 || targetroomid > 65535)) {
                window.customAlert.push(["The ID is not correct.", 30]);
                matchingscreen.initialize();
            } else if (isNaN(targetroomid)) {
                window.customAlert.push(["The ID is not correct.", 30]);
                matchingscreen.initialize();
            } else {
                let start_time = Date.now();
                mainLoop = function () {
                    bg_ctx.clearRect(0, 0, 800, 450);
                    de_ctx.clearRect(0, 0, 800, 450);
                    ui_ctx.clearRect(0, 0, 800, 450);
                    ui_ctx_2.clearRect(0, 0, 800, 450);
                    drawText(ui_ctx_2, {
                        x: 400,
                        y: 250,
                        size: "30",
                        sizeData: 30,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: "Initializing Client" + ".".repeat(Math.floor((Date.now() - start_time) / 250) % 4),
                        color: { fill: "rgb(127,127,127)", stroke: undefined }
                    })
                };
                socket.emit('check password', targetroomid);
            }
        };
        matching.backbutton = new ButtonObject();
        matching.backbutton.click = function () {
            matching.destroy();
            titlescreen.animation_before = titlescreen.animation_count;
            titlescreen.animation_before_which = [2];
            titlescreen.animation_count = matching.animation_count;
            titlescreen.animation_d = matching.animation_d;
            titlescreen.initialize();
        };
        matching.name_input = document.getElementById("name_input");
        matching.id_input = document.getElementById("id_input");

        matching.update_input = function () {
            matching.name_input.placeholder = 'Enter your name(1~15)';
            matching.name_input.id = 'name_input';
            matching.name_input.style.width = ui_screen.width * 0.5 + 'px';
            matching.name_input.style.height = ui_screen.height * 0.1 + 'px';
            matching.name_input.style.fontSize = ui_screen.height * 0.05 + 'px';
            matching.name_input.style.transform = 'translate(-50%, -' + (ui_screen.height * 0.35) + 'px)';
            matching.id_input.placeholder = "Enter Room ID";
            matching.id_input.style.transform = 'translate(' + ui_screen.width * (3 / 80) + 'px, ' + ui_screen.height * (7 / 90) + 'px)';
            matching.id_input.style.width = ui_screen.width * (17 / 40) + "px";
            matching.id_input.style.height = ui_screen.height * (1 / 9) + "px";
            matching.id_input.style.fontSize = ui_screen.height * (1 / 18) + "px";
        };

        matching.initialize = function () {
            matching.animation_count = titlescreen.animation_count;
            matching.animation_d = titlescreen.animation_d;
            window.customMouseClick = false;
            matching.name_input.focus();
            CLIENTDATA.client.status = "matching";
            matching.quickstartbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 200,
                    y: 185,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "QUICK START",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 1, max: 4 },
                    x: 200,
                    y: 185,
                    width: 340,
                    height: 50,
                    positionData: { width: 340, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#baffff", stroke: "#7fdfff" },
                        mouseover: { fill: "#7fdfff", stroke: "#40a8c6" }
                    }
                }
            });
            matching.newroombutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 600,
                    y: 185,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "NEW ROOM",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 2, max: 4 },
                    x: 600,
                    y: 185,
                    width: 340,
                    height: 50,
                    positionData: { width: 340, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#baffff", stroke: "#7fdfff" },
                        mouseover: { fill: "#7fdfff", stroke: "#40a8c6" }
                    }
                }
            });
            matching.joinroombutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 200,
                    y: 285,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "JOIN ROOM",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 3, max: 4 },
                    x: 200,
                    y: 285,
                    width: 340,
                    height: 50,
                    positionData: { width: 340, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#ffb6b4", stroke: "#ff7f7f" },
                        mouseover: { fill: "#ff7f7f", stroke: "#c2494e" }
                    }
                }
            });
            matching.backbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 75,
                    y: 30,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "BACK",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 4, max: 4 },
                    x: 75,
                    y: 30,
                    width: 100,
                    height: 40,
                    positionData: { width: 100, height: 40 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            matching.name_input.style.display = 'inline';
            matching.id_input.style.display = 'inline';
            matching.update_input();
            mainLoop = matching.loop;
        };

        matching.loop = function () {
            de_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            drawCircle(bg_ctx, 150, 260, 70, "rgba(127,127,127,0.7)");
            drawCircle(bg_ctx, 250, 300, 80, "rgba(127,223,255,0.5)");
            drawCircle(bg_ctx, 300, 370, 60, "rgba(255,127,127,0.2)");
            matching.quickstartbutton.draw.call(matching.quickstartbutton);
            matching.newroombutton.draw.call(matching.newroombutton);
            matching.joinroombutton.draw.call(matching.joinroombutton);
            matching.backbutton.draw.call(matching.backbutton);
            drawCircle(de_ctx, 150, 260, 60 + titlescreen.animation_count, "rgba(127,127,127,0.7)");
            drawCircle(de_ctx, 250, 300, 100 - matching.animation_count, "rgba(127,223,255,0.5)");
            drawCircle(de_ctx, 300, 370, 50 + (titlescreen.animation_count) * 0.8, "rgba(255,127,127,0.2)");
            matching.animation_count += matching.animation_d;
            if (matching.animation_count == 30) {
                matching.animation_d *= -1;
            }
            if (matching.animation_count == 0) {
                matching.animation_d *= -1;
            }
            DrawcustomAlert(ui_ctx)
        };

        matching.destroy = function () {
            matching.name_input.style.display = 'none';
            matching.id_input.style.display = 'none';
            ui_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            matching.quickstartbutton.destroy();
            matching.newroombutton.destroy();
            matching.joinroombutton.destroy();
            matching.backbutton.destroy();
        };
    })();

    // New Room에서 공개방/비번방 선택하는 화면코드
    let newroom_select = new (function () {
        let newroom = this;
        newroom.mode = '';
        newroom.key_input = document.getElementById("room_key_input");
        newroom.backbutton = new ButtonObject();
        newroom.matchingbutton = new ButtonObject();
        newroom.privatebutton = new ButtonObject();
        newroom.globalbutton = new ButtonObject();
        newroom.nowMode = new TextObject();
        newroom.roomKey = new TextObject();
        newroom.title = new TextObject();
        newroom.backbutton.click = function () {
            newroom.destroy();
            titlescreen.animation_count = newroom.animation_count;
            titlescreen.animation_d = newroom.animation_d;
            matchingscreen.initialize();
        };
        newroom.matchingbutton.click = function () {
            newroom_select.destroy();
            waitserver.initialize('n')
        };
        newroom.privatebutton.click = function () {
            newroom_select.destroy();
            matchingscreen.animation_count = newroom.animation_count;
            matchingscreen.animation_d = newroom.animation_d;
            newroom_select.initialize(false);
        };
        newroom.globalbutton.click = function () {
            newroom_select.destroy();
            matchingscreen.animation_count = newroom.animation_count;
            matchingscreen.animation_d = newroom.animation_d;
            newroom_select.initialize(true);
        };
        newroom.update_input = function () {
            if (newroom.isprivate) {
                newroom.key_input.style.display = 'inline';
            } else {
                newroom.key_input.style.display = 'none';
            }
            newroom.key_input.focus();
            newroom.key_input.placeholder = "Password(Only Num, length:2~4)";
            newroom.key_input.style.textAlign = "center";
            newroom.key_input.style.width = ui_screen.width * 0.375 + "px";
            newroom.key_input.style.height = ui_screen.height * 0.09 + "px";
            newroom.key_input.style.fontSize = ui_screen.height * 0.06 + "px";
            newroom.key_input.style.top = '50%';
            newroom.key_input.style.left = '50%';
            newroom.key_input.style.transform = 'translate(16%, 100%)';
        };

        newroom.initialize = function (isprivate) {
            CLIENTDATA.client.status = "newroom_select";
            window.customMouseClick = false;
            newroom.isprivate = isprivate;
            newroom.newmode = (isprivate) ? "private" : "global";
            newroom.animation_count = matchingscreen.animation_count;
            newroom.animation_d = matchingscreen.animation_d;
            newroom.backbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 75,
                    y: 30,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "BACK",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 1, max: 4 },
                    x: 75,
                    y: 30,
                    width: 100,
                    height: 40,
                    positionData: { width: 100, height: 40 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            newroom.matchingbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 380,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "Make New Room!",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 2, max: 4 },
                    x: 400,
                    y: 380,
                    width: 400,
                    height: 50,
                    positionData: { width: 400, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#baffff", stroke: "#7fdfff" },
                        mouseover: { fill: "#7fdfff", stroke: "#40a8c6" }
                    }
                }
            })
            newroom.privatebutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 600,
                    y: 200,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "Private Room",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: isprivate,
                    num: { my: 3, max: 4 },
                    x: 600,
                    y: 200,
                    width: 300,
                    height: 50,
                    positionData: { width: 300, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#ffb6b4", stroke: "#ff7f7f" },
                        mouseover: { fill: "#ff7f7f", stroke: "#c2494e" }
                    }
                }
            })
            newroom.globalbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 600,
                    y: 200,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "Global Room",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: !isprivate,
                    num: { my: 4, max: 4 },
                    x: 600,
                    y: 200,
                    width: 300,
                    height: 50,
                    positionData: { width: 300, height: 50 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#baffff", stroke: "#7fdfff" },
                        mouseover: { fill: "#7fdfff", stroke: "#40a8c6" }
                    }
                }
            })
            newroom.nowMode.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 200,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "right",
                    lineWidth: 2,
                    message: "Now Mode : ",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: 'rgb(127,127,127)', stroke: undefined },
                        mouseover: { fill: 'rgb(127,127,127)', stroke: undefined }
                    }
                }
            })
            newroom.roomKey.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 300,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "right",
                    lineWidth: 2,
                    message: "Room Key : ",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: 'rgb(127,127,127)', stroke: undefined },
                        mouseover: { fill: 'rgb(127,127,127)', stroke: undefined }
                    }
                }
            })
            newroom.title.initialize(background, bg_ctx, {
                text: {
                    x: 400,
                    y: 50,
                    size: "35",
                    sizeData: 35,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "Making New Room",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: 'rgb(127,127,127)', stroke: undefined },
                        mouseover: { fill: 'rgb(127,127,127)', stroke: undefined }
                    }
                }
            })
            newroom.update_input();
            mainLoop = newroom.loop;
        };

        newroom.loop = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            drawCircle(bg_ctx, 150, 260, 70, "rgba(127,127,127,0.7)");
            drawCircle(bg_ctx, 250, 300, 80, "rgba(127,223,255,0.5)");
            drawCircle(bg_ctx, 300, 370, 60, "rgba(255,127,127,0.2)");
            drawCircle(de_ctx, 150, 260, 60 + titlescreen.animation_count, "rgba(127,127,127,0.7)");
            drawCircle(de_ctx, 250, 300, 100 - newroom.animation_count, "rgba(127,223,255,0.5)");
            drawCircle(de_ctx, 300, 370, 50 + (titlescreen.animation_count) * 0.8, "rgba(255,127,127,0.2)");
            newroom.animation_count += newroom.animation_d;
            if (newroom.animation_count == 30) {
                newroom.animation_d *= -1;
            }
            if (newroom.animation_count == 0) {
                newroom.animation_d *= -1;
            }
            newroom.backbutton.draw.call(newroom.backbutton);
            newroom.matchingbutton.draw.call(newroom.matchingbutton);
            newroom.privatebutton.draw.call(newroom.privatebutton);
            newroom.globalbutton.draw.call(newroom.globalbutton);
            newroom.nowMode.draw.call(newroom.nowMode);
            newroom.title.draw.call(newroom.title);
            if (newroom.isprivate) {
                newroom.roomKey.draw.call(newroom.roomKey);
            }
            DrawcustomAlert(ui_ctx)
        };

        newroom.destroy = function () {
            newroom.backbutton.destroy();
            newroom.matchingbutton.destroy();
            newroom.privatebutton.destroy();
            newroom.globalbutton.destroy();
            newroom.key_input.style.display = 'none';
            bg_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
        };
    })();

    // join Room에서 비밀번호를 입력받는 화면코드
    let check_password = new (function () {
        let checking = this;

        checking.password_input = document.getElementById('password_input');
        checking.backbutton = new ButtonObject();
        checking.backbutton.click = function () {
            checking.destroy();
            matchingscreen.initialize();
        }
        checking.passwordTrybutton = new ButtonObject();
        checking.passwordTrybutton.click = function () {
            checking.destroy();
            waitserver.initialize('j');
        }
        checking.title = new TextObject();
        checking.Enter = new TextObject();

        checking.update_input = function () {
            checking.password_input.focus();
            checking.password_input.placeholder = "Enter Password";
            checking.password_input.style.width = ui_screen.width * 0.375 + "px";
            checking.password_input.style.height = ui_screen.height * 0.09 + "px";
            checking.password_input.style.fontSize = ui_screen.height * 0.06 + "px";
            checking.password_input.style.top = '50%';
            checking.password_input.style.left = '50%';
            checking.password_input.style.transform = 'translate(16%, 100%)';
        };

        checking.initialize = function (NeedPassword) {
            checking.password_need = NeedPassword;
            checking.passwordTry = 0;
            checking.animation_count = matchingscreen.animation_count;
            checking.animation_d = matchingscreen.animation_d;
            if (NeedPassword == 1) {
                checking.password_input.style.display = 'block';
                checking.backbutton.initialize(ui_screen, ui_ctx, {
                    text: {
                        x: 75,
                        y: 30,
                        size: "24",
                        sizeData: 24,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: "BACK",
                        color: { fill: undefined, stroke: undefined },
                        colorData: {
                            default: { fill: "#dfdfdf", stroke: undefined },
                            mouseover: { fill: "#e8e8e8", stroke: undefined }
                        }
                    },
                    button: {
                        alive: true,
                        num: { my: 1, max: 2 },
                        x: 75,
                        y: 30,
                        width: 100,
                        height: 40,
                        positionData: { width: 100, height: 40 },
                        lineWidth: 4,
                        color: { fill: undefined, stroke: undefined },
                        colorData: {
                            default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                            mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                        }
                    }
                });
                checking.passwordTrybutton.initialize(ui_screen, ui_ctx, {
                    text: {
                        x: 400,
                        y: 380,
                        size: "24",
                        sizeData: 24,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: "Join Room!",
                        color: { fill: undefined, stroke: undefined },
                        colorData: {
                            default: { fill: "#7f7f7f", stroke: undefined },
                            mouseover: { fill: "#dfdfdf", stroke: undefined }
                        }
                    },
                    button: {
                        alive: true,
                        num: { my: 2, max: 2 },
                        x: 400,
                        y: 380,
                        width: 400,
                        height: 50,
                        positionData: { width: 400, height: 50 },
                        lineWidth: 4,
                        color: { fill: undefined, stroke: undefined },
                        colorData: {
                            default: { fill: "#baffff", stroke: "#7fdfff" },
                            mouseover: { fill: "#7fdfff", stroke: "#40a8c6" }
                        }
                    }
                })
                checking.title.initialize(ui_screen_2, ui_ctx_2, {
                    text: {
                        x: 400,
                        y: 50,
                        size: "40",
                        sizeData: 40,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: "Password",
                        color: { fill: undefined, stroke: undefined },
                        colorData: {
                            default: { fill: "rgb(127,127,127)", stroke: undefined },
                            mouseover: { fill: "#e8e8e8", stroke: undefined }
                        }
                    }
                });
                checking.Enter.initialize(ui_screen, ui_ctx, {
                    text: {
                        x: 400,
                        y: 300,
                        size: "30",
                        sizeData: 30,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "right",
                        lineWidth: 2,
                        message: "Enter : ",
                        color: { fill: undefined, stroke: undefined },
                        colorData: {
                            default: { fill: 'rgb(127,127,127)', stroke: undefined },
                            mouseover: { fill: 'rgb(127,127,127)', stroke: undefined }
                        }
                    }
                })
                mainLoop = checking.loop;
                matchingscreen.destroy();
            } else {
                waitserver.initialize('j');
            }
        }

        checking.loop = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            drawCircle(bg_ctx, 150, 260, 70, "rgba(127,127,127,0.7)");
            drawCircle(bg_ctx, 250, 300, 80, "rgba(127,223,255,0.5)");
            drawCircle(bg_ctx, 300, 370, 60, "rgba(255,127,127,0.2)");
            drawCircle(de_ctx, 150, 260, 60 + titlescreen.animation_count, "rgba(127,127,127,0.7)");
            drawCircle(de_ctx, 250, 300, 100 - checking.animation_count, "rgba(127,223,255,0.5)");
            drawCircle(de_ctx, 300, 370, 50 + (titlescreen.animation_count) * 0.8, "rgba(255,127,127,0.2)");
            checking.animation_count += checking.animation_d;
            if (checking.animation_count == 30) {
                checking.animation_d *= -1;
            }
            if (checking.animation_count == 0) {
                checking.animation_d *= -1;
            }
            checking.update_input();
            checking.backbutton.draw.call(checking.backbutton);
            checking.passwordTrybutton.draw.call(checking.passwordTrybutton);
            checking.title.draw.call(checking.title);
            checking.Enter.draw.call(checking.Enter);
        };

        checking.destroy = function () {
            checking.backbutton.destroy();
            checking.passwordTrybutton.destroy();
            checking.password_input.style.display = 'none';
            titlescreen.animation_count = checking.animation_count;
            titlescreen.animation_d = checking.animation_d;
            ui_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
        };
    })();

    // 설정 화면 코드
    let settingscreen = new (function () {
        let setting = this;
        setting.backbutton = new ButtonObject();
        setting.backbutton.click = function () {
            setting.destroy();
            titlescreen.animation_before = titlescreen.animation_count;
            titlescreen.animation_before_which = [3];
            titlescreen.animation_count = setting.animation_count;
            titlescreen.animation_d = setting.animation_d;
            titlescreen.initialize();
        };
        setting.sound = new TextObject();
        setting.soundtitle = new TextObject();
        setting.sound_slider = document.getElementById('sound_range');
        setting.effect_slider = document.getElementById('effect_range');
        setting.title = new TextObject();
        setting.effect = new TextObject();

        setting.sound_slider_update = function () {
            setting.sound_slider.value = bgm.volume * 100;
            setting.sound_slider.style.display = 'block';
            setting.sound_slider.style.width = ui_screen.width * (1/4) + 'px';
            setting.sound_slider.style.height = ui_screen.height * (4 / 45) + 'px';
            setting.sound_slider.style.transform = 'translate(-' + ui_screen.width * (19/64) + 'px, -' + ui_screen.height * (7/45) + 'px)';
            setting.effect_slider.value = button_effect.volume * 100;
            setting.effect_slider.style.display = 'block';
            setting.effect_slider.style.width = ui_screen.width * (1/4) + 'px';
            setting.effect_slider.style.height = ui_screen.height * (4 / 45) + 'px';
            setting.effect_slider.style.transform = 'translate(' + ui_screen.width * (13/64) + 'px, -' + ui_screen.height * (7/45) + 'px)';
        };

        setting.initialize = function () {
            window.customAlert = [];
            setting.animation_count = titlescreen.animation_count;
            setting.animation_d = titlescreen.animation_d;
            window.customMouseClick = false;
            CLIENTDATA.client.status = "setting";
            setting.sound_slider_update();
            setting.backbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 75,
                    y: 30,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "BACK",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 1, max: 1 },
                    x: 75,
                    y: 30,
                    width: 100,
                    height: 40,
                    positionData: { width: 100, height: 40 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            setting.sound.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 30,
                    y: 175,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "left",
                    lineWidth: 2,
                    message: "BGM : ",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: '#000000', stroke: undefined },
                        mouseover: { fill: '#000000', stroke: undefined }
                    }
                }
            });
            setting.soundtitle.initialize(ui_screen,ui_ctx,{
                text:{
                    x: 10,
                    y: 125,
                    size: "40",
                    sizeData: 40,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "left",
                    lineWidth: 2,
                    message: "- Sound Setting",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: '#000000', stroke: undefined },
                        mouseover: { fill: '#000000', stroke: undefined }
                    }
                }
            })
            setting.title.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 30,
                    size: "50",
                    sizeData: 50,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "SETTING",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#000000", stroke: undefined },
                        mouseover: { fill: "#000000", stroke: undefined }
                    }
                }
            });
            setting.effect.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 430,
                    y: 175,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "left",
                    lineWidth: 2,
                    message: "EFFECT : ",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: '#000000', stroke: undefined },
                        mouseover: { fill: '#000000', stroke: undefined }
                    }
                }
            });
            mainLoop = setting.loop;
        };

        setting.loop = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            drawCircle(bg_ctx, 150, 260, 70, "rgba(127,127,127,0.7)");
            drawCircle(bg_ctx, 250, 300, 80, "rgba(127,223,255,0.5)");
            drawCircle(bg_ctx, 300, 370, 60, "rgba(255,127,127,0.2)");
            ui_ctx_2.clearRect(0, 0, 800, 450);
            roundedRect(ui_ctx_2, 200, 175, 380, 50, 'rgba(159, 159, 159,0.7)', 'rgb(127,127,127)');
            roundedRect(ui_ctx_2, 600, 175, 380, 50, 'rgba(159, 159, 159,0.7)', 'rgb(127,127,127)');
            setting.backbutton.draw.call(setting.backbutton);
            setting.soundtitle.draw.call(setting.soundtitle);
            setting.sound.draw.call(setting.sound);
            setting.title.draw.call(setting.title);
            setting.effect.draw.call(setting.effect);
            de_ctx.clearRect(0, 0, 800, 450);
            bgm.volume = setting.sound_slider.value / 100;
            window.button_effect.volume = setting.effect_slider.value / 100;
            connect_effect.volume = setting.effect_slider.value / 100;
            disconnect_effect.volume = setting.effect_slider.value / 100;
            Start_effect.volume = setting.effect_slider.value / 100;
            dash_effect.volume = setting.effect_slider.value / 100;
            cooltime_effect.volume = setting.effect_slider.value / 100;
            drawCircle(de_ctx, 150, 260, 60 + titlescreen.animation_count, "rgba(127,127,127,0.7)");
            drawCircle(de_ctx, 250, 300, 100 - titlescreen.animation_count, "rgba(127,223,255,0.5)");
            drawCircle(de_ctx, 300, 370, 50 + (setting.animation_count) * 0.8, "rgba(255,127,127,0.2)");
            setting.animation_count += setting.animation_d;
            if (setting.animation_count == 30) {
                setting.animation_d *= -1;
            }
            if (setting.animation_count == 0) {
                setting.animation_d *= -1;
            }
            DrawcustomAlert(ui_ctx);
        };

        setting.destroy = function () {
            setting.backbutton.destroy();
            setting.sound_slider.style.display = 'none';
            setting.effect_slider.style.display = 'none';
        };
    })();

    // 매칭 화면 이후에 서버의 응답을 기다리는 화면 코드
    let waitserver = new (function () {
        let wait = this;
        let entering = new TextObject();
        let username = new TextObject();
        let targetroom = new TextObject();

        wait.initialize = function (mode) {
            window.customAlert = [];
            window.customMouseClick = false;
            CLIENTDATA.client.status = "wait";
            wait.password = 0;
            let targetroomid = 0;
            de_ctx.font = "18px 'Do Hyeon'";
            if (matchingscreen.name_input.value.length < 1 || matchingscreen.name_input.value.length > 15) {
                window.customAlert.push(["Enter name(1~15 length)", 30]);
                matchingscreen.destroy();
                matchingscreen.initialize();
                return;
            }else if(de_ctx.measureText(matchingscreen.name_input.value).width < 10 || de_ctx.measureText(matchingscreen.name_input.value).width > 200 || de_ctx.measureText(matchingscreen.name_input.value).height < 10 || de_ctx.measureText(matchingscreen.name_input.value).height > 50) {
                window.customAlert.push(["Name is strange.",30]);
                matchingscreen.destroy();
                matchingscreen.initialize();
                return;
            } else if (mode == 'j') {
                targetroomid = parseInt((parseInt(matchingscreen.id_input.value, 16) / 9196)) - 17534;
                if (!isNaN(targetroomid) && (targetroomid < 0 || targetroomid > 65535)) {
                    window.customAlert.push(["The ID is not correct.", 30]);
                    matchingscreen.destroy();
                    wait.destroy();
                    matchingscreen.initialize();
                    return;
                } else if (isNaN(targetroomid)) {
                    window.customAlert.push(["The ID is not correct.", 30]);
                    matchingscreen.destroy();
                    wait.destroy();
                    matchingscreen.initialize();
                    return;
                }
                if (check_password.password_need == 1) {
                    let trypassword = check_password.password_input.value;
                    if (isNaN(trypassword)) {
                        matchingscreen.destroy();
                        window.customAlert.push(["The password is not correct.", 30]);
                        wait.destroy();
                        matchingscreen.initialize();
                        return;
                    } else if (trypassword.length < 2 || trypassword.length > 4) {
                        matchingscreen.destroy();
                        window.customAlert.push(["The password is not correct.", 30]);
                        wait.destroy();
                        matchingscreen.initialize();
                        return;
                    } else {
                        wait.password = trypassword.length * 10000 + parseInt(trypassword);
                    }
                }
            } else if (mode == 'n') {
                let roompassword = newroom_select.key_input.value;
                if (newroom_select.newmode == 'private') {
                    if (isNaN(roompassword)) {
                        matchingscreen.destroy();
                        window.customAlert.push(["Password allows only Numbers", 30]);
                        wait.destroy();
                        newroom_select.initialize(true);
                        return;
                    } else if (roompassword.length < 2 || roompassword.length > 4) {
                        matchingscreen.destroy();
                        window.customAlert.push(["Password Length : 2~4", 30]);
                        wait.destroy();
                        newroom_select.initialize(true);
                        return;
                    } else {
                        wait.password = roompassword.length * 10000 + parseInt(roompassword);
                    }
                } else {
                    wait.password = 0;
                }
            }
            username.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 300,
                    size: "20",
                    sizeData: 20,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "NAME : " + matchingscreen.name_input.value,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                }
            });
            targetroom.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 350,
                    size: "20",
                    sizeData: 20,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "ROOM : " + (matchingscreen.id_input.value ? matchingscreen.id_input.value : "Auto matching or New room"),
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                }
            });
            entering.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 400,
                    y: 100,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "ENTERING...",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                }
            });
            bg_ctx.clearRect(0, 0, 800, 450);
            let GM = {};
            switch (mode) {
                case "q":
                    GM = {
                        newRoom: false,
                        roomId: "auto",
                        name: matchingscreen.name_input.value,
                        password: 0
                    }
                    break;
                case "n":
                    GM = {
                        newRoom: true,
                        roomId: "auto",
                        name: matchingscreen.name_input.value,
                        password: wait.password
                    }
                    break;
                case "j":
                    GM = {
                        newRoom: false,
                        roomId: targetroomid,
                        name: matchingscreen.name_input.value,
                        password: wait.password
                    }
                    break;
            }
            matchingscreen.destroy();
            socket.emit('join room', GM);
            mainLoop = wait.loop;
        };

        wait.loop = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
            entering.draw.call(entering);
            username.draw.call(username);
            targetroom.draw.call(targetroom);
        };

        wait.destroy = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
        };
    })();

    // 대기실 코드
    let readyscreen = new (function () {
        let ready = this;
        ready.menu = true;
        ready.backbutton = new ButtonObject();
        ready.backbutton.click = function () {
            readyscreen.destroy();
            matchingscreen.initialize();
            socket.emit('exit room');
        };
        ready.startbutton = new ButtonObject();
        ready.startbutton.click = function () {
            if (CLIENTDATA.readyroom.owner == CLIENTDATA.client.id) {
                if (CLIENTDATA.readyroom.counts > 2) {
                    socket.emit('start game');
                    readyscreen.destroy();
                } else {
                    window.customAlert.push(["We need 3 players", 30]);
                }
            }
        };
        ready.idcopy = new ButtonObject();
        ready.idcopy.click = function () {
            let copytext = document.createElement('textarea');
            copytext.value = CLIENTDATA.readyroom.roomid;
            document.body.appendChild(copytext);
            copytext.select();
            document.execCommand('copy');
            document.body.removeChild(copytext);
            window.customAlert.push(["Room ID copied", 30]);
        };

        ready.update_layout = function () {
            de_ctx.clearRect(0, 0, 800, 450);
            drawLine(de_ctx, 100, 65, 100, 385, "rgb(0,0,0)", 4);
            drawLine(de_ctx, 100, 65, 700, 65, "rgb(0,0,0)", 4);
            drawLine(de_ctx, 100, 385, 700, 385, "rgb(0,0,0)", 4);
            drawLine(de_ctx, 700, 65, 700, 385, "rgb(0,0,0)", 4);
            drawLine(de_ctx, 400, 65, 400, 385, "rgb(0,0,0)", 4);
            drawLine(de_ctx, 100, 145, 700, 145, "rgb(0,0,0)", 4);
            drawLine(de_ctx, 100, 225, 700, 225, "rgb(0,0,0)", 4);
            drawLine(de_ctx, 100, 305, 700, 305, "rgb(0,0,0)", 4);
            for (i = 0; i < 8; i++) {
                if (CLIENTDATA.readyroom.players[i] != 0) {
                    drawCircle(de_ctx, 140 + 300 * (i % 2), parseInt(i / 2) * 80 + 110, 30, ColorData[i])
                    drawText(de_ctx, {
                        x: 140 + 300 * (i % 2),
                        y: parseInt(i / 2) * 80 + 110,
                        size: "30",
                        sizeData: 30,
                        font: "'Do Hyeon'",
                        textAlign: "center",
                        textBaseline: "middle",
                        lineWidth: 5,
                        message: i + 1,
                        color: { fill: ColorData[i], stroke: '#000000' },
                    })
                    drawLine(de_ctx, 175 + 300 * (i % 2), parseInt(i / 2) * 80 + 80, 175 + 300 * (i % 2), parseInt(i / 2) * 80 + 140, ColorData[i], 4);
                    if (CLIENTDATA.readyroom.players[i] == CLIENTDATA.client.id) {
                        drawText(de_ctx, {
                            x: 180 + 300 * (i % 2),
                            y: parseInt(i / 2) * 80 + 100,
                            size: "18",
                            sizeData: 18,
                            font: "'Do Hyeon'",
                            textAlign: "left",
                            textBaseline: "middle",
                            lineWidth: 2,
                            message: '(YOU)',
                            color: { fill: "#000000", stroke: undefined },
                        })
                        drawText(de_ctx, {
                            x: 180 + 300 * (i % 2),
                            y: parseInt(i / 2) * 80 + 120,
                            size: "18",
                            sizeData: 18,
                            font: "'Do Hyeon'",
                            textAlign: "left",
                            textBaseline: "middle",
                            lineWidth: 2,
                            message: CLIENTDATA.readyroom.names[i],
                            color: { fill: "#000000", stroke: undefined },
                        })
                    } else {
                        drawText(de_ctx, {
                            x: 180 + 300 * (i % 2),
                            y: parseInt(i / 2) * 80 + 110,
                            size: "18",
                            sizeData: 18,
                            font: "'Do Hyeon'",
                            textAlign: "left",
                            textBaseline: "middle",
                            lineWidth: 2,
                            message: CLIENTDATA.readyroom.names[i],
                            color: { fill: "#000000", stroke: undefined },
                        })
                    }
                }
            }
        }

        ready.initialize = function () {
            window.customMouseClick = false;
            CLIENTDATA.client.status = "ready";
            bg_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            ready.backbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 75,
                    y: 30,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "BACK",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 1, max: 3 },
                    x: 75,
                    y: 30,
                    width: 100,
                    height: 40,
                    positionData: { width: 100, height: 40 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            ready.idcopy.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 650,
                    y: 30,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "COPY ID",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 2, max: 3 },
                    x: 650,
                    y: 30,
                    width: 200,
                    height: 40,
                    positionData: { width: 200, height: 40 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            ready.startbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 600,
                    y: 415,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "START",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#7f7f7f", stroke: undefined },
                        mouseover: { fill: "#dfdfdf", stroke: undefined }
                    }
                },
                button: {
                    alive: (CLIENTDATA.readyroom.owner == CLIENTDATA.client.id),
                    num: { my: 3, max: 3 },
                    x: 600,
                    y: 415,
                    width: 150,
                    height: 40,
                    positionData: { width: 150, height: 40 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#baffff", stroke: "#7fdfff" },
                        mouseover: { fill: "#7fdfff", stroke: "#40a8c6" }
                    }
                }
            });
            ready.update_layout();
            mainLoop = ready.loop;
        }

        ready.loop = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
            ready.backbutton.draw.call(ready.backbutton);
            ready.idcopy.draw.call(ready.idcopy);
            ready.startbutton.draw.call(ready.startbutton);
            if(CLIENTDATA.client.playing[0] == 0 && CLIENTDATA.client.playing[1] == 0 && CLIENTDATA.client.id != CLIENTDATA.readyroom.owner) {
                drawText(ui_ctx, {
                    x: 100,
                    y: 415,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: 'middle',
                    textAlign: "left",
                    lineWidth: 2,
                    message: "Wait for the host to start the game",
                    color: { fill: "#000000", stroke: undefined }
                })
            }else if(CLIENTDATA.client.playing[0] == 0 && CLIENTDATA.client.playing[1] == 1 && CLIENTDATA.client.id != CLIENTDATA.readyroom.owner) {
                drawText(ui_ctx, {
                    x: 100,
                    y: 415,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: 'middle',
                    textAlign: "left",
                    lineWidth: 2,
                    message: "The game is already in progress. wait a minute",
                    color: { fill: "#000000", stroke: undefined }
                })
            }
            let x = window.customMouseX;
            let y = window.customMouseY;
            if (x > 100 && x < 700 && y > 65 && y < 385 && CLIENTDATA.readyroom.owner == CLIENTDATA.client.id) {
                let c = '';
                let te = '';
                let active = false;
                if ((x > 320 && x < 400) || (x > 620 && x < 700)) {
                    active = true;
                }
                let which = parseInt((y - 65) / 40) % 2;
                if (which == 0) {
                    c = "rgba(127,223,255,0.5)";
                    te = 'Pass'
                } else {
                    c = "rgba(255, 182, 180,0.5)";
                    te = 'Kick'
                }
                const _x = parseInt((x - 100) / 300);
                const _y = parseInt((y - 65) / 80);
                const _num = _x + _y * 2;
                let exist = false;
                if (CLIENTDATA.readyroom.players[_num] !== 0) {
                    exist = true;
                }
                if (CLIENTDATA.readyroom.players[_num] != CLIENTDATA.client.id && exist) {
                    if (active) {
                        drawText(ui_ctx, {
                            x: _x * 300 + 360,
                            y: _y * 80 + 105 + (te == 'Kick' ? 20 : -20),
                            size: "18",
                            sizeData: 18,
                            font: "'Do Hyeon'",
                            textBaseline: "middle",
                            textAlign: "center",
                            lineWidth: 2,
                            message: te,
                            color: { fill: "rgb(0,0,0)", stroke: undefined }
                        });
                        let grad = ui_ctx.createLinearGradient(_x * 300 + 100, _y * 80 + 65, _x * 300 + 400, _y * 80 + 65);
                        grad.addColorStop(0, 'white');
                        grad.addColorStop(1, c);
                        ui_ctx.save();
                        ui_ctx.fillStyle = grad;
                        ui_ctx.globalAlpha = 0.5;
                        ui_ctx.fillRect(_x * 300 + 100, _y * 80 + 65, 300, 80);
                        ui_ctx.restore();
                    } else {
                        drawRect(ui_ctx, _x * 300 + 320, _y * 80 + 65, 80, 40, "rgba(127,223,255,0.5)");
                        drawRect(ui_ctx, _x * 300 + 320, _y * 80 + 105, 80, 40, "rgba(255, 182, 180,0.5)");
                        drawText(ui_ctx, {
                            x: _x * 300 + 360,
                            y: _y * 80 + 125,
                            size: "18",
                            sizeData: 18,
                            font: "'Do Hyeon'",
                            textBaseline: "middle",
                            textAlign: "center",
                            lineWidth: 2,
                            message: 'Kick',
                            color: { fill: "rgb(0,0,0)", stroke: undefined }
                        });
                        drawText(ui_ctx, {
                            x: _x * 300 + 360,
                            y: _y * 80 + 85,
                            size: "18",
                            sizeData: 18,
                            font: "'Do Hyeon'",
                            textBaseline: "middle",
                            textAlign: "center",
                            lineWidth: 2,
                            message: 'Pass',
                            color: { fill: "rgb(0,0,0)", stroke: undefined }
                        });
                        drawLine(ui_ctx, _x * 300 + 320, _y * 80 + 65, _x * 300 + 320, _y * 80 + 145, "rgb(127,127,127)", 2);
                        drawLine(ui_ctx, _x * 300 + 320, _y * 80 + 105, _x * 300 + 400, _y * 80 + 105, "rgb(127,127,127)", 2);
                    }
                }
            }
            if (window.customMouseClick) {
                let cx = window.customMouseClickX;
                let cy = window.customMouseClickY;
                if (((x > 320 && x < 400) || (x > 620 && x < 700)) && CLIENTDATA.readyroom.owner == CLIENTDATA.client.id) {
                    let target = (parseInt((cx - 100) / 300) + 2 * parseInt((cy - 65) / 80));
                    let mode = '';
                    let which = parseInt((y - 65) / 40) % 2;
                    if (which == 0) {
                        mode = 'pass owner';
                    } else {
                        mode = 'kick user';
                    }
                    if (CLIENTDATA.readyroom.players[target] != CLIENTDATA.client.id && CLIENTDATA.readyroom.players[target] != 0) {
                        switch (mode) {
                            case "pass owner":
                                window.customMouseClick = false;
                                socket.emit("pass owner", CLIENTDATA.readyroom.players[target]);
                                break;
                            case "kick user":
                                window.customMouseClick = false;
                                socket.emit("kick user", CLIENTDATA.readyroom.players[target], parseInt((parseInt(CLIENTDATA.readyroom.roomid, 16) / 9196)) - 17534);
                                break;
                        };
                    };
                }
            }
            DrawcustomAlert(ui_ctx);
        };

        ready.destroy = function () {
            bg_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            ready.backbutton.destroy.call(ready.backbutton);
            ready.idcopy.destroy.call(ready.idcopy);
            ready.startbutton.destroy.call(ready.startbutton);
        }
    })();

    // 인게임 화면 코드
    let ingamescreen = new (function () {
        let ingame = this;

        // 술래  변경 시도 쿨타임 확인 함수
        ingame.trychange = function (target) {
            if (ingame.cooltime.switch != 0) {
                return;
            }
            else if (CLIENTDATA.ingameroom.players[target - 1] != CLIENTDATA.client.id && CLIENTDATA.ingameroom.players[target - 1] != 0 && CLIENTDATA.ingameroom.players[target - 1] != CLIENTDATA.ingameroom.TaggerId) {
                socket.emit('change challenge', CLIENTDATA.ingameroom.players[target - 1]);
                ingame.cooltime.switch = 150;
            };
        };

        // 인게임 UI 그리기 함수
        ingame.drawUI = function () {
            const tagger = CLIENTDATA.ingameroom.players.indexOf(CLIENTDATA.ingameroom.TaggerId);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            ui_ctx_2.save();
            ui_ctx_2.strokeStyle = '#000000';
            ui_ctx_2.beginPath();
            ui_ctx_2.moveTo(0, 100);
            ui_ctx_2.lineTo(100, 0);
            ui_ctx_2.lineTo(0, 0);
            ui_ctx_2.lineTo(0, 100);
            ui_ctx_2.fillStyle = "#7fdfff";
            ui_ctx_2.fill();
            ui_ctx_2.rotate(-45 * Math.PI / 180)
            drawText(ui_ctx_2, {
                x: 0,
                y: 50,
                size: "18",
                sizeData: 18,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "center",
                lineWidth: 2,
                message: 'Alive : ' + CLIENTDATA.ingameroom.counts,
                color: { fill: "rgb(0,0,0)", stroke: undefined }
            });
            ui_ctx_2.restore();

            roundedRect(ui_ctx_2, 620, 26, 60, 44, ColorData[tagger], "rgb(0,0,0)");
            ui_ctx_2.save();
            ui_ctx_2.rotate(-90 * Math.PI / 180)
            drawText(ui_ctx_2, {
                x: -25,
                y: 600,
                size: "13",
                sizeData: 13,
                font: "'Do Hyeon'",
                textBaseline: "top",
                textAlign: "center",
                lineWidth: 2,
                message: 'Tagger',
                color: { fill: "rgb(0,0,0)", stroke: undefined }
            });
            ui_ctx_2.restore();
            roundedRect(ui_ctx_2, 710, 25, 180, 50, ColorData[tagger], 'rgb(0,0,0)');
            drawText(ui_ctx_2, {
                x: 630,
                y: 25,
                size: "20",
                sizeData: 20,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "left",
                lineWidth: 2,
                message: CLIENTDATA.ingameroom.names[tagger],
                color: { fill: "rgb(0,0,0)", stroke: undefined }
            });
            let count = 0;
            for (let i = 0; i < CLIENTDATA.ingameroom.players.length; i++) {
                if (CLIENTDATA.readyroom.players[i] === CLIENTDATA.client.id && CLIENTDATA.client.playing[0] === 0) { continue; }
                if (CLIENTDATA.readyroom.players[i] != 0 && CLIENTDATA.readyroom.players[i] != CLIENTDATA.ingameroom.TaggerId) {
                    roundedRect(ui_ctx_2, 710, 68 + count * 30, 180, 26, ColorData[i], "rgb(0,0,0)");
                    drawLine(ui_ctx_2, 660, 55 + count * 30, 660, 81 + count * 30, "rgb(0,0,0)", 3);
                    drawText(ui_ctx_2, {
                        x: 640,
                        y: 68 + count * 30,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: i + 1,
                        color: { fill: "rgb(0,0,0)", stroke: undefined }
                    });
                    drawText(ui_ctx_2, {
                        x: 675,
                        y: 68 + count * 30,
                        size: "12",
                        sizeData: 12,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: CLIENTDATA.ingameroom.names[i],
                        color: { fill: "rgb(0,0,0)", stroke: undefined }
                    });
                    if (CLIENTDATA.ingameroom.players.indexOf(CLIENTDATA.readyroom.players[i]) == -1) {
                        drawLine(ui_ctx_2, 620, 68 + count * 30, 800, 68 + count * 30, "rgba(255,127,127,0.7)", 10);
                    }
                    count++;
                }
            };
        };

        ingame.drawSkill = function () {
            if (ingame.playing) {
                if (CLIENTDATA.ingameroom.TaggerId != CLIENTDATA.client.id) {
                    if(ingame.cooltime.switch == 1 || ingame.cooltime.dash == 1){
                        cooltime_effect.currentTime = 0;
                        cooltime_effect.play();
                    };
                    ui_ctx.save();
                    ui_ctx.globalAlpha = ((150 - ingame.cooltime.switch) / 150) * 0.4 + ((ingame.cooltime.switch == 0) ? 0.6 : 0);
                    ui_ctx.drawImage(ingamescreen.switchbutton, 735 + window.XfixStart, 370+window.YfixStart, 50, 50);
                    ui_ctx.restore();
                    if (ingame.cooltime.switch !== 0) {
                        drawText(ui_ctx, {
                            x: 760,
                            y: 395,
                            size: "20",
                            sizeData: 20,
                            font: "'Do Hyeon'",
                            textBaseline: "middle",
                            textAlign: "center",
                            lineWidth: 2,
                            message: Math.ceil(ingame.cooltime.switch / 30),
                            color: { fill: "rgb(0,0,0)", stroke: undefined }
                        });
                    }
                } else {
                    ui_ctx.save();
                    ui_ctx.globalAlpha = 0.1;
                    ui_ctx.drawImage(ingamescreen.switchbutton, 735+window.XfixStart, 370+window.YfixStart, 50, 50);
                    ui_ctx.restore();
                }
                ui_ctx.save();
                ui_ctx.globalAlpha = ((450 - ingame.cooltime.dash) / 450) * 0.4 + ((ingame.cooltime.dash == 0) ? 0.6 : 0);
                ui_ctx.drawImage(ingamescreen.dashbutton, 680+window.XfixStart, 370+window.YfixStart, 50, 50);
                ui_ctx.restore();
                if (ingame.cooltime.dash !== 0) {
                    drawText(ui_ctx, {
                        x: 705,
                        y: 395,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: Math.ceil(ingame.cooltime.dash / 30),
                        color: { fill: "rgb(0,0,0)", stroke: undefined }
                    });
                }
            } else {
                (ingame.cooltime.out_notice == 0) ? null : ingame.cooltime.out_notice--;
                ui_ctx.save();
                ui_ctx.globalAlpha = 0.8 * (ingame.cooltime.out_notice / 150);
                drawRect(ui_ctx, 0, 0, 800, 450, "rgb(127,127,127)");
                drawText(ui_ctx, {
                    x: 400,
                    y: 200,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "Now watching : " + CLIENTDATA.readyroom.names[CLIENTDATA.ingameroom.players.indexOf(CLIENTDATA.ingameroom.cam)],
                    color: { fill: "rgba(0,0,0,0.5)", stroke: undefined }
                });
                ui_ctx.restore();
            };
        };

        // 인게임 배경 그리기(격자 무늬)
        ingame.drawBG = function (X, Y) {
            X /= 10;
            Y /= 10;
            bg_ctx.clearRect(0, 0, 800, 450);
            drawRect(bg_ctx, 0, 0, 800, 450, '#baffff');
            ingame.drawObject(X, Y);
            if (X - 400 < ingame.leftlimit) {
                drawRect(bg_ctx, 0, 0, ingame.leftlimit - (X - 400), 450, '#ffb6b4');
            };
            if (X + 400 > ingame.rightlimit) {
                drawRect(bg_ctx, 800, 0, ingame.rightlimit - X - 400, 450, '#ffb6b4');
            };
            if (Y - 225 < ingame.uplimit) {
                drawRect(bg_ctx, 0, 0, 800, ingame.uplimit - (Y - 225), '#ffb6b4');
            };
            if (Y + 225 > ingame.downlimit) {
                drawRect(bg_ctx, 0, 450, 800, ingame.downlimit - (Y + 225), '#ffb6b4');
            };
            let x_100_fix = (X + 1050) % 100;
            let y_100_fix = (Y + 1025) % 100;
            for (let i = 100 - x_100_fix; i < 900; i += 100) {
                drawLine(bg_ctx, i, 0, i, 450, '#FFFFFF', 2);
            }
            for (let i = 100 - y_100_fix; i < 550; i += 100) {
                drawLine(bg_ctx, 0, i, 800, i, '#FFFFFF', 2);
            }
        };

        // 인게임에서 클라이언트의 화면에 보이는 다른 플레이어 그리기
        ingame.drawPlayer = function (X, Y) {
            X /= 10;
            Y /= 10;
            for (let i = 0; i < 8; i++) {
                let _x = CLIENTDATA.ingameroom.playerXlist[i] / 10;
                let _y = CLIENTDATA.ingameroom.playerYlist[i] / 10;
                // 투명화 확인
                let x_50_floor = Math.floor(_x * 0.02);
                let y_50_floor = Math.floor(_y * 0.02);
                let invisible = false;
                if (CLIENTDATA.ingameroom.map[y_50_floor + 12][x_50_floor + 12] === 1) {
                    function mapCheck(x, y) { if (y_50_floor + y < 0 || 24 <= y_50_floor + y || x_50_floor + x < 0 || 24 <= x_50_floor + x) { return false; } else { return CLIENTDATA.ingameroom.map[y_50_floor + y][x_50_floor + x] === 1; } }
                    let x_50_share = x_50_floor * 50;
                    let y_50_share = y_50_floor * 50;
                    mapCheck(11, 12) ? (
                        (mapCheck(12, 11) && mapCheck(11, 11)) ? above_y1 = 0 : above_y1 = 20,
                        (mapCheck(12, 13) && mapCheck(11, 13)) ? below_y1 = 50 : below_y1 = 30,
                        (x_50_share <= _x && _x < x_50_share + 30 && y_50_share + above_y1 <= _y && _y < y_50_share + below_y1) ? invisible = true : null
                    ) : null;
                    (mapCheck(13, 12) && !invisible) ? (
                        (mapCheck(12, 11) && mapCheck(13, 11)) ? above_y2 = 0 : above_y2 = 20,
                        (mapCheck(12, 13) && mapCheck(13, 13)) ? below_y2 = 50 : below_y2 = 30,
                        (x_50_share + 20 <= _x && _x < x_50_share + 50 && y_50_share + above_y2 <= _y && _y < y_50_share + below_y2) ? invisible = true : null
                    ) : null;
                    !invisible ? (
                        (mapCheck(12, 11)) ? (
                            above_y3 = 0,
                            (mapCheck(11, 12) && ((_x - x_50_share) * (_x - x_50_share) + (_y - y_50_share) * (_y - y_50_share) >= 400) && _x < x_50_share + 30 && _y < y_50_share + 30) ? invisible = true : null,
                            (mapCheck(13, 12) && ((x_50_share + 50 - _x) * (x_50_share + 50 - _x) + (_y - y_50_share) * (_y - y_50_share) >= 400) && x_50_share + 20 <= _x && _y < y_50_share + 30) ? invisible = true : null
                        ) : above_y3 = 20,
                        (mapCheck(12, 13) && !invisible) ? (
                            below_y3 = 50,
                            (mapCheck(11, 12) && ((_x - x_50_share) * (_x - x_50_share) + (y_50_share + 50 - _y) * (y_50_share + 50 - _y) >= 400) && _x < x_50_share + 30 && y_50_share + 20 <= _y) ? invisible = true : null,
                            (mapCheck(13, 12) && ((x_50_share + 50 - _x) * (x_50_share + 50 - _x) + (y_50_share + 50 - _y) * (y_50_share + 50 - _y) >= 400) && x_50_share + 20 <= _x && y_50_share + 20 <= _y) ? invisible = true : null
                        ) : below_y3 = 30,
                        (x_50_share + 20 <= _x && _x < x_50_share + 30 && y_50_share + above_y3 <= _y && _y < y_50_share + below_y3) ? invisible = true : null
                    ) : null
                }
                // 플레이어들 렌더링
                if ((_x > X - 420 && _x < X + 420) && (_y > Y - 245 && _y < Y + 245) && CLIENTDATA.ingameroom.players[i] != 0) {
                    if (CLIENTDATA.ingameroom.boost[i][0] != 0) {
                        let before = CLIENTDATA.ingameroom.boost[i][0];
                        beforeX = before[0] / 10; // 메모리 참조라서 이렇게 해야됨
                        beforeY = before[1] / 10;
                        drawCircle(bg_ctx, 400 + (beforeX - X), 225 + (beforeY - Y), 20, ColorData[i + 10]);
                        (CLIENTDATA.ingameroom.boost[i][1] == 1) ? CLIENTDATA.ingameroom.boost[i] = [0, 10] : CLIENTDATA.ingameroom.boost[i][1]--;
                    };
                    if (CLIENTDATA.ingameroom.switch[i][0] != false) {
                        let target = CLIENTDATA.ingameroom.players.indexOf(CLIENTDATA.ingameroom.switch[i][0][1]);
                        drawCircle(bg_ctx, 400 + (_x - X), 225 + (_y - Y), 50, ColorData[target + 10]);
                        (CLIENTDATA.ingameroom.switch[i][1] == 1) ? CLIENTDATA.ingameroom.switch[i] = [false, 10] : CLIENTDATA.ingameroom.switch[i][1]--;
                    };
                    if (invisible) {
                        if (CLIENTDATA.ingameroom.players[i] === CLIENTDATA.client.id) {
                            bg_ctx.globalAlpha = 0.6;
                        } else {
                            let X_50_floor = Math.floor(X * 0.02);
                            let Y_50_floor = Math.floor(Y * 0.02);
                            if (Math.abs(X_50_floor - x_50_floor) + Math.abs(Y_50_floor - y_50_floor) < 4 && Math.abs(X_50_floor - x_50_floor) < 3 && Math.abs(Y_50_floor - y_50_floor) < 3) {
                                bg_ctx.globalAlpha = 0.6;
                            } else {
                                bg_ctx.globalAlpha = 0;
                            }
                        }
                    }
                    if (CLIENTDATA.ingameroom.players[i] == CLIENTDATA.ingameroom.TaggerId) {
                        drawCircle(bg_ctx, 400 + (_x - X), 225 + (_y - Y), 20, "#ffb6b4");
                        drawCircle(bg_ctx, 400 + (_x - X), 225 + (_y - Y), 16, ColorData[i]);
                    } else {
                        drawCircle(bg_ctx, 400 + (_x - X), 225 + (_y - Y), 20, ColorData[i]);
                    }
                    if (CLIENTDATA.ingameroom.players[i] == CLIENTDATA.client.id) {
                        drawText(bg_ctx, {
                            x: 400 + (_x - X),
                            y: 225 + (_y - Y),
                            size: "15",
                            sizeData: 15,
                            font: "'Do Hyeon'",
                            textBaseline: "middle",
                            textAlign: "center",
                            lineWidth: 2,
                            message: 'You',
                            color: { fill: ColorData[i], stroke: 'rgb(0,0,0)' }
                        })
                    } else {
                        drawText(bg_ctx, {
                            x: 400 + (_x - X),
                            y: 225 + (_y - Y),
                            size: "25",
                            sizeData: 25,
                            font: "'Do Hyeon'",
                            textBaseline: "middle",
                            textAlign: "center",
                            lineWidth: 4,
                            message: i + 1,
                            color: { fill: ColorData[i], stroke: 'rgb(0,0,0)' }
                        })
                    }
                    bg_ctx.globalAlpha = 1;
                }
            }
        };

        // 오브젝트 렌더링
        ingame.drawObject = function (X, Y) {
            let x_50_floor = Math.floor(X * 0.02);
            let y_50_floor = Math.floor(Y * 0.02);
            for (let i = Math.max(0, x_50_floor + 12 - 8); i < Math.min(x_50_floor + 12 + 9, 24); i++) {
                for (let j = Math.max(0, y_50_floor + 12 - 5); j < Math.min(y_50_floor + 12 + 6, 24); j++) {
                    if (CLIENTDATA.ingameroom.map[j][i] === 1) {
                        drawObject(bg_ctx, (i - 12) * 50 - X + 399, (j - 12) * 50 - Y + 224, (((Math.abs(x_50_floor - i + 12) + Math.abs(y_50_floor - j + 12) < 4) && Math.abs(x_50_floor - i + 12) < 3 && Math.abs(y_50_floor - j + 12) < 3) ? 1 : 0))
                    } else if (CLIENTDATA.ingameroom.map[j][i] === 2) {
                        drawRect(bg_ctx, (i - 12) * 50 - X + 399, (j - 12) * 50 - Y + 224, 52, 52, "#7f7f7f");
                    }
                }
            }
        }

        // 현재 누른 키를 확인하여 자신의 위치 서버에 보내기, 소수점 첫째자리까지 보내기위해 10을 곱한값을 보낸다.
        ingame.update = function () {
            ingame.servertick = parseInt(CLIENTDATA.ingameroom.time * 0.03);
            ingame.maplimit = ingame.servertick * 0.4;
            ingame.uplimit = -600 + ingame.maplimit;
            ingame.downlimit = 600 - ingame.maplimit;
            ingame.leftlimit = -600 + ingame.maplimit;
            ingame.rightlimit = 600 - ingame.maplimit;
            let myDx = 0;
            let myDy = 0;
            let plus = 40;
            let plusDiagonal = 28;
            if (ingame.playing) {
                if (window.customKeyList.indexOf(32) != -1) {
                    if (ingame.cooltime.dash == 0) {
                        plus = 200;
                        plusDiagonal = 141;
                        ingame.cooltime.dash = 450;
                        ingame.cooltime.dash_still = 3;
                        dash_effect.currentTime = 0;
                        dash_effect.play();
                    }
                }
                if (ingame.cooltime.dash_still > 0) {
                    plus = 200;
                    plusDiagonal = 141;
                    ingame.cooltime.dash_still--;
                }
                if (window.customKeyList.indexOf(37) != -1) {
                    if (window.customKeyList.indexOf(38) != -1) {
                        myDx = -plusDiagonal;
                        myDy = -plusDiagonal;
                    } else if (window.customKeyList.indexOf(40) != -1) {
                        myDx = -plusDiagonal;
                        myDy = plusDiagonal;
                    } else {
                        myDx = -plus;
                    }
                }
                if (window.customKeyList.indexOf(39) != -1) {
                    if (window.customKeyList.indexOf(38) != -1) {
                        myDx = plusDiagonal;
                        myDy = -plusDiagonal;
                    } else if (window.customKeyList.indexOf(40) != -1) {
                        myDx = plusDiagonal;
                        myDy = plusDiagonal;
                    } else {
                        myDx = plus;
                    }
                }
                if (window.customKeyList.indexOf(37) == -1 && window.customKeyList.indexOf(39) == -1) {
                    if (window.customKeyList.indexOf(38) != -1) {
                        myDy = -plus;
                    }
                    if (window.customKeyList.indexOf(40) != -1) {
                        myDy = plus;
                    }
                }
                socket.emit('client update', myDx, myDy, ((ingame.cooltime.dash_still > 0) ? 1 : 0));
            }
        };

        ingame.initialize = function () {
            ingame.playing = true;
            window.customAlert = [];
            window.customMouseClick = false;
            CLIENTDATA.client.status = "ingame";
            ingame.cooltime = { switch: 150, dash: 450, dash_still: 0, out_notice: 150 };
            bg_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            if (CLIENTDATA.ingameroom.TaggerId == CLIENTDATA.client.id) {
                window.customIngame = ["You Are Tagger!!", 30];
            } else {
                window.customIngame = ["Run Away From Tagger!!", 30];
                ingame.cooltime.dash = 225;
            }
            const cam = CLIENTDATA.ingameroom.players.indexOf(CLIENTDATA.ingameroom.cam);
            ingame.drawBG(CLIENTDATA.ingameroom.playerXlist[cam] + ingame.dynamicX, CLIENTDATA.ingameroom.playerYlist[cam] + ingame.dynamicY,);
            ingame.drawPlayer(CLIENTDATA.ingameroom.playerXlist[cam] + ingame.dynamicX, CLIENTDATA.ingameroom.playerYlist[cam] + ingame.dynamicY);
            mainLoop = ingame.startLoop;
        };

        ingame.startLoop = function () {
            if (window.customIngame[1] > 0) {
                ui_ctx.clearRect(0, 0, 800, 450);
                ui_ctx.save();
                ui_ctx.globalAlpha = 0.5 + window.customIngame[1] / 60;
                drawRect(ui_ctx, 0, 0, 800, 450, 'rgb(127,127,127)');
                drawText(ui_ctx, {
                    x: 400,
                    y: 225,
                    size: "30",
                    sizeData: 30,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: window.customIngame[0],
                    color: { fill: "rgb(0,0,0)", stroke: undefined }
                });
                ui_ctx.restore();
                window.customIngame[1]--;
            } else {
                window.customIngame = [];
                ingame.drawUI();
                mainLoop = ingame.loop;
            };
        };

        ingame.loop = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
            ingame.update();
            let cam = CLIENTDATA.readyroom.players.indexOf(CLIENTDATA.ingameroom.cam);
            if (CLIENTDATA.client.playing[0] === 1) { ingame.drawSkill(); }
            ingame.drawBG(CLIENTDATA.ingameroom.playerXlist[cam], CLIENTDATA.ingameroom.playerYlist[cam]);
            ingame.drawPlayer(CLIENTDATA.ingameroom.playerXlist[cam], CLIENTDATA.ingameroom.playerYlist[cam]);
            if (ingame.cooltime.dash > 0) {
                if (CLIENTDATA.ingameroom.TaggerId == CLIENTDATA.client.id) {
                    ingame.cooltime.dash--;
                }
                ingame.cooltime.dash--;
            } else {
                ingame.cooltime.dash = 0;
            }
            if (ingame.cooltime.switch > 0) {
                ingame.cooltime.switch--;
            } else {
                ingame.cooltime.switch = 0;
            }
            DrawcustomAlert(ui_ctx);
        }

        ingame.destroy = function () {
            ui_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            ingame.playing = false;
        };
    })();

    // 결과 화면 코드
    let resultscreen = new (function () {
        let result = this;

        result.initialize = function (winnersID) {
            ui_ctx_2.clearRect(0, 0, 800, 450);
            let winners = new Int16Array(winnersID);
            CLIENTDATA.client.status = "result";
            mainLoop = result.loop;
            result.starttime = Date.now();
            CLIENTDATA.ingameroom = {
                playerXlist: [],
                playerYlist: [],
                cam: undefined,
                TaggerId: undefined
            }
            if (winners.length == 1) {
                result.winnerInformation = [[CLIENTDATA.readyroom.names[CLIENTDATA.readyroom.players.indexOf(winners[0])], ColorData[CLIENTDATA.readyroom.players.indexOf(winners[0])], CLIENTDATA.readyroom.players.indexOf(winners[0])]];
            } else {
                result.winnerInformation = [[CLIENTDATA.readyroom.names[CLIENTDATA.readyroom.players.indexOf(winners[0])], ColorData[CLIENTDATA.readyroom.players.indexOf(winners[0])], CLIENTDATA.readyroom.players.indexOf(winners[0])], [CLIENTDATA.readyroom.names[CLIENTDATA.readyroom.players.indexOf(winners[1])], ColorData[CLIENTDATA.readyroom.players.indexOf(winners[1])], CLIENTDATA.readyroom.players.indexOf(winners[1])]];
            }
        };

        result.loop = function () {
            const now = Date.now();
            const winners = result.winnerInformation;
            if (result.starttime + 5000 < now) {
                result.destroy();
            } else {
                ui_ctx.clearRect(0, 0, 800, 450);
                de_ctx.clearRect(0, 0, 800, 450);
                drawText(ui_ctx, {
                    x: 800,
                    y: 400,
                    size: "15",
                    sizeData: 15,
                    font: "'Do Hyeon'",
                    textBaseline: "top",
                    textAlign: "right",
                    lineWidth: 2,
                    message: "You'll automatically move to the ready room in " + Math.ceil((result.starttime + 5000 - now) / 1000) + "seconds.",
                    color: { fill: "rgb(127,127,127)", stroke: undefined }
                })
                drawRect(de_ctx, 0, 0, 800, 450, "rgb(200,200,200)");
                drawText(de_ctx, {
                    x: 400,
                    y: 100,
                    size: "40",
                    sizeData: 40,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "Winners",
                    color: { fill: "rgb(0,0,0)", stroke: undefined }
                })
                if (winners.length == 2) {
                    drawCircle(de_ctx, 200, 200, 50 + ((((now - result.starttime) % 1000) - 500) / 50), winners[0][1]);
                    drawCircle(de_ctx, 600, 200, 50 + ((((now - result.starttime) % 1000) - 500) / 50), winners[1][1]);
                    drawText(de_ctx, {
                        x: 200,
                        y: 320,
                        size: "30",
                        sizeData: 30,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: winners[0][0],
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(de_ctx, {
                        x: 200,
                        y: 200,
                        size: "40",
                        sizeData: 40,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: winners[0][2] + 1,
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(de_ctx, {
                        x: 600,
                        y: 320,
                        size: "30",
                        sizeData: 30,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: winners[1][0],
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(de_ctx, {
                        x: 600,
                        y: 200,
                        size: "40",
                        sizeData: 40,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: winners[1][2] + 1,
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                } else {
                    drawCircle(de_ctx, 400, 200, 50 + ((((now - result.starttime) % 1000) - 500) / 50), winners[0][1]);
                    drawText(de_ctx, {
                        x: 400,
                        y: 320,
                        size: "30",
                        sizeData: 30,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: winners[0][0],
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(de_ctx, {
                        x: 400,
                        y: 200,
                        size: "40",
                        sizeData: 40,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "center",
                        lineWidth: 2,
                        message: winners[0][2] + 1,
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })

                }
                DrawcustomAlert(ui_ctx);
            }
        };

        result.destroy = function () {
            window.customAlert = [];
            ui_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            bg_ctx.clearRect(0, 0, 800, 450);
            readyscreen.initialize();
        }
    })();

    // 게임 방법 화면 코드
    let infoscreen = new (function () {
        let info = this;
        info.backbutton = new ButtonObject();
        info.backbutton.click = function () {
            info.destroy();
            titlescreen.initialize();
        };
        info.title = new TextObject();

        info.initialize = function () {
            window.customMouseClick = false;
            window.customAlert = [];
            CLIENTDATA.client.status = "info";
            info.backbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 75,
                    y: 30,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "BACK",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 1, max: 1 },
                    x: 75,
                    y: 30,
                    width: 100,
                    height: 40,
                    positionData: { width: 100, height: 40 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            info.title.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 150,
                    y: 30,
                    size: "40",
                    sizeData: 40,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "left",
                    lineWidth: 2,
                    message: "HOW TO PLAY",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#000000", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                }
            });
            mainLoop = info.loop;
        };

        info.loop = function () {
            bg_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            info.backbutton.draw.call(info.backbutton);
            info.title.draw.call(info.title);
            let show_type = 0;
            if(window.customMouseX > 50 && window.customMouseX < 100 && window.customMouseY > 105 && window.customMouseY < 195) {
                show_type = 1;
            }else if(window.customMouseX > 50 && window.customMouseX < 100 && window.customMouseY > 205 && window.customMouseY < 295) {
                show_type = 2;
            }else if(window.customMouseX > 50 && window.customMouseX < 100 && window.customMouseY > 305 && window.customMouseY < 395) {
                show_type = 3;
            }else{
                show_type = 0;
            }
            roundedRect(ui_ctx, 75 , 150 , (show_type == 1) ? 55 : 50 , (show_type == 1) ? 95 : 90 , '#9f9f9f','rgb(127,127,127)');
            roundedRect(ui_ctx, 75 , 250 , (show_type == 2) ? 55 : 50 , (show_type == 2) ? 95 : 90 , '#9f9f9f','rgb(127,127,127)');
            roundedRect(ui_ctx, 75 , 350 , (show_type == 3) ? 55 : 50 , (show_type == 3) ? 95 : 90 , '#9f9f9f','rgb(127,127,127)');
            ui_ctx.save()
            ui_ctx.rotate(-90 * Math.PI / 180);
            drawText(ui_ctx, {
                x: -150,
                y: 75,
                size: (show_type == 1) ? "26" : "24",
                sizeData: 24,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "center",
                lineWidth: 2,
                message: "KEY",
                color: { fill: 'rgb(0,0,0)', stroke: undefined }
            })
            drawText(ui_ctx, {
                x: -250,
                y: 75,
                size: (show_type == 2) ? "26" : "24",
                sizeData: 24,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "center",
                lineWidth: 2,
                message: "Tagger",
                color: { fill: 'rgb(0,0,0)', stroke: undefined }
            })
            drawText(ui_ctx, {
                x: -350,
                y: 75,
                size: (show_type == 3) ? "26" : "24",
                sizeData: 24,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "center",
                lineWidth: 2,
                message: "Runner",
                color: { fill: 'rgb(0,0,0)', stroke: undefined }
            })
            ui_ctx.restore()
            roundedRect(ui_ctx, 450 , 250 , 600 , 300 , '#9f9f9f','rgb(127,127,127)');
            switch(show_type){
                case 0:
                    drawText(ui_ctx, {
                        x: 180,
                        y: 130,
                        size: "40",
                        sizeData: 40,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: " - Need some help?",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 180,
                        size: "24",
                        sizeData: 24,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Touch the buttons on the left to learn how to play.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 230,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "KEY : You can learn how to move or how to use the skills.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 270,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Tagger : You can learn what a tagger should do.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx,{
                        x: 160,
                        y: 310,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Runner : You can learn what a runner should do.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    break;
                case 1:
                    drawText(ui_ctx, {
                        x: 180,
                        y: 130,
                        size: "40",
                        sizeData: 40,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: " - KEY",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 180,
                        size: "24",
                        sizeData: 24,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Here is how to move and use skills.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 230,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Move : You can move by using the arrow keys.(W,A,S,D too)",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 270,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "DASH : You can dash by pressing the space bar.(Speed up)",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 310,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "SWITCH : You can switch tagger by pressing the number keys.(1~8)",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 350,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "EX)Tagger is 1, you are 2, then you can switch tagger by pressing 3.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 186,
                        y: 385,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "But you have to be close to the tagger at that moment.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    break;
                case 2:
                    drawText(ui_ctx, {
                        x: 180,
                        y: 130,
                        size: "40",
                        sizeData: 40,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: " - Tagger",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 180,
                        size: "24",
                        sizeData: 24,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "You have to tag the runners until 2 left.(include you)",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 230,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Use dash! then you can tag the runners more easily.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 270,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "But you have to be careful! Because runner can Switch tagger. ",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 310,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Watch out for runner don't run away. Maybe it's a trap!",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    break;
                case 3:
                    drawText(ui_ctx, {
                        x: 180,
                        y: 130,
                        size: "40",
                        sizeData: 40,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: " - Runner",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 180,
                        size: "24",
                        sizeData: 24,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "You have to run away from the tagger.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 230,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Use dash! then you can run away from the tagger more easily.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 270,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "But you have to be careful! Because tagger can Switch tagger. ",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 310,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Can't run away anymore? Is it over? Do not give up!!",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 350,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "You can get through a crisis by changing tagger close to you.",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    drawText(ui_ctx, {
                        x: 160,
                        y: 390,
                        size: "20",
                        sizeData: 20,
                        font: "'Do Hyeon'",
                        textBaseline: "middle",
                        textAlign: "left",
                        lineWidth: 2,
                        message: "Make the tag in the same situation as you!",
                        color: { fill: 'rgb(0,0,0)', stroke: undefined }
                    })
                    break;
            }
            DrawcustomAlert(ui_ctx);
        };

        info.destroy = function () {
            bg_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            info.backbutton.destroy();
        };
    })();

    // 크레딧 화면 코드
    let creditscreen = new (function () {
        let credit = this;
        credit.backbutton = new ButtonObject();
        credit.backbutton.click = function () {
            credit.destroy();
            titlescreen.initialize();
        };
        credit.title = new TextObject();
        credit.github = new Image();
        credit.github.src = "image\\github_icon.png";
        credit.soundcloud = new Image();
        credit.soundcloud.src = "image\\SoundCloud.png";

        credit.initialize = function () {
            window.customMouseClick = false;
            window.customAlert = [];
            CLIENTDATA.client.status = "credit";
            credit.backbutton.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 75,
                    y: 30,
                    size: "24",
                    sizeData: 24,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "center",
                    lineWidth: 2,
                    message: "BACK",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#dfdfdf", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                },
                button: {
                    alive: true,
                    num: { my: 1, max: 1 },
                    x: 75,
                    y: 30,
                    width: 100,
                    height: 40,
                    positionData: { width: 100, height: 40 },
                    lineWidth: 4,
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#9f9f9f", stroke: "#7f7f7f" },
                        mouseover: { fill: "#7f7f7f", stroke: "#666666" }
                    }
                }
            });
            credit.title.initialize(ui_screen, ui_ctx, {
                text: {
                    x: 150,
                    y: 30,
                    size: "40",
                    sizeData: 40,
                    font: "'Do Hyeon'",
                    textBaseline: "middle",
                    textAlign: "left",
                    lineWidth: 2,
                    message: " - CREDIT",
                    color: { fill: undefined, stroke: undefined },
                    colorData: {
                        default: { fill: "#000000", stroke: undefined },
                        mouseover: { fill: "#e8e8e8", stroke: undefined }
                    }
                }
            });
            mainLoop = credit.loop;
        };

        credit.loop = function () {
            bg_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            let x = window.customMouseX;
            let y = window.customMouseY;
            if (x >= 600 && x <= 630 && y >= 105 && y < 135) {
                ui_ctx.drawImage(credit.github, 595 + window.XfixStart, 100+ window.YfixStart, 40, 40);
            } else {
                ui_ctx.drawImage(credit.github, 600 + window.XfixStart, 105+ window.YfixStart, 30, 30);
            }
            if (x >= 600 && x <= 630 && y >= 155 && y < 185) {
                ui_ctx.drawImage(credit.github, 595 + window.XfixStart, 150+ window.YfixStart, 40, 40);
            } else {
                ui_ctx.drawImage(credit.github, 600 + window.XfixStart, 155+ window.YfixStart, 30, 30);
            }
            if (x >= 600 && x <= 630 && y >= 205 && y < 235) {
                ui_ctx.drawImage(credit.github, 595 + window.XfixStart, 200+ window.YfixStart, 40, 40);
            } else {
                ui_ctx.drawImage(credit.github, 600 + window.XfixStart, 205+ window.YfixStart, 30, 30);
            }
            if (window.customMouseClick) {
                let cx = window.customMouseClickX;
                let cy = window.customMouseClickY;
                if (cx >= 600 && cx <= 630 && cy >= 105 && cy < 135) {
                    window.open('https://github.com/Seol7523', '_blank');
                    window.customMouseClick = false;
                } else if (cx >= 600 && cx <= 630 && cy >= 155 && cy < 185) {
                    window.open('https://github.com/Mossygoldcoin', '_blank');
                    window.customMouseClick = false;
                } else if (cx >= 600 && cx <= 630 && cy >= 205 && cy < 235) {
                    window.open('https://github.com/ysw421', '_blank');
                    window.customMouseClick = false;
                }
            }
            ui_ctx_2.clearRect(0, 0, 800, 450);
            roundedRect(ui_ctx_2, 400, 170, 600, 150, '#9f9f9f', '#9f9f9f');
            roundedRect(ui_ctx_2, 400, 350, 600, 150, '#9f9f9f', '#9f9f9f');
            drawLine(ui_ctx_2, 200, 105, 200, 235, '#000000', 6);
            drawLine(ui_ctx_2, 200, 285, 200, 415, '#000000', 6);
            ui_ctx_2.save();
            ui_ctx_2.rotate(-90 * Math.PI / 180)
            drawText(ui_ctx_2, {
                x: -170,
                y: 150,
                size: "35",
                sizeData: 35,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "center",
                lineWidth: 2,
                message: 'Coding',
                color: { fill: "rgb(0,0,0)", stroke: undefined }
            });
            drawText(ui_ctx_2, {
                x: -350,
                y: 150,
                size: "35",
                sizeData: 35,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "center",
                lineWidth: 2,
                message: 'Music',
                color: { fill: "rgb(0,0,0)", stroke: undefined }
            });
            ui_ctx_2.restore();
            drawText(ui_ctx_2, {
                x: 210,
                y: 120,
                size: "30",
                sizeData: 30,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "left",
                lineWidth: 2,
                message: '- Seol7523',
                color: { fill: "rgb(0,0,0)", stroke: undefined }
            });
            drawText(ui_ctx_2, {
                x: 210,
                y: 170,
                size: "30",
                sizeData: 30,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "left",
                lineWidth: 2,
                message: '- MossyGoldcoin',
                color: { fill: "rgb(0,0,0)", stroke: undefined }
            });
            drawText(ui_ctx_2, {
                x: 210,
                y: 220,
                size: "30",
                sizeData: 30,
                font: "'Do Hyeon'",
                textBaseline: "middle",
                textAlign: "left",
                lineWidth: 2,
                message: '- ysw421',
                color: { fill: "rgb(0,0,0)", stroke: undefined }
            });
            credit.backbutton.draw.call(credit.backbutton);
            credit.title.draw.call(credit.title);
            DrawcustomAlert(ui_ctx);
        };

        credit.destroy = function () {
            bg_ctx.clearRect(0, 0, 800, 450);
            de_ctx.clearRect(0, 0, 800, 450);
            ui_ctx.clearRect(0, 0, 800, 450);
            ui_ctx_2.clearRect(0, 0, 800, 450);
            credit.backbutton.destroy();
        };
    })();
});

// Objects
function TextObject() { }

TextObject.prototype.initialize = function (canvas, ctx, data) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.data = data;

    let text = this.data.text;
    text.color = text.colorData.default;
};

TextObject.prototype.draw = function () {
    if (!this.data) return;
    drawText(this.ctx, this.data.text);
};
function ButtonObject() {
    TextObject.call(this);
};
ButtonObject.prototype = new TextObject();
ButtonObject.prototype.constructor = ButtonObject;

ButtonObject.prototype.initialize = function (canvas, ctx, data) {
    TextObject.prototype.initialize.call(this, canvas, ctx, data);
    let button = this.data.button;
    let text = this.data.text;
    button.color = button.colorData.default;
};
ButtonObject.prototype.draw = function () {
    if (!this.data) return;
    if (!this.data.button.alive) return;
    let button = this.data.button;
    let text = this.data.text;
    if (checktouched(window.customMouseX, window.customMouseY, button)) {
        button.color = button.colorData.mouseover;
        text.color = text.colorData.mouseover;
        button.width = button.positionData.width * 1.1;
        button.height = button.positionData.height * 1.1;
        text.size = text.sizeData * 1.1;
    } else {
        button.color = button.colorData.default;
        text.color = text.colorData.default;
        button.width = button.positionData.width;
        button.height = button.positionData.height;
        text.size = text.sizeData;
    }
    drawButton(this.ctx, button);
    if (checktouched(window.customMouseClickX, window.customMouseClickY, button) && this.data.button.alive && window.customMouseClick) {
        window.customMouseClick = false;
        window.button_effect.currentTime = 0;
        window.button_effect.play();
        this.click();
    }
    TextObject.prototype.draw.call(this);
};
ButtonObject.prototype.destroy = function () {
    this.data.button.alive = false;
};

//Common Functions
function checktouched(x, y, square) {
    if (x >= square.x - square.width / 2 && x <= square.x + square.width / 2 && y >= square.y - square.height / 2 && y <= square.y + square.height / 2)
        return true;
}
function drawButton(ctx, button) {
    if (!button.color) return;
    ctx.save();
    ctx.beginPath();

    ctx.globalAlpha = button.globalAlpha !== undefined ? button.globalAlpha : 1;
    if (button.color.stroke) {
        ctx.strokeStyle = button.color.stroke;
        ctx.lineWidth = button.lineWidth;
        ctx.beginPath();
        ctx.moveTo(button.x - button.width / 2 + 10, button.y - button.height / 2);
        ctx.lineTo(button.x + button.width / 2 - 10, button.y - button.height / 2);
        ctx.arcTo(button.x + button.width / 2, button.y - button.height / 2, button.x + button.width / 2, button.y + button.height / 2, 10);
        ctx.lineTo(button.x + button.width / 2, button.y + button.height / 2 - 10);
        ctx.arcTo(button.x + button.width / 2, button.y + button.height / 2, button.x - button.width / 2, button.y + button.height / 2, 10);
        ctx.lineTo(button.x - button.width / 2 + 10, button.y + button.height / 2);
        ctx.arcTo(button.x - button.width / 2, button.y + button.height / 2, button.x - button.width / 2, button.y - button.height / 2, 10);
        ctx.lineTo(button.x - button.width / 2, button.y - button.height / 2 + 10);
        ctx.arcTo(button.x - button.width / 2, button.y - button.height / 2, button.x + button.width / 2, button.y - button.height / 2, 10);
    }
    if (button.color.fill) {
        ctx.fillStyle = button.color.fill;
        ctx.fill();
    }
    ctx.stroke();
    ctx.restore();

}
function drawText(ctx, text) {
    if (!text.color) return;
    ctx.save();
    ctx.beginPath();

    ctx.font = text.size + "px " + text.font;
    ctx.textAlign = text.textAlign;
    ctx.textBaseline = text.textBaseline;
    // ctx.globalAlpha = text.globalAlpha !== undefined ? text.globalAlpha : 1;
    if (text.color.stroke) {
        ctx.strokeStyle = text.color.stroke;
        ctx.lineWidth = text.lineWidth;
        ctx.strokeText(text.message, text.x, text.y);
    }
    if (text.color.fill) {
        ctx.fillStyle = text.color.fill;
        ctx.fillText(text.message, text.x, text.y);
    }
    ctx.restore();
}
function drawLine(ctx, x1, y1, x2, y2, color, lineWidth) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}
function drawCircle(ctx, x, y, r, color) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, r, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.restore();
}
function drawRect(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}
function roundedRect(ctx, x, y, width, height, color, line) {
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = line;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - width / 2 + 10, y - height / 2);
    ctx.lineTo(x + width / 2 - 10, y - height / 2);
    ctx.arcTo(x + width / 2, y - height / 2, x + width / 2, y + height / 2, 10);
    ctx.lineTo(x + width / 2, y + height / 2 - 10);
    ctx.arcTo(x + width / 2, y + height / 2, x - width / 2, y + height / 2, 10);
    ctx.lineTo(x - width / 2 + 10, y + height / 2);
    ctx.arcTo(x - width / 2, y + height / 2, x - width / 2, y - height / 2, 10);
    ctx.lineTo(x - width / 2, y - height / 2 + 10);
    ctx.arcTo(x - width / 2, y - height / 2, x + width / 2, y - height / 2, 10);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
function DrawcustomAlert(ctx) {
    for (let i = 0; i < window.customAlert.length; i++) {
        let alert = window.customAlert[i];
        ctx.save();
        ctx.globalAlpha = 0.5 + alert[1] / 60;
        drawRect(ctx, 100, 10 + (70 * i), 600, 60, 'rgb(127,127,127)');
        drawText(ctx, {
            x: 400,
            y: 35 + (70 * i),
            size: "20",
            sizeData: 20,
            font: "'Do Hyeon'",
            textBaseline: "middle",
            textAlign: "center",
            lineWidth: 2,
            message: alert[0],
            color: { fill: "rgb(0,0,0)", stroke: undefined }
        });
        ctx.restore();
        alert[1]--;
        if (alert[1] == 0) {
            window.customAlert.splice(i, 1);
        }
    }
}
function drawObject(ctx, x, y, type) {
    // type : 0(풀-멀리있는) , 1(풀-가까이있는)
    ctx.save();
    switch (type) {
        case 0:
            ctx.globalAlpha = 1;
            drawRect(ctx, x, y, 52, 52, '#4e9918');
            drawLine(ctx, x + 26, y + 16, x + 32, y + 10, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 32, y + 10, x + 32, y + 16, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 32, y + 16, x + 38, y + 10, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 38, y + 10, x + 38, y + 16, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 10, y + 40, x + 16, y + 34, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 16, y + 34, x + 16, y + 40, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 16, y + 40, x + 22, y + 34, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 22, y + 34, x + 22, y + 40, 'rgb(0,0,0)', 1);
            break
        case 1:
            ctx.globalAlpha = 0.7;
            drawRect(ctx, x, y, 52, 52, '#4e9918');
            drawLine(ctx, x + 26, y + 16, x + 32, y + 10, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 32, y + 10, x + 32, y + 16, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 32, y + 16, x + 38, y + 10, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 38, y + 10, x + 38, y + 16, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 10, y + 40, x + 16, y + 34, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 16, y + 34, x + 16, y + 40, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 16, y + 40, x + 22, y + 34, 'rgb(0,0,0)', 1);
            drawLine(ctx, x + 22, y + 34, x + 22, y + 40, 'rgb(0,0,0)', 1);
            break
    }
    ctx.restore()
}