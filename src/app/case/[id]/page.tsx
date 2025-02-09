"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from 'next/image';

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
title: "Healthcare Innovation Case Discussion",
prompt: `**Scenario**
Metropolitan General Hospital is considering implementing a state-of-the-art AI diagnostic system across its departments. The system, developed by MedTech Solutions, would analyze patient data, medical imaging, and lab results to assist in diagnosis and treatment planning.

**Results**
• 95% accuracy in early disease detection
• 60% reduction in diagnostic time
• $2M implementation cost
• $300K annual maintenance cost
• Early trials show promising results in detecting subtle patterns that human doctors might miss

**Considerations**
• Staff training requirements and integration with existing electronic health records
• Some staff members concerned about over-reliance on technology and potential job displacement
• Patient privacy and data security implications
• Hospital's liability if the AI makes a mistake
• Integration costs with existing systems
• Impact on doctor-patient relationships

**Key Question**
How should the hospital proceed while balancing innovation, patient care, cost effectiveness, and ethical considerations?`,
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

// Update positions to move everything more to the left
const stakeholderPositions: Record<number, string> = {
0: "translate(-20%, 120%)",
1: "translate(90%, 20%)",
2: "translate(230%, 20%)",
3: "translate(340%, 120%)",
};

type Interaction = {
input: string;
responses: {
stakeholder: string;
role: string;
response: string;
}[];
};

// Then update all avatar components to be even larger (from w-32/h-32 to w-40/h-40)
const AvatarComponents = {
Alice: ({ isSpeaking }: { isSpeaking: boolean }) => (
<div className="relative w-40 h-40">
<Image 
src="/avatars/alice.png" 
alt="Alice"
width={160}
height={160}
className={`rounded-full object-cover w-40 h-40 ${isSpeaking ? 'animate-pulse' : ''}`}
onError={(e) => console.error('Error loading Alice image:', e)}
priority
/>
</div>
),
Bob: ({ isSpeaking }: { isSpeaking: boolean }) => (
<div className="relative w-40 h-40">
<Image 
src="/avatars/bob.png" 
alt="Bob"
width={160}
height={160}
className={`rounded-full object-cover w-40 h-40 ${isSpeaking ? 'animate-pulse' : ''}`}
onError={(e) => console.error('Error loading Bob image:', e)}
priority
/>
</div>
),
Jaya: ({ isSpeaking }: { isSpeaking: boolean }) => (
<div className="relative w-40 h-40">
<Image 
src="/avatars/jaya.png" 
alt="Jaya"
width={160}
height={160}
className={`rounded-full object-cover w-40 h-40 ${isSpeaking ? 'animate-pulse' : ''}`}
style={{ objectPosition: '50% 20%' }}
onError={(e) => console.error('Error loading Jaya image:', e)}
priority
/>
</div>
),
Ron: ({ isSpeaking }: { isSpeaking: boolean }) => (
<div className="relative w-40 h-40">
<Image 
src="/avatars/ron.png" 
alt="Ron"
width={160}
height={160}
className={`rounded-full object-cover w-40 h-40 ${isSpeaking ? 'animate-pulse' : ''}`}
onError={(e) => console.error('Error loading Ron image:', e)}
priority
/>
</div>
)
};

// Add this CSS at the top of your file or in a separate CSS file
const styles = `
@keyframes speak {
0% { d: path('M40 65 Q50 65 60 65'); }
50% { d: path('M40 65 Q50 75 60 65'); }
100% { d: path('M40 65 Q50 65 60 65'); }
}
.mouth.speaking {
animation: speak 0.5s infinite;
}
`;

// Update the stakeholder positions with wider spacing for hidden transcript
const positions = {
visible: {
0: "translate(-20%, 120%)",
1: "translate(90%, 20%)",
2: "translate(230%, 20%)",
3: "translate(340%, 120%)",
},
hidden: {
0: "translate(-20%, 120%)",
1: "translate(90%, 20%)",
2: "translate(230%, 20%)",
3: "translate(340%, 120%)",
}
} as const;

const getStakeholderPosition = (index: 0 | 1 | 2 | 3, showTranscript: boolean) => {
return showTranscript ? positions.visible[index] : positions.hidden[index];
};

// Add this helper function
const formatPromptText = (text: string) => {
  return (
    <div dangerouslySetInnerHTML={{ 
      __html: text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
    }} />
  );
};

// Add professor summary function
const getProfessorSummary = () => {
return {
stakeholder: "Professor",
role: "Case Advisor",
response: `This case examines Metropolitan General Hospital's decision to implement a $2M AI diagnostic system that promises 95% accuracy and 60% faster diagnoses. The key challenge lies in balancing technological advancement with practical considerations including staff training, data security, and maintaining quality patient care. The hospital must carefully weigh the benefits of improved diagnostic capabilities against concerns about over-reliance on technology, job displacement, and ethical implications while ensuring a smooth integration with existing systems.`
};
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
const [interactions, setInteractions] = useState<Interaction[]>([]);
const [showCaseModal, setShowCaseModal] = useState(false);
const [initialLoad, setInitialLoad] = useState(true);
const caseData = caseStudies[caseId as keyof typeof caseStudies];

if (!caseData) return <div>Case not found</div>;

const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
if (currentInput.trim().length > 0) {
// Determine responding stakeholders
const respondingStakeholders = selectedStakeholder 
? [caseData.stakeholders.find(s => s.name === selectedStakeholder)!]
: caseData.stakeholders;

// Generate all responses
const newResponses = respondingStakeholders.map(stakeholder => ({
stakeholder: stakeholder.name,
role: stakeholder.role,
response: generateStakeholderResponse(stakeholder.role, currentInput)
}));

// Add new interaction
setInteractions(prev => [...prev, {
input: currentInput,
responses: newResponses
}]);

// Show speaking animation for responses with longer duration
respondingStakeholders.forEach((stakeholder, index) => {
setTimeout(() => {
setCurrentSpeaker(stakeholder.name);
setTimeout(() => {
setCurrentSpeaker(null);
}, 5000); // Changed from 2000 to 5000 for 5 seconds
}, index * 1000); // Increased from 500 to 1000 to space out responses more
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
}, 5000); // Changed from 2000 to 5000 for 5 seconds
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

// Update renderStakeholder function with better spacing
const renderStakeholder = (stakeholder: { name: string; role: string }, index: number) => {
const isSpeakingStakeholder = currentSpeaker === stakeholder.name;
const isSelected = selectedStakeholder === stakeholder.name;
const AvatarComponent = AvatarComponents[stakeholder.name as keyof typeof AvatarComponents];
return (
<div
key={stakeholder.name}
className="absolute"
style={{
transform: getStakeholderPosition(index as 0 | 1 | 2 | 3, showTranscript),
transition: 'transform 0.3s ease-in-out'
}}
>
<div className="relative group">
{/* Role label above - made bigger */}
<div className="absolute -top-12 left-1/2 transform -translate-x-1/2 
text-base font-semibold text-gray-700 
bg-white px-4 py-2 rounded-full shadow-md whitespace-nowrap">
{stakeholder.role}
</div>
{/* Avatar container - updated sizing */}
<div 
className={`w-40 h-40 flex flex-col items-center justify-center cursor-pointer
transition-all duration-200 relative ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
onClick={() => handleStakeholderClick(stakeholder)}
>
{/* Add animated blue ring when speaking */}
{isSpeakingStakeholder && (
<div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse" />
)}
<AvatarComponent isSpeaking={isSpeakingStakeholder} />
</div>

{/* Name label below - increased spacing */}
<div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-base font-semibold text-gray-800 whitespace-nowrap">
{stakeholder.name}
</div>
</div>
</div>
);
};

// Add useEffect to show case modal on initial load
useEffect(() => {
if (initialLoad) {
setShowCaseModal(true);
setInitialLoad(false);
}
}, [initialLoad]);

return (
<div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
<style>{styles}</style>
{/* Hero section with blue gradient text - centered with respect to input box */}
<div className="w-full h-[30vh] flex flex-col items-center justify-center text-center px-8 mb-8">
  <div className="max-w-4xl mx-auto"> {/* Match width with input box max-w-4xl */}
    <h1 className="text-5xl font-light tracking-tight mb-4 bg-clip-text text-transparent 
                   bg-gradient-to-r from-[#4285f4] via-[#1a73e8] to-[#0d47a1]
                   text-center">
      Healthcare Innovation
    </h1>
    <div className="text-3xl font-light bg-clip-text text-transparent 
                    bg-gradient-to-r from-[#1a73e8] via-[#1557b0] to-[#4285f4]
                    text-center">
      AI-Powered Diagnostics
    </div>
  </div>
</div>

{/* Main content with Google Material styling */}
<div className="max-w-7xl mx-auto px-8 relative">
{/* Stakeholder visualization */}
<div className={`relative h-[500px] mb-12 w-full transition-all duration-300 ease-in-out ${
showTranscript ? '' : 'flex justify-center'
}`}>
<div className="absolute inset-0 flex items-center justify-center">
<div className={`relative transition-all duration-300 ${
showTranscript ? 'w-full' : 'w-[800px]'
} h-[500px]`}>
{caseData.stakeholders.map((stakeholder, index) => 
renderStakeholder(stakeholder, index)
)}
</div>
</div>
</div>

{/* Google-style action buttons */}
<div className="flex justify-between mb-6">
<button 
onClick={() => setShowCaseModal(true)}
className="px-6 py-2 bg-[#1a73e8] text-white rounded-md hover:bg-[#1557b0] 
transition-colors duration-200 text-sm font-medium shadow-sm
focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2"
>
View Case
</button>

<button 
onClick={() => setShowTranscript(!showTranscript)}
className="px-6 py-2 bg-[#1a73e8] text-white rounded-md hover:bg-[#1557b0] 
transition-colors duration-200 text-sm font-medium shadow-sm
focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2"
>
{showTranscript ? 'Hide' : 'View'} Transcript
</button>
</div>

{/* Google-style modal */}
{showCaseModal && (
<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-8">
<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
<div className="p-8">
<h2 className="text-[28px] font-normal text-[#202124] mb-6">{caseData.title}</h2>
<div className="text-[#202124] leading-relaxed space-y-2 prose prose-lg max-w-none">
{formatPromptText(caseData.prompt)}
</div>
{/* Google-style modal footer */}
<div className="flex justify-between items-center mt-8 pt-6 border-t border-[#dadce0]">
<button
onClick={() => {
setShowCaseModal(false);
setInteractions(prev => [...prev, {
input: "I need a summary of the case",
responses: [getProfessorSummary()]
}]);
setShowTranscript(true);
}}
className="px-6 py-2 text-[#1a73e8] hover:bg-[#f6fafe] rounded-md
transition-colors duration-200 text-sm font-medium
focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2"
>
I Need a Summary of the Case
</button>
<button
onClick={() => setShowCaseModal(false)}
className="px-6 py-2 bg-[#1a73e8] text-white rounded-md hover:bg-[#1557b0] 
transition-colors duration-200 text-sm font-medium shadow-sm
focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2"
>
I'm Ready to Enter the Classroom
</button>
</div>
</div>
</div>
</div>
)}

{/* Google-style transcript panel */}
<div className={`absolute top-0 right-0 transition-all duration-300 ease-in-out transform ${
showTranscript 
? 'translate-x-0 opacity-100 w-[450px]' 
: 'translate-x-full opacity-0 w-0'
}`}>
<div className="bg-white rounded-lg shadow-md border border-[#dadce0]">
<div className="p-6 h-[500px] overflow-y-auto">
<h2 className="text-[22px] font-normal text-[#202124] mb-6">Transcript</h2>
{showTranscript && (
<div className="space-y-6">
{interactions.map((interaction, index) => (
<div key={index} className="space-y-3">
<div className="bg-[#f8f9fa] p-4 rounded-lg">
<p className="text-[#202124]">
<span className="font-medium">You:</span> {interaction.input}
</p>
</div>
<div className="space-y-3">
{interaction.responses.map((response, rIndex) => (
<div 
key={rIndex}
className="p-4 border-l-4 border-[#1a73e8] bg-white rounded-r-lg
shadow-sm hover:shadow transition-shadow duration-200"
>
<p className="text-[#202124]">
<span className="font-medium">
{response.stakeholder} ({response.role}):
</span>{' '}
{response.response}
</p>
</div>
))}
</div>
</div>
))}
</div>
)}
</div>
</div>
</div>

{/* Google-style input area */}
<div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-8 flex gap-4">
<textarea
value={currentInput}
onChange={(e) => setCurrentInput(e.target.value)}
onKeyPress={handleKeyPress}
className="flex-1 p-4 rounded-lg text-[#202124] border border-[#dadce0] 
shadow-sm hover:shadow focus:border-[#1a73e8] focus:shadow-none
focus:outline-none transition-all duration-200 text-base h-24
resize-none"
placeholder={
selectedStakeholder
? `Ask ${selectedStakeholder} a question...`
: "Type your thoughts and press Enter to continue the discussion..."
}
/>
<button
onClick={handleVoiceInput}
className="h-12 w-12 flex items-center justify-center bg-[#1a73e8] text-white 
rounded-full hover:bg-[#1557b0] transition-colors duration-200 shadow-sm
focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:ring-offset-2"
>
<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
</svg>
</button>
</div>
</div>
</div>
);
} 