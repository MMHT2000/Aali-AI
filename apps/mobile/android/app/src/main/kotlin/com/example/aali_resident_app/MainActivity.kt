package com.example.aali_resident_app

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaPlayer
import android.os.Build
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "aali.audio/player"
    private val NOTIF_CHANNEL_ID = "aali_emergency_channel"
    private var mediaPlayer: MediaPlayer? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        createNotificationChannel()

        val channel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
        channel.setMethodCallHandler { call, result ->
            when (call.method) {
                "requestNotificationPermission" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 101)
                            result.success(false)
                        } else {
                            result.success(true)
                        }
                    } else {
                        result.success(true)
                    }
                }
                "showEmergencyNotification" -> {
                    val title = call.argument<String>("title") ?: "জরুরি বন্যা সতর্কতা"
                    val body = call.argument<String>("body") ?: "অবিলম্বে নিকটস্থ আশ্রয়কেন্দ্রে অবস্থান নিন।"
                    showNotification(title, body)
                    result.success(true)
                }
                "play" -> {
                    val track = call.argument<String>("track") ?: "feni"
                    val resId = if (track.equals("sylhet", ignoreCase = true)) {
                        R.raw.sylhet_evacuation_warning
                    } else {
                        R.raw.feni_evacuation_warning
                    }

                    try {
                        mediaPlayer?.stop()
                        mediaPlayer?.release()
                        mediaPlayer = null

                        val player = MediaPlayer.create(this, resId)
                        if (player != null) {
                            mediaPlayer = player
                            player.setOnCompletionListener {
                                mediaPlayer?.release()
                                mediaPlayer = null
                                channel.invokeMethod("onPlaybackComplete", null)
                            }
                            player.start()
                            result.success(true)
                        } else {
                            result.error("CREATE_FAILED", "Failed to create MediaPlayer for $track", null)
                        }
                    } catch (e: Exception) {
                        result.error("PLAY_ERROR", e.message, null)
                    }
                }
                "stop" -> {
                    try {
                        mediaPlayer?.stop()
                        mediaPlayer?.release()
                        mediaPlayer = null
                        result.success(true)
                    } catch (e: Exception) {
                        result.error("STOP_ERROR", e.message, null)
                    }
                }
                "isPlaying" -> {
                    result.success(mediaPlayer?.isPlaying == true)
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Aali Emergency Flood Alerts"
            val descriptionText = "Urgent flood warning and civil defense evacuation broadcasts"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(NOTIF_CHANNEL_ID, name, importance).apply {
                description = descriptionText
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun showNotification(title: String, body: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent: PendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0
        )

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, NOTIF_CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        builder.setContentTitle(title)
            .setContentText(body)
            .setStyle(Notification.BigTextStyle().bigText(body))
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(Notification.PRIORITY_MAX)

        notificationManager.notify(1001, builder.build())
    }

    override fun onDestroy() {
        mediaPlayer?.release()
        mediaPlayer = null
        super.onDestroy()
    }
}
