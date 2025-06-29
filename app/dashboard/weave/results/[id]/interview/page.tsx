"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mic, Play, Pause, SkipForward, CheckCircle, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewQuestion {
  sessionId: string;
  question: string;
  questionNumber: number;
  totalQuestions?: number;
}

interface FeedbackResponse {
  feedback: string;
  nextQuestion: InterviewQuestion | null;
}

export default function InterviewPage() {
  const params = useParams();
  const weaveId = params.id as string;
  
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    startInterview();
  }, [weaveId]);

  const startInterview = async () => {
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weaveId })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.message === 'Interview completed') {
          setIsCompleted(true);
        } else {
          setCurrentQuestion(data);
          await playQuestionAudio(data.question);
        }
      } else {
        toast.error(data.error || 'Failed to start interview');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const playQuestionAudio = async (question: string) => {
    try {
      setAudioLoading(true);
      const response = await fetch('/api/elevenlabs-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      } else {
        console.error('Failed to generate audio');
        // Continue without audio
      }
    } catch (error) {
      console.error('Audio generation error:', error);
      // Continue without audio
    } finally {
      setAudioLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentQuestion.sessionId,
          answer: userAnswer
        })
      });

      const data: FeedbackResponse = await response.json();

      if (response.ok) {
        setFeedback(data.feedback);
        setShowFeedback(true);
        
        if (data.nextQuestion) {
          // Prepare next question
          setTimeout(() => {
            setCurrentQuestion(data.nextQuestion);
            setUserAnswer('');
            setFeedback('');
            setShowFeedback(false);
            playQuestionAudio(data.nextQuestion!.question);
          }, 5000); // Show feedback for 5 seconds
        } else {
          // Interview completed
          setTimeout(() => {
            setIsCompleted(true);
          }, 3000);
        }
      } else {
        toast.error(data.error || 'Failed to get feedback');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = currentQuestion ? 
    ((currentQuestion.questionNumber) / (currentQuestion.totalQuestions || 5)) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Starting your interview...</div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Interview Completed!</h1>
          <p className="text-slate-400">
            Great job! You&apos;ve completed the mock interview. Review your performance and keep practicing.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href={`/dashboard/weave/results/${weaveId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/weave/results/${weaveId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Link>
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
          {currentQuestion && (
            <p className="text-slate-400">
              Question {currentQuestion.questionNumber} of {currentQuestion.totalQuestions || 5}
            </p>
          )}
        </div>
        
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Progress */}
      {currentQuestion && (
        <div className="space-y-2">
          
          <div className="flex justify-between text-sm text-slate-400">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="bg-slate-700" />
        </div>
      )}

      {/* Audio Player */}
      <audio ref={audioRef} className="hidden" />

      {/* Current Question */}
      {currentQuestion && !showFeedback && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center space-x-2">
                <Mic className="h-5 w-5 text-purple-400" />
                <span>Interview Question</span>
              </CardTitle>
              
              {audioLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playQuestionAudio(currentQuestion.question)}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Replay Audio
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-lg">
              <p className="text-lg text-slate-200 leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-200 text-sm font-medium mb-2 block">
                  Your Answer
                </label>
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here... Take your time to think through your response."
                  className="bg-slate-700/50 border-slate-600 text-white min-h-32"
                  disabled={submitting}
                />
              </div>

              <Button 
                onClick={submitAnswer}
                disabled={submitting || !userAnswer.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Getting Feedback...
                  </>
                ) : (
                  'Submit Answer & Get Feedback'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Display */}
      {showFeedback && feedback && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">AI Feedback</CardTitle>
            <CardDescription className="text-slate-400">
              Here&apos;s how you can improve your answer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-blue-900/20 border-blue-500/30">
              <AlertDescription className="text-slate-200">
                {feedback}
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 text-center">
              <p className="text-slate-400 text-sm">
                {currentQuestion && currentQuestion.questionNumber < (currentQuestion.totalQuestions || 5) 
                  ? 'Preparing next question...' 
                  : 'Completing interview...'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-slate-700/30 border-slate-600">
        <CardContent className="p-4">
          <h3 className="text-white font-medium mb-2">💡 Interview Tips</h3>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
            <li>• Be specific with examples from your experience</li>
            <li>• Take your time to think before answering</li>
            <li>• Ask clarifying questions if needed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}