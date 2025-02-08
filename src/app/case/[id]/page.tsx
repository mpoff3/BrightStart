"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

// Helper function to generate more contextual responses
const generateStakeholderResponse = (role: string, userInput: string) => {
  // Keywords to look for in user input
  const keywords = {
    cost: ['expensive', 'cost', '$2M', 'budget', 'investment', 'money'],
    technical: ['accuracy', 'implementation', 'system', 'technology', 'integration'],
    ethical: ['privacy', 'safety', 'concerns', 'risk', 'trust'],
    impact: ['workflow', 'change', 'effect', 'impact', 'process']
  };

  const getResponseContext = (input: string) => {
    const lowercaseInput = input.toLowerCase();
    let context = '';
    
    if (keywords.cost.some(word => lowercaseInput.includes(word))) {
      context = 'cost';
    } else if (keywords.technical.some(word => lowercaseInput.includes(word))) {
      context = 'technical';
    } else if (keywords.ethical.some(word => lowercaseInput.includes(word))) {
      context = 'ethical';
    } else if (keywords.impact.some(word => lowercaseInput.includes(word))) {
      context = 'impact';
    }
    
    return context || 'general';
  };

  const responseTemplates = {
    "Doctor": {
      cost: [
        "While the cost is significant, we need to consider the potential savings in reduced diagnostic errors and improved patient outcomes.",
        "We should analyze how this investment might affect our department's budget for other critical medical equipment.",
        "Could we consider a phased implementation approach to spread the cost over time while validating the benefits?"
      ],
      technical: [
        "Based on my clinical experience, we need to ensure the AI system can handle complex cases that don't fit typical patterns.",
        "I'd like to see validation studies specific to our patient demographics before full implementation.",
        "We should consider how this system will integrate with our existing diagnostic protocols and EMR systems."
      ],
      ethical: [
        "As a physician, my primary concern is maintaining the human element in patient care while leveraging AI capabilities.",
        "We need clear protocols for cases where AI recommendations differ from physician judgments.",
        "How will we explain this technology to patients and ensure they're comfortable with its use?"
      ],
      impact: [
        "This could significantly reduce our diagnostic timeframes, but we need proper training for all medical staff.",
        "Let's consider how this will affect our consultation processes and team dynamics.",
        "We should establish clear guidelines for when to rely on AI versus traditional diagnostic methods."
      ],
      general: [
        "From my clinical perspective, we need to balance innovation with proven medical practices.",
        "We should consider running a pilot program in specific departments first.",
        "Let's ensure we have clear protocols for oversight and quality control."
      ]
    },
    "Hospital Administrator": {
      cost: [
        "The $2M investment requires careful financial planning. We need to evaluate ROI and impact on our annual budget.",
        "We should explore financing options and potential government grants for healthcare innovation.",
        "Let's analyze the long-term cost savings from reduced diagnostic errors and improved efficiency."
      ],
      technical: [
        "We need to ensure our IT infrastructure can support this new system effectively.",
        "Staff training costs and implementation timeline need to be carefully considered.",
        "We should evaluate different vendors and their track records with similar implementations."
      ],
      ethical: [
        "We must ensure compliance with all healthcare regulations and data protection laws.",
        "Our liability insurance coverage needs to be reviewed for AI-related incidents.",
        "We need clear policies for handling AI system errors and accountability."
      ],
      impact: [
        "This will significantly affect our operational workflow and staffing requirements.",
        "We should consider the impact on our hospital's reputation and market position.",
        "Let's plan for potential disruptions during the implementation phase."
      ],
      general: [
        "We need to balance innovation with financial responsibility and operational stability.",
        "Let's benchmark against other hospitals that have implemented similar systems.",
        "We should develop a comprehensive implementation and risk management plan."
      ]
    },
    "Patient Advocate": {
      cost: [
        "How will this investment affect patient care costs and insurance coverage?",
        "We need to ensure this doesn't lead to increased financial burden on patients.",
        "Could these resources be better spent on improving direct patient care services?"
      ],
      technical: [
        "What safeguards are in place to protect patient data and privacy?",
        "How will patients be informed about and consent to AI-assisted diagnostics?",
        "We need clear procedures for patients who wish to opt out of AI diagnostics."
      ],
      ethical: [
        "Patient autonomy and informed consent must be our top priorities.",
        "How will this affect the doctor-patient relationship and trust?",
        "We need to ensure equal access and prevent algorithmic bias against certain patient groups."
      ],
      impact: [
        "How will this change affect patient wait times and access to care?",
        "We need to consider the impact on elderly or tech-hesitant patients.",
        "What support systems will be in place to help patients understand AI recommendations?"
      ],
      general: [
        "Patient well-being and care quality must remain our primary focus.",
        "We need clear communication strategies to explain this change to patients.",
        "Let's ensure this truly benefits patient care and experience."
      ]
    },
    "AI Ethics Researcher": {
      cost: [
        "We should consider the hidden costs of ethical oversight and continuous monitoring.",
        "Investment in ethical AI development might need additional funding.",
        "How do we balance cost efficiency with ethical safeguards?"
      ],
      technical: [
        "We need to audit the AI system for potential biases in its training data.",
        "What mechanisms are in place to monitor and improve the AI's accuracy?",
        "How transparent is the AI's decision-making process?"
      ],
      ethical: [
        "We must establish clear ethical guidelines for AI use in healthcare.",
        "How do we ensure the AI system respects patient autonomy and privacy?",
        "What oversight mechanisms will prevent misuse or over-reliance on AI?"
      ],
      impact: [
        "We should study the long-term implications for medical practice and education.",
        "How will this affect the development of medical expertise in human practitioners?",
        "What measures are in place to track and evaluate ethical impacts?"
      ],
      general: [
        "We need robust ethical frameworks for AI implementation in healthcare.",
        "Regular ethical audits and adjustments will be crucial.",
        "Let's ensure this technology serves human values and medical ethics."
      ]
    }
  };

  const context = getResponseContext(userInput);
  const roleTemplates = responseTemplates[role as keyof typeof responseTemplates];
  
  if (!roleTemplates) {
    return "I'm considering the implications of your points...";
  }

  const contextResponses = roleTemplates[context as keyof typeof roleTemplates];
  const randomIndex = Math.floor(Math.random() * contextResponses.length);
  return contextResponses[randomIndex];
};

const caseStudies = {
  1: {
    title: "Healthcare Innovation",
    prompt: "A major hospital is considering implementing AI-powered diagnostic tools. The system promises 95% accuracy but costs $2M to implement. How should they proceed while considering various stakeholder perspectives?",
    stakeholders: [
      { name: "Alice", role: "Doctor" },
      { name: "Bob", role: "Hospital Administrator" },
      { name: "Jaya", role: "Patient Advocate" },
      { name: "Ron", role: "AI Ethics Researcher" }
    ]
  },
  2: {
    title: "Environmental Impact",
    prompt: "A manufacturing plant needs to decide between continuing current operations or investing in expensive green technology. The change would affect jobs but benefit the environment.",
    stakeholders: [
      { name: "Alice", role: "Environmental Scientist" },
      { name: "Bob", role: "Factory Worker" },
      { name: "Jaya", role: "Local Resident" },
      { name: "Ron", role: "Business Owner" }
    ]
  },
  // Add more cases here...
};

// Update the stakeholder positions for better spacing and centering
const stakeholderPositions = {
  0: "translate(-180%, 120%)",  // bottom left (Bob)
  1: "translate(-70%, 20%)",    // middle left (Alice)
  2: "translate(70%, 20%)",     // middle right (Jaya)
  3: "translate(180%, 120%)",   // bottom right (Ron)
};

export default function CaseStudy() {
  const params = useParams();
  const caseId = Number(params.id);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [stakeholderResponses, setStakeholderResponses] = useState<{[key: string]: string[]}>({});
  const [showTranscript, setShowTranscript] = useState(true);
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  
  const caseData = caseStudies[caseId as keyof typeof caseStudies];

  if (!caseData) return <div>Case not found</div>;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentInput.trim().length > 0) {
        // Add new input to history
        const newInputs = [...userInputs, currentInput];
        setUserInputs(newInputs);
        
        // Generate response only from selected stakeholder or all if none selected
        const respondingStakeholders = selectedStakeholder 
          ? [caseData.stakeholders.find(s => s.name === selectedStakeholder)!]
          : caseData.stakeholders;

        // Generate responses and show speaking animation
        respondingStakeholders.forEach((stakeholder) => {
          const response = generateStakeholderResponse(stakeholder.role, currentInput);
          setCurrentSpeaker(stakeholder.name);
          
          setStakeholderResponses(prev => ({
            ...prev,
            [stakeholder.name]: [...(prev[stakeholder.name] || []), response]
          }));

          // Reset speaking animation after delay
          setTimeout(() => {
            setCurrentSpeaker(null);
          }, 2000);
        });

        setCurrentInput("");
        setSelectedStakeholder(null);
      }
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input
    alert("Voice input feature coming soon!");
  };

  // Add effect to simulate speaking animation
  useEffect(() => {
    if (currentSpeaker) {
      setIsSpeaking(true);
      const timer = setTimeout(() => {
        setIsSpeaking(false);
        setCurrentSpeaker(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentSpeaker]);

  // Update handleStakeholderClick to only select the stakeholder without generating a response
  const handleStakeholderClick = (stakeholder: { name: string; role: string }) => {
    if (selectedStakeholder === stakeholder.name) {
      setSelectedStakeholder(null);
    } else {
      setSelectedStakeholder(stakeholder.name);
    }
  };

  // Update renderStakeholderCircle to show selection state
  const renderStakeholderCircle = (stakeholder: { name: string; role: string }, index: number) => {
    const isSpeakingStakeholder = currentSpeaker === stakeholder.name;
    const isSelected = selectedStakeholder === stakeholder.name;
    
    return (
      <div
        key={stakeholder.name}
        className="absolute"
        style={{
          transform: stakeholderPositions[index as keyof typeof stakeholderPositions],
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {isSpeakingStakeholder ? (
          <div className="relative">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold">
              {stakeholder.name}
            </div>
            <div className="w-40 h-40 flex items-center justify-center">
              <div className="flex gap-2">
                <div className="w-4 h-16 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-16 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-4 h-16 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-4 h-16 bg-blue-500 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div 
              className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center 
                       text-center p-4 cursor-pointer transition-all duration-200
                       ${isSelected 
                         ? 'bg-blue-100 border-blue-500 hover:bg-blue-200' 
                         : 'bg-gray-200 border-gray-300 hover:bg-gray-300'}`}
              onClick={() => handleStakeholderClick(stakeholder)}
            >
              <div className="font-semibold text-gray-800 text-lg">{stakeholder.name}</div>
              <div className="text-base text-gray-600">({stakeholder.role})</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-[1fr_400px] gap-8">
        {/* Left side container */}
        <div className="flex flex-col items-center">
          <div className="w-full">
            <h1 className="text-3xl font-bold mb-8">{caseData.title}</h1>
            
            <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
              <p className="text-gray-700 leading-relaxed">
                {caseData.prompt}
              </p>
            </div>
          </div>

          {/* Circle container - adjusted positioning */}
          <div className="relative h-[600px] mb-8 w-full max-w-[1000px]">
            <div className="absolute inset-0 flex items-center justify-center translate-y-20">
              <div className="relative w-full h-[500px]">
                {caseData.stakeholders.map((stakeholder, index) => 
                  renderStakeholderCircle(stakeholder, index)
                )}
              </div>
            </div>
          </div>

          {/* Input area - make it full width */}
          <div className="flex gap-2 w-full">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-4 border rounded-lg mb-8 h-32"
              placeholder={
                selectedStakeholder
                  ? `Ask ${selectedStakeholder} a question...`
                  : "Type your thoughts and press Enter to continue the discussion..."
              }
            />
            <button
              onClick={handleVoiceInput}
              className="h-12 w-12 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right side transcript */}
        <div className="bg-white rounded-lg p-6 shadow-md h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Transcript</h2>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showTranscript ? 'Hide' : 'Show'}
            </button>
          </div>

          {showTranscript && (
            <div className="space-y-4">
              {userInputs.map((input, index) => (
                <div key={index} className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-800">You: {input}</p>
                  </div>
                  {Object.entries(stakeholderResponses).map(([name, responses]) => (
                    responses[index] && (
                      <div 
                        key={name}
                        className="p-3 border-l-4 border-gray-200 hover:border-blue-500 transition-colors"
                      >
                        <p className="text-sm">
                          <span className="font-semibold">
                            {name} ({caseData.stakeholders.find(s => s.name === name)?.role}):
                          </span>{' '}
                          {responses[index]}
                        </p>
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 