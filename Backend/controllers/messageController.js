import fs from "fs";
import imageKit from '../configs/imageKit.js';
import Message from "../Models/Message.js";

//Create an empty object to store server side Event connections
const connections={};

//Controller function for the server side event endpoints
export const sseController=(req,res)=>{
    const {userId} =req.params
    console.log('New Client connected: ',userId)

    //set SSE headers
    res.setHeader('Content-type','text/event-stream');
    res.setHeader('Cache-Control','no-cache');
    res.setHeader('Connection','keep-alive');
    res.setHeader('Access-Control-Allow-Origin','*');

    //Add the clients response object to the connections object 
    connections[userId]=res

    //Send an intial event to the client
    res.write('log:Connected to server side Event stream\n\n')

    //Handle client disconnection
    req.on('close',()=>{
        //Remove the clients response object from the connections array
        delete connections[userId];
        console.log('Client Disconnected') 
    })
}
//Send Message
export const sendMessage=async(req,res)=>{
    try{
        const {userId}=req.auth();
        const {to_user_id,text}=req.body;
        const image=req.file;

        let media_url='';
        let message_type= image ?'image':'text';

        if(message_type==='image')
        {
            const fileBuffer=fs.readFileSync(image.path);
            const response =await imageKit.upload({
                file:fileBuffer,
                fileName:image.originalname,
            });
            media_url=imageKit.url({
                path:response.filePath,
                transformation:[
                    {quality:'auto'},
                    {format:'webp'},
                    {width:'1280'}
                ]
            })
        }
        const message=await Message.create({
            from_user_id:userId,
            to_user_id,
            text,
            message_type,
            media_url
        })
        res.json({success:true,message});
        //send message to to_user_id using SSE
        const messageWithUserData=await Message.findById(message._id).populate('from_user_id');
        if(connections[to_user_id])
        {
            connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
            console.log('✓ Message sent to user via SSE:', to_user_id)
        }
        else
        {
            console.log('⚠ User not connected (offline):', to_user_id)
        }
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})

    }
}
//Get Chat message
export const getChatMessages=async(req,res)=>{
    try{
        const {userId}=req.auth()
        const {to_user_id}=req.body;

        const messages=await Message.find({
            $or:[
                {from_user_id:userId,to_user_id},
                {from_user_id:to_user_id,to_user_id:userId},
            ]
        }).sort({createdAt:-1}).populate('from_user_id')
        //Mark message as seen
        await Message.updateMany({from_user_id:to_user_id,to_user_id:userId},
            {seen:true}
        )

            res.json({success:true,messages});
    }
    catch(error)
    {
        res.json({success:false,message:error.message});
    }
}
export const getUserRecentMessages=async(req,res)=>{
    try{
        const {userId}=req.auth()
        const messages=await Message.find({to_user_id:userId}).populate('from_user_id to_user_id').sort({createdAt:-1});
         res.json({success:true,messages});
    }
    
    catch(error)
    {
           res.json({success:false,message:error.message});
    }
}