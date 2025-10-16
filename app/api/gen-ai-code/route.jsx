import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const {prompt,messages}= await req.json();
    try {
        const Generate= GenAiCode(messages);
        const result= await Generate.sendMessage(prompt);
        const resp=result.response.text();
        return NextResponse.json(JSON.parse(resp));
    } catch (error) {
        return NextResponse.json({error:error});
    }
}