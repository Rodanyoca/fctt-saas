import { NextResponse } from "next/server"
import { saveActivityParticipant } from "@/lib/activities"
async function write(request:Request,params:Promise<{id:string}>,update=false){try{const{id}=await params,body=await request.json();return NextResponse.json({row:await saveActivityParticipant(id,body.row??{},update?String(body.id??""):undefined)})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Enregistrement impossible."},{status:422})}}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){return write(request,params)}
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){return write(request,params,true)}
