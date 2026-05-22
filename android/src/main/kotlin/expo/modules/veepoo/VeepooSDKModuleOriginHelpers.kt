package expo.modules.veepoo

import com.veepoo.protocol.model.datas.*

fun buildHalfHourItems(data: OriginHalfHourData): List<Map<String, Any>> {
  val map = linkedMapOf<String, MutableMap<String, Any>>()

  fun timeKey(time: TimeData?): String? {
    return time?.let { String.format("%02d:%02d", it.hour, it.minute) }
  }

  fun entry(key: String): MutableMap<String, Any> {
    return map.getOrPut(key) { mutableMapOf("time" to key) }
  }

  data.halfHourSportDatas?.forEach { sport ->
    val key = timeKey(sport.time) ?: return@forEach
    val item = entry(key)
    item["stepValue"] = sport.stepValue
    item["calValue"] = sport.calValue
    item["disValue"] = sport.disValue
  }

  data.halfHourRateDatas?.forEach { rate ->
    val key = timeKey(rate.time) ?: return@forEach
    entry(key)["heartValue"] = rate.rateValue
  }

  data.halfHourBps?.forEach { bp ->
    val key = timeKey(bp.time) ?: return@forEach
    val item = entry(key)
    item["systolic"] = bp.highValue
    item["diastolic"] = bp.lowValue
  }

  return map.keys.sorted().map { key ->
    val item = map[key]!!
    if (!item.containsKey("sportValue")) item["sportValue"] = 0
    if (!item.containsKey("systolic")) item["systolic"] = 0
    if (!item.containsKey("diastolic")) item["diastolic"] = 0
    if (!item.containsKey("spo2Value")) item["spo2Value"] = 0
    if (!item.containsKey("tempValue")) item["tempValue"] = 0
    if (!item.containsKey("stressValue")) item["stressValue"] = 0
    item
  }
}

// 读取与同步数据
