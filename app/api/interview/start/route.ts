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
    const { weaveId } = body;

    if (!weaveId) {
      return NextResponse.json({ error: 'Weave ID is required' }, { status: 400 });
    }

    // Get the weave data
    const { data: weave, error: weaveError } = await supabase
      .from('weaves')
      .select('*')
      .eq('id', weaveId)
      .eq('user_id', user.id)
      .single();

    if (weaveError || !weave) {
      return NextResponse.json({ error: 'Weave not found' }, { status: 404 });
    }

    // Check if interview already exists
    const { data: existingSessions } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('weave_id', weaveId)
      .order('question_number');

    if (existingSessions && existingSessions.length > 0) {
      // Return first unanswered question
      const unanswered = existingSessions.find(s => !s.user_answer);
      if (unanswered) {
        return NextResponse.json({
          sessionId: unanswered.id,
          question: unanswered.question,
          questionNumber: unanswered.question_number,
          totalQuestions: existingSessions.length
        });
      }
      // All questions answered
      return NextResponse.json({ 
        message: 'Interview completed',
        totalQuestions: existingSessions.length
      });
    }

    // Generate interview questions using Gemini
    const questionPrompt = `You are a professional hiring manager for the role of ${weave.job_title}${weave.company_name ? ` at ${weave.company_name}` : ''}. Based on the following job context, generate 5 unique interview questions for a candidate. Return the output as a clean JSON array of strings: ["question 1", "question 2", "question 3", "question 4", "question 5"].

Job Context:
Title: ${weave.job_title}
Company: ${weave.company_name || 'Not specified'}

Generate questions that cover:
1. Experience and background
2. Technical skills related to the role
3. Problem-solving abilities
4. Cultural fit and motivation
5. Situational/behavioral scenarios

Return ONLY the JSON array, no other text.`;

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
                text: questionPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!geminiResponse.ok) {
      return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }

    const geminiResult = await geminiResponse.json();
    let questionsText = geminiResult.candidates[0].content.parts[0].text.trim();

    // Handle potential markdown code blocks
    if (questionsText.startsWith('```json')) {
      questionsText = questionsText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (questionsText.startsWith('```')) {
      questionsText = questionsText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    let questions;
    try {
      questions = JSON.parse(questionsText);
    } catch (parseError) {
      console.error('Failed to parse questions:', parseError);
      // Fallback questions
      questions = [
        "Tell me about yourself and why you're interested in this position.",
        "What relevant experience do you have for this role?",
        "Describe a challenging project you've worked on and how you overcame obstacles.",
        "How do you stay current with industry trends and technologies?",
        "Why do you want to work for our company?"
      ];
    }

    if (!Array.isArray(questions) || questions.length !== 5) {
      // Fallback questions
      questions = [
        "Tell me about yourself and why you're interested in this position.",
        "What relevant experience do you have for this role?",
        "Describe a challenging project you've worked on and how you overcame obstacles.",
        "How do you stay current with industry trends and technologies?",
        "Why do you want to work for our company?"
      ];
    }

    // Insert all questions into the database
    const sessionsToInsert = questions.map((question, index) => ({
      weave_id: weaveId,
      user_id: user.id,
      question: question,
      question_number: index + 1
    }));

    const { data: sessions, error: insertError } = await supabase
      .from('interview_sessions')
      .insert(sessionsToInsert)
      .select()
      .order('question_number');

    if (insertError) {
      console.error('Failed to insert sessions:', insertError);
      return NextResponse.json({ error: 'Failed to create interview session' }, { status: 500 });
    }

    // Return the first question
    const firstSession = sessions[0];
    return NextResponse.json({
      sessionId: firstSession.id,
      question: firstSession.question,
      questionNumber: 1,
      totalQuestions: 5
    });

  } catch (error) {
    console.error('Interview start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}