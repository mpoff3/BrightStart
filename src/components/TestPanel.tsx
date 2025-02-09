import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function TestPanel() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const testCases = async () => {
    try {
      const response = await fetch('/api/cases');
      const data = await response.json();
      setResults(prev => ({ ...prev, cases: data }));
    } catch (error) {
      setResults(prev => ({ ...prev, cases: 'Error fetching cases' }));
    }
  };

  const testPersona = async () => {
    try {
      // Get existing personas
      const response = await fetch('/api/persona');
      const existingPersonas = await response.json();
      
      setResults(prev => ({ 
        ...prev, 
        persona: existingPersonas
      }));
    } catch (error) {
      setResults(prev => ({ ...prev, persona: 'Error testing persona' }));
    }
  };

  const testTextToSpeech = async () => {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'This is a test message for text to speech.',
        }),
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, tts: data }));
    } catch (error) {
      setResults(prev => ({ ...prev, tts: 'Error testing text-to-speech' }));
    }
  };

  const testSpeechInput = async () => {
    try {
      const response = await fetch('/api/speech-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: 'base64_audio_data_here', // Replace with actual audio data
        }),
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, speechInput: data }));
    } catch (error) {
      setResults(prev => ({ ...prev, speechInput: 'Error testing speech input' }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    await testCases();
    await testPersona();
    await testTextToSpeech();
    await testSpeechInput();
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">API Test Panel</h2>
      
      <div className="space-y-4">
        <Button 
          onClick={runAllTests} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={testCases}>Test Cases API</Button>
          <Button onClick={testPersona}>Test Persona API</Button>
          <Button onClick={testTextToSpeech}>Test TTS API</Button>
          <Button onClick={testSpeechInput}>Test Speech Input API</Button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Results:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-black">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 