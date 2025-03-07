import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import StakeSelection from "../components/stake/StakeSelection";
import ConfirmStake from "../components/stake/ConfirmStake";
import ValidatorSelection from "../components/swap/ValidatorSelection";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import type { Validator, Subnet, StakeTransaction } from "../../types/client";

enum Step {
  SELECT_STAKE,
  SELECT_VALIDATOR,
  CONFIRM_STAKE,
}

const Stake = () => {
  const { api } = usePolkadotApi();
  const location = useLocation();
  const { address } = location.state || {};
  const [step, setStep] = useState<Step>(Step.SELECT_STAKE);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [stakes, setStakes] = useState<StakeTransaction[]>([]);
  const [selectedStake, setSelectedStake] = useState<StakeTransaction | null>(
    null
  );
  const [validators, setValidators] = useState<Validator[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStakes();
  }, []);

  const getStakes = async () => {
    if (!api) return;
    try {
      setIsLoading(true);
      const stakes = await api.getStake(address);
      if (stakes) {
        const formattedStakes = (stakes as any[]).map((stake) => ({
          subnetId: stake.netuid,
          validatorHotkey: stake.hotkey,
          tokens: stake.stake,
        }));
        setStakes(formattedStakes);
      }
    } catch (error) {
      console.error("[Client] Error loading stakes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubnet = async (subnetId: number) => {
    if (!api) return;
    try {
      setIsLoading(true);
      const subnet = await api.getSubnet(subnetId);
      setSelectedSubnet(subnet ?? null);
    } catch (error) {
      console.error("[Client] Error loading subnet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getValidators = async (subnetId: number, validatorHotkey: string) => {
    if (!api) return;
    try {
      setIsLoading(true);
      const validators = await api.getValidators(subnetId);
      const filteredValidators =
        validators?.filter(
          (validator) => validator.hotkey !== validatorHotkey
        ) ?? [];
      setValidators(filteredValidators);
    } catch (error) {
      console.error("[Client] Error loading validators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStakeSelect = async (stake: StakeTransaction) => {
    setSelectedStake(stake);
    await getSubnet(stake.subnetId);
    await getValidators(stake.subnetId, stake.validatorHotkey);
    setStep(Step.SELECT_VALIDATOR);
  };

  const handleValidatorSelect = (validator: Validator) => {
    setSelectedValidator(validator);
    setStep(Step.CONFIRM_STAKE);
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

  const renderStep = () => {
    switch (step) {
      case Step.SELECT_STAKE:
        return (
          <StakeSelection
            stakes={stakes}
            onSelect={handleStakeSelect}
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
          <ConfirmStake
            stake={selectedStake!}
            subnet={selectedSubnet!}
            validator={selectedValidator!}
            onBack={handleBack}
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

export default Stake;
