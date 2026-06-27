import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StyleIcon from '@mui/icons-material/Style';
import TimelineIcon from '@mui/icons-material/Timeline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '../components/ui';

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
      description: 'Get math solutions, essay outlines, and history context instantly with detailed serif rendering.',
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
    <div className="min-h-screen text-[#2C2C2C] flex flex-col font-sans" style={{ background: '#F5F0E8' }}>
      
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#EBE6DE] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <AutoStoriesIcon style={{ color: '#8DA9A0' }} />
            <span className="font-bold text-xl font-display tracking-tight text-[#2C2C2C]">StudyForge</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4A4A4A]">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#8DA9A0] transition-colors">Home</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#8DA9A0] transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#8DA9A0] transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('reviews')} className="hover:text-[#8DA9A0] transition-colors">Reviews</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-[#8DA9A0] transition-colors">Pricing</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} size="sm">Login</Button>
            <Button variant="primary" onClick={() => navigate('/register')} size="sm">Sign Up</Button>
          </div>

          {/* Mobile Menu Btn */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-16 bg-white animate-fade-in">
          <nav className="flex flex-col p-6 space-y-6 text-base font-semibold text-[#4A4A4A]">
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-100">Home</button>
            <button onClick={() => scrollToSection('features')} className="text-left py-2 border-b border-gray-100">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2 border-b border-gray-100">How It Works</button>
            <button onClick={() => scrollToSection('reviews')} className="text-left py-2 border-b border-gray-100">Reviews</button>
            <button onClick={() => scrollToSection('pricing')} className="text-left py-2 border-b border-gray-100">Pricing</button>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="primary" className="flex-1" onClick={() => navigate('/register')}>Sign Up</Button>
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center flex-1">
        <div className="space-y-6 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-[#2C2C2C]">
            Study Smarter,<br />Not Harder — With AI
          </h1>
          <p className="text-lg text-[#4A4A4A] leading-relaxed max-w-lg">
            Your academic co-pilot that organizes tasks, generates flashcards, creates structured study guides, and helps you master any subject.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>Get Started Free</Button>
            <Button variant="outline" size="lg" onClick={() => scrollToSection('features')}>Explore Features</Button>
          </div>
          <div className="flex items-center gap-2 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-[#4A4A4A]" style={{ fontSize: '0.75rem' }}>
                  {i === 4 ? '500+' : ''}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-[#6B6B6B]">Used by 500+ active students</span>
          </div>
        </div>

        {/* Dashboard Mockup / SVG graphic */}
        <div className="w-full h-80 md:h-96 rounded-2xl bg-white border border-[#EBE6DE] shadow-lg p-6 relative overflow-hidden flex flex-col justify-between animate-fade-in-up delay-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-xs font-semibold text-gray-400 ml-2">StudyForge Dashboard Mockup</span>
            </div>
            <div className="w-16 h-4 rounded bg-gray-100"></div>
          </div>
          <div className="flex-1 py-4 grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="h-6 rounded bg-[#EEF4F2] w-3/4"></div>
              <div className="h-20 rounded bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">Study Materials</div>
              <div className="space-y-2">
                <div className="h-4 rounded bg-gray-100 w-full"></div>
                <div className="h-4 rounded bg-gray-100 w-5/6"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-32 rounded bg-[#FBF4E6] flex flex-col justify-between p-3 border border-[#E4C07A]/50">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center"><SchoolIcon style={{ color: '#D4A857', fontSize: 16 }} /></div>
                <div className="space-y-1">
                  <div className="h-3 rounded bg-gray-800/20 w-3/4"></div>
                  <div className="h-5 rounded bg-gray-800/10 w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="h-4 rounded bg-gray-100 w-24"></div>
            <div className="h-6 rounded bg-[#8DA9A0] w-16"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Complete Set of Study Tools</h2>
            <p className="text-[#6B6B6B]">Everything you need to master your classes, organize note libraries, and ace assessments.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-[#F5F0E8] border border-[#EBE6DE] hover:shadow-md transition-shadow flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Icon style={{ color: '#8DA9A0' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                    <p className="text-sm text-[#4A4A4A] leading-relaxed">{feat.description}</p>
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">How StudyForge Works</h2>
            <p className="text-[#6B6B6B]">Get set up and study in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#8DA9A0] text-white flex items-center justify-center text-xl font-bold mx-auto shadow-md">1</div>
              <h3 className="font-bold text-lg">Add Your Materials</h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed max-w-xs mx-auto">
                Paste study guide topics, notes, upload PDF textbooks, or specify custom concepts to learn.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#D4A857] text-white flex items-center justify-center text-xl font-bold mx-auto shadow-md">2</div>
              <h3 className="font-bold text-lg">AI Does the Work</h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed max-w-xs mx-auto">
                Our AI system structures terms, creates comprehensive guides, and compiles practice decks.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#5F8B8B] text-white flex items-center justify-center text-xl font-bold mx-auto shadow-md">3</div>
              <h3 className="font-bold text-lg">Learn and Master</h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed max-w-xs mx-auto">
                Use flashcards, converse with the AI tutor, and practice with inline quizzes until you verify mastery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Loved by Students</h2>
            <p className="text-[#6B6B6B]">Here is what students say about using StudyForge co-pilot.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#F5F0E8] border border-[#EBE6DE] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-[#D4A857]">
                    {[...Array(test.stars)].map((_, i) => <StarIcon key={i} fontSize="small" />)}
                  </div>
                  <p className="text-sm italic text-[#2C2C2C] leading-relaxed">
                    "{test.text}"
                  </p>
                </div>
                <div className="mt-6 border-t border-gray-200/50 pt-4">
                  <p className="font-bold text-sm">{test.author}</p>
                  <p className="text-xs text-[#6B6B6B]">{test.school}</p>
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
            <h2 className="text-3xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#6B6B6B]">Start free and scale your study tools as you grow.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-white border border-[#EBE6DE] shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-1 text-[#2C2C2C]">Free Tier</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold">$0</span>
                    <span className="text-sm text-[#6B6B6B]">/ month</span>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-[#4A4A4A]">
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#8DA9A0', fontSize: 16 }} /> Unlimited task organizer</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#8DA9A0', fontSize: 16 }} /> 50 AI-generated flashcards/mo</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#8DA9A0', fontSize: 16 }} /> Note-taking editor</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#8DA9A0', fontSize: 16 }} /> Basic study guides</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#8DA9A0', fontSize: 16 }} /> 10 books library limit</li>
                </ul>
              </div>
              <Button variant="primary" className="w-full mt-8" onClick={() => navigate('/register')}>Get Started Free</Button>
            </div>

            {/* Pro Tier (Coming Soon) */}
            <div className="p-8 rounded-2xl bg-[#EEF4F2] border border-[#B0C8C2] shadow-sm flex flex-col justify-between opacity-95 relative">
              <span className="absolute top-4 right-4 bg-[#D4A857] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-1 text-[#7A958E]">Pro Tier</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold">TBD</span>
                    <span className="text-sm text-[#6B6B6B]">/ month</span>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-[#4A4A4A]">
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#7A958E', fontSize: 16 }} /> Everything in Free</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#7A958E', fontSize: 16 }} /> Advanced AI context matching</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#7A958E', fontSize: 16 }} /> Unlimited books & summaries</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#7A958E', fontSize: 16 }} /> Priority AI assistance speed</li>
                  <li className="flex items-center gap-2"><CheckCircleIcon style={{ color: '#7A958E', fontSize: 16 }} /> Advanced subject streak widgets</li>
                </ul>
              </div>
              <Button variant="secondary" className="w-full mt-8" disabled>Coming Soon</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#EBE6DE] py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AutoStoriesIcon style={{ color: '#8DA9A0' }} />
              <span className="font-bold text-lg">StudyForge</span>
            </div>
            <p className="text-sm text-[#6B6B6B]">
              Your personalized academic assistant for streamlined learning.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider">App Links</h4>
            <div className="flex flex-col gap-2 text-sm text-[#6B6B6B]">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left hover:text-[#8DA9A0] transition-colors">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-left hover:text-[#8DA9A0] transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-left hover:text-[#8DA9A0] transition-colors">Pricing</button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-[#6B6B6B]">
              <span>Email: support@studyforge.com</span>
              <span className="text-xs">Available Mon-Fri 9AM-6PM PHT</span>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider">Social</h4>
            <div className="flex gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#8DA9A0]"><LinkedInIcon /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#8DA9A0]"><TwitterIcon /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#8DA9A0]"><GitHubIcon /></a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 pt-8 border-t border-gray-100 text-center text-xs text-[#6B6B6B] flex flex-col md:flex-row justify-between gap-4">
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
