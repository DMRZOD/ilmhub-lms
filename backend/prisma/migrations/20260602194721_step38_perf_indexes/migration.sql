-- CreateIndex
CREATE INDEX "CodingSubmission_userId_exerciseId_idx" ON "CodingSubmission"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_quizId_createdAt_idx" ON "QuizAttempt"("userId", "quizId", "createdAt");

-- CreateIndex
CREATE INDEX "RefundRequest_userId_status_idx" ON "RefundRequest"("userId", "status");
