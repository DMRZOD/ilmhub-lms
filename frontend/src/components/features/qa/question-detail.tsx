"use client";

import { ArrowLeft, CheckCircle2, Circle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import {
  useCreateAnswer,
  useDeleteAnswer,
  useDeleteQuestion,
  useQuestion,
  useResolveQuestion,
  useVoteAnswer,
} from "@/features/qa/hooks";
import { formatRelativeTime, initialsOf } from "@/features/qa/utils";

import { AnswerComposer } from "./answer-composer";
import { AnswerItem } from "./answer-item";

interface Props {
  questionId: string;
  currentUserId?: string;
  canModerate: boolean;
  onBack: () => void;
  onDeleted: () => void;
}

export function QuestionDetail({
  questionId,
  currentUserId,
  canModerate,
  onBack,
  onDeleted,
}: Props) {
  const query = useQuestion(questionId);
  const createAnswer = useCreateAnswer(questionId);
  const resolveQuestion = useResolveQuestion();
  const voteAnswer = useVoteAnswer(questionId);
  const deleteAnswer = useDeleteAnswer(questionId);
  const deleteQuestion = useDeleteQuestion();

  if (query.isLoading) {
    return (
      <div className="grid place-items-center py-sp-6">
        <Loader2 className="h-6 w-6 animate-spin text-fg-3" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-sp-3">
        <BackButton onClick={onBack} />
        <p className="rounded-ilm-2xl border border-dashed border-ilm-border bg-ilm-bg p-sp-5 text-center text-t-13 text-fg-2">
          Savolni yuklab bo&apos;lmadi.
        </p>
      </div>
    );
  }

  const question = query.data;
  const isAuthor = currentUserId === question.author.id;
  const canResolve = isAuthor || canModerate;
  const canDeleteQuestion = isAuthor || canModerate;

  const handleAnswer = (body: string) => {
    createAnswer.mutate(body, {
      onError: () => toast.error("Javobni yuborib bo'lmadi."),
    });
  };

  const handleResolve = () => {
    resolveQuestion.mutate(questionId, {
      onError: () => toast.error("Holatni o'zgartirib bo'lmadi."),
    });
  };

  const handleDeleteQuestion = () => {
    deleteQuestion.mutate(questionId, {
      onSuccess: () => {
        toast.success("Savol o'chirildi.");
        onDeleted();
      },
      onError: () => toast.error("Savolni o'chirib bo'lmadi."),
    });
  };

  return (
    <div className="flex flex-col gap-sp-4">
      <div className="flex items-center justify-between">
        <BackButton onClick={onBack} />
        <div className="flex items-center gap-sp-2">
          {canResolve && (
            <Button
              variant={question.isResolved ? "secondary" : "primary"}
              size="sm"
              type="button"
              iconLeft={question.isResolved ? Circle : CheckCircle2}
              disabled={resolveQuestion.isPending}
              onClick={handleResolve}
            >
              {question.isResolved ? "Ochib qo'yish" : "Hal qilindi"}
            </Button>
          )}
          {canDeleteQuestion && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              iconLeft={Trash2}
              disabled={deleteQuestion.isPending}
              onClick={handleDeleteQuestion}
            >
              O&apos;chirish
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-ilm-2xl border border-ilm-border bg-ilm-paper p-sp-5">
        <div className="mb-sp-3 flex flex-wrap items-center gap-sp-2">
          <Avatar
            size="sm"
            src={question.author.avatarUrl ?? undefined}
            alt={question.author.name}
            initials={initialsOf(question.author.name)}
          />
          <span className="text-t-13 font-semibold text-ilm-ink">
            {question.author.name}
          </span>
          <span className="text-t-12 text-fg-3">
            {formatRelativeTime(question.createdAt)}
          </span>
          {question.isResolved && (
            <Badge tone="success" icon={CheckCircle2}>
              Hal qilindi
            </Badge>
          )}
        </div>
        <h3 className="mb-sp-3 text-t-18 font-bold text-ilm-ink">
          {question.title}
        </h3>
        <Markdown>{question.body}</Markdown>
      </div>

      <h4 className="text-t-14 font-bold text-ilm-ink">
        {question.answersCount} ta javob
      </h4>

      <div className="flex flex-col gap-sp-3">
        {question.answers.map((answer) => (
          <AnswerItem
            key={answer.id}
            answer={answer}
            canDelete={answer.author.id === currentUserId || canModerate}
            voting={voteAnswer.isPending}
            onVote={(direction) =>
              voteAnswer.mutate({ answerId: answer.id, direction })
            }
            onDelete={() =>
              deleteAnswer.mutate(answer.id, {
                onSuccess: () => toast.success("Javob o'chirildi."),
                onError: () => toast.error("Javobni o'chirib bo'lmadi."),
              })
            }
          />
        ))}
      </div>

      <AnswerComposer
        onSubmit={handleAnswer}
        submitting={createAnswer.isPending}
      />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-t-13 font-semibold text-fg-2 transition-colors hover:text-ilm-ink"
    >
      <Icon icon={ArrowLeft} size={16} />
      Savollarga qaytish
    </button>
  );
}
