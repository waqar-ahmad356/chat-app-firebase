const MAX_VOICE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB limit for Firestore base64

export async function startRecording(): Promise<MediaRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  recorder.start();
  return recorder;
}

export function stopRecording(recorder: MediaRecorder): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      recorder.stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(chunks, { type: "audio/webm" }));
    };
    recorder.onerror = () => reject(new Error("Recording failed"));
    recorder.stop();
  });
}

/** Convert blob to base64 data URL — stored directly in Firestore (no Storage needed) */
export async function uploadVoiceMessage(
  _convId: string,
  _msgId: string,
  blob: Blob
): Promise<string> {
  if (blob.size > MAX_VOICE_SIZE_BYTES) {
    throw new Error("Voice message too long. Please keep it under ~30 seconds.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
