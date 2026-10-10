package com.example.aali_resident_app

import android.media.MediaPlayer
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "aali.audio/player"
    private var mediaPlayer: MediaPlayer? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        val channel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
        channel.setMethodCallHandler { call, result ->
            when (call.method) {
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

    override fun onDestroy() {
        mediaPlayer?.release()
        mediaPlayer = null
        super.onDestroy()
    }
}
