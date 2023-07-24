const tool = new (require("../tool.js"));
const MapData = require('./MapData.json');

function RoomManager(Player, Room) {

    this.makeRoom = function (PlayerId, RoomId, RoomPassword) {
        Player.Rooms[PlayerId] = RoomId;
        Player.RoomNums[PlayerId] = 0;
        Room.Password[RoomId] = RoomPassword;
        Room.PlayerIds[RoomId] = new Uint16Array(8);
        Room.PlayerIds[RoomId][0] = PlayerId;
        Room.PlayerCounts[RoomId] = 1;
        Room.PlayerNames[RoomId] = new Array(8);
        Room.PlayerNames[RoomId][0] = Player.Names[PlayerId];
        Room.States[RoomId] = 1;
        Room.OwnerIds[RoomId] = PlayerId;
        Room.MapId[RoomId] = 0;
    }

    this.joinRoom = function (PlayerId, RoomId) {
        Player.Rooms[PlayerId] = RoomId;
        Player.RoomNums[PlayerId] = Room.PlayerIds[RoomId].indexOf(0);
        Room.PlayerIds[RoomId][Player.RoomNums[PlayerId]] = PlayerId;
        Room.PlayerCounts[RoomId]++;
        if (Room.PlayerCounts[RoomId] === 8) {
            Room.States[RoomId] = 2;
        }
        Room.PlayerNames[RoomId][Player.RoomNums[PlayerId]] = Player.Names[PlayerId];
    }

    this.exitRoom = function (PlayerId, RoomId) {
        Player.Rooms[PlayerId] = 0;
        Room.PlayerIds[RoomId][Player.RoomNums[PlayerId]] = 0;
        Room.PlayerCounts[RoomId]--;
        if (Room.States[RoomId] === 2) { // 그냥 1로 정하면 게임중인 방도 1이 되므로 조건문 넣어줘야 함.
            Room.States[RoomId] = 1;
        }
        Room.PlayerNames[RoomId][Player.RoomNums[PlayerId]] = undefined;
        if (Room.States[RoomId] === 3 && Room.PlayerLiveStates[RoomId][Player.RoomNums[PlayerId]] === 1) {
            Room.LiveCounts[RoomId]--;
            Room.PlayerLiveStates[RoomId][Player.RoomNums[PlayerId]] = 0;
        }
    }

    this.deleteRoom = function (RoomId) {
        Room.States[RoomId] = 0;
        Room.PlayerIds[RoomId] = undefined;
        Room.PlayerCounts[RoomId] = 0;
        Room.PlayerNames[RoomId] = undefined;
        Room.OwnerIds[RoomId] = 0;
        Room.Count--;
    }

    this.StartGame = function (RoomId) {
        Room.PlayerGameStats[RoomId] = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]; // [아웃시킨 플레이어 수, 스위치 성공 횟수, 스위치 사용 횟수]
        Room.StartTime[RoomId] = Date.now();
        Room.LiveCounts[RoomId] = Room.PlayerCounts[RoomId];
        Room.PlayerLiveStates[RoomId] = new Int8Array(8);
        const MapName = MapData.name[(Room.MapId[RoomId] === 0) ? tool.getRandomNum(1, MapData.typeCount) : Room.MapId[RoomId]];
        Room.Map[RoomId] = [];
        Room.MapWidth[RoomId] = MapData.map[MapName].width;
        Room.MapHeight[RoomId] = MapData.map[MapName].height;
        for (i = 0; i < Room.MapHeight[RoomId]; i++) {
            Room.Map[RoomId].push(MapData.map[MapName].data[i].slice()); // 메모리 참조땜에 이렇게 해야됨.
        }
        Room.PlayerXs[RoomId] = new Uint16Array(8);
        Room.PlayerYs[RoomId] = new Uint16Array(8);
        Room.PlayerDxs[RoomId] = new Uint16Array(8);
        Room.PlayerDys[RoomId] = new Uint16Array(8);
        Room.PlayerSightRanges[RoomId] = new Uint8Array([160, 160, 160, 160, 160, 160, 160, 160]);
        let StartPosX = MapData.map[MapName].startingX.slice(); // 오브젝트라 메모리 참조가 되기 때문에 slice() 넣어줘야함.
        let StartPosY = MapData.map[MapName].startingY.slice();
        for (i = 0; i < 8; i++) {
            if (Room.PlayerIds[RoomId][i] !== 0) {
                Room.PlayerLiveStates[RoomId][i] = 1;
                let RandomNum = tool.getRandomNum(0, StartPosX.length);
                Room.PlayerXs[RoomId][i] = StartPosX.splice(RandomNum, 1)[0] * 1000 + 500;
                Room.PlayerYs[RoomId][i] = StartPosY.splice(RandomNum, 1)[0] * 1000 + 500;
            }
        }
        const LivePlayers = Room.PlayerIds[RoomId].filter(id => id !== 0);
        Room.TaggerIds[RoomId] = LivePlayers[tool.getRandomNum(0, LivePlayers.length)];
        Room.TaggerChangeTime[RoomId] = Date.now();
        Room.PlayerBoosts[RoomId] = new Uint8Array(8);
        Room.States[RoomId] = 3;
    }

    this.CheckTouch = function (PlayerId1, PlayerId2, Diameter) {
        const Room1 = Player.Rooms[PlayerId1];
        const RoomNum1 = Player.RoomNums[PlayerId1];
        const Room2 = Player.Rooms[PlayerId2];
        const RoomNum2 = Player.RoomNums[PlayerId2];
        if (Room1 === 0 || Room2 === 0) { // 방 나가는 중에 CheckTouch가 작동되면 Room1,2 가 0이라서 에러뜬다.
            return false;
        }
        const PlayerDx = Room.PlayerXs[Room1][RoomNum1] - Room.PlayerXs[Room2][RoomNum2];
        const PlayerDy = Room.PlayerYs[Room1][RoomNum1] - Room.PlayerYs[Room2][RoomNum2];
        return PlayerDx * PlayerDx + PlayerDy * PlayerDy < Diameter * Diameter;
    }

    this.EndGame = function (RoomId) {
        if (Room.PlayerCounts[RoomId] === 8) {
            Room.States[RoomId] = 2;
        } else {
            Room.States[RoomId] = 1;
        }
    }
}

module.exports = RoomManager;