import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

import StakeSelection from "../components/stake/StakeSelection";
import ValidatorSelection from "../components/swap/ValidatorSelection";
import ConfirmStake from "../components/stake/ConfirmStake";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import type { Validator, Subnet, StakeTransaction } from "../../types/client";

enum Step {
  SELECT_STAKE,
  SELECT_VALIDATOR,
  CONFIRM_STAKE,
}

interface StakeResponse {
  netuid: number;
  hotkey: string;
  stake: number;
}

const Stake = () => {
  const { api } = usePolkadotApi();
  const location = useLocation();
  const { address } = location.state || {};
  const [step, setStep] = useState<Step>(Step.SELECT_STAKE);
  const [stakes, setStakes] = useState<StakeTransaction[]>([]);
  const [selectedStake, setSelectedStake] = useState<StakeTransaction | null>(
    null
  );
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [isLoadingStakes, setIsLoadingStakes] = useState(true);

  useEffect(() => {
    getStakes();
  }, [api]);

  const getStakes = async () => {
    if (!api) return;
    try {
      setIsLoadingStakes(true);
      const stakes = await api.getStake(address);
      if (stakes) {
        const formattedStakes = (stakes as unknown as StakeResponse[]).map(
          (stake) => ({
            subnetId: stake.netuid,
            validatorHotkey: stake.hotkey,
            tokens: stake.stake,
          })
        );
        setStakes(formattedStakes);
      }
    } catch (error) {
      console.error("[Client] Error loading stakes:", error);
    } finally {
      setIsLoadingStakes(false);
    }
  };

  const getSubnet = async (subnetId: number) => {
    if (!api) return;
    try {
      const subnet = await api.getSubnet(subnetId);
      setSelectedSubnet(subnet ?? null);
    } catch (error) {
      console.error("[Client] Error loading subnet:", error);
    }
  };

  const getValidators = async (subnetId: number, validatorHotkey: string) => {
    try {
      const validators = await api?.getValidators(subnetId);
      const filteredValidators =
        validators?.filter(
          (validator) => validator.hotkey !== validatorHotkey
        ) ?? [];
      setValidators(filteredValidators);
    } catch (error) {
      console.error("[Client] Error loading validators:", error);
    }
  };

  const handleStakeSelect = async (stake: StakeTransaction) => {
    setSelectedStake(stake);
    await getSubnet(stake.subnetId);
    await getValidators(stake.subnetId, stake.validatorHotkey);
  };

  const handleValidatorSelect = (validator: Validator) => {
    setSelectedValidator(validator);
  };

  const handleBack = () => {
    if (step === Step.SELECT_VALIDATOR) {
      setStep(Step.SELECT_STAKE);
      setSelectedStake(null);
      setSelectedSubnet(null);
    } else if (step === Step.CONFIRM_STAKE) {
      setStep(Step.SELECT_VALIDATOR);
      setSelectedValidator(null);
    }
  };

  const handleNext = () => {
    if (step === Step.SELECT_STAKE && selectedStake) {
      setStep(Step.SELECT_VALIDATOR);
    } else if (step === Step.SELECT_VALIDATOR && selectedValidator) {
      setStep(Step.CONFIRM_STAKE);
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.SELECT_STAKE:
        return (
          <StakeSelection
            stakes={stakes}
            onSelect={handleStakeSelect}
            isLoading={isLoadingStakes}
            selectedStake={selectedStake}
          />
        );
      case Step.SELECT_VALIDATOR:
        if (!selectedSubnet) return null;
        return (
          <ValidatorSelection
            subnet={selectedSubnet}
            validators={validators}
            onSelect={handleValidatorSelect}
            selectedValidator={selectedValidator}
          />
        );
      case Step.CONFIRM_STAKE:
        if (!selectedStake || !selectedSubnet || !selectedValidator)
          return null;
        return (
          <ConfirmStake
            stake={selectedStake}
            subnet={selectedSubnet}
            validator={selectedValidator}
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
              disabled={step === Step.SELECT_STAKE}
              className={`transition-colors ${
                step === Step.SELECT_STAKE
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
                (step === Step.SELECT_STAKE && !selectedStake) ||
                (step === Step.SELECT_VALIDATOR && !selectedValidator)
              }
              className={`transition-colors ${
                (step === Step.SELECT_STAKE && !selectedStake) ||
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
              Add Stake
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

export default Stake;
