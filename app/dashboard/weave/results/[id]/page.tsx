"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, FileText, Mail, MessageSquare, Mic, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Weave } from '@/lib/types';

export default function WeaveResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [weave, setWeave] = useState<Weave | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeave();
  }, [id]);

  const fetchWeave = async () => {
    try {
      const { data, error } = await supabase
        .from('weaves')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setWeave(data);
    } catch (error) {
      console.error('Error fetching weave:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Loading your career documents...</div>
      </div>
    );
  }

  if (!weave) {
    return (
      <div className="text-center">
        <p className="text-slate-400">Results not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {weave.job_title || 'Career Documents'}
            </h1>
            {weave.company_name && (
              <p className="text-slate-400">{weave.company_name}</p>
            )}
          </div>
        </div>
        
        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
          <Link href={`/dashboard/weave/results/${id}/interview`}>
            <Mic className="mr-2 h-5 w-5" />
            Start Mock Interview
          </Link>
        </Button>
      </div>

      {/* Results Tabs */}
      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
          <TabsTrigger value="resume" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Resume</span>
          </TabsTrigger>
          <TabsTrigger value="cover-letter" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Cover Letter</span>
          </TabsTrigger>
          <TabsTrigger value="interview-strategy" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Interview Strategy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Tailored Resume</CardTitle>
                  <CardDescription className="text-slate-400">
                    AI-optimized resume for this specific position
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(weave.generated_resume || '', 'Resume')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(weave.generated_resume || '', 'resume.txt')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900/50 p-6 rounded-lg">
                <pre className="text-slate-200 whitespace-pre-wrap font-mono text-sm">
                  {weave.generated_resume}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover-letter" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">Personalized Cover Letter</CardTitle>
                  <CardDescription className="text-slate-400">
                    Compelling cover letter tailored to the company and role
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(weave.generated_cover_letter || '', 'Cover Letter')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsText(weave.generated_cover_letter || '', 'cover-letter.txt')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900/50 p-6 rounded-lg">
                <pre className="text-slate-200 whitespace-pre-wrap font-mono text-sm">
                  {weave.generated_cover_letter}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview-strategy" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Interview Strategy Guide</CardTitle>
              <CardDescription className="text-slate-400">
                Preparation guide with likely questions and talking points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {weave.generated_interview_strategy && (
                <>
                  {weave.generated_interview_strategy.behavioral_questions && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Behavioral Questions</h3>
                      <div className="space-y-2">
                        {weave.generated_interview_strategy.behavioral_questions.map((question: string, index: number) => (
                          <div key={index} className="bg-slate-700/30 p-3 rounded">
                            <p className="text-slate-200">{question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="bg-slate-600" />

                  {weave.generated_interview_strategy.technical_questions && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Technical Questions</h3>
                      <div className="space-y-2">
                        {weave.generated_interview_strategy.technical_questions.map((question: string, index: number) => (
                          <div key={index} className="bg-slate-700/30 p-3 rounded">
                            <p className="text-slate-200">{question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="bg-slate-600" />

                  {weave.generated_interview_strategy.key_talking_points && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Key Talking Points</h3>
                      <div className="space-y-2">
                        {weave.generated_interview_strategy.key_talking_points.map((point: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Badge variant="secondary" className="mt-1">
                              {index + 1}
                            </Badge>
                            <p className="text-slate-200">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="bg-slate-600" />

                  {weave.generated_interview_strategy.potential_weakness_to_address && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Address Potential Weakness</h3>
                      <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
                        <p className="text-slate-200">{weave.generated_interview_strategy.potential_weakness_to_address}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Practice?</h3>
          <p className="text-slate-300 mb-4">
            Take your preparation to the next level with our AI-powered mock interview
          </p>
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href={`/dashboard/weave/results/${id}/interview`}>
              <Mic className="mr-2 h-5 w-5" />
              Start Mock Interview
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}