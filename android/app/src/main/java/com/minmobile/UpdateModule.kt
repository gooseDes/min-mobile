package com.minmobile

import android.app.DownloadManager
import android.content.*
import android.net.Uri
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File

class UpdateModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "UpdateModule"

    private fun sendEvent(eventName: String, progress: Int, status: String) {
        val params =
                Arguments.createMap().apply {
                    putInt("progress", progress)
                    putString("status", status)
                }
        reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
    }

    @ReactMethod
    fun downloadAndInstall(
            url: String,
            notificationTitle: String = "Download Completed",
            notificationBody: String = "Tap to install"
    ) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext
                    .getSharedPreferences("update_prefs", Context.MODE_PRIVATE)
                    .edit()
                    .putString("notif_title", notificationTitle)
                    .putString("notif_body", notificationBody)
                    .apply()

            val manager =
                    reactApplicationContext.getSystemService(Context.DOWNLOAD_SERVICE) as
                            DownloadManager
            val uri = Uri.parse(url)

            val destinationFile = File(reactApplicationContext.externalCacheDir, "update.apk")
            if (destinationFile.exists()) destinationFile.delete()

            val request =
                    DownloadManager.Request(uri).apply {
                        setDestinationUri(Uri.fromFile(destinationFile))
                        setNotificationVisibility(
                                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
                        )
                        setMimeType("application/vnd.android.package-archive")
                    }

            val downloadId = manager.enqueue(request)
            sendEvent("onDownloadProgress", 0, "started")

            Thread {
                        var isDownloading = true
                        while (isDownloading) {
                            val query = DownloadManager.Query().setFilterById(downloadId)
                            val cursor = manager.query(query)

                            if (cursor.moveToFirst()) {
                                val bytesDownloaded =
                                        cursor.getLong(
                                                cursor.getColumnIndexOrThrow(
                                                        DownloadManager
                                                                .COLUMN_BYTES_DOWNLOADED_SO_FAR
                                                )
                                        )
                                val bytesTotal =
                                        cursor.getLong(
                                                cursor.getColumnIndexOrThrow(
                                                        DownloadManager.COLUMN_TOTAL_SIZE_BYTES
                                                )
                                        )
                                val downloadStatus =
                                        cursor.getInt(
                                                cursor.getColumnIndexOrThrow(
                                                        DownloadManager.COLUMN_STATUS
                                                )
                                        )

                                when (downloadStatus) {
                                    DownloadManager.STATUS_RUNNING -> {
                                        val progress =
                                                if (bytesTotal > 0)
                                                        (bytesDownloaded * 100 / bytesTotal).toInt()
                                                else 0
                                        sendEvent("onDownloadProgress", progress, "downloading")
                                    }
                                    DownloadManager.STATUS_SUCCESSFUL -> {
                                        sendEvent("onDownloadProgress", 100, "installing")
                                        isDownloading = false
                                    }
                                    DownloadManager.STATUS_FAILED -> {
                                        sendEvent("onDownloadProgress", 0, "error")
                                        isDownloading = false
                                    }
                                }
                            }

                            cursor.close()
                            if (isDownloading) Thread.sleep(300)
                        }
                    }
                    .start()
        }
    }

    @ReactMethod fun addListener(eventName: String) {}

    @ReactMethod fun removeListeners(count: Double) {}
}
