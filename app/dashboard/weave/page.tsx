"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wand2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WeavePage() {
  const [jobUrl, setJobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate URL
      try {
        new URL(jobUrl);
      } catch {
        setError('Please enter a valid URL');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/weave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate career documents');
        return;
      }

      toast.success('Career documents generated successfully!');
      router.push(`/dashboard/weave/results/${data.weaveId}`);
    } catch (error) {
      console.error('Weave generation error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Wand2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Your Career Weave</h1>
        <p className="text-slate-400">
          Paste a job posting URL and let AI generate tailored career documents for you
        </p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Job Posting URL</CardTitle>
          <CardDescription className="text-slate-400">
            Enter the URL of the job you&apos;re interested in applying for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobUrl" className="text-slate-200">Job URL</Label>
              <Input
                id="jobUrl"
                type="url"
                placeholder="https://company.com/jobs/position"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                required
                disabled={loading}
              />
              <p className="text-sm text-slate-500">
                Supported: LinkedIn, Indeed, company career pages, and most job boards
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Career Documents...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Career Documents
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-slate-700/30 rounded-lg">
            <h3 className="text-white font-medium mb-2">What You&apos;ll Get:</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Tailored resume optimized for the specific job</li>
              <li>• Personalized cover letter highlighting your best matches</li>
              <li>• Interview strategy with likely questions and preparation tips</li>
              <li>• AI-powered mock interview practice (coming next!)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}