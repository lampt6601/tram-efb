import { Suspense } from "react";
import { AuthErrorContent } from "./AuthErrorContent";

export default function TmaAuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  );
}
