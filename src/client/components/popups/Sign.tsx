import taoxyz from '@public/assets/taoxyz.svg';

import { useState } from 'react';

import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';

import ConfirmAction from '@/client/components/common/ConfirmAction';
import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import KeyringService from '@/client/services/KeyringService';
import MessageService from '@/client/services/MessageService';
import { NotificationType } from '@/types/client';
import { MESSAGE_TYPES } from '@/types/messages';
import type { SignResponsePayload, StoredSignRequest } from '@/types/messages';

const Sign = () => {
  const { showNotification } = useNotification();
  const { setCurrentAddress } = useWallet();
  const [request, setRequest] = useState<StoredSignRequest | null>(null);
  const [password, setPassword] = useState('');
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const getRequest = async () => {
    try {
      const result = await chrome.storage.local.get('signRequest');
      if (!result.signRequest) throw new Error();
      setRequest(result.signRequest);
      return result.signRequest;
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Get Request',
      });
      setTimeout(() => {
        window.close();
      }, 3000);
      return null;
    }
  };

  const handleResponse = async (approved: boolean) => {
    try {
      if (!request) {
        showNotification({
          type: NotificationType.Error,
          message: 'No Request Found',
        });
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      if (approved) {
        const type = checkPayloadType(request.data);
        if (type === 'INVALID') {
          showNotification({
            type: NotificationType.Error,
            message: 'Invalid Payload Format',
          });
          setTimeout(() => {
            window.close();
          }, 3000);
          return;
        }

        const signature = await KeyringService.sign(
          request.address,
          request.data as SignerPayloadJSON,
          password
        );

        if (signature instanceof Error) {
          // Show more specific error messages based on the actual error
          let errorMessage = 'Failed to Sign Message';
          if (signature.message.includes('ExtrinsicV5') || signature.message.includes('signing support')) {
            errorMessage = 'Unsupported Transaction Format';
          } else if (signature.message.includes('Wallet is Locked')) {
            errorMessage = 'Invalid Password';
          } else if (signature.message.includes('Failed to Sign')) {
            errorMessage = 'Signing Failed';
          }
          
          showNotification({
            type: NotificationType.Error,
            message: errorMessage,
          });
          return;
        }

        // TODO: Handle raw payload
        const response: SignResponsePayload = {
          id: parseInt(request.requestId),
          signature,
          approved: true,
        };

        await chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.SIGN_RESPONSE,
          payload: response,
        });
      } else {
        const response: SignResponsePayload = {
          id: parseInt(request.requestId),
          approved: false,
        };

        await chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.SIGN_RESPONSE,
          payload: response,
        });
      }

      window.close();
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: approved ? 'Failed to Sign' : 'Failed to Reject',
      });
    }
  };

  const checkPayloadType = (data: SignerPayloadJSON | SignerPayloadRaw) => {
    if ('method' in data) {
      return 'JSON';
    } else if ('data' in data) {
      return 'RAW';
    } else {
      return 'INVALID';
    }
  };

  const handleForgetPassword = () => {
    setShowForgetPassword(true);
  };

  const renderPayload = () => {
    if (!request) return null;
    const type = checkPayloadType(request.data);

    if (type === 'JSON') {
      const payload = request.data as SignerPayloadJSON;
      return (
        <div className="flex gap-2">
          <div className="flex flex-col flex-shrink-0">
            <p className="text-mf-edge-500">Method:</p>
            <p className="text-mf-edge-500">Block Hash:</p>
            <p className="text-mf-edge-500">Genesis:</p>
            <p className="text-mf-edge-500">Era:</p>
            <p className="text-mf-edge-500">Nonce:</p>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-mf-sybil-500 truncate">{payload.method}</p>
            <p className="text-mf-sybil-500 truncate">{payload.blockHash}</p>
            <p className="text-mf-sybil-500 truncate">{payload.genesisHash}</p>
            <p className="text-mf-sybil-500 truncate">{payload.era}</p>
            <p className="text-mf-sybil-500 truncate">{payload.nonce}</p>
          </div>
        </div>
      );
    }

    if (type === 'RAW') {
      const payload = request.data as SignerPayloadRaw;
      return (
        <div className="flex gap-2">
          <div className="flex flex-col">
            <p className="text-mf-edge-500">Data:</p>
            <p className="text-mf-edge-500">Type:</p>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-mf-sybil-500 truncate">{payload.data}</p>
            <p className="text-mf-sybil-500 truncate">Raw Signature</p>
          </div>
        </div>
      );
    }

    return null;
  };

  const init = async () => {
    if (isInitialized) return;
    setIsInitialized(true);
    const request = await getRequest();
    if (!request) return;
  };

  if (!isInitialized) {
    void init();
  }

  return (
    <>
      <ConfirmAction
        isOpen={showForgetPassword}
        title="Remove Wallet"
        message="Are you sure you want to continue? This will remove your wallet and require you to re-import your wallet."
        onConfirm={async () => {
          setShowForgetPassword(false);
          KeyringService.deleteWallet(request?.address as string);
          const wallets = await KeyringService.getWallets();
          if (wallets.length === 0) {
            await setCurrentAddress(null);
          } else {
            await setCurrentAddress(wallets[0].address);
            await MessageService.sendWalletsLocked();
            await KeyringService.lockWallets();
          }

          window.close();
        }}
        onCancel={() => setShowForgetPassword(false)}
      />
      <div className="w-full h-full flex flex-col items-center">
        <div className="max-w-88 p-5 flex flex-col items-center gap-6">
          {/* Header */}
          <div className="flex justify-center items-center gap-2 w-full">
            <img src={taoxyz} alt="Taoxyz Logo" className="w-6 h-6" />
            <p className="text-mf-edge-500 text-2xl font-semibold blinker-font mb-0.5">
              SIGN REQUEST
            </p>
          </div>

          {/* Origin */}
          <div className="bg-mf-ash-500 rounded-md text-sm flex w-full gap-3 p-2">
            <div className="flex flex-col">
              <p className="text-mf-edge-500">Origin:</p>
              <p className="text-mf-edge-500">Address:</p>
            </div>
            <div className="flex flex-col">
              <p className="text-mf-sybil-500 truncate">{request?.origin}</p>
              <p className="text-mf-sybil-500">
                {request?.address.slice(0, 6)}...{request?.address.slice(-6)}
              </p>
            </div>
          </div>

          {/* Payload */}
          <div className="w-full bg-mf-ash-500 rounded-md p-2">{renderPayload()}</div>

          {/* Buttons */}
          <form
            onSubmit={e => {
              e.preventDefault();
              if (password) {
                handleResponse(true);
              }
            }}
            className="w-full flex flex-col gap-3"
          >
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Password to Sign"
              className="p-2 text-sm bg-mf-ash-500 border border-mf-ash-500 rounded-md focus:outline-none focus:border-mf-sybil-500 text-mf-edge-500 placeholder:text-mf-edge-700"
            />

            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => handleResponse(false)}
                className="w-1/2 text-sm rounded-md cursor-pointer px-3 py-1.5 bg-mf-safety-opacity text-mf-safety-500 hover:opacity-50"
              >
                Reject
              </button>
              <button
                type="submit"
                disabled={!password}
                className={`w-1/2 text-sm rounded-md px-3 py-1.5 hover:opacity-50 ${
                  !password
                    ? 'bg-mf-ash-500 text-mf-edge-700 cursor-not-allowed'
                    : 'bg-mf-sybil-opacity text-mf-sybil-500 cursor-pointer'
                }`}
              >
                Sign
              </button>
            </div>

            <div className="flex justify-center">
              <button type="button" onClick={handleForgetPassword}>
                <span className="text-xs text-mf-safety-500 hover:text-mf-safety-300 underline underline-offset-2 decoration-mf-safety-500 hover:decoration-mf-safety-300 cursor-pointer">
                  Forgot Password?
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Sign;
