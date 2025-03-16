import { useState, useEffect, useCallback } from "react";
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

const getStepSubtext = (step: Step) => {
  switch (step) {
    case Step.SELECT_STAKE:
      return "Select a stake";
    case Step.SELECT_VALIDATOR:
      return "Select a validator";
    case Step.CONFIRM_STAKE:
      return "Review and confirm stake";
    default:
      return "";
  }
};

const getStepTitle = (step: Step) => {
  switch (step) {
    case Step.SELECT_STAKE:
      return "Add Stake";
    case Step.SELECT_VALIDATOR:
      return "Add Stake";
    case Step.CONFIRM_STAKE:
      return "Confirm Stake";
    default:
      return "";
  }
};

interface StakeResponse {
  netuid: number;
  hotkey: string;
  stake: number;
}

const Stake = () => {
  const { api } = usePolkadotApi();
  const location = useLocation();
  const [address, setAddress] = useState("");

  const [step, setStep] = useState<Step>(
    location.state?.selectedStake ? Step.SELECT_VALIDATOR : Step.SELECT_STAKE
  );
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(
    location.state?.selectedSubnet || null
  );
  const [stakes, setStakes] = useState<StakeTransaction[]>([]);
  const [selectedStake, setSelectedStake] = useState<StakeTransaction | null>(
    location.state?.selectedStake || null
  );
  const [validators, setValidators] = useState<Validator[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [isLoadingStakes, setIsLoadingStakes] = useState(true);
  const [isLoadingSubnet, setIsLoadingSubnet] = useState(false);
  const [isLoadingValidators, setIsLoadingValidators] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!api) return;

      try {
        const result = await chrome.storage.local.get("currentAddress");
        const currentAddress = result.currentAddress as string;
        setAddress(currentAddress);

        if (currentAddress) {
          await getStakes(currentAddress);
          if (location.state?.selectedStake) {
            const stake = location.state.selectedStake;
            await getValidators(stake.subnetId, stake.validatorHotkey);
          }
        }
      } catch (error) {
        console.error("[Stake] Error initializing:", error);
      }
    };

    init();
  }, [api]);

  useEffect(() => {
    const initStake = async () => {
      const result = await chrome.storage.local.get("storeStakeTransaction");
      if (result.storeStakeTransaction) {
        const { subnet, validator, stake } = result.storeStakeTransaction;
        setStep(Step.CONFIRM_STAKE);
        setSelectedSubnet(subnet);
        setSelectedValidator(validator);
        setSelectedStake(stake);
      }
    };
    initStake();
  }, []);

  const getStakes = async (address: string) => {
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
      setIsLoadingSubnet(true);
      const subnet = await api.getSubnet(subnetId);
      setSelectedSubnet(subnet ?? null);
    } catch (error) {
      console.error("[Client] Error loading subnet:", error);
    } finally {
      setIsLoadingSubnet(false);
    }
  };

  const getValidators = async (subnetId: number, validatorHotkey: string) => {
    try {
      setIsLoadingValidators(true);
      setValidators([]);
      const validators = await api?.getValidators(subnetId);
      const filteredValidators =
        validators?.filter(
          (validator) => validator.hotkey !== validatorHotkey
        ) ?? [];
      setValidators(filteredValidators);
    } catch (error) {
      console.error("[Client] Error loading validators:", error);
    } finally {
      setIsLoadingValidators(false);
    }
  };

  const handleStakeSelect = useCallback(
    async (stake: StakeTransaction) => {
      if (
        selectedStake?.subnetId === stake.subnetId &&
        selectedStake?.validatorHotkey === stake.validatorHotkey
      ) {
        setSelectedStake(null);
        setValidators([]);
        return;
      }
      setSelectedStake(stake);
      await getSubnet(stake.subnetId);
      await getValidators(stake.subnetId, stake.validatorHotkey);
    },
    [selectedStake, api]
  );

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
            validators={validators}
            isLoadingValidators={isLoadingValidators}
            isLoadingSubnet={isLoadingSubnet}
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
                (step === Step.SELECT_STAKE &&
                  (!selectedStake || validators.length === 0)) ||
                (step === Step.SELECT_VALIDATOR && !selectedValidator) ||
                step === Step.CONFIRM_STAKE
              }
              className={`transition-colors ${
                (step === Step.SELECT_STAKE &&
                  (!selectedStake || validators.length === 0)) ||
                (step === Step.SELECT_VALIDATOR && !selectedValidator) ||
                step === Step.CONFIRM_STAKE
                  ? "text-mf-ash-300 cursor-not-allowed"
                  : "text-mf-safety-300 hover:text-mf-milk-300"
              }`}
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <h1 className="text-lg font-semibold text-mf-silver-300">
              {getStepTitle(step)}
            </h1>
            <p className="text-xs text-mf-silver-300 mt-1">
              {getStepSubtext(step)}
            </p>
          </div>

          <div className="w-80">
            <div className="w-full rounded-lg bg-mf-ash-500 max-h-[calc(100vh-310px)] overflow-y-auto">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stake;
