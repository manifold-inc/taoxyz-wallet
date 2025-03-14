import KeyringService from "../client/services/KeyringService";
import MessageService from "../client/services/MessageService";

const LOCK_TIMEOUT_MS = 15 * 60 * 1000;
let lockLockId: number | null = null;

const LockManager = {
  startLockTimer() {
    if (lockLockId) {
      window.clearTimeout(lockLockId);
    }

    lockLockId = window.setTimeout(() => {
      this.lockAccounts("timeout");
    }, LOCK_TIMEOUT_MS);
  },

  lockAccounts(event: "manual" | "timeout") {
    console.log(`[LockManager] Locking accounts due to ${event}`);
    KeyringService.lockAll();

    if (event === "manual") {
      window.clearTimeout(lockLockId as number);
      lockLockId = null;
    }

    MessageService.sendAccountsLockedMessage(event);
  },
};

export default LockManager;
