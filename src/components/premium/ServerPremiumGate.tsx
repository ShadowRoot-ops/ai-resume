// src/components/premium/ServerPremiumGate.tsx
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user-helpers";
import { isFeatureUnlocked } from "@/lib/subscription-helpers";
import PremiumFeatureGate from "./PremiumFeatureGate";

interface ServerPremiumGateProps {
  featureId: string;
  children: React.ReactNode;
  resumeId?: string;
  title?: string;
  description?: string;
  showImprovement?: boolean;
  beforeScore?: number;
  afterScore?: number;
  blurIntensity?: "light" | "medium" | "heavy";
  blurredChildren?: React.ReactNode;
  customFeatures?: string[];
  showTimer?: boolean;
}

export default async function ServerPremiumGate({
  featureId,
  children,
  resumeId,
  title,
  description,
  showImprovement,
  beforeScore,
  afterScore,
  blurIntensity = "medium",
  blurredChildren,
  customFeatures,
  showTimer = true,
}: ServerPremiumGateProps) {
  const { userId } = auth();

  // If no user, fall back to the client-side gate which will show the lock screen
  if (!userId) {
    return (
      <PremiumFeatureGate
        featureId={featureId}
        resumeId={resumeId}
        title={title}
        description={description}
        showImprovement={showImprovement}
        beforeScore={beforeScore}
        afterScore={afterScore}
        blurIntensity={blurIntensity}
        blurredChildren={blurredChildren}
        customFeatures={customFeatures}
        showTimer={showTimer}
      >
        {children}
      </PremiumFeatureGate>
    );
  }

  // On the server, check if the feature is unlocked
  const user = await getOrCreateUser(userId);
  const unlocked = await isFeatureUnlocked(user.id, featureId);

  // If unlocked, render the children directly
  if (unlocked) {
    return <>{children}</>;
  }

  // If locked, render the client-side gate
  return (
    <PremiumFeatureGate
      featureId={featureId}
      resumeId={resumeId}
      title={title}
      description={description}
      showImprovement={showImprovement}
      beforeScore={beforeScore}
      afterScore={afterScore}
      blurIntensity={blurIntensity}
      blurredChildren={blurredChildren}
      customFeatures={customFeatures}
      showTimer={showTimer}
    >
      {children}
    </PremiumFeatureGate>
  );
}
