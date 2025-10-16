import { v } from "convex/values";
import { mutation, query } from "./_generated/server";



export const CreateUser=mutation({
    args:{
        name: v.string(),
        email: v.string(),
        picture: v.string(),
        uid: v.string()
    },
    handler: async(ctx,args)=>{
        //if user already exists
        const user=await ctx.db.query('users').filter((q)=>q.eq(q.field('email'),args.email)).collect();
        console.log(user);
        //if not create new user
        if(user?.length==0){
            const insertedId=await ctx.db.insert('users',{
                name:args.name,
                picture:args.picture,
                email:args.email,
                uid:args.uid,
                token:10000,
                current_plan:'Free'
            });
            const created = await ctx.db.get(insertedId);
            return created;
        }
        return user[0];
    }
})

export const GetUser= query({
    args:{
        email:v.string()
    },
    handler:async(ctx,args)=>{
        const user=await ctx.db.query('users').filter((q)=>q.eq(q.field('email'),args.email)).collect();
        return user[0];
    }
})


export const UpdateToken=mutation({
    args:{
        token: v.number(),
        current_plan: v.string(),
        userId: v.id('users')
    },
    handler:async(ctx,args)=>{
        const result=await ctx.db.patch(args.userId,{
            token:args.token,
            current_plan:args.current_plan
        });
        return result;
    }
})
