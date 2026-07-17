import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export type RsvpDecision = "yes" | "no";

export interface RsvpPayload {
  decision: RsvpDecision;
  watchDate?: string;
  theatre?: string;
}

export interface RsvpResult {
  ok: boolean;
  reason?: string;
}

/**
 * Writes an RSVP to the `rsvps` Firestore collection. Fails soft — the UI
 * flow (thank-you / confirmation copy) must not depend on this succeeding,
 * since the invite should never feel broken if Firebase env vars are unset.
 */
export async function submitRsvp(payload: RsvpPayload): Promise<RsvpResult> {
  if (!isFirebaseConfigured || !db) {
    return { ok: false, reason: "firebase-not-configured" };
  }

  try {
    await addDoc(collection(db, "rsvps"), {
      ...payload,
      createdAt: serverTimestamp(),
      userAgent: typeof navigator === "undefined" ? null : navigator.userAgent,
    });
    return { ok: true };
  } catch (error) {
    console.error("Failed to submit RSVP", error);
    return { ok: false, reason: "write-failed" };
  }
}
