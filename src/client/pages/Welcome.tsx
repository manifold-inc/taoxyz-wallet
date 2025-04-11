import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import GetStarted from '@/client/components/welcome/GetStarted';
import Initial from '@/client/components/welcome/Initial';

enum Step {
  INITIAL = 'INITIAL',
  GET_STARTED = 'GET_STARTED',
}

const Welcome = () => {
  const location = useLocation();
  const [step, setStep] = useState<Step>(location.state.step || Step.INITIAL);

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

export default Welcome;
