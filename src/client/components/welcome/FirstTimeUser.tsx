import { useState } from 'react';

import Initial from '@/client/components/welcome/firstTimeUser/Initial';

enum Step {
  INITIAL,
  ADD_WALLET,
}

const FirstTimeUser = () => {
  const [step, setStep] = useState<Step>(Step.INITIAL);

  const handleGetStarted = () => {
    setStep(Step.ADD_WALLET);
  };

  const renderStep = () => {
    switch (step) {
      case Step.INITIAL:
        return <Initial onGetStarted={handleGetStarted} />;
      case Step.ADD_WALLET:
        return <div>Add Wallet</div>;
      default:
        return <Initial onGetStarted={handleGetStarted} />;
    }
  };

  return <div className="h-screen w-screen">{renderStep()}</div>;
};

export default FirstTimeUser;
