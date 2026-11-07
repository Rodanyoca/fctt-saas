import { NextResponse } from "next/server"
import { updateActivity } from "@/lib/activities"
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){try{const{id}=await params,result=await updateActivity(id,await request.json() as Record<string,unknown>);if(Object.keys(result.errors).length)return NextResponse.json({error:"Veuillez corriger les champs indiqués.",fields:result.errors},{status:422});return NextResponse.json({id})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Modification impossible."},{status:503})}}
