import React from 'react';
import { TrendingUp, Clock, Star, Zap, Users, DollarSign, Settings, Scale, Calculator, AlertTriangle, File as FileEdit, FileText, BarChart3, MessageSquare, ArrowRight, Trophy, Target } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const usageMetrics = [
    { label: 'Total Interactions', value: '2,847', change: '+12%', icon: MessageSquare },
    { label: 'Active Users', value: '156', change: '+8%', icon: Users },
    { 
      label: 'Cost Savings', 
      value: '$45.2K', 
      change: '+23%', 
      icon: DollarSign,
      gamified: true,
      level: 'Gold',
      nextMilestone: '$50K',
      progress: 90
    },
    { label: 'Avg Response Time', value: '1.2s', change: '-15%', icon: Clock }
  ];

  const trendingRequests = [
    { title: 'Budget Analysis', count: 89, agent: 'Finance', icon: BarChart3 },
    { title: 'Policy Reviews', count: 67, agent: 'Legal', icon: FileText },
    { title: 'Team Onboarding', count: 54, agent: 'HR', icon: Users },
    { title: 'Process Optimization', count: 43, agent: 'Operations', icon: Settings },
    { title: 'Contract Redlining', count: 38, agent: 'Legal', icon: FileEdit }
  ];

  const newFeatures = [
    {
      title: 'Holiday Request Logging',
      description: 'You can now log holiday requests directly via the HR agent',
      icon: Users,
      badge: 'New',
      time: '2 days ago'
    },
    {
      title: 'Enhanced Budget Alerts',
      description: 'Set custom thresholds and receive real-time notifications',
      icon: AlertTriangle,
      badge: 'Updated',
      time: '1 week ago'
    },
    {
      title: 'Smart Contract Analysis',
      description: 'AI-powered contract redlining with compliance suggestions',
      icon: FileEdit,
      badge: 'New',
      time: '2 weeks ago'
    },
    {
      title: 'Advanced LOE Calculator',
      description: 'More accurate project estimates with historical data',
      icon: Calculator,
      badge: 'Enhanced',
      time: '3 weeks ago'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-l1-background">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-l1-text-primary mb-3">
              Welcome back, <span className="text-l1-accent">Bill</span>
            </h1>
            <p className="text-lg text-l1-text-secondary max-w-2xl mx-auto">
              Your AI-powered business assistant hub is ready to help you tackle today's challenges
            </p>
          </div>
          
          {/* Usage Metrics */}
          <section>
            <h2 className="text-lg font-semibold text-l1-text-primary mb-4 flex items-center">
              <BarChart3 className="mr-2 text-l1-accent" size={20} />
              Usage Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {usageMetrics.map((metric, index) => (
                <div key={index} className={`bg-l1-surface rounded-lg p-4 border ${
                  metric.gamified ? 'border-yellow-500/50 bg-gradient-to-br from-l1-surface to-yellow-500/5' : 'border-l1-border'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <metric.icon className={metric.gamified ? "text-yellow-500" : "text-l1-accent"} size={20} />
                      {metric.gamified && (
                        <div className="flex items-center space-x-1">
                          <Trophy className="text-yellow-500" size={14} />
                          <span className="text-xs font-medium text-yellow-500">{metric.level}</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      metric.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-l1-text-primary mb-1">{metric.value}</div>
                  <div className="text-sm text-l1-text-secondary">{metric.label}</div>
                  
                  {metric.gamified && (
                    <div className="mt-3 pt-3 border-t border-l1-border/50">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-l1-text-secondary">Next milestone</span>
                        <span className="text-yellow-500 font-medium">{metric.nextMilestone}</span>
                      </div>
                      <div className="w-full bg-l1-border rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${metric.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-l1-text-muted">Keep using agents to unlock more savings!</span>
                        <Target className="text-yellow-500" size={12} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Trending Requests and What's New - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trending Requests */}
            <section>
              <h2 className="text-lg font-semibold text-l1-text-primary mb-4 flex items-center">
                <TrendingUp className="mr-2 text-l1-accent" size={20} />
                Trending Requests
              </h2>
              <div className="bg-l1-surface rounded-lg border border-l1-border overflow-hidden">
                {trendingRequests.map((request, index) => (
                  <div key={index} className={`p-4 flex items-center justify-between hover:bg-l1-primary/50 transition-colors ${
                    index !== trendingRequests.length - 1 ? 'border-b border-l1-border' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-l1-accent/20 rounded-lg flex items-center justify-center">
                        <request.icon className="text-l1-accent" size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-l1-text-primary">{request.title}</div>
                        <div className="text-sm text-l1-text-secondary">via {request.agent} Agent</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-l1-text-primary">{request.count}</span>
                      <span className="text-xs text-l1-text-secondary">requests</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* New Features */}
            <section>
              <h2 className="text-lg font-semibold text-l1-text-primary mb-4 flex items-center">
                <Star className="mr-2 text-l1-accent" size={20} />
                What's New
              </h2>
              <div className="space-y-4">
                {newFeatures.map((feature, index) => (
                  <div key={index} className="bg-l1-surface rounded-lg p-4 border border-l1-border hover:border-l1-accent/30 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-l1-accent/20 rounded-lg flex items-center justify-center">
                          <feature.icon className="text-l1-accent" size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-l1-text-primary group-hover:text-l1-accent transition-colors">
                            {feature.title}
                          </div>
                          <div className="text-xs text-l1-text-secondary">{feature.time}</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        feature.badge === 'New' ? 'bg-green-500/20 text-green-400' :
                        feature.badge === 'Updated' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-sm text-l1-text-secondary mb-3">{feature.description}</p>
                    <div className="flex items-center text-l1-accent text-sm font-medium group-hover:text-l1-text-primary transition-colors">
                      Learn more
                      <ArrowRight className="ml-1" size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold text-l1-text-primary mb-4 flex items-center">
              <Zap className="mr-2 text-l1-accent" size={20} />
              Quick Start
            </h2>
            <div className="bg-l1-surface rounded-lg p-6 border border-l1-border">
              <p className="text-l1-text-secondary mb-4">
                Select an agent or wizard from the sidebar to get started, or try one of these popular workflows:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button className="p-3 bg-l1-primary rounded-lg hover:bg-l1-accent/20 transition-colors text-left group">
                  <DollarSign className="text-l1-accent mb-2 group-hover:scale-110 transition-transform" size={20} />
                  <div className="text-sm font-medium text-l1-text-primary">Budget Analysis</div>
                  <div className="text-xs text-l1-text-secondary">Finance Agent</div>
                </button>
                <button className="p-3 bg-l1-primary rounded-lg hover:bg-l1-accent/20 transition-colors text-left group">
                  <Users className="text-l1-accent mb-2 group-hover:scale-110 transition-transform" size={20} />
                  <div className="text-sm font-medium text-l1-text-primary">Team Management</div>
                  <div className="text-xs text-l1-text-secondary">HR Agent</div>
                </button>
                <button className="p-3 bg-l1-primary rounded-lg hover:bg-l1-accent/20 transition-colors text-left group">
                  <Calculator className="text-l1-accent mb-2 group-hover:scale-110 transition-transform" size={20} />
                  <div className="text-sm font-medium text-l1-text-primary">Project Estimate</div>
                  <div className="text-xs text-l1-text-secondary">LOE Generator</div>
                </button>
                <button className="p-3 bg-l1-primary rounded-lg hover:bg-l1-accent/20 transition-colors text-left group">
                  <FileEdit className="text-l1-accent mb-2 group-hover:scale-110 transition-transform" size={20} />
                  <div className="text-sm font-medium text-l1-text-primary">Contract Review</div>
                  <div className="text-xs text-l1-text-secondary">Contract Redliner</div>
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};