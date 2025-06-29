import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, answer } = body;

    if (!sessionId || !answer) {
      return NextResponse.json({ error: 'Session ID and answer are required' }, { status: 400 });
    }

    // Get the session
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Generate feedback using Gemini
    const feedbackPrompt = `You are a professional interviewer providing feedback.
The interview question was: "${session.question}"
The candidate's answer is: "${answer}"

Write concise, constructive feedback from an interviewer's perspective in 3-4 sentences. Focus on:
- What the candidate did well
- Areas for improvement
- Specific suggestions for a stronger answer

Keep the feedback professional, helpful, and encouraging.`;

    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: feedbackPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!geminiResponse.ok) {
      return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 });
    }

    const geminiResult = await geminiResponse.json();
    const feedback = geminiResult.candidates[0].content.parts[0].text.trim();

    // Update the session with answer and feedback
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        user_answer: answer,
        ai_feedback: feedback
      })
      .eq('id', sessionId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    // Get next question if available
    const { data: nextSession } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('weave_id', session.weave_id)
      .gt('question_number', session.question_number)
      .order('question_number')
      .limit(1)
      .single();

    return NextResponse.json({
      feedback,
      nextQuestion: nextSession ? {
        sessionId: nextSession.id,
        question: nextSession.question,
        questionNumber: nextSession.question_number
      } : null
    });

  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}