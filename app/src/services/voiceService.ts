import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MAX_VOICE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (Requirement 6.4)

/**
 * Requests microphone access, creates a MediaRecorder, starts it, and returns it.
 */
export async function startRecording(): Promise<MediaRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  recorder.start();
  return recorder;
}

/**
 * Stops the given MediaRecorder and collects all recorded chunks into a Blob.
 * Also stops all underlying media tracks to release the microphone.
 */
export function stopRecording(recorder: MediaRecorder): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      // Release the microphone
      recorder.stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: "audio/webm" });
      resolve(blob);
    };

    recorder.onerror = (event) => {
      reject(new Error(`MediaRecorder error: ${event.type}`));
    };

    recorder.stop();
  });
}

/**
 * Uploads a voice message blob to Firebase Storage.
 * Path: voice-messages/{convId}/{msgId}.webm
 * Returns the download URL.
 * Throws if the blob exceeds 10 MB (Requirement 6.4).
 */
export async function uploadVoiceMessage(
  convId: string,
  msgId: string,
  blob: Blob
): Promise<string> {
  if (blob.size > MAX_VOICE_SIZE_BYTES) {
    throw new Error(
      `Voice message exceeds the 10 MB limit (size: ${blob.size} bytes)`
    );
  }

  const storageRef = ref(storage, `voice-messages/${convId}/${msgId}.webm`);
  await uploadBytes(storageRef, blob, { contentType: "audio/webm" });
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
