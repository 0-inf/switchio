const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, "public")));

// set value
// 값들을 Player와 Room에 모두 담은이유는 이렇게해야 다른모듈과의 공유가 가능하기 때문임. (오브젝트로 만들어서 메모리 참조 시키기)
// 배열의 "플레이어id" 번째 요소 = "플레이어id" 의 정보
const PlayerMaxNum = 100; // 실제 최대 동접자수는 1을 빼야함.
const RoomMaxNum = 16; // 실제 최대 방 생성수는 1을 빼야함.
let Player = {};
let Room = {};
Player.Count = 1; // 접속한 사용자 명수. 0번은 제한되었기 때문에 편의성을 위해 1부터 시작한다.
Player.States = new Uint8Array(PlayerMaxNum); // 사용자들의 접속상태, 0 = 접속없음, 1 = 접속됨, 2 = 제한됨 [2, 1, 1, ...]
Player.States[0] = 2; // "0 id"는 "정의 되지 않음" 과 구분이 불가능하기 때문에 플레이어id는 1부터 시작
Player.SocketIds = new Array(PlayerMaxNum); // 사용자들의 socket.id [undefined, InmBAk5rdMKWzJgtAAAH, ...]
Player.Names = new Array(PlayerMaxNum); // [undefined, "이끼 낀 금화", "설망래", ...]
Player.Rooms = new Uint16Array(PlayerMaxNum); // [0, 1, 142, ...]
Player.RoomNums = new Uint8Array(PlayerMaxNum); // 방에서 몇 번째 항목에 자신의 정보가 있는지 나타냄. [0, 1, 5, 3, ...]
Room.Count = 1; // 생성된 방 수. 0번은 제한되었기 때문에 편의성을 위해 1부터 시작한다.
Room.States = new Uint8Array(RoomMaxNum); // 0 = 방 없음, 1 = 준비중인 방, 2 = 준비중인데 꽉찬 방, 3 = 게임중인 방, 4 = 제한됨 [0, 1, 2, ...]
Room.States[0] = 4; // Player.States 와 같은 이유
Room.Password = new Uint16Array(RoomMaxNum); // 방의 비번, 중요: 00 ~ 9999 까지 이므로 (자리수 * 10000) 을 더해준다. [0, 20000(=00), 30028(=028), 48769(=8769), ...]
Room.PlayerIds = new Array(RoomMaxNum); // [undefined, [1, 5, 465, 0, 0, 0, 0, 0], ...]
Room.PlayerCounts = new Uint8Array(RoomMaxNum); // [0, 3, 8, ...]
Room.PlayerNames = new Array(RoomMaxNum); // 방안의 플레이어 이름들, [undefined, ["이끼 낀 금화", "얍", "hello", undefined, ...], ["설망래", ...]]
Room.OwnerIds = new Uint16Array(RoomMaxNum); // 방장id들, [0, 1, 142, ...]
Room.StartTime = new Array(RoomMaxNum); // 방의 게임시작 시간, [undefined, 39485948568, 39980405998, ...]
Room.TaggerIds = new Uint16Array(RoomMaxNum); // 술래id들. 0은 술래없음, [0, 465, 293, ...]
Room.TaggerChangeTime = new Array(RoomMaxNum); // 마지막으로 술래가 바뀐시간, [undefined, 39485948568, 39980405998, ...]
Room.LiveCounts = new Uint8Array(RoomMaxNum); // 생존자수들, [0, 3, 5, ...]
Room.PlayerLiveStates = new Array(RoomMaxNum); // 플레이어들 생존 여부들, [undefined, [1, 1, 0, ...], ...]
Room.MapId = new Uint8Array(RoomMaxNum); // 방이 플레이할 맵id
Room.Map = new Array(RoomMaxNum); // 방의 맵 데이터
Room.MapWidth = new Uint8Array(RoomMaxNum); // 방의 맵 가로길이
Room.MapHeight = new Uint8Array(RoomMaxNum); // 방의 맵 세로길이
Room.PlayerXs = new Array(RoomMaxNum); // 플레이어들 x좌표들, 소수점 셋째자리까지 나타내기위해 1000이 곱해져있음, [undefined, [4882, -255, 23483, ...], ...]
Room.PlayerYs = new Array(RoomMaxNum); // 플레이어들 y좌표들, 소수점 셋째자리까지 나타내기위해 1000이 곱해져있음, [undefined, [0, 3967, 19566, ...], ...]
Room.PlayerDxs = new Array(RoomMaxNum); // 플레이어들 델타 x좌표들
Room.PlayerDys = new Array(RoomMaxNum); // 플레이어들 델타 y좌표들
Room.PlayerSightRanges = new Array(RoomMaxNum); // 플레이어들 시야 사정거리, 소수점 첫째자리까지 나타내기위해 10이 곱해져있음
Room.PlayerBoosts = new Array(RoomMaxNum); // 플레이어들 부스트 여부, [undefined, [0, 1, 0, ...], ...]

// module import
const RoomMg = new (require("./switch/RoomManager.js"))(Player, Room);
const MapData = require("./switch/MapData.json");
const tool = new (require("./tool.js"));
const CharRad = 0.4;
const CharDia = 0.8;
const TaggerChaRad = 1;
const { isObject } = require('util');
const devcode = "yZVrK8xyp46yWoGCEf1zmUXeWazgvqunOumawOSul0zZ2xFYwKrmMAEouRvotwoMZJwKuBz3BMayllpKzNFxXWClyOApGztikNztUju02diBKgMkdY9lqihPZvoO8T6IHrPjmuuG5bGGfR96805HEqbGKGB8w9EPjObVBrD1nwjU4zms18ybfJyeXfZChGJEYGko0ymQVRqx9ShMgQB5hbBUSM2Pq8VWZNf8ZmUdSadq76NX9HO2vCVA0irtYHD";
let dev = [];

const port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log(`server on!: http://localhost:${port}`);
});


/** 맵에서 플레이어 시작위치 구하는 코드
c = '';
d = '';
mapWidth = 28;
a = Math.round(Math.sin(22.5 * Math.PI / 180) * 10);
b = Math.round(Math.cos(22.5 * Math.PI / 180) * 10);
a = 9;
b = 4;
mapWidth -= 1;
for (i = 0; i < 2; i++) {
    c += `${a}, `;
    d += `${b}, `;
    a = mapWidth - a;
    c += `${a}, `;
    d += `${b}, `;
    b = mapWidth - b;
    c += `${a}, `;
    d += `${b}, `;
    a = mapWidth - a;
    c += `${a}, `;
    d += `${b}, `;
    e = a;
    a = b;
    b = e;
}
console.log(c);
console.log(d);*/


function PosUpdateLoop() {
    for (i = 1; i < RoomMaxNum; i++) {
        if (Room.States[i] === 3) {
            const WallWidth = (Math.max(0, Date.now() - Room.StartTime[i] - 10000)) * 0.00015 // 10초 후 줄어듬. 6.666초당 1타일
            // 자기장에 가까이 있는 벽 부수기
            const WallWidthInt = parseInt(WallWidth);
            for (j = WallWidthInt + 1; j < Room.MapWidth[i] - WallWidthInt - 1; j++) {
                Room.Map[i][WallWidthInt + 1][j] === 2 ? Room.Map[i][WallWidthInt + 1][j] = 0 : null;
                Room.Map[i][Room.MapWidth[i] - WallWidthInt - 2][j] === 2 ? Room.Map[i][Room.MapWidth[i] - WallWidthInt - 2][j] = 0 : null;
                Room.Map[i][j][WallWidthInt + 1] === 2 ? Room.Map[i][j][WallWidthInt + 1] = 0 : null;
                Room.Map[i][j][Room.MapWidth[i] - WallWidthInt - 2] === 2 ? Room.Map[i][j][Room.MapWidth[i] - WallWidthInt - 2] = 0 : null;
            }
            // 방안의 각각의 플레이어 모두 탐색
            for (j = 0; j < 8; j++) {
                if (!Room.PlayerLiveStates[i][j]) { continue; }
                Room.PlayerXs[i][j] += Room.PlayerDxs[i][j];
                Room.PlayerYs[i][j] += Room.PlayerDys[i][j];
                Room.PlayerDxs[i][j] = 0;
                Room.PlayerDys[i][j] = 0;
                let PlayerX = Room.PlayerXs[i][j] * 0.001;
                let PlayerY = Room.PlayerYs[i][j] * 0.001;
                // 벽 감지
                let PlayerXIndex = Math.floor(PlayerX);
                let PlayerYIndex = Math.floor(PlayerY);
                function mapCheck(X, Y) { if (PlayerYIndex + Y < 0 || Room.MapHeight[i] <= PlayerYIndex + Y || PlayerXIndex + X < 0 || Room.MapWidth[i] <= PlayerXIndex + X) { return false; } else { return Room.Map[i][PlayerYIndex + Y][PlayerXIndex + X] === 2; } }
                let PlayerXIndex2; let PlayerYIndex2; let PlayerXRemain; let PlayerYRemain; let multiple;
                function wallCheck() {
                    PlayerXRemain = PlayerX - PlayerXIndex2; PlayerYRemain = PlayerY - PlayerYIndex2;
                    if (PlayerXRemain ** 2 + PlayerYRemain ** 2 < 0.16) {
                        multiple = 0.4 / Math.sqrt(PlayerXRemain ** 2 + PlayerYRemain ** 2),
                        PlayerX = PlayerXIndex2 + PlayerXRemain * multiple,
                        PlayerY = PlayerYIndex2 + PlayerYRemain * multiple
                    }
                }
                mapCheck(-1, 0) ? (
                    (PlayerX < PlayerXIndex + 0.4) ? PlayerX = PlayerXIndex + 0.4 : null
                ) : (
                    PlayerXIndex2 = PlayerXIndex,
                    (!mapCheck(0, -1) && mapCheck(-1, -1)) ? (
                        PlayerYIndex2 = PlayerYIndex, wallCheck()
                    ) : null,
                    (!mapCheck(0, 1) && mapCheck(-1, 1)) ? (
                        PlayerYIndex2 = PlayerYIndex + 1, wallCheck()
                    ) : null
                );
                mapCheck(1, 0) ? (
                    (PlayerXIndex + 0.6 < PlayerX) ? PlayerX = PlayerXIndex + 0.6 : null
                ) : (
                    PlayerXIndex2 = PlayerXIndex + 1,
                    (!mapCheck(0, -1) && mapCheck(1, -1)) ? (
                        PlayerYIndex2 = PlayerYIndex, wallCheck()
                    ) : null,
                    (!mapCheck(0, 1) && mapCheck(1, 1)) ? (
                        PlayerYIndex2 = PlayerYIndex + 1, wallCheck()
                    ) : null
                );
                mapCheck(0, -1) ? (
                    (PlayerY < PlayerYIndex + 0.4) ? PlayerY = PlayerYIndex + 0.4 : null
                ) : null;
                mapCheck(0, 1) ? (
                    (PlayerYIndex + 0.6 < PlayerY) ? PlayerY = PlayerYIndex + 0.6 : null
                ) : null;
                // 자기장 감지
                if (PlayerX + CharRad > Room.MapWidth[i] - WallWidth) { PlayerX = Room.MapWidth[i] - WallWidth - CharRad }
                if (PlayerY + CharRad > Room.MapHeight[i] - WallWidth) { PlayerY = Room.MapHeight[i] - WallWidth - CharRad }
                if (PlayerX - CharRad < WallWidth) { PlayerX = WallWidth + CharRad }
                if (PlayerY - CharRad < WallWidth) { PlayerY = WallWidth + CharRad }
                Room.PlayerXs[i][j] = Math.round(PlayerX * 1000);
                Room.PlayerYs[i][j] = Math.round(PlayerY * 1000);
            }
            for (j = 0; j < 8; j++) {
                if (!Room.PlayerLiveStates[i][j]) { continue; }
                if (Room.PlayerIds[i][j] !== Room.TaggerIds[i]) {
                    if (RoomMg.CheckTouch(Room.PlayerIds[i][j], Room.TaggerIds[i], CharDia * 1000)) {
                        Room.LiveCounts[i]--;
                        Room.PlayerLiveStates[i][j] = 0;
                        Room.TaggerChangeTime[i] = Date.now();
                        io.to(i).emit('player out', Room.PlayerIds[i][j]);
                    }
                }
            }
            if (Room.LiveCounts[i] <= 2) { // 생존자 2명이하일때 게임끝남
                let LivePlayerIndexs = [];
                for (j = 0; j < 8; j++) {
                    if (Room.PlayerLiveStates[i][j] === 1) {
                        LivePlayerIndexs.push(j);
                    }
                }
                io.to(i).emit('game over', LivePlayerIndexs);
                RoomMg.EndGame(i);
            } else {
                if (Date.now() - Room.TaggerChangeTime[i] >= 20000){ // 술래 안바뀐지 20초 이상지나면 술래 자동 바뀜
                    Room.TaggerChangeTime[i] = Date.now();
                    const LiveRunners = [0,1,2,3,4,5,6,7].filter(index => Room.PlayerLiveStates[i][index] === 1 && Room.TaggerIds[i] !== Room.PlayerIds[i][index]);
                    Room.TaggerIds[i] = Room.PlayerIds[i][LiveRunners[tool.getRandomNum(0, LiveRunners.length)]];
                    io.to(i).emit('change tagger', Room.TaggerIds[i]);
                }
                io.to(i).emit('client update', Room.PlayerXs[i], Room.PlayerYs[i], Room.PlayerBoosts[i], Room.PlayerSightRanges[i], Date.now() - Room.StartTime[i], Room.Map[i]);
            }
        }
    }
    setTimeout(function() { PosUpdateLoop(); });
}
PosUpdateLoop();

io.on('connection', function (socket) {
    const PlayerId = function () { // 앞으로 계속 쓰일 사용자id (socket.id와 역할이 같음)
        if (Player.Count < PlayerMaxNum) {
            Player.Count++;
            const PlayerId = Player.States.indexOf(0);
            Player.States[PlayerId] = 1;
            Player.SocketIds[PlayerId] = socket.id;
            io.to(socket.id).emit('connected', PlayerId);
            return PlayerId;
        } else {
            io.to(socket.id).emit('server full');
            return false;
        }
    }();
    if (!PlayerId) {
        socket.disconnect();
    }
    let PlayerRoomId = 0;
    let PlayerRoomNum;
    let PlayerName;

    socket.on('join room', function (PlayerData) {
        PlayerName = PlayerData.name;
        Player.Names[PlayerId] = PlayerName;
        if (PlayerData.roomId === "auto") {
            if (!PlayerData.newRoom) { // 자동매치인데 방이 존재하지 않거나 덜 찬 방이 존재하지 않는지 확인
                let mostRoomId = 0;
                for(i = 1; i < RoomMaxNum; i++){ // 참가하기에 적합한 방 찾기
                    if(Room.PlayerCounts[i] < 8 & Room.States[i] !== 0 & Room.States[i] !== 4 & Room.Password[i] === 0 & Room.PlayerCounts[i] > Room.PlayerCounts[mostRoomId]){
                        mostRoomId = i;
                    }
                }
                if(mostRoomId !== 0){
                    PlayerData.roomId = mostRoomId;
                }
                if(PlayerData.roomId === "auto"){ // 자동참가 할 수 있는 방이 없을때
                    PlayerData.newRoom = true;
                }
            }
        } else { // 선택매치
            let reason = -1;
            if (Room.PlayerCounts[PlayerData.roomId] === 0) { // 입력한 방이 존재하지않는경우
                reason = 0;
            } else if (Room.PlayerCounts[PlayerData.roomId] === 8) { // 입력한 방이 꽉찬경우
                reason = 1;
            } else if (Room.Password[PlayerData.roomId] !== PlayerData.password) { // 비밀번호 맞는지 확인. 없는건 둘다 0이기 때문에 조건 하나만 둬도 된다.
                reason = 2;
            }
            if(reason !== -1){
                io.to(socket.id).emit('no room', reason);
                return;
            }
        }
        let PlayingRoom = 0;
        if (PlayerData.newRoom) {
            if (Room.Count >= RoomMaxNum) { // 서버 방 생성 꽉참
                io.to(socket.id).emit('no room', 3);
                return;
            }
            Room.Count++
            PlayerRoomId = Room.States.indexOf(0);
            RoomMg.makeRoom(PlayerId, PlayerRoomId, PlayerData.password);
        } else {
            PlayerRoomId = PlayerData.roomId;
            RoomMg.joinRoom(PlayerId, PlayerRoomId);
            if(Room.States[PlayerData.roomId] === 3){
                PlayingRoom = 1;
            }
        }
        PlayerRoomNum = Player.RoomNums[PlayerId];
        io.to(socket.id).emit('join room', PlayerRoomId, Room.PlayerIds[PlayerRoomId], Room.PlayerCounts[PlayerRoomId], Room.PlayerNames[PlayerRoomId], Room.OwnerIds[PlayerRoomId], Room.MapId[PlayerRoomId], PlayingRoom);
        if(PlayingRoom === 1){ io.to(socket.id).emit('start game', Room.PlayerLiveStates[PlayerRoomId], Room.LiveCounts[PlayerRoomId], Room.PlayerXs[PlayerRoomId], Room.PlayerYs[PlayerRoomId], Room.PlayerSightRanges[PlayerRoomId], Room.TaggerIds[PlayerRoomId], Room.Map[PlayerRoomId]) }
        io.to(PlayerRoomId).emit('user join', PlayerId, PlayerName, PlayerRoomNum);
        socket.join(PlayerRoomId);
    })

    socket.on('exit room', function () {
        socket.leave(PlayerRoomId);
        if (Room.PlayerCounts[PlayerRoomId] < 2) { // 나간사람이 마지막 사람일 경우
            RoomMg.deleteRoom(PlayerRoomId);
            Player.Rooms[PlayerId] = 0;
        } else {
            RoomMg.exitRoom(PlayerId, PlayerRoomId);
            if (Room.OwnerIds[PlayerRoomId] === PlayerId) { // 나간사람이 방장인 경우
                Room.OwnerIds[PlayerRoomId] = Room.PlayerIds[PlayerRoomId].filter(id => id !== 0)[0];
                io.to(PlayerRoomId).emit('pass owner', Room.OwnerIds[PlayerRoomId]);
            }
            io.to(PlayerRoomId).emit('user exit', PlayerId);
        }
        PlayerRoomId = 0;
    })

    socket.on('pass owner', function (OwnerId) {
        Room.OwnerIds[PlayerRoomId] = OwnerId;
        io.to(PlayerRoomId).emit('pass owner', OwnerId);
    })

    socket.on('kick user', function (KickId) {
        RoomMg.exitRoom(KickId, PlayerRoomId);
        io.to(PlayerRoomId).emit('user exit', KickId);
        io.to(Player.SocketIds[KickId]).emit('kicked');
    })

    socket.on("manager_check", function (code) {
        if(code === devcode){
            dev.push(socket.id);
            io.to(socket.id).emit("YouAreDev");
        }
    });

    socket.on('kicked ok', function () { // kick user는 방장의 소켓이므로 킥 당한 사람으로부터 신호를 받는 작업이 필요함.
        socket.leave(PlayerRoomId);
        PlayerRoomId = 0;
    })

    socket.on('disconnect', function () {
        if(dev.indexOf(socket.id) !== -1){
            dev.splice(dev.indexOf(socket.id), 1);
        };
        if (PlayerRoomId !== 0) {
            if (Room.PlayerCounts[PlayerRoomId] < 2) { // 나간사람이 마지막 사람일 경우
                RoomMg.deleteRoom(PlayerRoomId);
            } else {
                RoomMg.exitRoom(PlayerId, PlayerRoomId);
                if (Room.States[PlayerRoomId] === 3) { // 만약 게임중인 방이라면
                    if (Room.LiveCounts[PlayerRoomId] <= 2) { // 나가면 생존자가 2명만 남아서 이기는 경우
                        io.to(PlayerRoomId).emit('game over', Room.PlayerIds[PlayerRoomId].filter(id => Room.PlayerLiveStates[PlayerRoomId][Player.RoomNums[id]] === 1));
                        RoomMg.EndGame(PlayerRoomId);
                    } else if (Room.TaggerIds[PlayerRoomId] === PlayerId) { // 나간사람이 술래인 경우
                        const LiveRunners = [0,1,2,3,4,5,6,7].filter(index => Room.PlayerLiveStates[PlayerRoomId][index] === 1);
                        Room.TaggerIds[PlayerRoomId] = Room.PlayerIds[PlayerRoomId][LiveRunners[tool.getRandomNum(0, LiveRunners.length)]];
                        Room.TaggerChangeTime[PlayerRoomId] = Date.now();
                        io.to(PlayerRoomId).emit('change tagger', Room.TaggerIds[PlayerRoomId]);
                    }
                }
                if (Room.OwnerIds[PlayerRoomId] === PlayerId) { // 나간사람이 방장인 경우
                    Room.OwnerIds[PlayerRoomId] = Room.PlayerIds[PlayerRoomId].filter(id => id !== 0)[tool.getRandomNum(0, Room.PlayerCounts[PlayerRoomId])];
                    io.to(PlayerRoomId).emit('pass owner', Room.OwnerIds[PlayerRoomId]);
                }
                io.to(PlayerRoomId).emit('user exit', PlayerId);
            }
        }
        Player.States[PlayerId] = 0;
        Player.SocketIds[PlayerId] = undefined;
    })

    socket.on('map change', function (value) {
        Room.MapId[PlayerRoomId] = (Room.MapId[PlayerRoomId] + value + MapData.typeCount) % MapData.typeCount;
        io.to(PlayerRoomId).emit('map change', Room.MapId[PlayerRoomId]);
    })

    // 여기서부터 인게임 코드
    socket.on('start game', function () {
        RoomMg.StartGame(PlayerRoomId);
        io.to(PlayerRoomId).emit('start game', Room.PlayerLiveStates[PlayerRoomId], Room.LiveCounts[PlayerRoomId], Room.PlayerXs[PlayerRoomId], Room.PlayerYs[PlayerRoomId], Room.PlayerSightRanges[PlayerRoomId], Room.TaggerIds[PlayerRoomId], Room.Map[PlayerRoomId]);
    })

    socket.on('client update', function (PlayerDx, PlayerDy, PlayerBoost) {
        if (Room.PlayerLiveStates[PlayerRoomId][PlayerRoomNum] === 0) {
            return;
        }
        Room.PlayerDxs[PlayerRoomId][PlayerRoomNum] += PlayerDx;
        Room.PlayerDys[PlayerRoomId][PlayerRoomNum] += PlayerDy;
        Room.PlayerBoosts[PlayerRoomId][PlayerRoomNum] = PlayerBoost;
    })

    socket.on('change challenge', function (TargetId) {
        io.to(PlayerRoomId).emit('change challenge', PlayerId, TargetId);
        if (RoomMg.CheckTouch(PlayerId, Room.TaggerIds[PlayerRoomId], (TaggerChaRad + CharRad) * 1000)) {
            Room.TaggerIds[PlayerRoomId] = TargetId;
            Room.TaggerChangeTime[PlayerRoomId] = Date.now();
            io.to(PlayerRoomId).emit('change tagger', TargetId);
        }
    })

    socket.on('emoji',function(what){
        io.to(PlayerRoomId).emit('emoji',PlayerId,what);
    })

});
