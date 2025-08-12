import type { KeyringPair, KeyringPair$Meta } from '@polkadot/keyring/types';
import { TypeRegistry } from '@polkadot/types';
import type { SignerPayloadJSON } from '@polkadot/types/types';
import keyring from '@polkadot/ui-keyring';
import { mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';

import type { Permissions } from '../../types/client';

const registry = new TypeRegistry();

export const KeyringService = {
  // Check if keyring is ready
  isKeyringReady(): boolean {
    return keyring.getPairs().length >= 0; // Simple check if keyring is accessible
  },

  async checkDuplicate(mnemonic: string): Promise<boolean | Error> {
    try {
      const wallets = this.getWallets();
      const address = keyring.createFromUri(mnemonic).address;
      const isDuplicate = wallets.some(wallet => wallet.address === address);
      return isDuplicate;
    } catch {
      return new Error('Failed to Verify Wallet');
    }
  },

  async addWallet(mnemonic: string, name: string, password: string): Promise<KeyringPair | Error> {
    try {
      console.log('[KeyringService] Adding wallet with name:', name);
      console.log('[KeyringService] Existing wallets count:', keyring.getPairs().length);
      
      const result = await keyring.addUri(mnemonic, password, {
        name,
        websitePermissions: {} as Permissions,
      } as KeyringPair$Meta);
      
      if (!result.pair) return new Error('Failed to Add Wallet');
      
      console.log('[KeyringService] Wallet added successfully:', result.pair.address);
      console.log('[KeyringService] Total wallets after addition:', keyring.getPairs().length);
      
      return result.pair;
    } catch (error) {
      console.error('[KeyringService] Failed to add wallet:', error);
      return new Error('Failed to Add Wallet');
    }
  },

  unlockWallet(address: string, password: string): boolean {
    const wallet = this.getWallet(address);
    if (wallet instanceof Error) {
      console.error('[KeyringService] Wallet not found:', address);
      return false;
    }

    try {
      console.log('[KeyringService] Attempting to unlock wallet:', address);
      wallet.unlock(password);
      
      if (wallet.isLocked) {
        console.log('[KeyringService] Wallet still locked after unlock attempt');
        return false;
      }
      
      console.log('[KeyringService] Wallet unlocked successfully');
      return true;
    } catch (error) {
      console.error('[KeyringService] Unlock failed with error:', error);
      return false;
    }
  },

  createMnemonic(): string {
    return mnemonicGenerate(12);
  },

  validateMnemonic(mnemonic: string): boolean {
    return mnemonicValidate(mnemonic);
  },

  async getAddress(name: string): Promise<string | Error> {
    const wallets = this.getWallets();
    if (!wallets) return new Error('Keyring not initialized');
    const wallet = wallets.find(wallet => wallet.meta.name === name);
    if (!wallet) return new Error('Wallet not found');

    return wallet.address;
  },

  getWallet(address: string): KeyringPair | Error {
    console.log('[KeyringService] Getting wallet for address:', address);
    console.log('[KeyringService] Total wallets available:', keyring.getPairs().length);
    
    const wallet = keyring.getPair(address);
    if (!wallet) {
      console.error('[KeyringService] Wallet not found in keyring for address:', address);
      console.log('[KeyringService] Available wallet addresses:', keyring.getPairs().map(w => w.address));
      return new Error('Wallet not found');
    }
    
    console.log('[KeyringService] Wallet found:', wallet.address, 'Locked:', wallet.isLocked);
    return wallet;
  },

  getWallets(): KeyringPair[] {
    return keyring.getPairs();
  },

  deleteWallet(address: string): boolean {
    try {
      keyring.forgetAccount(address);
      return true;
    } catch {
      return false;
    }
  },

  async sign(
    address: string,
    payload: SignerPayloadJSON,
    password: string
  ): Promise<`0x${string}` | Error> {
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) return new Error(wallet.message);
    try {
      this.unlockWallet(address, password);
      if (wallet.isLocked) return new Error('Wallet is Locked');

      registry.setSignedExtensions(payload.signedExtensions);
      const extrinsicPayload = registry.createType('ExtrinsicPayload', payload, {
        version: payload.version,
      });

      const { signature } = extrinsicPayload.sign(wallet);
      return signature;
    } catch {
      return new Error('Failed to Sign Transaction');
    }
  },

  async getPermissions(address: string): Promise<Permissions | Error> {
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) return new Error(wallet.message);
    return (wallet.meta.websitePermissions as Permissions) || {};
  },

  async updatePermissions(
    origin: string,
    address: string,
    allowAccess: boolean,
    removeWebsite = false
  ): Promise<boolean | Error> {
    const wallet = await this.getWallet(address);
    if (wallet instanceof Error) return new Error(wallet.message);

    try {
      const meta = { ...wallet.meta };
      const permissions = (meta.websitePermissions as Permissions) || {};

      if (removeWebsite) {
        // eslint-disable-next-line
        delete permissions[origin];
      } else {
        permissions[origin] = allowAccess;
      }

      meta.websitePermissions = permissions;
      keyring.saveAccountMeta(wallet, meta);
      await chrome.storage.local.set({
        [`permissions_${wallet.address}`]: { permissions },
      });

      return true;
    } catch {
      return new Error('Failed to Update Permissions');
    }
  },

  lockWallets(): boolean | Error {
    const pairs = keyring.getPairs();
    if (!pairs) return new Error('Keyring not initialized');
    try {
      pairs.forEach(pair => {
        if (!pair.isLocked) {
          pair.lock();
        }
      });
      return true;
    } catch {
      return new Error('Failed to Lock All Wallets');
    }
  },

  isLocked(address: string): boolean | Error {
    const wallet = this.getWallet(address);
    if (wallet instanceof Error) return new Error(wallet.message);
    return wallet.isLocked;
  },

  // Debug method to test unlock functionality
  debugWallet(address: string): void {
    console.log('=== WALLET DEBUG INFO ===');
    console.log('Total wallets:', keyring.getPairs().length);
    
    const wallet = this.getWallet(address);
    if (wallet instanceof Error) {
      console.error('Wallet error:', wallet.message);
      return;
    }
    
    console.log('Wallet found:', {
      address: wallet.address,
      isLocked: wallet.isLocked,
      meta: wallet.meta,
      type: wallet.type
    });
    
    // Try to get the encrypted data
    try {
      const encrypted = keyring.getAccount(address);
      console.log('Encrypted account data:', encrypted);
    } catch (error) {
      console.error('Failed to get encrypted data:', error);
    }
    
    console.log('=== END DEBUG INFO ===');
  },

  // Test unlock method with detailed feedback
  testUnlock(address: string, password: string): { success: boolean; details: string[] } {
    const details: string[] = [];
    details.push(`Testing unlock for wallet: ${address}`);
    
    // Password analysis
    details.push(`🔑 Password analysis:`);
    details.push(`   Length: ${password.length}`);
    details.push(`   Contains spaces: ${password.includes(' ')}`);
    details.push(`   Contains special chars: ${/[!@#$%^&*(),.?":{}|<>]/.test(password)}`);
    details.push(`   Contains unicode: ${/[^\x00-\x7F]/.test(password)}`);
    details.push(`   Password bytes: ${Array.from(password).map(c => c.charCodeAt(0))}`);
    
    const wallet = this.getWallet(address);
    if (wallet instanceof Error) {
      details.push(`❌ Wallet not found: ${wallet.message}`);
      return { success: false, details };
    }
    details.push(`✅ Wallet found: ${wallet.address}`);
    details.push(`📊 Wallet locked: ${wallet.isLocked}`);
    
    try {
      details.push(`🔓 Attempting unlock with password length: ${password.length}`);
      wallet.unlock(password);
      details.push(`🔓 Unlock call completed`);
      
      if (wallet.isLocked) {
        details.push(`❌ Wallet still locked after unlock`);
        return { success: false, details };
      }
      
      details.push(`✅ Wallet unlocked successfully`);
      return { success: true, details };
    } catch (error) {
      details.push(`❌ Unlock failed with error: ${error}`);
      return { success: false, details };
    }
  },
};

export default KeyringService;
