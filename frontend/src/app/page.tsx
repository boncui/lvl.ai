'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import WebNavbar from '@/components/navbar/webNavbar';
import { 
  ChartBarIcon,
  PlayIcon,
  SparklesIcon,
  RocketLaunchIcon,
  HeartIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  HomeIcon,
  UserGroupIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const features = [
    {
      icon: <SparklesIcon className="h-8 w-8 text-primary" />,
      title: "Gamified Experience",
      description: "Turn your daily tasks into an exciting game with XP, levels, and achievements that keep you motivated."
    },
    {
      icon: <CpuChipIcon className="h-8 w-8 text-primary" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations and smart task suggestions powered by advanced AI algorithms."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8 text-primary" />,
      title: "Progress Tracking",
      description: "Visualize your productivity journey with detailed analytics and progress tracking across all life categories."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-primary" />,
      title: "Social Features",
      description: "Connect with friends, share achievements, and compete in challenges to stay accountable and motivated."
    },
    {
      icon: <SparklesIcon className="h-8 w-8 text-primary" />,
      title: "Smart Automation",
      description: "Automatically categorize tasks, set optimal due dates, and receive intelligent reminders based on your patterns."
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-primary" />,
      title: "Privacy First",
      description: "Your data is secure with enterprise-grade encryption and privacy controls you can trust."
    }
  ];

  const categories = [
    {
      icon: <BriefcaseIcon className="h-6 w-6" />,
      name: "Work",
      color: "bg-blue-500",
      description: "Professional tasks and projects"
    },
    {
      icon: <AcademicCapIcon className="h-6 w-6" />,
      name: "Learning",
      color: "bg-green-500",
      description: "Education and skill development"
    },
    {
      icon: <HeartIcon className="h-6 w-6" />,
      name: "Health",
      color: "bg-red-500",
      description: "Fitness and wellness goals"
    },
    {
      icon: <HomeIcon className="h-6 w-6" />,
      name: "Personal",
      color: "bg-purple-500",
      description: "Life management and hobbies"
    },
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      name: "Social",
      color: "bg-pink-500",
      description: "Relationships and networking"
    },
    {
      icon: <ChartBarIcon className="h-6 w-6" />,
      name: "Finance",
      color: "bg-yellow-500",
      description: "Money management and goals"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "SC",
      content: "LVL.AI transformed how I manage my daily tasks. The gamification makes productivity fun, and I've never been more organized!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Student",
      avatar: "MJ",
      content: "As a student, balancing studies and personal life was tough. LVL.AI's AI suggestions help me prioritize perfectly.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Entrepreneur",
      avatar: "ER",
      content: "The social features keep me accountable, and the progress tracking shows real improvement in my productivity.",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "2M+", label: "Tasks Completed" },
    { number: "95%", label: "User Satisfaction" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <WebNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge variant="outline" className="mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              AI-Powered Task Management
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Level Up Your
              <span className="text-primary"> Productivity</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your daily tasks into an exciting game with AI-powered insights, 
              social challenges, and personalized recommendations that make productivity addictive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  <RocketLaunchIcon className="h-5 w-5 mr-2" />
                  Start Your Journey
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <PlayIcon className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent/15 rounded-full blur-xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose LVL.AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of productivity with cutting-edge features designed to make task management enjoyable and effective.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Master Every Area of Life
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From work projects to personal goals, LVL.AI helps you excel in every category with specialized tracking and insights.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <div className="text-white">{category.icon}</div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying about their productivity transformation with LVL.AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Level Up Your Life?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who have transformed their productivity with LVL.AI. 
            Start your journey today and unlock your full potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <RocketLaunchIcon className="h-5 w-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <ArrowRightIcon className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">LVL.AI</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                The ultimate gamified task management platform powered by AI. 
                Transform your productivity journey into an exciting adventure.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <GlobeAltIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <ComputerDesktopIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 LVL.AI. All rights reserved. Built with ❤️ for productivity enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}