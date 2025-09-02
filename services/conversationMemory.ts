interface ConversationMemory {
  id: string;
  timestamp: Date;
  prompt: string;
  response: string;
  feedback?: 'good' | 'bad' | 'neutral';
  correctedResponse?: string;
  learningNotes?: string;
}

interface PersonalityProfile {
  communicationStyle: string[];
  preferences: string[];
  dislikes: string[];
  commonPhrases: string[];
  lastUpdated: Date;
}

class ConversationMemoryService {
  private memories: ConversationMemory[] = [];
  private personalityProfile: PersonalityProfile = {
    communicationStyle: [],
    preferences: [],
    dislikes: [],
    commonPhrases: [],
    lastUpdated: new Date()
  };

  constructor() {
    this.loadFromStorage();
  }

  // Save conversation to memory
  saveConversation(prompt: string, response: string): string {
    const memory: ConversationMemory = {
      id: this.generateId(),
      timestamp: new Date(),
      prompt,
      response
    };
    
    this.memories.push(memory);
    this.saveToStorage();
    return memory.id;
  }

  // Add feedback to a conversation
  addFeedback(conversationId: string, feedback: 'good' | 'bad' | 'neutral', correctedResponse?: string, learningNotes?: string) {
    const memory = this.memories.find(m => m.id === conversationId);
    if (memory) {
      memory.feedback = feedback;
      memory.correctedResponse = correctedResponse;
      memory.learningNotes = learningNotes;
      this.saveToStorage();
      this.updatePersonalityProfile();
    }
  }

  // Get recent conversations for context
  getRecentConversations(limit: number = 10): ConversationMemory[] {
    return this.memories
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get learning insights
  getLearningInsights(): string[] {
    const badResponses = this.memories.filter(m => m.feedback === 'bad');
    const goodResponses = this.memories.filter(m => m.feedback === 'good');
    
    const insights: string[] = [];
    
    if (badResponses.length > 0) {
      insights.push(`Avoid responses like: "${badResponses[0].response.substring(0, 100)}..."`);
    }
    
    if (goodResponses.length > 0) {
      insights.push(`Good responses include: "${goodResponses[0].response.substring(0, 100)}..."`);
    }
    
    return insights;
  }

  // Update personality profile based on feedback
  private updatePersonalityProfile() {
    const badResponses = this.memories.filter(m => m.feedback === 'bad');
    const goodResponses = this.memories.filter(m => m.feedback === 'good');
    
    // Extract patterns from feedback
    badResponses.forEach(memory => {
      if (memory.learningNotes) {
        this.personalityProfile.dislikes.push(memory.learningNotes);
      }
    });
    
    goodResponses.forEach(memory => {
      if (memory.learningNotes) {
        this.personalityProfile.preferences.push(memory.learningNotes);
      }
    });
    
    this.personalityProfile.lastUpdated = new Date();
    this.saveToStorage();
  }

  // Get enhanced system instruction with learning
  getEnhancedSystemInstruction(baseInstruction: string): string {
    const insights = this.getLearningInsights();
    const recentContext = this.getRecentConversations(5);
    
    let enhancedInstruction = baseInstruction;
    
    if (insights.length > 0) {
      enhancedInstruction += `\n\n**Learning from Previous Conversations:**`;
      insights.forEach(insight => {
        enhancedInstruction += `\n- ${insight}`;
      });
    }
    
    if (recentContext.length > 0) {
      enhancedInstruction += `\n\n**Recent Conversation Context:**`;
      recentContext.forEach(memory => {
        enhancedInstruction += `\n- User asked: "${memory.prompt}"`;
        if (memory.feedback === 'good') {
          enhancedInstruction += ` (This response was good)`;
        } else if (memory.feedback === 'bad') {
          enhancedInstruction += ` (This response was not good - avoid similar responses)`;
        }
      });
    }
    
    return enhancedInstruction;
  }

  // Storage methods
  private saveToStorage() {
    localStorage.setItem('conversationMemories', JSON.stringify(this.memories));
    localStorage.setItem('personalityProfile', JSON.stringify(this.personalityProfile));
  }

  private loadFromStorage() {
    const memoriesData = localStorage.getItem('conversationMemories');
    const profileData = localStorage.getItem('personalityProfile');
    
    if (memoriesData) {
      this.memories = JSON.parse(memoriesData).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
    
    if (profileData) {
      this.personalityProfile = {
        ...JSON.parse(profileData),
        lastUpdated: new Date(JSON.parse(profileData).lastUpdated)
      };
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get conversation statistics
  getStats() {
    const total = this.memories.length;
    const good = this.memories.filter(m => m.feedback === 'good').length;
    const bad = this.memories.filter(m => m.feedback === 'bad').length;
    
    return {
      totalConversations: total,
      goodResponses: good,
      badResponses: bad,
      learningRate: total > 0 ? (good / total) * 100 : 0
    };
  }
}

export const conversationMemory = new ConversationMemoryService();
export type { ConversationMemory, PersonalityProfile }; 