import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "@/lib/onboarding-steps";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X, PartyPopper } from "lucide-react";
import type { OnboardingState } from "@shared/schema";

type OnboardingUpdate = {
  stepIndex?: number;
  completed?: boolean;
  skipped?: boolean;
  dismissedAt?: string | null;
  completedAt?: string | null;
};

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [, setLocation] = useLocation();
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: onboardingState, isLoading } = useQuery<OnboardingState>({
    queryKey: ["/api/onboarding"],
  });

  const updateOnboarding = useMutation({
    mutationFn: async (updates: OnboardingUpdate) => {
      const res = await apiRequest("PATCH", "/api/onboarding", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
    },
  });

  const deleteDefaults = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/onboarding/delete-defaults");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  const currentStepIndex = onboardingState?.stepIndex ?? 0;
  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isCompleted = onboardingState?.completed ?? false;
  const isSkipped = onboardingState?.skipped ?? false;

  const updateSpotlight = useCallback(() => {
    if (currentStep?.targetSelector) {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);
        setShowSpotlight(true);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setShowSpotlight(false);
        setSpotlightRect(null);
      }
    } else {
      setShowSpotlight(false);
      setSpotlightRect(null);
    }
  }, [currentStep?.targetSelector]);

  useEffect(() => {
    if (currentStep?.route) {
      setLocation(currentStep.route);
    }
    const timer = setTimeout(updateSpotlight, 300);
    return () => clearTimeout(timer);
  }, [currentStep, setLocation, updateSpotlight]);

  useEffect(() => {
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight);
    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight);
    };
  }, [updateSpotlight]);

  const goNext = useCallback(() => {
    if (currentStepIndex < TOTAL_STEPS - 1) {
      updateOnboarding.mutate({ stepIndex: currentStepIndex + 1 });
    } else {
      setShowConfetti(true);
      updateOnboarding.mutate({ 
        completed: true, 
        completedAt: new Date().toISOString()
      });
      setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 2000);
    }
  }, [currentStepIndex, updateOnboarding, onComplete]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      updateOnboarding.mutate({ stepIndex: currentStepIndex - 1 });
    }
  }, [currentStepIndex, updateOnboarding]);

  const skipOnboarding = useCallback(() => {
    updateOnboarding.mutate({ 
      skipped: true, 
      dismissedAt: new Date().toISOString()
    });
  }, [updateOnboarding]);

  const handleAction = useCallback((actionId: string, action?: string) => {
    if (action === "next") {
      goNext();
    } else if (action === "back") {
      goBack();
    } else if (action === "skip") {
      skipOnboarding();
    } else if (actionId === "delete-defaults") {
      deleteDefaults.mutate(undefined, { onSuccess: goNext });
    } else if (actionId === "edit-defaults") {
      setLocation("/habits");
      goNext();
    } else if (actionId === "invite-more") {
      updateOnboarding.mutate({ 
        completed: true, 
        completedAt: new Date().toISOString() 
      });
      setLocation("/buddies");
    } else if (actionId === "go-today") {
      setShowConfetti(true);
      updateOnboarding.mutate({ 
        completed: true, 
        completedAt: new Date().toISOString() 
      });
      setTimeout(() => {
        setShowConfetti(false);
        setLocation("/");
        onComplete?.();
      }, 2000);
    }
  }, [goNext, goBack, skipOnboarding, deleteDefaults, setLocation, updateOnboarding, onComplete]);

  if (isLoading) return null;
  if (isCompleted || isSkipped) return null;

  const progress = ((currentStepIndex + 1) / TOTAL_STEPS) * 100;
  const isLastStep = currentStepIndex === TOTAL_STEPS - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <>
      <AnimatePresence>
        {showSpotlight && spotlightRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none"
          >
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={spotlightRect.left - 8}
                    y={spotlightRect.top - 8}
                    width={spotlightRect.width + 16}
                    height={spotlightRect.height + 16}
                    rx="8"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.7)"
                mask="url(#spotlight-mask)"
                style={{ backdropFilter: "blur(2px)" }}
              />
            </svg>
            <div
              className="absolute border-2 border-primary rounded-lg pointer-events-none"
              style={{
                left: spotlightRect.left - 8,
                top: spotlightRect.top - 8,
                width: spotlightRect.width + 16,
                height: spotlightRect.height + 16,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!showSpotlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[101] bg-background rounded-t-2xl shadow-2xl safe-area-pb"
        data-testid="onboarding-wizard"
      >
        <div className="max-w-lg mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {TOTAL_STEPS}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={skipOnboarding}
              data-testid="button-skip-onboarding"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Progress value={progress} className="h-1" />

          <div className="space-y-2">
            <h2 className="text-xl font-bold" data-testid="onboarding-title">
              {currentStep?.title}
            </h2>
            <p className="text-muted-foreground" data-testid="onboarding-description">
              {currentStep?.description}
            </p>
          </div>

          {currentStep?.actions ? (
            <div className="flex flex-col gap-2 pt-2">
              {currentStep.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || "default"}
                  onClick={() => handleAction(action.id, action.action)}
                  disabled={updateOnboarding.isPending || deleteDefaults.isPending}
                  className="w-full"
                  data-testid={`button-onboarding-${action.id}`}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={isFirstStep || updateOnboarding.isPending}
                data-testid="button-onboarding-back"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <Button
                variant="outline"
                onClick={skipOnboarding}
                disabled={updateOnboarding.isPending}
                data-testid="button-onboarding-skip"
              >
                Skip for now
              </Button>

              <Button
                onClick={goNext}
                disabled={updateOnboarding.isPending}
                data-testid="button-onboarding-next"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[102] flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <PartyPopper className="h-24 w-24 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Setup Complete!</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function FinishSetupBanner() {
  const { data: onboardingState } = useQuery<OnboardingState>({
    queryKey: ["/api/onboarding"],
  });

  const resumeOnboarding = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/onboarding", { skipped: false, dismissedAt: null });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
    },
  });

  const isSkipped = onboardingState?.skipped ?? false;
  const isCompleted = onboardingState?.completed ?? false;
  const currentStep = onboardingState?.stepIndex ?? 0;

  if (!isSkipped || isCompleted) return null;

  const stepsRemaining = TOTAL_STEPS - currentStep;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-12 left-0 right-0 z-30 bg-primary text-primary-foreground"
    >
      <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between gap-2">
        <span className="text-sm">
          Finish setup ({stepsRemaining} step{stepsRemaining !== 1 ? "s" : ""} left)
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => resumeOnboarding.mutate()}
          disabled={resumeOnboarding.isPending}
          data-testid="button-resume-onboarding"
        >
          Resume
        </Button>
      </div>
    </motion.div>
  );
}
