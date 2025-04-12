import { useState } from 'react';

import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';

import taoxyz from '../../../../public/assets/taoxyz.svg';
import { NotificationType } from '../../../types/client';
import { MESSAGE_TYPES } from '../../../types/messages';
import type { SignResponsePayload, StoredSignRequest } from '../../../types/messages';
import { useNotification } from '../../contexts/NotificationContext';
import { useWallet } from '../../contexts/WalletContext';
import KeyringService from '../../services/KeyringService';
import MessageService from '../../services/MessageService';
import ConfirmAction from '../common/ConfirmAction';

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
          if (signature.message === 'Wallet is Locked') {
            showNotification({
              type: NotificationType.Error,
              message: 'Invalid Password',
            });
            return;
          }
          showNotification({
            type: NotificationType.Error,
            message: signature.message,
          });
          setTimeout(() => {
            window.close();
          }, 3000);
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
        <div className="flex">
          <div className="flex flex-col flex-shrink-0">
            <p className="text-mf-milk-300">Method:</p>
            <p className="text-mf-milk-300">Block Hash:</p>
            <p className="text-mf-milk-300">Genesis:</p>
            <p className="text-mf-milk-300">Era:</p>
            <p className="text-mf-milk-300">Nonce:</p>
          </div>
          <div className="flex flex-col min-w-0 flex-1 ml-2">
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
        <div className="flex space-x-2">
          <div className="flex flex-col">
            <p className="text-mf-milk-300">Data:</p>
            <p className="text-mf-milk-300">Type:</p>
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
        title="Reset Password"
        message="Are you sure you want to reset your password? This will require you to re-import your wallet."
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
      <div className="flex flex-col items-center h-full">
        <div className="flex flex-col justify-center items-center space-y-2">
          <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mt-12" />
          <h1 className="text-lg text-mf-milk-300">Sign Request</h1>
        </div>

        <div className="mt-6 bg-mf-ash-500 border-sm border-2 border-mf-sybil-500 p-3 text-sm flex space-x-2 w-80">
          <div className="flex flex-col">
            <p className="text-mf-milk-300">Origin</p>
            <p className="text-mf-milk-300">Address</p>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-mf-sybil-500 truncate">{request?.origin}</p>
            <p className="text-mf-sybil-500">
              {request?.address.slice(0, 6)}...{request?.address.slice(-6)}
            </p>
          </div>
        </div>

        <div className="mt-4 w-80 [&>*]:w-full bg-mf-ash-500 border-sm border-2 border-mf-ash-500 p-2">
          {renderPayload()}
        </div>

        <div className="mt-4 w-80 [&>*]:w-full space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter Password to Sign"
            className="p-2 text-sm bg-mf-ash-500 border-2 border-mf-ash-500 border-sm focus:outline-none focus:border-mf-sybil-500 text-mf-edge-500 placeholder-mf-edge-500"
          />

          <div className="flex space-x-2">
            <button
              onClick={() => handleResponse(false)}
              className="flex-1 text-sm border-2 border-sm border-mf-safety-500 bg-mf-ash-500 hover:bg-mf-safety-500 hover:text-mf-night-500 p-2 text-mf-safety-500 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => handleResponse(true)}
              disabled={!password}
              className={`flex-1 text-sm border-2 border-sm border-mf-sybil-500 ${
                !password
                  ? 'bg-mf-ash-500 text-mf-edge-500 cursor-not-allowed'
                  : 'bg-mf-sybil-500 hover:bg-mf-night-500 hover:text-mf-sybil-500 text-mf-night-500'
              } p-2 transition-colors`}
            >
              Sign
            </button>
          </div>

          <div className="flex justify-center">
            <button onClick={handleForgetPassword}>
              <span className="text-xs text-mf-safety-500 hover:text-mf-safety-300 transition-colors underline underline-offset-2 decoration-mf-safety-500 hover:decoration-mf-safety-300 cursor-pointer">
                Forget Password
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sign;
