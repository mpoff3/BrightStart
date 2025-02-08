"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const cases = [
    "Case 1", "Case 2", "Case 3", "Case 4",
    "Case 5", "Case 6", "Case 7", "Generate Case"
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Personai
      </h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-4 gap-6">
        {cases.map((caseTitle, index) => (
          <button
            key={index}
            onClick={() => router.push(`/case/${index + 1}`)}
            className={`
              p-6 rounded-lg shadow-md
              ${index === 7 ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}
              hover:shadow-lg transition-all duration-200
              text-lg font-semibold
              min-h-[100px] flex items-center justify-center
            `}
          >
            {caseTitle}
          </button>
        ))}
      </div>
    </div>
  );
}
