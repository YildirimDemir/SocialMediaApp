import { IUser } from "@/models/userModel";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth"{
    interface Session {
        user: IUser & DefaultSession["user"];
    }

    interface User extends IUser, DefaultUser {}
}