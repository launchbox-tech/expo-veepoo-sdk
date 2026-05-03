# VeepooSDK Android API documentation

> **Offline snapshot.** Prose in this file was machine-translated from the vendor wiki snapshot to English (Google Translate via `scripts/vendor_snapshot_translate.py`). Terminology may differ slightly from the vendor’s official English wiki. For authoritative wording and API updates, use the live **[Android API wiki (English)](https://github.com/HBandSDK/Android_Ble_SDK/wiki/VeepooSDK-Android-API-Document)**. The changelog table mirrors a frozen import. Maintainer drift check: compare pins in [`vendor-manifest.json`](../../vendor-manifest.json) with `npm run vendor:check`; parity versus this bridge: [`vendor-parity-matrix.md`](vendor-parity-matrix.md).
>
> **Last manifest-aligned upstream review:** `upstreamReference.androidBleSdk.lastReviewedHeadSha` in `vendor-manifest.json` (default branch `HEAD` at time of pin).

| Version | Changes | Date |
| ------- | ------- | ---- |
| 1.0.0 | Initial SDK release | 2023.05.15 |
| 1.0.1 | K-series watch face & OTA docs | 2023.05.26 |
| 1.0.2 | Language settings APIs | 2023.05.26 |
| 1.0.3 | Contacts feature | 2023.06.25 |
| 1.0.4 | 1. New sport & language enums<br />2. 30-minute daily data adds `date`<br />3. Batch contacts, phone volume control<br />4. OTA flow clarifications | 2023.09.08 |
| 1.0.5 | OTA & watch face transfer battery notes | 2023.09.11 |
| 1.0.6 | Glucose multi-calibration read/write | 2023.09.19 |
| 1.0.7 | 1. Twitter → X<br />2. Body / blood composition docs<br />3. Blood composition toggle; uric acid / lipid units<br />4. ECG reporting API | 2023.09.27 |
| 1.0.8 | Body composition unit display | 2023.10.25 |
| 1.0.9 | Body composition API adds measurement time and duration | 2023.11.24 |
| 1.1.0 | 1. Glucose risk level<br/>2. Temperature read flag `05` | 2024.04.15 |
| 1.1.1 | 1. Personal info API weight parameter<br />2. Skin tone levels (device-dependent) | 2024.11.30 |
| 1.1.2 | Sport mode read: removed packet-position comments | 2024.12.12 |
| 1.1.3 | 1. Auto-measure read/write (`0xB3`)<br />2. Manual BP measurement reads | 2025.06.10 |
| 1.1.4 | Blood glucose stop measurement interface fix | 2025.06.16 |
| 1.1.5 | Text & image push function | 2025.10.27 |
| 1.1.6 | JH58 PPG & acceleration raw data reporting | 2025.10.31 |
| 1.1.7 | Mini-checkup (comprehensive health assessment) | 2025.11.04 |
| 1.1.8 | Device function package reporting; deprecated `onFunctionSupportDataChange` | 2025.11.19 |
| 1.1.9 | GSR (galvanic skin response) start/stop APIs | 2025.11.24 |
| 1.2.0 | ZT163 always-off-screen function | 2025.12.27 |
| 1.2.1 | Micro-Physical-Exam V2; health reminders; 4G functionality | 2026.01.09 |
| 1.2.2 | Manual measurement data — 12 types; device-supported-types list | 2026.04.08 |
| 1.2.3 | Connection confirmation (pop-up) | 2026.04.16 |
| 1.2.4 | Nordic OTA upgrade | 2026.04.17 |
| 1.2.5 | SDK import documentation | 2026.04.21 |
| 1.2.6 | Sport control (set/read/report); device rename | 2026.04.22 |
| 1.2.7 | ECG diagnosis interface | 2026.04.22 |
| 1.2.8 | App-side HRV detection | 2026.04.23 |
| 1.2.9 | QX17 IMU/GPS/HR flow control; vibration motor control | 2026.04.29 |

## General interface class

**VPOperateManager** (SDK main entrance)
Main operation categories

**Get instance**

```kotlin
VPOperateManager.getInstance()
```

Get the singleton object, the SDK interface exists in the form of a singleton

Note: **The device does not support asynchronous operations. When multiple time-consuming operations are performed at the same time, data anomalies may occur; therefore, when interacting with the device, try to avoid multiple operations at the same time**

## SDK initialization

```kotlin
init(context)
```

| Parameter name | Type | Remarks |
| ------- | ------- | ---------------------------- |
| context | Context | Configuration options ApplicactionContext |

Note: All interfaces can only be called after the SDK is initialized. During the running of the App, it only needs to be initialized once and does not need to be initialized repeatedly.

## Scan

#### Start scanning

###### API

```kotlin
startScanDevice(searchResponse)
```

When starting a Bluetooth scan, non-company devices will be filtered out. If you need to stop scanning, call stopScan to stop scanning.

Note: When Bluetooth is turned off, the scanning interface will not take effect.

###### Parameters

| Parameter name | Type | Remarks |
| -------------- | -------------- | -------------- |
| searchResponse | SearchResponse | Callback for scan results |

###### Return data

**SearchResponse**--Callback for scan results

```kotlin
/**
 * Start scanning devices
 */
fun onSearchStarted()

/**
 * Discover scanning devices
 *
 * @param device currently discovered device
 */
fun onDeviceFounded(device:SearchResult)

/**
 * Stop scanning device callback
 */
fun onSearchStopped()

/**
 * Cancel scanning device callback
 */
fun onSearchCanceled()
```

**SearchResult**--The currently discovered device

| Variable | Type | Remarks |
| ---------- | --------------- | ------------------ |
| device | BluetoothDevice | Bluetooth device (system) |
| rssi | Int | Bluetooth signal value rssi |
| scanRecord | byteArray | Scanned device broadcast data |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance()
            .startScanDevice(object : SearchResponse {
                override fun onSearchStarted() {

                }

                override fun onDeviceFounded(p0: SearchResult) {
                    
                }

                override fun onSearchStopped() {
                    
                }

                override fun onSearchCanceled() {
                }
            })
```

#### End scan

###### API

```kotlin
stopScanDevice()
```

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().stopScanDevice()
```

## Connect

#### Connect device

```kotlin
connectDevice(mac,connectResponse,bleNotifyResponse)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ---------------- | --------------------------------------------------------------- |
| mac | String | The address of the device that needs to be connected |
| connectResponse | IConnectResponse | The callback of the connection status, first returns the connection status, and after the connection is successful, the callback of the Bluetooth communication status will be returned |
| bleNotifyResponse | INotifyResponse | Bluetooth communication status callback, this callback is called after connectResponse |

###### Return data

**IConnectResponse** -- callback for connection status

```kotlin
/**
 * Return of connection status
 *
 * @param code connection status, only when the value is Code.REQUEST_SUCCESS, the connection is successful
 * @param profile Bluetooth properties of the device
 * @param isOadModel The device contains two modes [normal mode/firmware upgrade mode]. In most cases, it is the normal mode. Only when the device fails to upgrade the firmware, it will enter the firmware upgrade mode.
 */
fun connectState(code:Int, profile:BleGattProfile, isOadModel:boolean);
```

**INotifyResponse** - Set the callback for data monitoring

```kotlin
/**
 * Set the return of data monitoring
 *
 * @param state Only succeeds if the value is equal to Code.REQUEST_SUCCESS
 */
fun notifyState(state:Int);
```

#### Verify password operation

###### API

```kotlin
confirmDevicePwd(bleWriteResponse,pwdDataListener,deviceFuctionDataListener，socialMsgDataListener，customSettingDataListener，pwd，mModelIs24)  
```

```kotlin
confirmDevicePwd(bleWriteResponse,pwdDataListener,deviceFuctionDataListener，socialMsgDataListener，customSettingDataListener，pwd，mModelIs24,deviceTimeSetting)
```

Note: **The first step to be performed after the connection is successful. Other Bluetooth operations can only be performed after [Connection is successful] and [Bluetooth communication is possible]**

###### Parameters

| Parameter name | Type | Remarks |
| ------------------------------ | -------------------------- | --------------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | code Returning Code.REQUEST_SUCCESS indicates that the command is sent to the device successfully, but data may not be returned if the command is sent successfully. A successful return can only indicate that the device has received the command. If the device cannot process the command, there may be no data returned. This interface is used by developers to find problems |
| pwdDataListener | IPwdDataListener | Password operation data return monitoring, the data returned here includes: device number, device release version number, device test version number, drinking data status, turning the wrist to turn on the screen status, finding mobile phone function status, wear detection function status |
| deviceFuctionDataListener | IDeviceFuctionDataListener | Return monitoring of the functions contained in the device. The data returned here includes: Function status of each device [supported or not]: blood pressure, drinking, sedentary, high heart rate reminder, WeChat exercise, shake-shake photo, fatigue, blood oxygen |
| socialMsgDataListener | ISocialMsgDataListener | Return monitoring of phone calls, text messages, and social software messages. The data returned here includes: whether to support receiving reminders from social software, and whether to turn on reminders for phone calls, text messages, and social software |
| customSettingDataListener | ICustomSettingDataListener | Monitoring of personalized setting operations |
| pwd | String | The password length is 4, and the initial value is 0000. Before passing in the password, please make sure it is a 4-digit number |
| mModelIs24 | boolean | Time format, if you choose to display the 24-hour format, pass in true, if you choose the 12-hour format, pass in false |
| deviceTimeSetting | DeviceTimeSetting | The default is the mobile phone system time, the time can be customized, accurate to the second |

###### Data return

**IPwdDataListener** -- Data return monitoring for password operations

```kotlin
/**
 * Returns data for the password operation
 * @param pwdData data for the password operation
 */
fun onPwdDataChange(pwdData:PwdData);
```

**PwdData** -- Data for password operations

| Variable | Type | Remarks |
| -------------------------- | --------------- | --------------------------------------------------------------- |
| mStatus | EPwdStatus | Returns the status of the current password operation |
| pwd | String | Current password |
| deviceNumber | Int | device number |
| deviceVersion | String | The official version of the device, the official version number is only displayed on the APP |
| deviceTestVersion | String | Device test version, the test version number will be used for firmware upgrade, the firmware upgrade requires the device number and test version number |
| isHaveDrinkData | Boolean | Whether there is drinking data |
| isOpenNightTurnWriste | EFunctionStatus | Raise your wrist to turn on the screen at night, supported/unsupported/on/off/unknown |
| findPhoneFunction | EFunctionStatus | Find phone functions, supported/unsupported/on/off/unknown |
| wearDetectFunction | EFunctionStatus | Wear detection function, supported/unsupported/on/off/unknown |

**EFunctionStatus** -- function status

| Variables | Remarks |
| ------------- | ------ |
| UNSUPPORT | Not supported |
| SUPPORT | Support |
| SUPPORT_OPEN | Open |
| SUPPORT_CLOSE | Close |
| UNKONW | Unknown |

**IDeviceFuctionDataListener** -- Device function status monitoring, monitoring once, may be called back twice, depending on the device

```kotlin
/**
 * Return device function status
 *
 * @param functionSupport
 */
fun onFunctionSupportDataChange(functionSupport:FunctionDeviceSupportData)
```

**FunctionDeviceSupportData** -- Function status of each device [whether supported]

| Variable | Type | Remarks |
| -------------------------- | --------------- | -------------------------- |
| Bp | EFunctionStatus | Blood pressure functional status |
| Drink | EFunctionStatus | Drinking function status |
| Longseat | EFunctionStatus | Sedentary function status |
| HeartWaring | EFunctionStatus | Heart rate warning function status |
| WeChatSport | EFunctionStatus | WeChat sports function status |
| Camera | EFunctionStatus | Camera function status |
| Fatigue | EFunctionStatus | Fatigue function status |
| SpoH | EFunctionStatus | Blood oxygen function status |
| SpoHAdjuster | EFunctionStatus | Blood oxygen calibration function status |
| SpoHBreathBreak | EFunctionStatus | Blood oxygen apnea reminder function status |
| Woman | EFunctionStatus | Female function status |
| Alarm2 | EFunctionStatus | New alarm function status |
| newCalcSport | EFunctionStatus | New features for step counting |
| CountDown | EFunctionStatus | Countdown function status |
| AngioAdjuster | EFunctionStatus | Dynamic blood pressure adjustment function status |
| SreenLight | EFunctionStatus | Screen brightness adjustment function status |
| HeartDetect | EFunctionStatus | Heart rate detection function status, default is |
| SportModel | EFunctionStatus | Sport mode function status |
| NightTurnSetting | EFunctionStatus | Turn your wrist to brighten the screen and set the function status |
| hidFuction | EFunctionStatus | HID function status |
| screenStyleFunction | EFunctionStatus | screen style function |
| beathFunction | EFunctionStatus | Breathing rate function |
| hrvFunction | EFunctionStatus | HRV function status |
| weatherFunction | EFunctionStatus | Weather function status |
| screenLightTime | EFunctionStatus | Bright screen duration function status |
| precisionSleep | EFunctionStatus | Precision sleep function status |
| resetData | EFunctionStatus | Reset device/data function status |
| ecg | EFunctionStatus | ECG function status |
| multSportModel | EFunctionStatus | Multi-sport function status |
| lowPower | EFunctionStatus | Low power function status |
| findDeviceByPhone | EFunctionStatus | Mobile phone find device function status |
| agps | EFunctionStatus | AGPS function status |
| temperatureFunction | EFunctionStatus | Body temperature function status |
| textAlarm | EFunctionStatus | Text alarm function status |
| bloodGlucose | EFunctionStatus | blood glucose function status |
| bloodGlucoseAdjusting | EFunctionStatus | Blood Glucose Calibration Function |
| sleepTag | Int | sleep flag |
| musicStyle | Int | Music band information 0x99, value is 1 |
| WathcDay | Int | The maximum number of days the watch can be saved |
| contactMsgLength | Int | Contact message length |
| allMsgLength | Int | Maximum number of message reminder packets |
| sportmodelday | Int | Maximum number of days in sport mode |
| screenstyle | Int | Screen style selection |
| weatherStyle | Int | Type of weather |
| originProtcolVersion | Int | The protocol version of the original data |
| bitDataTranType | Int | Large block data transfer type |
| watchUiServerCount | Int | Number of watch face markets |
| watchUiCoustomCount | Int | Number of custom watch faces |
| temperatureType | Int | temperature type |
| cpuType | Int | cpu type |
| ecgType | Int | ecg type |

**ISocialMsgDataListener** --Message notification switch-like callback listening. For details, please return to [[Message Notification](#Message Notification)]

**ICustomSettingDataListener** -- Personalized setting callback listening, please view [[Personalized Settings](#Personalized Settings)] for details

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance()
    .confirmDevicePwd({
        //Connection failed
        if (it != Code.REQUEST_SUCCESS) {
            Log.e("TAG", "confirmDevicePwd fail:check fail")
        }
    },
        {
            val message =
                "PwdData:$it"
            if (it.getmStatus() != EPwdStatus.CHECK_FAIL) {
               Log.e("TAG", "confirmDevicePwd fail:check fail")
            } else {
                Log.e("TAG", "confirmDevicePwd fail:check fail")
                VPOperateManager.getInstance()
                    .disconnectWatch { }
            }
        },
        {
            val message =
                "FunctionSupport:$it"
            Log.e("TAG", message)
        }, object : ISocialMsgDataListener {
            override fun onSocialMsgSupportDataChange(p0: FunctionSocailMsgData?) {
                val message =
                    "FunctionSocailMsgData:${p0.toString()}"
                Log.e("TAG", message)
            }

            override fun onSocialMsgSupportDataChange2(p0: FunctionSocailMsgData?) {
                val message =
                    "FunctionSocailMsgData2:${p0.toString()}"
                Log.e("TAG", message)
            }

        }, customSettingDataListener, "0000", false
    )
```

## Disconnect

###### API

```
disconnectWatch(bleWriteResponse)
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | ----------------- | --------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().disconnectWatch {

}
```

## Synchronize personal information

Height and weight settings will affect calorie calculation results

###### API

```kotlin
syncPersonInfo(bleWriteResponse, personInfoDataListener, personInfoData)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ----------------------- | ----------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| personInfoDataListener | IPersonInfoDataListener | Callback for personal information operations, the returned data only contains the status of the operation |
| personInfoData | PersonInfoData | personal information data |

**PersonInfoData** -- Personal information data

| Parameter name | Type | Remarks |
| -------- | ---- | -------------------- |
| ESex | ESex | Gender |
| height | Int | height |
| weight | Int | weight |
| age | Int | age |
| stepAim | Int | Target number of steps |
| sleepAim | Int | Target sleep time (minutes) |

###### Return data

**IPersonInfoDataListener** -- callback for personal information operations

```kotlin
/**
 * Return the status of the operation
 *
 * @param EOprateStauts: OPRATE_SUCCESS: Operation successful, OPRATE_FAIL: Operation failed, UNKNOW: Unknown
 */
fun OnPersoninfoDataChange(eOprateStauts:EOprateStauts)
```

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance().syncPersonInfo(writeResponse,
    { EOprateStauts ->
        val message = "syncPersonInfo:\n$EOprateStauts"

    }, PersonInfoData(ESex.MAN, 178, 60, 20, 8000)
)
```

## Language setting function

###### API

```kotlin
settingDeviceLanguage(bleWriteResponse, languageDataListener, language)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------------------------- | -------------------------- | ------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| languageDataListener | ILanguageDataListener | Set language callback |
| language | ELanguage | Types of languages |

**ELanguage** Language type enumeration

| Variables | Remarks |
| ------------------ | ---------- |
| CHINA | Chinese Simplified |
| CHINA_TRADITIONAL | Chinese Traditional |
| ENGLISH | English |
| JAPAN | Japanese |
| KOREA | Korean |
| DEUTSCH | German |
| RUSSIA | Russian |
| SPANISH | Spanish |
| ITALIA | ITALIAN |
| FRENCH | FRENCH |
| VIETNAM | Vietnamese |
| PORTUGUESA | PORTUGUESE |
| THAI | Thai |
| POLISH | Polish |
| SWEDISH | Swedish |
| TURKISH | Turkish |
| DUTCH | Dutch |
| CZECH | Czech |
| ARABIC | Arabic |
| HUNGARY | Hungarian |
| GREEK | Greek |
| ROMANIAN | Romania |
| SLOVAK | Slovak |
| INDONESIAN | Indonesian |
| BRAZIL_PORTUGAL | BRAZIL PORTUGAL |
| CROATIAN | Croatian |
| LITHUANIAN | Lithuanian |
| UKRAINE | Ukraine |
| HINDI | Hindi |
| HEBREW | Hebrew |
| DANISH | Danish |
| PERSIAN | Persian |
| FINNISH | Finnish |
| MALAY | Malay |
| UNKONW | Unknown |

###### Return data

**ILanguageDataListener** --Set language callback

```kotlin
/**
 * Returns the status of the language
 *
 * @param languageData language data
 */
fun onLanguageDataChange( languageData:LanguageData)
```

**languageData** -- language data

| Variable name | Type | Remarks |
| -------- | ------------- | ------------------ |
| stauts | EOprateStauts | Status of the operation |
| language | ELanguage | Get the language of the current device |

**Note:**

[System language]&&[Prompt language for female functions] are not consistent across devices. The female function supports multiple languages, while the system language is only Chinese and English. Therefore, the following normal situation may occur ([System Language] only supports devices with Chinese and English settings, and if you set Japanese, the device will prompt that the Japanese setting is successful, and [System Language] is still displayed as English, but [Female Function Prompt Language] is Japanese)

## Read the current step count

Read the current step count. The step count function involves the calculation of distance and calories, and the calculation of these two is related to the height. Therefore, before reading the step count, you should first call [[Sync Personal Information] (#Sync Personal Information)] to set personal information.

**Note**: Refers to the device's step count, distance and calories. The data returned by this interface is real-time and is different from the number of steps in daily data. The number of steps in daily data is a summary of every 5 minutes, and there is a lag. If the application layer needs to obtain the number of steps on the device synchronously, it needs to call this interface at a fixed frequency to obtain the data.

###### API

```kotlin
readSportStep(bleWriteResponse, sportDataListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | ---------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| sportDataListener | ISportDataListener | Read sports data listening |

###### Return data

**ISportDataListener** -- Read sports data listening

```kotlin
/**
 * Return step counting data
 *
 * @param sportData current sports data
 */
fun onSportDataChange(sportData:SportData)
```

**SportData** -- Current sports data

| Variable | Type | Remarks |
| ---------------------------------- | ------ | --------------------------------------------------------------- |
| step | Int | Current step count |
| dis | Double | Current distance km |
| kcal | Double | Current calories kcal |
| calcType | Int | Calculation method, 0 represents the traditional algorithm, 1 represents the new algorithm formula, 2 represents the table of motion mode tables |
| triaxialX, triaxialY, triaxialZ | Int | Triaxial position |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().readSportStep({
    if (it != Code.REQUEST_SUCCESS) {
        Log.e("Test", "write cmd failed")
    }
}) { sportData ->  }
```

## Read device power

1. Special attention⚠️: The dial transmission and OTA processes will consume a lot of power, and the power limit needs to be increased. When the power of the watch is very low, if you initiate dial transmission, the watch may shut down due to low power during the transmission process. After recharging, the dial will turn black. It is recommended to read the current battery level of the watch before each transmission. If the battery status is low, transmission is prohibited.

The OTA process is long, and it is recommended that the battery power be above 30% before the upgrade is allowed.

###### Prerequisites

Device is connected

###### API

```kotlin
readBattery(bleWriteResponse, batteryDataListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------- | ------------------ | --------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| batteryDataListener | IBatteryDataListener | Read battery monitoring |

###### Return data

**IBatteryDataListener** -- Read power monitoring

```kotlin
/**
 * Return battery power data
 */
fun onDataChange(batteryData:BatteryData)
```

**BatteryData** -- battery data

| Parameter name | Type | Remarks |
| -------------- | ------- | --------------------------------------------------------------- |
| batteryLevel | Int | The current battery level of the device [1-4], 4 means full power |
| batteryPercent | Int | Battery percentage [1-100] |
| powerModel | Int | Power mode: 0x00 normal, 0x01 charging state, 0x02 low voltage state, 0x03 full state |
| state | Int | Sleep state: 0 awake 1 sleeping |
| bat | Byte | BAT current battery level |
| isLowBattery | Boolean | Whether the battery is low: 0x01 means normal, 0x02 means low battery |
| isPercent | Boolean | Whether the battery percentage can be displayed, true means the battery is expressed in batteryPercent, false means the battery is displayed in batteryLevel |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().readBattery({
    if (it != Code.REQUEST_SUCCESS) {
        
    }
}, {
    
})
```

## Read daily data function

#### Read health data (sleep data + 5 minutes of raw data)

###### API

If the data stored in the watch is for 3 days and all health data is read, the reading order is [sleep data (today-yesterday-the day before yesterday)]-[5 minutes of raw data (today-yesterday-the day before yesterday)], and the position of the day and the number of items can be customized for the raw data. For example, if [yesterday, 150] is passed in, then the reading order is [sleep data (today-yesterday-the day before yesterday)]-[5-minute raw data (yesterday (150)-the day before yesterday)]

```
readAllHealthDataBySettingOrigin(allHealthDataListener,day,position,watchday)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------------------------- | -------------------------- | --------------------------------------------------------------- |
| allHealthDataListener | IAllHealthDataListener | Callback for reading all data, returning reading progress and health data: sleep data, pedometer data [5 minutes, 30 minutes], heart rate data [5 minutes, 30 minutes], blood pressure data [5 minutes, 30 minutes] |
| watchday | Int | The data capacity that the watch can store (unit: day), depends on the device. After verifying the password, in the IDeviceFuctionDataListener callback data FunctionDeviceSupportData, the return value can be obtained through getWatchday() |
| day | Int | Which day to read, 0 means today, 1 means yesterday, 2 means the day before yesterday, and so on.        |
| position | Int | The position of the number of items to be read, up to 288 items per day (every 5 minutes). You can define the position of the number of items to be read. The value of this parameter must be greater than or equal to 1 |

###### Return data

IAllHealthDataListener

```kotlin
/**
 * Reading progress callback
 *
 * @param progress progress value, range [0-1]
 */
void onProgress(float progress);

/**
 * Return sleep data
 *
 * @param day indicates the day's data being read. 0: today, 1: yesterday, 2: the day before yesterday.
 * @param sleepData sleep data
 */
void onSleepDataChange(String day, SleepData sleepData);

/**
 * Read the callback for the end of sleep
 */
void onReadSleepComplete();

/**
 * Callback for reading 5 minutes of raw data
 *
 * @param originData 5 minutes of original data
 */
void onOringinFiveMinuteDataChange(OriginData originData);

/**
 * Callback of 30 minutes of raw data, from 5 minutes of raw data, only data processing is performed internally
 *
 * @param originHalfHourData
 */
void onOringinHalfHourDataChange(OriginHalfHourData originHalfHourData);

/**
 * End of reading all data
 */
void onReadOriginComplete();
```

**SleepData** -- sleep data

| Variable | Type | Remarks |
| ------------- | -------- | --------------------------------------------------------------- |
| Date | String | Sleep date |
| cali_flag | Int | Sleep scaling value, currently this value is of no use |
| sleepQuality | Int | sleep quality |
| wakeCount | Int | The number of times you wake up during sleep |
| deepSleepTime | Int | Deep sleep duration (unit min) |
| lowSleepTime | Int | Light sleep duration (unit min) |
| allSleepTime | Int | Total sleep time |
| sleepLine | String | Sleep curve is mainly used for a more concrete UI to display sleep status. If your sleep interface has no special requirements for the UI, you can ignore it. The sleep curve is divided into normal sleep and precision sleep. Normal sleep is a set of strings composed of 0, 1, 2. Each character represents a duration of 5 minutes, where 0 means light sleep, 1 means deep sleep, and 2 means wake up, such as "2011" 12", with a length of 6, indicating a total of 30 minutes of sleep stages, with 5 minutes of awakening at the beginning and end, 5 minutes of light sleep in the middle, and 15 minutes of deep sleep; if it is precision sleep, the sleep curve is a set of strings composed of 0,1,2,3,4, each character represents a duration of 1 minute, where 0 means deep sleep, 1 means light sleep, 2 means rapid eye movement, 3 means insomnia, and 4 means awakening |
| sleepDown | TimeData | Sleep time |
| sleepUp | TimeData | Wake up time |

**OriginData** -- 5 minutes of original data

| Variable | Type | Remarks |
| --------------- | -------- | --------------------------------------------------------------- |
| date | String | sleep date |
| allPackage | Int | The total number of packages of data for the day |
| packageNumber | Int | The position of this data on the current day |
| mTime | TimeData | Precise time |
| rateValue | Int | Heart rate value, range [30-200] |
| sportValue | Int | Exercise value [0-65536], the larger the value, the more intense the exercise. It is divided into 5 levels, namely [0-220], [201-700], [701-1400], [1401-3200], [3201-65535] |
| stepValue | Int | step count value |
| highValue | Int | High voltage value, range [60-300] |
| lowValue | Int | Low voltage value, range [20-200] |
| wear | Int | wear flag |
| tempOne | Int | Reserved value |
| tempTwo | Int | Reserved value |
| calValue | Double | Calories consumed |
| disValue | Double | Total distance traveled km |
| calcType | Int | Calculation method: 0 represents the traditional algorithm, 1 represents the new algorithm formula, 2 represents the sports mode device |
| drankPartOne | String | Reserved |
| baseTemperature | Double | Body surface temperature, the value is valid when VpSpGetUtil.isSupportReadTempture && VpSpGetUtil.getTemperatureType == |
| temperature | Double | Body temperature, the value is valid when VpSpGetUtil.isSupportReadTempture && VpSpGetUtil.getTemperatureType == |

**OriginHalfHourData** -- 30 minutes of data

| Variable | Type | Remarks |
| ------------------ | ----------------------- | ----------------------------------------------- |
| halfHourRateDatas | List<HalfHourRateData> | 30 minutes of heart rate data |
| halfHourBps | List<HalfHourBpData> | 30 minutes of blood pressure data |
| halfHourSportDatas | List<HalfHourSportData> | 30 minutes of sports data |
| allStep | Int | The total number of steps in the currently read raw data within 30 minutes (5*6) |
| date | String | Date ("yyyy-MM-dd HH:mm:ss) |

**HalfHourRateData** -- 30 minutes of heart rate data

| Variable | Type | Remarks |
| --------- | -------- | --------------------------------------------------------------- |
| date | String | Belonging date |
| time | TimeData | The specific time can be accurate to the minute. For example, 10:00 represents the average value of the interval from 10:00 to 10:30 |
| rateValue | Int | Heart rate value |
| ecgCount | Int | Total number of ecg |
| ppgCount | Int | Total ppg |

**HalfHourBpData**--30 minutes blood pressure data

| Variable | Type | Remarks |
| --------- | -------- | --------------------------------------------------------------- |
| date | String | Belonging date |
| time | TimeData | The specific time can be accurate to the minute. For example, 10:00 represents the average value of the interval from 10:00 to 10:30 |
| highValue | Int | Highest value of blood pressure |
| lowValue | Int | The lowest value of blood pressure |

**HalfHourSportData** -- 30 minutes of sports data| Variable | Type | Remarks |
| ---------- | -------- | --------------------------------------------------------------- |
| date | String | Belonging date |
| time | TimeData | The specific time can be accurate to the minute. For example, 10:00 represents the average value of the interval from 10:00 to 10:30 |
| sportValue | Int | Total amount of exercise in 30 minutes |
| disValue | Double | Total distance in 30 minutes |
| calValue | Double | Total calories in 30 minutes |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().readAllHealthData(object :IAllHealthDataListener{
    override fun onProgress(progress: Float) {
  
    }

    override fun onSleepDataChange(day: String?, sleepData: SleepData?) {

    }

    override fun onReadSleepComplete() {

    }

    override fun onOringinFiveMinuteDataChange(originData: OriginData?) {

    }

    override fun onOringinHalfHourDataChange(originHalfHourData: OriginHalfHourData?) {

    }

    override fun onReadOriginComplete() {

    }

},3)
```

#### Read daily data (5 minutes of raw data)

###### API

If the watch stores data for 3 days, read the original data, one piece every 5 minutes. The data includes step count, heart rate, blood pressure, and amount of exercise. The reading order is today-yesterday-the day before yesterday. Theoretically, there are 288 pieces of data in one day.

```kotlin
readOriginData(bleWriteResponse, originDataListener, watchday)
```

Read the original data. This method can customize which day to read and which item of the day to start reading. Whether to read only the current day.

```
readOriginDataBySetting(bleWriteResponse, originDataListener,readOriginSetting)
```

Read the original data. This method can customize the day to be read and the number of items to be read from that day to avoid repeated reading. For example, if [yesterday, 150] is set, the reading order is [yesterday {150} - end of yesterday - day before yesterday]

```kotlin
readOriginDataFromDay(bleWriteResponse, originDataListener, day, position, watchday)
```

Read the raw data of a single day. This method can customize which day to read and which item of the day to start reading, and only read the current day. For example, if [yesterday, 150] is set, then the reading order is [yesterday{150}-end of yesterday]

```kotlin
readOriginDataSingleDay(bleWriteResponse, originDataListener, day, position, watchday)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| originDataListener | IOriginDataListener/IOriginData3Listener | Callback of original data, the returned data includes step counting, heart rate, blood pressure, and amount of exercise |
| watchday | Int | The data capacity that the watch can store (unit: day) |
| day | Int | Read the position, 0 means today, 1 means yesterday, 2 means the day before yesterday, and so on. The reading order is today-yesterday-the day before yesterday |
| position | Int | The position of the number of items to be read. This value must be greater than or equal to 1 |
| readOriginSetting | ReadOriginSetting | Read the settings of the original data |

Note: **When reading daily data, you need to judge the device protocol version. When the device protocol version is 3 or 5, you need to pass in IOriginData3Listener. In other cases, use IOriginDataListener**

The judgment conditions are as follows:

```kotlin
val originProtocolVersion = VpSpGetUtil.getVpSpVariInstance(mContext).getOriginProtocolVersion()
if(originProtocolVersion==3 || originProtocolVersion == 5){
    //Read daily data and use IOriginData3Listener for data monitoring
}else{
    //Read daily data and use IOriginDataListener for data monitoring
}
```

**ReadOriginSetting** -- Read the settings of the original data

| Parameter name | Type | Remarks |
| -------------- | ------- | --------------------------------------------------------------- |
| day | Int | Read the position, 0 means today, 1 means yesterday, 2 means the day before yesterday, and so on. The reading order is today-yesterday-the day before yesterday |
| position | Int | The position of the number of items to be read. This value must be greater than or equal to 1 |
| onlyReadOneDay | Boolean | true means reading only today, false means reading sequentially |
| watchday | Int | Number of days stored by the watch |

###### Return data

**IOriginDataListener** -- daily data return monitoring

```kotlin
/**
 * Return 5 minutes of raw data
 *
 * @param originData 5-minute original data
 */
fun onOringinFiveMinuteDataChange(originData:OriginData)

/**
 * Returns 30 minutes of raw data. The data comes from 5 minutes of raw data, but is returned after internal processing.
 *
 * @param originHalfHourData 30-minute raw data
 */
fun onOringinHalfHourDataChange(originHalfHourData:OriginHalfHourData )

/***
 * Return the reading details. The location of this package needs to be remembered. The next time you read data, pass in the location of this package to avoid repeated reading.
 *
 * @param day The flag of the data in the watch [0=today, 1=yesterday, 2=the day before yesterday]
 * @param date The date of the data, in the format of yyyy-mm-dd
 * @param allPackage The total number of packages of data on the day
 * @param currentPackage The location of this package
 */
fun onReadOriginProgressDetail(day: Int, date: String?, allPackage: Int, currentPackage: Int)

/**
 * Return the progress of reading
 *
 * @param progress progress value, range [0-1]
 */
fun onReadOriginProgress(progress:Float)

/**
 * End of reading
 */
fun onReadOriginComplete();
```

**IOriginData3Listener** -- daily data return monitoring (inherited from IOriginDataListener)

```kotlin
/**
 * This interface will call back after the day's data reading is completed. (One OriginData3 data represents a five-minute raw data, and a maximum of 24 hours * 60 minutes / 5 minutes = 288 pieces of five-minute raw data in a day)
 * For example, reading three days of raw data will return the five-minute raw data list of today - yesterday - the day before yesterday.
 * Specifically, it depends on how many days of raw data have been read. How many days will the interface be called?
 *
 * @param originDataList returns a list of 5-minute data. The heart rate value is an array, and its corresponding field is getPpgs(), not getRateValue()
 */
fun onOriginFiveMinuteListDataChange(originDataList:List<OriginData3>)


/**
 * When the raw data reading of the day is completed, the five-minute raw data list will be calculated to produce a 30-minute data list.
 *
 * @param originHalfHourDataList returns an object of 30 minutes of data
 */
fun onOriginHalfHourDataChange(originHalfHourDataList:OriginHalfHourData)

/**
 * After reading the original data of the day, the HRV data list of the day is generated.
 *
 * @param originHrvDataList returns a list of hrv data
 */
fun onOriginHRVOriginListDataChange(originHrvDataList:List<HRVOriginData>)

/**
 * After reading the original data of the day, the blood oxygen data list of the day is generated.
 *
 * @param originSpo2hDataList returns a list of blood oxygen data
 */
fun onOriginSpo2OriginListDataChange(originSpo2hDataList:List<Spo2hOriginData>)
```

**OriginData3** -- 5 minutes of daily data (inherited from OriginData, with a little more data returned based on the original)

| Variable | Type | Remarks |
| -------------- | -------------- | -------------------- |
| gesture | IntArray | Wearing gesture type |
| ppgs | IntArray | 5-minute pulse rate value |
| ecgs | IntArray | 5-minute heart rate value |
| resRates | IntArray | 5-minute respiratory rate value |
| sleepStates | IntArray | 5-minute sleep state value |
| oxygens | IntArray | 5-minute blood oxygen value |
| apneaResults | IntArray | Apnea count array |
| hypoxiaTimes | IntArray | Hypoxia time array |
| cardiacLoads | IntArray | cardiac load array |
| isHypoxias | IntArray | Apnea result array |
| corrects | IntArray | Blood oxygen correction value string array |
| bloodGlucose | Int | blood glucose level |
| bloodComponent | BloodComponent | blood component |
| | | |

**BloodComponent** --blood component

| Variable | Type | Remarks |
| -------- | ----- | --------------------------------------------------------------- |
| uricAcid | Float | Uric acid value: unit μmol/L, value range [90.0, 1000.0], reporting value range [900, 10000] |
| tCHO | Float | Total cholesterol: unit mmol/L, value range [0.01, 100.00], reporting value range [1, 10000] |
| tAG | Float | Triglyceride: unit mmol/L, value range [0.01, 100.00] |
| hDL | Float | High-density lipoprotein: unit mmol/L, value range [0.01, 100.00] |
| lDL | Float | Low-density lipoprotein: unit mmol/L, value range [0.01, 100.00] |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().readOriginData({
                                              
},object :IOriginDataListener{
    override fun onReadOriginProgressDetail(
        day: Int,
        date: String?,
        allPackage: Int,
        currentPackage: Int
    ) {
    }

    override fun onReadOriginProgress(progress: Float) {
    }

    override fun onReadOriginComplete() {
    }

    override fun onOringinFiveMinuteDataChange(originData: OriginData?) {
    }

    override fun onOringinHalfHourDataChange(originHalfHourData: OriginHalfHourData?) {
    }

},3)
```

## Personalization settings

#### Read personalized settings

Read the personalized settings, which include the function of metric and imperial systems, the switch status of metric and British systems, the status of time format, the switch status of automatic heart rate detection, the switch status of automatic blood pressure detection, etc.

```kotlin
readCustomSetting(bleWriteResponse,customSettingDataListener)
```

###### Parameters

| Parameter name | Type | Remarks |
|--------------------------|----------------------------------|---------------------------------------------------|
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| customSettingDataListener | ICustomSettingDataListener | Monitoring of personalized setting operations, returning personalized setting data |

###### Return data

ICustomSettingDataListener

```kotlin
/**
 * Return personalized settings data
 *
 * @param customSettingData Personalized setting data
 */
fun OnSettingDataChange(customSettingData: CustomSettingData?)
```

**CustomSettingData**

| Variable | Type | Remarks |
| ------------------------ | ----------------- | --------------------------------------------------------------- |
| status | ECustomStatus | Get the status of the operation |
| is24Hour | boolean | Whether the time format is 24 hours |
| metricSystem | EFunctionStatus | Metric and imperial systems: [SUPPORT_OPEN indicates metric system, SUPPORT_CLOSE indicates imperial system, UNSOUPRT indicates not supported] |
| autoHeartDetect | EFunctionStatus | Automatic heart rate measurement |
| autoBpDetect | EFunctionStatus | Blood pressure automatic detection |
| sportOverRemain | EFunctionStatus | Excessive exercise reminder |
| voiceBpHeart | EFunctionStatus | Blood pressure/heart rate broadcast |
| findPhoneUi | EFunctionStatus | Control the search phone UI |
| secondsWatch | EFunctionStatus | Stopwatch |
| lowSpo2hRemain | EFunctionStatus | Low oxygen alarm |
| skin | EFunctionStatus | skin color function |
| autoHrv | EFunctionStatus | HRV automatic detection |
| autoIncall | EFunctionStatus | Automatically answer incoming calls |
| disconnectRemind | EFunctionStatus | Disconnect Reminder |
| SOS | EFunctionStatus | Help |
| ppg | EFunctionStatus | ppg function: automatic pulse rate monitoring --> scientific sleep --> ppg |
| musicControl | EFunctionStatus | music control |
| longClickLockScreen | EFunctionStatus | Long press lock screen |
| messageScreenLight | EFunctionStatus | message light screen function |
| autoTemperatureDetect | EFunctionStatus | Automatic body temperature detection |
| temperatureUnit | ETemperatureUnit | Body temperature unit setting |
| ecgAlwaysOpen | EFunctionStatus | ecgAlwaysOpen |
| bloodGlucoseDetection | EFunctionStatus | Blood Glucose Detection |
| METDetect | EFunctionStatus | METDetect |
| stressDetect | EFunctionStatus | Stress Detection |
| bloodGlucoseUnit | EBloodGlucoseUnit | Blood Glucose Unit |
| skinLevel | Int | Skin tone level |
| bloodComponentDetect | EFunctionStatus | Blood component switch |
| uricAcidUnit | EUricAcidUnit | Uric acid unit |
| bloodFatUnit | EBloodFatUnit | blood lipid unit |

**EBloodGlucoseUnit**

| Parameter name | Remarks |
| ------ | -------------------------- |
| NONE | No unit, indicating that unit setting is not supported |
| mmol_L | mmol/L |
| mg_dl | mg/dl |

**EUricAcidUnit**

| Parameter name | Remarks |
| ------ | -------------------------- |
| NONE | No unit, indicating that unit setting is not supported |
| umol_L | umol/L |
| mg_dl | mg/dl |

**EBloodFatUnit**

| Parameter name | Remarks |
| ------ | -------------------------- |
| NONE | No unit, indicating that unit setting is not supported |
| mmol_L | mmol/L |
| mg_dl | mg/dl |

**ETemperatureUnit**

| Parameter name | Remarks |
| ---------- | -------------------------- |
| NONE | No unit, indicating that unit setting is not supported |
| CELSIUS | Celsius |
| FAHRENHEIT | Fahrenheit |

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance().readCustomSetting({

},object :ICustomSettingDataListener{
    override fun OnSettingDataChange(customSettingData: CustomSettingData?) {

    }

})
```

#### Modify personalization settings

Modify the personalized settings. The personalized settings include the function of metric and imperial systems, the switch status of metric and British systems, the status of time format, the switch status of automatic heart rate detection, the switch status of automatic blood pressure detection, etc.

```kotlin
changeCustomSetting(bleWriteResponse, customSettingDataListener, customSetting)
```

###### Parameters

| Parameter name | Type | Remarks |
|--------------------------|----------------------------------|---------------------------------------------------|
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| customSettingDataListener | ICustomSettingDataListener | Monitoring of personalized setting operations, returning personalized setting data |
| customSetting | CustomSetting | Personalized setting data |

**CustomSetting**

| Parameter name | Type | Remarks |
| --------------------------------- | ----------------- | --------------------------------------------------------------- |
| isHaveMetricSystem | boolean | Set the function status of metric and imperial systems. Return true to indicate that this function is available and metric and imperial systems can be set; return false to indicate that there is no such function and metric and imperial systems cannot be set |
| isMetricSystem | boolean | Set the value of metric and imperial systems, return true to indicate metric system, return false to indicate imperial system, the device language is set to [English or Traditional] to reflect the imperial system |
| is24Hour | boolean | Set the value of the time system, return true to indicate the 24-hour system, false to indicate the 12-hour system |
| isOpenAutoHeartDetect | boolean | Set the status of automatic heart rate measurement. Returning true means that the automatic heart rate measurement function is turned on, and returning false means that the automatic heart rate measurement function is turned off |
| isOpenAutoBpDetect | boolean | Set the status of automatic blood pressure measurement. Returning true means that the automatic blood pressure measurement function is turned on, and returning false means that the automatic blood pressure measurement function is turned off |
| temperatureUnit | ETemperatureUnit | Set temperature unit |
| isOpenSportRemain | EFunctionStatus | Set the status of excessive exercise, SUPPORT_OPEN means the excessive exercise reminder function is turned on, SUPPORT_CLOSE means the excessive exercise reminder function is turned off; UNSUPPORT means it is not supported |
| isOpenVoiceBpHeart | EFunctionStatus | Set the status of heart rate/blood oxygen/blood pressure, SUPPORT_OPEN means the heart rate/blood oxygen/blood pressure reporting function is turned on, SUPPORT_CLOSE means the heart rate/blood oxygen/blood pressure reporting function is turned off; UNSUPPORT means it is not supported |
| isOpenFindPhoneUI | EFunctionStatus | Set the status of mobile phone search, SUPPORT_OPEN means the mobile phone search function is turned on, SUPPORT_CLOSE means the mobile phone search function is turned off; UNSUPPORT means it is not supported |
| isOpenStopWatch | EFunctionStatus | Set whether to turn on the stopwatch function, SUPPORT_OPEN means the stopwatch function is turned on, SUPPORT_CLOSE means the stopwatch function is turned off; UNSUPPORT means it is not supported |
| isOpenSpo2hLowRemind | EFunctionStatus | Set the low oxygen reminder, SUPPORT_OPEN means the low oxygen reminder function is turned on, SUPPORT_CLOSE means the low oxygen reminder function is turned off; UNSUPPORT means it is not supported |
| isOpenWearDetectSkin | EFunctionStatus | Set to open skin color wearing detection, SUPPORT_OPEN means white skin color, SUPPORT_CLOSE means black skin color; UNSUPPORT means not supported |
| skinType | Int | Skin color gear setting, range 0-6, gradually increasing from white skin color to black skin color, only set when VpSpGetUtil.getVpSpVariInstance(mContext).getSkinType() == 2, other skin color type settings are invalid |
| isOpenAutoHRV | EFunctionStatus | Set the HRV automatic detection function |
| isOpenAutoInCall | EFunctionStatus | Set the function of automatically answering incoming calls |
| isOpenDisconnectRemind | EFunctionStatus | Set the disconnection reminder function |
| isOpenSOS | EFunctionStatus | Set the help function |
| isOpenAutoTemperatureDetect | EFunctionStatus | Set the automatic body temperature detection function |
| ecgAlwaysOpen | EFunctionStatus | Set the ecg normally open function |
| METDetect | EFunctionStatus | Set METDetect function |
| stressDetect | EFunctionStatus | Set the stress detection function |
| isOpenPPG | EFunctionStatus | Set the ppg function, the ppg switch is also a precise sleep switch |
| isOpenMusicControl | EFunctionStatus | Set music control function |
| isOpenLongClickLockScreen | EFunctionStatus | Set long press lock screen |
| isOpenMessageScreenLight | EFunctionStatus | Set message light screen |
| isOpenBloodGlucoseDetect | EFunctionStatus | Set the automatic blood glucose detection function |
| bloodGlucoseUnit | EBloodGlucoseUnit | Set blood glucose unit |
| isOpenBloodComponentDetect | EFunctionStatus | Blood component automatic detection function |
| uricAcidUnit | EUricAcidUnit | Uric acid unit setting |
| bloodFatUnit | EBloodFatUnit | Blood lipid unit setting |

Note: **If you want to set the switch of a certain function, you need to read the personalized settings first to determine whether the function is supported. If it is supported, you can set the switch status. If it is not supported, you still need to issue a non-support command. **

###### Return data

ICustomSettingDataListener returns the same data as [[Read Personalized Settings](#Read Personalized Settings-readCustomSetting)]

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().changeCustomSetting({

},object :ICustomSettingDataListener{
    override fun OnSettingDataChange(customSettingData: CustomSettingData?) {

    }

},customSetting)
```

## Turn your wrist to brighten the screen function

#### Prerequisites

The device must support the function of turning your wrist to turn on the screen, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportNightturnSetting
```

#### Read and turn your wrist to brighten the screen

The device must support the function of turning the wrist to turn on the screen.

###### API

```
readNightTurnWriste(bleWriteResponse, nightTurnWristeDataListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| --------------------------- | --------------------------- | ------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| nightTurnWristeDataListener | INightTurnWristeDataListener | turn your wrist to brighten the screen data monitoring |

###### Return data

**INightTurnWristeDataListener** -- turning the wrist to turn on the screen data monitoring

```kotlin
/**
 * Returns the data of turning the wrist to turn on the screen [also called raising the hand to turn on the screen]
 *
 * @param nightTurnWristeData Data for raising your hand to light up the screen
 */
fun onNightTurnWristeDataChange(nightTurnWristeData:NightTurnWristeData)
```

**NightTurnWristeData** -- Data for raising your hand to brighten the screen

| Variable | Type | Remarks |
| -------------------------- | -------------------------- | ---------------------------------- |
| OprateStauts | ENightTurnWristeStatus | Operation wrist turn to brighten the screen status |
| isSupportCustomSettingTime | Boolean | Whether to support custom time settings, true means supported |
| nightTureWirsteStatusOpen | Boolean | Whether to turn the wrist to brighten the screen is on |
| startTime | TimeData | start time |
| endTime | TimeData | end time |
| level | Int | Sensitivity level |
| defaultLevel | Int | Default level |

**ENightTurnWristeStatus** -- status

| Variables | Remarks |
| ------- | -------- |
| SUCCESS | Success |
| FAIL | Failure |
| UNKONW | Unknown status |

###### Sample code

```kotlin
VPOperateManager.getInstance().readNightTurnWriste({
    if (it != Code.REQUEST_SUCCESS) {
        // "write cmd failed"
    }
}, { nightTurnWristeData ->
    //success
})
```

#### Set to turn your wrist to turn on the screen

The device needs to support the function of turning the wrist to brighten the screen.

###### API

```
settingNightTurnWriste(IBleWriteResponse bleWriteResponse, INightTurnWristeDataListener nightTurnWristeDataListener, NightTurnWristSetting nightTurnWristSetting)
```

###### Parameters

| Parameter name | Type | Remarks |
| --------------------------- | --------------------------- | ------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| nightTurnWristeDataListener | INightTurnWristeDataListener | turn your wrist to brighten the screen data monitoring |
| nightTurnWristSetting | NightTurnWristSetting | Turn your wrist to brighten the screen setting |

**NightTurnWristSetting** -- turning the wrist to brighten the screen setting

| Parameter name | Type | Remarks |
| --------- | -------- | -------------------------------- |
| isOpen | Boolean | Whether to open |
| startTime | TimeData | start time |
| endTime | TimeData | end time |
| level | Int | Wrist turning level: range [1-10.], default is 5 |

###### Return data

Same as the data returned by [[Read Night-time Wrist Turn](#Read Night-time Wrist Turn)]

###### Sample code

```kotlin
//kotlin code
val nightTurnWristSetting = NightTurnWristSetting(
    true,
    TimeData(20, 0), TimeData
        (8, 0), 5
)
VPOperateManager.getInstance().settingNightTurnWriste({
    if (it != Code.REQUEST_SUCCESS) {

    }
}, {

}, nightTurnWristSetting)
```

## Screen adjustment function

#### Prerequisites

The device needs to support the screen adjustment function, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportScreenlight
```

#### Read screen adjustment data

Need to support screen adjustment function

###### API

```kotlin
readScreenLight(bleWriteResponse, screenLightListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------- | ------------------ | ------------------ |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| screenLightListener | IScreenLightListener | Screen adjustment data monitoring |

###### Return data

**IScreenLightListener** -- Screen adjustment data monitoring

```kotlin
/**
 * Callback for screen brightness adjustment
 *
 * @param screenLightData
 */
fun onScreenLightDataChange(screenLightData:ScreenLightData);
```

**ScreenLightData** -- screen adjustment data

| Variable | Type | Remarks |
| ------------- | ------------- | ------------ |
| status | EScreenLight | Operation status |
| screenSetting | ScreenSetting | Screen brightness setting |

**EScreenLight** -- Operation status

| Variables | Remarks |
| --------------- | -------- |
| SETTING_SUCCESS | Setting successful |
| SETTING_FAIL | Setting failed |
| READ_SUCCESS | Read successfully |
| READ_FAIL | Read failed |
| UNKONW | Unknown status |

**ScreenSetting** -- screen settings

| Variable | Type | Remarks |
| ----------- | ---- | ----------------------------- |
| startHour | Int | The first gear start hour |
| startMinute | Int | The first gear start minute |
| endHour | Int | The end hour of the first gear |
| endMinute | Int | The end minute of the first gear |
| level | Int | Set the first level of the time period |
| otherLeverl | Int | Brightness level in other time periods |
| auto | Int | Automatic adjustment: 1 automatic 2 manual 0 old protocol |
| maxLevel | Int | Maximum brightness adjustment level |

###### Sample code

```kotlin
VPOperateManager.getInstance().readScreenLight(
    writeResponse
) { screenLightData ->
    val message = "Screen adjustment data-read: $screenLightData"
}
```

#### Set screen adjustment data

The device needs to support screen adjustment

###### API

```kotlin
settingScreenLight(bleWriteResponse, screenLightListener, screensetting)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------- | ------------------ | ------------------ |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| screenLightListener | IScreenLightListener | Screen adjustment data monitoring |
| screensetting | ScreenSetting | screen setting parameters |

###### Return data

Same as the data returned by [[Read screen adjustment data](#Read screen adjustment data)]

###### Sample code

```kotlin
//The default is [22:00-07:00] set to level 2, other times set to level 4, users can customize
VPOperateManager.getInstance().settingScreenLight(writeResponse,
    { screenLightData ->
        val message = "Screen adjustment data-setting:$screenLightData"
    }, ScreenSetting(22, 0, 7, 0, 2, 4)
)
```

## Screen brightness duration function

#### Prerequisites

The device needs to support the screen brightness adjustment function. The judgment code is as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportScreenlightTime
```

#### Read the screen on time

The device needs to support the screen brightness adjustment function

###### API

```kotlin
readScreenLightTime(bleWriteResponse, screenLightTimeListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ----------------------- | --------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| screenLightTimeListener | IScreenLightTimeListener | Screen light time monitoring |

###### Return data

**IScreenLightTimeListener** -- monitor the screen brightness time

```kotlin
/**
 * Callback for screen on duration
 *
 * @param screenLightTimeData
 */
fun onScreenLightTimeDataChange(screenLightTimeData:ScreenLightTimeData)
```

**screenLightTimeData** -- screen light time data

| Variable | Type | Remarks |
| ------------------ | ---------------- | -------- |
| screenLightState | EScreenLightTime | callback state |
| currentDuration | Int | Current duration |
| recommendDuration | Int | Recommended duration |
| maxDuration | Int | Maximum duration |
| minDuration | Int | Minimum duration |

**EScreenLightTime** -- callback status

| Variables | Remarks |
| --------------- | -------- |
| SETTING_SUCCESS | Setting successful |
| SETTING_FAIL | Setting failed |
| READ_SUCCESS | Read successfully |
| READ_FAIL | Read failed |
| UNKONW | Unknown status |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance()
    .readScreenLightTime(writeResponse, object : IScreenLightTimeListener {
        override fun onScreenLightTimeDataChange(screenLightTimeData: ScreenLightTimeData?) {
        
        }
    }
    )
```

#### Set the screen on duration

The device needs to support the screen brightness adjustment function

###### API

```kotlin
setScreenLightTime(IBleWriteResponse bleWriteResponse, IScreenLightTimeListener screenLightTimeListener, int time) 
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ---------------------------- | ------------------ |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| screenLightTimeListener | IScreenLightTimeListener | Screen light time monitoring |
| time | Int | Screen on duration, unit: seconds |

###### Return data

The data returned is consistent with [[Read screen on screen duration](#Read screen on screen duration)]

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance()
    .setScreenLightTime(
        writeResponse, object : IScreenLightTimeListener {
            override fun onScreenLightTimeDataChange(screenLightTimeData: ScreenLightTimeData?) {

            }
        }, 10
    )
```

## Health reminder

#### Read health reminders

###### API

```kotlin
readHealthRemind(healthRemindType, listener, bleWriteResponse)
```

###### Parameters

| Parameter name | Type | Remarks |
|----------------|-----------------------------|----------------|
| healthRemindType | HealthRemindType | Health reminder type |
| listener | IHealthRemindListener | Health reminder data listening |
| bleWriteResponse | IBleWriteResponse | Write operation monitoring |

**HealthRemindType** --- Health reminder type

| Parameter name | Remarks |
| ------------- | -------- |
| ALL | All Reminders |
| SEDENTARY | Sedentary |
| DRINK_WATER | drink water |
| OVERLOOK | OVERLOOK |
| SPORTS | Sports |
| TAKE_MEDICINE | Take medicine |
| READING | Reading books |
| GOING_OUT | GOING |
| WASH | Hand washing |

###### Return data

**IHealthRemindListener** -- Health reminder data listening

```kotlin
/**
 * This function is not supported
 */
fun functionNotSupport()

/**
 * Health reminder reading callback
 * @param healthRemind health reminder
 */
fun onHealthRemindRead(healthRemind: HealthRemind)

/**
 * Failed to read health reminder
 */
fun onHealthRemindReadFailed()

/**
 * Health reminder proactively reports callbacks
 * @param healthRemind health reminder
 */
fun onHealthRemindReport(healthRemind: HealthRemind)

/**
 * Failed to proactively report health reminders
 */
fun onHealthRemindReportFailed()

/**
 * Health reminder set successfully
 * @param healthRemind health reminder
 */
fun onHealthRemindSettingSuccess(healthRemind: HealthRemind)

/**
 * Health reminder setting failed
 * @param healthRemindType health reminder type that failed to set
 */
fun onHealthRemindSettingFailed(healthRemindType: HealthRemindType)
```

**HealthRemind** -- Health Reminder

| Parameter name | Type | Remarks |
| ---------- | ---------------- | ---------- |
| remindertype | HealthRemindType | Health reminder type |
| startTime | TimeData | Reminder start time |
| endTime | TimeData | Reminder end time |
| interval | Int | reminder interval |
| status | Boolean | status |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance()
    .readHealthRemind(HealthRemindType.ALL, object : IHealthRemindListener {
        override fun functionNotSupport() {
        }

        override fun onHealthRemindRead(healthRemind: HealthRemind) {
        }

        override fun onHealthRemindReadFailed() {
        }

        override fun onHealthRemindReport(healthRemind: HealthRemind) {
        }

        override fun onHealthRemindReportFailed() {
        }

        override fun onHealthRemindSettingSuccess(healthRemind: HealthRemind) {
        }

        override fun onHealthRemindSettingFailed(healthRemindType: HealthRemindType) {
        }

    }, {
        
    })
```

#### Set health reminders

###### API

```kotlin
settingHealthRemind(healthRemind, listener, bleWriteResponse)
```

###### Parameters

| Parameter name | Type | Remarks |
|----------------|-----------------------------|----------------|
| healthRemind | HealthRemind | Health Reminder |
| listener | IHealthRemindListener | Health reminder data listening |
| bleWriteResponse | IBleWriteResponse | Write operation monitoring |

###### Return data

**IHealthRemindListener** is consistent with the data returned by [[Read Health Reminder](#Read Health Reminder)]

###### Sample code

```kotlin
//kotlin code
val healthRemind =
    HealthRemind(HealthRemindType.ALL, TimeData(8, 0), TimeData(20, 0), 20, true)
VPOperateManager.getInstance()
    .settingHealthRemind(healthRemind, object : IHealthRemindListener {
        override fun functionNotSupport() {
        }

        override fun onHealthRemindRead(healthRemind: HealthRemind) {
        }

        override fun onHealthRemindReadFailed() {
        }

        override fun onHealthRemindReport(healthRemind: HealthRemind) {
        }

        override fun onHealthRemindReportFailed() {
        }

        override fun onHealthRemindSettingSuccess(healthRemind: HealthRemind) {
        }

        override fun onHealthRemindSettingFailed(healthRemindType: HealthRemindType) {
        }

    }) {
        
    }
```

## Heart rate function

#### Start manually measuring heart rate-startDetectHeart

```kotlin
startDetectHeart(bleWriteResponse,heartDataListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | ------------------ |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| heartDataListener | IHeartDataListener | Monitoring of heart rate data return |

###### Return data

**IHeartDataListener**

```kotlin
/**
 * Return heart rate data
 *
 * @param heartData heart rate data
 */
fun onDataChange(heartData:HeartData);
```

**HeartData**

| Variable | Type | Remarks |
| ---------- | ---------- | ------------------------------- |
| data | Int | Get heart rate value, range [20-300] |
| heartStatus | EHeartStatus | The status that the device may return when measuring heart rate |

**EHeartStatus**

| Variables | Remarks |
| ----------------------- | ------------------ |
| STATE_INIT | Initialization |
| STATE_HEART_BUSY | Device is busy |
| STATE_HEART_DETECT | Device being detected |
| STATE_HEART_WEAR_ERROR | Detecting, but wearing incorrectly |
| STATE_HEART_NORMAL | Detecting |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().startDetectHeart({

},object :IHeartDataListener{
    override fun onDataChange(heartData: HeartData?) {
        
    }

})
```

#### End manual heart rate measurement-stopDetectHeart

```
stopDetectHeart(bleWriteResponse)
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | ----------------- | --------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |

###### Return data

None

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().stopDetectHeart(){
    
}
```

#### Set heart rate alarm-settingHeartWarning

```kotlin
settingHeartWarning(bleWriteResponse, heartWaringDataListener, heartWaringSetting)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ---------------------------- | --------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| heartWaringDataListener | IHeartWaringDataListener | Heart rate alarm callback |
| heartWaringSetting | HeartWaringSetting | Heart rate alarm settings |

**HeartWaringSetting**

| Parameter name | Type | Remarks |
| --------- | ------- | ---------------------------- |
| heartHigh | Int | Upper limit of heart rate alarm |
| heartLow | Int | Lower limit of heart rate alarm |
| isOpen | boolean | true means open, false means closed |

###### Return data

IHeartWaringDataListener

```kotlin
/**
 * Return heart rate alarm data
 *
 * @param heartWaringData heart rate alarm data
 */
fun onHeartWaringDataChange(heartWaringData:HeartWaringData);
```

**HeartWaringData**

| Variable | Type | Remarks |
| ------ | ------------------ | ---------------------------------- |
| status | EHeartWaringStatus | Upper limit of heart rate alarm |
| ... | -- | Other parameters are the same as **HeartWaringSetting** |

**EHeartWaringStatus**

| Variables | Remarks |
| ------------- | -------- |
| OPEN_SUCCESS | Open successfully |
| OPEN_FAIL | Open failed |
| CLOSE_SUCCESS | Closed successfully |
| CLOSE_FAIL | Close failed |
| READ_SUCCESS | Read successfully |
| READ_FAIL | Read failed |
| UNSUPPORT | Not supported |
| UNKONW | Unknown |

###### Sample code

```kotlin
// kotlin code
val heartWaringSetting = HeartWaringSetting(120,40,true)
VPOperateManager.getInstance().settingHeartWarning({

},object :IHeartWaringDataListener{
    override fun onHeartWaringDataChange(heartWaringData: HeartWaringData?) {
        
    }

},heartWaringSetting)
```

#### Read heart rate alarm-readHeartWarning

```kotlin
readHeartWarning(bleWriteResponse,heartWaringDataListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ---------------------------- | --------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| heartWaringDataListener | IHeartWaringDataListener | Heart rate alarm callback |

###### Return data

IHeartWaringDataListener is the same as [setting heart rate alarm-settingHeartWarning](#settingheart rate alarm-settingHeartWarning)

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().readHeartWarning({

},object :IHeartWaringDataListener{
    override fun onHeartWaringDataChange(heartWaringData: HeartWaringData?) {

    }

})
```

#### Reading daily heart rate data

In [Read Daily Data Function] (#Read Daily Data Function), daily heart rate data will be returned.

#### Heart rate detection switch

In [Modify Personalized Settings](#Modify Personalized Settings-changeCustomSetting), you can set the switch of heart rate detection.

## Body temperature function

#### Prerequisites

Before using the body temperature function, you need to determine whether the device supports the body temperature function. Only after confirming that the settings support the body temperature function can you use the body temperature function related interfaces.

Judgment conditions:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportReadTempture
```

#### Start measuring temperature manually

###### Prerequisites

1. Equipment is required to support body temperature;
2. The device supports body temperature measurement.

```kotlin
1.VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportReadTempture 2.VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportCheckTemptureByApp
```

###### API

```kotlin
startDetectTempture(bleWriteResponse, responseListener)
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | --------------------------- | ------------------ |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| responseListener | ITemptureDetectDataListener | Temperature data return monitoring |

###### Return data

**ITemptureDetectDataListener**

```kotlin
/**
 * Return temperature data
 *
 * @param temperatureDetectData temperature data
 */
fun onDataChange(temptureDetectData:TemptureDetectData)
```

**TemptureDetectData**

| Variable | Type | Remarks |
| ------------ | ----- | --------------------------------------------------------------- |
| oprate | Int | 0x00 does not support this function, 0x01 turns it on, 0x02 turns it off |
| deviceState | Int | 0x00 available, 0x01-0x07 device is busy, 0x08 device low power, 0x09 sensor abnormal |
| progress | Int | Reading progress |
| temperature | Float | body temperature |
| temperatureBase | Float | Original value of body temperature, baseline value |

###### Sample code

```kotlin
//        kotlin code
        VPOperateManager.getInstance().startDetectTempture({

        },object :ITemptureDetectDataListener{
            override fun onDataChange(temptureDetectData: TemptureDetectData?) {

            }
        })
```

#### End manual temperature measurement

###### Prerequisites

The device needs to support temperature and body temperature measurement and have manual temperature measurement enabled.

###### API

```
stopDetectTempture(bleWriteResponse, responseListener) 
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | --------------------------- | ---------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| responseListener | ITemptureDetectDataListener | Temperature data return monitoring, this interface can pass null |

###### Return data

None

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance().stopDetectTempture({

},null)
```

#### Daily body temperature data reading

###### Prerequisites

The device must support body temperature, and the automatic body temperature detection function must be turned on before data can be returned (open through [Personalized Settings](#Modify Personalized Settings-changeCustomSetting))

```kotlin
VpSpGetUtil.getVpSpVariInstance(requireContext()).isSupportReadTempture
```

**Note:** When the device supports body temperature reading and the device body temperature type is 5, the device obtains it through [Read Daily Data Function] (#Read Daily Data Function) without calling the following readTemptureDataBySetting interface. The judgment is as follows:

```
VpSpGetUtil.getVpSpVariInstance(requireContext()).isSupportReadTempture && VpSpGetUtil.getVpSpVariInstance(requireContext()).getTemperatureType == 5
```

###### API

```kotlin
readTemptureDataBySetting(bleWriteResponse, temptureDataListener, readOriginSetting)
```If the data stored in the watch is 3 days, read all the temperature data. The order of reading is [temperature data (today - yesterday - the day before yesterday)]. For the temperature data, you can customize the position of the day and the position of the number.

###### Parameters

| Parameter name | Type | Remarks |
| -------------------- | ------------------------ | -------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| temperatureDataListener | ITemptureDataListener | A callback for reading temperature data, returning the read progress temperature data |
| readOriginSetting | ReadOriginSetting | Read daily data settings |

**ReadOriginSetting** Same as [Read Daily Data](#Interface-Read original health data (5 minutes of original data) readOriginDataBySetting) parameters

###### Return data

**ITemptureDataListener**

```kotlin
//kotlin code
/**
 * Read temperature daily data callback
 *
 * @param temperatureDataList Temperature data list
 */
fun onTemptureDataListDataChange(temptureDataList:List<TemptureData>)

/***
 * Return the reading details. The location of this package needs to be remembered. The next time you read data, pass in the location of this package to avoid repeated reading.
 *
 * @param day The flag of the data in the watch [0=today, 1=yesterday, 2=the day before yesterday]
 * @param date The date of the data, in the format of yyyy-mm-dd
 * @param allPackage The total number of packages of data on the day
 * @param currentPackage The location of this package
 */
fun onReadOriginProgressDetail(day:Int, date:String, allPackage:Int, currentPackage:Int)

/**
 * Return the progress of reading
 *
 * @param progress progress value, range [0-1]
 */
fun onReadOriginProgress(progress:Float)

/**
 * End of reading
 */
fun onReadOriginComplete()
```

**TemptureData**

| Variable | Type | Remarks |
| ------------- | -------- | ------------------ |
| allPackage | Int | Total number of packages |
| packageNumber | Int | Current package number |
| mTime | TimeData | time |
| isFromHandler | Boolean | Whether it is manual measurement |
| temperature | Float | Temperature value |
| baseTempture | Float | temperature original value, base value |

###### Sample code

```kotlin
//        kotlin code
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportReadTempture){
    return
}
VPOperateManager.getInstance().readTemptureDataBySetting({

},object :ITemptureDataListener{
    override fun onReadOriginProgressDetail(
        day: Int,
        date: String?,
        allPackage: Int,
        currentPackage: Int
    ) {
    }

    override fun onReadOriginProgress(progress: Float) {
    }

    override fun onReadOriginComplete() {
    }

    override fun onTemptureDataListDataChange(temptureDataList: MutableList<TemptureData>?) {
    }

}, readOriginSetting)
```

#### Body temperature detection switch

In [Modify Personalized Settings](#Modify Personalized Settings-changeCustomSetting), you can set the switch for body temperature detection.

## ECG function

#### Prerequisites

The device needs to support the ECG function and the device is idle. The judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG
```

All the following interfaces are called on the premise that the device supports the ECG function.

#### Start manual ECG measurement

###### Prerequisites

The device supports ECG function

###### API

```kotlin
startDetectECG(bleWriteResponse, isNeedCurve, ecgDetectListener) 
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | ------------------ |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| isNeedCurve | Boolean | Whether to return curve data |
| ecgDetectListener | IECGDetectListener | ecg measurement callback |

###### Return data

**IECGDetectListener**

```kotlin
/**
 * Basic information of ECG measurement (waveform frequency, sampling frequency)
 *
 * @param ecgDetectInfo
 */
fun onEcgDetectInfoChange(ecgDetectInfo: EcgDetectInfo?)

/**
 *Status during ECG measurement
 *
 * @param ecgDetectState
 */
fun onEcgDetectStateChange(ecgDetectState: EcgDetectState?)

/**
 * The final result of ECG measurement will only be output when it is abnormal, that is, there is a disease.
 *
 * @param ecgDetectResult
 */
fun onEcgDetectResultChange(ecgDetectResult: EcgDetectResult?)

/**
 * ECG waveform data
 *
 * @param data
 *
 * * Use this data to draw the ecg waveform diagram on the interface. When drawing, #data needs to be converted into a voltage value.
 * Conversion method reference [com.veepoo.protocol.util.EcgUtil.convertToMvWithValue]
 * If the array data has no value, it means that reasonable waveform data has not been generated. When measuring ecg, the data will be updated continuously.
 * When the data is Int.MAX_VALUE, which is 2147483647 (0x7FFFFFFF in hexadecimal), it needs to be filtered and the point is not drawn.
 * * Callback of fatigue degree operation, returns fatigue degree data: whether supported, on/off status, progress, fatigue degree value
 *
 */
fun onEcgADCChange(data: IntArray?)
```

**EcgDetectInfo**

| Variable | Type | Remarks |
| ------------- | ---- | -------- |
| frequency | Int | sampling frequency |
| drawFrequency | Int | Waveform frequency |

**EcgDetectState**

| Variable | Type | Remarks |
| ----------- | ------------- | --------------------------------------------------------------- |
| ecgType | Int | ECG measurement type, obtained through VpSpGetUtil.getVpSpVariInstance(applicationContext).ecgType |
| con | Int | ECG operation value |
| dataType | Int | Data type (0-sampling frequency) (1-real-time status of the device) (2-diagnosis result) (3-test failure) (4-test ends normally), only 1 will appear at this time |
| deviceState | EDeviceStatus | device status |
| hr1 | Int | Heart rate per second |
| hr2 | Int | Average heart rate per second |
| hrv | Int | hrv value, 255 is an invalid value and does not need to be displayed |
| rr1 | Int | RR value per second |
| rr2 | Int | Average RR value every 6 seconds |
| br1 | Int | Respiration rate value per second |
| br2 | Int | Average respiratory rate per minute value |
| wear | Int | Lead wearing value, 0 means the wearing is passed, 1 means the wearing is not passed, if the wearing is not passed, the app should close the measurement |
| mid | Int | mid value |
| qtc | Int | qtc value |
| progress | Int | progress |

**EDeviceStatus**

| Variables | Remarks |
|---------------- | ---------------------------------- |
| FREE | Device idle |
| BUSY | The device is busy |
| DETECT_BP | The device is busy, measuring blood pressure |
| DETECT_HEART | Device is busy, measuring heart rate |
| DETECT_AUTO_FIVE | The device is busy and is automatically measuring 5 minutes of data |
| DETECT_SP | The device is busy, measuring blood oxygen |
| DETECT_FTG | The device is busy, measuring fatigue |
| DETECT_PPG | The device is busy, measuring pulse rate |
| CHARGING | Device is charging |
| CHARG_LOW | Device low battery |
| UNPASS_WEAR | The device cannot be worn |
| UNKONW | Unknown |

**EcgDetectResult**

| Variable | Type | Remarks |
| ------------------- | ------------------ | ------------------ |
| isSuccess | Boolean | Whether the measurement was successful |
| type | EECGResultType | Data source of ECG results |
| timeBean | TimeData | Measurement date |
| frequency | Int | sampling frequency |
| drawfrequency | Int | waveform frequency |
| duration | Int | Total number of seconds |
| leadSign | Int | lead signal |
| originSign | IntArray | original signal |
| powers | IntArray | Gain corresponding to the original signal |
| filterSignals | IntArray | original signal |
| result8 | IntArray | 8 diagnostic data |
| diseaseResult | IntArray | Diagnosis result |
| aveHeart | Int | average heart rate |
| aveResRate | Int | Average respiration rate |
| aveHrv | Int | Average HRV |
| aveQT | Int | average QT |
| progress | Int | progress |
| detectHeartIntArray | IntArray | Measured heart rate data |
| detectBreath | IntArray | Respiration rate data |
| detectHrv | IntArray | HRV data |
| detectQT | IntArray | Array of measured QT values |

###### Sample code

```kotlin
//        kotlin code
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG){
    return
}
VPOperateManager.getInstance().startDetectECG({

},true,object :IECGDetectListener{
    override fun onEcgDetectInfoChange(ecgDetectInfo: EcgDetectInfo?) {
    }

    override fun onEcgDetectStateChange(ecgDetectState: EcgDetectState?) {
    }

    override fun onEcgDetectResultChange(ecgDetectResult: EcgDetectResult?) {
    }

    override fun onEcgADCChange(data: IntArray?) {
    }
})
```

#### End manual ECG measurement

###### Prerequisites

1. The device supports ecg
2. The device is idle
3. The device has started measuring ECG manually

###### API

```kotlin
stopDetectECG(bleWriteResponse, isNeedCurve, ecgDetectListener)
```

###### Parameters

The required parameters are the same as [Start manual measurement of ECG-startDetectECG](#Start manual measurement of ECG-startDetectECG)

###### Return data

The returned data is the same as [Start manual measurement of ECG-startDetectECG](#Start manual measurement of ECG-startDetectECG)

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance()
    .stopDetectECG(bleWriteResponse, isNeedCurve, ecgDetectListener)
```

#### ECG new data reporting and monitoring

###### Prerequisites

The device supports ecg function

###### API

```
setNewEcgDataReportListener(listener)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------- | ------------------------ | ------------------ |
| listener | INewECGDataReportListener | New ecg data reporting callback |

###### Return data

**INewECGDataReportListener** -- New ecg data reporting callback

```java
/**
 * New ECG measurement data reporting data monitoring interface
 * Triggered when new measurement data is generated on the device side. When triggered, the ecg data details are read through the {@link VPOperateManager#readECGData(BleWriteResponse bleWriteResponse, TimeData timeData, EEcgDataType eEcgDataType, IECGReadDataListener onReadDataIdFinishCallBack)} interface.
 */
void onNewECGDetectDataReport();
```

###### Sample code

```java
VPOperateManager.getInstance().setNewEcgDataReportListener(new INewECGDataReportListener() {
                @Override
                public void onNewECGDetectDataReport() {
                    showToast("We heard that the device has reported new ecg measurement data, please read the ECG data to obtain detailed information");
                }
            });
```

#### ECG data reading

###### Prerequisites

1. The device supports ecg

###### API

```kotlin
readECGData(bleWriteResponse, timeData, eEcgDataType, onReadDataIdFinishCallBack)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------------------------- | -------------------- | --------------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| timeData | TimeData | The time when the data starts to be read. When eEcgDataType==ALL, the year, month, day, hour, minute and second are passed 0 |
| eEcgDataType | EEcgDataType | Type of ECG data |
| onReadDataIdFinishCallBack | IECGReadDataListener | Data callback for reading ECG data |

**EEcgDataTypeEEcgDataType**

| Parameter name | Remarks |
| -------- | ------------------ |
| MANUALLY | Equipment manual measurement |
| AUTO | Device active measurement |
| ALL | Equipment manual + equipment active |

###### Return data

**IECGReadDataListener**

```kotlin
/**
 * Data reading completed
 *
 * @param resultList ecg measurement array
 */
fun readDataFinish(resultList:List<EcgDetectResult>)
```

**EcgDetectResult**

The same as the EcgDetectResult returned by [Start manual measurement of ECG-startDetectECG](#Start manual measurement of ECG-startDetectECG)

###### Sample code

```kotlin
//        kotlin code
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG){
    return
}
val timedata = TimeData(0,0,0,0,0,0,0)
VPOperateManager.getInstance().readECGData({

},timedata,EEcgDataType.ALL,object :IECGReadDataListener{
    override fun readDataFinish(resultList: MutableList<EcgDetectResult>?) {

    }

})
```

#### Read the ID of ECG data

###### Prerequisites

1. The device supports ecg

###### API

```kotlin
readECGId(bleWriteResponse, timeData, eEcgDataType, onReadIdFinishCallBack)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ------------------ | --------------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| timeData | TimeData | The time when the data starts to be read. When eEcgDataType==ALL, the year, month, day, hour, minute and second are passed 0 |
| eEcgDataType | EEcgDataType | Type of ECG data |
| onReadIdFinishCallBack | IECGReadIdListener | Callback when reading data ID ends |

###### Return data

IECGReadIdListener

```kotlin
/**
 * Callback after reading the data ID
 * @param ids ecg data id list
 */
fun readIdFinish(ids:IntArray?)
```

###### Sample code

```kotlin
//        kotlin code
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG){
    return
}
val timedata = TimeData(0,0,0,0,0,0,0)
VPOperateManager.getInstance().readECGId({

},timedata,EEcgDataType.ALL,object :IECGReadIdListener{
    override fun readIdFinish(ids: IntArray?) {

    }
})
```

#### ECG chest function reading

###### Prerequisites

1. The device supports ecg

###### API

```
readECGSwitchStatus(bleWriteResponse, listener)
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | ------------------ | --------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| listener | IECGSwitchListener | ECG switch listening |

###### Return data

**IECGswitchListener**

```kotlin
/**
 * ECG switch status changes
 *
 * @param ecgFunctionStatus Function status of ecg: UNSUPPORT is not supported, SUPPORT is supported, SUPPORT_OPEN is on, SUPPORT_CLOSE is off, UNKONW is unknown
 */
fun onECGSwitchStatusChanged(ecgFunctionStatus:EFunctionStatus)
```

###### Sample code

```kotlin
//        kotlin code
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG){
    return
}
VPOperateManager.getInstance().readECGSwitchStatus({

},object :IECGSwitchListener{
    override fun onECGSwitchStatusChanged(ecgFunctionStatus: EFunctionStatus?) {

    }
})
```

#### Turn on ECG chest function

###### Prerequisites

1. The device supports ecg
2. The device supports chest function: Determine whether it is supported by [[Read ECG chest function](#ECGchest function reading-readECGSwitchStatus)]

###### API

```
openECGSwitch(bleWriteResponse, listener)
```

###### Parameters

Same parameters as [[Read ECG chest function](#ECG chest function read-readECGSwitchStatus)]

###### Return data

Same as the data returned by [[Read ECG chest function](#ECG chest function read-readECGSwitchStatus)]

###### Sample code

```kotlin
//        kotlin code
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG){
    return
}
VPOperateManager.getInstance().openECGSwitch({

},object :IECGSwitchListener{
    override fun onECGSwitchStatusChanged(ecgFunctionStatus: EFunctionStatus?) {

    }
})
```

#### Turn off ECG chest function

###### Prerequisites

1. The device supports ecg
2. The device supports chest function: Determine whether it is supported by [[Read ECG chest function](#ECGchest function reading-readECGSwitchStatus)]

###### API

```
openECGSwitch(bleWriteResponse, listener)
```

###### Parameters

Same parameters as [[Read ECG chest function](#ECG chest function read-readECGSwitchStatus)]

###### Return data

Same as the data returned by [[Read ECG chest function](#ECG chest function read-readECGSwitchStatus)]

###### Sample code

```kotlin
//        kotlin code
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG){
    return
}
VPOperateManager.getInstance().closeECGSwitch({

},object :IECGSwitchListener{
    override fun onECGSwitchStatusChanged(ecgFunctionStatus: EFunctionStatus?) {

    }
})
```

#### Start reading PTT data

###### Prerequisites

1. The device supports ecg;
2. The device supports ECG chest function;
3. The device has turned on the ECG chest function.

###### API

```
startReadPttSignData(bleWriteResponse, isNeedCurve, ecgDetectListener)
```

###### Parameters

Same as [[Start manual measurement of ECG-startDetectECG](#Start manual measurement of ECG-startDetectECG)] parameters

###### Return data

The data returned is consistent with [[Start manual measurement of ECG-startDetectECG](#Start manual measurement of ECG-startDetectECG)]

###### Sample code

```kotlin
//        kotlin code
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG){
    return
}
VPOperateManager.getInstance().startReadPttSignData({

},true,object :IECGDetectListener{
    override fun onEcgDetectInfoChange(ecgDetectInfo: EcgDetectInfo?) {
    }

    override fun onEcgDetectStateChange(ecgDetectState: EcgDetectState?) {
    }

    override fun onEcgDetectResultChange(ecgDetectResult: EcgDetectResult?) {
    }

    override fun onEcgADCChange(data: IntArray?) {
    }
})
```

#### End reading PTT data-stopReadPttSignData

###### Prerequisites

1. The device supports ecg;
2. The device supports ECG chest function;
3. The device has turned on the ECG chest function;
4. The device has started reading PTT data.

###### API

```
stopReadPttSignData(bleWriteResponse, isNeedCurve, ecgDetectListener)
```

###### Parameters

Same parameters as [[End Manual Measurement ECG-stopDetectECG](#End Manual Measurement ECG-stopDetectECG)]

###### Return data

The data returned is consistent with [[End Manual Measurement ECG-stopDetectECG](#End Manual Measurement ECG-stopDetectECG)]

###### Sample code

```kotlin
if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportECG){
    return
}
VPOperateManager.getInstance().stopReadPttSignData({

},true,object :IECGDetectListener{
    override fun onEcgDetectInfoChange(ecgDetectInfo: EcgDetectInfo?) {
    }

    override fun onEcgDetectStateChange(ecgDetectState: EcgDetectState?) {
    }

    override fun onEcgDetectResultChange(ecgDetectResult: EcgDetectResult?) {
    }

    override fun onEcgADCChange(data: IntArray?) {
    }
})
```

## HRV function

#### Prerequisites

The device needs to support the HRV function and the device is idle. The judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportHRV
```

All the following interfaces are called on the premise that the device supports the HRV function.

#### Read HRV daily data

HRV daily data is obtained through [[Read Daily Data Function](#Read Daily Data Function)]

## Sleep function

#### Read sleep data

###### API

Read sleep data, starting from the beginning and reading to the end

```kotlin
readSleepData(bleWriteResponse, sleepReadDatalistener, watchday)
```

Read sleep data. This method means that you can define your reading position and read down in the order of reading.

```kotlin
readSleepDataFromDay(bleWriteResponse, sleepReadDatalistener, day, watchday)
```

Read sleep data. This method means you can define your reading position and read only the current day.

```kotlin
readSleepDataSingleDay(bleWriteResponse, sleepReadDatalistener, day, watchday)
```

Read sleep data, this method means you can set your reading position and whether to read only the current day

```kotlin
readSleepDataBySetting(bleWriteResponse, sleepReadDatalistener, readSleepSetting)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------------------------- | -------------------- | -------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponseInt | Monitoring of write operations |
| sleepReadDatalistener | ISleepDataListener | Monitors sleep data, returns the progress of sleep reading, and the corresponding sleep data |
| day | Int | Read the day, 0 means today, 1 means yesterday, 2 means the day before yesterday, and so on |
| watchday | Int | Number of days stored by the watch |
| readSleepSetting | ReadSleepSetting | Sleep read settings |

**ReadSleepSetting**

| Parameter name | Type | Remarks |
| -------------- | ------- | ----------------------------------------------- |
| dayInt | Int | Read the day, 0 means today, 1 means yesterday, 2 means the day before yesterday, and so on |
| watchDataDay | Int | Number of days stored by the watch |
| onlyReadOneDay | Boolean | true means reading only today, false means reading sequentially |

###### Return data

**ISleepDataListener**

```kotlin
/**
 * Return data. Sleep may be normal sleep or precise sleep.
 * If it is precision sleep, it needs to be forced to SleepPrecisionData.
 * There are two ways to judge:
 * 1. According to the function flag after passing the password;
 * 2. According to the instanceof keyword, if (sleepData instanceof SleepPrecisionData)
 *
 * @param day indicates the day's data being read. 0: today, 1: yesterday, 2: the day before yesterday.
 * @param sleepData sleep data
 */
fun onSleepDataChange(day: String?, sleepData: SleepData?)

/**
 * Returns the progress of sleep reading, range [0-1]
 *
 * @param progress progress
 */
fun onSleepProgress(progress: Float)

/**
 * Returns the details of reading sleep. This interface is only used for testing to facilitate developers to check the reading progress.
 *
 * @param day means that the data of what day is being read, the data of three days in one day, the order of reading is today-yesterday-the day before yesterday
 * @param packagenumber indicates the number of packages. The data returned for one day starts from the largest package and decreases in sequence.
 */
fun onSleepProgressDetail(day: String?, packagenumber: Int)

/**
 * End of sleep reading
 */
fun onReadSleepComplete()
```

**SleepData**

| Variable | Type | Remarks |
| ------------- | -------- | --------------------------------------------------------------- |
| Date | String | Sleep date |
| cali_flag | Int | Sleep scaling value, currently this value is of no use |
| sleepQuality | Int | sleep quality |
| wakeCount | Int | The number of times you wake up during sleep |
| deepSleepTime | Int | Deep sleep duration (unit min) |
| lowSleepTime | Int | Light sleep duration (unit min) |
| allSleepTime | Int | Total sleep time |
| sleepLine | String | Sleep curve is mainly used for a more concrete UI to display sleep status. If your sleep interface has no special requirements for the UI, you can ignore it. The sleep curve is divided into normal sleep and precision sleep. Normal sleep is a set of strings composed of 0, 1, 2. Each character represents a duration of 5 minutes, where 0 means light sleep, 1 means deep sleep, and 2 means wake up, such as "2011" 12", with a length of 6, indicating a total of 30 minutes of sleep stages, with 5 minutes of awakening at the beginning and end, 5 minutes of light sleep in the middle, and 15 minutes of deep sleep; if it is precision sleep, the sleep curve is a set of strings composed of 0,1,2,3,4, each character represents a duration of 1 minute, where 0 means deep sleep, 1 means light sleep, 2 means rapid eye movement, 3 means insomnia, and 4 means awakening |
| sleepDown | TimeData | Sleep time |
| sleepUp | TimeData | Wake up time |

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().readSleepData({

},object :ISleepDataListener{
    override fun onSleepDataChange(day: String?, sleepData: SleepData?) {
    }

    override fun onSleepProgress(progress: Float) {
    }

    override fun onSleepProgressDetail(day: String?, packagenumber: Int) {
    }

    override fun onReadSleepComplete() {
    }

},3)
```

## Jerry Equipment Certification

#### Prerequisites

It needs to be Jerry equipment, and the judgment conditions are as follows:

```java
VpSpGetUtil.getVpSpVariInstance(mContext).isJieLiDevice()
or
VPOperateManager.getInstance().isJLDevice()
```

When the device chip platform is Jerry, the following functions need to be implemented through Jerry SDK (Weiyipo watch SDK also integrates Jerry SDK):

1. Photo dial transfer (only dial photos and preview photos are transferred, dial element settings are not included)
2. Market dial transmission
3. OTA upgrade

Note: **The prerequisite for operating these functions is the Jerry device certification. After the App is launched, you only need to complete the Jerry device certification once. **

To complete the Jerry device certification, you need to open the Jerry service notification first, and then proceed with the device certification.

#### Open Jerry service notification

###### Sample code

```java
private void openJLNotify() {
    VPOperateManager.getInstance().openJLDataNotify(new BleNotifyResponse() {
        @Override
        public void onNotify(UUID service, UUID character, byte[] value) {

        }

        @Override
        public void onResponse(int code) {
            tvOpenInfo.setText("Notification turned on");
            VPOperateManager.getInstance().changeMTU(247, new IMtuChangeListener() {
                @Override
                public void onChangeMtuLength(int cmdLength) {

                }
            });

        }
    });
}
```

#### Start Jerry Equipment Certification

###### Sample code

```java
private void startDeviceAuth() {
    VPOperateManager.getInstance().startJLDeviceAuth(new RcspAuthResponse() {
        @Override
        public void onRcspAuthStart() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    loadingDialog.showNoTips();
                    tvAuthInfo.setText("Start device authentication");
                }
            });
        }

        @Override
        public void onRcspAuthSuccess() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    loadingDialog.disMissDialog();
                    tvAuthInfo.setText("Device authentication passed");
                }
            });
        }

        @Override
        public void onRcspAuthFailed() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    loadingDialog.disMissDialog();
                    tvAuthInfo.setText("Device authentication failed");
                }
            });
        }
    });
}
```

## Open Jerry file system

When the device chip platform is Jerry, **You need to open the Jerry file system before each operation to implement the following functions**:

1. Photo dial transfer (only dial photos and preview photos are transferred, dial element settings are not included)
2. Market dial transmission
3. OTA upgrade

#### Prerequisites

You need to complete [[Jieli Equipment Certification](#jellyequipmentcertification)] first. After completing the certification, you can open the Jerry file system.

###### Sample code

```java
private void getJLFileSystem() {
        //Jerry file system
        VPOperateManager.getInstance().listJLWatchList(new JLWatchFaceManager.OnWatchDialInfoGetListener() {
            @Override
            public void onGettingWatchDialInfo() {
                //Getting dial information... Please do not perform other Bluetooth operations at this time
                loadingDialog.showNoTips();//Pop up the loading box, if the user needs to implement it by himself
            }

            @Override
            public void onWatchDialInfoGetStart() {
                //Start to obtain watch face information
                loadingDialog.showNoTips();//Pop up the loading box, if the user needs to implement it by himself
            }

            @Override
            public void onWatchDialInfoGetComplete() {
                //The process of obtaining dial information is completed
                loadingDialog.disMissDialog();//Close the loading box, if the user needs to implement it himself
            }

            @Override
            public void onWatchDialInfoGetSuccess(List<FatFile> systemFatFiles, List<FatFile> serverFatFiles, FatFile picFatFile) {
                //Get the dial information of Jerry platform successfully
                StringBuilder sb = new StringBuilder("Jerry Dial System Update==============================Start");
                sb.append("\t\t\t\n").append("[Photo dial] picFatFile = ").append(picFatFile == null ? "NULL" : picFatFile.getPath());
                for (FatFile serverFatFile : serverFatFiles) {
                    sb.append("\t\t\t\n").append("[server dial] serverFatFile = ").append(serverFatFile == null ? "NULL" : serverFatFile.getPath());
                }
                for (FatFile systemFatFile : systemFatFiles) {
                    sb.append("\t\t\t\n").append("[System Dial] systemFatFile = ")
                            .append(systemFatFile == null ? "NULL" : systemFatFile.getPath());
                }
                sb.append("\t\t\t\n").append("[current server dial] serverFatFile = ")
                        .append(serverFatFiles.isEmpty() ? "[Not set yet]" : serverFatFiles.get(0).getPath())
                        .append("\n")
                        .append("Jerry Dial System Update==============================End");
                Log.e(TAG, sb.toString());
                tvFileSystemInfo.setText(sb.toString());
                for (FatFile systemFatFile : systemFatFiles) {
                    Logger.t(TAG).e("System dial--->" + systemFatFile.toString());

                }
                for (FatFile serverFatFile : serverFatFiles) {
                    Logger.t(TAG).e("Server dial--->" + serverFatFile.toString());
                }
                Logger.t(TAG).e("Photo dial --->" + picFatFile.toString());
                loadingDialog.disMissDialog();
            }

            @Override
            public void onWatchDialInfoGetFailed(BaseError error) {
                //Failed to obtain dial information
                tvFileSystemInfo.setText("Get file system list - failed:\n" + error.toString());
                loadingDialog.disMissDialog();
            }
        });
    }
```

File system acquisition monitoring

```java
public interface OnWatchDialInfoGetListener {

    /**
     * Obtaining dial information
     * (Generally, this method will be called back if called again before the acquisition is completed)
     */
    void onGettingWatchDialInfo();

    /**
     * Start getting watch face information
     */
    void onWatchDialInfoGetStart();

    /**
     * Obtaining dial information completed
     */
    void onWatchDialInfoGetComplete();

    /**
     * Obtain watch face information successfully
     *
     * @param systemFatFiles system dial
     * @param serverFatFiles server dial
     * @param picFatFile photo dial
     */
    void onWatchDialInfoGetSuccess(List<FatFile> systemFatFiles, List<FatFile> serverFatFiles, FatFile picFatFile);

    /**
     * Failed to obtain dial
     */
    void onWatchDialInfoGetFailed(BaseError error);
}
```

###

## Dial function

#### Prerequisites

The device needs to support screen style reading

```
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportScreenStyle
```

All instructions on the watch face can only be issued after the device supports screen style reading.

#### Read screen style-readScreenStyle

Get the dial style and dial subscript of the current screen.

###### API

```
readScreenStyle(bleWriteResponse, screenStyleListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------- | ------------------- | ----------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| screenStyleListener | IScreenStyleListener | Screen style monitoring, returning the status of the operation |

###### Return data

**IScreenStyleListener**

```kotlin
/**
 * Callback for screen style setting
 *
 * @param screenStyleData screen style data
 */
fun onScreenStyleDataChange(screenStyleData:ScreenStyleData);
```

**ScreenStyleData**

| Variable | Type | Remarks |
| ----------- | ---------- | --------------------------------------------------------------- |
| status | EScreenStyle | Operation status |
| screenIndex | Int | Dial subscript The default dial starts from 0, and there are up to seven default dials. The watch face market and custom watch faces all start from 1 |
| screenType | EUIFromType | *Dial style* 0x00 Device default dial *0x01 Dial market (requires device support)* 0x02 Custom dial (requires device support) |

**EScreenStyle**

| Variables | Remarks |
| --------------- | -------- |
| SETTING_SUCCESS | Setting successful |
| SETTING_FAIL | Setting failed |
| READ_SUCCESS | Read successfully |
| READ_FAIL | Read failed |
| UNKONW | Unknown status |

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance().readScreenStyle({

}, object : IScreenStyleListener {
    override fun onScreenStyleDataChange(screenStyleData: ScreenStyleData?) {

    }
}
)
```

#### Set screen style-settingScreenStyle

Set the dial style and dial subscript of the current device screen.

###### API

Set the subscript of the default watch face

```kotlin
settingScreenStyle(IBleWriteResponse bleWriteResponse, IScreenStyleListener screenStyleListener, int style)
```

Set the dial style and dial subscript of the current device screen

```
settingScreenStyle(IBleWriteResponse bleWriteResponse, IScreenStyleListener screenStyleListener, int style, EUIFromType uiFromType)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------- | ------------------- | ----------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| screenStyleListener | IScreenStyleListener | Screen style monitoring, returning the status of the operation |
| style | Int | subscript of the dial |
| uiFromType | EUIFromType | Dial type |

**EUIFromType**

| Parameter name | Remarks |
| ------- | ------------------ |
| DEFAULT | The dial that comes with the watch |
| CUSTOM | Custom editable watch face |
| SERVER | Server's dial |
| ... | No need to pay attention to other types |

###### Return data

**IScreenStyleListener** is consistent with the data returned by [[Read Screen Style-readScreenStyle](#Read Screen Style-readScreenStyle)]

###### Sample code

```kotlin
//kotlin code
val uiFromType = EUIFromType.DEFAULT
val style = 2
VPOperateManager.getInstance().settingScreenStyle(
    {
        if (it != Code.REQUEST_SUCCESS) {
//                    Log.e("Test", "write cmd failed")
        }
    }, screenStyleListener, style, uiFromType
)
```

### Local watch face

###### Prerequisites

First get the number of local dials, how to get the number of local dials

```
val defaultUiCount = SpUtil.getInt(applicationContext, SputilVari.COUNT_SCREEN_STYLE_TYPE, 1)
```

Only defaultUiCount>1 can set the local dial

###### API

Call the [[set screen style-settingScreenStyle](#set screen style-settingScreenStyle)] method to set, uiFromType = EUIFromType.DEFAULT, style = 0 - (defaultUiCount - 1)

###### Sample code

```kotlin
//kotlin code
val uiFromType = EUIFromType.DEFAULT
val style = 2
VPOperateManager.getInstance().settingScreenStyle(
    {
        if (it != Code.REQUEST_SUCCESS) {
//                    Log.e("Test", "write cmd failed")
        }
    }, screenStyleListener, style, uiFromType
)
```

### Server dial

#### Prerequisites

1. The device UI transmission mode is 2;
2. The number of server dials is greater than 0.

```kotlin
val bigTranType = VpSpGetUtil.getVpSpVariInstance(applicactionContext).bigTranType
val serverUICount = VpSpGetUtil.getVpSpVariInstance(applicactionContext).watchuiServer
var isSupport = (bigTranType == 2 && serverUICount > 0)
```

**Note⚠️**: Dial transmission needs to add an exception protection scenario: when the watch power is very low, if you initiate a dial transmission, the watch may shut down due to low power during the transmission process. After recharging, the dial will turn black. We recommend reading the current battery level of the watch before each transmission. If the battery status is low, transmission is prohibited.

#### Process

The steps to set up the server dial UI are roughly divided into the following steps:

>Step 1. Determine whether the dial market is supported
>Step 2. Get basic information
> Step 3. Get list of supported server UIs
>Step 4. Download the corresponding UI file
>Step 5. Set up UI

#### Class

Note: **The class name used for this function operation is different from the previous class name**

```kotlin
val mUiUpdateUtil = UiUpdateUtil.getInstance();
val uiUpdateCheckOprate = UiServerHttpUtil();
```

#### Step 1. Determine whether the dial market is supported

```kotlin
//Support server dial
if (mUiUpdateUtil.isSupportChangeServerUi()) {
    mUiUpdateUtil.init(context)
} else {
//Does not support server dials
    
}
```

#### Step 2. Obtain basic information

###### Class

UiUpdateUtil

###### API

```
getServerWatchUiInfo(uiBaseInfoFormServerListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ---------------------------- | ---------------------------- | ---------------------------- |
| uiBaseInfoFormServerListener | IUIBaseInfoFormServerListener | Get basic UI information callback |

###### Return data

**IUIBaseInfoFormServerListener**

```kotlin
/**
 * Return ui basic information-server,
 *
 * @param uiDataServer ui basic information-server ui
 */
fun onBaseUiInfoFormServer(uiDataServer:UIDataServer);
```

**UIDataServer**

| Variable | Type | Remarks |
| ------------------ | ---- | ------------------------------- |
| useType | Int | Data usage type |
| oprateType | Int | Operation type |
| oprateState | Int | Operation status |
| dataReceiveAddress | Int | The starting address for receiving UI data |
| dataCanSendLength | Int | Acceptable data length |
| binDataType | Int | File type, fields to be transmitted by the request server |
| deviceAialShape | Int | Screen type, fields to be transmitted by the request server |
| imgCrcId | Int | Dial CRC check value |
| dataFileLength | Long | The length of the file to send |
| packageIndex | Int | Which package |

###### Sample code

```kotlin
UiUpdateUtil.getInstance().getServerWatchUiInfo { uiDataServer ->
    //"2. Basic information of the server's dial uiDataServer:$uiDataServer"
}
```

#### Step 3. Get the supported server UI list

###### Class

UiServerHttpUtil

###### API

```kotlin
getThemeInfo(uiDataServer, deviceNumber, deviceTestVersion, appPackName, appVersion):List<TUiTheme>
```

Note: **This interface is a network request and cannot be run in the main thread**

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ---------- | ------------------ |
| uiDataServer | UIDataServer | Server dial basic information |
| deviceNumber | String | Device number |
| deviceTestVersion | String | Device test version |
| appPackName | String | app package name |
| appVersion | String | app version |

Among them, deviceNumber will be returned [[when connecting to the device to confirm the password] (#verify password operation)]. The returned class name is PwdData, the field is deviceNumber, and deviceTestVersion is the deviceTestVersion value in PwdData.

###### Return data

**List<TUiTheme>**

**TUiTheme**

| Variable | Type | Remarks |
| ----------- | ------ | -------------------- |
| crc | String | Server dial CRC |
| binProtocol | String | Firmware (no need to pay attention here) |
| dialShape | String | dial shape |
| fileUrl | String | File download path |
| previewUrl | String | Watch face preview image path |

###### Sample code

```kotlin
Thread {
    val appPackName = "com.timaimee.watch"
    val appVersion = "3.1.9"
    val themeInfoList = uiUpdateCheckOprate.getThemeInfo(
        mUiDataServer,
        deviceNumber,
        deviceTestVersion,
        appPackName,
        appVersion
    )
    //Get the themeInfoList page for display
    
}.start()
```

#### Step 4. Download the corresponding UI file

###### Class

UiServerHttpUtil

###### API

```
downloadFile(downUrl, fileSave, onDownLoadListener)
```

Note: **This interface is a network request and cannot be run in the main thread**

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | -------------------------------------------------- |
| downUrl | String | Downloaded watch face file link (fileUrl returned in step 3) |
| fileSave | String | Saved local path |
| onDownLoadListener | OnDownLoadListener | Download callback |

###### Return data

OnDownLoadListener

```kotlin
/**
 * Returns the progress value of downloading firmware, range [0-1]
 * @param progress
 */
fun onProgress(progress:Float);

/**
 * Download ends
 */
fun onFinish();
```

###### Sample code

```kotlin
Thread {
    uiUpdateCheckOprate.downloadFile(
        fileUrl,
        fileSave,
        object : OnDownLoadListener {
            override fun onProgress(progress: Float) {
                Logger.t(TAG).i("Download progress:$progress")
            }

            override fun onFinish() {
                Logger.t(TAG).i("Download completed")
            }
        })
}.start()
```

#### Step 5. Set up UI

Note: **When setting the server dial, you need to pay attention to the platform of the device. For Jerry platform, you need to follow Jerry's setting UI process separately**

##### Feijieli platform setting UI

###### Class

UiUpdateUtil

###### API

```
startSetUiStream(euiFromType, inputStream, uiUpdateListener) 
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | ----------------- | ----------------------------------------------- |
| euiFromType | EUIFromType | UI type The default here is: EUIFromType.SERVER |
| inputStream | InputStream | Dial file input stream |
| uiUpdateListener | IUiUpdateListener | UI upgrade callback |

###### Return data

**IUiUpdateListener**

```kotlin
/**
 * UI upgrade start callback
 */
fun onUiUpdateStart()

/**
 * Start UI erasure
 * @param sumCount total size of erase
 */
fun onStartClearCache(sumCount: Int)

/**
 * UI erasure progress callback
 * @param currentCount current erasure number
 * @param sumCount total size of erase
 * @param progress Erase progress
 */
fun onClearCacheProgress(currentCount: Int, sumCount: Int, progress: Int)

/**
 * UI wipe completed
 */
fun onFinishClearCache()

/**
 * UI upgrade progress
 * @param currentBlock current package
 * @param sumBlock total package
 * @param progress upgrade progress
 */
fun onUiUpdateProgress(currentBlock: Int, sumBlock: Int, progress: Int)

/**
 * UI upgrade successful
 */
fun onUiUpdateSuccess()

/**
 * UI upgrade failed
 * @param eUiUpdateError Reason for upgrade failure
 */
fun onUiUpdateFail(eUiUpdateError: EUiUpdateError?)
```

**EUiUpdateError**

| Variables | Remarks |
| ----------------------- | ----------------------- |
| LISTENTER_IS_NULL | No listener is set |
| NEED_READ_BASE_INFO | Reading dial information is not executed first |
| FILE_UNEXIST | File does not exist |
| LOW_BATTERY | The battery is too low |
| INTO_UPDATE_MODE_FAIL | Failed to enter UI mode |
| FILE_LENGTH_NOT_4_POWER | File is not 4-byte aligned |
| CHECK_CRC_FAIL | crc check failed |
| APP_CRC_SAME_DEVICE_CRC | The CRC of the app is consistent with the CRC of the device |

Note: When the CRC of the dial to be transmitted is consistent with the CRC of the device, there is no need to go through the server dial transmission logic. You can directly set the server dial through the [[SET SCREEN STYLE](#SET SCREEN STYLE-settingScreenStyle)] interface.

###### Sample code

```kotlin
al mUritempFile = Uri.fromFile(mUpdatefile)
val inputStream: InputStream =
    getContentResolver().openInputStream(mUritempFile)

/**
 * Upgrade UI steps: Start upgrading - clear cache data - send UI data - end sending
 */
UiUpdateUtil.getInstance().startSetUiStream(
    EUIFromType.SERVER,
    inputStream, object : IUiUpdateListener {
        override fun onUiUpdateStart() {
        }

        override fun onStartClearCache(sumCount: Int) {
        }

        override fun onClearCacheProgress(
            currentCount: Int,
            sumCount: Int,
            Progress: Int
        ) {
        }

        override fun onFinishClearCache() {
        }

        override fun onUiUpdateProgress(
            currentBlock: Int,
            sumBlock: Int,
            Progress: Int
        ) {
        }

        override fun onUiUpdateSuccess() {
        }

        override fun onUiUpdateFail(eUiUpdateError: EUiUpdateError?) {
        }

    }
)
```

##### Jerry platform setting UI

###### Prerequisites

The required device is a Jerry device and has been completed [[Open Jerry File System](#Open Jerry File System)]

###### API

```
VPOperateManager.getInstance().setJLWatchDial(localServerDialPath, listener)
```

###### Parameters

| Parameter name | Type | Description |
| ------------------- | --------------------------------------- | ----------------------- |
| localServerDialPath | String | |
| listener | JLWatchHolder.OnSetJLWatchDialListener | Transmission monitoring of Jerry's photo dial |

###### Return data

OnSetJLWatchDialListener: Jerry server dial transmission monitoring

```java
/**
     * Transmit market dial monitoring
     */
    public interface OnSetJLWatchDialListener {
        /**
         * Start transferring watch faces
         */
        void onStart();

        /**
         * Watch face transfer progress
         *
         * @param progress progress[0-100]
         */
        void onProgress(int progress);

        /**
         * Dial transfer completed
         *
         * @param watchPath The path of the watch face in the Jerry file system e.g /WATCH088
         */
        void onComplete(String watchPath);

        /**
         * Dial transfer failed
         *
         * @param code failure code
         * @param errorMsg Failure reason
         */
        void onFiled(int code, String errorMsg);
    }
```

### Photo dial

#### Prerequisites

The device needs to support photo watch faces

**Note⚠️**: Dial transmission needs to add an exception protection scenario: when the watch power is very low, if you initiate a dial transmission, the watch may shut down due to low power during the transmission process. After recharging, the dial will turn black. We recommend reading the current battery level of the watch before each transmission. If the battery status is low, transmission is prohibited.

#### Process

>Step 1. Determine whether photo dial is supported
>Step 2. Read basic information
>Step 3. Select the element and its corresponding position
>Step 4. Use a custom image for the background

#### Class

**UiUpdateUtil**

#### Step 1. Determine whether photo dial is supported

```kotlin
if (mUiUpdateUtil.isSupportChangeCustomUi()) {
   //Support custom watch face
    mUiUpdateUtil.init(context);
} else {
 //Does not support custom watch faces
  
}
```

#### Step 2. Read basic information

###### API

```
getCustomWatchUiInfo( uiBaseInfoFormCustomListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ---------------------------- | ---------------------------- | ---------------------------- |
| uiBaseInfoFormCustomListener | IUIBaseInfoFormCustomListener | Read the basic information callback of the photo dial |

###### Return data

**IUIBaseInfoFormCustomListener**

```kotlin
/**
 * Return to ui basic information-customization
 *
 * @param uiDataCustom ui basic information-custom ui
 */
fun onBaseUiInfoFormCustom(uiDataCustom:UIDataCustom);
```

**UIDataCustom**

| Variable | Type | Remarks |
| ------------------ | ----------------------- | ---------------------------- |
| dataReceiveAddress | Int | The starting address for receiving UI data |
| dataCanSendLength | Int | Acceptable data length |
| fileLength | Long | The length of the file to send |
| customUIType | EWatchUIType | Device screen type |
| isDefalutUI | Boolean | Whether it is the default watch face in customization |
| timePosition | EWatchUIElementPosition | element position |
| upTimeType | EWatchUIElementType | The element type above time |
| downTimeType | EWatchUIElementType | The element type below time |
| color888 | Int | Font display color |
| crc | Int | crc value of the dial |
| packageIndex | Int | Package number, starting from 1 |

###### Sample code

```kotlin
mUiUpdateUtil.getCustomWatchUiInfo(IUIBaseInfoFormCustomListener { uiDataCustom ->
 
})
```

#### Step 3. Select the element and its corresponding position

###### API

```
setCustomWacthUi(UICustomSetData uiCustomSetData, final IUIBaseInfoFormCustomListener uiBaseInfoFormCustomListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ---------------------------- | ---------------------------- | ------------------ |
| uiCustomSetData | UICustomSetData | Photo dial settings |
| uiBaseInfoFormCustomListener | IUIBaseInfoFormCustomListener | Photo dial setting callback |

**UICustomSetData**

| Parameter name imePosition | Type EWatchUIElementPosition | Position of the note element |
| ------------------ | ------------------------------- | ------------------ |
| timePosition | EWatchUIElementPosition | element position |
| upTimeType | EWatchUIElementType | The element type above time |
| downTimeType | EWatchUIElementType | The element type below time |
| color888 | Int | Font display color |
| isDefalutUI | Boolean | Whether it is the default photo |

Get the WatchUIType of the device by returning customUIType from the query interface. You can know the element positions, default pictures, photo proportions and other information supported by the device.

###### Return data

**IUIBaseInfoFormCustomListener**

```kotlin
/**
 * Return to ui basic information-customization
 *
 * @param uiDataCustom ui basic information-custom ui
 */
fun onBaseUiInfoFormCustom(uiDataCustom:UIDataCustom);
```

###### Sample code

```kotlin
val timePosition: EWatchUIElementPosition = EWatchUIElementPosition.LEFT_TOP
val upTimeType: EWatchUIElementType = EWatchUIElementType.HEART
val downTimeType: EWatchUIElementType = EWatchUIElementType.STEP
val fontColor: Int = 0xffffff
val uiCustomSetData =
    UICustomSetData(isDefalutUI, timePosition, upTimeType, downTimeType, fontColor)
UiUpdateUtil.getInstance().setCustomWactthUi(uiCustomSetData,
    IUIBaseInfoFormCustomListener { uiDataCustom ->
        val watchColor = uiDataCustom.color888
        val hexColor = ColorUtil.intColorToHexStr(watchColor)
        /**
         * Although the color on the app and the color of the device have the same color value, there will be differences in display.
         * Because the App can display RCG_888, the device can only display RGB_565
         * So in order to display the effect, it is best to make a mapping table yourself.
         * For example, the color of A1 on the app is similar to the color of A2 on the device, then the color of A1 is displayed on the app and the color of A2 is sent to the device.
         */
    })
```

#### Step 4. Use a custom picture for the background

##### Non-Jerry platform settings

###### API

Get the WatchUIType of the device by returning customUIType through the query interface. You can know the element positions, default pictures, photo width and height supported by the device, etc.

Note: The cropped width and height of the selected image must be consistent with the image width and height returned by the device's basic information.

```
startSetUiStream(euiFromType, inputStream, uiUpdateListener) 
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | ----------------- | ----------------------------------------------- |
| euiFromType | EUIFromType | UI type The default here is: EUIFromType.CUSTOM |
| inputStream | InputStream | Dial file input stream |
| uiUpdateListener | IUiUpdateListener | UI upgrade callback |

###### Return data

**IUiUpdateListener**

Returns the same as [[Server Dial-Set Ui](#Step 5.Set UI)]

###### Sample code

```kotlin
inputStream = resources.assets.open(fileName)
val bmp = BitmapFactory.decodeStream(inputStream) //Original image
val sendInputStream: InputStream =
    mWatchUIType.getSendInputStream(context, bmp)
UiUpdateUtil.getInstance().startSetUiStream(
    EUIFromType.CUSTOM,
    sendInputStream,
    object : IUiUpdateListener {
        override fun onUiUpdateStart() {
        }

        override fun onStartClearCache(sumCount: Int) {
        }

        override fun onClearCacheProgress(
            currentCount: Int,
            sumCount: Int,
            Progress: Int
        ) {
        }

        override fun onFinishClearCache() {
        }

        override fun onUiUpdateProgress(
            currentBlock: Int,
            sumBlock: Int,
            Progress: Int
        ) {
        }

        override fun onUiUpdateSuccess() {
        }

        override fun onUiUpdateFail(eUiUpdateError: EUiUpdateError) {
        }
    })
```

##### Jerry platform settings

###### Prerequisites

The required device is a Jerry device and has been completed [[Open Jerry File System](#Open Jerry File System)]

###### API

```
VPOperateManager.getInstance().setJLWatchPhotoDial(dialPhotoPath, listener)
```

###### Parameters

| Parameter name | Type | Description |
| ------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| dialPhotoPath | String | The path of the cropped photo file. (It is recommended to save it in a fixed folder directory. And the cropped size should be consistent with the current dial size, otherwise it will not be transferred. For example, if the dial is 240x280, the width and height of the image need to be 240x280) |
| listener | JLWatchFaceManager.JLTransferPicDialListener | Transmission monitoring of Jerry's photo dial |

###### Return data

JLTransferPicDialListener: Jerry's photo dial transfer listener

```java
/**
 * Jerry photo dial transmission monitoring
 */
public interface JLTransferPicDialListener {
    /**
     * Start transferring photo dial
     */
    void onJLTransferPicDialStart();

    /**
     * Watch face transmission progress monitoring
     *
     * @param progress progress[0-100]
     */
    void onTransferPicDialProgress(int progress);

    /**
     * The preview image transmission is completed, you don’t need to worry about this method.
     */
    void onScaleBGPFileTransferComplete();

    /**
     * The large image of the watch face photo has been transferred. You don’t need to worry about this method.
     */
    void onBigBGPFileTransferComplete();

    /**
     * Photo dial transfer completed [During the transfer, the preview image will be transferred first and then the full dial image]
     */
    void onTransferComplete();

    /**
     * Photo dial transmission abnormality
     *
     * @param code exception code
     * @param errorMsg error reason
     */
    void onTransferError(int code, String errorMsg);
}
```

###### Sample code

```java
private void setPhotoDial() {
    String dialPhotoPath = "/storage/emulated/0/Android/data/com.timaimee.vpdemo/files/hband/jlDail/20230413093755.png";
    tvDialInfo.setText(dialPhotoPath);
    VPOperateManager.getInstance().setJLWatchPhotoDial(dialPhotoPath, new JLWatchFaceManager.JLTransferPicDialListener() {
        @Override
        public void onJLTransferPicDialStart() {
            tvDialInfo.setText("Start transferring photo dial");
            Logger.t(TAG).e("[Jerry Dial Transmission]onJLTransferPicDialStart--->" + Thread.currentThread().toString());
        }

        @Override
        public void onTransferPicDialProgress(int progress) {
            Logger.t(TAG).e("[Jerry Dial Transmission]--->progress = " + progress + " : Thread = " + Thread.currentThread().toString());
            pbPhotoDial.setProgress(progress);
            tvDialProgress.setText(progress + " %");
            tvDialInfo.setText("Dial file is being transferred");
        }

        @Override
        public void onScaleBGPFileTransferComplete() {
            Logger.t(TAG).e("[Jerry Dial Transfer]--->Thumbnail transfer completed" + " : Thread = " + Thread.currentThread().toString());
            tvDialInfo.setText("Dial thumbnail transmission completed");
        }

        @Override
        public void onBigBGPFileTransferComplete() {
            Logger.t(TAG).e("[Jerry Dial Transmission]--->Large image transmission completed" + " : Thread = " + Thread.currentThread().toString());
            tvDialInfo.setText("Transmission of large dial image completed");
        }

        @Override
        public void onTransferComplete() {
            Logger.t(TAG).e("[Jerry dial transmission]--->Dial transmission completed" + " : Thread = " + Thread.currentThread().toString());
            tvDialInfo.setText("Photo dial transferred successfully");
        }

        @Override
        public void onTransferError(int code, String errorMsg) {
            Logger.t(TAG).e("[Jerry Dial Transmission]--->Dial transmission failed code = " + code + ", errorMsg = " + errorMsg + " : Thread = " + Thread.currentThread().toString());
            tvDialInfo.setText("Photo dial transfer failed, code = " + code + " , errorMsg = " + errorMsg);
        }
    });
}
```

## Find device functions

#### Prerequisites

The device needs to support the function of finding the device on the mobile phone. All interfaces of this function need to be supported by the device before it can be called. The judgment conditions are as follows:

```
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportFindDeviceByPhone
```

#### The mobile phone actively starts to find the device-startFindDeviceByPhone

###### API

```
startFindDeviceByPhone(bleWriteResponse, findDevicelistener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | --------------- |
| bleWriteResponse | IBleWriteResponseInt | Monitoring of write operations |
| findDevicelistener | IFindDevicelistener | Find device listeners |

###### Return data

**IFindDevicelistener**

```kotlin
/**
 *Does not support searching via mobile phone
 */
fun unSupportFindDeviceByPhone()
/**
 * The device has been found
 */
fun foundDevice()
/**
 * Search timeout
 */
fun unFindDevice()
/**
 * The device is vibrating and the screen is on, and is in search mode.
 */
funfindDevice()
```

###### Sample code

```kotlin
//        kotlin code
        if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportFindDevice){
            return
        }
        VPOperateManager.getInstance().startFindDeviceByPhone({

        },object :IFindDevicelistener{
            override fun unSupportFindDeviceByPhone() {
            }

            override fun findedDevice() {
            }

            override fun unFindDevice() {
            }

            override fun findingDevice() {
            }
        })
```

#### The phone stops finding the device-stopFindDeviceByPhone

###### API

```
stopFindDeviceByPhone(bleWriteResponse, findDevicelistener)
```

###### Parameters

The parameters are the same as [[The mobile phone actively starts to find the device-startFindDeviceByPhone](#The mobile phone actively starts to find the device-startFindDeviceByPhone)]

###### Return data

Same as [[Mobile phone actively starts to find the device-startFindDeviceByPhone](#Mobile phone actively starts to find the device-startFindDeviceByPhone)] returns data

###### Sample code

```kotlin
//        kotlin code
        if (!VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportFindDevice){
            return
        }
        VPOperateManager.getInstance().stopFindDeviceByPhone({

        },object :IFindDevicelistener{
            override fun unSupportFindDeviceByPhone() {
            }

            override fun findedDevice() {
            }

            override fun unFindDevice() {
            }

            override fun findingDevice() {
            }
        })
```

## Message notification

When the device calls password verification, it will trigger the reporting callback of the status of the social messaging function. Please refer to [Verification Password Operation](\#Verification Password Operation)

The message notification function mainly includes

1. Reading and setting the message notification switch status
2. Send message notification

### Reading and setting of message notification switch status

#### Read message notification switch status

```
VPOperateManager.getInstance().readSocialMsg(writeResponse, listener)
```

| Parameter name | Type | Remarks |
| ------------- | ----------------------- | ---------------------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| listener | ISocialMsgDataListener | Message notification switch-like callback listening |

#### Or obtain the message switch status of the SDK cache through the following method

```
VPOperateManager.getInstance().getFunctionSocailMsgData()
```

This method will return the switch status of the message notification FunctionSocailMsgData. If the entity obtained by this method is null, please call the readSocialMsg method.

#### Message notification switch status setting

```
 VPOperateManager.getInstance().settingSocialMsg(writeResponse, listener, socailMsgData);
```

| Parameter name | Type | Remarks |
| ------------- | ----------------------- | ---------------------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| listener | ISocialMsgDataListener | Message notification switch-like callback listening |
| socailMsgData | FunctionSocailMsgData | Switch status to be set |

#### Switch status and listening callback

ISocialMsgDataListener: message notification switch status change listener, which will be called when reading or setting. **Note: Some watches may support less than 17 social message types, so this method will not be called back**

```
/**
 * Social message status monitoring
 */
public interface ISocialMsgDataListener extends IListener {
    /**
     * Social message status change monitoring, the first package
     *Note: Some watches may support less than 17 social message types, then
     *
     * @param socailMsgData social message switch
     */
    void onSocialMsgSupportDataChange(FunctionSocailMsgData socailMsgData);

    /**
     * Social message status change monitoring, the first package
     * Note: Some watches may support less than 17 social message types, so this method will not be called back
     *
     * @param socailMsgData social message switch
     */
    void onSocialMsgSupportDataChange2(FunctionSocailMsgData socailMsgData);
}
```

**FunctionSocailMsgData:** message notification status

| member name | type | description |
| ------------- | --------------- | ------------- |
| phone | EFunctionStatus | phone |
| msg | EFunctionStatus | SMS |
| wechat | EFunctionStatus | WeChat |
| qq | EFunctionStatus | QQ |
| sina | EFunctionStatus | Sina |
| facebook | EFunctionStatus | Facebook |
| twitter | EFunctionStatus |
| flickr | EFunctionStatus | Flickr |
| Linkin | EFunctionStatus | Lynk & Co Linkin |
| whats | EFunctionStatus | Whats |
| line | EFunctionStatus | Line |
| instagram | EFunctionStatus | Instagram |
| snapchat | EFunctionStatus | Snapchat |
| skype | EFunctionStatus | Skype |
| gmail | EFunctionStatus | Gmail |
| dingding | EFunctionStatus | Dingding dingding |
| wxWork | EFunctionStatus | Enterprise WeChat wxWork |
| tikTok | EFunctionStatus | Douyin TikTok |
| telegram | EFunctionStatus | Telegram |
| connected2_me | EFunctionStatus | Connected2Me |
| kakaoTalk | EFunctionStatus | KakaoTalk |
| messenger | EFunctionStatus | Messenger |
| other | EFunctionStatus | other messages |
| shieldPolice | EFunctionStatus | policeright |

EFunctionStatus: function status (enumeration type)

| Type | Description |
| ------------- | ------------ |
| UNSUPPORT | This feature is not supported |
| SUPPORT | Support |
| SUPPORT_OPEN | Supported and open |
| SUPPORT_CLOSE | Support and close |
| UNKONW | Unknown status |

### Send message notification

Message notifications are divided into three types of message notifications:

1. Mobile phone call message notification
2. Mobile phone SMS message notification
3. Social message notifications (notification messages from various apps such as WeChat, QQ, X (original Twitter), etc.)

#### Message sending

```
VPOperateManager.getInstance().sendSocialMsgContent(writeResponse, contentSetting)
```

| Parameter name | Type | Description |
| -------------- | -------------- | -------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| contentSetting | ContentSetting | message content |

ContentSetting: message content where ESocailMsg is the information type

```
public abstract class ContentSetting {
   /**
    * Enumeration of information push
    */
   private ESocailMsg eSocailMsg;
  ....
```ESocailMsg: social message type enumeration

```
G15MSG((byte) 0XFE), //Exclusive to G15 project, you can ignore it

/**
 * Telephone
 */
PHONE((byte) 0x00),
/**
 * SMS
 */
SMS((byte) 0x01),
/**
 * WeChat
 */
WECHAT((byte) 0x02),
/**
 * QQ [official version, light chat version, international version]
 */
QQ((byte) 0x03),
/**
 * Sina Weibo
 */
SINA((byte) 0x04),
/**
 * facebookfacebook
 */
FACEBOOK((byte) 0x05),
/**
 *X(original Twitter twitter)
 */
TWITTER((byte) 0x06),
/**
 *filck
 */
FLICKR((byte) 0x07),
/**
 *linkin LinkedIn
 */
LINKIN((byte) 0x08),
/**
 *whatapp
 */
WHATS((byte) 0x09),
/**
 * line
 */
LINE((byte) 0x0A),
/**
 * instagram
 */
INSTAGRAM((byte) 0x0B),
/**
 * snapchat
 */
SNAPCHAT((byte) 0x0C),
/**
 * skype
 */
SKYPE((byte) 0x0D),
/**
 * gmail email
 */
GMAIL((byte) 0x0E),
/**
 * DingTalk
 */
DINGDING((byte) 0x0F),
/**
 * Enterprise WeChat
 */
WXWORK((byte) 0x10),

/**
 * Other notifications other than the above
 */
OTHER((byte) 0x11),
/**
 * com.zhiliaoapp.musically
 */
TIKTOK((byte) 0x12),
/**
 * org.telegram.messenger
 */
TELEGRAM((byte) 0x13),
/**
 * com.connected2.ozzy.c2m
 */
CONNECTED2_ME((byte) 0x14),
/**
 * kakao talk
 */
KAKAO_TALK((byte) 0x15),
/**
 *Police right
 */
SHIELD_POLICE((byte) 0x16),//Ignore exclusive projects
/**
 * Messenger under facebook
 */
MESSENGER((byte) 0x17),
```

#### Mobile phone call message notification type

The incoming call message on the mobile phone uses ContentPhoneSetting, which is inherited from ContentSetting. If the name and phone number are passed in at the same time, the watch will display the name. The contact name can be passed null.
ContentPhoneSetting

| Member name | Type | Remarks |
| ------------------ | ------ | ---------- |
| contactName | String | Contact name |
| contactPhoneNumber | String | Contact number |

It is recommended to use the following construction methods

```
ContentPhoneSetting contentSetting = new ContentPhoneSetting(ESocailMsg.PHONE, "Zhang San", "010-6635214");
```

#### Mobile SMS message notification type

Mobile phone SMS messages use ContentSmsSetting, which is inherited from ContentSetting. If you pass in the name and phone number at the same time, the watch will display the name.
ContentSmsSetting

| Member name | Type | Remarks |
| ------------------ | ------ | ---------- |
| contactName | String | Contact name |
| contactPhoneNumber | String | Contact number |
| content | String | Information content |

It is recommended to use the following construction methods

```
ContentPhoneSetting contentSetting = new ContentSmsSetting(ESocailMsg.SMS, "Alice", "010-6635214", "How are you lucky today?");
```

#### Social message type

The social message type uses ContentSocailSetting, inherited from ContentSetting

```
/**
 * @param eSocailMsg type of message
 * @param title the title of the message
 * @param content The content of the message
 */
public ContentSocailSetting(ESocailMsg eSocailMsg, String title, String content) {
    super(eSocailMsg);
    this.title = title;
    this.content = content;
}
```

## Music Control

#### Prerequisites

The device needs to support music control, and the judgment conditions are as follows:

```kotlin
val musicType == VpSpGetUtil.getVpSpVariInstance(applicationContext).musicType
if(musicType == 1){
    //The device supports music control
}else{
    //The device does not support music control
}
```

#### Set music data

Requires device to support music control

###### API

```kotlin
settingMusicData(bleWriteResponse, musicData, iMusicControlListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------------------------- | -------------------------- | -------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| musicData | MusicData | Music data (song title, switch, etc.) |
| iMusicControlListener | IMusicControlListener | Music control monitoring |

**MusicData** -- music data

| Parameter name | Type | Remarks |
| --------------- | ------ | -------------------------- |
| musicAppId | String | music appid |
| musicAlbum | String | music album |
| musicName | String | Music name |
| singerName | String | singer name |
| playStatus | Int | Status: 1 Playing status 2 Pausing status |
| musicVoiceLevel | Int | Volume level[1-100] |

###### Return data

**IMusicControlListener** -- Return monitoring of music control data, music control function exists flag bit

```kotlin
/**
 * Next song, please perform related operations
 */
fun nextMusic()

/**
 * Previous song, please perform related operations
 */

fun previousMusic()

/**
 * Pause and play, please perform related operations
 */
fun pauseAndPlayMusic()

/**
 * Pause, please perform related operations
 */
fun pauseMusic()

/**
 * Play, please perform related operations
 */
fun playMusic()

/**
 * Please perform related operations to increase the volume.
 */
fun voiceUp()

/**
 * Please perform relevant operations if the volume drops.
 */
fun voiceDown()

/**
 * Operation successful
 */
fun oprateMusicSuccess()

/**
 * Operation failed
 */
fun oprateMusicFail()
```

###### Sample code

```kotlin
val play = 1 //Playing status
val pause = 2 //pause state
val musicData = MusicData("Jay Chou", "Shanghai 1943", "Fantasy", 80, play )
VPOperateManager.getInstance()
    .settingMusicData(writeResponse, musicData, object : IMusicControlListener {
        override fun oprateMusicSuccess() {
            Logger.t(OperaterActivity.TAG).i("Music-oprateMusicSuccess")
        }

        override fun oprateMusicFail() {
            Logger.t(OperaterActivity.TAG).i("Music-oprateMusicFail")
        }

        override fun nextMusic() {
            Logger.t(OperaterActivity.TAG).i("Music-nextMusic")
        }

        override fun previousMusic() {
            Logger.t(OperaterActivity.TAG).i("Music-previousMusic")
        }

        override fun pauseAndPlayMusic() {
            Logger.t(OperaterActivity.TAG).i("Music-pauseAndPlayMusic")
        }

        override fun pauseMusic() {
            Logger.t(OperaterActivity.TAG).i("Music-pauseMusic")
        }

        override fun playMusic() {
            Logger.t(OperaterActivity.TAG).i("Music-playMusic")
        }

        override fun voiceUp() {
            Logger.t(OperaterActivity.TAG).i("Music-voiceUp")
        }

        override fun voiceDown() {
            Logger.t(OperaterActivity.TAG).i("Music-voiceDown")
        }
    })
```

#### Set device volume

Requires device to support music control

###### API

```kotlin
settingVolume(volumeLevel,bleWriteResponse,iMusicControlListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------------------------- | -------------------------- | -------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| volumeLevel | Int | The volume value to be set, ranging from 0 to 100 |
| iMusicControlListener | IMusicControlListener | Music control monitoring |

###### Return data

Same as the data returned by [[Set Music Data](#Set Music Data Return)]

###### Sample code

```kotlin
VPOperateManager.getInstance().settingVolume(50,bleWriteResponse,iMusicControlListener)
```

## Bluetooth call function

#### Register device Bluetooth call function monitoring-registerBTInfoListener

###### API

```
registerBTInfoListener(iDeviceBTInfoListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------------------------- | -------------------------- | -------------------- |
| iDeviceBTInfoListener | IDeviceBTInfoListener | Device Bluetooth call function monitoring |

###### Return data

**IDeviceBTInfoListener**

```kotlin
/**
 * The device does not support BT (Bluetooth 3.0 function). The absence of this callback means that the device supports BT.
 */
fun onDeviceBTFunctionNotSupport()

/**
 *Device classic Bluetooth setting callback
 *
 * @param btInfo BT status details
 */
fun onDeviceBTInfoSettingSuccess(btInfo: BTInfo)

/**
 * Device BT status setting failed
 */
fun onDeviceBTInfoSettingFailed()

/**
 * Device classic Bluetooth read callback
 *
 * @param btInfo BT status details
 */
fun onDeviceBTInfoReadSuccess(btInfo: BTInfo)

/**
 * Failed to read device BT status
 */
fun onDeviceBTInfoReadFailed()

/**
 * Device classic Bluetooth reporting callback
 *
 * @param btInfo BT status details
 */
fun onDeviceBTInfoReport(btInfo: BTInfo)
```

**BTInfo**

| Variable | Type | Remarks |
| -------------- | ------- | -------------------------------------------------- |
| status | Int | Device Bluetooth call status 0: Disconnected, 1: Connected, 2: Pairing. |
| isBTOpen | Boolean | Whether the device's Bluetooth call is turned on |
| isAutoCon | Boolean | Whether the device's Bluetooth call will automatically connect back |
| isAudioOpen | Boolean | Whether multimedia audio is open |
| isHavePairInfo | Boolean | Whether there is pairing information |

###### Sample code

```kotlin
//        kotlin code
        VPOperateManager.getInstance().registerBTInfoListener(object :IDeviceBTInfoListener{
            override fun onDeviceBTFunctionNotSupport() {
            }

            override fun onDeviceBTInfoSettingSuccess(btInfo: BTInfo) {
            }

            override fun onDeviceBTInfoSettingFailed() {
            }

            override fun onDeviceBTInfoReadSuccess(btInfo: BTInfo) {
            }

            override fun onDeviceBTInfoReadFailed() {
            }

            override fun onDeviceBTInfoReport(btInfo: BTInfo) {
            }

        })
```

#### Register device Bluetooth call connection status monitoring-registerBTConnectionListener

###### API

```
registerBTConnectionListener(iDeviceBTConnectionListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| --------------------------- | --------------------------- | -------------------------- |
| iDeviceBTConnectionListener | IDeviceBTConnectionListener | Device Bluetooth call connection status monitoring |

###### Return data

**IDeviceBTConnectionListener**

```kotlin
/**
 * Start connecting to BT
 */
fun onDeviceBTConnecting() {}

/**
 * Device BT is connected
 */
fun onDeviceBTConnected() {}

/**
 *The device BT has been disconnected
 */
fun onDeviceBTDisconnected() {}

/**
 * Device BT connection timeout
 */
fun onDeviceBTConnectTimeout() {}
```

###### Sample code

```kotlin
//        kotlin code
        VPOperateManager.getInstance().registerBTConnectionListener(object :IDeviceBTConnectionListener{
            override fun onDeviceBTConnectTimeout() {
                super.onDeviceBTConnectTimeout()
            }

            override fun onDeviceBTConnected() {
                super.onDeviceBTConnected()
            }

            override fun onDeviceBTConnecting() {
                super.onDeviceBTConnecting()
            }

            override fun onDeviceBTDisconnected() {
                super.onDeviceBTDisconnected()
            }
        })
```

#### Manually connect BT-connectBT

###### Prerequisites

After registering the device's Bluetooth call function monitoring, there is no onDeviceBTFunctionNotSupport callback (that is, the device supports the BT function)

###### API

```
connectBT(mac, listener)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------- | --------------------------- | ------------------- |
| mac | String | The device to connect to Bluetooth mac |
| listener | IDeviceBTConnectionListener | Device connection listening callback |

###### Return data

**IDeviceBTConnectionListener**

###### Code sample

```kotlin
//        kotlin code
        val mac = "F1:F2:F3:F4:F5"
        VPOperateManager.getInstance().connectBT(mac,object :IDeviceBTConnectionListener{
            
        })
```

#### Manually disconnect BT -disconnectBT

###### Prerequisites

The device supports BT and is connected to BT

###### API

```
disconnectBT(String mac, IDeviceBTConnectionListener listener)
```

###### Parameters

Same parameters as [[Manual connection BT-connectBT](#Manual connection BT-connectBT)]

###### Return data

The data returned is consistent with [[Manual connection BT-connectBT](#Manual connection BT-connectBT)]

###### Sample code

```kotlin
//        kotlin code
        val mac = "F1:F2:F3:F4:F5"
        VPOperateManager.getInstance().disconnectBT(mac,object :IDeviceBTConnectionListener{

        })
```

#### Read BT information-readBTInfo

```
readBTInfo(bleWriteResponse, listener)
```

###### Parameters

| Parameter name | Type | Remarks |
|----------------|-----------------------------|----------------|
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| listener | IDeviceBTInfoListener | Device connection listening callback |

###### Return data

The data returned is consistent with [[Manual connection BT-connectBT](#Manual connection BT-connectBT)]

###### Sample code

```kotlin
//kotlin code
VPOperateManager.getInstance().readBTInfo(
    {
        if (it != Code.REQUEST_SUCCESS) {
            Log.e("Test","write cmd failed")
        }
    }, btInfoListener
)
```

#### Set BT status-setBTStatus

###### Prerequisites

The device supports BT, and the device BT connection is successful

###### API

```kotlin
setBTStatus(boolean isAutoConnect, boolean isBTOpen, boolean isAudioOpen, isClearPairInfo, bleWriteResponse)
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | ----------------- | ------------------ |
| isAutoConnect | Boolean | Whether the device automatically connects back |
| isBTOpen | Boolean | Whether the device BT is open |
| isAudioOpen | Boolean | Whether the multimedia switch is turned on |
| isClearPairInfo | Boolean | Whether to clear device pairing information |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |

###### Return data

None

###### Code sample

```kotlin
//kotlin code
VPOperateManager.getInstance().setBTStatus(false, isBTOpen, isAudioOpen, false) {
    if (it != Code.REQUEST_SUCCESS) {
        Log.e("Test", "write cmd failed")
    }
}
```

#### Set BT switch status-setBTSwitchStatus

###### Prerequisites

The device supports BT, and the device BT connection is successful

###### API

```kotlin
setBTSwitchStatus(isBTOpen, bleWriteResponse)
```

###### Parameters

| Parameter name | Type | Remarks |
|---------------- | ----------------- | --------------- |
| isBTOpen | Boolean | Whether to open BT |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |

###### Return data

None

###### Sample code

```kotlin
//        kotlin code
        VPOperateManager.getInstance().setBTSwitchStatus(true){
            
        }
```

## Sports function

#### Read sports mode data

###### Prerequisites

The device needs to support sports mode

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportSportModel
```

###### API

```kotlin
readSportModelOrigin(bleWriteResponse, sportModelOriginListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| -------------------------------- | -------------------------------- | -------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| sportModelOriginListener | ISportModelOriginListener | Read sports mode data listening |

###### Return data

**ISportModelOriginListener**

```kotlin
/**
 * Return the progress of reading
 *
 * @param progress progress value, range [0-1]
 */
fun onReadOriginProgress(progress: Float)

/***
 * Return read details
 *
 * @param day The flag of the data in the watch [0=today, 1=yesterday, 2=the day before yesterday]
 * @param date The date of the data, in the format of yyyy-mm-dd
 * @param allPackage The total number of packages of data on the day
 * @param currentPackage The location of this package
 */
fun onReadOriginProgressDetail(day: Int, date: String?, allPackage: Int, currentPackage: Int)

/**
 * Callback of sports mode raw data [head information]
 *
 * @param sportModelHeadData sport mode original data [head information]
 */
fun onHeadChangeListListener(sportModelHeadData: SportModelOriginHeadData?)

/**
 * Callback of sports mode raw data [details]
 *
 * @param sportModelItemDatas sport mode raw data [details]
 */
fun onItemChangeListListener(sportModelItemDatas: List<SportModelOriginItemData?>?)

/**
 * End of reading
 */
fun onReadOriginComplete()
```

**SportModelOriginHeadData**--Head information of sports mode

| Variable | Type | Remarks |
| ------------ | -------- | --------------------- |
| date | String | Sports date |
| startTime | TimeData | start time |
| stopTime | TimeData | stop time |
| sportTime | Int | Total exercise time |
| stepCount | Int | Total number of exercise steps |
| sportCount | Int | Total amount of exercise |
| kcals | Double | kilocalories consumed by exercise |
| distance | Double | Movement distance |
| recordCount | Int | Total number of records |
| pauseCount | Int | Number of pauses |
| pauseTime | Int | Pause duration |
| crc | Int | Data check code |
| peisu | Int | Pace |
| oxsporttimes | Int | aerobics time |
| averRate | Int | average heart rate |
| sportType | Int | Sport type, see ESportType |

**SportModelOriginItemData**--Detailed information of sports mode

| Variable | Type | Remarks |
| ---------- | -------- | -------- |
| date | String | Sports date |
| startTime | TimeData | start time |
| minute | Int | Sports minute |
| allMinute | Int | Total minutes |
| rate | Int | heart rate |
| stepCount | Int | Total number of steps |
| sportCount | Int | Total amount of exercise |
| distance | Int | Movement distance |
| kcal | Int | kilocalories consumed |
| beathPause | Int | Pause flag |
| crc | Int | Check code |

ESportType--sport type enumeration

```java
public enum ESportType {
    /**
     *Default sport
     */
    NONE(0),
    /**
     * Outdoor running
     */
    OUTDOOR_RUNNING(1),
    /**
     * Outdoor walking
     */
    OUTDOOR_WALK(2),
    /**
     * Indoor running
     */
    INDOOR_RUNNING(3),
    /**
     * Indoor walking
     */
    INDOOR_WALK(4),
    /**
     * Hiking
     */
    HIKE(5),
    /**
     * Stepper
     */
    TREADMILLS(6),
    /**
     * Outdoor cycling
     */
    OUTDOOR_RIDING(7),
    /**
     *Indoor cycling
     */
    INDOOR_RIDING(8),
    /**
     * Elliptical machine
     */
    ELLIPTICAL(9),
    /**
     * rowing machine
     */
    ROWING_MACHINE(10),
    /**
     *Mountain climbing
     */
    Mountaineering(11),
    /**
     * swimming
     */
    SWIM(12),
    /**
     * Sit-ups
     */
    Sit_Ups(13),
    /**
     * Skiing
     */
    SKI(14),
    /**
     * Skipping rope
     */
    JUMP_ROPE(15),
    /**
     * Yoga
     */
    YOGA(16),
    /**
     * table tennis
     */
    PING_PONG(17),
    /**
     * Basketball
     */
    BASKETBALL(18),
    /**
     * Volleyball
     */
    VOLLEYBALL(19),
    /**
     * football
     */
    FOOTBALL(20),
    /**
     * Badminton
     */
    BADMINTON(21),
    /**
     * Tennis
     */
    TENNIS(22),
    /**
     * Climb stairs
     */
    CLIMB_STAIRS(23),
    /**
     * Fitness
     */
    FITNESS(24),
    /**
     * Lifting weights
     */
    WEIGHTLIFTING(25),
    /**
     * Diving
     */
    DIVING(26),
    /**
     * Boxing
     */
    BOXING(27),
    /**
     * Exercise ball
     */
    GYM_BALL(28),
    /**
     * Squat training
     */
    SQUAT_TRAINING(29),
    /**
     *Triathlon
     */
    TRIATHLON(30),
    /**
     * dance
     */
    DANCE(31),
    /**
     *HIIT
     */
    HIIT(32),
    /**
     * rock climbing
     */
    ROCK_CLIMBING(33),
    /**
     * Athletics
     */
    SPORTS(34),
    /**
     * Ball games
     */
    BALLS(35),
    /**
     * Fitness games
     */
    FITNESS_GAME(36),
    /**
     * Free activities
     */
    FREE_TIME(37),
    /**
     * aerobics
     */
    AEROBICS(38),
    /**
     *Gymnastics
     */
    GYMNASTICS(39),
    /**
     * floor exercise
     */
    FLOOR_EXERCISE(40),
    /**
     *Horizontal bar
     */
    HORIZONTALBAR(41),
    /**
     * Parallel bars
     */
    PARALLELBARS(42),
    /**
     * Trampoline
     */
    TRAMPOLINE(43),
    /**
     *Athletics
     */
    TRACKANDFIELD(44),
    /**
     * Marathon
     */
    MARATHON(45),
    /**
     * push-ups
     */
    PUSH_UPS(46),
    /**
     * Dumbbells
     */
    DUMBBELL(47),
    /**
     * Rugby
     */
    RUGBY_FOOTBALL(48),
    /**
     *Handball
     */
    HANDBALL(49),
    /**
     * Baseball and softball
     */
    BASEBALL_SOFTBALL(50),
    /**
     * Baseball
     */
    BASEBALL(51),
    /**
     * Hockey
     */
    HOCKEY(52),
    /**
     * golf ball
     */
    GOLF(53),
    /**
     * Bowling
     */
    BOWLING(54),
    /**
     * Billiards
     */
    BILLIARDS(55),
    /**
     * rowing
     */
    ROWING(56),
    /**
     * Sailing boat
     */
    SAILBOAT(57),
    /**
     * skating
     */
    SKATE(58),
    /**
     * Curling
     */
    CURLING(59),
    /**
     * Ice Hockey
     */
    PUCK(60),
    /**
     * sled
     */
    SLEIGH(61),
    /**
     * Walking
     */
    StrongWalk(62),
    /**
     * Treadmill
     */
    Treadmill(63),
    /**
     * Cross-country running
     */
    TrailRunning(64),
    /**
     *Race walking
     */
    RaceWalking(65),
    /**
     * Mountain biking
     */
    MountainBiking(66),
    /**
     * BMX
     */
    Bmx(67),
    /**
     * Orienteering
     */
    Orienteering(68),
    /**
     * fishing
     */
    Fishing(69),
    /**
     * Hunting
     */
    Hunt(70),
    /**
     * skateboard
     */

    Skateboard(71),
    /**
     * Roller skating
     */
    RollerSkating(72),
    /**
     * Parkour
     */
    Parkour(73),
    /**
     *ATV
     */
    Atv(74),
    /**
     * Motocross
     */
    Motocross(75),
    /**
     * Stair climbing machine
     */
    ClimbingMachine(76),
    /**
     * Spinning bike
     */
    SpinningBike(77),
    /**
     * Indoor fitness
     */
    IndoorFitness(78),
    /**
     * Mixed aerobic
     */
    MixedAerobic(79),
    /**
     * Cross training
     */

    CrossTraining(80),
    /**
     * aerobics
     */
    BodybuildingExercise(81),
    /**
     *Group exercise
     */
    GroupGymnastics(82),
    /**
     * Kickboxing
     */
    Kickboxing(83),
    /**
     *Strength training
     */
    StrengthTraining(84),
    /**
     * Step training
     */
    SteppingTraining(85),
    /**
     * Core training
     */
    CoreTraining(86),
    /**
     * Flexibility training
     */
    FlexibilityTraining(87),
    /**
     * Free training
     */
    FreeTraining(88),
    /**
     * Pilates
     */
    Pilates(89),
    /**
     * battle rope
     */

    BattleRope(90),
    /**
     * Stretch
     */
    Stretch(91),
    /**
     * Square dance
     */
    SquareDance(92),
    /**
     * Ballroom dancing
     */
    BallroomDancing(93),
    /**
     * Belly dance
     */
    BellyDance(94),
    /**
     * ballet
     */
    Ballet(95),
    /**
     * hip-hop
     */
    HipHop(96),
    /**
     * Zumba
     */
    Zumba(97),
    /**
     * Latin dance
     */
    LatinDance(98),
    /**
     * Jazz dance
     */
    Jazz(99),
    /**
     * hip hop dance
     */

    HipHopDance(100),
    /**
     *Pole dancing
     */
    PoleDancing(101),
    /**
     * Breakdancing
     */
    BreakDance(102),
    /**
     * Folk dance
     */
    NationalDance(103),
    /**
     * modern dance
     */
    ModernDance(104),
    /**
     * Disco
     */
    Disco(105),
    /**
     * tap dance
     */TapDance(106),
    /**
     * Wrestling
     */
    Wrestling(107),
    /**
     * Martial arts
     */
    MartialArts(108),
    /**
     * Tai Chi
     */
    TaiChi(109),
    /**
     * Muay Thai
     */

    MuayThai(110),
    /**
     * Judo
     */
    Judo(111),
    /**
     *Taekwondo
     */
    Taekwondo(112),
    /**
     * Karate
     */
    Karate(113),
    /**
     * Kickboxing
     */
    FreeSparring(114),
    /**
     * Swordsmanship
     */
    Swordsmanship(115),
    /**
     *Jiu Jitsu
     */
    Jujitsu(116),
    /**
     * Fencing
     */
    Fencing(117),
    /**
     *Beach Soccer
     */
    BeachSoccer(118),
    /**
     * Beach volleyball
     */
    BeachVolleyball(119),
    /**
     *softball
     */

    Softball(120),
    /**
     * Squash
     */
    Squash(121),
    /**
     * Goalball
     */
    Croquet(122),
    /**
     * cricket
     */
    Cricket(123),
    /**
     * Polo
     */
    Polo(124),
    /**
     * Racquetball
     */
    Wallball(125),
    /**
     * sepak takraw
     */
    TakrawBall(126),
    /**
     * dodgeball
     */
    Dodgeball(127),
    /**
     * Water polo
     */
    WaterPolo(128),
    /**
     * Shuttlecock
     */
    Shuttlecock(129),
    /**
     * Indoor football
     */

    IndoorSoccer(130),
    /**
     * cornhole ball
     */
    SandbagBall(131),
    /**
     * Bocce ball
     */
    BocceBall(132),
    /**
     * pelota ball
     */
    Jaileyball(133),
    /**
     * floor ball
     */
    Floorball(134),
    /**
     * Outdoor boating
     */
    OutdoorBoating(135),
    /**
     * Kayak
     */
    Kayak(136),
    /**
     * Dragon boat
     */
    DragonBoat(137),
    /**
     * Paddle boarding
     */
    PaddleBoard(138),
    /**
     * Indoor charging
     */
    IndoorFillingWaves(139),
    /**
     * Rafting
     */

    Drifting(140),
    /**
     * Water skiing
     */
    WaterSkiing(141),
    /**
     * Ski and snowboard
     */
    Snowboarding(142),
    /**
     *Snowboarding
     */
    Snowboard(143),
    /**
     *Alpine skiing
     */
    AlpineSkiing(144),
    /**
     * Cross-country skiing
     */
    CrossCountrySkiing(145),
    /**
     * Orienteering
     */
    OrienteeringSki(146),
    /**
     * Biathlon
     */
    Bathlon(147),
    /**
     * Outdoor skating
     */
    OutdoorSkating(148),
    /**
     * Indoor skating
     */
    IndoorSkating(149),
    /**
     * Snowmobile
     */

    SnowCar(150),
    /**
     * Snowmobile
     */
    Snowmobile(151),
    /**
     * Snowshoeing
     */
    Snowshoeing(152),
    /**
     * hula hoop
     */
    HulaHoop(153),
    /**
     * Frisbee
     */
    Frisbee(154),
    /**
     * Darts
     */
    Dart(155),
    /**
     * Fly a kite
     */
    FlyAKite(156),
    /**
     * Tug of war
     */
    TugOfWar(157),
    /**
     *Shuttlecock kicking
     */
    ShuttlecockKicking(158),
    /**
     * E-sports
     */
    ESports(159),
    /**
     * Walking machine
     */

    WanderingMachine(160),
    /**
     * Swing
     */
    Swing(161),
    /**
     * Shuffleboard
     */
    Shuffleboard(162),
    /**
     * Foosball table
     */
    TableSoccer(163),
    /**
     * Somatosensory games
     */
    SomatosensoryGame(164),
    /**
     * Chess
     */
    InternationalChess(165),
    /**
     * Checkers
     */
    Drafts(166),
    /**
     * Go
     */
    Go(167),
    /**
     * Bridge
     */
    Bridge(168),
    /**
     * Board games
     */
    BoardGame(169),
    /**
     * Archery
     */

    Archery(170),
    /**
     * Equestrian sports
     */
    EquestrianSports(171),
    /**
     * Climb stairs
     */
    ClimbingTheStairs(172),
    /**
     * driving
     */
    Drive(173),
    /**
     * Seated press
     */
    SeatedPush(174),
    /**
     * Seated chest press
     */
    SeatedChestPress(175),
    /**
     * Barbell
     */
    Barbell(176),
    /**
     * Long distance running
     */
    LongDistanceRunning(177),
    /**
     * Run at full speed
     */
    FullSpeedRun(178),
    /**
     * Variable speed running
     */
    VariableSpeedRun(179),
    /**
     * Arena cycling
     */

    RaceRiding(180),
    /**
     * Military Chess
     */
    MilitaryChess(181),
    /**
     * Mahjong
     */
    Mahjong(182),
    /**
     *Poker
     */
    Poker(183),
    /**
     * Backgammon
     */
    Gobang(184),
    /**
     * Chinese chess
     */
    ChineseChess(185),
    /**
     * High jump
     */
    HighJump(186),
    /**
     * long jump
     */
    LongJump(187),
    /**
     * Play top
     */
    SpinningTop(188),
    ;

    private int value;

    ESportType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }
}

```

###### Sample code

```kotlin
VPOperateManager.getInstance().readSportModelOrigin({
            if (it != Code.REQUEST_SUCCESS) {
                Log.e("Test", "write cmd failed")
            }
        }, object : ISportModelOriginListener {
            override fun onReadOriginProgress(progress: Float) {

            }

            override fun onReadOriginProgressDetail(
                day: Int,
                date: String?,
                allPackage: Int,
                currentPackage: Int
            ) {

            }

            override fun onHeadChangeListListener(sportModelHeadData: SportModelOriginHeadData?) {
                Log.e("Test", "sportModelHeadData:${sportModelHeadData.toString()}")
                
            }

            override fun onItemChangeListListener(sportModelItemDatas: MutableList<SportModelOriginItemData>?) {
                Log.e("Test", "sportModelItemDatas:${sportModelItemDatas.toString()}")
               
            }

            override fun onReadOriginComplete() {
                Log.e("Test", "readSportModelOrigin onReadOriginComplete")
            }

        })
```

#### Read sports mode status

###### Prerequisites

The device needs to support sports mode

###### API

```
readSportModelState(IBleWriteResponse bleWriteResponse, ISportModelStateListener sportModelStateListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ---------------------------- | ---------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| sportModelStateListener | ISportModelStateListener | Read sport mode status listener |

###### Return data

**ISportModelStateListener**--Monitoring of sports mode status

```kotlin
/**
 * Return sports mode status data
 *
 * @param sportModelStateData
 */
fun onSportModelStateChange(sportModelStateData:SportModelStateData)

/**
 * Monitoring the end of exercise
 */
fun onSportStopped()
```

**SportModelStateData**--Sports mode status data

| Variable | Type | Remarks |
| ------------- | ----------------------- | ------------------ |
| oprateStauts | ECheckWear | Operation status of sports mode |
| deviceStauts | ESportModelStateStauts | Sports mode device status |
| sportModeType | Int | Type of sport mode |

**ECheckWear**--Operating status of sports mode

| Variables | Remarks |
| ------------- | -------- |
| OPEN_SUCCESS | Open successfully |
| OPEN_FAIL | Open failed |
| CLOSE_SUCCESS | Closed successfully |
| CLOSE_FAIL | Close failed |
| READ_SUCCESS | Read successfully |
| READ_FAIL | Read failed |
| UNKONW | Unknown status |

**ESportModelStateStauts**--Sport mode device status

| Variables | Remarks |
| ----------------------- | ---------- |
| DEVICE_FREE | Device is free |
| DEVICE_BUSY | Device busy |
| DEVICE_HAD_START_BEFORE | The device has been turned on |
| UNKNOW | Unknown |

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance()
    .readSportModelState({

    }, object : ISportModelStateListener {
        override fun onSportModelStateChange(sportModelStateData: SportModelStateData) {
        }

        override fun onSportStopped() {
        }
    })
```

#### Turn on sports mode

###### Prerequisites

The device needs to support sports mode

###### API

```
startSportModel(bleWriteResponse, sportModelStateListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ---------------------------- | ---------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| sportModelStateListener | ISportModelStateListener | Read sport mode status listener |

###### Return data

Same as the data returned by [[Read Sports Mode Status](#Read Sports Mode Status)]

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance()
    .startSportModel({

    }, object : ISportModelStateListener {
        override fun onSportModelStateChange(sportModelStateData: SportModelStateData) {
        }

        override fun onSportStopped() {
        }
    })
```

#### End sports mode

###### Prerequisites

The device must support sports mode and have sports mode turned on

###### API

```
stopSportModel(bleWriteResponse, sportModelStateListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ---------------------------- | ---------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| sportModelStateListener | ISportModelStateListener | Read sport mode status listener |

###### Return data

Same as the data returned by [[Read Sports Mode Status](#Read Sports Mode Status)]

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance()
    .stopSportModel({

    }, object : ISportModelStateListener {
        override fun onSportModelStateChange(sportModelStateData: SportModelStateData) {
        }

        override fun onSportStopped() {
        }
    })
```

#### Start multi-sport mode

###### Prerequisites

The device needs to support sports mode

More than one minute must elapse between starting and ending multi-sport mode; sessions shorter than one minute are not saved as exercise data.

###### API

```
startMultSportModel(bleWriteResponse, sportModelStateListener, sportType)
```

###### Parameters

| Parameter name | Type | Remarks |
| ----------------------- | ---------------------------- | ---------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| sportModelStateListener | ISportModelStateListener | Read sport mode status listener |
| sportType | ESportType | sport type |

###### Return data

Same as the data returned by [[Read Sports Mode Status](#Read Sports Mode Status)]

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance()
    .startMultSportModel({

    }, object : ISportModelStateListener {
        override fun onSportModelStateChange(sportModelStateData: SportModelStateData) {
        }

        override fun onSportStopped() {
        }
    }, ESportType.INDOOR_WALK)
```

## Blood oxygen function

#### Prerequisites

Equipment is required to support blood oxygen function, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportSpo2h
```

#### Start measuring blood oxygen-startDetectSPO2H

Equipment is required to support blood oxygen function

###### API

```
startDetectSPO2H(IBleWriteResponse bleWriteResponse, ISpo2hDataListener spo2HDataListener, ILightDataCallBack lightDataCallBack)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | --------------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| spo2HDataListener | ISpo2hDataListener | Callback for blood oxygen operation, returns blood oxygen data: whether supported, on/off status, blood oxygen value |
| lightDataCallBack | ILightDataCallBack | Original light signal monitoring |

###### Return data

**ISpo2hDataListener**--Callback for blood oxygen operation

```kotlin
/**
 * Return blood oxygen operation data
 * @param spo2HData blood oxygen operation data
 */
fun onSpO2HADataChange(spo2HData:Spo2hData)
```

**spo2HData**--blood oxygen operation data

| Variable | Type | Remarks |
| ------------- | ------------- | ------------- |
| spState | ESPO2HStatus | Blood oxygen function status |
| deviceState | EDeviceStatus | device status |
| value | Int | blood oxygen value |
| isChecking | Boolean | Whether it is being checked |
| checkingProgress | Int | Blood oxygen testing progress |
| rateValue | Int | Heart rate value |

**ESPO2HStatus**--blood oxygen function status

| Variables | Remarks |
| ---------- | ---------- |
| NOT_SUPPORT | This feature is not supported |
| CLOSE | Closed status |
| OPEN | Open status |
| UNKONW | Unknown |

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().startDetectSPO2H({

}, { spo2HData ->
        val message = "Blood Oxygen-Start:\n$spo2HData"
    }) { data ->
    val message = "Blood oxygen-photoelectric signal:${Arrays.toString(data)}".trimIndent()
}
```

#### End blood oxygen measurement-stopDetectSPO2H

The device needs to support blood oxygen function

###### API

```kotlin
stopDetectSPO2H(bleWriteResponse, spo2HDataListener) 
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | --------------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| spo2HDataListener | ISpo2hDataListener | Callback for blood oxygen operation, returns blood oxygen data: whether supported, on/off status, blood oxygen value |

###### Return data

The data returned is consistent with [[Start measuring blood oxygen-startDetectSPO2H](#Start measuring blood oxygen-startDetectSPO2H)]

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().stopDetectSPO2H({

}) { spo2HData ->
    val message = "Blood Oxygen-End:\n$spo2HData"
}
```

#### Read blood oxygen automatic detection switch status

Equipment is required to support blood oxygen function

###### API

```
readSpo2hAutoDetect(bleWriteResponse, allSetDataListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | ----------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| allSetDataListener | IAllSetDataListener | Callback of automatic blood oxygen detection switch |

###### Return data

**IAllSetDataListener**--Callback of blood oxygen automatic detection switch

```kotlin
/**
 * Return multiple setting data
 *
 * @param alarmData Multiple setting data
 */
fun onAllSetDataChangeListener(alarmData:AllSetData);
```

**AllSetData**--Multiple setting data

| Variable | Type | Remarks |
| -------------------------- | ------------- | ------------------------------- |
| type | EAllSetType | The set type 0x00 represents automatic blood oxygen detection |
| startHour | Int | Start hour |
| startMinute | Int | Start minute |
| endHour | Int | end hour |
| endMinute | Int | end minute |
| oprate | Int | Operation: 0 to set, 1 to read |
| openState | Int | Switch state: 0 off, 1 on |
| oprateResult | EAllSetStatus | Set status |
| isOpen | Int | Whether to open detection |

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().readSpo2hAutoDetect({
    if (it != Code.REQUEST_SUCCESS) {
        Log.e("Test", "write cmd failed")
    }
}, {allSetData->
    
})
```

#### Set the blood oxygen automatic detection switch status

Equipment is required to support blood oxygen function

###### API

```kotlin
settingSpo2hAutoDetect(bleWriteResponse, allSetDataListener, allSetSetting)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | ----------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| allSetDataListener | IAllSetDataListener | Callback of automatic blood oxygen detection switch |
| allSetSetting | AllSetSetting | Related settings |

**AllSetSetting**--related settings

| Variable | Type | Remarks |
| ----------- | ----------- | ------------------------------- |
| type | EAllSetType | The set type 0x00 represents automatic blood oxygen detection |
| startHour | Int | Start hour |
| startMinute | Int | Start minute |
| endHour | Int | end hour |
| endMinute | Int | end minute |
| oprate | Int | Operation: 0 to set, 1 to read |
| openState | Int | Switch state: 0 off, 1 on |

###### Return data

It is consistent with the data returned by [[Read blood oxygen automatic detection switch status](#Read blood oxygen automatic detection switch status)].

###### Sample code

```kotlin
//        kotlin code
val setting = 0
val open = 1
val startHour = 22
val startMinute = 0
val endHour = 8
val endMinute  = 0
val allSetSetting = AllSetSetting(EAllSetType.SPO2H_NIGHT_AUTO_DETECT,startHour,startMinute,endHour,endMinute,setting,open)
VPOperateManager.getInstance().settingSpo2hAutoDetect({
    if (it != Code.REQUEST_SUCCESS) {
        Log.e("Test", "write cmd failed")
    }
}, { allSetData ->

}, allSetSetting)
```

#### Read blood oxygen daily data

The reading and writing of blood oxygen daily data is returned in [[Read Daily Data Function](#Read Daily Data Function)]

## Blood sugar function

Blood sugar functions mainly include

1. Blood glucose monitoring switch and unit settings
2. Reading blood glucose data generated by daily wearing of the watch
3. Manual blood glucose measurement
4. Blood glucose private calibration mode reading and setting
5. Blood glucose multi-calibration mode reading and setting

#### Blood glucose monitoring switch and unit settings

###### Blood glucose switch and unit settings

```
VPOperateManager.getInstance().changeCustomSetting(writeResponse, ICustomSettingDataListener, customSetting)
```

###### Blood glucose unit switch status and unit reading

```
VPOperateManager.getInstance().readCustomSetting(writeResponse,ICustomSettingDataListener);
```

| Parameter name | Type | Description |
| -------------------------- | -------------------------- | -------------------- |
| writeResponse | IBleWriteResponse | Command write callback |
| ICustomSettingDataListener | ICustomSettingDataListener | Set success or failure callback |
| customSetting | CustomSetting | Switch settings for related functions |

Personalized setting callback ICustomSettingDataListener,

When the settings change, the OnSettingDataChange method will be called back and will return all parameter setting status of the current watch, specifically including the status of each switch in customSettingData.

```
public interface ICustomSettingDataListener extends IListener {
    /**
     * Return personalized settings data
     *
     * @param customSettingData Personalized setting data
     */
    void OnSettingDataChange(CustomSettingData customSettingData);
}
```

**CustomSetting**

| Attribute name | Type | Description |
| :-------------------- | ----------------- | ---------------------------------- |
| bloodGlucoseDetection | EFunctionStatus | Blood glucose function status: whether it is supported and whether it is turned on. |
| bloodGlucoseUnit | EBloodGlucoseUnit | Blood glucose unit: default mmol/L, or mgdl |

#### Daily blood glucose data reading

Blood glucose daily data reading In the daily data reading interface, the following four interfaces can obtain daily blood glucose data. When the blood glucose monitoring switch is turned on and worn, daily blood glucose data can be read for up to three days. Blood glucose data is obtained in the interface IOriginData3Listener.onOriginFiveMinuteListDataChange(originDataList)

1. How many days of daily data are read (input parameter watchday)

```
    /***
        * If the data stored in the watch is 3 days
        * Read raw data, one piece every 5 minutes. The data includes step counting, heart rate, blood pressure, and exercise volume. The reading order is today-yesterday-the day before yesterday. Theoretically, there are 288 pieces of data in one day.
        *
        * @param bleWriteResponse monitoring of write operations
        * @param originDataListener callback of original data. The returned data includes step counting, heart rate, blood pressure, and amount of exercise.
        * @param watchday The data capacity that the watch can store (unit: day), depends on the device. After password verification, in the onFunctionSupportDataChange callback, the return value can be obtained through getWatchday()
        */
       public void readOriginData(IBleWriteResponse bleWriteResponse, IOriginData3Listener originDataListener, int watchday)
   

```2. Customized and differentiated reading of daily data

```
    /**
        * Read the original data. This method can customize the day to be read and the number of items to be read from that day to avoid repeated reading.
        *, for example, if [yesterday, 150] is set, then the reading order is [yesterday{150}-end of yesterday-day before yesterday]
        *
        * @param bleWriteResponse monitoring of write operations
        * @param originDataListener callback of original data. The returned data includes step counting, heart rate, blood pressure, and amount of exercise.
        * @param day Which day to read, 0 means today, 1 means yesterday, 2 means the day before yesterday, and so on. If the value passed in is yesterday, then the reading order is yesterday - the day before yesterday -...,
        * @param position The position of the number of items to be read, up to 288 items per day (5 minutes per item), you can define the position of the number of items to be read, the value of this parameter must be greater than or equal to 1
        * @param watchday The data capacity that the watch can store (unit: day), depends on the device. After password verification, in the onFunctionSupportDataChange callback, the return value can be obtained through getWatchday()
        */
       public void readOriginDataFromDay(IBleWriteResponse bleWriteResponse, IOriginData3Listener originDataListener, int day, int position, int watchday)
   

```3. Customize the day to read and the number of items on the day to start reading, and only read the current day.

```
    /***
        * Read the original data. This method can customize the day to be read and the number of items to be read from that day, and only read the current day.
        *, for example, if [yesterday, 150] is set, then the reading order is [yesterday{150}-end of yesterday]
        *
        * @param bleWriteResponse monitoring of write operations
        * @param originDataListener callback of original data. The returned data includes step counting, heart rate, blood pressure, and amount of exercise.
        * @param day Which day to read, 0 means today, 1 means yesterday, 2 means the day before yesterday, and so on.
        * @param position The position of the number of items to be read, up to 288 items per day (5 minutes per item), you can define the position of the number of items to be read, the value of this parameter must be greater than or equal to 1
        * @param watchday The data capacity that the watch can store (unit: day), depends on the device. After password verification, in the onFunctionSupportDataChange callback, the return value can be obtained through getWatchday()
        */
       public void readOriginDataSingleDay(IBleWriteResponse bleWriteResponse, IOriginData3Listener originDataListener, int day, int position, int watchday)
   

```4. Customize which day to read and which item of the day to start reading from, whether to read only the current day

```
 /***
     * Read the original data. This method can customize which day to read and which item to read from that day. Whether to read only the current day.
     *
     * @param bleWriteResponse monitoring of write operations
     * @param originDataListener callback of original data. The returned data includes step counting, heart rate, blood pressure, and amount of exercise.
     * @param readOriginSetting The setting for reading original data
     */
    public void readOriginDataBySetting(IBleWriteResponse bleWriteResponse, IOriginProgressListener originDataListener, ReadOriginSetting readOriginSetting)
```

##### Daily blood glucose data acquisition callback

This interface will call back after the day's data reading is completed. (One OriginData3 data represents a five-minute raw data, and a maximum of 24 hours * 60 minutes / 5 minutes = 288 pieces of five-minute raw data in a day), so a maximum of 288 pieces of blood glucose data will be generated in a day.

```
public interface IOriginData3Listener extends IOriginProgressListener {

    /**
     * This interface will call back after the day's data reading is completed. (One OriginData3 data represents a five-minute raw data, and a maximum of 24 hours * 60 minutes / 5 minutes = 288 pieces of five-minute raw data in a day)
     * For example, reading three days of raw data will return the five-minute raw data list of today - yesterday - the day before yesterday.
     * Specifically, it depends on how many days of raw data have been read. How many days will the interface be called?
     *
     * @param originDataList returns a list of 5-minute data. The heart rate value is an array, and its corresponding field is getPpgs(), not getRateValue()
     */
    void onOriginFiveMinuteListDataChange(List<OriginData3> originDataList);
    ...
}
```

OriginData3 is the original data object; daily blood glucose values can be read from this structure.

```java
public class OriginData3 extends OriginData {
    ...
    
    /**
     * Blood sugar level
     */
    public float bloodGlucose;
    
    /**
    *Glycemic risk level
  */
    public EBloodGlucoseRiskLevel bloodGlucoseRiskLevel;


  ...
}

```

| Parameter name | Type | Default unit |
| --------------------- | --------------------- | -------- |
| bloodGlucose | float | mmol/L |
| bloodGlucoseRiskLevel | EBloodGlucoseRiskLevel | None |

```java
public enum EBloodGlucoseRiskLevel {
    /**
     * low risk
     */
    LOW,
    /**
     * Medium risk
     */
    MIDDLE,
    /**
     * High risk
     */
    HIGH,
    /**
     * No level
     */
    NONE,
}
```

Note: bloodGlucoseRiskLevel is only valid when the device supports blood glucose risk assessment. In other cases, level is useless. Whether the device supports blood glucose risk assessment is determined as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportBloodGlucoseRiskAssessment
```

#### Blood glucose measurement

##### Turn on blood glucose measurement

```
VPOperateManager.getInstance().startBloodGlucoseDetect(writeResponse,listener)
```

| Parameter name | Type | Remarks |
| ------------- | -------------------------- | ------------- |
| writeResponse | IBleWriteResponse | Command write callback |
| listener | IBloodGlucoseChangeListener | Blood glucose measurement result callback |

##### Stop blood glucose monitoring

```
VPOperateManager.getInstance().startBloodGlucoseDetect(writeResponse,listener)
```

| Parameter name | Type | Remarks |
| :--------------------- | --------------------------- | ------------- |
| writeResponse | IBleWriteResponse | Command write callback |
| listener | IBloodGlucoseChangeListener | Blood glucose measurement result callback |

##### Blood glucose measurement result callback

###### Blood glucose measurement in progress

```java
 /**
     * Blood glucose measurement value
     *
     * @param progress measurement progress
     * @param bloodGlucose blood sugar value
     * @param bloodGlucose Blood glucose risk level. This value is only valid if the device supports blood glucose risk assessment. It is invalid in other cases.
     */
    void onBloodGlucoseDetect(int progress, float bloodGlucose,EBloodGlucoseRiskLevel level);

```

###### Blood glucose measurement stopped

```
 /**
     * Blood glucose measurement stopped
     */
    void onBloodGlucoseStopDetect();
```

###### Abnormal blood glucose measurement

```
    /**
     * Blood glucose measurement failed
     *
     * @param opt opcode
     * @param status error status
     */
    void onDetectError(int opt, EBloodGlucoseStatus status);
```

***Blood glucose measurement status enumeration***

```
EBloodGlucoseStatus
```

| Definition | Description |
| ------------- | ------------- |
| NONSUPPORT | Not supported |
| ENABLE | Available |
| DETECTING | Measuring |
| LOW_POWER | Low battery cannot be measured |
| BUSY | The device is busy |
| WEARING_ERROR | Wearing error |

#### Blood sugar private mode

##### Blood glucose private mode reading

```
VPOperateManager.getInstance().readBloodGlucoseAdjustingData(writeResponse,listener)
```

| Parameter name | Type | Remarks |
| ------------- | -------------------------- | -------------------- |
| writeResponse | IBleWriteResponse | Command write callback |
| listener | IBloodGlucoseChangeListener | Blood glucose private mode read callback |

###### Reading success callback

```
   /**
     * Blood glucose private mode setting read callback
     *
     * @param isOpen whether to open
     * @param adjustingValue Private mode blood glucose calibration value
     */
    void onBloodGlucoseAdjustingReadSuccess(boolean isOpen, float adjustingValue);
```

###### Read failure callback

```
    /**
     * Blood glucose private mode calibration read failure callback
     */
    void onBloodGlucoseAdjustingReadFailed();
```

##### Blood sugar private mode settings

```
VPOperateManager.getInstance().setBloodGlucoseAdjustingData(fValue, isOpen, writeResponse, AbsBloodGlucoseChangeListener)
```

| Parameter name | Type | Description |
| -------------------------- | -------------------------- | -------------------- |
| fValue | float | private mode blood glucose calibration value |
| isOpen | boolean | Whether to turn on blood glucose private mode |
| writeResponse | IBleWriteResponse | Command write callback |
| AbsBloodGlucoseChangeListener | IBloodGlucoseChangeListener | Blood glucose operation callback |

###### Set success callback

```
/**
     * Successful callback of blood sugar private mode setting
     *
     * @param isOpen whether to open
     * @param adjustingValue Private mode blood glucose calibration value
     */
    void onBloodGlucoseAdjustingSettingSuccess(boolean isOpen, float adjustingValue);
```

###### Set failure callback

```
    /**
     * Blood glucose private mode calibration setting failure callback
     */
    void onBloodGlucoseAdjustingSettingFailed();
```

#### Blood glucose multi-calibration mode

###### Prerequisites

The device needs to support blood glucose multi-calibration mode, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportBloodGlucoseMultipleAdjusting
```

##### Read blood glucose multi-calibration mode data

The device needs to support blood glucose multi-calibration mode

###### API

```kotlin
readMultipleCalibrationBGValue(bleWriteResponse, listener)
```

###### Parameters

| Parameter name | Type | Remarks |
|----------------|-----------------------------|--------------|
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| listener | AbsBloodGlucoseChangeListener | Blood glucose operation callback |

###### Reading success callback

```java
 /**
     * Multi-calibration mode read successfully
     *
     * @param isOpen whether to open
     * @param breakfast breakfast
     * @param lunch Chinese food
     * @param dinner dinner
     */
    void onBGMultipleAdjustingReadSuccess(boolean isOpen, MealInfo breakfast, MealInfo lunch, MealInfo dinner);
```

###### Read failure callback

```java
/**
     * Multi-calibration mode read failed
     */
    void onBGMultipleAdjustingReadFailed();
```

**MealInfo** -- Multiple calibration mode data

| Variable | Type | Remarks |
| ------------------ | ------- | -------------------------------------------------- |
| index | Int | The tag of the current meal. 1: Breakfast, 2: Lunch, 3: Dinner.         |
| bgBeforeMeal | Float | Premeal blood glucose calibration value, unit mmol/L |
| bgAfterMeal | Float | After-meal blood glucose calibration value, unit mmol/L |
| bgBeforeMeal_mgDL | Int | Premeal blood glucose calibration value, unit mg/dL |
| bgAfterMeal_mgDL | Int | After-meal blood glucose calibration value, unit mg/dL |
| beforeMealTime | Int | Time before meal (minutes): hours + minutes, for example: 08:30 = 8*60+30 |
| afterMealTime | Int | Aftermeal time (minutes): hours + minutes |
| isUnitMmolL | Boolean | Whether the unit is mmol/L, priority setting |

##### Set blood glucose multi-calibration mode data

The device needs to support blood glucose multi-calibration mode

###### API

```kotlin
settingMultipleCalibrationBGValue(isOpen, breakfast, lunch, dinner, bleWriteResponse, listener)
```

###### Parameters

| Parameter name | Type | Remarks |
|----------------|-----------------------------| ------------------|
| isOpen | Boolean | Whether to open multi-calibration mode |
| breakfast | MealInfo | Breakfast multi-calibration data |
| lunch | MealInfo | Lunch multi-calibration data |
| dinner | MealInfo | dinner multi-calibration data |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| listener | AbsBloodGlucoseChangeListener | callback for blood glucose operations |

###### Set success callback

```java
/**
 *Multiple calibration mode set successfully
 *
 */
void onBGMultipleAdjustingSettingSuccess();
```

###### Set failure callback

```java
/**
 *Multiple calibration mode setup failed
 */
void onBGMultipleAdjustingSettingFailed();
```

**Note:**

1. The time interval between two meals must be greater than 2 hours;
2. The time after a meal must be greater than the time before a meal

##Female features

#### Prerequisites

The device needs to support female functions, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportWomenSetting
```

#### Set female function

The device needs to support female functions

###### API

```kotlin
settingWomenState(bleWriteResponse, womenDataListener, womenSetting)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | --------------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| womenDataListener | IWomenDataListener | Monitoring of female status operations, returning the status of the operation |
| womenSetting | WomenSetting | Setting class for female status, including a total of 4 statuses [menstrual period, pregnancy preparation period, pregnancy period, mommy period] |

**WomenSetting**--Setting of female status

| Parameter name | Type | Remarks |
| -------------- | ---------- | ------------------------------- |
| menseLength | Int | Female menstrual length, range is [4-28 days] |
| menesInterval | Int | The length of the menstrual cycle |
| menesLasterday | TimeData | The time of the last menstrual period, accurate to the day |
| babyBirthday | TimeData | The child's birth date, as accurate as the day of birth |
| confinementDay | TimeData | The expected date of delivery of a pregnant woman, accurate to the day |
| womenStatus | EWomenStatus | Women's status |
| babySex | ESex | Child’s gender: MAN male, WOMAN female |

>1. When a woman’s status is [menstrual period] and [pregnancy preparation period], use this construction method WomenSetting(womenStatus, menseLength, menesInterval, menesLasterday)
>2. When a woman’s status is [mom stage], use this construction method WomenSetting(womenStatus, menseLength, menesInterval, menesLasterday, babySex, babyBirthday)
>3. When the woman’s status is [pregnancy], use this construction method WomenSetting(womenStatus, menesLasterday, confinementDay)

**EWomenStatus**

| Parameter name | Remarks |
| -------- | -------- |
| NONE | No status |
| MENES | Menstrual status |
| PREREADY | Preparation status |
| PREING | Pregnancy status |
| MAMAMI | Mommy status |

###### Return data

**IWomenDataListener**--Listening for female status operations

```kotlin
/**
 * Returns female data
 *
 * @param womenData female data
 */
fun onWomenDataChange(womenData:WomenData)
```

**WomenData**--Female status data

| Variable | Type | Remarks |
| ------------ | ------------------ | ---------------- |
| oprateStatus | EWomenOprateStatus | Female status setting status |

**EWomenOprateStatus**--Set status

| Variables | Remarks |
| ------------------ | ---------------- |
| SETTING_SUCCESS | Set female status successfully |
| SETTING_FAIL | Failed to set female status |
| READ_SUCCESS | Read female status successfully |
| READ_FAIL | Failed to read female status |
| UNKONW | Unknown status |

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().settingWomenState(
    {

    },
    { womenData ->
        val message = "Female Status-Settings:\n$womenData"
    }, WomenSetting(EWomenStatus.PREING, TimeData(2016, 3, 1), TimeData(2017, 1, 14))
)
```

#### Read female function

The device needs to support female functions

###### API

```kotlin
readWomenState(IBleWriteResponse bleWriteResponse, IWomenDataListener womenDataListener)
```

###### Parameters

| Parameter name | Type | Remarks |
| ------------------ | ------------------ | ---------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| womenDataListener | IWomenDataListener | Monitoring of female status operations, returning the status of the operation |

###### Return data

Same as the data returned by [[Set Female Function](#SET Female Function)]

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().readWomenState(
    writeResponse
) { womenData ->
    val message = "Female Status-Read:\n$womenData"
}
```

## Blood pressure function

Blood pressure functions mainly include

1. Automatic blood pressure monitoring switch setting and reading
2. Reading blood pressure data generated by daily wearing of the watch
3. Manual blood pressure measurement
4. Blood pressure mode setting
5. Blood pressure function setting and reading

### Blood pressure automatic monitoring switch setting and reading

The reading and setting of the blood pressure function switch are located in the personalization settings, please refer to the document module [[Personalization Settings](#Personalization Settings)]

### Daily blood pressure data reading

Daily blood pressure data reading is located in daily data reading, please refer to the document module [[Read daily data function](## Read daily data function)]

#### Blood pressure data in five minutes of raw data

OriginData generates original data for five minutes, and daily blood pressure values can be obtained in the data structure. The changed data will be called back in the daily reading interface.

```
public interface IOriginData3Listener extends IOriginProgressListener {

    /**
     * This interface will call back after the day's data reading is completed. (One OriginData3 data represents a five-minute raw data, and a maximum of 24 hours * 60 minutes / 5 minutes = 288 pieces of five-minute raw data in a day)
     * For example, reading three days of raw data will return the five-minute raw data list of today - yesterday - the day before yesterday.
     * Specifically, it depends on how many days of raw data have been read. How many days will the interface be called?
     *
     * @param originDataList returns a list of 5-minute data. The heart rate value is an array, and its corresponding field is getPpgs(), not getRateValue()
     */
    void onOriginFiveMinuteListDataChange(List<OriginData3> originDataList);
    
  ...
 }
```

The blood pressure value is in class OriginData

```
public class OriginData {
    ...
    
    /**
     * High pressure value, range [60-300]
     */
    private int highValue;
    /**
     * Low voltage value, range [20-200]
     */
    private int lowValue;
    
  ...
}

```

| Parameter name | Type | Description |
| --------- | ---- | ------------------------------- |
| highValue | int | High voltage value, ranging from 60-300 (inclusive) |
| lowValue | int | Low voltage value, ranging from 20-200 (inclusive) |

#### Statistics of blood pressure data in thirty minutes

OriginHalfHourData is 30 minutes of raw data, including step counting, heart rate, and blood pressure. It is a summary of the original five minutes of data every 30 minutes.

OriginHalfHourData

| Members | Type | Description |
| ------------------ | ----------------------- | ------------------ |
| halfHourRateDatas | List<HalfHourRateData> | Thirty-minute heart rate data array |
| halfHourBps | List<HalfHourBpData> | Thirty-minute blood pressure data array |
| halfHourSportDatas | List<HalfHourSportData> | Thirty-minute sports data array |
| allStep | int | Summary of total steps in thirty minutes |

HalfHourBpData

| Members | Type | Description |
| --------- | -------- | --------------------------------------------------------------- |
| highValue | int | High voltage value, ranging from 60-300 (inclusive) |
| lowValue | int | Low voltage value, ranging from 20-200 (inclusive) |
| date | String | The date it belongs to, the date format is yyyy-mm-dd |
| time | TimeDate | The specific time can be accurate to the minute at most. For example, 10:00 represents the average value of the interval from 10:00 to 10:30 |

### Manual blood pressure measurement

#### Enable manual blood pressure measurement

```
VPOperateManager.getInstance().startDetectBP(writeResponse, listener, detectModel);
```

| Parameter name | Type | Remarks |
| ------------- | -------------------------- | --------------------------------------------------------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| listener | IBPDetectDataListener | Blood glucose measurement result callback |
| detectModel | EBPDetectModel | Blood pressure measurement mode:<br />Private mode: DETECT_MODEL_PRIVATE<br />General mode: DETECT_MODEL_PUBLIC |

#### Stop manual blood pressure measurement

```
VPOperateManager.getInstance().stopDetectBP(writeResponse, detectModel)
```

| Parameter name | Type | Remarks |
| :--------------------- | ----------------- | --------------------------------------------------------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| detectModel | EBPDetectModel | Blood pressure measurement mode:<br />Private mode: DETECT_MODEL_PRIVATE<br />General mode: DETECT_MODEL_PUBLIC |

#### Blood pressure measurement related callbacks and data

Blood pressure manual measurement callback interface

```
/**
 * Monitoring of blood pressure data return
 */
public interface IBPDetectDataListener extends IListener {
    /**
     * Return blood pressure data
     *
     * @param bpData blood pressure data
     */
    void onDataChange(BpData bpData);
}

```

Blood pressure data BpData

| Members | Type | Description |
| -------------- | --------------- | --------------------------------------------------------------- |
| status | EBPDetectStatus | Blood pressure detection status<br />STATE_BP_BUSY: The device is busy, indicating that blood pressure cannot be measured. When receiving this return, please call to end blood pressure measurement<br />STATE_BP_NORMAL: Indicates that blood pressure measurement can be performed |
| progress | int | Blood pressure measurement progress, range [0-100] |
| highPressure | int | High pressure value, range [60-300], if it is not within this range, please prompt that user measurement is invalid |
| lowPressure | int | Low pressure value, range [20-200], if it is not within this range, please prompt that user measurement is invalid |
| isHaveProgress | boolean | true means the watch has returned progress, false means there is no progress. A watch with no progress will return data 55 seconds after starting measurement |

### Blood pressure mode setting

#### Blood pressure measurement mode setting

```
VPOperateManager.getInstance().settingDetectBP(writeResponse, listener, bpSetting)
```

| Parameter name | Type | Description |
| ------------- | ----------------------- | ---------------------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| listener | IBPSettingDataListener | blood pressure mode setting callback |
| bpSetting | BpSetting | Blood pressure private mode setting parameters related |

Blood pressure setting class BpSetting

| Members | Type | Description |
| ------------------ | ------- | ---------------------------------- |
| isOpenPrivateModel | boolean | Automatically measure whether private mode is turned on |
| high | int | User's private high voltage value |
| low | int | User's private low voltage value |
| isAngioAdjuste | boolean | Whether to enable dynamic blood pressure calibration |

**When isOpenPrivateModel is set to true and isAngioAdjuste is set to false, it means that the *blood pressure private mode is enabled at this time***

**When isOpenPrivateModel is set to false and isAngioAdjuste is set to true, it means that the *blood pressure dynamic adjustment mode is turned on at this time***

#### Blood pressure measurement mode reading

```
VPOperateManager.getInstance().readDetectBP(writeResponse, listener)
```

| Parameter name | Type | Description |
| ------------- | ----------------------- | ------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| listener | IBPSettingDataListener | Blood pressure mode reading callback |

#### Blood pressure dynamic debugging mode canceled

```
boolean isOpenPrivateModel = false;
boolean isAngioAdjust = true;
BpSetting bpSetting = new BpSetting(isOpenPrivateModel, 111, 88);
//Whether to enable dynamic blood pressure adjustment mode, the function flag is located on the return of password verification
bpSetting.setAngioAdjuste(isAngioAdjuste);
VPOperateManager.getInstance().cancelAngioAdjust(writeResponse, new IBPSettingDataListener() {
    @Override
    public void onDataChange(BpSettingData bpSettingData) {
        String message = "BpSettingData:\n" + bpSettingData.toString();
        Logger.t(TAG).i(message);
        sendMsg(message, 1);
    }
}, bpSetting);
```

Blood pressure mode setting read listening, when the setting or reading is successful, the IBPSettingDataListener.onDataChange method will be called back

```
/**
 * The device saves the monitoring of private blood pressure data returned
 */
public interface IBPSettingDataListener extends IListener {
    /**
     * Return of privately saved blood pressure data
     *
     * @param bpSettingData privately saved blood pressure data
     */
    void onDataChange(BpSettingData bpSettingData);
}
```BpSettingData

| Members | Type | Description |
| -------------------------- | -------------- | --------------------------------------------------------------- |
| status | EBPStatus | Status of operating ambulatory blood pressure calibration: |
| model | EBPDetectModel | Blood pressure measurement mode:<br />DETECT_MODEL_PRIVATE: private mode<br />DETECT_MODEL_PUBLIC: common mode |
| highPressure | int | The private high pressure value saved by the device. If it is 0, it means that when measuring in private mode, private data needs to be set first |
| lowPressure | int | Private low pressure value saved by the device, range [20-200] |
| angioAdjusterProgress | int | Progress of dynamic blood pressure adjustment [0-100] |
| isAngioAdjuster | boolean | The status of dynamic blood pressure adjustment, true indicates that the current status is dynamic blood pressure adjustment |

Blood pressure calibration status:

EBPStatus

| SETTING_NORMAL_SUCCESS | Turn off private mode [also called setting universal mode] successfully |
|-------------------------------- | ---------------------------------- |
| SETTING_NORMAL_FAIL | Failed to turn off private mode [also called setting universal mode] |
| SETTING_PRIVATE_SUCCESS | Set private mode successfully |
| SETTING_PRIVATE_FAIL | Setting private mode failed |
| READ_SUCCESS | Read blood pressure pattern successfully |
| READ_FAIL | Failed to read blood pressure pattern |
| CANCEL_ANGIO_ADJUSTER_SUCCESS | Cancellation of dynamic blood pressure adjustment successfully |
| CANCELE_ANGIO_ADJUSTER_FAIL | Failed to set private mode |
| ANGIO_ADJUSTER_ING | Blood pressure dynamic calibration in progress |
| ANGIO_ADJUSTER_FAIL | Blood pressure dynamic calibration failed |
| ANGIO_ADJUSTER_SUCCESS | Blood pressure dynamic calibration successful |
| ANGIO_ADJUSTER_DEVICE_BUSY | The device is busy during blood pressure dynamic calibration |
| UNKONW | Unknown status |

### Blood pressure function setting and reading

#### Read blood pressure function

```
VPOperateManager.getInstance().readBpFunctionState(writeResponse, IBPFunctionListener)
```

#### Set blood pressure function

```
VPOperateManager.getInstance().settingBpFunctionState(writeResponse, IBPFunctionListener, isOpen)
```

Functional interface and parameter description

| Parameter name | Type | Description |
| ------------------- | ------------------- | ----------------------------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| IBPFunctionListener | IBPFunctionListener | Blood pressure function read setting callback listening |
| isOpen | boolean | Whether to open true: open, false: closed |

IBPFunctionListener

```
/**
 * Status return of blood pressure function
 */
public interface IBPFunctionListener extends IListener {
    /**
     * Returns the status of the blood pressure function
     *
     * @param bpFunctionData status of blood pressure function
     */
    void onDataChange(BpFunctionData bpFunctionData);
}
```BpFunctionData: blood pressure function status

| Cost Name | Type | Description |
| --------- | ------- | ---------------- |
| isSupport | boolean | Whether to support blood pressure detection |
| isOpen | boolean | Whether the blood pressure function is turned on |

## Alarm clock function

Alarm clocks are divided into three major categories: alarm clocks:

1. Ordinary alarm clock (only supports 3)
2. Scene alarm clock (supports 20)
3. Text alarm clock (supports 10)

A successfully connected device must only support one alarm clock. When the user performs a device password verification operation, the device will update and report the device function support type, including the alarm clock type. (When the device performs password verification, the incoming listening [IDeviceFuctionDataListener] will report the alarm type [please refer to Password Verification](\#Verification Password Operation))
The alarm clock includes the function of adding, deleting, modifying and checking the alarm clock.

### Ordinary alarm clock

AlarmSetting: alarm clock entity class

```
public class AlarmSetting {
    private int alarmTime;
    private boolean isOpen;

    /**
     * Hours, minutes, whether to switch on or off
     *
     * @param alarmHour
     * @param alarmMinute
     * @param isOpen
     */
    public AlarmSetting(int alarmHour, int alarmMinute, boolean isOpen) {
        this.alarmTime = alarmHour * 60 + alarmMinute;
        this.isOpen = isOpen;
    }
```

| member name | type | description |
| --------- | ------- | -------------------------------------------------- |
| alarmTime | int | alarm time = (hour * 60 + minutes) |
| isOpen | boolean | Whether to open, true means the alarm is on, false means the alarm is off |

#### Read alarm clock list

Usage examples:

```
VPOperateManager.getInstance().readAlarm(writeResponse, new IAlarmDataListener() {
                @Override
                public void onAlarmDataChangeListener(AlarmData alarmData) {
                    String message = "Read alarm clock:\n" + alarmData.toString();
                    Logger.t(TAG).i(message);
                    sendMsg(message, 1);
                }
            });
```

| Parameter name | Type | Description |
| ------------- | ------------------ | --------------------------------------------------------------- |
| writeResponse | IBleWriteResponse | Command write callback |
| listener | IAlarmDataListener | Alarm data callback, this method will be called back when reading, setting and alarm status changes |

AlarmData: Alarm clock list encapsulation class

| member name | type | description |
|---------------- | ------------------ | --------------------------------------------------------------- |
| status | EAalarmStatus | Status after operating the alarm:<br />SETTING_SUCCESS: Operation successful<br />SETTING_FAIL: Operation failed<br />READ_SUCCESS: Reading successful<br />READ_FAIL: Reading failed<br />UNKONW: Unknown exception |
| alarmSettingList | List<AlarmSetting> | Alarm clock list |

#### Set alarm clock

Usage examples:

```
List<AlarmSetting> alarmSettingList = new ArrayList<>(3);

AlarmSetting alarmSetting1 = new AlarmSetting(14, 10, true);
AlarmSetting alarmSetting2 = new AlarmSetting(15, 20, true);
AlarmSetting alarmSetting3 = new AlarmSetting(16, 30, true);

alarmSettingList.add(alarmSetting1);
alarmSettingList.add(alarmSetting2);
alarmSettingList.add(alarmSetting3);

VPOperateManager.getInstance().settingAlarm(writeResponse, new IAlarmDataListener() {
    @Override
    public void onAlarmDataChangeListener(AlarmData alarmData) {
        String message = "Set alarm:\n" + alarmData.toString();
        Logger.t(TAG).i(message);
        sendMsg(message, 1);
    }
}, alarmSettingList);
```

### Scene alarm clock (new alarm clock)

The difference between scene alarm clocks and ordinary alarm clocks is that the watch can set more alarm clocks (up to 20 scene alarm clocks) and the content of the alarm clock is richer. The watch supports corresponding scene icons.

Alarm2Setting: scene alarm clock

| member name | type | description |
|---------------- | ------- | --------------------------------------------------------------- |
| MAFlag | String | The only flag of the alarm clock |
| BluetoothAddress | String | The Bluetooth address to which the alarm clock belongs |
| alarmId | int | Alarm clock serial number, the serial number range is [1-20] |
| alarmHour | int | Saved in 24-hour format, hours |
| alarmMinute | int | Saved in 24-hour format, minutes |
| repeatStatus | | The repeat status of the alarm clock (Monday, Tuesday, Wednesday...weekend),<br/> <p><br/> The required format is a 7-digit string consisting of (0,1), from right to left, Monday, Tuesday,...Saturday, Sunday<br/> <p><br/> 1100000 - means Sunday, Saturday<br/> <p><br/> 0000011-Tuesday, Monday<br/> <p><br/> If you want to set an alarm clock with a non-repeating state, set it to 0000000<br/> |
| unRepeatDate | String | When the alarm clock is in non-repeating state, set the date,<br/> <p><br/> The required format is xxxx-xx-xx,<br/> <p><br/>If you want to set the alarm clock in repeating state, set it to 0000-00-00 |
| scene | int | Alarm clock scene [0-20] There are 21 scenes in total, the default is ordinary alarm clock icon<br /><br />*0: alarm clock icon* 1: sleep *2: sit up* 3: drink water *4: take medicine* 5: date *6: read* 7: movie *8: music* 9: shopping *10: haircut* 11: birthday *12: proposal* 13: work *14: parenting* 15: Family fun *16: Saving money* 17: Medical treatment *18: Walking the dog* 19: Fishing * 20: Traveling |
| isOpen | boolean | Whether to open, true means the alarm is on, false means the alarm is off |

EMultiAlarmOprate: Scenario alarm clock operation status (enumeration type). When the user adds, deletes, modifies and checks the alarm clock, this status will be returned in the relevant monitoring.

| Type | Description |
|-------------------------------- |-------------------------------- |
| SETTING_SUCCESS | Setting successful [modify, add] |
| SETTING_FAIL | Setting failed [modify, add] |
| CLEAR_SUCCESS | Deletion successful |
| CLEAR_FAIL | Delete failed |
| READ_SUCCESS | Read successfully |
| READ_FAIL | Read failed |
| READ_SUCCESS_NULL | Read successfully and no alarm |
| READ_SUCCESS_SAVE | Read successfully and save to local |
| READ_SUCCESS_SAME_CRC | The read CRC is consistent, indicating that the alarm clock has not changed |
| ALARM_FULL | The number of alarm clocks reaches the upper limit |
| ALARM_REPORT | Alarm clock report |
| ALARM_REPORT_DATE_ERROR | The alarm is reported but the data is wrong |
| DEVICE_ALARM_MODIFY | Modify the alarm clock on the device |
| DEVICE_ADD_ONE_TEXT_ALARM | Add an alarm to the device |
| DEVICE_DELETE_ONE_TEXT_ALARM, | Delete an alarm clock on the device |
| DEVICE_TEXT_ALARM_SWITCH_CHANGED | Device text alarm switch status changes |
| UNKONW | Unknown operation |

AlarmData2: Scene alarm clock list encapsulation class

| member name | type | description |
| ------------------ | ------------------ | ------------------ |
| status | EMultiAlarmOprate | The operation status of the scene alarm clock |
| alarm2SettingList | List<Alarm2Setting> | Scene alarm list |

#### Read scene alarm clock

Usage examples:

```
VPOperateManager.getInstance().readAlarm2(writeResponse, new IAlarm2DataListListener() {
    @Override
    public void onAlarmDataChangeListListener(AlarmData2 alarmData2) {
        String message = "Read alarm clock [new version]:\n" + alarmData2.toString();
        Logger.t(TAG).i(message);
        sendMsg(message, 1);
    }
});
```

#### Set scene alarm clock

Usage examples:

```
private Alarm2Setting getMultiAlarmSetting() {
        int hour = 16;
        int minute = 33;
        int scene = 1;
        boolean isOpen = true;
        String repestStr = "1000010";
        String unRepeatDdate = "0000-00-00";
        return new Alarm2Setting(hour, minute, repestStr, scene, unRepeatDdate, isOpen);
    }
....

Alarm2Setting alarm2Setting = getMultiAlarmSetting();
VPOperateManager.getInstance().addAlarm2(writeResponse, new IAlarm2DataListListener() {
    @Override
    public void onAlarmDataChangeListListener(AlarmData2 alarmData2) {
        String message = "Add alarm clock [new version]:\n" + alarmData2.toString();
        Logger.t(TAG).i(message);
        sendMsg(message, 1);
    }
}, alarm2Setting);
```

#### Delete scene alarm clock

Usage examples:

```
private Alarm2Setting getMultiAlarmSetting() {
        int hour = 16;
        int minute = 33;
        int scene = 1;
        boolean isOpen = true;
        String repestStr = "1000010";
        String unRepeatDdate = "0000-00-00";
        return new Alarm2Setting(hour, minute, repestStr, scene, unRepeatDdate, isOpen);
    }

....
int deleteID = 1;
Alarm2Setting alarm2Setting = getMultiAlarmSetting();
alarm2Setting.setAlarmId(deleteID);
VPOperateManager.getInstance().deleteAlarm2(writeResponse, new IAlarm2DataListListener() {
    @Override
    public void onAlarmDataChangeListListener(AlarmData2 alarmData2) {
        String message = "Delete alarm clock [new version]:\n" + alarmData2.toString();
        Logger.t(TAG).i(message);
        sendMsg(message, 1);
    }
    //String bluetoothAddress, int alarmId, int alarmHour, int alarmMinute, String repeatStatus, int scene, String unRepeatDate, boolean isOpen
}, alarm2Setting);
```

#### Modify scene alarm clock

Usage examples:

```
private Alarm2Setting getMultiAlarmSetting() {
        int hour = 16;
        int minute = 33;
        int scene = 1;
        boolean isOpen = true;
        String repestStr = "1000010";
        String unRepeatDdate = "0000-00-00";
        return new Alarm2Setting(hour, minute, repestStr, scene, unRepeatDdate, isOpen);
    }


....
Alarm2Setting alarm2Setting = getMultiAlarmSetting();
int modifyID = 2;
alarm2Setting.setAlarmId(modifyID);
alarm2Setting.setAlarmHour(10);
alarm2Setting.setOpen(false);
VPOperateManager.getInstance().modifyAlarm2(writeResponse, new IAlarm2DataListListener() {
    @Override
    public void onAlarmDataChangeListListener(AlarmData2 alarmData2) {
        String message = "Modify alarm clock [new version]:\n" + alarmData2.toString();
        Logger.t(TAG).i(message);
        sendMsg(message, 1);
    }
}, alarm2Setting);
```

### Text alarm clock

The text alarm clock supports up to 10 groups. TextAlarm2Setting (text) inherits from Alarm2Setting (scene), with an additional alarm prompt text description.

```
public class TextAlarm2Setting extends Alarm2Setting {

    /**
     * Alarm information
     */
    private String content;
    ...
```

**TextAlarmData:** text alarm list wrapper

| member name | type | description |
| --------------------- | ----------------------- | ------------------ |
| oprate | EMultiAlarmOprate | Text alarm clock operating status |
| textAlarm2SettingList | List<TextAlarm2Setting> | Text alarm list |

ITextAlarmDataListener: Listening callback for text alarm operations. This listener will be called back when the text alarm is added, deleted, modified, or checked on the watch or mobile phone.

```
/**
 * Author: YWX
 * Date: 2021/9/24 14:40
 * Description: Text alarm clock operation callback
 */
interface ITextAlarmDataListener : IListener {

    /**
     * Callback of alarm clock data
     *
     * @param textAlarmData alarm clock data
     */
    fun onAlarmDataChangeListListener(textAlarmData: TextAlarmData?)
}
```

#### Read text alarm clock

Usage examples:

```
VPOperateManager.getInstance().readTextAlarm(writeResponse, new ITextAlarmDataListener() {
    @Override
    public void onAlarmDataChangeListListener(TextAlarmData textAlarmData) {
        EMultiAlarmOprate OPT = textAlarmData.getOprate();
        boolean isOk = OPT == EMultiAlarmOprate.READ_SUCCESS ||
                OPT == EMultiAlarmOprate.READ_SUCCESS_SAME_CRC ||
                OPT == EMultiAlarmOprate.READ_SUCCESS_SAVE;
        if (isOk) {
            mSettings.clear();
            mSettings.addAll(textAlarmData.getTextAlarm2SettingList());
            mAdapter.notifyDataSetChanged();
        }
        showMsg(isOk? "Read text alarm successfully" : "Read text alarm failed");
    }
});
```

| Parameter name | Type | Description |
| --------------------------- | --------------------------- | ------------- |
| writeResponse | IBleWriteResponse | Listening for write operations |
| ITextAlarmDataListener | ITextAlarmDataListener | Text alarm change callback |

#### Add text alarm clock

Usage examples:

```
  private TextAlarm2Setting getTextAlarm2Setting() {
        String content = mEditText.getText().toString();
        if (TextUtils.isEmpty(content)) {
            content = "Dalang, it's time to eat @^_^@ !";
        }
        String strHour = etHour.getText().toString();
        String strMinute = etMinute.getText().toString();
        TextAlarm2Setting setting = new TextAlarm2Setting();
        setting.setOpen(true);
        setting.setRepeatStatus("1111111");
        setting.setUnRepeatDate("0000-00-00");
        setting.setAlarmHour(TextUtils.isEmpty(strHour) ? new Random().nextInt(24) : Integer.parseInt(strHour));
        setting.setAlarmMinute(TextUtils.isEmpty(strMinute) ? new Random().nextInt(60) : Integer.parseInt(strMinute));
        setting.setContent(content);
        return setting;
    }

....
TextAlarm2Setting setting = getTextAlarm2Setting();
VPOperateManager.getInstance().addTextAlarm(writeResponse, new ITextAlarmDataListener() {
    @Override
    public void onAlarmDataChangeListListener(TextAlarmData textAlarmData) {
        Logger.t(TAG).e("Add alarm --》" + textAlarmData.toString());
        EMultiAlarmOprate OPT = textAlarmData.getOprate();
        showMsg("Add alarm --》" + (textAlarmData.getOprate() == EMultiAlarmOprate.SETTING_SUCCESS ? "Success" : "Failure"));
        if (OPT == EMultiAlarmOprate.ALARM_FULL) {
            showMsg("Alarm clock is full (up to ten added)");
        } else if (OPT == EMultiAlarmOprate.SETTING_SUCCESS) {
            showMsg("Alarm clock added successfully");
            mSettings.clear();
            mSettings.addAll(textAlarmData.getTextAlarm2SettingList());
            mAdapter.notifyDataSetChanged();
        } else if (OPT == EMultiAlarmOprate.SETTING_FAIL) {
            showMsg("Alarm clock added failed");
        }
    }
}, setting);
```

| Parameter name | Type | Description |
| ----------------------- | ---------------------------- | ------------------ |
| writeResponse | IBleWriteResponse | Listening for write operations |
| ITextAlarmDataListener | ITextAlarmDataListener | Text alarm change callback |
| setting | TextAlarm2Setting | Alarm clock entity that needs to be added |

#### Delete text alarm

Usage examples:

```
VPOperateManager.getInstance().deleteTextAlarm(writeResponse, new ITextAlarmDataListener() {
    @Override
    public void onAlarmDataChangeListListener(TextAlarmData textAlarmData) {
        EMultiAlarmOprate OPT = textAlarmData.getOprate();
        if(OPT == EMultiAlarmOprate.CLEAR_SUCCESS) {
            showMsg("Alarm clock deleted successfully");
            mSettings.clear();
            mSettings.addAll(textAlarmData.getTextAlarm2SettingList());
            mAdapter.notifyDataSetChanged();
        } else {
            showMsg("Deletion failed");
        }
    }
}, textAlarm);
```

| Parameter name | Type | Description |
| ----------------------- | ---------------------------- | ------------------ |
| writeResponse | IBleWriteResponse | Listening for write operations |
| ITextAlarmDataListener | ITextAlarmDataListener | Text alarm change callback |
| textAlarm | TextAlarm2Setting | Alarm clock entity that needs to be deleted |

#### Modify text alarm clock

Usage examples:

```
VPOperateManager.getInstance().modifyTextAlarm(writeResponse, new ITextAlarmDataListener() {
    @Override
    public void onAlarmDataChangeListListener(TextAlarmData textAlarmData) {
        showMsg("Modify alarm clock --》" + (textAlarmData.getOprate() == EMultiAlarmOprate.SETTING_SUCCESS ? "Success" : "Failure"));
        mSettings.clear();
        mSettings.addAll(textAlarmData.getTextAlarm2SettingList());
        mAdapter.notifyDataSetChanged();
    }
}, setting);
```

| Parameter name | Type | Description |
| ----------------------- | ---------------------------- | ------------------ |
| writeResponse | IBleWriteResponse | Listening for write operations |
| ITextAlarmDataListener | ITextAlarmDataListener | Text alarm change callback |
| textAlarm | TextAlarm2Setting | Alarm clock entity that needs to be modified |

## Weather function

When the watch supports weather, (when the device performs password verification, the incoming listening [deviceFunctionDataListener] will report whether the weather function is present [please refer to Password Verification](#Verify Password Operation))
Weather includes the following features

1. Weather data settings
2. Weather switch and unit settings

### Weather data settings

Weather setting calling method

```
VPOperateManager.getInstance().settingWeatherData(writeResponse, weatherData, IWeatherStatusDataListener)
```

| Parameter name | Type | Description |
| ------------- | -------------------------- | -------------------- |
| writeResponse | IBleWriteResponse | Command write callback |
| weatherData | WeatherData | weather data |
| listener | IWeatherStatusDataListener | Weather data setting result callback |

WeatherData: weather data

| member name | type | description |
| --------------------- | ----------------------- | --------------------------------------------------------------- |
| crc | int | crc can be spliced into the CRC of the data based on the update time or the entire data, ensuring uniqueness <br /> (When the crc is the same, there is no need to update the weather data, which can avoid updating the weather data too quickly) |
| cityName | String | City name, UTF-8 encoding of the specific city |
| source | int | The source of weather data, such as Yahoo or Zephyr, (you can leave it blank here) |
| timeBean | TimeData | Last updated time |
| weatherEvery3HourList | List<WeatherEvery3Hour> | Every 3-hour weather forecast list |
| weatherEverdayList | List<WeatherEveryDay> | Daily weather forecast list |

WeatherEvery3Hour: three-hour weather forecast

| member name | type | description |
| ------------ | -------- | --------------------------------------------------------------- |
| timeBean | TimeData | Current time, year, month, day, hour and minute, accurate to hour, minute and second |
| temperatureF | int | Fahrenheit |
| temperatureC | int | degrees Celsius |
| yellowLevel | int | UV intensity index |
| weatherState | int | Weather state, this value is an int value within the specified range, the value range is judged as follows:<br/> 0-4 Sunny<br/> 5-12 Sunny to cloudy<br/> 13-16 Cloudy<br/> 17-20 Shower<br/> 21-24 Thunderstorm<br/> 25-32 Hail<br/> 33-40 Light rain<br/> 41-48 Moderate rain<br/> 49-56 Heavy rain<br/> 57-72 Heavy rain<br/> 73-84 Light snow<br/> 85-100 Heavy snow<br/> 101-155 Cloudy |
| windLevel | String | Wind direction level, if the wind force is a range value, please use '-' to connect, such as "3-5"; if it is a single value, just "3" |
| canSeeWay | double | Visibility unit m,3.16 |

WeatherEveryDay: Daily weather forecast

| member name | type | description |
| -------------------- | -------- | --------------------------------------------------------------- |
| timeBean | TimeData | year, month, day, hour and minute |
| temperatureMaxF | int | maximum degree Fahrenheit |
| temperatureMinF | int | Minimum degree Fahrenheit |
| temperatureMaxC | int | maximum degree Celsius |
| temperatureMinC | int | Minimum degree Celsius |
| yellowLevel | int | UV intensity index |
| weatherStateWhiteDay | int | Daytime weather status, this value is an int value within the specified range, the value range is determined as follows:<br/> 0-4 Sunny<br/> 5-12 Sunny to cloudy<br/> 13-16 Cloudy<br/> 17-20 Shower<br/> 21-24 Thunderstorm<br/> 25-32 Hail<br/> 33-40 Light rain<br/> 41-48 Moderate rain<br/> 49-56 Heavy rain<br/> 57-72 Heavy rain<br/> 73-84 Light snow<br/> 85-100 Heavy snow<br/> 101-155 Cloudy |
| weatherStateNightDay | int | Night weather status, this value is an int value within the specified range, the value range is determined as follows:<br/> 0-4 Sunny<br/> 5-12 Sunny to cloudy<br/> 13-16 Cloudy<br/> 17-20 Shower<br/> 21-24 Thunderstorm<br/> 25-32 Hail<br/> 33-40 light rain<br/> 41-48 moderate rain<br/> 49-56 heavy rain<br/> 57-72 heavy rain<br/> 73-84 light snow<br/> 85-100 heavy snow<br/> 101-155 cloudy |
| windLevel | String | Wind direction level, if the wind force is a range value, please use '-' to connect, such as "3-5"; if it is a single value, just "3" |
| canSeeWay | double | Visibility unit m,3.16 |

IWeatherStatusDataListener: Weather data setting result callback. This method will be called back when the weather data is set successfully, or the weather switch or weather unit changes.

```
/**
 * Monitor weather data and return the status of the operation
 */
public interface IWeatherStatusDataListener extends IListener {
    /**
     * Callback of weather data
     *
     * @param weatherStatusData
     */
    void onWeatherDataChange(WeatherStatusData weatherStatusData);
}

public enum EWeatherOprateStatus {
    /**
     * Set weather status successfully
     */
    SETTING_STATUS_SUCCESS,
    /**
     * Failed to set weather status
     */
    SETTING_STATUS_FAIL,
    /**
     * Set weather data successfully
     */
    SETTING_CONTENT_SUCCESS,
    /**
     * Failed to set weather data
     */
    SETTING_CONTENT_FAIL,
    /**
     * Read successfully
     */
    READ_SUCCESS,
    /**
     * Failed to read
     */
    READ_FAIL,
    /**
     * unknown
     */
    UNKONW;
}
```

**WeatherStatusData:** weather status data

| member name | type | description |
| ----------- | -------------------- | --------------------------------------------------------------- |
| oprate | EWeatherOprateStatus | Weather operation status:<br />SETTING_STATUS_SUCCESS: Setting weather status successfully<br />SETTING_STATUS_FAIL: Setting weather status failed<br />SETTING_CONTENT_SUCCESS: Setting weather data successfully<br />SETTING_CONTENT_FAIL: Setting weather data failed<br />READ_SUCCESS: Reading successful<br />READ_FAIL: Reading failure<br /> />UNKONW: Unknown status |
| crc | int | crc of current weather |
| isOpen | boolean | Whether to turn on the weather function |
| weatherType | EWeatherType | Type of weather (Fahrenheit, Celsius):<br />C: Celsius<br />F: Fahrenheit |

Weather setting code example:

```
//CRC
int crc = 0;
//city name
String cityName = "Shenzhen";
//data source
int sourcecr = 0;
//Last update time
int year = TimeData.getSysYear();
int month = TimeData.getSysMonth();
int day = TimeData.getSysDay();
TimeData lasTimeUpdate = new TimeData(year, month, day, 12, 59, 23);
//Weather list (in hours)
List<WeatherEvery3Hour> weatherEvery3HourList = new ArrayList<>();
TimeData every3Hour0 = new TimeData(year, month, day, 12, 59, 23);
TimeData every3Hour1 = new TimeData(year, month, day, 15, 59, 23);
TimeData every3Hour2 = new TimeData(year, month, day, 18, 59, 23);
TimeData every3Hour3 = new TimeData(year, month, day, 21, 59, 23);
WeatherEvery3Hour weatherEvery3Hour0 =
        new WeatherEvery3Hour(every3Hour0, 60, -60, 6, 6, "3-4", 5.0);
WeatherEvery3Hour weatherEvery3Hour1 =
        new WeatherEvery3Hour(every3Hour1, 70, -70, 7, 7, "10-12", 5.0);
WeatherEvery3Hour weatherEvery3Hour2 =
        new WeatherEvery3Hour(every3Hour2, 80, -80, 8, 8, "10", 5.0);
WeatherEvery3Hour weatherEvery3Hour3 =
        new WeatherEvery3Hour(every3Hour3, 90, -90, 9, 9, "15", 5.0);
weatherEvery3HourList.add(weatherEvery3Hour0);
weatherEvery3HourList.add(weatherEvery3Hour1);
weatherEvery3HourList.add(weatherEvery3Hour2);
weatherEvery3HourList.add(weatherEvery3Hour3);
//Weather list (in days)
List<WeatherEveryDay> weatherEveryDayList = new ArrayList<>();
TimeData everyDay0 = new TimeData(year, month, day, 12, 59, 23);
WeatherEveryDay weatherEveryDay0 = new WeatherEveryDay(everyDay0, 80, -80, 60,
        -60, 10, 5, 10, "10-12", 5.2);
weatherEveryDayList.add(weatherEveryDay0);
WeatherData weatherData = new WeatherData(crc, cityName, sourcr, lasTimeUpdate, weatherEvery3HourList, weatherEveryDayList);
VPOperateManager.getInstance().settingWeatherData(writeResponse, weatherData, new IWeatherStatusDataListener() {
    @Override
    public void onWeatherDataChange(WeatherStatusData weatherStatusData) {
        String message = "settingWeatherData onWeatherDataChange read:\n" + weatherStatusData.toString();
        Logger.t(TAG).i(message);
        sendMsg(message, 1);
    }
});
```

### Weather switch and unit settings

```
VPOperateManager.getInstance().settingWeatherStatusInfo(writeResponse, weatherStatusSetting, listener)
```

| Parameter name | Type | Description |
| -------------------- | -------------------------- | -------------------- |
| writeResponse | IBleWriteResponse | Command write callback |
| weatherStatusSetting | WeatherStatusSetting | Weather switches and unit settings |
| listener | IWeatherStatusDataListener | Weather data setting result callback |

WeatherStatusSetting: weather unit and switch settings

| member name | type | description |
| -------- | ------------ | --------------------------------------------------------------- |
| crc | int | The crc of the current weather. When setting the weather, if the weather data does not change the crc, please pass in the last saved weather crc value |
| isOpen | boolean | Whether to open the weather function, true: open, false: closed |
| eWeather | EWeatherType | Type of weather (Fahrenheit, Celsius):<br />C: Celsius<br />F: Fahrenheit |

Weather unit and switch code example:

```
WeatherStatusSetting weatherStatusSetting = new WeatherStatusSetting(crc, true, EWeatherType.C);
VPOperateManager.getInstance().settingWeatherStatusInfo(writeResponse, weatherStatusSetting, new IWeatherStatusDataListener() {
    @Override
    public void onWeatherDataChange(WeatherStatusData weatherStatusData) {
        String message = "settingWeatherStatusInfo onWeatherDataChange read:\n" + weatherStatusData.toString();
        Logger.t(TAG).i(message);
    }
});
```

## Find phone features

#### Set up mobile phone monitoring

###### API

```kotlin
settingFindPhoneListener(findPhonelistener)
```

###### Parameters

| Parameter name | Type | Description |
| ------------------ | ------------------ | --------------- |
| findPhonelistener | IFindPhonelistener | Find the phone's listener |

###### Return data

**IFindPhonelistener**--Find the phone’s listener

```kotlin
/**
 * When receiving this callback, the mobile phone should provide corresponding feedback to remind the user, such as vibrating, ringing, etc.
 */
fun findPhone()
```

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().settingFindPhoneListener {
    val message = "(Monitoring the bracelet to find the phone)-where is the phone, make some noise!"

}
```

## Sedentary function

#### Prerequisites

The device needs to support sedentary function, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportLongseat
```

#### Read sedentary settings

Requires settings to support prolonged sitting

###### API

```
readLongSeat(bleWriteResponse, longSeatDataListener)
```

###### Parameters

| Parameter name | Type | Description |
| -------------------------- | -------------------------- | ------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| longSeatDataListener | ILongSeatDataListener | Sedentary data listening |

###### Return data

**ILongSeatDataListener** --Sedentary data listening

```kotlin
/**
 * Return sedentary data
 *
 * @param longSeat sedentary data
 */
fun onLongSeatDataChange(longSeat:LongSeatData)
```

**LongSeatData**--sedentary data

| Variable | Type | Description |
| ----------- | --------------- | ------------------------------- |
| status | ELongSeatStatus | Status of sedentary operation |
| startHour | Int | Hour of start time |
| startMinute | Int | The minute of the start time |
| endHour | Int | The hour of the end time |
| endMinute | Int | Minutes of end time |
| threshold | Int | Threshold: how long it has been without movement, the watch will remind |
| isOpen | Boolean | switch status |

**ELongSeatStatus**--Status of sedentary operation

| variable | description |
| ------------- | ------------ |
| OPEN_SUCCESS | Open successfully |
| OPEN_FAIL | Open failed |
| CLOSE_SUCCESS | Closed successfully |
| CLOSE_FAIL | Close failed |
| READ_SUCCESS | Read successfully |
| READ_FAIL | Read failed |
| UNSUPPORT | This feature is not supported |
| UNKONW | Unknown status |

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().readLongSeat(
    writeResponse
) { longSeat ->
    val message = "Set long seat-read:\n$longSeat"

}
```

#### Set up sedentary

Requires device to support sedentary function

###### API

```
settingLongSeat(IBleWriteResponse bleWriteResponse, LongSeatSetting longSeatSetting, ILongSeatDataListener longSeatDataListener)
```

###### Parameters

| Parameter name | Type | Description |
| -------------------------- | -------------------------- | ------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| longSeatSetting | LongSeatSetting | Sedentary setting |
| longSeatDataListener | ILongSeatDataListener | Sedentary data listening |

**LongSeatSetting**--Sedentary setting

| Parameter name | Type | Description |
| ----------- | ------- | ------------------------------- |
| startHour | Int | Hour of start time |
| startMinute | Int | The minute of the start time |
| endHour | Int | The hour of the end time |
| endMinute | Int | Minutes of end time |
| threshold | Int | Threshold: how long it has been without movement, the watch will remind |
| isOpen | Boolean | switch status |

###### Return data

Consistent with the data returned by [[Read Sedentary Settings](#Read Sedentary Settings)]

###### Sample code

```kotlin
// kotlin code
VPOperateManager.getInstance().settingLongSeat(
    writeResponse, LongSeatSetting(10, 40, 12, 40, 40, false)
) { longSeat ->
    val message = "Set long seat:\n$longSeat"

}
```

## Photography function

#### Prerequisites

The device needs to support the camera function, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportCamera
```

#### Enter photo mode

The device needs to support the camera function

###### API

```
startCamera(bleWriteResponse, cameraDataListener)
```

###### Parameters

| Parameter name | Type | Description |
| ------------------ | ------------------ | --------------------------------------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| cameraDataListener | ICameraDataListener | Callback for camera operation, returns success/failure to enter camera mode, can/cannot take pictures, success/failure to exit camera mode |

###### Return data

**ICameraDataListener**--Callback for photo taking operation

```kotlin
/**
 * Return to the state of taking photos
 *
 * @param oprateStatus
 */
fun OnCameraDataChange(oprateStatus:ECameraStatus)
```

**ECameraStatus**--Photography status

| variable | description |
| ------------------ | ------------------ |
| OPEN_SUCCESS | Entering photo mode successfully |
| OPEN_FALI | Failed to enter photo mode |
| TAKEPHOTO_CAN | Take a photo |
| TAKEPHOTO_CAN_NOT | Taking pictures is not allowed |
| CLOSE_SUCCESS | Exit photo taking successfully |
| CLOSE_FAIL | Failed to exit photo taking |
| UNKONW | Unknown |

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance().startCamera(
    writeResponse
) { cameraStatus ->

}
```

#### Exit photo mode

The device needs to support taking photos and has entered the photo mode

###### API

```
stopCamera(IBleWriteResponse bleWriteResponse, ICameraDataListener cameraDataListener)
```

###### Parameters

Same parameters as [[Enter photo mode](#Enter photo mode)]

###### Return data

Same as the data returned by [[Enter photo mode](#Enter photo mode)]

###### Sample code

```kotlin
//        kotlin code
VPOperateManager.getInstance().stopCamera(
    writeResponse
) { cameraStatus ->

}
```

## OTA upgrade function

#### Get the current firmware version number

###### Prerequisites

Device is connected

**Note:** The OTA process is long. If the battery power is insufficient, the transmission process may be shut down due to low power. It is recommended that the battery power be above 30% before the upgrade is allowed;

###### API

After the [[Verify Password](#Verify Password Operation)] operation, the returned pwdDataListener data contains the current firmware version number.

###### Sample code

```
pwdData.deviceVersion
```

#### Get the new firmware version number and upgrade description

###### Prerequisites

The device is connected and the device version number is known

###### API

```
getOadVersion(oadSetting, listener)
```

###### Parameters

| Parameter name | Type | Description |
| ---------- | ----------------------- | ---------- |
| oadSetting | OadSetting | Verification version setting |
| listener | OnGetOadVersionListener | Verification version listening |

**OadSetting**--Verify version settings

| Parameter name | Type | Description |
| ------------------- | ------- | --------------------------------------------------------------- |
| deviceAddressString | String | Device address (required) |
| deviceVersion | String | Device version (required) |
| deviceTestVersion | String | Device test version (required) |
| deviceNumber | String | Device number (required) |
| isOadModel | Boolean | Firmware upgrade mode (required) |
| isDebug | Boolean | Debug mode (optional), true means the debugging port of our server is used, false means the release port of our server is used, |
| hostUrl | String | Host address, the transmission format is: <http://www.baidu.com; it can be omitted, the default is our server; use with caution! ! ! Contact our developers before using > |
| isAutoDownload | Boolean | Whether to automatically download after detecting the version |

###### Return data

**OnGetOadVersionListener**--Verification version callback

```java
/**
 * Return the latest version information of this device on the server
 *
 * @param deviceNumber device number
 * @param deviceVersion latest version
 * @param des upgrade description
 * @param netIsNew The network version is greater than the local version and needs to be updated
 */
void onNetOadInfo(int deviceNumber, String deviceVersion, String des, boolean netIsNew);

void onNetOadDetailInfo(OadFileBean oadFileBean,boolean netIsNew);
```

**OadFileBean** -- device upgrade file information

| Variable | Type | Description |
| ------------- | ------ | --------------- |
| deviceNumber | String | New firmware device number |
| deviceVersion | String | New firmware version |
| downUrl | String | URL for downloading new firmware |
| size | String | The size of the new firmware |
| md5 | String | New firmware md5 |
| des | String | New version upgrade description |

#### Download new firmware

According to the download address of the new firmware obtained, just perform normal network download.

#### Jerry platform equipment OTA upgrade

Note that the Jerry OTA upgrade process is generally relatively long, probably within 10-20 minutes. During the upgrade process, you need to keep the watch and phone fully charged, and the APP being upgraded is in the foreground. (Some Android systems will regard the Bluetooth operation of the app in the background as power-consuming operation, and may suspend the Bluetooth transmission, causing the ota upgrade to fail)

Jerry's OTA process is divided into three stages.
The first stage: OTA file transfer. The upgrade time of this process depends on the size of the upgrade file. In the onProgress method, the progress value ranges from 0.00 to 99.9 under normal circumstances.

The second stage: internal file copy, onProgress will quickly go from 0.00 to 99.9

The third stage: This stage is an internal upgrade. The device will actively disconnect and call back the onNeedReconnect method. At this time, the device will automatically change the device name to DFULang, and the device address will be the original device address + 1.

The SDK will automatically search for and reconnect the DFULang device. After the connection is successful, the SDK will trigger an internal upgrade. onProgress will quickly change from 0.00 to 100, and call back the onOTASuccess method.

###### Prerequisites

The device needs to be a Jerry device and has completed [[Open Jerry File System](#Open Jerry File System)], and the new firmware has been downloaded

###### API

```
VPOperateManager.getInstance().startJLDeviceOTAUpgrade(firmwareFilePath, listener)
```

###### Parameters

| Parameter name | Type | Description |
|---------------- | ---------------------------------- | ---------------------------------- |
| firmwareFilePath | String | The path to the locally stored OTA upgrade file |
| listener | JLOTAHolder.OnJLDeviceOTAListener | Jerry device OTA listening |

###### Return data

OnJLDeviceOTAListener: Jerry OTA upgrade listener

```java
public interface OnJLDeviceOTAListener {

    /**
     * Start OTA
     */
    void onOTAStart();

    /**
     *Upgrade progress, keep to two decimal places
     *
     * @param progress Upgrade progress [0.00 - 100]
     */
    void onProgress(float progress);

    /**
     * Called back when reconnection is required
     *
     * @param address device address
     * @param dfuLangAddress Device address in dfuLang state: address+1
     * @param isReconnectBySdk Whether to automatically reconnect within the SDK to complete the last stage of ota
     */
    void onNeedReconnect(String address, String dfuLangAddress, boolean isReconnectBySdk);

    /**
     *OTA successful
     */
    void onOTASuccess();

    /**
     *OTA upgrade failed
     *
     * @param error Reason for failure
     */
    void onOTAFailed(BaseError error);
}
```

###### Sample code

```java
private void startOTA() {
        String firmwareFilePath = "/storage/emulated/0/Android/data/com.timaimee.vpdemo/files/hband/jlOta/KH32_9626_00320800_OTA_UI_230421_19.zip";
        tvOTAInfo.setText(firmwareFilePath);
        VPOperateManager.getInstance().startJLDeviceOTAUpgrade(firmwareFilePath, new JLOTAHolder.OnJLDeviceOTAListener() {
            @Override
            public void onOTAStart() {
                Logger.t(TAG).e("[Jerry OTA]--->OTA upgrade [Start]");
                tvOTAInfo.setText("Start Upgrade");
            }

            @Override
            public void onProgress(float progress) {
                Logger.t(TAG).e("[Jerry OTA]--->OTA upgrading:" + progress + "%");
                tvOTAProgress.setText(String.format(Locale.CHINA, "%.2f", progress) + "%");
                pbOTAProgress.setProgress((int) (progress * 100));
            }

            @Override
            public void onNeedReconnect(String address, String dfuLangAddress, boolean isReconnectBySdk) {
                Logger.t(TAG).e("[Jerry OTA]--->OTA upgrade dfuLang reconnecting: address = " + address + " , dfuLangAddress = " + dfuLangAddress + " , whether to reconnect by SDK = " + isReconnectBySdk);
                tvOTAInfo.setText("Data transfer ends, start searching for DFULang device -> device internal upgrade");
            }

            @Override
            public void onOTASuccess() {
                Logger.t(TAG).e("[Jerry OTA]--->OTA upgrade [successful]");
                tvOTAInfo.setText("OTA upgrade successful");
                tvOTAProgress.setText("100%");
            }

            @Override
            public void onOTAFailed(com.jieli.jl_bt_ota.model.base.BaseError error) {
                Logger.t(TAG).e("[Jerry OTA]--->OTA upgrade [failed]:" + error.toString());
                tvOTAInfo.setText("Upgrade failed, error: code = " + error.getSubCode() + " , msg = " + error.getMessage());
            }
        });
    }
```

## Contact function

Premise

The device needs to support the contact function, and the judgment conditions are as follows:

```
boolean isHaveContactFunction = VpSpGetUtil.getVpSpVariInstance(this).isSupportContactFunction();
```

Whether emergency contacts are supported is determined by the following conditions:

```
boolean isSupportSOSContact = VpSpGetUtil.getVpSpVariInstance(this).isSupportSOSContactFunction();
```

Contact encapsulated entity: Contact

```kotlin
/**
 *Contact person
 * @param contactID contact ID
 * @param name contact nickname
 * @param phoneNumber contact number
 * @param isSettingSOS Whether to set as emergency contact
 * @param isSupportSOS Whether to support SOS function
 */
data class Contact(
        var contactID: Int,
        var name: String,
        var phoneNumber: String,
        var isSettingSOS: Boolean = false,
        var isSupportSOS: Boolean = false
)
```

Contact operation enumeration class: EContactOpt

```
enum class EContactOpt(var des: String) {
    /**
     * Read contacts
     */
    READ("read contact list"),

    /**
     * Set up contacts
     */
    SETTING("setting contact"),

    /**
     * Set up emergency contacts
     */
    SETTING_SOS("setting contact"),

    /**
     * Mobile contacts
     */
    MOVE("move contact position"),

    /**
     * Delete contact
     */
    DELETE("delete one contact");
}
```

Contact operation callback monitoring:

```
interface IContactOptListener : IListener {

    /**
     * Contact operation successful
     * @param opt current operation type
     * @param crc The crc after the current operation is successful. The crc and contact list need to be saved after each operation update.
     */
    fun onContactOptSuccess(opt: EContactOpt, crc: Int)

    /**
     * Contact operation failed
     */
    fun onContactOptFailed(opt: EContactOpt)

    /**
     * Read contact successfully
     * @param contactList Contact list. If the list is empty, it means there are no contacts on the device.
     */
    fun onContactReadSuccess(contactList: List<Contact>)

    /**
     * Indicates that the crc issued when reading the contact is consistent with the crc on the device
     * The consistent crc means that the contacts on the device have not changed (note that the contacts need to be saved after each update, and the crc is used to determine whether the contacts need to be updated)
     */
    fun onContactReadASSameCRC()

    /**
     * Failed to read contacts
     */
    fun onContactReadFailed()

}
```

### Read contacts

Code example:

When reading for the first time, crc is passed in -1, which means that the complete device-side contacts will be returned. If the user has read the contact before, the CRC value of the contact can be passed in. If the CRC value is consistent with the device, onContactReadASSameCRC will be called back to indicate that repeated reading is not required, otherwise a complete contact list will be returned.

```
VPOperateManager.getInstance().readContact(-1, IContactOptListener, response);
```

Or

```
/**
 * Read the number of emergency contact calls
 *
 * @param contacts The last saved contact list, used to calculate crc
 * @param listener Emergency contact call number monitoring
 * @param bleWriteResponse data writing callback
 */
public void readContact(List<Contact> contacts, @NotNull IContactOptListener listener, IBleWriteResponse bleWriteResponse) {
.
.
.
```

Obtaining Crc value:

```
int crc = CrcUtil.INSTANCE.getCrcByContactList(contacts);
```

### Add contact

Just pass in a Contact entity with the contact's nickname and mobile phone number. **Note: **If the device supports the sos function, isSupportSOS needs to be set to true

```
VPOperateManager.getInstance().addContact(contact, IContactOptListener, IBleWriteResponse);
```

Just pass in a contact list, which needs to include nickname, mobile phone number, and whether it supports SOS function information.

```
VPOperateManager.getInstance().addContactList(List<Contact>, IContactOptListener, IBleWriteResponse)
```

### Delete contact

Deleting a contact requires passing in a contact with complete information (including contactID) obtained from the device.

Code example:

```
VPOperateManager.getInstance().deleteContact(contact, IContactOptListener, IBleWriteResponse);
```

### Mobile Contacts

Moving contacts swaps the order of two contacts on the device.

Code example:

```
VPOperateManager.getInstance().moveContact(fromContact, toContact, IContactOptListener, IBleWriteResponse);
```

```java
VPOperateManager.getInstance().moveContactWithPosition(fromPosition, toPosition, IContactOptListener, IBleWriteResponse);
```

### Emergency Contact

Emergency contact operations can be performed when the device supports emergency contacts. The judgment conditions are as follows:

```
boolean isSupportSOSContact = VpSpGetUtil.getVpSpVariInstance(this).isSupportSOSContactFunction();
```

#### Emergency contact on and off settings

Code example:

When isOpen is true, set the emergency contact

When isOpen is false, the emergency contact is cancelled.

```
VPOperateManager.getInstance().setContactSOSState(isOpen, contact, IContactOptListener, IBleWriteResponse);
```

#### Number of emergency contact calls

Emergency contact call count operation callback monitoring:

```
/**
 *Contact SOS call number setting
 */
interface ISOSCallTimesListener : IListener {
    /**
     *Successfully set the number of SOS calls
     * @param times SOS call times
     */
    fun onSOSCallTimesSettingSuccess(times: Int)

    /**
     * Failed to set the number of SOS calls
     */
    fun onSOSCallTimesSettingFailed()

    /**
     * Successfully read the number of SOS calls
     * @param times SOS call times
     * @param minTimes supports the minimum number of SOS calls
     * @param maxTimes The maximum number of SOS calls spent
     */
    fun onSOSCallTimesReadSuccess(times: Int, minTimes: Int, maxTimes: Int)

    /**
     * Failed to read the number of SOS calls
     */
    fun onSOSCallTimesReadFailed()
}
```

##### Read the number of calls

Code example for reading the number of emergency contact calls:

```
VPOperateManager.getInstance().readSOSCallTimes(new ISOSCallTimesListener() {
    @Override
    public void onSOSCallTimesSettingSuccess(int times) {
        etSOSCount.setText(times + "");
    }

    @Override
    public void onSOSCallTimesSettingFailed() {

    }

    @Override
    public void onSOSCallTimesReadSuccess(int times, int minTimes, int maxTimes) {
        etSOSCount.setText(times + "");
        tvSOSInfo.setText("Calling times setting range: [" + minTimes + "-" + maxTimes + "]");
    }

    @Override
    public void onSOSCallTimesReadFailed() {

    }
}, new IBleWriteResponse() {
    @Override
    public void onResponse(int code) {

    }
});
```

##### Set the number of calls

Code example for setting the number of emergency contact calls:

```
VPOperateManager.getInstance().setSOSCallTimes(callTimes, new ISOSCallTimesListener() {
    @Override
    public void onSOSCallTimesSettingSuccess(int times) {
        Toast.makeText(AddContactActivity.this, "Set successfully:" + times + "times", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onSOSCallTimesSettingFailed() {
        Toast.makeText(AddContactActivity.this, "Setup failed", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onSOSCallTimesReadSuccess(int times, int minTimes, int maxTimes) {
        Toast.makeText(AddContactActivity.this, "Read successfully: " + times + "-Range: [" + minTimes + "-" + maxTimes + "]", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onSOSCallTimesReadFailed() {

    }
}, new IBleWriteResponse() {
    @Override
    public void onResponse(int code) {

    }
});
```

## Body Composition Function

Prerequisite: The device needs to support the body composition function, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportBodyComponent
```

Note: All the following interfaces can only be called if the device supports the body composition function.

#### Read body composition ID (device manual measurement data)

###### Prerequisites

Requires equipment to support body composition function

###### API

```
readBodyComponentId(bleWriteResponse, readIdListener)
```

###### Parameters

| Parameter name | Type | Description |
|---------------- | ---------------------------------- | ---------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| readIdListener | IBodyComponentReadIdListener | Body composition reading measurement saved data ID callback |

###### Return data

**IBodyComponentReadIdListener** -- Body composition reading and measurement saved data ID callback

```kotlin
/**
 * Read ID end callback
 * @param ids read id list
 */
fun readIdFinish(ids: ArrayList<Int>)
```

###### Sample code

```kotlin
VPOperateManager.getInstance().readBodyComponentId(bleWriteResponse, object:IBodyComponentReadIdListener{
        override fun readIdFinish(ids: ArrayList<Int>) {
            val msg = "Read body composition data ID list: $ids"
        }
})
```

#### Read body composition data (manual measurement by device)

###### Prerequisites

Requires equipment to support body composition function

###### API

```kotlin
readBodyComponentData(bleWriteResponse, readDataListener)
```

###### Parameters

| Parameter name | Type | Description |
|---------------- | --------------------------------- | -------------------------------- |
| bleWriteResponse | IBleWriteResponse | Monitoring of write operations |
| readDataListener | IBodyComponentReadDataListener | Data callback for reading body composition data |

###### Return data

**IBodyComponentReadDataListener** --Data callback for reading body composition data

```kotlin
/**
 * Data reading completed
 *
 * @param bodyComponentList body composition data
 */
fun readBodyComponentDataFinish(bodyComponentList: List<BodyComponent>?)
```

**BodyComponent** -- body composition data

| Variable name | Type | Description |
| ------------------ | -------- | --------------------------------------------------------------- |
| BMI | Float | The valid range of BMI is [4.0, 1114.0], one decimal place is retained, and the reported value is 10 times, the same below |
| bodyFatRate | Float | Body fat rate, valid range [2.0, 48.0]% |
| fatRate | Float | Fat mass, valid range [10.0, 248.0] kg |
| FFM | Float | Lean body mass, valid range [1.0, 132.0] kg |
| muscleRate | Float | Muscle rate, valid range [39.0, 90.0]% |
| muscleMass | Float | Muscle mass, valid range [9.0, 248.0] kg |
| subcutaneousFat | Float | Subcutaneous fat, effective range [1.0, 47.0]% |
| bodyWater | Float | Body water, effective range [28.0, 79.0]% |
| waterContent | Float | Water content, valid range [7.0, 217.0] kg |
| skeletalMuscleRate | Float | Skeletal muscle rate, valid range [13.0, 69.0]% |
| boneMass | Float | Bone mass, valid range [2.3, 4.8] kg |
| proteinProportion | Float | Protein proportion, valid range [4.0, 26.0]% |
| proteinMass | Float | Protein mass, valid range [1.0, 71.0] kg |
| basalMetabolicRate | Float | Basal metabolic rate, valid range [25, 14995] kcal |
| timeBean | TimeData | The time of this measurement |
| duration | Int | Measurement duration |
| idType | Int | Measurement device type: 1: Device test, 2: App test |

###### Sample code

```kotlin
VPOperateManager.getInstance().readBodyComponentData(bleWriteResponse, object : IBodyComponentReadDataListener {
    override fun readBodyComponentDataFinish(bodyComponentList: List<BodyComponent>?) {
        HBLogger.bleConnectLog("[Read body composition data successfully] bodyComponentList+${bodyComponentList.toString()}")

    }
})
```

#### Set up body composition (manual measurement by device) data reporting and monitoring

###### API

```kotlin
setBodyComponentReportListener(reportListener)
```

###### Parameters

| Parameter name | Type | Description |
| ----------------- | ---------------------------------- | ---------------------------------- |
| reportListener | INewBodyComponentReportListener | New body composition measurement data actively reported for monitoring |

###### Return data

**INewBodyComponentReportListener** --New body composition measurement data is proactively reported for monitoring

```kotlin
/**
 * New body composition measurement data reporting data monitoring interface
 * Triggered whenever new measurement data is generated on the device side. When triggered, new body composition measurement data is read through the [VPOperateManager.readBodyComponentData] interface.
 */
fun onNewBodyComponentReport()
```

###### Sample code

```kotlin
VPOperateManager.getInstance().setBodyComponentReportListener(object : INewBodyComponentReportListener {
            override fun onNewBodyComponentReport() {
                "New body composition data reported-----".logd()
                
            }
        })
```

#### Start measuring body composition

###### Prerequisites

Settings support body composition

###### API

```kotlin
startDetectBodyComponent(bleWriteResponse, bodyDetectListener)
```

###### Parameters

| Parameter name | Type | Description |
|---------------- | ---------------------------------- | ---------------- |
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |
| detectListener | IBodyComponentDetectListener | Body composition measurement callback |

###### Return data

**IBodyComponentDetectListener** -- Body composition measurement callback

```kotlin
/**
 * Callback during measurement
 * @param progress measurement progress
 * @param leadState Lead status: 0->Lead passed; 1->Lead dropped off. After 4 consecutive leads dropped off, the app actively sends a stop measurement message to the device.
 */
fun onDetecting(progress: Int, leadState: Int)

/**
 * Measurement success callback
 * @param bodyComponent This body composition data
 */
fun onDetectSuccess(bodyComponent: BodyComponent)

/**
 * Measurement failed
 * @param detectState failure reason
 */
fun onDetectFailed(detectState: DetectState)

/**
 * Stop measurement
 */
fun onDetectStop()
```

**DetectState** -- Measurement state enumeration

```kotlin
PROGRESS(0, "Measuring"),
SUCCESS(1, "Measurement successful-result package"),
FAILED(2, "Measurement failed - no result"),
BUSY(3, "The device is busy"),
LOW_POWER(4, "Low power")
```

###### Sample code

```kotlin
VPOperateManager.getInstance().startDetectBodyComponent(bleWriteResponse,object :IBodyComponentDetectListener{
    override fun onDetecting(progress: Int, leadState: Int) {
        "[Body composition measurement] onDetecting: $progress,$leadState".logd()
    }

    override fun onDetectSuccess(bodyComponent: BodyComponent) {
        "[Body composition measurement] onDetectSuccess: ${bodyComponent}".logd()
    }

    override fun onDetectFailed(detectState: DetectState) {
        "[Body composition measurement] onDetectFailed: ${detectState}".loge()
    }

    override fun onDetectStop() {
        "[Body composition measurement] onDetectStop".loge()
    }

})
```

#### End body composition measurement

###### Prerequisites

The device supports the body composition function and body composition measurement has started

###### API

```
stopDetectBodyComponent(bleWriteResponse)
```

###### Parameters

| Parameter name | Type | Description |
| ---------------- | ---------------- | ---------------- |
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |

###### Return data

None

###### Sample code

```kotlin
 VPOperateManager.getInstance().stopDetectBodyComponent(bleWriteResponse)
```

## Blood component function

The equipment needs to support the blood component function, and the judgment conditions are as follows:

```
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportBloodComponent
```

#### Daily data reading of blood components

[[Read daily data](##Read daily data)] The five-minute raw data contains blood component-related data returned

#### Read blood component calibration values

###### Prerequisites

Requires equipment to support blood component functions

###### API

```
readBloodComponentCalibration(bleWriteResponse, optListener)
```

###### Parameters

| Parameter name | Type | Description |
|----------------|-----------------------------|----------------|
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |
| optListener | IBloodComponentOptListener | Blood component operation listening |

###### Return data

**IBloodComponentOptListener** -- blood component operation callback

```kotlin
/**
 * Blood component calibration read successfully
 * @param isOpen whether to open
 * @param bloodComposition blood component calibration value
 */
fun onBloodCompositionReadSuccess(isOpen: Boolean, bloodComposition: BloodComponent)

/**
 * Blood component calibration reading failed
 */
fun onBloodCompositionReadFailed()

/**
 * Blood component calibration value set successfully
 * @param isOpen whether to open
 * @param bloodComposition blood component calibration value
 */
fun onBloodCompositionSettingSuccess(isOpen: Boolean, bloodComposition: BloodComponent)

/**
 * Failed to set blood component calibration value
 */
fun onBloodCompositionSettingFailed()
```

**BloodComponent** -- blood component calibration value, consistent with the class returned by [[Read daily data](##Read daily data)]

###### Sample code

```kotlin
VPOperateManager.getInstance().readBloodComponentCalibration(bleWriteResponse, optListener)
```

#### Set blood component calibration values

###### Prerequisites

Device supports blood component functionality

###### API

```
settingBloodComponentCalibration(bleWriteResponse, isOpen, bloodComponent, optListener)
```

###### Parameters

| Parameter name | Type | Description |
| ---------------- | ----------------------------- | -------------------- |
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |
| isOpen | Boolean | Whether to open blood component calibration |
| bloodComponent | BloodComponent | Blood component calibration value |
| optListener | IBloodComponentOptListener | Blood component operation listening |

###### Return data

**IBloodComponentOptListener** -- Blood component operation monitoring, returns the same as [[Read blood component calibration value](####Read blood component calibration value)]

###### Sample code

```kotlin
 VPOperateManager.getInstance().settingBloodComponentCalibration(bleWriteResponse, isOpen, bloodComponent, optListener)
```

#### Start blood component measurement

###### Prerequisites

The device needs to support blood component function

###### API

```kotlin
startDetectBloodComponent(bleWriteResponse, isUseCalibrationMode, detectListener)
```

###### Parameters

| Parameter name | Type | Description |
| -------------------- | -------------------------------- | ---------------- |
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |
| isUseCalibrationMode | Boolean | Whether to use calibration mode |
| detectListener | IBloodComponentDetectListener | Blood component measurement callback |

###### Data return

**IBloodComponentDetectListener** -- blood component measurement callback

```kotlin
/**
 * Detection failed
 */
fun onDetectFailed(errorState: EBloodComponentDetectState)

/**
 * Under detection
 * @param progress detection progress
 * @param bloodComponent blood component
 */
fun onDetecting(progress: Int, bloodComponent: BloodComponent)

/**
 *
 */
fun onDetectStop()

/**
 * Test completed
 * @param bloodComponent blood component
 */
fun onDetectComplete(bloodComponent: BloodComponent)
```

###### Sample code

```kotlin
VPOperateManager.getInstance().startDetectBloodComponent(bleWriteResponse, isUseCalibrationMode, detectListener)
```

#### Stop blood functional component measurement

###### Prerequisites

The device must support blood and have blood component measurement turned on

###### API

```
stopDetectBloodComponent(bleWriteResponse)
```

###### Return data

None

###### Sample code

```kotlin
VPOperateManager.getInstance().stopDetectBloodComponent {

}
```

## Read the manual measurement data of the device

Contains a variety of data reading, which must meet any of the following conditions before it can be read

**Blood pressure** Whether it supports reading, judgment conditions: it must support air pump blood pressure before it can be read, the judgment code is as follows:

```
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportBumpBp
```

**Others** Other data does not currently support reading manual measurement data, and will be supported in the future.

#### Read device manual measurement data

###### Prerequisites

Requires equipment support

###### API

```
readDeviceManualData(bleWriteResponse, timeStampSecond, dataTypeList, dataListener)
```

###### Parameters

| Parameter name | Type | Description |
|---------------- | ---------------------------------- | --------------------------------------------------------------- |
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |
| timeStampSecond | long | Second-level timestamp, indicating the last time read by the APP. The device only reports data larger than it. If its value is 0, it means that the APP has not read it last time |
| dataTypeList | List<DeviceManualDataType> | The data type to be read, if it is all, pass DeviceManualDataType.ALL |
| dataListener | IDeviceManualDetectDataListener | Device manual measurement data reading and listening |

**DeviceManualDataType** -- read data type

```kotlin
enum class DeviceManualDataType(val bitPosition: Int) {

    /**
     * 0x00 means blood pressure<br>
     * 0x01 indicates heart rate<br>
     * 0x02 means blood sugar<br>
     * 0x03 means pressure<br>
     * 0x04 means blood oxygen<br>
     * 0x05 indicates body temperature<br>
     * 0x06 means Mett<br>
     * 0x07 means HRV<br>
     * 0x08 indicates blood components<br>
     * 0x09 indicates micro-physical examination<br>
     * 0x0A indicates emotion<br>
     * 0x0B indicates fatigue degree<br>
     * 0x0C means skin electricity
     */
    BLOOD_PRESSURE(0),
    HEART_RATE(1),
    BLOOD_GLUCOSE(2),
    STRESS(3),
    BLOOD_OXYGEN(4),
    BODY_TEMPERATURE(5),
    MET(6),
    HRV(7),
    BLOOD_COMPOSITION(8),
    MINI_CHECKUP(9),
    EMOTION(10), // Emotion (bit 10)
    FATIGUE(11), // Fatigue (bit 11)
    SKIN_CONDUCTANCE(12), // Skin electricity (bit 12)
    ALL(33);

    // Calculate the corresponding binary mask
    val bitMask: Int
        get() = 1 shl bitPosition
   
}
```

###### Return data

**IDeviceManualDetectDataListener** -- device manual measurement data reading and listening

```kotlin
 /**
     * Callback of manual blood pressure measurement data
     *
     * @param bloodPressureManualDataList returns all blood pressure manual measurement data
     */
    fun onBloodPressureDataChange(bloodPressureManualDataList:List<BloodPressureManualData> );

    /**
     * Callback of manual heart rate measurement data
     *
     * @param heartRateManualDataList returns all blood pressure manual measurement data
     */
    fun onHeartRateDataChange(heartRateManualDataList:List<HeartRateManualData> );

    /**
     * Callback of manual blood glucose measurement data
     * @param bloodGlucoseManualDataList
     */
    fun onBloodGlucoseDataChange( bloodGlucoseManualDataList:List<BloodGlucoseManualData>);


    /**
     * Callback of manual pressure measurement data
     * @param pressureManualDataList
     */
    fun onPressureManualDataChange(pressureManualDataList:List<PressureManualData> );

    /**
     * Callback of manual blood oxygen measurement data
     * @param bloodOxygenManualDataList
     */
    fun onBloodOxygenDataChange(bloodOxygenManualDataList:List<BloodOxygenManualData> );
    /**
     * Manual body temperature measurement data callback
     * @param bodyTemperatureManualDataList
     */
    fun onBodyTemperatureDataChange(bodyTemperatureManualDataList:List<BodyTemperatureManualData> );

    /**
     *MeTo manual measurement data callback
     * @param metoManualDataList
     */
    fun onMetoManualDataChange(metoManualDataList:List<MetoManualData> );

    /**
     * HRV manual measurement data callback
     * @param hrvManualDataList
     */
    fun onHrvManualDataChange(hrvManualDataList:List<HrvManualData> );

    /**
     * Callback of manual measurement data of blood components
     * @param bloodComponentManualDataList
     */
    fun onBloodComponentManualDataChange(bloodComponentManualDataList:List<BloodComponentManualData> );

    /**
     * Micro physical examination manual measurement data callback
     * @param miniCheckupManualDataList
     */
    fun onMiniCheckupManualDataChange(miniCheckupManualDataList:List<MiniCheckupManualData> );

    /**
     * Emotion manual measurement data callback
     * @param emotionManualDataList
     */
    fun onEmotionManualDataChange(emotionManualDataList:List<EmotionManualData> );


    /**
     * Callback of manual fatigue measurement data
     * @param fatigueManualDataList
     */
    fun onFatigueManualDataChange(fatigueManualDataList：List<FatigueManualData> );

    /**
     * Callback of manual measurement data of skin electricity
     * @param skinConductanceManualDataList
     */
    fun onSkinConductanceManualDataChange(skinConductanceManualDataList：List<SkinConductanceManualData> );

    /**
     * Return the progress of reading
     *
     * @param progress progress value, range [0-1]
     */
    fun onReadProgress(float progress);

    /**
     * End of reading
     */
    fun onReadComplete();

    /**
     * Failed to read
     */
    fun onReadFail();
```

**BloodPressureManualData**--blood pressure manual measurement data

```java
/**
     * The measurement timestamp of this data
     */
    private int timeStamp;

    /**
     * Corresponding protocol type, 0x00: Air bag blood pressure (see air bag blood pressure single data structure for details)<br>0x01: Normal blood pressure
     * Note: When version == 1, only the systolic blood pressure (high blood pressure)-systolic and diastolic blood pressure (low blood pressure)-diastolic values are useful, and the other values have no reference significance.
     */
    private int version;

    /**
     *Measurement mode 0 photoelectric, 1 air bag
     */
    private int measurementMode;

    /**
     *Heart rate value
     */
    private int heartRate;

    /**
     * Systolic blood pressure (high blood pressure)
     */
    private int systolic;

    /**
     * Diastolic blood pressure (low blood pressure)
     */
    private int diastolic;

    /**
     *Test status
     */
    private int testStatus;

    /**
     *Result credibility
     */
    private int resultCredibility;

    /**
     * Height cm
     */
    private int height;

    /**
     * Weight kg
     */
    private int weight;

    /**
     *Age
     */
    private int age;

    /**
     * Gender: whether male or not
     */
    private boolean isMale;

    /**
     * Actual measurement time, maximum 60 seconds
     */
    private int testTime;

    /**
     * Measurement failure timeout count: If this number is exceeded and the minimum pressure value is not reached, the test will fail.
     */
    private int testFailTimeoutCount;

    /**
     * Air pump model
     */
    private int pumpModel;

    /**
     *AFE model
     */
    private int afeModel;

    /**
     * Acceleration model
     */
    private int accelerationModel;

    /**
     * mcu model
     */
    private int mcuModel;

    /**
     * Algorithm version
     */
    private String algorithmVersion;

    /**
     *Software version
     */
    private String softwareVersion;

    /**
     * Posture
     */
    private int[] attitudeArray;

    /**
     *Amount of exercise
     */
    private int[] sportArray;

    /**
     * Pressure ADC
     */
    private int[] pressureAdcArray;

    /**
     *PPG data ADC
     */
    private int[] ppgAdcArray;

    /**
     * Acceleration X-axis ADC
     */
    private int[] accelerationXArray;

    /**
     * Acceleration Y-axis ADC
     */
    private int[] accelerationYArray;

    /**
     * Acceleration Z-axis ADC
     */
    private int[] accelerationZArray;
```

**Others** --Other data is not supported yet, and the response data structure is not displayed yet.

###### Sample code

```kotlin
VPOperateManager.getInstance().readDeviceManualData(bleWriteResponse, timeStampSecond, dataTypeList, dataListener)
```

## Automatic measurement function

Prerequisite: The equipment needs to support the automatic measurement function, and the judgment conditions are as follows:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportAutoMeasure
```

Note: All the following interfaces can only be called if the device supports the automatic measurement function.

#### Read automatic measurement settings

###### Prerequisites

Requires equipment to support automatic measurement function

###### API

```
readAutoMeasureSettingData(bleWriteResponse, settingDataListener)
```

###### Parameters

| Parameter name | Type | Description |
| ------------------- | ---------------------------------- | -------------------------------------------------- |
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |
| settingDataListener | IAutoMeasureSettingDataListener | Monitors automatic measurement setting operations and returns automatic measurement setting data |

###### Data return

**IAutoMeasureSettingDataListener** -- Automatic measurement function callback

```kotlin
 /**
     * Returns the data of automatic measurement settings
     *
     * @param autoMeasureDataList Data list of automatic measurement settings
     */
    fun onSettingDataChange(autoMeasureDataList:List<AutoMeasureData>)

    fun onSettingDataChangeFail()

    fun onSettingDataChangeSuccess()
```

**AutoMeasureData** -- automatic measurement data

```kotlin
//Protocol type
    var protocolType = 0

    // Function type
    var funType = EAutoMeasureType.PULSE_RATE

    // function switch
    var isSwitchOpen = false

    //Support the smallest step, unit: m (minutes)
    var stepUnit = 0

    // Whether to support time period modification
    var isSlotModify = false

    // Whether to support time interval modification
    var isIntervalModify = false

    // Support test time period-start
    var supportStartMinute = 0

    // Support test period-end
    var supportEndMinute = 0

    // Measurement interval, unit: m (minutes)
    var measureInterval = 0

    //Current test period-start
    var currentStartMinute = 0

    //Current test period-end
    var currentEndMinute = 0
```

**EAutoMeasureType** -- automatic measurement type enumeration class

```kotlin
enum class EAutoMeasureType(val value: Int) {
    PULSE_RATE(0),
    BLOOD_PRESSURE(1),
    BLOOD_GLUCOSE(2),
    STRESS(3),
    BLOOD_OXYGEN(4),
    BODY_TEMPERATURE(5),
    LORENZ(6),
    HRV(7),
    BLOOD_COMPOSITION(8);

    companion object {
        fun fromValue(value: Int): EAutoMeasureType? {
            return values().find { it.value == value }
        }
    }
}
```

###### Sample code

```kotlin
VPOperateManager.getInstance().readAutoMeasureSettingData(bleWriteResponse, settingDataListener)
```

#### Set automatic measurement settings

###### Prerequisites

Requires equipment to support automatic measurement function

###### API

```
setAutoMeasureSettingData(bleWriteResponse, measureData, settingDataListener)
```

###### Parameters

| Parameter name | Type | Description |
| ------------------- | ---------------------------------- | -------------------------------------------------- |
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |
| measureData | AutoMeasureData | Automatic measurement data |
| settingDataListener | IAutoMeasureSettingDataListener | Monitors automatic measurement setting operations and returns automatic measurement setting data |

###### Data return

**IAutoMeasureSettingDataListener** -- Automatic measurement function callback, the same as [[Read device manual measurement data] (####Read device manual measurement data)] return the same

**AutoMeasureData** -- automatic measurement data, consistent with the data structure returned by [[Read device manual measurement data] (####Read device manual measurement data)]

###### Sample code

```kotlin
VPOperateManager.getInstance().setAutoMeasureSettingData(bleWriteResponse, measureData, settingDataListener)
```

## Image and text push function

Prerequisite: The device needs to support the image and text push function. The judgment conditions are as follows:

```
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportTextImagePush()
```

Note: All the following interfaces can only be called if the device supports the image and text push function.

### Push text messages

###### Prerequisites

The device needs to support image and text push function

###### API

```java
/**
* Push text messages
*
* @param msg text message
* @param listener text message push listening
*/
public void pushTextMsg(String msg, BleWriteResponse bleWriteResponse, ITextMsgPushListener listener)
```

###### Parameters

| Parameter name | Type | Description |
| ---------------- | -------------------- | ---------------- |
| msg | String | Need to send text message |
| bleWriteResponse | BleWriteResponse | Monitoring of write operations |
| listener | ITextMsgPushListener | Text push listening |

###### Data return

**ITextMsgPushListener** -- text push function callback

```java
/**
 * Text message push monitoring
 */
public interface ITextMsgPushListener extends IListener {

    /**
     * Text message pushed successfully
     */
    void onTextMsgPushSuccess();

    /**
     * Text message push failed
     */
    void onTextMsgPushFailed();

    /**
     *The current device does not support this function
     */
    void onFunctionNotSupport();
}
```

###### Sample code

```java
VPOperateManager.getInstance().pushTextMsg(content, new BleWriteResponse() {
    @Override
    public void onResponse(int code) {
        if(code!= Code.REQUEST_SUCCESS) {
            tvPushInfo.setText("Bluetooth data sending failed");
        }
    }
}, new ITextMsgPushListener() {
    @Override
    public void onTextMsgPushSuccess() {
        tvPushInfo.setText("Text push successful");
    }

    @Override
    public void onTextMsgPushFailed() {
        tvPushInfo.setText("Text push failed");
    }

    @Override
    public void onFunctionNotSupport() {
        tvPushInfo.setText("This function is not supported");
    }
});
```

### Push picture information

###### Prerequisites

The device needs to support image and text push function

###### API

```java
/**
* Push picture information
*
* @param imageFilePath local address of the image
* @param listener Picture message push listening
*/
public void pushImageMsg(String imageFilePath, IImageMsgPushListener listener)
```

###### Parameters

| Parameter name | Type | Description |
| ------------- | -------------------------- | -------------------- |
| imageFilePath | String | The local path of the image needs to be sent |
| listener | IImageMsgPushListener | Listener for picture information push |

###### Data return

**IImageMsgPushListener** -- text push function callback

```java
public interface IImageMsgPushListener extends IListener {

    void onImageMsgPushSuccess();

    /**
     *
     * @param currentBlock
     * @param sumBlock
     * @param progress
     */
    void onImageMsgPushProgress(int currentBlock, int sumBlock, int progress);

    /**
     * Image push error
     * @param errorCode error type
     */
    void onImageMsgPushFailed(ErrorCode errorCode);

    /**
     * Error code
     */
    enum ErrorCode {
        IMAGE_PATH_ERROR("The image address is wrong and does not exist"),
        IMAGE_SIZE_ERROR("Image size is abnormal"),
        IMAGE_TOO_LARGE("The image memory is too large"),
        TERMINATION("Transmission Termination"),
        LISTENER_IS_NULL("Listening is empty"),
        NEED_READ_BASE_INFO("Reading UI information without executing it first"),
        FILE_NOT_EXIST("File does not exist"),
        LOW_BATTERY("Battery is too low"),
        INTO_UPDATE_MODE_FAIL("Failed to enter UI mode"),
        FILE_LENGTH_NOT_4_POWER("The file is not 4-byte aligned"),
        CHECK_CRC_FAIL("crc check failed"),
        FUNCTION_NOT_SUPPORT("Function not supported"),
        UNKNOWN("Unknown error");

        ErrorCode(String info){
            this.info = info;
        }

        public String info;
    }
}
```

###### Sample code

```java
VPOperateManager.getInstance().pushImageMsg(pushImagePath, new IImageMsgPushListener() {
    @Override
    public void onImageMsgPushSuccess() {
        tvPushInfo.setText("Picture pushed successfully");
    }

    @Override
    public void onImageMsgPushProgress(int currentBlock, int sumBlock, int progress) {
        tvPushInfo.setText("Picture push progress: " + progress + "%");
    }

    @Override
    public void onImageMsgPushFailed(ErrorCode errorCode) {
        tvPushInfo.setText("Picture push error: " + errorCode.info);
    }
});
```

## Mini-checkup function (v1.1.7)

Performs a unified comprehensive health assessment combining multiple sensor measurements in a single ~60-second test cycle. Covers cardiovascular, metabolic, psychological, and body-composition data.

Prerequisite: device must support the mini-checkup feature:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportMiniCheckup
```

Note: All interfaces below are only callable when the device supports this function.

### Start mini-checkup

###### API

```java
public void startMiniCheckup(IBleWriteResponse bleWriteResponse, IMiniCheckupOptListener listener)
```

###### Parameters

| Parameter name   | Type                    | Description |
| ---------------- | ----------------------- | ----------- |
| bleWriteResponse | IBleWriteResponse       | BLE write-operation monitoring (BLE transport success only; measurement outcome comes via listener) |
| listener         | IMiniCheckupOptListener | Measurement event callbacks |

### Stop mini-checkup

###### API

```java
public void stopMiniCheckup(IBleWriteResponse bleWriteResponse, IMiniCheckupOptListener listener)
```

###### Parameters

Same parameters as `startMiniCheckup`.

### IMiniCheckupOptListener

Listener interface for all mini-checkup callbacks:

```java
public interface IMiniCheckupOptListener {

    /**
     * Measurement step progress (0–100).
     */
    void onMiniCheckupProgress(int progress);

    /**
     * Basic 10-parameter result available.
     */
    void onMiniCheckupSuccess(MiniCheckupResultData data);

    /**
     * Extended detail result available (includes sub-component breakdown).
     * Fired after onMiniCheckupSuccess when detail data is supported.
     */
    void onMiniCheckupDetailSuccess(MiniCheckupDetailData data);

    /**
     * Measurement failed.
     */
    void onMiniCheckupTestFailed(EMiniCheckupTestErrorCode errorCode);

    /**
     * Stop command acknowledged successfully.
     */
    void onMiniCheckupStopSuccess();
}
```

### MiniCheckupResultData

Basic 10-parameter summary accessible via getter methods:

| Getter | Unit | Description |
| ------ | ---- | ----------- |
| `getHeartRate()` | bpm | Heart rate |
| `getBloodOxygen()` | % | Blood oxygen saturation (SpO2) |
| `getStress()` | score | Psychological stress index |
| `getEmotion()` | score | Emotional state index |
| `getFatigue()` | score | Fatigue level |
| `getBloodGlucose()` | mmol/L | Blood glucose (type 0 = unsupported; type 1 = mmol/L value; type 2 = risk level) |
| `getBodyTemperature()` | °C | Body temperature (`-273.15f` = unsupported) |
| `getSystolicBloodPressure()` | mmHg | Systolic blood pressure |
| `getDiastolicBloodPressure()` | mmHg | Diastolic blood pressure |
| `getHrv()` | ms | Heart rate variability |

### MiniCheckupDetailData

Extended result with sub-component objects (each may be `null` when unsupported by the connected Band):

**MiniCheckupBasePersonalInfo** — echoed personal data used for body-composition calculations:

| Field | Type | Description |
| ----- | ---- | ----------- |
| gender | int | 0 = female, 1 = male |
| age | int | Age (years) |
| height | int | Height (cm) |
| weight | int | Weight (kg) |

**MiniCheckupBPAirPump** — air-pump blood pressure:

| Field | Type | Description |
| ----- | ---- | ----------- |
| systolic | int | Systolic BP (mmHg) |
| diastolic | int | Diastolic BP (mmHg) |

**MiniCheckupBPPhotoelectric** — PPG-based (photoelectric) blood pressure:

| Field | Type | Description |
| ----- | ---- | ----------- |
| systolic | int | Systolic BP (mmHg) |
| diastolic | int | Diastolic BP (mmHg) |

**MiniCheckupBloodComponent** — blood chemistry panel:

| Getter | Unit | Description |
| ------ | ---- | ----------- |
| `getUricAcid()` | µmol/L | Uric acid (gout/kidney indicator) |
| `gettCHO()` | mmol/L | Total cholesterol |
| `gettAG()` | mmol/L | Triglycerides |
| `gethDL()` | mmol/L | HDL cholesterol |
| `getlDL()` | mmol/L | LDL cholesterol |

**MiniCheckupBodyComponent** — body composition:

| Getter | Unit | Description |
| ------ | ---- | ----------- |
| `getBMI()` | kg/m² | Body Mass Index |
| `getBodyFatPercentage()` | % | Body fat percentage |
| `getFatMass()` | kg | Fat mass |
| `getMusclePercentage()` | % | Muscle percentage |
| `getMuscleMass()` | kg | Muscle mass |
| `getSkeletalMusclePercentage()` | % | Skeletal muscle percentage |
| `getSubcutaneousFat()` | % | Subcutaneous fat ratio |
| `getBodyWaterPercentage()` | % | Body water percentage |
| `getWaterContent()` | kg | Water content |
| `getBoneMass()` | kg | Bone mass |
| `getProteinProportion()` | % | Protein proportion |
| `getProteinMass()` | kg | Protein mass |
| `getBasalMetabolicRate()` | kcal/day | Basal metabolic rate |

**MiniCheckupSkinElectricity** — galvanic skin response / psychophysiological panel:

| Getter | Description |
| ------ | ----------- |
| `getEmotion()` | Emotional state score |
| `getSkinMoistureContent()` | Skin hydration level |
| `getDepressionRisk()` | Mental health indicator |
| `getSympathetic()` | Autonomic nervous system (sympathetic) activation |
| `getCortisol()` | Estimated cortisol (stress hormone) level |

### EMiniCheckupStep

Enumeration of measurement phases reported during progress callbacks:

```kotlin
enum class EMiniCheckupStep {
    STEP_PREPARE,           // Preparation / calibration phase
    STEP_HEART_RATE,        // Measuring heart rate
    STEP_BLOOD_OXYGEN,      // Measuring SpO2
    STEP_BLOOD_PRESSURE,    // Measuring blood pressure
    STEP_HRV,               // Measuring HRV
    STEP_STRESS,            // Analyzing stress level
    STEP_EMOTION,           // Analyzing emotional state
    STEP_FATIGUE,           // Measuring fatigue
    STEP_BLOOD_GLUCOSE,     // Measuring blood glucose
    STEP_TEMPERATURE,       // Measuring body temperature
    STEP_BLOOD_COMPONENT,   // Analyzing blood chemistry
    STEP_BODY_COMPONENT,    // Analyzing body composition
    STEP_SKIN_ELECTRICITY,  // Measuring skin conductance (GSR)
    STEP_COMPLETE           // All measurements complete
}
```

### EMiniCheckupTestErrorCode

Error codes delivered via `onMiniCheckupTestFailed`:

| Code | Description |
| ---- | ----------- |
| `SENSOR_ERROR` | Hardware sensor failure |
| `TIMEOUT` | Measurement timed out |
| `MOVEMENT_DETECTED` | User motion interrupted measurement |
| `DISCONNECTED` | BLE connection lost during test |
| `LOW_BATTERY` | Battery insufficient to complete test |

###### Sample code

```kotlin
VPOperateManager.getInstance().startMiniCheckup(
    { code ->
        if (code != Code.REQUEST_SUCCESS) {
            Log.e("TAG", "BLE write failed: $code")
        }
    },
    object : IMiniCheckupOptListener {
        override fun onMiniCheckupProgress(progress: Int) {
            Log.d("TAG", "Mini-checkup progress: $progress%")
        }

        override fun onMiniCheckupSuccess(data: MiniCheckupResultData) {
            Log.d("TAG", "HR=${data.heartRate} SpO2=${data.bloodOxygen} Stress=${data.stress}")
        }

        override fun onMiniCheckupDetailSuccess(data: MiniCheckupDetailData) {
            val bodyComp = data.bodyComponent
            if (bodyComp != null) {
                Log.d("TAG", "BMI=${bodyComp.bmi} BodyFat=${bodyComp.bodyFatPercentage}%")
            }
            val skinElec = data.skinElectricity
            if (skinElec != null) {
                Log.d("TAG", "Emotion=${skinElec.emotion} Depression=${skinElec.depressionRisk}")
            }
        }

        override fun onMiniCheckupTestFailed(errorCode: EMiniCheckupTestErrorCode) {
            Log.e("TAG", "Mini-checkup failed: $errorCode")
        }

        override fun onMiniCheckupStopSuccess() {
            Log.d("TAG", "Mini-checkup stopped")
        }
    }
)
```

---

## GSR detection function (v1.1.9)

Measures galvanic skin response (skin electrical conductance) for stress and emotional-state assessment.

Prerequisite: device must support GSR measurement:

```kotlin
VpSpGetUtil.getVpSpVariInstance(applicationContext).isSupportGsrDetect
```

### Start GSR detection

###### API

```kotlin
VPOperateManager.getInstance().startGsrDetect(bleWriteResponse, listener)
```

###### Parameters

| Parameter name   | Type                  | Description |
| ---------------- | --------------------- | ----------- |
| bleWriteResponse | IBleWriteResponse     | BLE write monitoring |
| listener         | IGsrDetectListener    | GSR result callbacks |

### Stop GSR detection

###### API

```kotlin
VPOperateManager.getInstance().stopGsrDetect(bleWriteResponse)
```

###### Parameters

| Parameter name   | Type              | Description |
| ---------------- | ----------------- | ----------- |
| bleWriteResponse | IBleWriteResponse | BLE write monitoring |

### IGsrDetectListener

```kotlin
interface IGsrDetectListener {

    /**
     * Called each time a GSR measurement result arrives.
     */
    fun onGsrDetectResult(result: GsrDetectResult)
}
```

### GsrDetectResult

| Field | Type | Description |
| ----- | ---- | ----------- |
| gsrValue | Int | GSR measurement value (skin conductance) |
| ack | GsrDetectAck | Detection acknowledgment / phase |

### GsrDetectAck

```kotlin
enum class GsrDetectAck {
    ACK_START,     // Detection initiated on device
    ACK_COMPLETE,  // Detection cycle finished, result valid
    ACK_FAIL       // Detection unsuccessful
}
```

###### Sample code

```kotlin
VPOperateManager.getInstance().startGsrDetect(
    { code ->
        if (code != Code.REQUEST_SUCCESS) Log.e("TAG", "GSR write failed: $code")
    },
    object : IGsrDetectListener {
        override fun onGsrDetectResult(result: GsrDetectResult) {
            when (result.ack) {
                GsrDetectAck.ACK_START    -> Log.d("TAG", "GSR started on device")
                GsrDetectAck.ACK_COMPLETE -> Log.d("TAG", "GSR value: ${result.gsrValue}")
                GsrDetectAck.ACK_FAIL     -> Log.e("TAG", "GSR detection failed")
            }
        }
    }
)

// Stop detection when done:
VPOperateManager.getInstance().stopGsrDetect { code ->
    Log.d("TAG", "GSR stop ack: $code")
}
```

---

## Device function package reporting (v1.1.8)

Version 1.1.8 deprecated the monolithic `onFunctionSupportDataChange(FunctionDeviceSupportData)` callback (still present for backwards compatibility) and replaced it with five typed package callbacks on `IDeviceDataListener`:

```kotlin
// New — preferred
fun onDeviceFunctionPackage1Report(pkg: DeviceFunctionPackage1)
fun onDeviceFunctionPackage2Report(pkg: DeviceFunctionPackage2)
fun onDeviceFunctionPackage3Report(pkg: DeviceFunctionPackage3)
fun onDeviceFunctionPackage4Report(pkg: DeviceFunctionPackage4)
fun onDeviceFunctionPackage5Report(pkg: DeviceFunctionPackage5)

// Deprecated — may be removed in a future SDK version
@Deprecated
fun onFunctionSupportDataChange(functionSupport: FunctionDeviceSupportData)
```

Each `DeviceFunctionPackageN` object exposes the same `EFunctionStatus`-typed fields as before, partitioned into five groups to avoid the 256-byte protocol limit. Refer to the vendor wiki for the field list per package; the bridge currently reads all flags via `readDeviceFunctions()` which merges all five packages into `DeviceFunction`.

---

## Notes on versions 1.2.x (not yet fully documented in this snapshot)

The following capabilities were added in the 1.2.x line and are not yet reflected in this offline snapshot. Consult the live [Android API wiki](https://github.com/HBandSDK/Android_Ble_SDK/wiki/VeepooSDK-Android-API-Document) for details.

| Version | Feature | Notes |
| ------- | ------- | ----- |
| 1.2.0 | ZT163 always-off-screen | Likely mirrors the iOS `veepooSDK_ZT163*` APIs |
| 1.2.1 | Micro-Physical-Exam V2; health reminders; 4G | Extended micro-exam with health reminder scheduling; 4G network band config |
| 1.2.2 | Manual measurement data — 12 types; type list | Expands `readDeviceManualData` to 12 `DeviceManualDataType` values; adds query API for which types the device supports |
| 1.2.3 | Connection confirmation (pop-up) | Device shows a pairing/connection confirmation pop-up; app must respond |
| 1.2.4 | Nordic OTA | Adds the Nordic DFU path alongside the existing JL (Jerry) OTA path |
| 1.2.5 | SDK import docs | Documentation only |
| 1.2.6 | Sport control (set/read/report); device rename | App can set active sport mode on the Band and rename the device |
| 1.2.7 | ECG diagnosis | On-device ECG analysis with diagnostic output |
| 1.2.8 | App-side HRV detection | HRV measurement initiated from the app (not from Band gesture) |
| 1.2.9 | QX17 IMU/GPS/HR flow control; vibration motor | QX17 custom device: start/stop IMU, GPS, HR streams; vibration motor control |

###
