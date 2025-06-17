import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import API from '../api/api.ts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: number;
  title: string;
  description?: string;
  inputType: string;
  position: number;
}

interface Survey {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
}

interface SurveyTypeformPageProps {
  surveyId: number;
}

const SurveyTypeformPage: React.FC<SurveyTypeformPageProps> = ({ surveyId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const { data: survey, isLoading, isError } = useQuery<Survey>({
    queryKey: ['survey', surveyId],
    queryFn: () => API.get(`/surveys/${surveyId}`).then(res => res.data),
  });

  const submission = useMutation({
    mutationFn: (values: Record<string, any>) => {
      const answers = survey!.questions.map((q) => ({
        questionId: q.id,
        answerText: values[q.id.toString()],
      }));
      return API.post(`/surveys/${surveyId}/submissions`, { answers });
    },
    onSuccess: () => toast.success('Responses submitted'),
    onError: () => toast.error('Failed to submit'),
  });

  // Dynamic validation schema
  const schema = useMemo(() => {
    if (!survey) return z.object({});
    const shape: Record<string, any> = {};
    survey.questions.forEach((q) => {
      shape[q.id.toString()] = z.string().nonempty(`${q.title} is required`);
    });
    return z.object(shape);
  }, [survey]);

  const form = useForm<Record<string, any>>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    shouldUnregister: false,
  });

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = form;

  // Track visited when user types
  const field = survey?.questions[currentIndex].id.toString() || '';

  if (isLoading) return <div>Loading...</div>;
  if (isError || !survey) return <div>Failed to load survey</div>;

  const total = survey.questions.length;

  // Summary view
  if (showSummary) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Review Your Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {survey.questions.map((q) => (
              <div key={q.id} className="flex justify-between">
                <span className="font-medium">{q.title}</span>
                <span>{getValues(q.id.toString())}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setShowSummary(false)}>
              Edit
            </Button>
            <Button onClick={() => submission.mutate(getValues())} disabled={submission.isPending}>
              Confirm Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = survey.questions[currentIndex];
  const progressValue = Math.round(((currentIndex + 1) / total) * 100);

  const onNext = async () => {
    const valid = await trigger(field);
    if (valid) {
      setCurrentIndex((i) => Math.min(i + 1, total - 1));
    } else {
      const errorMsg = errors[field]?.message as string || 'Please answer this question';
      toast.error(errorMsg);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{survey.title}</CardTitle>
        {survey.description && <CardDescription>{survey.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Progress value={progressValue} className="mb-4" />
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center">
              {question.title}
            </h2>
            {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
            <Input
              key={field}
              type="text"
              autoFocus
              placeholder="Your answer"
              {...register(field)}
              defaultValue={getValues(field) || ''}
            />
            {errors[field] && (
              <p className="text-sm text-red-600">{errors[field]?.message as string}</p>
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))} disabled={currentIndex === 0}>
              Previous
            </Button>
            {currentIndex < total - 1 ? (
              <Button onClick={onNext}>
                Next
              </Button>
            ) : (
              <Button onClick={() => setShowSummary(true)}>
                Review Answers
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyTypeformPage;
