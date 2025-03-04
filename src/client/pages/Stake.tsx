import { useState, useEffect } from "react";
import { SubnetSelection } from "../components/staking/SubnetSelection";
import { ValidatorSelection } from "../components/staking/ValidatorSelection";
import { StakeConfirmation } from "../components/staking/StakeConfirmation";
import { useRpcApi } from "../contexts/RpcApiContext";
import type { Subnet, Validator } from "../../types/subnets";

enum Step {
  SELECT_SUBNET,
  SELECT_VALIDATOR,
  CONFIRM_STAKE,
}

export const Stake = () => {
  const { api } = useRpcApi();
  const [step, setStep] = useState<Step>(Step.SELECT_SUBNET);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSubnets();
  }, []);

  useEffect(() => {
    if (selectedSubnet) {
      getValidators(selectedSubnet.subnetId);
    }
  }, [selectedSubnet]);

  const getSubnets = async () => {
    try {
      const subnets = await api?.getSubnets();
      setSubnets(subnets ?? []);
    } catch (error) {
      console.error("Error loading subnets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getValidators = async (subnetId: number) => {
    try {
      setIsLoading(true);
      const validators = await api?.getValidators(subnetId);
      setValidators(validators ?? []);
    } catch (error) {
      console.error("Error loading validators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubnetSelect = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setStep(Step.SELECT_VALIDATOR);
  };

  const handleValidatorSelect = (validator: Validator) => {
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

export default Stake;
