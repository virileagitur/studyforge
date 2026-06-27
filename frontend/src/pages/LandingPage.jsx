import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import ChecklistIcon from '@mui/icons-material/Checklist';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StyleIcon from '@mui/icons-material/Style';
import TimelineIcon from '@mui/icons-material/Timeline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: BookmarkIcon,
      title: 'AI Research Synthesizer',
      description: 'Upload PDF and TXT documents, summarize pages instantly, and search notes with high precision.',
    },
    {
      icon: ChecklistIcon,
      title: 'Intelligent Prioritization',
      description: 'Sort your daily assignments, track status dynamically, and focus on high-priority deadlines.',
    },
    {
      icon: SmartToyIcon,
      title: 'Interactive AI Tutor',
      description: 'Get math solutions, essay outlines, and history context instantly with detailed explanations.',
    },
    {
      icon: StyleIcon,
      title: 'Smart Flashcards',
      description: 'Generate study decks automatically using your own study materials or any specific custom topic.',
    },
    {
      icon: AutoStoriesIcon,
      title: 'Study Guide Generator',
      description: 'Convert complex topics into comprehensive, printable guides with terms, concepts, and practice quizzes.',
    },
    {
      icon: TimelineIcon,
      title: 'Progress Analytics',
      description: 'Monitor daily streak statistics and subject time distribution to build consistent academic habits.',
    },
  ];

  const testimonials = [
    {
      stars: 5,
      text: "StudyForge saved me hours of manual flashcard creation. I went from a B to an A in biology.",
      author: "Maria Santos",
      school: "University of the Philippines",
    },
    {
      stars: 5,
      text: "The AI tutor helped me understand calculus concepts I was struggling with for weeks.",
      author: "Juan Dela Cruz",
      school: "Ateneo de Manila University",
    },
    {
      stars: 5,
      text: "I love how the app organizes all my research and automatically generates study guides.",
      author: "Sofia Reyes",
      school: "De La Salle University",
    },
  ];

  return (
    <div className="min-h-screen text-[#2C2C2C] flex flex-col font-sans" style={{ background: 'var(--color-background)' }}>
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)/95] backdrop-blur-sm border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <AutoStoriesIcon style={{ color: 'var(--color-accent)' }} />
            <span className="font-bold text-xl font-display tracking-tight text-[var(--color-text-primary)]">StudyForge</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-secondary)]">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[var(--color-accent)] transition-colors">Home</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[var(--color-accent)] transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[var(--color-accent)] transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('reviews')} className="hover:text-[var(--color-accent)] transition-colors">Reviews</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-[var(--color-accent)] transition-colors">Pricing</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} size="sm">Login</Button>
            <Button variant="primary" onClick={() => navigate('/register')} size="sm">Sign Up</Button>
          </div>

          {/* Mobile Menu Btn */}
          <button className="md:hidden p-2 rounded-lg hover:bg-[var(--color-background)/50] text-[var(--color-text-secondary)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-16 bg-[var(--color-background)/90] backdrop-blur-sm animate-fade-in">
          <nav className="flex flex-col p-6 space-y-6 text-base font-semibold text-[var(--color-text-secondary)]">
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-[var(--color-border)/50]">Home</button>
            <button onClick={() => scrollToSection('features')} className="text-left py-2 border-b border-[var(--color-border)/50]">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2 border-b border-[var(--color-border)/50]">How It Works</button>
            <button onClick={() => scrollToSection('reviews')} className="text-left py-2 border-b border-[var(--color-border)/50]">Reviews</button>
            <button onClick={() => scrollToSection('pricing')} className="text-left py-2 border-b border-[var(--color-border)/50]">Pricing</button>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="primary" className="flex-1" onClick={() => navigate('/register')}>Sign Up</Button>
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center flex-1" id="hero">
        <div className="space-y-6 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-[var(--color-text-primary)]">
            Master Your Studies with AI-Powered Learning
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
            Your intelligent academic copilot that organizes tasks, generates flashcards, creates structured study guides, and helps you master any subject efficiently.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>Get Started Free</Button>
            <Button variant="outline" size="lg" onClick={() => scrollToSection('features')}>Explore Features</Button>
          </div>
          <div className="flex items-center gap-2 pt-4 text-[var(--color-text-muted)]">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[var(--color-background)/20] flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)]" style={{ fontSize: '0.75rem' }}>
                  {i === 4 ? '500+' : ''}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium">Used by 500+ active students</span>
          </div>
        </div>

        {/* Hero Illustration - Simplified */}
        <div className="hidden md:block">
          <div className="w-full h-96 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg p-6 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)/10] flex items-center justify-center">
                <AutoStoriesIcon style={{ color: 'var(--color-accent)', fontSize: 32 }} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">AI-Powered Learning Tools</h3>
              <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-md">
                From intelligent flashcards to research summarization, StudyForge brings the power of AI to every aspect of your academic journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-[var(--color-text-primary)]">Everything You Need to Succeed</h2>
            <p className="text-[var(--color-text-secondary)]">All-in-one platform designed for modern learners.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:shadow-lg transition-shadow flex flex-col items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)/10] flex items-center justify-center">
                    <Icon style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div className="w-full">
                    <h3 className="font-bold text-lg mb-2 text-[var(--color-text-primary)]">{feat.title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-[var(--color-text-primary)]">How StudyForge Works</h2>
            <p className="text-[var(--color-text-secondary)]">Get set up and start learning in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)/10] text-[var(--color-accent)] flex items-center justify-center text-xl font-bold mx-auto shadow-md">1</div>
              <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Add Your Materials</h3>
              <p className="text-[var(--color-text-secondary)] text-sm text-center max-w-xs">
                Upload your study materials, notes, or specify topics to learn.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)/10] text-[var(--color-accent)] flex items-center justify-center text-xl font-bold mx-auto shadow-md">2</div>
              <h3 className="font-bold text-lg text-[var(--color-text-primary)]">AI Does the Work</h3>
              <p className="text-[var(--color-text-secondary)] text-sm text-center max-w-xs">
                Our AI analyzes your content to create structured guides, flashcards, and personalized study plans.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-accent)/10] text-[var(--color-accent)] flex items-center justify-center text-xl font-bold mx-auto shadow-md">3</div>
              <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Learn and Excel</h3>
              <p className="text-[var(--color-text-secondary)] text-sm text-center max-w-xs">
                Use smart flashcards, practice with AI-generated quizzes, and track your progress toward mastery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-[var(--color-text-primary)]">Trusted by Students Worldwide</h2>
            <p className="text-[var(--color-text-secondary)]">See what learners are saying about their improved academic performance.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-[var(--color-accent)]">
                    {[...Array(test.stars)].map((_, i) => <StarIcon key={i} fontSize="small" />)}
                  </div>
                  <p className="text-[var(--color-text-primary)] text-sm italic leading-relaxed">
                    "{test.text}"
                  </p>
                </div>
                <div className="mt-6 border-t border-[var(--color-border)/50] pt-4">
                  <p className="font-bold text-sm text-[var(--color-text-primary)]">{test.author}</p>
                  <p className="text-[var(--color-text-muted)] text-xs">{test.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-[var(--color-text-primary)]">Simple, Transparent Pricing</h2>
            <p className="text-[var(--color-text-secondary)]">Start free and scale your study tools as your needs grow.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-1 text-[var(--color-text-primary)]">Free Tier</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-[var(--color-accent)]">$0</span>
                    <span className="text-sm text-[var(--color-text-muted)]">/ month</span>
                  </div>
                </div>
                <ul className="space-y-3 text-[var(--color-text-secondary)] text-sm">
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> Unlimited task organizer</li>
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> 50 AI-generated flashcards/month</li>
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> Note-taking editor</li>
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> Basic study guides</li>
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> 10 books library limit</li>
                </ul>
              </div>
              <Button variant="primary" className="w-full mt-8" onClick={() => navigate('/register')}>
                Get Started Free
              </Button>
            </div>

            {/* Pro Tier (Coming Soon) */}
            <div className="p-8 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between relative opacity-95">
              <span className="absolute top-4 right-4 bg-[var(--color-accent)] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-1 text-[var(--color-text-primary)]">Pro Tier</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-[var(--color-accent)]">$8.99</span>
                    <span className="text-sm text-[var(--color-text-muted)]">/ month</span>
                  </div>
                </div>
                <ul className="space-y-3 text-[var(--color-text-secondary)] text-sm">
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> Everything in Free</li>
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> Advanced AI context matching</li>
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> Unlimited books & summaries</li>
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> Priority AI responses</li>
                  <li className="flex items-center gap-2"><ChecklistIcon style={{ color: 'var(--color-accent)', fontSize: 16 }} /> Custom study plans & analytics</li>
                </ul>
              </div>
              <Button variant="primary" className="w-full mt-8" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AutoStoriesIcon style={{ color: 'var(--color-accent)' }} />
              <span className="font-bold text-lg text-[var(--color-text-primary)]">StudyForge</span>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm">
              Your intelligent academic companion for efficient learning.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-primary)]">Navigate</h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left hover:text-[var(--color-accent)] transition-colors">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-left hover:text-[var(--color-accent)] transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-left hover:text-[var(--color-accent)] transition-colors">Pricing</button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-primary)]">Resources</h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--color-text-secondary)]">
              <a href="#" className="hover:underline">Blog</a>
              <a href="#" className="hover:underline">Documentation</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--color-text-primary)]">Connect</h4>
            <div className="flex gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"><LinkedInIcon /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"><TwitterIcon /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"><GitHubIcon /></a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 pt-8 border-t border-[var(--color-border)/50] text-center text-xs text-[var(--color-text-muted)] flex flex-col md:flex-row justify-between gap-4">
          <span>Copyright © 2026 StudyForge. All rights reserved.</span>
          <div className="flex gap-4 justify-center">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}