import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = ``;

export async function POST(req: Request) {
  try {
    const { userPrompt } = (await req.json()) as { userPrompt?: string };

    if (!userPrompt) {
      return NextResponse.json({ error: 'userPrompt가 필요합니다.' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]
    });

    const result = completion.choices[0]?.message?.content ?? '';

    return NextResponse.json({ result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'OpenAI API 호출 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
