type Listener = (state: { connectedDeviceId: string | null }) => void;

let connectedDeviceId: string | null = null;
const listeners = new Set<Listener>();

export const BLEService = {
  getState() {
    return { connectedDeviceId };
  },
  setConnected(deviceId: string | null) {
    connectedDeviceId = deviceId;
    for (const l of listeners) l({ connectedDeviceId });
  },
  subscribe(cb: Listener) {
    listeners.add(cb);
    // return unsubscribe
    return () => listeners.delete(cb);
  }
};

export default BLEService;
