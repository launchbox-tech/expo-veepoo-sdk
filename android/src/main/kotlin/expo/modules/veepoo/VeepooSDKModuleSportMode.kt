package expo.modules.veepoo

import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.data.ISportModelDataListener
import com.veepoo.protocol.model.datas.SportModelStateData
import com.veepoo.protocol.model.enums.ESportType
import com.veepoo.protocol.model.enums.ECheckWear
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder
import com.veepoo.protocol.sharepre.VpSpGetUtil

private val SPORT_MODE_ORDINALS = arrayOf(
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

private fun ordinalToSportMode(ordinal: Int): String? {
    return if (ordinal in 1 until SPORT_MODE_ORDINALS.size) SPORT_MODE_ORDINALS[ordinal] else null
}

private fun sportModeToESportType(mode: String): ESportType? {
    val idx = SPORT_MODE_ORDINALS.indexOf(mode)
    if (idx <= 0) return null
    return ESportType.values().find { it.ordinal == idx }
}

fun ModuleDefinitionBuilder.defineSportMode(module: VeepooSDKModule) {

    AsyncFunction("readSportMode") { promise: Promise ->
        val ctx = module.context
        val manager = VPOperateManager.getManagerInstance(ctx)
        if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportSportModel) {
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sport mode", null)
            return@AsyncFunction
        }
        manager.readSportModelState(
            { _, _ -> },
            object : ISportModelDataListener {
                override fun onSportStopped(sportModeType: Int) {
                    val modeName = ordinalToSportMode(sportModeType)
                    module.sendEvent(SPORT_MODE_DATA, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "mode" to modeName
                    ))
                }
                override fun onSportStateChange(data: SportModelStateData?) {
                    if (data == null) {
                        promise.reject("READ_FAILED", "readSportMode returned null", null)
                        return
                    }
                    val isActive = data.deviceStauts?.name?.contains("OPEN") == true
                    val modeName = ordinalToSportMode(data.sportModeType)
                    promise.resolve(mapOf(
                        "mode" to modeName,
                        "isActive" to isActive
                    ))
                }
            }
        )
    }

    AsyncFunction("setSportMode") { mode: String, promise: Promise ->
        val ctx = module.context
        val manager = VPOperateManager.getManagerInstance(ctx)
        if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportSportModel) {
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sport mode", null)
            return@AsyncFunction
        }
        val eSportType = sportModeToESportType(mode)
        if (eSportType == null) {
            promise.reject("INVALID_ARGUMENT", "Unknown sport mode: $mode", null)
            return@AsyncFunction
        }
        manager.startMultSportModel(
            { _, _ -> },
            object : ISportModelDataListener {
                override fun onSportStopped(sportModeType: Int) {
                    val modeName = ordinalToSportMode(sportModeType)
                    module.sendEvent(SPORT_MODE_DATA, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "mode" to modeName
                    ))
                }
                override fun onSportStateChange(data: SportModelStateData?) {
                    if (data == null) {
                        promise.reject("SET_FAILED", "setSportMode returned null", null)
                        return
                    }
                    val success = data.oprateStauts == ECheckWear.OPEN_SUCCESS
                    if (success) {
                        promise.resolve(null)
                    } else {
                        promise.reject("SET_FAILED", "setSportMode failed: ${data.oprateStauts}", null)
                    }
                }
            },
            eSportType
        )
    }

    AsyncFunction("stopSportMode") { promise: Promise ->
        val ctx = module.context
        val manager = VPOperateManager.getManagerInstance(ctx)
        if (!VpSpGetUtil.getVpSpVariInstance(ctx).isSupportSportModel) {
            promise.reject("CAPABILITY_UNSUPPORTED", "Band does not support sport mode", null)
            return@AsyncFunction
        }
        manager.stopSportModel(
            { _, _ -> },
            object : ISportModelDataListener {
                override fun onSportStopped(sportModeType: Int) {
                    val modeName = ordinalToSportMode(sportModeType)
                    module.sendEvent(SPORT_MODE_DATA, mapOf(
                        "deviceId" to (module.connectedDeviceId ?: ""),
                        "mode" to modeName
                    ))
                }
                override fun onSportStateChange(data: SportModelStateData?) {
                    if (data == null) {
                        promise.reject("STOP_FAILED", "stopSportMode returned null", null)
                        return
                    }
                    val success = data.oprateStauts == ECheckWear.CLOSE_SUCCESS
                    if (success) {
                        promise.resolve(null)
                    } else {
                        promise.reject("STOP_FAILED", "stopSportMode failed: ${data.oprateStauts}", null)
                    }
                }
            }
        )
    }
}
