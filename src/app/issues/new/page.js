"use client";

import { Suspense } from "react";
import NewIssuePageContent from "./NewIssuePageContent";

export default function NewIssuePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewIssuePageContent />
    </Suspense>
  );
}