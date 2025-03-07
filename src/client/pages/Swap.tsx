import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import SubnetSelection from "../components/swap/SubnetSelection";
import ValidatorSelection from "../components/swap/ValidatorSelection";
import ConfirmSwap from "../components/swap/ConfirmSwap";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import type { Subnet, Validator } from "../../types/client";

enum Step {
  SELECT_SUBNET,
  SELECT_VALIDATOR,
  CONFIRM_SWAP,
}

export const Swap = () => {
  const { api } = usePolkadotApi();
  const location = useLocation();
  const { address } = location.state || {};
  const [step, setStep] = useState<Step>(Step.SELECT_SUBNET);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [balance, setBalance] = useState<string>("");
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSubnets();
    getBalance();
  }, [api]);

  useEffect(() => {
    if (selectedSubnet) {
      getValidators(selectedSubnet.id);
    }
  }, [selectedSubnet, api]);

  const getSubnets = async () => {
    if (!api) return;
    try {
      const subnets = await api.getSubnets();
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

  const getBalance = async () => {
    if (!api || !address) return;
    try {
      const balance = await api.getBalance(address);
      setBalance(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleSubnetSelect = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setStep(Step.SELECT_VALIDATOR);
  };

  const handleValidatorSelect = (validator: Validator) => {
    setSelectedValidator(validator);
    setStep(Step.CONFIRM_SWAP);
  };

  const handleBack = () => {
    if (step === Step.SELECT_VALIDATOR) {
      setStep(Step.SELECT_SUBNET);
      setSelectedSubnet(null);
    } else if (step === Step.CONFIRM_SWAP) {
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
      case Step.CONFIRM_SWAP:
        return (
          <ConfirmSwap
            subnet={selectedSubnet!}
            validator={selectedValidator!}
            onBack={handleBack}
            balance={balance}
            address={address}
          />
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="bg-white rounded-lg shadow-sm">{renderStep()}</div>
    </div>
  );
};

export default Swap;
