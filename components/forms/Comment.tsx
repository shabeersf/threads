"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"
import {
    Form, FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button"
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CommentValidation } from "@/lib/validations/thread";
import { Input } from "../ui/input";
import { addCommentToThread } from "@/lib/actions/thread.actions";
// import { createThread } from "@/lib/actions/thread.actions";


interface Props {
    user: {
        id: string,
        objectId: string,
        username: string,
        name: string,
        bio: string,
        image: string,

    };
    btnTitle: string

}

interface Props {
    threadId: string,
    currentUserImg: string,
    currentUserId: string,
}

const Comment = ({
    threadId,
    currentUserImg,
    currentUserId,

}: Props) => {

    const router = useRouter()
    const pathname = usePathname()

    const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToThread(
      threadId,
      values.thread,
      JSON.parse(currentUserId),
      pathname
    );

    form.reset();
  };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
                <FormField
                    control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-3 w-full">
                            <FormLabel >
                                <Image src={currentUserImg} alt="profile picture" width={48} height={48} className="rounded-full object-cover" />
                            </FormLabel>
                            <FormControl className=" border-none bg-transparent" >
                                <Input placeholder="Comment..." {...field} className="no-focus text-light-1 outline-none" type="text" />
                            </FormControl>


                        </FormItem>
                    )}
                />
                <Button type="submit" className=" comment-form_btn" >Reply</Button>
            </form>
        </Form>
    )
}

export default Comment