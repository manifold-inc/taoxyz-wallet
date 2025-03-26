import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { useNotification } from "../contexts/NotificationContext";
import { useWallet } from "../contexts/WalletContext";
import StakeSelection from "../components/moveStake/StakeSelection";
import ValidatorSelection from "../components/addStake/ValidatorSelection";
import ConfirmMoveStake from "../components/moveStake/ConfirmMoveStake";
import type { Validator, Subnet, StakeTransaction } from "../../types/client";
import { NotificationType } from "../../types/client";

enum Step {
  SELECT_STAKE,
  SELECT_VALIDATOR,
  CONFIRM_MOVE_STAKE,
}

const getStepSubtext = (step: Step) => {
  switch (step) {
    case Step.SELECT_STAKE:
      return "Select Stake";
    case Step.SELECT_VALIDATOR:
      return "Select Validator";
    case Step.CONFIRM_MOVE_STAKE:
      return "Review and Confirm Stake";
    default:
      return "";
  }
};

const getStepTitle = (step: Step) => {
  switch (step) {
    case Step.SELECT_STAKE:
      return "Move Stake";
    case Step.SELECT_VALIDATOR:
      return "Move Stake";
    case Step.CONFIRM_MOVE_STAKE:
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

const MoveStake = () => {
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const { currentAddress } = useWallet();
  const location = useLocation();
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
  const [isLoadingSubnet, setIsLoadingSubnet] = useState(true);
  const [isLoadingValidators, setIsLoadingValidators] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const restoreMoveStake = async () => {
    const result = await chrome.storage.local.get("storeMoveStakeTransaction");
    if (result.storeMoveStakeTransaction) {
      const { subnet, validator, stake } = result.storeMoveStakeTransaction;
      setSelectedSubnet(subnet);
      setSelectedValidator(validator);
      setSelectedStake(stake);
      setStep(Step.CONFIRM_MOVE_STAKE);
    }
  };

  const getBalance = (stake: StakeTransaction): string | null => {
    if (!stake) return null;
    const balance = stake.tokens / 1e9;
    return balance.toFixed(4);
  };

  const getStakes = async (address: string) => {
    if (!api) return;
    setIsLoadingStakes(true);
    try {
      const stakes = await api.getStake(address);
      if (stakes) {
        const formattedStakes = await Promise.all(
          (stakes as unknown as StakeResponse[]).map(async (stake) => {
            const subnet = await api.getSubnet(stake.netuid);
            return {
              subnetId: stake.netuid,
              subnetName: subnet?.name ?? `Subnet ${stake.netuid}`,
              validatorHotkey: stake.hotkey,
              tokens: stake.stake,
            };
          })
        );
        setStakes(formattedStakes);
      }
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Load Stakes",
      });
    } finally {
      setIsLoadingStakes(false);
    }
  };

  const getSubnet = async (subnetId: number) => {
    if (!api) return;
    setIsLoadingSubnet(true);
    try {
      const subnet = await api.getSubnet(subnetId);
      setSelectedSubnet(subnet ?? null);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Load Subnet",
      });
    } finally {
      setIsLoadingSubnet(false);
    }
  };

  const getValidators = async (subnetId: number, validatorHotkey: string) => {
    if (!api) return;
    setIsLoadingValidators(true);
    try {
      const validators = await api.getValidators(subnetId);
      const filteredValidators =
        validators?.filter(
          (validator) => validator.hotkey !== validatorHotkey
        ) ?? [];
      setValidators(filteredValidators);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Load Validators",
      });
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
    } else if (step === Step.CONFIRM_MOVE_STAKE) {
      setStep(Step.SELECT_VALIDATOR);
      setSelectedValidator(null);
    }
  };

  const handleNext = () => {
    if (step === Step.SELECT_STAKE && selectedStake) {
      setStep(Step.SELECT_VALIDATOR);
    } else if (step === Step.SELECT_VALIDATOR && selectedValidator) {
      setStep(Step.CONFIRM_MOVE_STAKE);
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.SELECT_STAKE:
        return (
          <StakeSelection
            stakes={stakes}
            selectedStake={selectedStake}
            validators={validators}
            isLoading={isLoadingStakes}
            isLoadingSubnet={isLoadingSubnet}
            isLoadingValidators={isLoadingValidators}
            onSelect={handleStakeSelect}
          />
        );
      case Step.SELECT_VALIDATOR:
        if (!selectedSubnet) return null;
        return (
          <ValidatorSelection
            subnet={selectedSubnet}
            validators={validators}
            selectedValidator={selectedValidator}
            isLoading={isLoadingValidators}
            onSelect={handleValidatorSelect}
          />
        );
      case Step.CONFIRM_MOVE_STAKE:
        if (!selectedStake || !selectedSubnet || !selectedValidator)
          return null;
        return (
          <ConfirmMoveStake
            stake={selectedStake}
            subnet={selectedSubnet}
            validator={selectedValidator}
            address={currentAddress as string}
            balance={getBalance(selectedStake) as string}
          />
        );
    }
  };

  const init = async () => {
    if (isInitialized) return;
    if (!api || !currentAddress) return;
    setIsInitialized(true);
    await restoreMoveStake();
    await getStakes(currentAddress);
    if (location.state?.selectedStake) {
      const stake = location.state.selectedStake;
      await getValidators(stake.subnetId, stake.validatorHotkey);
    }
  };

  if (!isInitialized) {
    void init();
  }

  return (
    <div className="flex flex-col items-center w-76 [&>*]:w-full">
      <div className="grid grid-cols-3 mt-12">
        <div className="flex items-center justify-start">
          <button
            onClick={handleBack}
            disabled={step === Step.SELECT_STAKE}
            className={`transition-colors cursor-pointer ${
              step === Step.SELECT_STAKE
                ? "text-mf-ash-300 cursor-not-allowed"
                : "text-mf-milk-300"
            }`}
          >
            <ArrowLeftToLine className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center justify-center">
          <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16" />
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={handleNext}
            disabled={
              (step === Step.SELECT_STAKE &&
                (!selectedStake || validators.length === 0)) ||
              (step === Step.SELECT_VALIDATOR && !selectedValidator) ||
              step === Step.CONFIRM_MOVE_STAKE
            }
            className={`transition-colors cursor-pointer ${
              (step === Step.SELECT_STAKE &&
                (!selectedStake || validators.length === 0)) ||
              (step === Step.SELECT_VALIDATOR && !selectedValidator) ||
              step === Step.CONFIRM_MOVE_STAKE
                ? "text-mf-ash-300 cursor-not-allowed"
                : "text-mf-milk-300"
            }`}
          >
            <ArrowRightToLine className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="text-center">
          <h1 className="text-lg text-mf-milk-300">{getStepTitle(step)}</h1>
          <p className="text-xs text-mf-sybil-500 mt-1">
            {getStepSubtext(step)}
          </p>
        </div>

        <div className="rounded-sm max-h-[calc(100vh-310px)] overflow-y-auto mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default MoveStake;
