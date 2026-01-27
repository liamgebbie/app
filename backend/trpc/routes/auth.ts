import AsyncStorage from "@react-native-async-storage/async-storage";
import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

const USERS_KEY = "users_db";

interface User {
  id: string;
  email: string;
  password: string;
  dateOfBirth: string;
  createdAt: number;
}

const getUsers = async (): Promise<User[]> => {
  try {
    const users = await AsyncStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveUsers = async (users: User[]) => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        dateOfBirth: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const users = await getUsers();
      
      const existingUser = users.find((u) => u.email === input.email);
      if (existingUser) {
        throw new Error("Email already registered");
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: input.email,
        password: input.password,
        dateOfBirth: input.dateOfBirth,
        createdAt: Date.now(),
      };

      users.push(newUser);
      await saveUsers(users);

      return {
        id: newUser.id,
        email: newUser.email,
        dateOfBirth: newUser.dateOfBirth,
        token: `token_${newUser.id}`,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const users = await getUsers();
      
      const user = users.find(
        (u) => u.email === input.email && u.password === input.password
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      return {
        id: user.id,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        token: `token_${user.id}`,
      };
    }),
});
