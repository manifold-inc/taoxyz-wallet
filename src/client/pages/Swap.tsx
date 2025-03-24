import { useState, useCallback } from "react";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { useNotification } from "../contexts/NotificationContext";
import { useWallet } from "../contexts/WalletContext";
import SubnetSelection from "../components/swap/SubnetSelection";
import ValidatorSelection from "../components/swap/ValidatorSelection";
import ConfirmSwap from "../components/swap/ConfirmSwap";
import { NotificationType } from "../../types/client";
import type { Subnet, Validator } from "../../types/client";

enum Step {
  SELECT_SUBNET,
  SELECT_VALIDATOR,
  CONFIRM_SWAP,
}

const getStepSubtext = (step: Step) => {
  switch (step) {
    case Step.SELECT_SUBNET:
      return "Select Subnet";
    case Step.SELECT_VALIDATOR:
      return "Select Validator";
    case Step.CONFIRM_SWAP:
      return "Confirm Swap";
    default:
      return "";
  }
};

const getStepTitle = (step: Step) => {
  switch (step) {
    case Step.SELECT_SUBNET:
      return "Swap Tokens";
    case Step.SELECT_VALIDATOR:
      return "Swap Tokens";
    case Step.CONFIRM_SWAP:
      return "Confirm Swap";
    default:
      return "";
  }
};

export const Swap = () => {
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const { currentAddress } = useWallet();
  const [step, setStep] = useState<Step>(Step.SELECT_SUBNET);
  const [subnets, setSubnets] = useState<Subnet[] | null>(null);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [balance, setBalance] = useState<string | null>(null);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [isLoadingSubnets, setIsLoadingSubnets] = useState(true);
  const [isLoadingValidators, setIsLoadingValidators] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // TODO: Handle edge case if user swaps accounts mid transaction
  const restoreSwap = async () => {
    const result = await chrome.storage.local.get("storeSwapTransaction");
    if (result.storeSwapTransaction) {
      const { subnet, validator } = result.storeSwapTransaction;
      setStep(Step.CONFIRM_SWAP);
      setSelectedSubnet(subnet);
      setSelectedValidator(validator);
    }
  };

  const getSubnets = async () => {
    if (!api) return;
    setIsLoadingSubnets(true);
    try {
      const subnets = await api.getSubnets();
      setSubnets(subnets ?? []);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Load Subnets",
      });
    } finally {
      setIsLoadingSubnets(false);
    }
  };

  const getValidators = async (subnetId: number) => {
    setIsLoadingValidators(true);
    try {
      const validators = await api?.getValidators(subnetId);
      setValidators(validators ?? []);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Load Validators",
      });
    } finally {
      setIsLoadingValidators(false);
    }
  };

  const getBalance = async () => {
    if (!api || !currentAddress) return;
    try {
      const balance = await api.getBalance(currentAddress);
      setBalance(balance);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: "Failed to Fetch Balance",
      });
    }
  };

  const handleSubnetSelect = useCallback(
    async (subnet: Subnet) => {
      if (selectedSubnet?.id === subnet.id) {
        setSelectedSubnet(null);
        setValidators([]);
        return;
      }
      setSelectedSubnet(subnet);
      await getValidators(subnet.id);
    },
    [selectedSubnet, api, getValidators]
  );

  const handleValidatorSelect = (validator: Validator) => {
    setSelectedValidator(validator);
  };

  const handleBack = () => {
    if (step === Step.SELECT_VALIDATOR) {
      setStep(Step.SELECT_SUBNET);
      setSelectedSubnet(null);
      setSelectedValidator(null);
    } else if (step === Step.CONFIRM_SWAP) {
      setStep(Step.SELECT_VALIDATOR);
      setSelectedValidator(null);
    }
  };

  const handleNext = () => {
    if (
      step === Step.SELECT_SUBNET &&
      selectedSubnet &&
      validators.length > 0
    ) {
      setStep(Step.SELECT_VALIDATOR);
      setValidators(validators);
    } else if (step === Step.SELECT_VALIDATOR && selectedValidator) {
      setStep(Step.CONFIRM_SWAP);
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.SELECT_SUBNET:
        return (
          <SubnetSelection
            subnets={subnets ?? []}
            onSelect={handleSubnetSelect}
            isLoadingSubnets={isLoadingSubnets}
            selectedSubnet={selectedSubnet}
            validators={validators}
            isLoadingValidators={isLoadingValidators}
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
      case Step.CONFIRM_SWAP:
        if (!selectedSubnet || !selectedValidator) return null;
        return (
          <ConfirmSwap
            subnet={selectedSubnet}
            validator={selectedValidator}
            balance={balance as string}
            address={currentAddress as string}
          />
        );
    }
  };

  const init = async () => {
    if (isInitialized) return;
    if (!api || !currentAddress) return;
    setIsInitialized(true);
    await restoreSwap();
    if (api && currentAddress && subnets === null) {
      await Promise.all([getSubnets(), getBalance()]);
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
            disabled={step === Step.SELECT_SUBNET}
            className={`transition-colors ${
              step === Step.SELECT_SUBNET
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
              (step === Step.SELECT_SUBNET &&
                (!selectedSubnet || validators.length === 0)) ||
              (step === Step.SELECT_VALIDATOR && !selectedValidator) ||
              step === Step.CONFIRM_SWAP
            }
            className={`transition-colors ${
              (step === Step.SELECT_SUBNET &&
                (!selectedSubnet || validators.length === 0)) ||
              (step === Step.SELECT_VALIDATOR && !selectedValidator) ||
              step === Step.CONFIRM_SWAP
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

export default Swap;
