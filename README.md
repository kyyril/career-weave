# Career Weave

**AI-Powered Career Document Generation & Interview Practice Platform**

Career Weave is a comprehensive, full-stack web application that leverages artificial intelligence to help job seekers create tailored career documents and practice interviews. Built with Next.js, Supabase, and powered by Google's Gemini AI and ElevenLabs voice synthesis.

## 🚀 Live Demo

[Visit Career Weave](https://career-weave.netlify.app)

## 📋 Project Overview

Link Bolt.new: https://bolt.new/~/sb1-xoyb4e6b

### Elevator Pitch

Career Weave transforms the job application process by using AI to analyze job postings and generate perfectly tailored resumes, compelling cover letters, and comprehensive interview strategies. Users can then practice with AI-powered mock interviews featuring realistic voice synthesis, making job preparation more effective and accessible than ever before.

## 🎯 Project Story

### Inspiration

The job market is increasingly competitive, and generic applications rarely stand out. We recognized that job seekers spend countless hours manually tailoring their applications for each position, often missing key optimization opportunities. Career Weave was born from the idea that AI could not only automate this process but make it significantly more effective by analyzing job requirements at a deeper level than humanly possible.

### What We Learned

Building Career Weave taught us valuable lessons about:

- **AI Integration**: Working with multiple AI APIs (Gemini for text generation, ElevenLabs for voice synthesis) and handling their different response formats and rate limits
- **Real-time Data Processing**: Implementing web scraping that works across different job board formats while maintaining reliability
- **User Experience Design**: Creating intuitive workflows that guide users through complex processes without overwhelming them
- **Database Architecture**: Designing schemas that support both structured profile data and flexible AI-generated content
- **Authentication & Security**: Implementing Row Level Security (RLS) in Supabase to ensure user data privacy

### How We Built It

**Architecture & Tech Stack:**

- **Frontend**: Next.js 13+ with App Router, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes with serverless functions
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email/password and Google OAuth
- **AI Services**: Google Gemini 2.0 Flash for text generation, ElevenLabs for voice synthesis
- **Web Scraping**: Cheerio for job description extraction
- **Deployment**: Netlify with environment variable management

**Development Process:**

1. **Database Design**: Started with a comprehensive schema supporting user profiles, work experiences, projects, skills, AI-generated content, and interview sessions
2. **Authentication Layer**: Implemented secure authentication with proper middleware protection
3. **Profile Management**: Built CRUD interfaces for users to manage their career information
4. **AI Integration**: Developed the "Agent Committee" prompt system that acts as four specialized AI agents working together
5. **Web Scraping Engine**: Created a robust scraper that extracts clean job descriptions from various job boards
6. **Interview System**: Built the mock interview feature with voice synthesis and AI feedback
7. **UI/UX Polish**: Implemented a professional dark theme with smooth animations and responsive design

### Challenges We Faced

**Technical Challenges:**

- **AI Response Consistency**: Gemini sometimes returned responses wrapped in markdown code blocks, requiring robust parsing logic
- **Web Scraping Reliability**: Different job boards have varying HTML structures, necessitating flexible extraction strategies
- **Audio Integration**: Implementing seamless voice synthesis with proper error handling and fallbacks
- **State Management**: Managing complex interview flows with multiple async operations

**Solutions Implemented:**

- Created comprehensive error handling and response validation for all AI interactions
- Implemented fallback mechanisms for both web scraping and audio generation
- Used React's state management effectively with proper loading states and user feedback
- Added extensive logging and monitoring for debugging production issues

**Performance Optimizations:**

- Implemented proper caching strategies for API responses
- Used Next.js dynamic imports for code splitting
- Optimized database queries with proper indexing
- Added loading states and skeleton screens for better perceived performance

## ✨ Core Features

### 🎯 Master Profile Management

- **Work Experience Tracking**: Add, edit, and manage job history with detailed descriptions
- **Project Portfolio**: Showcase personal and professional projects with links
- **Skills Database**: Maintain a comprehensive list of technical and soft skills
- **Profile Completion Guidance**: Visual indicators help users build complete profiles

### 🤖 AI-Powered Document Generation

- **Intelligent Job Analysis**: Scrapes and analyzes job postings from major job boards
- **Agent Committee System**: Four specialized AI agents work together:
  - **Job Analyst**: Extracts requirements and creates ideal candidate profiles
  - **Candidate Profiler**: Matches user experience to job requirements
  - **Narrative Weaver**: Generates tailored resumes and cover letters
  - **Interview Strategist**: Creates comprehensive interview preparation guides
- **Multi-Format Output**: Clean, professional documents ready for copy/paste or download

### 🎤 AI Mock Interview System

- **Dynamic Question Generation**: Creates role-specific interview questions using AI
- **Voice Synthesis**: Questions are read aloud using ElevenLabs' natural-sounding voices
- **Real-time Feedback**: AI analyzes answers and provides constructive feedback
- **Progress Tracking**: Visual progress indicators and session management
- **Interview Strategy Integration**: Questions align with the generated interview strategy

### 🔒 Security & Privacy

- **Row Level Security**: Database-level protection ensures users only access their own data
- **Secure Authentication**: Email/password and Google OAuth with proper session management
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Privacy by Design**: No data sharing with third parties

## 🛠 Built With

### Languages & Frameworks

- **TypeScript** - Type-safe development
- **Next.js 13+** - React framework with App Router
- **React 18** - UI library with modern hooks
- **Node.js** - Server-side runtime

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icon library
- **CSS Variables** - Dynamic theming system

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level security policies
- **Real-time subscriptions** - Live data updates

### AI & External Services

- **Google Gemini 2.0 Flash** - Advanced language model for content generation
- **ElevenLabs API** - High-quality text-to-speech synthesis
- **Cheerio** - Server-side HTML parsing for web scraping

### Development & Deployment

- **Netlify** - Serverless deployment platform
- **Git** - Version control
- **ESLint** - Code linting and formatting
- **Environment Variables** - Secure configuration management

### Authentication & Security

- **Supabase Auth** - Complete authentication solution
- **Google OAuth** - Social login integration
- **JWT Tokens** - Secure session management
- **HTTPS** - Encrypted data transmission

## 🚀 Try It Out

### Live Application

**[Career Weave - Live Demo](https://career-weave.netlify.app)**

### GitHub Repository

**[View Source Code](https://github.com/kyyril/career-weave)**

### Quick Start Guide

1. **Sign Up**: Create an account using email or Google
2. **Build Profile**: Add your work experience, projects, and skills
3. **Create Weave**: Paste a job posting URL to generate tailored documents
4. **Practice Interview**: Use the AI mock interview system to prepare
5. **Apply Confidently**: Use your optimized documents and interview preparation

## 🔧 Local Development

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Gemini API key
- ElevenLabs API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/career-weave.git
cd career-weave

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
# Execute the SQL in supabase-schema.sql in your Supabase SQL editor

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## 📈 Future Enhancements

- **Resume Templates**: Multiple professional resume formats
- **Company Research**: AI-powered company and role insights
- **Interview Recording**: Practice with video recording and analysis
- **Job Board Integration**: Direct application submission
- **Team Collaboration**: Share and review documents with mentors
- **Analytics Dashboard**: Track application success rates
- **Mobile App**: Native iOS and Android applications

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI text generation
- **ElevenLabs** for realistic voice synthesis
- **Supabase** for excellent backend infrastructure
- **Vercel** for Next.js framework and inspiration
- **shadcn** for beautiful UI components

---

**Built with ❤️ for job seekers everywhere**

_Career Weave - Where AI meets career success_
