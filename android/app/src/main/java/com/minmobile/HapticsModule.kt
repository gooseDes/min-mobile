package com.minmobile

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HapticsModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "HapticsModule"

    @ReactMethod
    fun vibrate(duration: Int, scale: Float) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val vibrator = reactApplicationContext.getSystemService(Vibrator::class.java)
        vibrator?.let {
            it.vibrate(
                    VibrationEffect.createOneShot(
                            duration.toLong(),
                            (scale * 255).toInt().coerceIn(1, 255)
                    )
            )
        }
    }

    @ReactMethod
    fun vibrateEffect(type: String, scale: Float) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            vibrate(100, scale)
        } else {
            val vibrator = reactApplicationContext.getSystemService(Vibrator::class.java) ?: return
            val primitive =
                    when (type) {
                        "slow_rise" -> VibrationEffect.Composition.PRIMITIVE_SLOW_RISE
                        "quick_rise" -> VibrationEffect.Composition.PRIMITIVE_QUICK_RISE
                        "quick_fall" -> VibrationEffect.Composition.PRIMITIVE_QUICK_FALL
                        "spin" -> VibrationEffect.Composition.PRIMITIVE_SPIN
                        "thud" -> VibrationEffect.Composition.PRIMITIVE_THUD
                        else -> VibrationEffect.Composition.PRIMITIVE_SLOW_RISE
                    }
            vibrator.vibrate(
                    VibrationEffect.startComposition().addPrimitive(primitive, scale).compose()
            )
        }
    }
}
