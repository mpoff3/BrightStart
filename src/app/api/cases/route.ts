import { NextResponse } from 'next/server';

export async function GET() {
  const cases = [
    {
      case_id: 1,
      title: "Healthcare Innovation",
      description: "Explore the implementation of AI diagnostic systems in a major hospital setting.",
      image_url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=800&h=600",
    },
    {
      case_id: 2,
      title: "Energy Transition",
      description: "Navigate the challenges of transitioning from fossil fuels to renewable energy sources.",
      image_url: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800&h=600",
    },
    {
      case_id: 3,
      title: "Organizational Change",
      description: "Lead a major corporation through digital transformation and cultural shift.",
      image_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800&h=600",
    },
    {
      case_id: 4,
      title: "Portfolio Investments",
      description: "Analyze and optimize investment strategies in a volatile market.",
      image_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800&h=600",
    },
    {
      case_id: 5,
      title: "Leadership and Innovation",
      description: "Discover how transformative leaders drive organizational innovation.",
      image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&h=600",
    },
    {
      case_id: 6,
      title: "Design Experience",
      description: "Learn how user-centered design transforms product development.",
      image_url: "https://images.unsplash.com/photo-1576153192396-180ecef2a715?auto=format&fit=crop&q=80&w=800&h=600",
    },
    {
      case_id: 7,
      title: "Learning Styles",
      description: "Explore different approaches to education and knowledge retention.",
      image_url: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=800&h=600",
    },
    {
      case_id: 8,
      title: "Food Truck Start-Up",
      description: "Navigate the challenges of launching a successful food service business.",
      image_url: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80&w=800&h=600",
    }
  ].map(c => ({
    ...c,
    file_name: "",
    file_path: "",
    file_hash: { type: "", data: [] },
    file_size: "",
    is_public: true,
    uploader_id: 1,
    uploaded_at: "",
    updated_at: ""
  }));

  return NextResponse.json(cases);
} 