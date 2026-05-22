package expo.modules.veepoo

import com.inuker.bluetooth.library.Code
import com.veepoo.protocol.VPOperateManager
import com.veepoo.protocol.listener.base.IBleWriteResponse
import com.veepoo.protocol.listener.data.*
import com.veepoo.protocol.model.datas.*
import com.veepoo.protocol.model.enums.EBPDetectModel
import com.veepoo.protocol.model.enums.EBloodGlucoseRiskLevel
import com.veepoo.protocol.model.enums.EBloodGlucoseStatus
import com.veepoo.protocol.shareprence.VpSpGetUtil
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.ModuleDefinitionBuilder

fun ModuleDefinitionBuilder.defineStressTest(module: VeepooSDKModule) {
  AsyncFunction("startStressTest") { promise: Promise ->
    if (!module.tryBeginRealtimeTest("stress", promise)) {
      return@AsyncFunction
    }

    module.isPressureMeasuring = true
    module.startPressureLoop(promise)
  }

  AsyncFunction("stopStressTest") { promise: Promise ->
    module.isPressureMeasuring = false
    module.endRealtimeTest("stress")
    promise.resolve(null)
  }
}
