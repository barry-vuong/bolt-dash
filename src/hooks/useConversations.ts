import { useState, useCallback } from 'react';
import { Message, Conversation } from '../types';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});

  const getConversation = useCallback((id: string): Conversation => {
    return conversations[id] || {
      id,
      messages: [],
      lastUpdated: new Date()
    };
  }, [conversations]);

  const addMessage = useCallback((conversationId: string, content: string, sender: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date()
    };

    setConversations(prev => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        id: conversationId,
        messages: [...(prev[conversationId]?.messages || []), newMessage],
        lastUpdated: new Date()
      }
    }));

    return newMessage;
  }, []);

  const generateResponse = useCallback((conversationId: string, selectedType: 'agent' | 'wizard', selectedId: string, userMessage: string) => {
    // Simulate AI response based on agent/wizard type
    let response = '';
    
    if (selectedType === 'agent') {
      switch (selectedId) {
        case 'finance':
          response = "I can help you with financial analysis and budgeting. What specific area would you like to explore?";
          break;
        case 'hr':
          response = "I'm here to assist with HR matters. Whether it's policies, recruitment, or employee relations, how can I help?";
          break;
        case 'operations':
          response = "Let's optimize your operations. I can help streamline processes and improve efficiency. What's your current challenge?";
          break;
        case 'legal':
          response = "I'll help you navigate legal matters. Whether it's contracts, compliance, or policy review, what do you need assistance with?";
          break;
        default:
          response = "I'm ready to help. What would you like to discuss?";
      }
    } else {
      switch (selectedId) {
        case 'loe-generator':
          response = "Great! Let's create a level-of-effort estimate. First, can you describe the project scope and key deliverables?";
          break;
        case 'budget-alerts':
          response = "I'll help you set up budget monitoring. What's your current monthly budget, and what categories would you like to track?";
          break;
        case 'contract-redliner':
          response = "Ready to review your contract. Please upload the document or paste the key sections you'd like me to analyze.";
          break;
        case 'policy-drafting':
          response = "Let's draft a policy together. What type of policy are you creating, and what are the key requirements or compliance standards?";
          break;
        case 'meeting-summary':
          response = "I'll help summarize your meeting. Please share the transcript or key discussion points, and I'll structure them for you.";
          break;
        default:
          response = "Let's begin this workflow. What's your first step?";
      }
    }

    // Add response after a brief delay to simulate processing
    setTimeout(() => {
      addMessage(conversationId, response, 'assistant');
    }, 1000);
  }, [addMessage]);

  return {
    conversations,
    getConversation,
    addMessage,
    generateResponse
  };
};