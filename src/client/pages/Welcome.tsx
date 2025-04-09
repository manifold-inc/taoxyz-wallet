import ExistingUser from '@/client/components/welcome/ExistingUser';
import FirstTimeUser from '@/client/components/welcome/FirstTimeUser';
import { useWallet } from '@/client/contexts/WalletContext';

const Welcome = () => {
  const { currentAddress } = useWallet();

  return currentAddress ? <ExistingUser /> : <FirstTimeUser />;
};

export default Welcome;
