/**
 * Shared wearable TypeScript contracts (compile-time only).
 *
 * This file contains only shape/type information for alignment across
 * packages and services. It MUST NOT contain secrets or runtime crypto code.
 */

/** Metadata describing a device. No secrets included here. */
export type DeviceMetadata = {
  /** Primary unique identifier for the device (internal) */
  id: string;
  /** Manufacturer-provided device identifier */
  deviceId: string;
  /** Human-friendly name for the device (optional) */
  name?: string;
  /** Device model or SKU (optional) */
  model?: string;
  /** Manufacturer (optional) */
  manufacturer?: string;
  /** Firmware version string (optional) */
  firmwareVersion?: string;
  /** ISO timestamp when device was first seen/registered */
  registeredAt?: string;
  /** ISO timestamp of last contact */
  lastSeenAt?: string | null;
  /** Assigned patient id if known */
  assignedPatientId?: string | null;
};

/** Single wearable reading shape persisted/transported by the system */
export type WearableReading = {
  /** Optional unique id for the reading */
  id?: string;
  /** Device identifier producing the reading */
  deviceId: string;
  /** The metric/type e.g. 'heart_rate', 'spo2', 'steps' */
  type: string;
  /** Value may be numeric, string, or a structured object for complex readings */
  value?: number | string | Record<string, unknown> | null;
  /** Unit for the value (if applicable) */
  unit?: string | null;
  /** ISO 8601 timestamp for when the reading was recorded */
  timestamp: string;
  /** Optional patient id (if device is assigned) */
  patientId?: string | null;
  /** Raw provider payload (kept optional and opaque) */
  raw?: Record<string, unknown>;
};

/**
 * SignedPayload is a transport wrapper used by ingestion pipelines.
 * This type only describes the shape — it contains no crypto logic.
 */
export type SignedPayload<T = WearableReading | WearableReading[]> = {
  /** The protected payload */
  payload: T;
  /** External signature string (opaque) */
  signature: string;
  /** Optional key id / signer id */
  keyId?: string;
  /** Optional issued-at timestamp */
  issuedAt?: string;
};

export default {} as unknown;
