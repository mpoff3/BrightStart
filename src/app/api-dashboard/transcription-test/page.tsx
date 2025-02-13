"use client";
import { useState } from 'react';

interface CVSummary {
  keyTechnicalStrengths: string[];
  academicExcellence: string[];
  notableProjects: string[];
  professionalImpact: string[];
  interdisciplinarySkills: string[];
  researchPotential: string[];
  conclusion: string;
}

export default function TranscriptionTest() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<CVSummary | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, items: string[]) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-blue-600 mb-2">{title}</h3>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-gray-700">{item}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">CV Analysis Tool</h2>
          
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <button
                type="submit"
                disabled={!file || loading}
                className={`px-4 py-2 rounded-full text-white font-medium
                  ${!file || loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? 'Analyzing...' : 'Analyze CV'}
              </button>
            </div>
          </form>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing CV...</p>
            </div>
          )}

          {summary && !loading && (
            <div className="bg-gray-50 rounded-lg p-6">
              {renderSection('Key Technical Strengths', summary.keyTechnicalStrengths)}
              {renderSection('Academic Excellence', summary.academicExcellence)}
              {renderSection('Notable Projects', summary.notableProjects)}
              {renderSection('Professional Impact', summary.professionalImpact)}
              {renderSection('Interdisciplinary Skills', summary.interdisciplinarySkills)}
              {renderSection('Research & Innovation Potential', summary.researchPotential)}
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Conclusion</h3>
                <p className="text-gray-700 leading-relaxed">{summary.conclusion}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 