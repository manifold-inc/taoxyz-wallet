import { useState } from 'react';

import GetStarted from '@/client/components/welcome/firstTimeUser/GetStarted';
import Initial from '@/client/components/welcome/firstTimeUser/Initial';

enum Step {
  INITIAL,
  GET_STARTED,
}

const FirstTimeUser = () => {
  const [step, setStep] = useState<Step>(Step.GET_STARTED);

  const handleGetStarted = () => {
    setStep(Step.GET_STARTED);
  };

  const renderStep = () => {
    switch (step) {
      case Step.INITIAL:
        return <Initial onGetStarted={handleGetStarted} />;
      case Step.GET_STARTED:
        return <GetStarted />;
      default:
        return <Initial onGetStarted={handleGetStarted} />;
    }
  };

  return <div className="h-screen w-screen">{renderStep()}</div>;
};

export default FirstTimeUser;
