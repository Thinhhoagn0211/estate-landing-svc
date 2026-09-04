package expo.modules.zaloshare

import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.zing.zalo.zalosdk.oauth.FeedData
import com.zing.zalo.zalosdk.oauth.OpenAPIService
import com.zing.zalo.zalosdk.oauth.ZaloPluginCallback
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

// Thin wrapper around Zalo's official Android SDK (me.zalo:sdk-openapi) —
// hands the post off to the Zalo app itself via OpenAPIService.shareFeed, the
// documented app-to-app share entry point. This does NOT go through the
// deprecated /me/feed server API (confirmed dead, error 11004), so it stays
// within Zalo's current ToS for third-party posting to a user's Nhật ký.
class ZaloShareModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ZaloShare")

    AsyncFunction("shareImage") { imageUrl: String, message: String?, promise: Promise ->
      val context = appContext.reactContext
      val activity = appContext.currentActivity
      if (context == null || activity == null) {
        promise.reject(Exceptions.ReactContextLost())
        return@AsyncFunction
      }

      Thread {
        var connection: HttpURLConnection? = null
        try {
          connection = URL(imageUrl).openConnection() as HttpURLConnection
          connection.connectTimeout = 15_000
          connection.readTimeout = 30_000
          connection.instanceFollowRedirects = true
          connection.connect()
          if (connection.responseCode !in 200..299) {
            throw IllegalStateException("Không tải được ảnh (HTTP ${connection.responseCode})")
          }
          val mimeType = connection.contentType?.substringBefore(';')?.takeIf { it.startsWith("image/") } ?: "image/jpeg"
          val extension = if (mimeType == "image/png") "png" else if (mimeType == "image/webp") "webp" else "jpg"
          val directory = File(context.cacheDir, "zalo-share").apply { mkdirs() }
          val imageFile = File(directory, "${UUID.randomUUID()}.$extension")
          connection.inputStream.use { input -> FileOutputStream(imageFile).use { output -> input.copyTo(output) } }

          val uri: Uri = FileProvider.getUriForFile(context, "${context.packageName}.zalo-share.fileprovider", imageFile)
          val intent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, uri)
            message?.takeIf { it.isNotBlank() }?.let { putExtra(Intent.EXTRA_TEXT, it) }
            setPackage("com.zing.zalo")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          }
          activity.runOnUiThread {
            try {
              activity.startActivity(intent)
              promise.resolve(mapOf("success" to true))
            } catch (error: Exception) {
              promise.reject("ZALO_SHARE_ERROR", error.message ?: "Không mở được Zalo", error)
            }
          }
        } catch (error: Exception) {
          promise.reject("ZALO_SHARE_ERROR", error.message ?: "Không chia sẻ được ảnh", error)
        } finally {
          connection?.disconnect()
        }
      }.start()
    }

    AsyncFunction("shareFeed") { msg: String, link: String?, linkTitle: String?, linkDesc: String?, linkThumb: String?, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject(Exceptions.ReactContextLost())
        return@AsyncFunction
      }

      val feedData = FeedData().apply {
        setMsg(msg)
        link?.let { setLink(it) }
        linkTitle?.let { setLinkTitle(it) }
        linkDesc?.let { setLinkDesc(it) }
        linkThumb?.let { setLinkThumb(arrayOf(it)) }
      }

      OpenAPIService.getInstance().shareFeed(
        context,
        feedData,
        object : ZaloPluginCallback {
          override fun onResult(success: Boolean, errorCode: Int, message: String?, data: String?) {
            if (success) {
              promise.resolve(mapOf("success" to true))
            } else {
              promise.reject("ZALO_SHARE_ERROR", message ?: "Zalo share thất bại (code $errorCode)", null)
            }
          }
        }
      )
    }
  }
}
