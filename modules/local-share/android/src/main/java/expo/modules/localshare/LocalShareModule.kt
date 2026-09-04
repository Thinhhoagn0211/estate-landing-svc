package expo.modules.localshare

import android.content.ClipData
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.core.content.FileProvider
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream

class LocalShareModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LocalShare")

    AsyncFunction("shareImagesToZalo") { fileUris: List<String>, text: String?, promise: Promise ->
      val context = appContext.reactContext
      val activity = appContext.currentActivity
      if (context == null || activity == null) {
        promise.reject(Exceptions.ReactContextLost())
        return@AsyncFunction
      }
      if (fileUris.isEmpty()) {
        promise.reject("LOCAL_SHARE_EMPTY", "Không có ảnh để chia sẻ", null)
        return@AsyncFunction
      }

      val mediaUris = ArrayList<Uri>()
      try {
        // Zalo's share activity may reject private FileProvider URIs for albums.
        // Put temporary copies in MediaStore, the same URI type produced by the
        // Android gallery, then remove them after the user returns to our app.
        fileUris.forEachIndexed { index, rawUri ->
          val source = Uri.parse(rawUri)
          val mime = context.contentResolver.getType(source) ?: when {
            rawUri.endsWith(".png", true) -> "image/png"
            rawUri.endsWith(".webp", true) -> "image/webp"
            else -> "image/jpeg"
          }
          val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, "upload-post-${System.currentTimeMillis()}-$index.${mime.substringAfter('/', "jpeg")}")
            put(MediaStore.Images.Media.MIME_TYPE, mime)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
              put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/UploadPostShare")
              put(MediaStore.Images.Media.IS_PENDING, 1)
            }
          }
          val destination = context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
            ?: throw IllegalStateException("Không tạo được ảnh tạm trong thư viện ảnh")
          try {
            val input = if (source.scheme == "content") {
              context.contentResolver.openInputStream(source)
            } else {
              FileInputStream(File(source.path ?: rawUri))
            } ?: throw IllegalStateException("Không đọc được ảnh local")
            input.use { stream ->
              context.contentResolver.openOutputStream(destination)?.use { output -> stream.copyTo(output) }
                ?: throw IllegalStateException("Không ghi được ảnh tạm")
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
              context.contentResolver.update(destination, ContentValues().apply {
                put(MediaStore.Images.Media.IS_PENDING, 0)
              }, null, null)
            }
            mediaUris.add(destination)
          } catch (error: Exception) {
            context.contentResolver.delete(destination, null, null)
            throw error
          }
        }

        // Send the complete post payload in one user-initiated Android share:
        // every selected image plus the caption. Zalo controls whether its
        // composer displays the text, but EXTRA_TEXT is the platform-standard
        // way to pass it to a receiving app.
        val contentUris = mediaUris
        contentUris.forEach { context.grantUriPermission("com.zing.zalo", it, Intent.FLAG_GRANT_READ_URI_PERMISSION) }
        val clip = ClipData.newUri(context.contentResolver, "images", contentUris.first())
        contentUris.drop(1).forEach { clip.addItem(ClipData.Item(it)) }
        val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
          type = "image/*"
          putParcelableArrayListExtra(Intent.EXTRA_STREAM, contentUris)
          text?.takeIf { it.isNotBlank() }?.let { putExtra(Intent.EXTRA_TEXT, it) }
          setPackage("com.zing.zalo")
          addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          clipData = clip
        }
        // Expo AsyncFunction work is not guaranteed to run on the Android UI
        // thread. Starting an Activity from it can be silently ignored on some
        // devices, so perform the hand-off on the current Activity's UI thread.
        activity.runOnUiThread {
          try {
            activity.startActivity(intent)
            promise.resolve(mapOf("success" to true, "count" to contentUris.size, "skippedCount" to 0, "cleanupUris" to mediaUris.map(Uri::toString)))
          } catch (error: Exception) {
            mediaUris.forEach { context.contentResolver.delete(it, null, null) }
            promise.reject("LOCAL_SHARE_ERROR", error.message ?: "Không mở được Zalo", error)
          }
        }
      } catch (error: Exception) {
        mediaUris.forEach { context.contentResolver.delete(it, null, null) }
        promise.reject("LOCAL_SHARE_ERROR", error.message ?: "Không mở được Zalo", error)
      }
    }

    AsyncFunction("deleteSharedImages") { uriStrings: List<String> ->
      val context = appContext.reactContext ?: return@AsyncFunction
      uriStrings.forEach { runCatching { context.contentResolver.delete(Uri.parse(it), null, null) } }
    }
  }
}
