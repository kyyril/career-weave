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
    const { jobUrl } = body;

    if (!jobUrl) {
      return NextResponse.json({ error: 'Job URL is required' }, { status: 400 });
    }

    // Fetch user profile data
    const [workExperiencesRes, projectsRes, skillsRes, profileRes] = await Promise.all([
      supabase.from('work_experiences').select('*').eq('user_id', user.id),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('skills').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    // Scrape job description
    const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: jobUrl })
    });

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.json();
      return NextResponse.json({ error: errorData.error || 'Failed to scrape job URL' }, { status: 400 });
    }

    const { text: jobDescription } = await scrapeResponse.json();

    // Prepare data for AI prompt
    const workHistory = workExperiencesRes.data || [];
    const projects = projectsRes.data || [];
    const skills = (skillsRes.data || []).map(s => s.skill_name);

    // Construct AI prompt
    const prompt = `You are an expert career coaching system named "Career Weave". Your goal is to act as a committee of four AI agents to help a candidate land their dream job.

Candidate's Master Profile:
Work History: ${JSON.stringify(workHistory)}
Projects: ${JSON.stringify(projects)}
Skills: ${JSON.stringify(skills)}

Target Job Description:
${jobDescription}

---
YOUR TASK (Act as the following agents in sequence and produce a single JSON output):

Agent 1 (Job Analyst): Analyze the "Target Job Description". Extract the job title, company name, top 5-7 most critical hard skills, soft skills, keywords, and key responsibilities. Create an "Ideal Candidate Profile" based on this analysis.

Agent 2 (Candidate Profiler): Compare the "Candidate's Master Profile" against the "Ideal Candidate Profile" created by Agent 1. Identify the most relevant experiences, projects, and skills the candidate possesses that directly match the job. Also, identify any potential gaps.

Agent 3 (Narrative Weaver): Based on the analysis from the first two agents, generate two documents:
A. Tailored Resume Content: Rewrite the candidate's work experience descriptions and project descriptions. Do not invent new experiences. Instead, rephrase and re-prioritize existing bullet points to directly address the keywords and responsibilities from the job description. The output must be in well-formatted, professional plain text.
B. Personalized Cover Letter: Write a compelling, 3-4 paragraph cover letter. The letter must tell a story, connecting the candidate's most relevant experiences (identified by Agent 2) to the company's specific needs (identified by Agent 1). It must be professional, engaging, and not generic.

Agent 4 (Interview Strategist): Based on all the above information, create an "Interview Strategy Guide". This guide must include:
- A list of 5 likely behavioral questions based on the job's soft skill requirements.
- A list of 5 likely technical or role-specific questions.
- 3 key talking points or stories from the candidate's profile they should prepare to discuss.
- An identification of one potential weakness or gap and a suggestion on how to address it if asked.

FINAL OUTPUT FORMAT:
Return ONLY a single, valid JSON object. Do not include any other text or markdown formatting. The JSON object must have this exact structure:
{
  "job_title": "...",
  "company_name": "...",
  "resume": "...",
  "cover_letter": "...",
  "interview_strategy": {
    "behavioral_questions": ["...", "..."],
    "technical_questions": ["...", "..."],
    "key_talking_points": ["...", "..."],
    "potential_weakness_to_address": "..."
  }
}`;

    // Call Gemini API
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
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const geminiResult = await geminiResponse.json();
    
    if (!geminiResult.candidates || !geminiResult.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ error: 'Invalid AI response structure' }, { status: 500 });
    }

    let aiText = geminiResult.candidates[0].content.parts[0].text.trim();
    
    // Handle potential markdown code blocks
    if (aiText.startsWith('```json')) {
      aiText = aiText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (aiText.startsWith('```')) {
      aiText = aiText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    let aiResult;
    try {
      aiResult = JSON.parse(aiText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('AI text:', aiText);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Validate required fields
    if (!aiResult.job_title || !aiResult.resume || !aiResult.cover_letter) {
      return NextResponse.json({ error: 'Incomplete AI response' }, { status: 500 });
    }

    // Store in database
    const { data: weave, error: insertError } = await supabase
      .from('weaves')
      .insert([
        {
          user_id: user.id,
          job_url: jobUrl,
          job_title: aiResult.job_title,
          company_name: aiResult.company_name,
          generated_resume: aiResult.resume,
          generated_cover_letter: aiResult.cover_letter,
          generated_interview_strategy: aiResult.interview_strategy,
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
    }

    return NextResponse.json({ weaveId: weave.id });
  } catch (error) {
    console.error('Weave generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}