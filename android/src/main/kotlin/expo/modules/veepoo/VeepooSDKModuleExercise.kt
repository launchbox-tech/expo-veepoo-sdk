package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.inuker.bluetooth.library.connect.response.BleWriteResponse
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.data.ISportModelOriginListener
import com.veepoo.protocol.model.datas.SportModelGPSWatchOriginHeadData
import com.veepoo.protocol.model.datas.SportModelOriginHeadData
import com.veepoo.protocol.model.datas.SportModelOriginItemData
import com.veepoo.protocol.model.datas.TimeData
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

private val SPORT_ORDINALS = arrayOf(
    "common",
    "outdoorRun", "outdoorWalk", "indoorRun", "indoorWalk", "hiking",
    "stairStepper", "outdoorCycle", "stationaryBike", "elliptical", "rowingMachine",
    "mountaineering", "swimming", "sitUps", "skiing", "jumpRope",
    "yoga", "tableTennis", "basketball", "volleyball", "football",
    "badminton", "tennis", "climbStairs", "fitness", "weightlifting",
    "diving", "boxing", "gymBall", "squatTraining", "triathlon",
    "dance", "hiit", "rockClimbing", "sports", "balls",
    "fitnessGame", "freeTime", "aerobics", "gymnastics", "floorExercise",
    "horizontalBar", "parallelBars", "trampoline", "trackAndField", "marathon",
    "pushUps", "dumbbell", "rugby", "handball", "baseballSoftball",
    "baseball", "hockey", "golf", "bowling", "billiards",
    "rowing", "sailboat", "skating", "curling", "icePuck",
    "sled", "strongWalk", "treadmill", "trailRunning", "raceWalking",
    "mountainBiking", "bmx", "orienteering", "fishing", "hunting",
    "skateboard", "rollerSkating", "parkour", "atv", "motocross",
    "climbingMachine", "spinningBike", "indoorFitness", "mixedAerobic", "crossTraining",
    "bodybuildingExercise", "groupGymnastics", "kickboxing", "strengthTraining", "steppingTraining",
    "coreTraining", "flexibilityTraining", "freeTraining", "pilates", "battleRope",
    "squareDance", "ballroomDancing", "bellyDance", "ballet", "hipHop",
    "zumba", "latinDance", "jazz", "hipHopDance", "poleDancing",
    "breakDance", "nationalDance", "modernDance", "disco", "tapDance",
    "wrestling", "martialArts", "taiChi", "muayThai", "judo",
    "taekwondo", "karate", "freeSparring", "swordsmanship", "jujitsu",
    "fencing", "beachSoccer", "beachVolleyball", "softball", "squash",
    "croquet", "cricket", "polo", "wallball", "takrawBall",
    "dodgeball", "waterPolo"
)

private fun ordinalToMode(ordinal: Int): String? =
    if (ordinal in 1 until SPORT_ORDINALS.size) SPORT_ORDINALS[ordinal] else null

private fun formatTime(t: TimeData?): String {
    if (t == null) return ""
    return String.format("%04d-%02d-%02d %02d:%02d:%02d", t.year, t.month, t.day, t.hour, t.minute, t.second)
}

fun ModuleDefinitionBuilder.defineExercise(module: VeepooSDKModule) {

    AsyncFunction("startReadExerciseData") { promise: Promise ->
        if (!module.isInitialized || module.connectedDeviceId == null) {
            promise.reject("DEVICE_NOT_CONNECTED", "Device not connected", null)
            return@AsyncFunction
        }
        val ctx = module.context
        if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportMultSportModel()) {
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support exercise history", null)
            return@AsyncFunction
        }
        val manager = VPOperateManager.getInstance() ?: run {
            promise.reject("SDK_NOT_INITIALIZED", "SDK manager is null", null)
            return@AsyncFunction
        }

        var pendingHead: SportModelOriginHeadData? = null

        manager.readSportModelOrigin(
            object : BleWriteResponse {
                override fun onResponse(code: Int) {
                    if (code == Code.REQUEST_SUCCESS) {
                        promise.resolve(null)
                    } else {
                        promise.reject("READ_FAILED", "readSportModelOrigin failed: $code", null)
                    }
                }
            },
            object : ISportModelOriginListener {
                override fun onReadOriginProgress(progress: Float) {}

                override fun onReadOriginProgressDetail(total: Int, date: String?, current: Int, sessionProgress: Int) {}

                override fun onHeadChangeListListener(head: SportModelOriginHeadData?) {
                    pendingHead = head
                }

                override fun onGPSWatchSportModeHeadChange(head: SportModelGPSWatchOriginHeadData?) {}

                override fun onItemChangeListListener(items: List<SportModelOriginItemData>?) {
                    val head = pendingHead ?: return
                    val minuteData = items?.map { item ->
                        mapOf(
                            "heartRate" to item.rate,
                            "distance" to item.distance,
                            "calories" to item.kcal,
                            "steps" to item.stepCount,
                            "sportValue" to item.sportCount,
                            "isPaused" to (item.beathPause == 1)
                        )
                    } ?: emptyList()

                    val session = mapOf(
                        "type" to ordinalToMode(head.sportType),
                        "beginTime" to formatTime(head.startTime),
                        "endTime" to formatTime(head.stopTime),
                        "totalSteps" to head.stepCount,
                        "totalDistance" to head.distance,
                        "totalCalories" to head.kcals,
                        "totalTime" to head.sportTime,
                        "averageHeartRate" to head.averRate,
                        "averagePace" to head.peisu,
                        "pauseCount" to head.pauseCount,
                        "pauseTotalTime" to head.pauseTime,
                        "minuteData" to minuteData
                    )
                    module.sendEvent(EXERCISE_SESSION_DATA, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "session" to session
                    ))
                    pendingHead = null
                }

                override fun onReadOriginComplete() {
                    module.sendEvent(READ_ORIGIN_COMPLETE, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "success" to true
                    ))
                }
            }
        )
    }
}
