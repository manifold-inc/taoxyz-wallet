import { useState, useEffect } from "react";
import type { SubnetInfo, ValidatorInfo } from "../../types/subnets";
import { SubnetSelection } from "../components/staking/SubnetSelection";
import { ValidatorSelection } from "../components/staking/ValidatorSelection";
import { StakeConfirmation } from "../components/staking/StakeConfirmation";

enum Step {
  SELECT_SUBNET,
  SELECT_VALIDATOR,
  CONFIRM_STAKE,
}

export const StakingPage = () => {
  const [step, setStep] = useState<Step>(Step.SELECT_SUBNET);
  const [subnets, setSubnets] = useState<SubnetInfo[]>([]);
  const [selectedSubnet, setSelectedSubnet] = useState<SubnetInfo | null>(null);
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [selectedValidator, setSelectedValidator] =
    useState<ValidatorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSubnets();
  }, []);

  useEffect(() => {
    if (selectedSubnet) {
      getValidators(selectedSubnet.netuid);
    }
  }, [selectedSubnet]);

  const getSubnets = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "ext(getSubnets)",
      });
      if (response.success) {
        setSubnets(response.data);
      } else {
        console.error("Failed to load subnets:", response.error);
      }
    } catch (error) {
      console.error("Error loading subnets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getValidators = async (subnetId: number) => {
    try {
      setIsLoading(true);
      const response = await chrome.runtime.sendMessage({
        type: "ext(getValidators)",
        payload: { subnetId },
      });
      if (response.success) {
        setValidators(response.data);
      } else {
        console.error("Failed to load validators:", response.error);
      }
    } catch (error) {
      console.error("Error loading validators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubnetSelect = (subnet: SubnetInfo) => {
    setSelectedSubnet(subnet);
    setStep(Step.SELECT_VALIDATOR);
  };

  const handleValidatorSelect = (validator: ValidatorInfo) => {
    setSelectedValidator(validator);
    setStep(Step.CONFIRM_STAKE);
  };

  const handleBack = () => {
    if (step === Step.SELECT_VALIDATOR) {
      setStep(Step.SELECT_SUBNET);
      setSelectedSubnet(null);
    } else if (step === Step.CONFIRM_STAKE) {
      setStep(Step.SELECT_VALIDATOR);
      setSelectedValidator(null);
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.SELECT_SUBNET:
        return (
          <SubnetSelection
            subnets={subnets}
            onSelect={handleSubnetSelect}
            isLoading={isLoading}
          />
        );
      case Step.SELECT_VALIDATOR:
        return (
          <ValidatorSelection
            subnet={selectedSubnet!}
            validators={validators}
            onSelect={handleValidatorSelect}
            onBack={handleBack}
            isLoading={isLoading}
          />
        );
      case Step.CONFIRM_STAKE:
        return (
          <StakeConfirmation
            subnet={selectedSubnet!}
            validator={selectedValidator!}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Stake TAO</h1>
      {renderStep()}
    </div>
  );
};

export default StakingPage;
