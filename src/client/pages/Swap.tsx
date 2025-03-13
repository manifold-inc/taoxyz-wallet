import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

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
  const [isLoadingSubnets, setIsLoadingSubnets] = useState(true);
  const [isLoadingValidators, setIsLoadingValidators] = useState(false);

  useEffect(() => {
    getSubnets();
    getBalance();
  }, [api]);

  const getSubnets = async () => {
    if (!api) return;
    try {
      setIsLoadingSubnets(true);
      const subnets = await api.getSubnets();
      setSubnets(subnets ?? []);
    } catch (error) {
      console.error("Error loading subnets:", error);
    } finally {
      setIsLoadingSubnets(false);
    }
  };

  const getValidators = async (subnetId: number) => {
    try {
      setIsLoadingValidators(true);
      const validators = await api?.getValidators(subnetId);
      setValidators(validators ?? []);
    } catch (error) {
      console.error("Error loading validators:", error);
    } finally {
      setIsLoadingValidators(false);
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

  const handleSubnetSelect = async (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    await getValidators(subnet.id);
  };

  const handleValidatorSelect = (validator: Validator) => {
    setSelectedValidator(validator);
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

  const handleNext = () => {
    if (step === Step.SELECT_SUBNET && selectedSubnet) {
      setStep(Step.SELECT_VALIDATOR);
    } else if (step === Step.SELECT_VALIDATOR && selectedValidator) {
      setStep(Step.CONFIRM_SWAP);
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.SELECT_SUBNET:
        return (
          <SubnetSelection
            subnets={subnets}
            onSelect={handleSubnetSelect}
            isLoading={isLoadingSubnets}
            selectedSubnet={selectedSubnet}
          />
        );
      case Step.SELECT_VALIDATOR:
        if (!selectedSubnet) return null;
        return (
          <ValidatorSelection
            subnet={selectedSubnet}
            validators={validators}
            onSelect={handleValidatorSelect}
            isLoading={isLoadingValidators}
            selectedValidator={selectedValidator}
          />
        );
      case Step.CONFIRM_SWAP:
        if (!selectedSubnet || !selectedValidator) return null;
        return (
          <ConfirmSwap
            subnet={selectedSubnet}
            validator={selectedValidator}
            balance={balance}
            address={address}
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="h-20" />
      <div className="flex flex-col items-center flex-1">
        <div className="w-80 grid grid-cols-3 mb-8">
          <div className="flex items-center justify-start pl-4">
            <button
              onClick={handleBack}
              disabled={step === Step.SELECT_SUBNET}
              className={`transition-colors ${
                step === Step.SELECT_SUBNET
                  ? "text-mf-ash-300 cursor-not-allowed"
                  : "text-mf-silver-300 hover:text-mf-milk-300"
              }`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="flex justify-center">
            <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16" />
          </div>
          <div className="flex items-center justify-end pr-4">
            <button
              onClick={handleNext}
              disabled={
                (step === Step.SELECT_SUBNET && !selectedSubnet) ||
                (step === Step.SELECT_VALIDATOR && !selectedValidator)
              }
              className={`transition-colors ${
                (step === Step.SELECT_SUBNET && !selectedSubnet) ||
                (step === Step.SELECT_VALIDATOR && !selectedValidator)
                  ? "text-mf-ash-300 cursor-not-allowed"
                  : "text-mf-safety-300 hover:text-mf-milk-300"
              }`}
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-mf-silver-300">
              Swap Tokens
            </h1>
          </div>

          <div className="w-80">
            <div className="w-full rounded-lg bg-mf-ash-500 max-h-[calc(100vh-280px)] overflow-y-auto">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
