import { NextResponse } from 'next/server';

const STATIC_ANALYSIS = {

  human_participant: {
    name: "Jordan", 
    background: "Research Scientist at DeepMind with experience in AI/ML products",
    expertise: "Research in AI/ML products",
    personality: "Technical and Strategic thinker with customer focus",
    is_human: "True",
    role: "Research Scientist"
  },
  summary: {
    keyTechnicalStrengths: [
      "Strong foundation in Machine Learning and AI through MIT and TU Berlin coursework",
      "Practical experience with modern ML frameworks (TensorFlow, scikit-learn)",
      "Proficiency in multiple programming languages (Python, R, Julia, SQL)",
      "Hands-on experience with optimization and deep learning projects"
    ],
    academicExcellence: [
      "MIT Sloan School of Management - Master of Business Analytics (Current GPA: 5.0/5.0)",
      "TU Berlin - BSc Industrial Engineering (Top 3%, GPA: 4.0)",
      "Supplementary education in Deep Learning through Deeplearning.AI"
    ],
    notableProjects: [
      "Developed fraud detection model at STARR Insurance that reduced search pool by 15x while maintaining 80% recall",
      "Created multi-modal ML model for startup success prediction",
      "Implemented quantile regression with LightGBM for NYC taxi demand optimization",
      "Conducted thesis research on stock return analysis using multi-factor regression"
    ],
    professionalImpact: [
      "Successfully founded and operated R&N GbR, achieving 40% operational throughput increase",
      "At N26 (€9B+ fintech), implemented dynamic referral scheme leading to 42% revenue increase",
      "Led price elasticity analysis at Gorillas (€3B startup) improving promo ROI by 20%"
    ],
    interdisciplinarySkills: [
      "Strong project management capabilities demonstrated across various roles",
      "Experience in stakeholder management and team leadership",
      "Multilingual: German (native), English (fluent), Russian (fluent), Hebrew (basic)"
    ],
    researchPotential: [
      "Demonstrated ability to apply ML/AI in practical business contexts",
      "Experience with large-scale data processing (80M records, 500 features)",
      "Active involvement in AI & ML Club at MIT shows commitment to field advancement"
    ],
    conclusion: "From a research scientist's perspective, Daniel shows strong potential for AI/ML research and application, combining technical expertise with practical business acumen. His experience spans both theoretical and applied aspects of machine learning, making him well-suited for research roles requiring business impact understanding."
  }
};

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: Request) {
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return response with CORS headers
    return new NextResponse(JSON.stringify(STATIC_ANALYSIS), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },

    });
  } catch (error) {
    console.error('Error processing CV:', error);
    
    // Return error response with CORS headers
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to process CV',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
} 