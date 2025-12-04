import { 
Vector3
} from "@babylonjs/core";


export const meshNamesByZone = {
    pool: { 
        lounge: ["loungeChair0", "loungeChair1", "loungeChair2", "loungeChair3",
                "loungeChair4", "loungeChair5"],
        buttonsPool: ["buttonPoolLeft", "buttonPoolRight", "water"],
    },
    lockerRoom: {
        furniture: ["furniture"],
        locker: ["tshirt0", "tshirt1","tshirt2","tshirt3","tshirt4","tshirt5",
        "tshirt6","tshirt7","tshirt8","tshirt9", "buttonLeft", "buttonRight", "exit_primitive1"],
        tv: ["screenTv", "RightButton"],
        score:["screenBoard", "sponge"],
        field: ["field"]
    },
    field: {
        arbitrator: ["seatArbitrator_primitive0"],
        seatsFriends: ["chair00", "chair01", "chair02", "chair03"],
        spectator: [
            "seatsSpectator_primitive0",
            "seatsSpectator_primitive1",
            "seatsSpectator_primitive2",
            "seatsSpectator_primitive3",
            "chair00",
            "chair01",
            "chair02",
            "chair03"
        ],
        scoreBoard: [
            "scoreBoardTime",
            "scoreBoardLeft",
            "scoreBoardRight"
        ],
        buttonsField: [
            "buttonLeftStands",
            "buttonRightStands",
            "buttonExitStands",
            "exitField"
        ]
    }
};

export enum ZoneName {
  STANDS = "stands",
  LOCKER_ROOM = "furniture",
  POOL = "border",
  SCOREBOARD = "sceenBoard",
  SCREEN_TV = "screenTv",
  TSHIRT = "tshirt",
  SEAT = "chair",
  ARBITRATOR = "seatAbitrator",
  LOUNGE = "lounge",
  START = "buttonPoolExit0",
  FIELD = "field",
  WINNERPOV = "winner"
}



interface CameraConfig {
  position: Vector3;
  rotation: Vector3;
}

//Toutes les configurations pour le dplacement de ma camra
export const CAMERA_CONFIGS: Record<ZoneName, CameraConfig> = {
    [ZoneName.FIELD]: {
        position: new Vector3(1, 57.61, 25.21),
        rotation: new Vector3(
            Math.PI * 16.6 / 180,
            Math.PI * -179 / 180,
            0
        ),
    },
    [ZoneName.START]: {
        position: new Vector3(-5, 17, 3),
        rotation: new Vector3(
            Math.PI * 0 / 180,
            Math.PI * 0 / 180,
            0
        ),
    },
    [ZoneName.STANDS]: {
        position: new Vector3(0, 19, -64),
        rotation: new Vector3(
            Math.PI * -2.7 / 180,
            Math.PI * -178 / 180,
            0
        ),
    },
    [ZoneName.LOCKER_ROOM]: {
        position: new Vector3(37, 11, 58),
        rotation: new Vector3(
            Math.PI * -1 / 180,
            Math.PI * -150 / 180,
            0
        ),
    },
    [ZoneName.POOL]: {
        position: new Vector3(-21, 82, 18.5),
        rotation: new Vector3(
            Math.PI * 71 / 180,
            Math.PI * -45.5 / 180,
            0
        ),
    },
    [ZoneName.SCOREBOARD]: {
        position: new Vector3(49, 10, 18),
        rotation: new Vector3(
            Math.PI * 2.7 / 180,
            Math.PI * -153 / 180,
            0
        ),
    },
    [ZoneName.SCREEN_TV]: {
        position: new Vector3(17, 11, 43),
        rotation: new Vector3(
            Math.PI * -1.4 / 180,
            Math.PI * -101 / 180,
            0
        ),
    },

    [ZoneName.TSHIRT]: {
        position: new Vector3(27.3, 15, 24.5),
        rotation: new Vector3(
            Math.PI * 2.8 / 180,
            Math.PI * 46.6 / 180,
            0
        ),
    },

    [ZoneName.SEAT]: {
        position: new Vector3(0.1, 47, -93.7),
        rotation: new Vector3(
            Math.PI * 1.9 / 180,
            Math.PI * -178.7 / 180,
            0
        ),
    },

    [ZoneName.ARBITRATOR]: {
        position: new Vector3(0.15, 75.4, -8.3),
        rotation: new Vector3(
            Math.PI * 56.8 / 180,
            Math.PI * -179.9 / 180,
            0
        ),
    },

    [ZoneName.WINNERPOV]: {
        position: new Vector3(-38.1, 26.79, -56.93),
        rotation: new Vector3(
            Math.PI * 0.6 / 180,
            Math.PI * -270.6 / 180,
            0
        ),
    },

};
