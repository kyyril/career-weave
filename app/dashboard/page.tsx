"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Briefcase, FolderOpen, Lightbulb, Edit, Trash2, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import type { WorkExperience, Project, Skill, Profile } from '@/lib/types';

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>({});
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [workForm, setWorkForm] = useState<WorkExperience>({
    job_title: '',
    company_name: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [projectForm, setProjectForm] = useState<Project>({
    project_title: '',
    description: '',
    project_url: ''
  });
  const [skillName, setSkillName] = useState('');
  const [editingWork, setEditingWork] = useState<WorkExperience | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [workRes, projectRes, skillRes] = await Promise.all([
        fetch('/api/work-experiences'),
        fetch('/api/projects'),
        fetch('/api/skills')
      ]);

      if (workRes.ok) {
        const workData = await workRes.json();
        setWorkExperiences(workData);
      }

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProjects(projectData);
      }

      if (skillRes.ok) {
        const skillData = await skillRes.json();
        setSkills(skillData);
      }

      // Get user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = editingWork ? 'PUT' : 'POST';
    const body = editingWork ? { ...workForm, id: editingWork.id } : workForm;

    try {
      const response = await fetch('/api/work-experiences', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingWork ? 'Work experience updated!' : 'Work experience added!');
        setWorkForm({ job_title: '', company_name: '', start_date: '', end_date: '', description: '' });
        setEditingWork(null);
        fetchAllData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save work experience');
      }
    } catch (error) {
      toast.error('Failed to save work experience');
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = editingProject ? 'PUT' : 'POST';
    const body = editingProject ? { ...projectForm, id: editingProject.id } : projectForm;

    try {
      const response = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(editingProject ? 'Project updated!' : 'Project added!');
        setProjectForm({ project_title: '', description: '', project_url: '' });
        setEditingProject(null);
        fetchAllData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save project');
      }
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_name: skillName })
      });

      if (response.ok) {
        toast.success('Skill added!');
        setSkillName('');
        fetchAllData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add skill');
      }
    } catch (error) {
      toast.error('Failed to add skill');
    }
  };

  const deleteWorkExperience = async (id: string) => {
    try {
      const response = await fetch(`/api/work-experiences?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Work experience deleted!');
        fetchAllData();
      } else {
        toast.error('Failed to delete work experience');
      }
    } catch (error) {
      toast.error('Failed to delete work experience');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Project deleted!');
        fetchAllData();
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      const response = await fetch(`/api/skills?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Skill deleted!');
        fetchAllData();
      } else {
        toast.error('Failed to delete skill');
      }
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Loading your profile...</div>
      </div>
    );
  }

  const isProfileComplete = workExperiences.length > 0 && projects.length > 0 && skills.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back{profile.full_name ? `, ${profile.full_name}` : ''}!
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your career profile and create AI-powered applications
          </p>
        </div>
        
        {isProfileComplete && (
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/weave">
              <Wand2 className="mr-2 h-5 w-5" />
              Create New Weave
            </Link>
          </Button>
        )}
      </div>

      {/* Profile Completion Alert */}
      {!isProfileComplete && (
        <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 rounded-full p-2">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Complete Your Profile</h3>
                <p className="text-slate-300 mb-4">
                  Add your work experience, projects, and skills to unlock AI-powered career document generation.
                </p>
                <div className="flex space-x-4 text-sm">
                  <span className={`flex items-center ${workExperiences.length > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                    ✓ Work Experience ({workExperiences.length})
                  </span>
                  <span className={`flex items-center ${projects.length > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                    ✓ Projects ({projects.length})
                  </span>
                  <span className={`flex items-center ${skills.length > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                    ✓ Skills ({skills.length})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Experience Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-white">Work Experience</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditingWork(null)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Experience
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingWork ? 'Edit Work Experience' : 'Add Work Experience'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleWorkSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job_title" className="text-slate-200">Job Title</Label>
                      <Input
                        id="job_title"
                        value={workForm.job_title}
                        onChange={(e) => setWorkForm({...workForm, job_title: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name" className="text-slate-200">Company</Label>
                      <Input
                        id="company_name"
                        value={workForm.company_name}
                        onChange={(e) => setWorkForm({...workForm, company_name: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date" className="text-slate-200">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={workForm.start_date}
                        onChange={(e) => setWorkForm({...workForm, start_date: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date" className="text-slate-200">End Date (Optional)</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={workForm.end_date || ''}
                        onChange={(e) => setWorkForm({...workForm, end_date: e.target.value || undefined})}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-slate-200">Description</Label>
                    <Textarea
                      id="description"
                      value={workForm.description || ''}
                      onChange={(e) => setWorkForm({...workForm, description: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={4}
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingWork ? 'Update Experience' : 'Add Experience'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {workExperiences.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No work experience added yet. Click "Add Experience" to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {workExperiences.map((work) => (
                <div key={work.id} className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{work.job_title}</h3>
                      <p className="text-blue-400">{work.company_name}</p>
                      <p className="text-slate-400 text-sm">
                        {format(new Date(work.start_date), 'MMM yyyy')} - 
                        {work.end_date ? format(new Date(work.end_date), 'MMM yyyy') : 'Present'}
                      </p>
                      {work.description && (
                        <p className="text-slate-300 text-sm mt-2">{work.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingWork(work);
                          setWorkForm(work);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => work.id && deleteWorkExperience(work.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-green-400" />
              <CardTitle className="text-white">Projects</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditingProject(null)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingProject ? 'Edit Project' : 'Add Project'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="project_title" className="text-slate-200">Project Title</Label>
                    <Input
                      id="project_title"
                      value={projectForm.project_title}
                      onChange={(e) => setProjectForm({...projectForm, project_title: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="project_description" className="text-slate-200">Description</Label>
                    <Textarea
                      id="project_description"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      rows={4}
                      placeholder="Describe your project, technologies used, and key achievements..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="project_url" className="text-slate-200">Project URL (Optional)</Label>
                    <Input
                      id="project_url"
                      type="url"
                      value={projectForm.project_url || ''}
                      onChange={(e) => setProjectForm({...projectForm, project_url: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingProject ? 'Update Project' : 'Add Project'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No projects added yet. Click "Add Project" to showcase your work.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{project.project_title}</h3>
                      <p className="text-slate-300 text-sm mt-2">{project.description}</p>
                      {project.project_url && (
                        <a 
                          href={project.project_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingProject(project);
                          setProjectForm(project);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => project.id && deleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-white">Skills</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Skill</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSkillSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="skill_name" className="text-slate-200">Skill Name</Label>
                    <Input
                      id="skill_name"
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="e.g., JavaScript, Project Management, Data Analysis"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Skill</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No skills added yet. Click "Add Skill" to list your expertise.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge 
                  key={skill.id} 
                  variant="secondary" 
                  className="bg-slate-700 text-slate-200 hover:bg-slate-600 cursor-pointer group"
                  onClick={() => skill.id && deleteSkill(skill.id)}
                >
                  {skill.skill_name}
                  <Trash2 className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}